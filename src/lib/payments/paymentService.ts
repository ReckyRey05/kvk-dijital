import { getAdminDb } from "@/lib/firebase/admin";
import {
  TeklifimPayment,
  TeklifimPaymentStatus,
  TeklifimOrder,
  TeklifimInvoice,
  TeklifimRefundItem,
  TeklifimSupplierPayoutSummary,
} from "@/types/teklifimGelsin";
import {
  PaymentProvider,
  MarketplacePaymentProvider,
  RefundProvider,
  PayoutProvider,
  WebhookPayload,
} from "./types";
import { MockMarketplacePaymentProvider } from "./providers/mockProvider";
import { IyzicoMarketplaceProvider } from "./providers/iyzicoMarketplaceProvider";
import { calculateMarketplaceCommission } from "./commissionService";

function getDb() {
  return getAdminDb();
}

/**
 * Returns active marketplace payment provider
 */
export function getActivePaymentProvider(providerName?: string): MarketplacePaymentProvider & RefundProvider & PayoutProvider {
  const chosen = providerName || process.env.PAYMENT_PROVIDER || "mock_provider";
  if (chosen === "iyzico_marketplace") {
    return new IyzicoMarketplaceProvider();
  }
  return new MockMarketplacePaymentProvider();
}

/**
 * Generates human-readable, collision-safe payment number (ODE-2026-XXXXXX)
 */
