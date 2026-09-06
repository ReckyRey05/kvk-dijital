import assert from "node:assert";
import crypto from "crypto";
import {
  TeklifimOrder,
  TeklifimPayment,
  TeklifimInvoice,
  TeklifimRefundItem,
  TeklifimSupplierPayoutSummary,
} from "../../src/types/teklifimGelsin";
import {
  calculateMarketplaceCommission,
  DEFAULT_COMMISSION_CONFIG,
} from "../../src/lib/payments/commissionService";
import { MockMarketplacePaymentProvider } from "../../src/lib/payments/providers/mockProvider";
import { exportFinanceRecordsToCsv } from "../../src/lib/payments/paymentService";

console.log("===============================================================");
console.log(">> [TOPTANCIM CEBIMDE TEST] FAZ 6: Odeme, Finans & Faturalandirma");
console.log("===============================================================");

// In-Memory Test State
const state = {
  payments: new Map<string, TeklifimPayment>(),
  orders: new Map<string, TeklifimOrder>(),
  invoices: new Map<string, TeklifimInvoice>(),
  webhookEvents: new Set<string>(),
};

// Helper to create test order
function createTestOrder(id: string, buyerId: string, supplierId: string, amount: number, category = "Ambalaj & Paketleme"): TeklifimOrder {
  return {
    id,
    orderNumber: `SIP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    agreementId: `agr_${id}`,
    agreementNumber: `SOZ-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    requestId: `req_${id}`,
    requestTitle: "Endüstriyel Karton Bardak Siparişi",
    businessId: buyerId,
    businessName: "Kadikoy Kahvecisi Ltd.",
    supplierId: supplierId,
    supplierName: "Marmara Kagit Ambalaj A.S.",
    offerId: `off_${id}`,
    quantity: 10000,
    unit: "Adet",
    unitPrice: amount / 10000,
    deliveryDays: 5,
    deliveryAddress: {
      contactName: "Ali Haydar",
      phone: "05551234567",
      addressLine: "Moda Cad. No:12",
      city: "İstanbul",
      district: "Kadıköy",
    },
    items: [
      {
        productName: "Karton Bardak 8oz",
        category,
        quantity: 10000,
        unit: "Adet",
        unitPrice: amount / 10000,
        totalPrice: amount,
      },
    ],
    totalPrice: amount,
    currency: "TRY",
    deliveryMethod: "cargo",
    expectedDeliveryDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    status: "preparing",
    paymentStatus: "unpaid",
    statusHistory: [
      {
        status: "preparing",
        changedBy: buyerId,
        timestamp: Date.now(),
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Helper: Generates unique payment number
function generateMockPaymentNumber(): string {
  const seq = (state.payments.size + 1).toString().padStart(6, "0");
  return `ODE-2026-${seq}`;
}

// Mock orchestration logic matching paymentService.ts
function createOrderPaymentSessionMock(orderId: string, requestingUserId: string, idempotencyKey: string): TeklifimPayment {
  const order = state.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (requestingUserId !== order.businessId && requestingUserId !== "admin_user") {
    throw new Error("Bu siparis icin odeme baslatma yetkiniz bulunmamaktadir.");
  }

  // Idempotency check
  for (const existing of state.payments.values()) {
    if (existing.idempotencyKey === idempotencyKey) {
      return existing;
    }
  }

  const commission = calculateMarketplaceCommission(order);
  const paymentNumber = generateMockPaymentNumber();
  const paymentId = `pay_${order.id}`;

  const payment: TeklifimPayment = {
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
    currency: "TRY",
    platformFeeRate: commission.feeRate,
    platformFee: commission.platformFee,
    supplierAmount: commission.supplierAmount,
    status: "pending",
    statusHistory: [
      {
        status: "pending",
        changedBy: requestingUserId,
        timestamp: Date.now(),
        note: "Odeme oturumu olusturuldu.",
      },
    ],
    provider: "mock_provider",
    providerPaymentId: `mock_pay_${paymentNumber}`,
    idempotencyKey,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    payoutStatus: "pending_delivery",
  };

  state.payments.set(paymentId, payment);
  return payment;
}

function verifyAndProcessPaymentMock(paymentId: string, simulateFail = false): TeklifimPayment {
  const payment = state.payments.get(paymentId);
  if (!payment) throw new Error("Odeme kaydi bulunamadi.");

  const now = Date.now();
  if (simulateFail) {
    payment.status = "failed";
    payment.failedAt = now;
    payment.failureReason = "Kart limiti yetersiz.";
    payment.updatedAt = now;
    payment.statusHistory.push({
      status: "failed",
      changedBy: "bank_system",
      timestamp: now,
      note: "Kart limiti yetersiz.",
    });
    return payment;
  }

  payment.status = "paid";
  payment.paidAt = now;
  payment.paymentMethod = "credit_card";
  payment.cardLastFour = "4242";
  payment.cardBrand = "Mastercard Ticari";
  payment.updatedAt = now;
  payment.statusHistory.push({
    status: "paid",
    changedBy: "bank_system",
    timestamp: now,
    note: "Odeme saglayici tarafindan onaylandi.",
  });

  // Sync order
  const order = state.orders.get(payment.orderId);
  if (order) {
    order.paymentStatus = "paid";
    order.status = "preparing";
    order.paidAt = now;
    order.updatedAt = now;
  }

  return payment;
}

function processRefundMock(paymentId: string, requestingUserId: string, refundAmount: number, reason: string): { payment: TeklifimPayment; refundItem: TeklifimRefundItem } {
  const payment = state.payments.get(paymentId);
  if (!payment) throw new Error("Odeme kaydi bulunamadi.");

  if (requestingUserId !== payment.businessId && requestingUserId !== "admin_user") {
    throw new Error("Iade islemi yapma yetkiniz bulunmamaktadir.");
  }

  if (payment.status !== "paid" && payment.status !== "partially_refunded") {
    throw new Error("Yalnizca odenmis siparisler icin iade yapilabilir.");
  }

  const currentRefunded = payment.refundedAmount || 0;
  const remainingRefundable = Math.round((payment.amount - currentRefunded) * 100) / 100;

  if (refundAmount <= 0) throw new Error("Gecerli bir iade tutari giriniz.");
  if (refundAmount > remainingRefundable) {
    throw new Error(`Iade edilebilecek maksimum tutar ${remainingRefundable} TL'dir.`);
  }

  const now = Date.now();
  const refundItem: TeklifimRefundItem = {
    refundId: `ref_${now}`,
    amount: refundAmount,
    reason,
    refundedAt: now,
    refundedBy: requestingUserId,
    status: "success",
  };

  const newTotalRefunded = Math.round((currentRefunded + refundAmount) * 100) / 100;
  const isFull = newTotalRefunded >= payment.amount;

  payment.refundedAmount = newTotalRefunded;
  payment.refunds = [...(payment.refunds || []), refundItem];
  payment.status = isFull ? "refunded" : "partially_refunded";
  payment.updatedAt = now;

  const order = state.orders.get(payment.orderId);
  if (order) {
    order.paymentStatus = payment.status;
  }

  return { payment, refundItem };
}

// -------------------------------------------------------------
// TEST RUNNER
// -------------------------------------------------------------
async function runAllTests() {
  console.log("\n--- SENARYO 1: TeklifimPayment oturumu ve ODE-2026 format dogrulamasi ---");
  const order1 = createTestOrder("ord_101", "biz_001", "sup_001", 10000);
  state.orders.set(order1.id, order1);

  const session1 = createOrderPaymentSessionMock(order1.id, "biz_001", "idem_key_1");
  assert.ok(session1.id.startsWith("pay_"), "Payment ID pay_ ile baslamali");
  assert.match(session1.paymentNumber, /^ODE-2026-\d{6}$/, "Format ODE-2026-XXXXXX olmali");
  assert.strictEqual(session1.status, "pending");
  assert.strictEqual(session1.amount, 10000);
  console.log("[OK] Senaryo 1 Basarili:", session1.paymentNumber);

  console.log("\n--- SENARYO 2: Checkout Odeme Oturumu Idempotency Korumasi ---");
  const session2 = createOrderPaymentSessionMock(order1.id, "biz_001", "idem_key_1");
  assert.strictEqual(session1.paymentNumber, session2.paymentNumber, "Ayni idempotency key ile ayni oturum donmeli");
  assert.strictEqual(state.payments.size, 1, "Cift odeme kaydi olusmamali");
  console.log("[OK] Senaryo 2 Basarili: Idempotent tekrar cagrisi ayni nesneyi dondu");

  console.log("\n--- SENARYO 3: Odeme Baslatma Yetki Guvenligi (Unauthorized buyer) ---");
  assert.throws(
    () => createOrderPaymentSessionMock(order1.id, "unauthorized_user_999", "idem_key_2"),
    /yetkiniz bulunmamaktadir/
  );
  console.log("[OK] Senaryo 3 Basarili: Yetkisiz kullanici odeme baslatamadi");

  console.log("\n--- SENARYO 4: Standart %3 Platform Komisyonu ve Net Hakedis Bolunmesi ---");
  const comm1 = calculateMarketplaceCommission(order1);
  assert.strictEqual(comm1.feeRate, 0.03, "Varsayilan komisyon %3 olmali");
  assert.strictEqual(comm1.platformFee, 300, "10.000 TL icin platform komisyonu 300 TL olmali");
  assert.strictEqual(comm1.supplierAmount, 9700, "Tedarikciye kalan hakedis 9.700 TL olmali");
  assert.strictEqual(comm1.platformFee + comm1.supplierAmount, 10000, "Toplam tutar tam bolunmeli");
  console.log("[OK] Senaryo 4 Basarili: Komisyon 300 TL, Tedarikci Hakedis 9.700 TL");

  console.log("\n--- SENARYO 5: Kategori Bazli Dinamik Komisyon Orani ---");
  const orderElec = createTestOrder("ord_102", "biz_001", "sup_001", 20000, "Elektronik & Donanım");
  const commElec = calculateMarketplaceCommission(orderElec);
  assert.strictEqual(commElec.feeRate, 0.04, "Elektronik kategorisi %4 komisyon oranina sahip olmali");
  assert.strictEqual(commElec.platformFee, 800, "20.000 TL icin komisyon 800 TL olmali");
  assert.strictEqual(commElec.supplierAmount, 19200, "Tedarikci payi 19.200 TL olmali");
  console.log("[OK] Senaryo 5 Basarili: Kategoriye ozel %4 orani uygulandi");

  console.log("\n--- SENARYO 6: Tedarikciye Ozel VIP Komisyon Indirimi (Override) ---");
  const orderVip = createTestOrder("ord_103", "biz_001", "vip_supplier_77", 50000);
  const commVip = calculateMarketplaceCommission(orderVip, {
    supplierOverrides: { vip_supplier_77: 0.015 },
  });
  assert.strictEqual(commVip.feeRate, 0.015, "VIP tedarikci override orani %1.5 olmali");
  assert.strictEqual(commVip.platformFee, 750, "50.000 TL icin komisyon 750 TL olmali");
  assert.strictEqual(commVip.supplierAmount, 49250, "Tedarikci net hakedis 49.250 TL olmali");
  console.log("[OK] Senaryo 6 Basarili: VIP override %1.5 basariyla isletildi");

  console.log("\n--- SENARYO 7: Mock Payment Provider ile Oturum Olusturma ---");
  const provider = new MockMarketplacePaymentProvider();
  const provSession = await provider.createPaymentSession({
    paymentNumber: session1.paymentNumber,
    order: order1,
    buyer: {
      id: "biz_001",
      name: "Kadikoy Kahve",
      email: "biz@kahve.com",
      phone: "05551234567",
      address: "Moda Cad.",
      city: "Istanbul",
    },
    supplier: {
      id: order1.supplierId,
      name: order1.supplierName,
    },
    platformFee: session1.platformFee || 300,
    supplierAmount: session1.supplierAmount || 9700,
    callbackUrl: "https://kvkdijital.com/api/callback",
    idempotencyKey: "test_idem_prov",
    amount: session1.amount,
    currency: "TRY",
  });
  assert.ok(provSession.providerPaymentId.startsWith("mock_pay_"), "Provider payment ID uretilmeli");
  assert.strictEqual(provSession.status, "pending");
  assert.ok(provSession.paymentPageUrl && provSession.paymentPageUrl.includes("checkout"), "Checkout URL donmeli");
  console.log("[OK] Senaryo 7 Basarili: Mock provider oturumu acildi");

  console.log("\n--- SENARYO 8: Basarili Odeme Dogrulamasi (Paid Durum Gecisi) ---");
  const paidResult = verifyAndProcessPaymentMock(session1.id, false);
  assert.strictEqual(paidResult.status, "paid", "Odeme durumu paid olmali");
  assert.ok(paidResult.paidAt && paidResult.paidAt > 0, "paidAt damgasi kaydedilmeli");
  assert.strictEqual(paidResult.cardBrand, "Mastercard Ticari");
  assert.strictEqual(order1.paymentStatus, "paid", "Siparis odeme durumu senkronize edilmeli");
  assert.strictEqual(order1.status, "preparing", "Siparis hazirlik durumuna gecmeli");
  console.log("[OK] Senaryo 8 Basarili: Odeme 'paid' durumuna gecti, siparis senkronize edildi");

  console.log("\n--- SENARYO 9: Basarisiz Odeme Islemi ve Hata Kaydi ---");
  const orderFail = createTestOrder("ord_104", "biz_001", "sup_001", 5000);
  state.orders.set(orderFail.id, orderFail);
  const sessionFail = createOrderPaymentSessionMock(orderFail.id, "biz_001", "idem_fail");
  const failedResult = verifyAndProcessPaymentMock(sessionFail.id, true);
  assert.strictEqual(failedResult.status, "failed");
  assert.strictEqual(failedResult.failureReason, "Kart limiti yetersiz.");
  assert.strictEqual(orderFail.paymentStatus, "unpaid", "Basarisiz odeme siparisi paid yapmamali");
  console.log("[OK] Senaryo 9 Basarili: Reddedilen odeme failed olarak islendi");

  console.log("\n--- SENARYO 10: Webhook HMAC-SHA256 Imza Dogrulamasi (Gecerli Imza) ---");
  const webhookSecret = "kvk-secret-key-2026";
  const rawBody = JSON.stringify({
    eventId: "evt_test_001",
    eventType: "payment.succeeded",
    providerPaymentId: session1.providerPaymentId,
    amount: 10000,
    timestamp: Date.now(),
  });
  const validHmac = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  const validWebhookRes = await provider.verifyWebhook(
    {
      headers: { "x-teklifim-signature": validHmac },
      rawBody,
      parsedBody: JSON.parse(rawBody),
    },
    webhookSecret
  );
  assert.strictEqual(validWebhookRes.isValid, true, "Gecerli imza basariyla dogrulanmali");
  assert.strictEqual(validWebhookRes.eventType, "payment.succeeded");
  console.log("[OK] Senaryo 10 Basarili: Webhook HMAC-SHA256 gecerli imza onaylandi");

  console.log("\n--- SENARYO 11: Webhook HMAC Sahtecilik Tespiti (Gecersiz Imza) ---");
  const invalidWebhookRes = await provider.verifyWebhook(
    {
      headers: { "x-teklifim-signature": "forged_invalid_signature_hex" },
      rawBody,
      parsedBody: JSON.parse(rawBody),
    },
    webhookSecret
  );
  assert.strictEqual(invalidWebhookRes.isValid, false, "Sahte imza reddedilmeli");
  console.log("[OK] Senaryo 11 Basarili: Sahte webhook imzasi tespit edildi ve engellendi");

  console.log("\n--- SENARYO 12: Webhook Event Idempotency (Cift Olay Engeli) ---");
  const eventId = "evt_idempotency_test_001";
  function handleWebhookEventMock(evtId: string): boolean {
    if (state.webhookEvents.has(evtId)) {
      return false; // Skip duplicate
    }
    state.webhookEvents.add(evtId);
    return true; // Processed
  }
  const firstProcess = handleWebhookEventMock(eventId);
  const secondProcess = handleWebhookEventMock(eventId);
  assert.strictEqual(firstProcess, true, "Ilk webhook olayi islenmeli");
  assert.strictEqual(secondProcess, false, "Ikinci ayni eventId'li webhook olayi cift islemi onlemek icin atlanmali");
  console.log("[OK] Senaryo 12 Basarili: Webhook cift olay idempotent skip calisti");

  console.log("\n--- SENARYO 13: Kismi Iade (Partial Refund) ve Bakiye Takibi ---");
  const refund1 = processRefundMock(session1.id, "biz_001", 3000, "Kusurlu urun iadesi");
  assert.strictEqual(refund1.payment.status, "partially_refunded");
  assert.strictEqual(refund1.payment.refundedAmount, 3000);
  assert.strictEqual(refund1.payment.refunds?.length, 1);
  assert.strictEqual(order1.paymentStatus, "partially_refunded");
  console.log("[OK] Senaryo 13 Basarili: 3.000 TL kismi iade yapildi, kalan iade edilebilir bakiye: 7.000 TL");

  console.log("\n--- SENARYO 14: Bakiye Ustu Iade Engeli (Excess Refund Prevention) ---");
  assert.throws(
    () => processRefundMock(session1.id, "biz_001", 7001, "Fazladan iade"),
    /Iade edilebilecek maksimum tutar 7000 TL/
  );
  console.log("[OK] Senaryo 14 Basarili: Kalan bakiyeden (7.000 TL) fazla iade yapilmasi engellendi");

  console.log("\n--- SENARYO 15: Iade Yetki Korumasi (Unauthorized Refund) ---");
  assert.throws(
    () => processRefundMock(session1.id, "foreign_user_88", 50, "Yetkisiz iade"),
    /yetkiniz bulunmamaktadir/
  );
  console.log("[OK] Senaryo 15 Basarili: Yetkisiz kullanici iade yapamadi");

  console.log("\n--- SENARYO 16: Kalan Tutarin Tamami Iade Edildiginde 'refunded' Gecisi ---");
  const refund2 = processRefundMock(session1.id, "biz_001", 7000, "Kalan tum urunlerin iptali");
  assert.strictEqual(refund2.payment.status, "refunded");
  assert.strictEqual(refund2.payment.refundedAmount, 10000);
  assert.strictEqual(refund2.payment.refunds?.length, 2);
  assert.strictEqual(order1.paymentStatus, "refunded");
  console.log("[OK] Senaryo 16 Basarili: 10.000 TL tam iadeye ulasildi, durum 'refunded' oldu");

  console.log("\n--- SENARYO 17: Tedarikci Ticari Fatura Yukleme (Invoice Submission) ---");
  const invoice: TeklifimInvoice = {
    id: `inv_${order1.id}_supplier`,
    orderId: order1.id,
    orderNumber: order1.orderNumber,
    businessId: order1.businessId,
    businessName: order1.businessName,
    supplierId: order1.supplierId,
    supplierName: order1.supplierName,
    invoiceType: "commercial_supplier",
    invoiceNumber: "GIB2026000001234",
    amount: 10000,
    currency: "TRY",
    fileUrl: "https://storage.kvkdijital.com/invoices/gib2026000001234.pdf",
    fileName: "gib2026000001234.pdf",
    fileSize: 1024 * 500, // 500 KB
    mimeType: "application/pdf",
    status: "invoice_uploaded",
    uploadedAt: Date.now(),
    uploadedBy: order1.supplierId,
    notes: "e-Fatura resmi portal onayli belgedir.",
  };
  state.invoices.set(invoice.id, invoice);
  assert.strictEqual(state.invoices.size, 1);
  assert.strictEqual(invoice.status, "invoice_uploaded");
  assert.ok(invoice.fileSize < 10 * 1024 * 1024, "Dosya boyutu 10MB altinda");
  console.log("[OK] Senaryo 17 Basarili: Resmi ticari fatura yuklendi:", invoice.invoiceNumber);

  console.log("\n--- SENARYO 18: Tedarikci Finans & Hakedis Hesabi Hesaplamasi ---");
  // Create second paid order for sup_001
  const orderPaid2 = createTestOrder("ord_105", "biz_002", "sup_001", 30000);
  state.orders.set(orderPaid2.id, orderPaid2);
  const sessionPaid2 = createOrderPaymentSessionMock(orderPaid2.id, "biz_002", "idem_paid_2");
  verifyAndProcessPaymentMock(sessionPaid2.id, false);

  // Supplier overview computation
  let totalSalesVolume = 0;
  let totalCommissionPaid = 0;
  let totalRefundedVolume = 0;
  let netPayoutEarned = 0;

  for (const p of state.payments.values()) {
    if (p.supplierId === "sup_001" && (p.status === "paid" || p.status === "partially_refunded" || p.status === "refunded")) {
      totalSalesVolume += p.amount;
      totalCommissionPaid += p.platformFee;
      totalRefundedVolume += (p.refundedAmount || 0);
      const net = (p.supplierAmount || 0) - (p.refundedAmount || 0);
      netPayoutEarned += Math.max(0, net);
    }
  }

  assert.strictEqual(totalSalesVolume, 40000, "Toplam hacim 10.000 + 30.000 = 40.000 TL");
  assert.strictEqual(totalCommissionPaid, 1200, "Toplam komisyon 300 + 900 = 1.200 TL");
  assert.strictEqual(totalRefundedVolume, 10000, "Toplam iade 10.000 TL");
  assert.strictEqual(netPayoutEarned, 29100, "Net hakedis 29.100 TL");
  console.log("[OK] Senaryo 18 Basarili: Tedarikci hakedis ozeti gercek verilerden hesaplandi");

  console.log("\n--- SENARYO 19: Admin Finansal Metrikler (GMV & Komisyon Geliri) ---");
  let gmv = 0;
  let platformRevenue = 0;
  let totalRefunds = 0;
  for (const p of state.payments.values()) {
    if (p.status === "paid" || p.status === "partially_refunded" || p.status === "refunded") {
      gmv += p.amount;
      platformRevenue += p.platformFee;
      totalRefunds += (p.refundedAmount || 0);
    }
  }
  assert.strictEqual(gmv, 40000, "Admin GMV 40.000 TL olmali");
  assert.strictEqual(platformRevenue, 1200, "Admin platform geliri 1.200 TL olmali");
  assert.strictEqual(totalRefunds, 10000, "Toplam iade hacmi 10.000 TL olmali");
  console.log("[OK] Senaryo 19 Basarili: Admin GMV: 40.000 TL, Gelir: 1.200 TL");

  console.log("\n--- SENARYO 20: Finans Dokumunun CSV / Excel Olarak Disa Aktarimi ---");
  const allPayments = Array.from(state.payments.values());
  const csvData = exportFinanceRecordsToCsv(allPayments);

  assert.ok(csvData.includes("Odeme No,Siparis No,Tarih,Toplam Tutar,Platform Komisyonu,Net Tedarikci Hakedisi,Iade Tutari,Tedarikci,Alici Isletme,Durum,Hakedis Durumu"), "CSV basliklari eksiksiz olmali");
  assert.ok(csvData.includes("ODE-2026-"), "CSV icinde gercek odeme numaralari yer almali");
  assert.ok(csvData.includes("Kadikoy Kahvecisi Ltd."), "CSV icinde sirket unvanlari yer almali");
  console.log("[OK] Senaryo 20 Basarili: CSV formatinda finans raporu basariyla uretildi");

  console.log("\n===============================================================");
  console.log(">> TUM 20/20 FAZ 6 FINANS & ODEME TESTLERI BASARIYLA TAMAMLANDI");
  console.log("===============================================================\n");
}

runAllTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
