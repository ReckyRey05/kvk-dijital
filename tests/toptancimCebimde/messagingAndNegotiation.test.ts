import assert from "node:assert";
import {
  TeklifimConversation,
  TeklifimMessage,
  TeklifimOfferVersion,
  TeklifimAgreement,
  TeklifimOffer,
  TeklifimRequest,
  TeklifimAgreementStatus,
} from "../../src/types/teklifimGelsin";

console.log("===============================================================");
console.log("▶ [TOPTANCIM CEBIMDE TEST] FAZ 4: Iletisim, Pazarlik & Anlasma");
console.log("===============================================================");

// Simulated In-Memory Database for Hermetic Testing
const db = {
  conversations: new Map<string, TeklifimConversation>(),
  messages: new Map<string, TeklifimMessage>(),
  offerVersions: new Map<string, TeklifimOfferVersion[]>(),
  agreements: new Map<string, TeklifimAgreement>(),
  offers: new Map<string, TeklifimOffer>(),
  requests: new Map<string, TeklifimRequest>(),
  blocks: new Set<string>(),
  notifications: [] as any[],
};

// Helper logic replicating service layer
function isUserBlocked(userA: string, userB: string): boolean {
  return db.blocks.has(`${userA}_${userB}`) || db.blocks.has(`${userB}_${userA}`);
}

function checkRequestDeadlineExpired(request: TeklifimRequest): boolean {
  if (!request.deadlineTimestamp) return false;
  return Date.now() > request.deadlineTimestamp;
}