export async function generateUniquePaymentNumber(): Promise<string> {
  const db = getDb();
  const year = "2026";
  const prefix = `ODE-${year}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const candidate = `${prefix}${randomNum}`;

    const existing = await db
      .collection("teklifim_payments")
      .where("paymentNumber", "==", candidate)
      .limit(1)
      .get();

    if (existing.empty) {
      return candidate;
    }
  }

  // Fallback sequential
  const countSnap = await db.collection("teklifim_payments").count().get();
  const seq = (countSnap.data().count + 1).toString().padStart(6, "0");
  return `${prefix}${seq}`;
}

/**
 * Create Idempotent Payment Session for an Order
 */
export async function createOrderPaymentSession(
  orderId: string,
  requestingUserId: string,
  idempotencyKey: string,
  options?: {
    callbackUrl?: string;
    providerName?: string;
  }
): Promise<{ payment: TeklifimPayment; checkoutUrl: string; providerPaymentId: string }> {
  const db = getDb();
  const orderDoc = await db.collection("teklifim_orders").doc(orderId).get();
  if (!orderDoc.exists) throw new Error("Sipariş bulunamadı.");

  const order = orderDoc.data() as TeklifimOrder;

  // Authorization: Only the buyer business or admin can initiate payment
  if (requestingUserId !== order.businessId && requestingUserId !== "admin_user") {
    throw new Error("Bu sipariş için ödeme başlatma yetkiniz bulunmamaktadır.");
  }

  if (order.status === "cancelled" || order.paymentStatus === "paid") {
    throw new Error("Bu sipariş için yeni ödeme oturumu açılamaz.");
  }

  // Idempotency: Check if an active payment session already exists with this idempotencyKey
  const existingByKey = await db
    .collection("teklifim_payments")
    .where("idempotencyKey", "==", idempotencyKey)
    .limit(1)
    .get();

  if (!existingByKey.empty) {
    const existing = existingByKey.docs[0].data() as TeklifimPayment;
    return {
      payment: existing,
      checkoutUrl: `/teklifim-gelsin/checkout/${order.id}?session=${existing.providerPaymentId}`,
      providerPaymentId: existing.providerPaymentId || "",
    };
  }

  // Check if an unexpired pending payment already exists for this order
  const existingPending = await db
    .collection("teklifim_payments")
    .where("orderId", "==", orderId)
    .where("status", "==", "pending")
    .limit(1)
    .get();

  if (!existingPending.empty) {
    const pendingPayment = existingPending.docs[0].data() as TeklifimPayment;
    if (pendingPayment.expiresAt > Date.now()) {
      return {
        payment: pendingPayment,
        checkoutUrl: `/teklifim-gelsin/checkout/${order.id}?session=${pendingPayment.providerPaymentId}`,
        providerPaymentId: pendingPayment.providerPaymentId || "",
      };
    }
  }

  // Calculate dynamic commission
  const commission = calculateMarketplaceCommission(order);
  const paymentNumber = await generateUniquePaymentNumber();
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours
  const provider = getActivePaymentProvider(options?.providerName);

  const sessionResult = await provider.createPaymentSession({
    order,
    paymentNumber,
    amount: commission.orderTotal,
    currency: commission.currency,
    buyer: {
      id: order.businessId,
      name: order.deliveryAddress?.contactName || order.businessName,
      email: order.businessEmail || "alici@ornek.com",
      phone: order.deliveryAddress?.phone || order.businessPhone || "05550000000",
      address: order.deliveryAddress?.addressLine || "Adres",
      city: order.deliveryAddress?.city || "Istanbul",
    },
    supplier: {
      id: order.supplierId,
      name: order.supplierName,
    },
    platformFee: commission.platformFee,
    supplierAmount: commission.supplierAmount,
    callbackUrl: options?.callbackUrl || `/teklifim-gelsin/checkout/${order.id}/callback`,
    idempotencyKey,
  });

  const paymentId = `pay_${order.id}`;
  const newPayment: TeklifimPayment = {
    id: paymentId,
    paymentNumber,
    orderId: order.id,
    orderNumber: order.orderNumber,
    agreementId: order.agreementId,
    agreementNumber: order.agreementNumber,
    businessId: order.businessId,
    businessName: order.businessName,
    supplierId: order.supplierId,
    supplierName: order.supplierName,
    amount: commission.orderTotal,
    currency: commission.currency,
    platformFeeRate: commission.feeRate,
    platformFee: commission.platformFee,
    supplierAmount: commission.supplierAmount,
    status: "pending",
    statusHistory: [
      {
        status: "pending",
        changedBy: requestingUserId,
        timestamp: now,
        note: `Ödeme oturumu oluşturuldu (${paymentNumber})`,
      },
    ],
    provider: provider.name,
    providerPaymentId: sessionResult.providerPaymentId,
    providerPaymentToken: sessionResult.providerPaymentToken,
    idempotencyKey,
    expiresAt,
    createdAt: now,
    updatedAt: now,
    payoutStatus: "pending_delivery",
  };

  const batch = db.batch();
  batch.set(db.collection("teklifim_payments").doc(paymentId), newPayment);
  batch.update(orderDoc.ref, {
    paymentId,
    paymentNumber,
    paymentStatus: "pending",
    paymentExpiresAt: expiresAt,
    platformFeeRate: commission.feeRate,
    platformFee: commission.platformFee,
    supplierAmount: commission.supplierAmount,
    updatedAt: now,
  });

  await batch.commit();

  return {
    payment: newPayment,
    checkoutUrl: sessionResult.paymentPageUrl || `/teklifim-gelsin/checkout/${order.id}`,
    providerPaymentId: sessionResult.providerPaymentId,
  };
}

/**
 * Server-side payment verification & state progression
 */
export async function verifyAndProcessPayment(
  paymentId: string,
  requestingUserId: string,
  verificationPayload?: any
): Promise<TeklifimPayment> {
  const db = getDb();
  const payDoc = await db.collection("teklifim_payments").doc(paymentId).get();
  if (!payDoc.exists) throw new Error("Ödeme kaydı bulunamadı.");

  const payment = payDoc.data() as TeklifimPayment;

  // Authorization check
  if (
    requestingUserId !== payment.businessId &&
    requestingUserId !== payment.supplierId &&
    requestingUserId !== "admin_user"
  ) {
    throw new Error("Bu ödemeyi sorgulama yetkiniz bulunmamaktadır.");
  }

  // Terminal state check
  if (payment.status === "paid") {
    return payment;
  }

  const provider = getActivePaymentProvider(payment.provider);
  const verifyResult = await provider.verifyPayment({
    providerPaymentId: payment.providerPaymentId || "",
    providerToken: payment.providerPaymentToken,
    rawPayload: verificationPayload,
  });

  const now = Date.now();
  const batch = db.batch();
  const orderRef = db.collection("teklifim_orders").doc(payment.orderId);

  if (verifyResult.success) {
    payment.status = "paid";
    payment.paidAt = verifyResult.paidAt || now;
    payment.paymentMethod = verifyResult.paymentMethod || "credit_card";
    payment.cardLastFour = verifyResult.cardLastFour;
    payment.cardBrand = verifyResult.cardBrand;
    payment.updatedAt = now;
    payment.statusHistory.push({
      status: "paid",
      changedBy: requestingUserId,
      timestamp: now,
      note: "Ödeme sağlayıcı tarafından onaylandı ve tahsil edildi.",
    });

    batch.set(payDoc.ref, payment);
    batch.update(orderRef, {
      paymentStatus: "paid",
      paidAt: now,
      paymentMethod: payment.paymentMethod,
      updatedAt: now,
    });

    // Notify Business & Supplier
    await db.collection("teklifim_notifications").add({
      userId: payment.businessId,
      title: "Ödemeniz Başarıyla Alındı",
      message: `${payment.paymentNumber} numaralı ödemeniz güvenli hesapta tutuluyor. Siparişiniz hazırlanıyor.`,
      link: `/teklifim-gelsin/orders/${payment.orderId}`,
      isRead: false,
      createdAt: now,
    });

    await db.collection("teklifim_notifications").add({
      userId: payment.supplierId,
      title: "Sipariş Ödemesi Alındı",
      message: `${payment.orderNumber} numaralı siparişin ödemesi yapıldı. Hakedişiniz ${payment.supplierAmount.toLocaleString("tr-TR")} TL olarak kayda geçti.`,
      link: `/teklifim-gelsin/orders/${payment.orderId}`,
      isRead: false,
      createdAt: now,
    });
  } else {
    payment.status = "failed";
    payment.failedAt = now;
    payment.failureReason = verifyResult.errorMessage || "Ödeme işlemi banka tarafından reddedildi.";
    payment.updatedAt = now;
    payment.statusHistory.push({
      status: "failed",
      changedBy: requestingUserId,
      timestamp: now,
      note: `Ödeme başarısız: ${payment.failureReason}`,
    });

    batch.set(payDoc.ref, payment);
    batch.update(orderRef, {
      paymentStatus: "failed",
      updatedAt: now,
    });

    await db.collection("teklifim_notifications").add({
      userId: payment.businessId,
      title: "Ödeme Başarısız Oldu",
      message: `${payment.paymentNumber} numaralı ödeme tamamlanamadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyiniz.`,
      link: `/teklifim-gelsin/checkout/${payment.orderId}`,
      isRead: false,
      createdAt: now,
    });
  }

  await batch.commit();
  return payment;
}

/**
 * Handles incoming webhook from licensed payment provider with HMAC verification and idempotency
 */
export async function handlePaymentWebhook(payload: WebhookPayload): Promise<{ processed: boolean; message: string }> {
  const db = getDb();
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "kvk-webhook-secret-2026";
  const provider = getActivePaymentProvider();

  const verification = await provider.verifyWebhook(payload, webhookSecret);
  if (!verification.isValid) {
    throw new Error(`Webhook imza doğrulaması başarısız: ${verification.errorMessage}`);
  }

  const { eventId, eventType, providerPaymentId } = verification;

  // Webhook Idempotency check: Ensure the exact eventId is never processed twice
  const eventDocRef = db.collection("teklifim_webhook_events").doc(eventId);
  const eventDoc = await eventDocRef.get();
  if (eventDoc.exists) {
    return { processed: false, message: "Bu webhook olayı daha önce işlendi (idempotent skip)." };
  }

  // Find payment by providerPaymentId
  const payQuery = await db
    .collection("teklifim_payments")
    .where("providerPaymentId", "==", providerPaymentId)
    .limit(1)
    .get();

  if (payQuery.empty) {
    // Record event to prevent replay
    await eventDocRef.set({
      eventId,
      eventType,
      providerPaymentId,
      processedAt: Date.now(),
      status: "orphan_payment",
    });
    return { processed: false, message: "İlişkili ödeme kaydı bulunamadı." };
  }

  const paymentDoc = payQuery.docs[0];
  const payment = paymentDoc.data() as TeklifimPayment;
  const now = Date.now();

  const batch = db.batch();
  batch.set(eventDocRef, {
    eventId,
    eventType,
    providerPaymentId,
    paymentId: payment.id,
    processedAt: now,
    status: "processed",
  });

  if (eventType === "payment.succeeded" && payment.status !== "paid") {
    payment.status = "paid";
    payment.paidAt = now;
    payment.updatedAt = now;
    payment.statusHistory.push({
      status: "paid",
      changedBy: "webhook_system",
      timestamp: now,
      note: `Webhook onayı alındı (${eventId})`,
    });

    batch.set(paymentDoc.ref, payment);
    batch.update(db.collection("teklifim_orders").doc(payment.orderId), {
      paymentStatus: "paid",
      paidAt: now,
      updatedAt: now,
    });
  } else if (eventType === "payment.failed" && payment.status === "pending") {
    payment.status = "failed";
    payment.failedAt = now;
    payment.failureReason = payload.parsedBody?.errorMessage || "Webhook: Ödeme başarısız bildirildi.";
    payment.updatedAt = now;
    payment.statusHistory.push({
      status: "failed",
      changedBy: "webhook_system",
      timestamp: now,
      note: `Webhook başarısız bildirimi (${eventId})`,
    });

    batch.set(paymentDoc.ref, payment);
    batch.update(db.collection("teklifim_orders").doc(payment.orderId), {
      paymentStatus: "failed",
      updatedAt: now,
    });
  }

  await batch.commit();
  return { processed: true, message: `Webhook ${eventType} başarıyla işlendi.` };
}

/**
 * Process Full or Partial Refund
 */
export async function processOrderRefund(
  orderId: string,
  requestingUserId: string,
  amount: number,
  reason: string
): Promise<{ payment: TeklifimPayment; refundItem: TeklifimRefundItem }> {
  const db = getDb();
  const payQuery = await db
    .collection("teklifim_payments")
    .where("orderId", "==", orderId)
    .limit(1)
    .get();

  if (payQuery.empty) throw new Error("Bu siparişe ait ödeme kaydı bulunamadı.");

  const paymentDoc = payQuery.docs[0];
  const payment = paymentDoc.data() as TeklifimPayment;

  // Authorization: Only buyer or admin can request/process refund
  if (requestingUserId !== payment.businessId && requestingUserId !== "admin_user") {
    throw new Error("İade işlemi yapma yetkiniz bulunmamaktadır.");
  }

  if (payment.status !== "paid" && payment.status !== "partially_refunded") {
    throw new Error("Yalnızca ödenmiş veya kısmi iade durumundaki siparişler için iade işlemi yapılabilir.");
  }

  const currentRefunded = payment.refundedAmount || 0;
  const remainingRefundable = Math.round((payment.amount - currentRefunded) * 100) / 100;

  if (amount <= 0) throw new Error("Geçerli bir iade tutarı giriniz.");
  if (amount > remainingRefundable) {
    throw new Error(`İade edilebilecek maksimum tutar ${remainingRefundable} TL'dir.`);
  }

  const provider = getActivePaymentProvider(payment.provider);
  const refundResult = await provider.processRefund({
    payment,
    amount,
    reason,
    requestedBy: requestingUserId,
  });

  if (!refundResult.success) {
    throw new Error(`İade sağlayıcı tarafından onaylanmadı: ${refundResult.errorMessage}`);
  }

  const now = Date.now();
  const refundId = `ref_${Date.now()}`;
  const refundItem: TeklifimRefundItem = {
    refundId,
    amount,
    reason,
    refundedAt: now,
    refundedBy: requestingUserId,
    providerRefundId: refundResult.providerRefundId,
    status: "success",
  };

  const newTotalRefunded = Math.round((currentRefunded + amount) * 100) / 100;
  const isFullRefund = newTotalRefunded >= payment.amount;
  const nextStatus: TeklifimPaymentStatus = isFullRefund ? "refunded" : "partially_refunded";

  payment.refundedAmount = newTotalRefunded;
  payment.refunds = [...(payment.refunds || []), refundItem];
  payment.status = nextStatus;
  payment.updatedAt = now;
  payment.statusHistory.push({
    status: nextStatus,
    changedBy: requestingUserId,
    timestamp: now,
    note: `${amount} TL tutarında ${isFullRefund ? "tam" : "kısmi"} iade yapıldı: ${reason}`,
  });

  const batch = db.batch();
  batch.set(paymentDoc.ref, payment);
  batch.update(db.collection("teklifim_orders").doc(payment.orderId), {
    paymentStatus: nextStatus,
    updatedAt: now,
  });

  // Notify Business & Supplier
  await db.collection("teklifim_notifications").add({
    userId: payment.businessId,
    title: "İade İşleminiz Başlatıldı",
    message: `${payment.paymentNumber} numaralı ödemeniz için ${amount.toLocaleString("tr-TR")} TL tutarında iade hesabınıza aktarılmak üzere işleme alındı.`,
    link: `/teklifim-gelsin/orders/${payment.orderId}`,
    isRead: false,
    createdAt: now,
  });

  await db.collection("teklifim_notifications").add({
    userId: payment.supplierId,
    title: "Sipariş İadesi Yapıldı",
    message: `${payment.orderNumber} numaralı siparişte ${amount.toLocaleString("tr-TR")} TL tutarında iade gerçekleşti.`,
    link: `/teklifim-gelsin/orders/${payment.orderId}`,
    isRead: false,
    createdAt: now,
  });

  await batch.commit();
  return { payment, refundItem };
}

