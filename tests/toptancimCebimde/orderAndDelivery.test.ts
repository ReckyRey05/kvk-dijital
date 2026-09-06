import assert from "node:assert";
import {
  TeklifimOrder,
  TeklifimOrderStatus,
  TeklifimDeliveryMethod,
  TeklifimDeliveryAddress,
  TeklifimOrderItem,
  TeklifimOrderTracking,
  TeklifimDeliveryProof,
  TeklifimOrderDispute,
  TeklifimOrderCancellation,
  TeklifimAgreement,
  TeklifimOffer,
  TeklifimRequest,
} from "../../src/types/teklifimGelsin";

console.log("===============================================================");
console.log(">> [TOPTANCIM CEBIMDE TEST] FAZ 5: Siparis, Teslimat & Islem");
console.log("===============================================================");

// Simulated In-Memory Database for FAZ 5 Hermetic Testing
const db = {
  orders: new Map<string, TeklifimOrder>(),
  agreements: new Map<string, TeklifimAgreement>(),
  requests: new Map<string, TeklifimRequest>(),
  offers: new Map<string, TeklifimOffer>(),
  blocks: new Set<string>(),
  notifications: [] as any[],
  supplierCompletedDeals: new Map<string, number>(),
};

function isUserBlocked(userA: string, userB: string): boolean {
  return db.blocks.has(`${userA}_${userB}`) || db.blocks.has(`${userB}_${userA}`);
}

function generateOrderNumberMock(): string {
  const seq = (db.orders.size + 1).toString().padStart(6, "0");
  return `SIP-2026-${seq}`;
}

function computeDeliveryStatusMock(order: TeklifimOrder): {
  label: string;
  isDelayed: boolean;
  remainingDays?: number;
  delayDays?: number;
} {
  const now = Date.now();
  const diffMs = order.expectedDeliveryDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (order.status === "delivered" || order.status === "completed") {
    return { label: "Teslim Edildi", isDelayed: false };
  }

  if (diffDays < 0) {
    const delayDays = Math.abs(diffDays);
    return {
      label: `Teslimat ${delayDays} gun gecikti`,
      isDelayed: true,
      delayDays,
    };
  } else if (diffDays === 0) {
    return {
      label: "Bugun teslim edilmeli",
      isDelayed: false,
      remainingDays: 0,
    };
  } else {
    return {
      label: `${diffDays} gun kaldi`,
      isDelayed: false,
      remainingDays: diffDays,
    };
  }
}