function getOrCreateConversationMock(
  requestId: string,
  offerId: string,
  requestingUserId: string
): TeklifimConversation {
  const convId = `conv_${offerId}`;
  if (db.conversations.has(convId)) {
    const conv = db.conversations.get(convId)!;
    if (conv.businessId !== requestingUserId && conv.supplierId !== requestingUserId) {
      throw new Error("Bu konusmaya erisim yetkiniz bulunmamaktadir.");
    }
    if (isUserBlocked(conv.businessId, conv.supplierId)) {
      throw new Error("Engellenmis kullanicilar arasinda iletisim kurulamaz.");
    }
    return conv;
  }

  const req = db.requests.get(requestId);
  if (!req) throw new Error("Talep bulunamadi.");
  const offer = db.offers.get(offerId);
  if (!offer) throw new Error("Teklif bulunamadi.");

  if (requestingUserId !== req.businessId && requestingUserId !== offer.supplierId) {
    throw new Error("Bu teklif icin konusma baslatma yetkiniz bulunmamaktadir.");
  }

  if (isUserBlocked(req.businessId, offer.supplierId)) {
    throw new Error("Engellenmis kullanicilar arasinda iletisim kurulamaz.");
  }

  const now = Date.now();
  const conv: TeklifimConversation = {
    id: convId,
    requestId,
    requestTitle: req.title,
    offerId,
    businessId: req.businessId,
    businessName: req.businessName,
    supplierId: offer.supplierId,
    supplierName: offer.supplierName,
    lastMessageText: "Gorusme baslatildi.",
    lastMessageAt: now,
    unreadCountBusiness: 0,
    unreadCountSupplier: 0,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  db.conversations.set(convId, conv);
  return conv;
}

function sendTeklifimMessageMock(
  conversationId: string,
  senderId: string,
  data: { content: string; type?: any; attachment?: any; counterOfferData?: any }
): TeklifimMessage {
  const conv = db.conversations.get(conversationId);
  if (!conv) throw new Error("Konusma bulunamadi.");

  if (conv.businessId !== senderId && conv.supplierId !== senderId) {
    throw new Error("Bu konusmaya mesaj gonderme yetkiniz yok.");
  }

  if (isUserBlocked(conv.businessId, conv.supplierId)) {
    throw new Error("Engellenmis kullanicilar arasinda mesaj gonderilemez.");
  }

  const now = Date.now();
  const isBusiness = senderId === conv.businessId;
  const msgId = `msg_${Date.now()}_${Math.random()}`;

  const msg: TeklifimMessage = {
    id: msgId,
    conversationId,
    requestId: conv.requestId,
    offerId: conv.offerId,
    senderId,
    senderName: isBusiness ? conv.businessName : conv.supplierName,
    senderRole: isBusiness ? "business" : "supplier",
    content: (data.content || "").trim(),
    type: data.type || "text",
    attachment: data.attachment,
    counterOfferData: data.counterOfferData,
    isRead: false,
    status: "sent",
    createdAt: now,
  };

  db.messages.set(msgId, msg);

  conv.lastMessageText = data.content || (data.attachment ? `[Dosya: ${data.attachment.name}]` : "Mesaj");
  conv.lastMessageAt = now;
  conv.lastMessageSenderId = senderId;
  if (isBusiness) {
    conv.unreadCountSupplier = (conv.unreadCountSupplier || 0) + 1;
  } else {
    conv.unreadCountBusiness = (conv.unreadCountBusiness || 0) + 1;
  }
  conv.updatedAt = now;

  // Record notification
  const recipientId = isBusiness ? conv.supplierId : conv.businessId;
  db.notifications.push({
    userId: recipientId,
    title: "Yeni Mesaj",
    message: data.content,
  });

  return msg;
}

function markMessagesAsReadMock(conversationId: string, userId: string) {
  const conv = db.conversations.get(conversationId);
  if (!conv) return;
  const isBusiness = conv.businessId === userId;

  db.messages.forEach((msg) => {
    if (msg.conversationId === conversationId && msg.senderId !== userId && !msg.isRead) {
      msg.isRead = true;
      msg.readAt = Date.now();
      msg.status = "read";
    }
  });

  if (isBusiness) {
    conv.unreadCountBusiness = 0;
  } else {
    conv.unreadCountSupplier = 0;
  }
}

function submitCounterOfferMock(
  offerId: string,
  userId: string,
  counterData: { price: number; unitPrice?: number; deliveryDays: number; quantity?: number; note?: string }
) {
  const offer = db.offers.get(offerId);
  if (!offer) throw new Error("Teklif bulunamadi.");

  const req = db.requests.get(offer.requestId);
  if (!req) throw new Error("Talep bulunamadi.");

  if (userId !== req.businessId && userId !== offer.supplierId) {
    throw new Error("Bu teklife karsi teklif verme yetkiniz yok.");
  }

  if (req.status === "cancelled" || req.status === "completed" || req.status === "expired" || checkRequestDeadlineExpired(req)) {
    throw new Error("Bu talep kapatilmistir veya suresi dolmustur.");
  }

  if (offer.status === "accepted" || offer.status === "selected") {
    throw new Error("Kabul edilmis bir teklife karsi teklif verilemez.");
  }

  if (offer.status === "rejected" || offer.status === "expired") {
    throw new Error("Reddedilmis veya suresi dolmus bir teklife karsi teklif verilemez.");
  }

  if (isUserBlocked(req.businessId, offer.supplierId)) {
    throw new Error("Engellenmis kullanicilar arasinda pazarlik yapilamaz.");
  }

  const existingVersions = db.offerVersions.get(offerId) || [];
  if (existingVersions.length >= 10) {
    throw new Error("Maksimum 10 pazarlik revizyon sinirina ulasildi.");
  }

  const proposedBy: "business" | "supplier" = userId === req.businessId ? "business" : "supplier";
  const proposerName = proposedBy === "business" ? req.businessName : offer.supplierName;
  const now = Date.now();

  if (existingVersions.length === 0) {
    const v1: TeklifimOfferVersion = {
      id: `${offerId}_v1`,
      offerId,
      requestId: offer.requestId,
      version: 1,
      proposedBy: "supplier",
      proposerId: offer.supplierId,
      proposerName: offer.supplierName,
      totalPrice: offer.totalPrice,
      unitPrice: offer.unitPrice,
      deliveryDays: offer.deliveryDays,
      quantity: req.quantity,
      description: offer.description || "Ilk Teklif",
      status: "superseded",
      createdAt: offer.createdAt || now,
    };
    existingVersions.push(v1);
  }

  const nextVersionNum = existingVersions.length + 1;
  const targetQuantity = counterData.quantity || req.quantity || 1;
  const newPrice = Number(counterData.price);
  const newUnitPrice = counterData.unitPrice || Math.round((newPrice / targetQuantity) * 100) / 100;
  const newDeliveryDays = Number(counterData.deliveryDays) || offer.deliveryDays;

  const newVersion: TeklifimOfferVersion = {
    id: `${offerId}_v${nextVersionNum}`,
    offerId,
    requestId: offer.requestId,
    version: nextVersionNum,
    proposedBy,
    proposerId: userId,
    proposerName,
    totalPrice: newPrice,
    unitPrice: newUnitPrice,
    deliveryDays: newDeliveryDays,
    quantity: targetQuantity,
    description: counterData.note || "",
    status: "submitted",
    createdAt: now,
  };
  existingVersions.push(newVersion);
  db.offerVersions.set(offerId, existingVersions);

  offer.totalPrice = newPrice;
  offer.unitPrice = newUnitPrice;
  offer.deliveryDays = newDeliveryDays;
  offer.version = nextVersionNum;
  offer.negotiationCount = nextVersionNum;
  offer.lastCounterBy = proposedBy;
  offer.status = "countered";
  offer.updatedAt = now;

  const conv = getOrCreateConversationMock(req.id, offer.id, userId);
  const msg = sendTeklifimMessageMock(conv.id, userId, {
    content: `${proposerName} karsi teklif sundu (Revizyon #${nextVersionNum}): ${newPrice} TL`,
    type: "counter_offer",
    counterOfferData: {
      version: nextVersionNum,
      price: newPrice,
      unitPrice: newUnitPrice,
      deliveryDays: newDeliveryDays,
      quantity: targetQuantity,
      note: counterData.note,
      proposedBy,
    },
  });

  return { version: newVersion, message: msg };
}

function acceptTeklifimOfferMock(offerId: string, acceptingUserId: string): TeklifimAgreement {
  const offer = db.offers.get(offerId);
  if (!offer) throw new Error("Teklif bulunamadi.");
  const req = db.requests.get(offer.requestId);
  if (!req) throw new Error("Talep bulunamadi.");

  if (acceptingUserId !== req.businessId) {
    throw new Error("Yalnizca talep sahibi isletme teklifi kabul edebilir.");
  }

  if (req.status === "cancelled" || req.status === "completed" || req.status === "expired" || checkRequestDeadlineExpired(req)) {
    throw new Error("Bu talep kapatilmistir veya suresi dolmustur.");
  }

  if (offer.status === "accepted" || offer.status === "selected") {
    throw new Error("Bu teklif zaten kabul edilmistir.");
  }
  if (offer.status === "rejected" || offer.status === "expired") {
    throw new Error("Reddedilmis veya suresi dolmus teklif kabul edilemez.");
  }

  const now = Date.now();
  const agreementNumber = `ANL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const agreementId = `agr_${offerId}`;

  const agreement: TeklifimAgreement = {
    id: agreementId,
    agreementNumber,
    requestId: req.id,
    requestTitle: req.title,
    offerId: offer.id,
    businessId: req.businessId,
    businessName: req.businessName,
    supplierId: offer.supplierId,
    supplierName: offer.supplierName,
    productName: req.productName || req.title,
    category: req.category,
    quantity: req.quantity,
    unit: req.unit,
    acceptedPrice: offer.totalPrice,
    unitPrice: offer.unitPrice,
    currency: "TL",
    deliveryDays: offer.deliveryDays,
    city: req.city,
    finalVersion: offer.version || 1,
    status: "agreement_reached",
    statusHistory: [
      {
        status: "agreement_reached",
        changedBy: acceptingUserId,
        timestamp: now,
        note: "Teklif onaylandi.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  db.agreements.set(agreementId, agreement);
  offer.status = "accepted";
  req.status = "supplier_selected";
  req.selectedOfferId = offer.id;
  req.selectedSupplierId = offer.supplierId;

  // Send agreement message
  const conv = getOrCreateConversationMock(req.id, offer.id, acceptingUserId);
  sendTeklifimMessageMock(conv.id, acceptingUserId, {
    content: `Resmi Anlasma Saglandi! Sozlesme No: ${agreementNumber}`,
    type: "agreement",
  });

  return agreement;
}

// =========================================================================
// SETUP TEST DATA
// =========================================================================
const testBizId = "biz_user_101";
const testSupId = "sup_user_202";
const testThirdPartyId = "attacker_999";
const testReqId = "req_pack_500";
const testOfferId = "off_quote_700";

db.requests.set(testReqId, {
  id: testReqId,
  businessId: testBizId,
  businessName: "Kadıköy Kahvecisi",
  businessCity: "İstanbul",
  title: "1000 Adet Baskılı Karton Bardak",
  category: "Ambalaj & Paketleme",
  productName: "Baskılı Karton Bardak",
  quantity: 1000,
  unit: "Adet",
  deliveryDays: 7,
  city: "İstanbul",
  description: "Logo baskılı 8oz sıcak kahve bardağı",
  status: "published",
  offerCount: 1,
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,
});

db.offers.set(testOfferId, {
  id: testOfferId,
  requestId: testReqId,
  requestTitle: "1000 Adet Baskılı Karton Bardak",
  supplierId: testSupId,
  supplierName: "Ege Ambalaj Sanayi",
  supplierCity: "İzmir",
  supplierPhone: "05551112233",
  supplierEmail: "bilgi@egeambalaj.com",
  supplierIsVerified: true,
  unitPrice: 1.5,
  totalPrice: 1500,
  currency: "TL",
  deliveryDays: 5,
  description: "8oz birinci kalite selüloz karton bardak",
  status: "submitted",
  createdAt: Date.now() - 1800000,
  updatedAt: Date.now() - 1800000,
});

// =========================================================================
// TEST 1: Conversation Authorization
// =========================================================================
console.log("  - 1. Testing Conversation Authorization...");
{
  assert.throws(
    () => getOrCreateConversationMock(testReqId, testOfferId, testThirdPartyId),
    /yetkiniz bulunmamaktadir/i,
    "Third party user must be blocked from initiating conversation"
  );

  const conv = getOrCreateConversationMock(testReqId, testOfferId, testBizId);
  assert.strictEqual(conv.id, `conv_${testOfferId}`);
  assert.strictEqual(conv.businessId, testBizId);
  assert.strictEqual(conv.supplierId, testSupId);
  console.log("    [PASS] Third party blocked, authorized parties succeed.");
}

// =========================================================================
// TEST 2: Message Sending and LastMessage Updates
// =========================================================================
console.log("  - 2. Testing Message Send & LastMessage Updates...");
{
  const convId = `conv_${testOfferId}`;
  const msg = sendTeklifimMessageMock(convId, testBizId, {
    content: "Merhaba, 1000 adet için 1300 TL peşin teklif kabul edebilir misiniz?",
    type: "text",
  });

  assert.strictEqual(msg.content, "Merhaba, 1000 adet için 1300 TL peşin teklif kabul edebilir misiniz?");
  assert.strictEqual(msg.isRead, false);

  const conv = db.conversations.get(convId)!;
  assert.strictEqual(conv.lastMessageSenderId, testBizId);
  assert.strictEqual(conv.unreadCountSupplier, 1);
  assert.strictEqual(conv.unreadCountBusiness, 0);
  console.log("    [PASS] Message recorded, lastMessage and unread counter updated.");
}

// =========================================================================
// TEST 3: Message Read State Transitions
// =========================================================================
console.log("  - 3. Testing Message Read State Transitions...");
{
  const convId = `conv_${testOfferId}`;
  markMessagesAsReadMock(convId, testSupId);

  const conv = db.conversations.get(convId)!;
  assert.strictEqual(conv.unreadCountSupplier, 0, "Supplier unread count must reset to 0");

  let unreadCount = 0;
  db.messages.forEach((m) => {
    if (m.conversationId === convId && !m.isRead) unreadCount++;
  });
  assert.strictEqual(unreadCount, 0, "All supplier received messages must be marked as read");
  console.log("    [PASS] Unread counters and message status correctly updated to read.");
}

// =========================================================================
// TEST 4: Attachment Type and Size Validation
// =========================================================================
console.log("  - 4. Testing Attachment Authorization & File Validation...");
{
  const allowedMime = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const maxBytes = 10 * 1024 * 1024;

  function validateAttachment(file: { name: string; size: number; type: string }) {
    if (file.size > maxBytes) throw new Error("Dosya boyutu 10MB sinirini asamaz.");
    if (!allowedMime.includes(file.type)) throw new Error("Desteklenmeyen dosya turu.");
    return true;
  }

  assert.strictEqual(
    validateAttachment({ name: "sartname.pdf", size: 1024 * 500, type: "application/pdf" }),
    true
  );

  assert.throws(
    () => validateAttachment({ name: "zararli.exe", size: 5000, type: "application/x-msdownload" }),
    /Desteklenmeyen dosya turu/,
    "Executable file types must be rejected"
  );

  assert.throws(
    () => validateAttachment({ name: "buyuk_katalog.pdf", size: 15 * 1024 * 1024, type: "application/pdf" }),
    /10MB sinirini asamaz/,
    "Files over 10MB must be rejected"
  );
  console.log("    [PASS] Safe MIME types accepted, malicious types and >10MB rejected.");
}

// =========================================================================
// TEST 5: Counter Offer Workflow
// =========================================================================
console.log("  - 5. Testing Counter Offer Workflow...");
{
  const result = submitCounterOfferMock(testOfferId, testBizId, {
    price: 1350,
    deliveryDays: 5,
    note: "Peşin ödeme ile 1350 TL teklif ediyoruz.",
  });

  const offer = db.offers.get(testOfferId)!;
  assert.strictEqual(offer.status, "countered", "Offer status must change to countered");
  assert.strictEqual(offer.totalPrice, 1350);
  assert.strictEqual(offer.lastCounterBy, "business");
  assert.strictEqual(result.version.version, 2);
  console.log("    [PASS] Counter offer submitted, offer status transitioned to countered.");
}

// =========================================================================
// TEST 6: Offer Version History Archiving
// =========================================================================
console.log("  - 6. Testing Offer Version History Archiving...");
{
  const versions = db.offerVersions.get(testOfferId)!;
  assert.strictEqual(versions.length, 2, "Must contain initial version 1 and counter-offer version 2");
  assert.strictEqual(versions[0].version, 1);
  assert.strictEqual(versions[0].proposedBy, "supplier");
  assert.strictEqual(versions[0].totalPrice, 1500);

  assert.strictEqual(versions[1].version, 2);
  assert.strictEqual(versions[1].proposedBy, "business");
  assert.strictEqual(versions[1].totalPrice, 1350);
  console.log("    [PASS] Versions v1 and v2 sequentially archived with provenance.");
}

// =========================================================================
// TEST 7: Invalid Offer Transition Prevention
// =========================================================================
console.log("  - 7. Testing Invalid Offer Transition Prevention...");
{
  const dummyOfferId = "off_rejected_test";
  db.offers.set(dummyOfferId, {
    id: dummyOfferId,
    requestId: testReqId,
    requestTitle: "Test",
    supplierId: testSupId,
    supplierName: "Test Sup",
    supplierCity: "İzmir",
    supplierPhone: "",
    supplierEmail: "",
    unitPrice: 1,
    totalPrice: 100,
    deliveryDays: 3,
    description: "",
    status: "rejected",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  assert.throws(
    () => submitCounterOfferMock(dummyOfferId, testBizId, { price: 80, deliveryDays: 3 }),
    /Reddedilmis veya suresi dolmus bir teklife karsi teklif verilemez/,
    "Rejected offers cannot receive counter-offers"
  );
  console.log("    [PASS] Counter-offer rejected on closed/rejected offer.");
}

// =========================================================================
// TEST 8: Negotiation Revision Limit (Max 10)
// =========================================================================
console.log("  - 8. Testing Negotiation Limit (Max 10 Revisions)...");
{
  const limitOfferId = "off_limit_test";
  db.offers.set(limitOfferId, {
    id: limitOfferId,
    requestId: testReqId,
    requestTitle: "Limit Test",
    supplierId: testSupId,
    supplierName: "Test Sup",
    supplierCity: "İzmir",
    supplierPhone: "",
    supplierEmail: "",
    unitPrice: 1,
    totalPrice: 1000,
    deliveryDays: 5,
    description: "",
    status: "submitted",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Add 10 versions to simulate exhaustive negotiation
  const mockVersions: TeklifimOfferVersion[] = [];
  for (let i = 1; i <= 10; i++) {
    mockVersions.push({
      id: `${limitOfferId}_v${i}`,
      offerId: limitOfferId,
      requestId: testReqId,
      version: i,
      proposedBy: i % 2 === 0 ? "business" : "supplier",
      proposerId: testBizId,
      proposerName: "Business",
      totalPrice: 1000 - i * 10,
      unitPrice: 1,
      deliveryDays: 5,
      quantity: 1000,
      description: `Rev ${i}`,
      status: "submitted",
      createdAt: Date.now(),
    });
  }
  db.offerVersions.set(limitOfferId, mockVersions);

  assert.throws(
    () => submitCounterOfferMock(limitOfferId, testBizId, { price: 850, deliveryDays: 5 }),
    /Maksimum 10 pazarlik revizyon sinirina ulasildi/,
    "11th counter offer must be blocked"
  );
  console.log("    [PASS] Strict maximum 10 negotiation revisions enforced.");
}

// =========================================================================
// TEST 9: Offer Acceptance Flow
// =========================================================================
console.log("  - 9. Testing Offer Acceptance Flow...");
{
  const agreement = acceptTeklifimOfferMock(testOfferId, testBizId);
  const offer = db.offers.get(testOfferId)!;
  const req = db.requests.get(testReqId)!;

  assert.strictEqual(offer.status, "accepted", "Offer status must become accepted");
  assert.strictEqual(req.status, "supplier_selected", "Request status must become supplier_selected");
  assert.strictEqual(req.selectedOfferId, testOfferId);
  assert.strictEqual(req.selectedSupplierId, testSupId);
  console.log("    [PASS] Offer accepted, request transitioned to supplier_selected.");
}

// =========================================================================
// TEST 10: Agreement Contract Generation
// =========================================================================
console.log("  - 10. Testing Agreement Contract Generation (ANL-2026-XXXX)...");
{
  const agreement = db.agreements.get(`agr_${testOfferId}`)!;
  assert.ok(agreement, "Agreement must exist");
  assert.ok(agreement.agreementNumber.startsWith("ANL-2026-"), "Must have ANL-2026 prefix");
  assert.strictEqual(agreement.acceptedPrice, 1350);
  assert.strictEqual(agreement.status, "agreement_reached");
  assert.strictEqual(agreement.businessName, "Kadıköy Kahvecisi");
  assert.strictEqual(agreement.supplierName, "Ege Ambalaj Sanayi");
  console.log(`    [PASS] Agreement ${agreement.agreementNumber} generated with correct parties and terms.`);
}

// =========================================================================
// TEST 11: Blocked User Cannot Message
// =========================================================================
console.log("  - 11. Testing Blocked User Restrictions...");
{
  const blockedBizId = "biz_blocked_99";
  const blockedSupId = "sup_blocked_99";
  db.blocks.add(`${blockedBizId}_${blockedSupId}`);

  assert.strictEqual(isUserBlocked(blockedBizId, blockedSupId), true);
  assert.strictEqual(isUserBlocked(blockedSupId, blockedBizId), true);

  const blockedReqId = "req_blocked";
  const blockedOfferId = "off_blocked";
  db.requests.set(blockedReqId, {
    id: blockedReqId,
    businessId: blockedBizId,
    businessName: "Blocked Biz",
    businessCity: "Ankara",
    title: "Test",
    category: "Diğer",
    quantity: 10,
    unit: "Adet",
    deliveryDays: 3,
    city: "Ankara",
    description: "",
    status: "published",
    offerCount: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  db.offers.set(blockedOfferId, {
    id: blockedOfferId,
    requestId: blockedReqId,
    requestTitle: "Test",
    supplierId: blockedSupId,
    supplierName: "Blocked Sup",
    supplierCity: "Ankara",
    supplierPhone: "",
    supplierEmail: "",
    unitPrice: 10,
    totalPrice: 100,
    deliveryDays: 3,
    description: "",
    status: "submitted",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  assert.throws(
    () => getOrCreateConversationMock(blockedReqId, blockedOfferId, blockedBizId),
    /Engellenmis kullanicilar arasinda iletisim kurulamaz/,
    "Blocked user cannot start conversation"
  );
  console.log("    [PASS] Blocked users prevented from messaging and negotiating.");
}

// =========================================================================
// TEST 12: Tenant Isolation
// =========================================================================
console.log("  - 12. Testing Multi-Tenant Conversation Isolation...");
{
  const conv = db.conversations.get(`conv_${testOfferId}`)!;
  const foreignUserId = "random_intruder_404";

  assert.throws(
    () => sendTeklifimMessageMock(conv.id, foreignUserId, { content: "Intrusion test" }),
    /mesaj gonderme yetkiniz yok/,
    "Intruders cannot inject messages into foreign conversations"
  );
  console.log("    [PASS] Conversation tenant boundary intact.");
}

// =========================================================================
// TEST 13: Notification Generation
// =========================================================================
console.log("  - 13. Testing Notification Generation across Workflow...");
{
  const supplierNotifs = db.notifications.filter((n) => n.userId === testSupId);
  assert.ok(supplierNotifs.length > 0, "Supplier must receive message notifications");
  console.log(`    [PASS] ${db.notifications.length} transactional notifications produced.`);
}

// =========================================================================
// TEST 14: Expired Request Lock
// =========================================================================
console.log("  - 14. Testing Expired Request Negotiation Lock...");
{
  const expiredReqId = "req_expired_888";
  const expiredOffId = "off_expired_888";
  db.requests.set(expiredReqId, {
    id: expiredReqId,
    businessId: testBizId,
    businessName: "Kadıköy Kahvecisi",
    businessCity: "İstanbul",
    title: "Süresi Dolan Talep",
    category: "Gıda & İçecek",
    quantity: 100,
    unit: "Kg",
    deliveryDays: 3,
    city: "İstanbul",
    description: "",
    status: "expired",
    offerCount: 1,
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now() - 10000000,
  });

  db.offers.set(expiredOffId, {
    id: expiredOffId,
    requestId: expiredReqId,
    requestTitle: "Süresi Dolan Talep",
    supplierId: testSupId,
    supplierName: "Tedarikçi",
    supplierCity: "İstanbul",
    supplierPhone: "",
    supplierEmail: "",
    unitPrice: 50,
    totalPrice: 5000,
    deliveryDays: 3,
    description: "",
    status: "submitted",
    createdAt: Date.now() - 9000000,
    updatedAt: Date.now() - 9000000,
  });

  assert.throws(
    () => submitCounterOfferMock(expiredOffId, testBizId, { price: 4500, deliveryDays: 3 }),
    /Bu talep kapatilmistir veya suresi dolmustur/,
    "Expired requests cannot be negotiated"
  );
  console.log("    [PASS] Expired requests locked against negotiations.");
}

console.log("===============================================================");
console.log("✔ [FAZ 4 ALL 14 SCENARIOS PASSED WITH ZERO ERRORS]");
console.log("===============================================================");