/**
 * Supplier Finance Summary computed strictly from genuine transaction records
 */
export async function getSupplierFinanceOverview(supplierId: string): Promise<TeklifimSupplierPayoutSummary> {
  const db = getDb();
  const paymentsSnap = await db
    .collection("teklifim_payments")
    .where("supplierId", "==", supplierId)
    .get();

  let totalSalesVolume = 0;
  let totalCommissionPaid = 0;
  let totalRefundedVolume = 0;
  let netPayoutEarned = 0;
  let pendingPayout = 0;
  let completedPayout = 0;
  let transactionsCount = 0;

  for (const doc of paymentsSnap.docs) {
    const p = doc.data() as TeklifimPayment;
    if (p.status === "paid" || p.status === "partially_refunded" || p.status === "refunded") {
      transactionsCount++;
      totalSalesVolume += p.amount || 0;
      totalCommissionPaid += p.platformFee || 0;
      totalRefundedVolume += p.refundedAmount || 0;

      const netForThis = (p.supplierAmount || 0) - (p.refundedAmount || 0);
      netPayoutEarned += Math.max(0, netForThis);

      if (p.payoutStatus === "payout_completed") {
        completedPayout += Math.max(0, netForThis);
      } else {
        pendingPayout += Math.max(0, netForThis);
      }
    }
  }

  return {
    supplierId,
    totalSalesVolume: Math.round(totalSalesVolume * 100) / 100,
    totalCommissionPaid: Math.round(totalCommissionPaid * 100) / 100,
    totalRefundedVolume: Math.round(totalRefundedVolume * 100) / 100,
    netPayoutEarned: Math.round(netPayoutEarned * 100) / 100,
    pendingPayout: Math.round(pendingPayout * 100) / 100,
    completedPayout: Math.round(completedPayout * 100) / 100,
    transactionsCount,
  };
}