function createOrderFromAgreementMock(
  agreementId: string,
  userId: string,
  deliveryData?: {
    deliveryMethod?: TeklifimDeliveryMethod;
    deliveryAddress?: TeklifimDeliveryAddress;
    notes?: string;
  }
): TeklifimOrder {
  const agreement = db.agreements.get(agreementId);
  if (!agreement) throw new Error("Anlasma bulunamadi.");

  if (userId !== agreement.businessId && userId !== agreement.supplierId && userId !== "admin_user") {
    throw new Error("Siparis olusturma yetkiniz bulunmamaktadir.");
  }

  if (isUserBlocked(agreement.businessId, agreement.supplierId)) {
    throw new Error("Engellenmis kullanicilar arasinda siparis yurutelemez.");
  }

  // Idempotency: Check if order already exists for this agreement
  for (const existingOrder of db.orders.values()) {
    if (existingOrder.agreementId === agreementId) {
      return existingOrder;
    }
  }

  const now = Date.now();
  const orderId = `ord_${agreementId}`;
  const orderNumber = generateOrderNumberMock();
  const deliveryDays = agreement.deliveryDays || 3;
  const expectedDeliveryDate = now + deliveryDays * 24 * 60 * 60 * 1000;

  const req = db.requests.get(agreement.requestId);
  const category = req?.category || "Genel Tedarik";

  const defaultItems: TeklifimOrderItem[] = [
    {
      productName: agreement.requestTitle,
      category,
      quantity: agreement.quantity,
      unit: agreement.unit,
      unitPrice: agreement.unitPrice,
      totalPrice: agreement.totalPrice ?? agreement.acceptedPrice,
    },
  ];

  const defaultAddress: TeklifimDeliveryAddress = {
    contactName: agreement.businessName,
    phone: "05550000000",
    addressLine: "Ornek Mahallesi Sanayi Caddesi No: 42",
    city: "Istanbul",
    district: "Umraniye",
  };

  const newOrder: TeklifimOrder = {
    id: orderId,
    orderNumber,
    agreementId,
    agreementNumber: agreement.agreementNumber,
    requestId: agreement.requestId,
    requestTitle: agreement.requestTitle,
    offerId: agreement.offerId,
    businessId: agreement.businessId,
    businessName: agreement.businessName,
    supplierId: agreement.supplierId,
    supplierName: agreement.supplierName,
    items: defaultItems,
    quantity: agreement.quantity,
    unit: agreement.unit,
    unitPrice: agreement.unitPrice,
    totalPrice: agreement.totalPrice ?? agreement.acceptedPrice,
    currency: "TRY",
    deliveryDays,
    expectedDeliveryDate,
    deliveryMethod: deliveryData?.deliveryMethod || "cargo",
    deliveryAddress: deliveryData?.deliveryAddress || defaultAddress,
    notes: deliveryData?.notes,
    status: "preparing",
    statusHistory: [
      {
        status: "preparing",
        changedBy: userId,
        timestamp: now,
        note: "Siparis anlasmadan olusturuldu.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  db.orders.set(orderId, newOrder);

  // Link agreement
  agreement.orderId = orderId;
  agreement.orderNumber = orderNumber;

  // Notify parties
  db.notifications.push({
    userId: agreement.supplierId,
    title: "Yeni Siparis Olusturuldu",
    body: `${orderNumber} numarali siparis onaylandi, hazirliga baslayabilirsiniz.`,
  });
  db.notifications.push({
    userId: agreement.businessId,
    title: "Siparisiniz Olusturuldu",
    body: `${orderNumber} numarali siparisinizin hazirlik sureci basladi.`,
  });

  return newOrder;
}

function getTeklifimOrderDetailsMock(orderId: string, userId: string): TeklifimOrder {
  const order = db.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (userId !== order.businessId && userId !== order.supplierId && userId !== "admin_user") {
    throw new Error("Bu siparise erisim yetkiniz bulunmamaktadir.");
  }

  if (isUserBlocked(order.businessId, order.supplierId)) {
    throw new Error("Engellenmis kullanici siparisi.");
  }

  return order;
}

function getUserTeklifimOrdersMock(userId: string): TeklifimOrder[] {
  const list: TeklifimOrder[] = [];
  for (const o of db.orders.values()) {
    if (o.businessId === userId || o.supplierId === userId) {
      list.push(o);
    }
  }
  return list;
}

function getAllTeklifimOrdersForAdminMock(): TeklifimOrder[] {
  return Array.from(db.orders.values());
}

function updateTeklifimOrderStatusMock(
  orderId: string,
  userId: string,
  newStatus: TeklifimOrderStatus,
  note?: string
): TeklifimOrder {
  const order = db.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (userId !== order.businessId && userId !== order.supplierId && userId !== "admin_user") {
    throw new Error("Siparis durumunu guncelleme yetkiniz bulunmamaktadir.");
  }

  // Terminal state check
  if (order.status === "completed" || order.status === "cancelled") {
    throw new Error(`Siparis ${order.status} durumunda iken durumu degistirilemez.`);
  }

  // Transition validation
  const validTransitions: Record<TeklifimOrderStatus, TeklifimOrderStatus[]> = {
    preparing: ["ready_for_dispatch", "cancelled", "disputed"],
    ready_for_dispatch: ["shipped", "cancelled", "disputed"],
    shipped: ["delivered", "disputed"],
    delivered: ["completed", "disputed"],
    completed: [],
    cancelled: [],
    disputed: ["completed", "cancelled", "preparing"],
  };

  const allowed = validTransitions[order.status] || [];
  if (!allowed.includes(newStatus) && userId !== "admin_user") {
    throw new Error(`Gecersiz durum gecisi: ${order.status} -> ${newStatus}`);
  }

  const now = Date.now();
  order.status = newStatus;
  order.updatedAt = now;
  order.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    timestamp: now,
    note,
  });

  return order;
}

function addTeklifimOrderTrackingMock(
  orderId: string,
  userId: string,
  tracking: { carrier: string; trackingNumber: string; trackingUrl?: string }
): TeklifimOrder {
  const order = db.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (userId !== order.supplierId && userId !== "admin_user") {
    throw new Error("Kargo takip bilgisini yalnizca satici tedarikci girebilir.");
  }

  if (order.status !== "preparing" && order.status !== "ready_for_dispatch") {
    throw new Error("Kargo bilgisi yalnizca hazirlik asamasindaki siparisler icin girilebilir.");
  }

  const now = Date.now();
  const trackingInfo: TeklifimOrderTracking = {
    carrier: tracking.carrier,
    trackingNumber: tracking.trackingNumber,
    trackingUrl: tracking.trackingUrl,
    shippedAt: now,
  };

  order.trackingInfo = trackingInfo;
  order.status = "shipped";
  order.updatedAt = now;
  order.statusHistory.push({
    status: "shipped",
    changedBy: userId,
    timestamp: now,
    note: `Kargoya verildi: ${tracking.carrier} (${tracking.trackingNumber})`,
  });

  db.notifications.push({
    userId: order.businessId,
    title: "Siparisiniz Kargoya Verildi",
    body: `${order.orderNumber} kargoya verildi. Takip no: ${tracking.trackingNumber}`,
  });

  return order;
}

function confirmTeklifimOrderDeliveryMock(
  orderId: string,
  userId: string,
  proof: { receivedBy: string; proofNote?: string; proofPhotoUrl?: string }
): TeklifimOrder {
  const order = db.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (userId !== order.businessId && userId !== "admin_user") {
    throw new Error("Teslim alma islemini yalnizca alici isletme onaylayabilir.");
  }

  if (order.status !== "shipped") {
    throw new Error("Yalnizca kargodaki siparisler icin teslim alma onayi verilebilir.");
  }

  const now = Date.now();
  const deliveryProof: TeklifimDeliveryProof = {
    deliveredAt: now,
    receivedBy: proof.receivedBy,
    proofNote: proof.proofNote,
    proofPhotoUrl: proof.proofPhotoUrl,
  };

  order.deliveryProof = deliveryProof;
  order.status = "delivered";
  order.updatedAt = now;
  order.statusHistory.push({
    status: "delivered",
    changedBy: userId,
    timestamp: now,
    note: `Teslim alindi: ${proof.receivedBy}`,
  });

  db.notifications.push({
    userId: order.supplierId,
    title: "Siparis Teslim Edildi",
    body: `${order.orderNumber} musteri tarafindan teslim alindi.`,
  });

  return order;
}

function completeTeklifimOrderMock(orderId: string, userId: string): TeklifimOrder {
  const order = db.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (userId !== order.businessId && userId !== "admin_user") {
    throw new Error("Siparisi tamamlama yetkiniz bulunmamaktadir.");
  }

  if (order.status !== "delivered") {
    throw new Error("Yalnizca teslim edilmis siparisler tamamlanabilir.");
  }

  const now = Date.now();
  order.status = "completed";
  order.completedAt = now;
  order.updatedAt = now;
  order.statusHistory.push({
    status: "completed",
    changedBy: userId,
    timestamp: now,
    note: "Siparis basariyla tamamlandi ve kapatildi.",
  });

  // Increment completed deals counter for supplier
  const currentCount = db.supplierCompletedDeals.get(order.supplierId) || 0;
  db.supplierCompletedDeals.set(order.supplierId, currentCount + 1);

  db.notifications.push({
    userId: order.supplierId,
    title: "Siparis Basariyla Tamamlandi",
    body: `${order.orderNumber} tamamlandi. Tebrik ederiz!`,
  });

  return order;
}

function cancelTeklifimOrderMock(
  orderId: string,
  userId: string,
  cancelData: { reason: TeklifimOrderCancellation["reason"]; note?: string }
): TeklifimOrder {
  const order = db.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (userId !== order.businessId && userId !== order.supplierId && userId !== "admin_user") {
    throw new Error("Siparisi iptal etme yetkiniz bulunmamaktadir.");
  }

  if (order.status !== "preparing" && order.status !== "ready_for_dispatch") {
    throw new Error("Sevkiyata cikan veya kargoya verilen siparisler dogrudan iptal edilemez. Anlasmazlik kaydi acilmalidir.");
  }

  const now = Date.now();
  order.status = "cancelled";
  order.cancellation = {
    cancelledAt: now,
    cancelledBy: userId,
    reason: cancelData.reason,
    note: cancelData.note,
  };
  order.updatedAt = now;
  order.statusHistory.push({
    status: "cancelled",
    changedBy: userId,
    timestamp: now,
    note: `Iptal: ${cancelData.reason}`,
  });

  const notifyUser = userId === order.businessId ? order.supplierId : order.businessId;
  db.notifications.push({
    userId: notifyUser,
    title: "Siparis Iptal Edildi",
    body: `${order.orderNumber} siparisi iptal edildi. Gerekce: ${cancelData.reason}`,
  });

  return order;
}

function disputeTeklifimOrderMock(
  orderId: string,
  userId: string,
  disputeData: { reason: TeklifimOrderDispute["reason"]; description: string }
): TeklifimOrder {
  const order = db.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (userId !== order.businessId && userId !== order.supplierId && userId !== "admin_user") {
    throw new Error("Anlasmazlik bildirme yetkiniz bulunmamaktadir.");
  }

  if (order.status === "cancelled") {
    throw new Error("Iptal edilmis siparis icin itiraz kaydi acilamaz.");
  }

  const now = Date.now();
  order.status = "disputed";
  order.dispute = {
    disputedAt: now,
    disputedBy: userId,
    reason: disputeData.reason,
    description: disputeData.description,
  };
  order.updatedAt = now;
  order.statusHistory.push({
    status: "disputed",
    changedBy: userId,
    timestamp: now,
    note: `Itiraz acildi: ${disputeData.reason}`,
  });

  // Notify admin and other party
  const otherParty = userId === order.businessId ? order.supplierId : order.businessId;
  db.notifications.push({
    userId: otherParty,
    title: "Sipariste Uyusmazlik Bildirildi",
    body: `${order.orderNumber} icin itiraz acildi: ${disputeData.description}`,
  });
  db.notifications.push({
    userId: "admin_user",
    title: "Yeni Siparis Uyusmazligi",
    body: `${order.orderNumber} icin mudaxale bekleniyor.`,
  });

  return order;
}

function resolveTeklifimOrderDisputeMock(
  orderId: string,
  adminUserId: string,
  resolution: { outcome: "completed" | "cancelled" | "preparing"; notes: string }
): TeklifimOrder {
  if (adminUserId !== "admin_user") {
    throw new Error("Yalnizca yetkili admin uyusmazligi cozebilir.");
  }

  const order = db.orders.get(orderId);
  if (!order) throw new Error("Siparis bulunamadi.");

  if (order.status !== "disputed") {
    throw new Error("Yalnizca anlasmazlik durumundaki siparisler cozumlenebilir.");
  }

  const now = Date.now();
  order.status = resolution.outcome;
  if (order.dispute) {
    order.dispute.resolvedAt = now;
    order.dispute.resolvedBy = adminUserId;
    order.dispute.resolutionNotes = resolution.notes;
  }
  order.updatedAt = now;
  order.statusHistory.push({
    status: resolution.outcome,
    changedBy: adminUserId,
    timestamp: now,
    note: `Admin cozumu: ${resolution.notes}`,
  });

  return order;
}

function createRepeatOrderDataFromOrderMock(order: TeklifimOrder): {
  title: string;
  category: string;
  quantity: number;
  unit: string;
  targetPrice: number;
} {
  const firstItem = order.items?.[0];
  return {
    title: `${order.requestTitle} (Tekrar Siparis)`,
    category: firstItem?.category || "Genel Tedarik",
    quantity: order.quantity,
    unit: order.unit,
    targetPrice: order.unitPrice,
  };
}

// -------------------------------------------------------------
// SEEDING DATA FOR TESTS
// -------------------------------------------------------------
const BIZ_ID = "biz_001";
const SUP_ID = "sup_999";
const THIRD_PARTY_ID = "biz_999";
const ADMIN_ID = "admin_user";

const testRequest: TeklifimRequest = {
  id: "req_101",
  businessId: BIZ_ID,
  businessName: "Kadikoy Kahvecisi",
  businessCity: "Istanbul",
  title: "1000 Adet Kraft Karton Bardak",
  category: "Ambalaj & Paketleme",
  quantity: 1000,
  unit: "Adet",
  deliveryDays: 4,
  city: "Istanbul",
  description: "Kraft karton bardak talebi",
  status: "open",
  offerCount: 1,
  createdAt: Date.now() - 50000,
  updatedAt: Date.now() - 50000,
};
db.requests.set(testRequest.id, testRequest);

const testOffer: TeklifimOffer = {
  id: "off_201",
  requestId: testRequest.id,
  requestTitle: testRequest.title,
  supplierId: SUP_ID,
  supplierName: "Ege Ambalaj Sanayi",
  supplierCity: "Izmir",
  supplierPhone: "05550000000",
  supplierEmail: "tedarikci@egeambalaj.com",
  description: "Kraft karton bardak teklifimiz",
  unitPrice: 2.5,
  totalPrice: 2500,
  deliveryDays: 4,
  currency: "TRY",
  status: "accepted",
  createdAt: Date.now() - 40000,
  updatedAt: Date.now() - 40000,
};
db.offers.set(testOffer.id, testOffer);

const testAgreement: TeklifimAgreement = {
  id: "agr_off_201",
  agreementNumber: "ANL-2026-0041",
  requestId: testRequest.id,
  requestTitle: testRequest.title,
  offerId: testOffer.id,
  businessId: BIZ_ID,
  businessName: testRequest.businessName,
  supplierId: SUP_ID,
  supplierName: testOffer.supplierName,
  productName: testRequest.title,
  category: testRequest.category,
  quantity: 1000,
  unit: "Adet",
  unitPrice: 2.5,
  acceptedPrice: 2500,
  totalPrice: 2500,
  currency: "TRY",
  deliveryDays: 4,
  status: "agreement_reached",
  statusHistory: [],
  createdAt: Date.now() - 30000,
  updatedAt: Date.now() - 30000,
};
db.agreements.set(testAgreement.id, testAgreement);

// -------------------------------------------------------------
// EXECUTE 18 VERIFICATION SCENARIOS
// -------------------------------------------------------------
let testsPassed = 0;

// 1. Order Creation from Accepted Agreement
console.log("Test 1: Order Creation from Accepted Agreement");
const order1 = createOrderFromAgreementMock(testAgreement.id, BIZ_ID);
assert.strictEqual(order1.agreementId, testAgreement.id);
assert.strictEqual(order1.agreementNumber, "ANL-2026-0041");
assert.strictEqual(order1.totalPrice, 2500);
assert.strictEqual(order1.quantity, 1000);
assert.strictEqual(order1.status, "preparing");
assert.ok(order1.orderNumber.startsWith("SIP-2026-"));
assert.strictEqual(order1.items.length, 1);
assert.strictEqual(order1.items[0].productName, "1000 Adet Kraft Karton Bardak");
assert.strictEqual(testAgreement.orderId, order1.id);
testsPassed++;

// 2. Duplicate Order Prevention
console.log("Test 2: Duplicate Order Prevention");
const orderDup = createOrderFromAgreementMock(testAgreement.id, BIZ_ID);
assert.strictEqual(orderDup.id, order1.id);
assert.strictEqual(orderDup.orderNumber, order1.orderNumber);
assert.strictEqual(db.orders.size, 1);
testsPassed++;

// 3. Order Number Uniqueness & Format Check
console.log("Test 3: Order Number Uniqueness & Format Check");
assert.match(order1.orderNumber, /^SIP-2026-\d{6}$/);
assert.strictEqual(order1.orderNumber, "SIP-2026-000001");
testsPassed++;

// 4. Valid State Transitions
console.log("Test 4: Valid State Transitions");
const oAfterPrep = updateTeklifimOrderStatusMock(order1.id, SUP_ID, "ready_for_dispatch", "Paketlendi.");
assert.strictEqual(oAfterPrep.status, "ready_for_dispatch");
assert.strictEqual(oAfterPrep.statusHistory.length, 2);
testsPassed++;

// 5. Invalid State Transition Prevention
console.log("Test 5: Invalid State Transition Prevention");
assert.throws(() => {
  // Cannot jump straight from ready_for_dispatch to completed
  updateTeklifimOrderStatusMock(order1.id, SUP_ID, "completed");
}, /Gecersiz durum gecisi/);
testsPassed++;

// 6. Delivery Address Privacy
console.log("Test 6: Delivery Address Privacy");
assert.throws(() => {
  getTeklifimOrderDetailsMock(order1.id, THIRD_PARTY_ID);
}, /erisim yetkiniz bulunmamaktadir/);
// Authorized parties can read
const authOrder = getTeklifimOrderDetailsMock(order1.id, BIZ_ID);
assert.strictEqual(authOrder.deliveryAddress.city, "Istanbul");
testsPassed++;

// 7. Tracking Number Access & Shipped State Transition
console.log("Test 7: Tracking Number Access & Shipped State Transition");
const shippedOrder = addTeklifimOrderTrackingMock(order1.id, SUP_ID, {
  carrier: "Yurtici Kargo",
  trackingNumber: "YK-9876543210",
  trackingUrl: "https://yurticikargo.com/track/YK-9876543210",
});
assert.strictEqual(shippedOrder.status, "shipped");
assert.ok(shippedOrder.trackingInfo);
assert.strictEqual(shippedOrder.trackingInfo?.carrier, "Yurtici Kargo");
assert.strictEqual(shippedOrder.trackingInfo?.trackingNumber, "YK-9876543210");
testsPassed++;

// 8. Delivery Proof Authorization
console.log("Test 8: Delivery Proof Authorization");
assert.throws(() => {
  // Supplier cannot confirm delivery for business
  confirmTeklifimOrderDeliveryMock(order1.id, SUP_ID, { receivedBy: "Ali Yilmaz" });
}, /yalnizca alici isletme onaylayabilir/);
testsPassed++;

// 9. Delivered Confirmation
console.log("Test 9: Delivered Confirmation with Delivery Proof");
const deliveredOrder = confirmTeklifimOrderDeliveryMock(order1.id, BIZ_ID, {
  receivedBy: "Ahmet Depo Muduru",
  proofNote: "1000 adet eksiksiz teslim alindi, koli hasarsiz.",
});
assert.strictEqual(deliveredOrder.status, "delivered");
assert.ok(deliveredOrder.deliveryProof);
assert.strictEqual(deliveredOrder.deliveryProof?.receivedBy, "Ahmet Depo Muduru");
assert.strictEqual(deliveredOrder.deliveryProof?.proofNote, "1000 adet eksiksiz teslim alindi, koli hasarsiz.");
testsPassed++;

// 10. Completion Flow
console.log("Test 10: Completion Flow & Supplier Counter");
const completedOrder = completeTeklifimOrderMock(order1.id, BIZ_ID);
assert.strictEqual(completedOrder.status, "completed");
assert.ok(completedOrder.completedAt);
assert.strictEqual(db.supplierCompletedDeals.get(SUP_ID), 1);
// Terminal state locked
assert.throws(() => {
  updateTeklifimOrderStatusMock(order1.id, SUP_ID, "preparing");
}, /durumunda iken durumu degistirilemez/);
testsPassed++;

// 11. Cancellation Rules
console.log("Test 11: Cancellation Rules");
// Create a second agreement and order to test cancellation
const testAgreement2: TeklifimAgreement = {
  id: "agr_off_202",
  agreementNumber: "ANL-2026-0042",
  requestId: "req_102",
  requestTitle: "200 kg Espresso Cekirdek",
  offerId: "off_202",
  businessId: BIZ_ID,
  businessName: "Kadikoy Kahvecisi",
  supplierId: SUP_ID,
  supplierName: "Ege Kahve",
  productName: "200 kg Espresso Cekirdek",
  category: "Gıda & İçecek",
  quantity: 200,
  unit: "kg",
  unitPrice: 400,
  acceptedPrice: 80000,
  totalPrice: 80000,
  currency: "TRY",
  deliveryDays: 2,
  status: "agreement_reached",
  statusHistory: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
db.agreements.set(testAgreement2.id, testAgreement2);
const order2 = createOrderFromAgreementMock(testAgreement2.id, SUP_ID);
assert.strictEqual(order2.status, "preparing");

const cancelledOrder = cancelTeklifimOrderMock(order2.id, SUP_ID, {
  reason: "out_of_stock",
  note: "Tedarik zincirinde hammadde aksamasi.",
});
assert.strictEqual(cancelledOrder.status, "cancelled");
assert.strictEqual(cancelledOrder.cancellation?.reason, "out_of_stock");
// Cannot update once cancelled
assert.throws(() => {
  updateTeklifimOrderStatusMock(order2.id, BIZ_ID, "ready_for_dispatch");
}, /durumunda iken durumu degistirilemez/);
testsPassed++;

// 12. Dispute Creation
console.log("Test 12: Dispute Creation");
const testAgreement3: TeklifimAgreement = {
  id: "agr_off_203",
  agreementNumber: "ANL-2026-0043",
  requestId: "req_103",
  requestTitle: "500 Adet Baskili Kupa",
  offerId: "off_203",
  businessId: BIZ_ID,
  businessName: "Kadikoy Kahvecisi",
  supplierId: SUP_ID,
  supplierName: "Porselen Ltd",
  productName: "500 Adet Baskili Kupa",
  category: "Mutfak & Restoran",
  quantity: 500,
  unit: "Adet",
  unitPrice: 30,
  acceptedPrice: 15000,
  totalPrice: 15000,
  currency: "TRY",
  deliveryDays: 5,
  status: "agreement_reached",
  statusHistory: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
db.agreements.set(testAgreement3.id, testAgreement3);
const order3 = createOrderFromAgreementMock(testAgreement3.id, BIZ_ID);
const disputedOrder = disputeTeklifimOrderMock(order3.id, BIZ_ID, {
  reason: "damaged_items",
  description: "Gelen kupalarin 120 adedi kirik ve baskilari hatali cikti.",
});
assert.strictEqual(disputedOrder.status, "disputed");
assert.strictEqual(disputedOrder.dispute?.reason, "damaged_items");
assert.strictEqual(disputedOrder.dispute?.description, "Gelen kupalarin 120 adedi kirik ve baskilari hatali cikti.");
testsPassed++;

// 13. Blocked User Restrictions
console.log("Test 13: Blocked User Restrictions");
db.blocks.add("blocked_biz_blocked_sup");
assert.throws(() => {
  const blockAgr: TeklifimAgreement = {
    id: "agr_blocked",
    agreementNumber: "ANL-2026-9999",
    requestId: "req_blk",
    requestTitle: "Bloke Islem",
    offerId: "off_blk",
    businessId: "blocked_biz",
    businessName: "Bloke Firma",
    supplierId: "blocked_sup",
    supplierName: "Bloke Tedarikci",
    productName: "Bloke Islem",
    category: "Genel",
    quantity: 10,
    unit: "Adet",
    unitPrice: 10,
    acceptedPrice: 100,
    totalPrice: 100,
    currency: "TRY",
    deliveryDays: 1,
    status: "agreement_reached",
    statusHistory: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.agreements.set(blockAgr.id, blockAgr);
  createOrderFromAgreementMock(blockAgr.id, "blocked_biz");
}, /Engellenmis kullanicilar arasinda/);
testsPassed++;

// 14. Multi-Tenant Isolation
console.log("Test 14: Multi-Tenant Isolation");
const bizOrders = getUserTeklifimOrdersMock(BIZ_ID);
assert.strictEqual(bizOrders.length, 3); // order1, order2, order3
const thirdPartyOrders = getUserTeklifimOrdersMock(THIRD_PARTY_ID);
assert.strictEqual(thirdPartyOrders.length, 0); // third party sees 0 orders
testsPassed++;

// 15. Repeat Order Cloning
console.log("Test 15: Repeat Order Cloning");
const repeatData = createRepeatOrderDataFromOrderMock(order1);
assert.strictEqual(repeatData.title, "1000 Adet Kraft Karton Bardak (Tekrar Siparis)");
assert.strictEqual(repeatData.category, "Ambalaj & Paketleme");
assert.strictEqual(repeatData.quantity, 1000);
assert.strictEqual(repeatData.unit, "Adet");
assert.strictEqual(repeatData.targetPrice, 2.5);
testsPassed++;

// 16. Notification Generation
console.log("Test 16: Notification Generation");
assert.ok(db.notifications.length >= 6);
const orderNotifs = db.notifications.filter((n) => n.title.includes("Siparis"));
assert.ok(orderNotifs.length >= 4);
testsPassed++;

// 17. Order Snapshot Integrity
console.log("Test 17: Order Snapshot Integrity");
// Simulate offer or request price mutation after order was established
testOffer.unitPrice = 99.9;
testOffer.totalPrice = 99900;
testRequest.quantity = 50000;

// Order values must remain completely unaltered
assert.strictEqual(order1.unitPrice, 2.5);
assert.strictEqual(order1.totalPrice, 2500);
assert.strictEqual(order1.quantity, 1000);
assert.strictEqual(order1.items[0].unitPrice, 2.5);
assert.strictEqual(order1.items[0].totalPrice, 2500);
testsPassed++;

// 18. Admin Authorization & Dispute Resolution
console.log("Test 18: Admin Authorization & Dispute Resolution");
const allOrders = getAllTeklifimOrdersForAdminMock();
assert.strictEqual(allOrders.length >= 3, true);

const resolvedDispute = resolveTeklifimOrderDisputeMock(order3.id, ADMIN_ID, {
  outcome: "preparing",
  notes: "Tedarikci kirik 120 adedi tekrar ureterek sevkiyata hazirlayacak.",
});
assert.strictEqual(resolvedDispute.status, "preparing");
assert.strictEqual(resolvedDispute.dispute?.resolvedBy, ADMIN_ID);
assert.strictEqual(resolvedDispute.dispute?.resolutionNotes, "Tedarikci kirik 120 adedi tekrar ureterek sevkiyata hazirlayacak.");

// Dynamic status signal checks
const signal1 = computeDeliveryStatusMock(order1);
assert.strictEqual(signal1.label, "Teslim Edildi");
assert.strictEqual(signal1.isDelayed, false);

const delayedOrder: TeklifimOrder = {
  ...order3,
  expectedDeliveryDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
};
const signalDelayed = computeDeliveryStatusMock(delayedOrder);
assert.strictEqual(signalDelayed.isDelayed, true);
assert.strictEqual(signalDelayed.delayDays, 3);
assert.ok(signalDelayed.label.includes("3 gun gecikti"));
testsPassed++;

console.log("===============================================================");
console.log(`>> [SUCCESS] Tum ${testsPassed} Faz 5 Test Senaryosu Eksiksiz Gecti!`);
console.log("===============================================================");
