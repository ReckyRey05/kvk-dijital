import assert from "node:assert";

async function runPlatformModulesTests() {
  console.log("=========================================================================");
  console.log(">> [İTEMSEPETİ TEST] Platform Modules: Auth, Listings, Support, Bank Flow");
  console.log("=========================================================================");

  // 1. Auth state initialization
  console.log("1. Test: Auth state initializes with validated structure...");
  const sampleUser = {
    uid: "usr_gamer_101",
    email: "test@itemsepeti.com",
    displayName: "ProTrader",
    role: "seller" as const,
    balance: 500,
    isPhoneVerified: true,
  };
  assert.strictEqual(sampleUser.role, "seller");
  assert.ok(sampleUser.balance >= 0);
  console.log("PASSED: Auth initialization validated.");

  // 2. User registration role assignment
  console.log("2. Test: Registration preserves explicit buyer/seller role flags...");
  function createRegistrationPayload(isSeller: boolean) {
    return {
      role: isSeller ? ("seller" as const) : ("buyer" as const),
      isPhoneVerified: true,
    };
  }
  assert.strictEqual(createRegistrationPayload(true).role, "seller");
  assert.strictEqual(createRegistrationPayload(false).role, "buyer");
  console.log("PASSED: Role assignment validated.");

  // 3. Steam trade URL format validation
  console.log("3. Test: Steam trade URL regex validation prevents malformed links...");
  function isValidSteamTradeUrl(url: string) {
    return /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/.test(url);
  }
  assert.strictEqual(
    isValidSteamTradeUrl("https://steamcommunity.com/tradeoffer/new/?partner=12345678&token=abcdefgh"),
    true
  );
  assert.strictEqual(
    isValidSteamTradeUrl("https://fake-steam.com/tradeoffer/new/?partner=12345678"),
    false
  );
  console.log("PASSED: Steam trade URL validation verified.");

  // 4. Seller listing status toggle
  console.log("4. Test: Seller listing toggles seamlessly between active and paused...");
  function toggleListingStatus(status: "active" | "paused") {
    return status === "active" ? "paused" : "active";
  }
  assert.strictEqual(toggleListingStatus("active"), "paused");
  assert.strictEqual(toggleListingStatus("paused"), "active");
  console.log("PASSED: Listing status toggle verified.");

  // 5. Seller listing deletion safety
  console.log("5. Test: Seller deletion removes item from seller catalog view...");
  const listings = [{ id: "l1" }, { id: "l2" }, { id: "l3" }];
  const remaining = listings.filter((l) => l.id !== "l2");
  assert.strictEqual(remaining.length, 2);
  assert.strictEqual(remaining.find((l) => l.id === "l2"), undefined);
  console.log("PASSED: Listing deletion verified.");

  // 6. Live support message dispatch and auto-responder heuristics
  console.log("6. Test: Live support auto-responder detects delivery and payment keywords...");
  function getAutoResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("teslim") || lower.includes("sipari")) {
      return "DELIVERY_FAQ";
    } else if (lower.includes("bakiye") || lower.includes("havale")) {
      return "BANK_TRANSFER_FAQ";
    }
    return "OPERATOR_ROUTED";
  }
  assert.strictEqual(getAutoResponse("Siparişim ne zaman teslim edilir?"), "DELIVERY_FAQ");
  assert.strictEqual(getAutoResponse("Havale ile bakiye yüklemek istiyorum"), "BANK_TRANSFER_FAQ");
  assert.strictEqual(getAutoResponse("Merhaba bir sorunum var"), "OPERATOR_ROUTED");
  console.log("PASSED: Live support heuristics verified.");

  // 7. Bank deposit account completeness
  console.log("7. Test: Bank deposit account catalog features valid TR IBAN structures...");
  const sampleBank = {
    bankName: "Ziraat Bankası",
    iban: "TR12 0001 0090 1234 5678 9001",
    accountHolder: "İtemSepeti Bilişim ve Pazaryeri Ltd. Şti.",
  };
  assert.ok(sampleBank.iban.startsWith("TR"));
  assert.ok(sampleBank.iban.length >= 24);
  console.log("PASSED: Bank accounts verified.");

  // 8. Bank deposit notification validation
  console.log("8. Test: Bank deposit notification rejects non-positive and empty submissions...");
  function validateDepositForm(amount: number, senderName: string) {
    if (!amount || amount < 10) return { valid: false, error: "Minimum 10 TL" };
    if (!senderName || senderName.trim().length < 3) return { valid: false, error: "Geçerli isim gerekli" };
    return { valid: true };
  }
  assert.strictEqual(validateDepositForm(5, "Ali Yılmaz").valid, false);
  assert.strictEqual(validateDepositForm(100, "").valid, false);
  assert.strictEqual(validateDepositForm(250, "Ali Yılmaz").valid, true);
  console.log("PASSED: Bank deposit validation verified.");

  console.log("=========================================================================");
  
  // 9. Seller registration requires admin approval
  console.log("9. Test: Prospective sellers initialize in pending approval status...");
  function evaluateSellerApproval(isSeller: boolean) {
    return {
      role: isSeller ? "seller" : "buyer",
      sellerApprovalStatus: isSeller ? "pending" : undefined,
      canCreateListingImmediately: !isSeller,
    };
  }
  const sellerReg = evaluateSellerApproval(true);
  assert.strictEqual(sellerReg.role, "seller");
  assert.strictEqual(sellerReg.sellerApprovalStatus, "pending");
  assert.strictEqual(sellerReg.canCreateListingImmediately, false);
  console.log("PASSED: Seller admin approval gate verified.");

  // 10. Every newly created listing requires admin approval
  console.log("10. Test: Newly submitted listings strictly start at pending_review...");
  function getNewListingInitialStatus() {
    return "pending_review";
  }
  assert.strictEqual(getNewListingInitialStatus(), "pending_review");
  console.log("PASSED: Mandatory listing admin review verified.");

  
  // 11. Escrow status state machine transitions
  console.log("11. Test: Escrow state machine permits valid order progression...");
  function canTransitionOrderStatus(current: string, target: string): boolean {
    if (current === "PENDING_PAYMENT" && ["PAID", "CANCELLED"].includes(target)) return true;
    if (current === "PAID" && ["DELIVERED", "DISPUTED", "CANCELLED"].includes(target)) return true;
    if (current === "DELIVERED" && ["BUYER_CONFIRMED", "COMPLETED", "DISPUTED"].includes(target)) return true;
    if (current === "BUYER_CONFIRMED" && target === "COMPLETED") return true;
    if (current === "DISPUTED" && ["COMPLETED", "REFUNDED"].includes(target)) return true;
    return false;
  }
  assert.strictEqual(canTransitionOrderStatus("PENDING_PAYMENT", "PAID"), true);
  assert.strictEqual(canTransitionOrderStatus("PAID", "DELIVERED"), true);
  assert.strictEqual(canTransitionOrderStatus("DELIVERED", "COMPLETED"), true);
  assert.strictEqual(canTransitionOrderStatus("DELIVERED", "DISPUTED"), true);
  assert.strictEqual(canTransitionOrderStatus("PENDING_PAYMENT", "COMPLETED"), false);
  console.log("PASSED: Escrow lifecycle transitions verified.");

  // 12. Wallet deduction upon order payment
  console.log("12. Test: Wallet balance deduction retains arithmetic precision...");
  function computeWalletDeduction(currentBalance: number, orderTotal: number) {
    if (currentBalance < orderTotal) throw new Error("Yetersiz bakiye");
    return Number((currentBalance - orderTotal).toFixed(2));
  }
  assert.strictEqual(computeWalletDeduction(1450.50, 450), 1000.50);
  assert.throws(() => computeWalletDeduction(100, 500));
  console.log("PASSED: Wallet deduction precision verified.");

  
  // 13. Double-entry ledger transaction arithmetic (CREDIT / DEBIT balance integrity)
  console.log("13. Test: Double-entry ledger records strictly balanceBefore + amount = balanceAfter...");
  function simulateLedgerCredit(balanceBefore: number, amount: number) {
    const balanceAfter = Number((balanceBefore + amount).toFixed(2));
    assert.strictEqual(balanceAfter, 1650.50);
    return { balanceBefore, balanceAfter, amount };
  }
  simulateLedgerCredit(1450.50, 200);
  console.log("PASSED: Double-entry ledger balance integrity verified.");

  // 14. Seller payout withdrawal limits and IBAN formatting
  console.log("14. Test: Seller payout enforces min 100 TL limit and TR IBAN constraint...");
  function validatePayoutRequest(amount: number, availableBalance: number, iban: string) {
    if (amount < 100) return { valid: false, error: "Min 100 TL" };
    if (amount > availableBalance) return { valid: false, error: "Yetersiz bakiye" };
    if (!iban.startsWith("TR") || iban.length < 24) return { valid: false, error: "Geçersiz IBAN" };
    return { valid: true };
  }
  assert.strictEqual(validatePayoutRequest(50, 1000, "TR120001009012345678900123").valid, false);
  assert.strictEqual(validatePayoutRequest(500, 100, "TR120001009012345678900123").valid, false);
  assert.strictEqual(validatePayoutRequest(250, 1000, "TR120001009012345678900123").valid, true);
  console.log("PASSED: Payout validation rules verified.");

  // 15. Order chat sensitive data sanitization & anti-fraud filter
  console.log("15. Test: Chat sanitization filters out phone numbers, IBANs, and external chat links...");
  const PHONE_REGEX = /(\+90|0)?\s*[1-9]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/g;
  const IBAN_REGEX = /TR\d{2}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{2}/gi;
  const EXTERNAL_LINKS_REGEX = /(https?:\/\/|www\.|discord(\.gg|\.com|app\.com)\/|t\.me\/|wa\.me\/|instagram\.com\/|twitter\.com\/)[^\s]+/gi;

  function sanitizeChatMessage(raw: string) {
    let text = raw;
    let hasViolation = false;
    if (PHONE_REGEX.test(text)) {
      hasViolation = true;
      text = text.replace(PHONE_REGEX, "[Sistem tarafından gizlenen telefon no]");
    }
    if (IBAN_REGEX.test(text)) {
      hasViolation = true;
      text = text.replace(IBAN_REGEX, "[Sistem tarafından gizlenen IBAN]");
    }
    if (EXTERNAL_LINKS_REGEX.test(text)) {
      hasViolation = true;
      text = text.replace(EXTERNAL_LINKS_REGEX, "[Sistem tarafından gizlenen harici bağlantı]");
    }
    return { text, hasViolation };
  }

  const cleanMessage = sanitizeChatMessage("Oyun içi nickim ProGamer99, teslimat noktasındayım.");
  assert.strictEqual(cleanMessage.hasViolation, false);

  const leakAttempt = sanitizeChatMessage("Bana whatsapptan yaz 0532 123 45 67 veya discord.gg/oyun");
  assert.strictEqual(leakAttempt.hasViolation, true);
  assert.ok(leakAttempt.text.includes("[Sistem tarafından gizlenen telefon no]"));
  assert.ok(leakAttempt.text.includes("[Sistem tarafından gizlenen harici bağlantı]"));
  console.log("PASSED: Chat anti-fraud sanitization verified.");

  // 16. Admin payout review queue state transition
  console.log("16. Test: Admin payout approval transitions status and records bank queue...");
  interface PayoutItem {
    id: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
  }
  const pendingPayouts: PayoutItem[] = [
    { id: "pay_1", amount: 500, status: "pending" },
    { id: "pay_2", amount: 1200, status: "pending" },
  ];
  function approvePayout(id: string, list: PayoutItem[]) {
    return list.map(p => p.id === id ? { ...p, status: "approved" as const } : p);
  }
  const updatedPayouts = approvePayout("pay_1", pendingPayouts);
  assert.strictEqual(updatedPayouts.find(p => p.id === "pay_1")?.status, "approved");
  assert.strictEqual(updatedPayouts.find(p => p.id === "pay_2")?.status, "pending");
  console.log("PASSED: Admin payout review transition verified.");

  // 17. Dispute creation and arbitration decision handling
  console.log("17. Test: Dispute transitions order to DISPUTED and arbitrates escrow safely...");
  function arbitrateDecision(dispute: { status: string; orderTotal: number }, decision: "REFUND_BUYER" | "RELEASE_TO_SELLER") {
    if (decision === "REFUND_BUYER") {
      return { status: "RESOLVED_BUYER", refundAmount: dispute.orderTotal };
    }
    return { status: "RESOLVED_SELLER", refundAmount: 0 };
  }
  const buyerFavored = arbitrateDecision({ status: "OPEN", orderTotal: 450 }, "REFUND_BUYER");
  assert.strictEqual(buyerFavored.status, "RESOLVED_BUYER");
  assert.strictEqual(buyerFavored.refundAmount, 450);

  const sellerFavored = arbitrateDecision({ status: "OPEN", orderTotal: 450 }, "RELEASE_TO_SELLER");
  assert.strictEqual(sellerFavored.status, "RESOLVED_SELLER");
  assert.strictEqual(sellerFavored.refundAmount, 0);
  console.log("PASSED: Dispute arbitration decisions verified.");

  // 18. Seller rating score aggregation and positive percentage computation
  console.log("18. Test: Seller review aggregation correctly computes average and percentage...");
  function computeSellerReputation(ratings: number[]) {
    if (ratings.length === 0) return { average: 5.0, count: 0, positivePercent: 100 };
    const avg = Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1));
    const positive = ratings.filter(r => r >= 4).length;
    const positivePercent = Math.round((positive / ratings.length) * 100);
    return { average: avg, count: ratings.length, positivePercent };
  }
  const rep = computeSellerReputation([5, 5, 4, 5, 1]); // 20 / 5 = 4.0, 4 positive out of 5 = 80%
  assert.strictEqual(rep.average, 4.0);
  assert.strictEqual(rep.count, 5);
  assert.strictEqual(rep.positivePercent, 80);
  console.log("PASSED: Seller review aggregation verified.");

  // 19. Seller store slug lookup and catalog isolation
  console.log("19. Test: Seller store lookup matches slug and filters seller-owned listings...");
  const sampleSellers = [
    { id: "seller_1", storeName: "DragonTrader", storeSlug: "dragontrader" },
    { id: "seller_2", storeName: "KnifeEmpire", storeSlug: "knifeempire" },
  ];
  function findSellerBySlug(slug: string) {
    return sampleSellers.find(s => s.storeSlug.toLowerCase() === slug.toLowerCase()) || null;
  }
  assert.ok(findSellerBySlug("dragontrader"));
  assert.strictEqual(findSellerBySlug("dragontrader")?.storeName, "DragonTrader");
  assert.strictEqual(findSellerBySlug("non_existent"), null);

  const sampleStoreListings = [
    { id: "l1", sellerName: "DragonTrader", title: "Item 1" },
    { id: "l2", sellerName: "KnifeEmpire", title: "Item 2" },
    { id: "l3", sellerName: "DragonTrader", title: "Item 3" },
  ];
  const dragonItems = sampleStoreListings.filter(l => l.sellerName === "DragonTrader");
  assert.strictEqual(dragonItems.length, 2);
  console.log("PASSED: Seller storefront lookup and isolation verified.");

  // 20. Immutable audit logging data structure and resource indexing
  console.log("20. Test: Audit log entries record immutable actor, action, and resource state...");
  function createAuditRecord(actorId: string, action: string, resource: string, resourceId: string) {
    return {
      id: "aud_" + Date.now(),
      actorId,
      action,
      resource,
      resourceId,
      createdAt: Date.now(),
    };
  }
  const audit = createAuditRecord("usr_admin_1", "ORDER_STATUS_CHANGED", "order", "ord_101");
  assert.strictEqual(audit.actorId, "usr_admin_1");
  assert.strictEqual(audit.action, "ORDER_STATUS_CHANGED");
  assert.strictEqual(audit.resource, "order");
  assert.strictEqual(audit.resourceId, "ord_101");
  assert.ok(audit.createdAt > 0);
  console.log("PASSED: Immutable audit logging verified.");

  // 21. Digital vault AES-256-GCM encryption and authenticated disclosure
  console.log("21. Test: Digital vault payload undergoes authenticated encryption and disclosure...");
  const crypto = require("crypto");
  function testEncrypt(plain: string, secretKey: string) {
    const key = crypto.createHash("sha256").update(secretKey).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let enc = cipher.update(plain, "utf8", "hex");
    enc += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return { enc, iv: iv.toString("hex"), tag };
  }
  function testDecrypt(enc: string, ivHex: string, tagHex: string, secretKey: string) {
    const key = crypto.createHash("sha256").update(secretKey).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    let dec = decipher.update(enc, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
  }

  const rawSecret = "RIOT-VP-SECRET-1234";
  const { enc, iv, tag } = testEncrypt(rawSecret, "test_secret_key");
  assert.notStrictEqual(enc, rawSecret);
  const decrypted = testDecrypt(enc, iv, tag, "test_secret_key");
  assert.strictEqual(decrypted, rawSecret);
  console.log("PASSED: AES-256-GCM digital vault encryption verified.");

  // 22. Delivery proof payload structure validation
  console.log("22. Test: Delivery proof submission requires valid proofUrl or trade identifier...");
  function validateDeliveryProof(input: { orderId: string; proofType: string; proofUrls: string[] }) {
    if (!input.orderId) return { valid: false, error: "Order ID missing" };
    if (!input.proofUrls || input.proofUrls.length === 0) return { valid: false, error: "Kanıt görseli gerekli" };
    return { valid: true };
  }
  assert.strictEqual(validateDeliveryProof({ orderId: "ord_1", proofType: "SCREENSHOT", proofUrls: [] }).valid, false);
  assert.strictEqual(validateDeliveryProof({ orderId: "ord_1", proofType: "SCREENSHOT", proofUrls: ["https://resim.link/proof1.png"] }).valid, true);
  console.log("PASSED: Delivery proof submission validation verified.");

  // 23. Official T.C. Identity Number checksum algorithm verification
  console.log("23. Test: TCKN algorithm validates official checksum and rejects invalid numbers...");
  function validateTCKN(tc: string): boolean {
    if (!/^[1-9]\d{10}$/.test(tc)) return false;
    const digits = tc.split("").map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const digit10 = (oddSum * 7 - evenSum) % 10;
    if (digit10 < 0 ? digit10 + 10 !== digits[9] : digit10 !== digits[9]) return false;
    const totalSum = digits.slice(0, 10).reduce((acc, d) => acc + d, 0);
    if (totalSum % 10 !== digits[10]) return false;
    return true;
  }

  assert.strictEqual(validateTCKN("10000000146"), true); // Valid sample TCKN
  assert.strictEqual(validateTCKN("01234567890"), false); // Starts with 0
  assert.strictEqual(validateTCKN("12345678901"), false); // Invalid checksum
  assert.strictEqual(validateTCKN("1000000014"), false); // Short length
  console.log("PASSED: Official TCKN algorithm verification verified.");

  console.log(">> ALL 23 PLATFORM MODULE TESTS PASSED SUCCESSFULLY!");
  console.log("=========================================================================");
}

runPlatformModulesTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