/**
 * Admin Finance & Commission Overview
 */
export async function getAdminFinanceOverview(): Promise<{
  gmv: number;
  platformRevenue: number;
  totalRefunds: number;
  pendingPayouts: number;
  completedPayouts: number;
  failedCount: number;
  totalTransactions: number;
}> {
  const db = getDb();
  const paymentsSnap = await db.collection("teklifim_payments").get();

  let gmv = 0;
  let platformRevenue = 0;
  let totalRefunds = 0;
  let pendingPayouts = 0;
  let completedPayouts = 0;
  let failedCount = 0;
  let totalTransactions = 0;

  for (const doc of paymentsSnap.docs) {
    const p = doc.data() as TeklifimPayment;
    if (p.status === "failed") {
      failedCount++;
    } else if (p.status === "paid" || p.status === "partially_refunded" || p.status === "refunded") {
      totalTransactions++;
      gmv += p.amount || 0;
      platformRevenue += p.platformFee || 0;
      totalRefunds += p.refundedAmount || 0;

      const netSupplier = (p.supplierAmount || 0) - (p.refundedAmount || 0);
      if (p.payoutStatus === "payout_completed") {
        completedPayouts += Math.max(0, netSupplier);
      } else {
        pendingPayouts += Math.max(0, netSupplier);
      }
    }
  }

  return {
    gmv: Math.round(gmv * 100) / 100,
    platformRevenue: Math.round(platformRevenue * 100) / 100,
    totalRefunds: Math.round(totalRefunds * 100) / 100,
    pendingPayouts: Math.round(pendingPayouts * 100) / 100,
    completedPayouts: Math.round(completedPayouts * 100) / 100,
    failedCount,
    totalTransactions,
  };
}

/**
 * Save Commercial Invoice metadata (Supplier -> Business)
 */
export async function saveCommercialInvoice(
  orderId: string,
  supplierUserId: string,
  invoiceData: {
    invoiceNumber: string;
    amount: number;
    currency: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    notes?: string;
  }
): Promise<TeklifimInvoice> {
  const db = getDb();
  const orderDoc = await db.collection("teklifim_orders").doc(orderId).get();
  if (!orderDoc.exists) throw new Error("Sipariş bulunamadı.");

  const order = orderDoc.data() as TeklifimOrder;
  if (supplierUserId !== order.supplierId && supplierUserId !== "admin_user") {
    throw new Error("Yalnızca satıcı tedarikçi ticari mal faturası yükleyebilir.");
  }

  // Validate allowed MIME types (PDF, XML)
  const allowedMimes = ["application/pdf", "application/xml", "text/xml"];
  if (!allowedMimes.includes(invoiceData.mimeType.toLowerCase())) {
    throw new Error("Yalnızca PDF veya XML formatındaki resmi e-fatura belgeleri kabul edilmektedir.");
  }

  // Max 10MB limit
  if (invoiceData.fileSize > 10 * 1024 * 1024) {
    throw new Error("Fatura dosyası boyutu maksimum 10MB olabilir.");
  }

  const now = Date.now();
  const invoiceId = `inv_${orderId}_supplier`;
  const invoice: TeklifimInvoice = {
    id: invoiceId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    businessId: order.businessId,
    businessName: order.businessName,
    supplierId: order.supplierId,
    supplierName: order.supplierName,
    invoiceType: "commercial_supplier",
    invoiceNumber: invoiceData.invoiceNumber,
    amount: invoiceData.amount,
    currency: invoiceData.currency || "TRY",
    fileUrl: invoiceData.fileUrl,
    fileName: invoiceData.fileName,
    fileSize: invoiceData.fileSize,
    mimeType: invoiceData.mimeType,
    status: "invoice_uploaded",
    uploadedAt: now,
    uploadedBy: supplierUserId,
    notes: invoiceData.notes,
  };

  const batch = db.batch();
  batch.set(db.collection("teklifim_invoices").doc(invoiceId), invoice);
  batch.update(orderDoc.ref, {
    invoiceStatus: "invoice_uploaded",
    invoiceUrl: invoiceData.fileUrl,
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceUploadedAt: now,
    updatedAt: now,
  });

  // Notify business
  await db.collection("teklifim_notifications").add({
    userId: order.businessId,
    title: "Sipariş Faturanız Yüklendi",
    message: `${order.orderNumber} siparişiniz için resmi satış faturası (${invoiceData.invoiceNumber}) yüklendi. İnceleyebilirsiniz.`,
    link: `/teklifim-gelsin/orders/${order.id}`,
    isRead: false,
    createdAt: now,
  });

  await batch.commit();
  return invoice;
}

/**
 * Export finance records to clean CSV string
 */
export function exportFinanceRecordsToCsv(records: TeklifimPayment[]): string {
  const headers = [
    "Odeme No",
    "Siparis No",
    "Tarih",
    "Toplam Tutar",
    "Platform Komisyonu",
    "Net Tedarikci Hakedisi",
    "Iade Tutari",
    "Tedarikci",
    "Alici Isletme",
    "Durum",
    "Hakedis Durumu",
  ];

  const rows = records.map((p) => [
    p.paymentNumber,
    p.orderNumber,
    new Date(p.createdAt).toLocaleDateString("tr-TR"),
    p.amount.toFixed(2),
    (p.platformFee || 0).toFixed(2),
    (p.supplierAmount || 0).toFixed(2),
    (p.refundedAmount || 0).toFixed(2),
    `"${(p.supplierName || "").replace(/"/g, '""')}"`,
    `"${(p.businessName || "").replace(/"/g, '""')}"`,
    p.status,
    p.payoutStatus || "pending_delivery",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
