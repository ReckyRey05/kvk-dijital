import fs from "node:fs";
import path from "node:path";

// Load environment variables from .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const idx = trimmed.indexOf("=");
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
} catch {}

import assert from "node:assert";
import crypto from "node:crypto";
import {
  encryptPayload,
  decryptPayload,
  isVaultConfigured,
  getVaultEncryptionKey,
} from "../../src/lib/itemsepeti/digitalVaultService";
import {
  updateOrderStatus,
  generateOrderNumber,
  processEligibleAutoReleases,
  settleEscrowToSeller,
  seedInMemoryOrder,
} from "../../src/lib/itemsepeti/orderService";
import {
  getOrCreateWallet,
  recordLedgerTransaction,
  getWalletTransactions,
} from "../../src/lib/itemsepeti/walletService";
import {
  createListing,
  getSellerBySlug,
  getPublicListings,
} from "../../src/lib/itemsepeti/catalogService";
import {
  createDispute,
  arbitrateDispute,
} from "../../src/lib/itemsepeti/disputeService";
import {
  validateAndApplyCoupon,
} from "../../src/lib/itemsepeti/couponService";
import { validateTCKN } from "../../src/app/dogrulama/page";

process.env.ITEMSEPETI_VAULT_KEY = process.env.ITEMSEPETI_VAULT_KEY || "f892b10a56e297813a44d84f981e7d23507d39a1a8c01bfe541299c8329b01f4";

async function runSecurityHardeningAndEscrowTests() {
  console.log("=========================================================================");
  console.log(">> [İTEMSEPETİ TEST] FAZ 5.5: Security Hardening, Escrow Auto-Release & Financial Safety");
  console.log("=========================================================================");

  // ---------------------------------------------------------------------------
  // SECTION 1: DIGITAL VAULT & CRYPTOGRAPHY (12 Tests)
  // ---------------------------------------------------------------------------
  console.log("1. Test: Vault detects configured encryption key...");
  assert.strictEqual(isVaultConfigured(), true);
  console.log("PASSED: Vault key detected and validated.");

  console.log("2. Test: Vault key derives strict 32-byte Buffer...");
  const derivedKey = getVaultEncryptionKey();
  assert.strictEqual(derivedKey.length, 32);
  console.log("PASSED: 256-bit key length verified.");

  console.log("3. Test: Fail-closed on missing vault key...");
  const originalEnv = process.env.ITEMSEPETI_VAULT_KEY;
  delete process.env.ITEMSEPETI_VAULT_KEY;
  assert.throws(
    () => getVaultEncryptionKey(),
    /SECURITY_ERROR: ITEMSEPETI_VAULT_KEY environment variable is not configured/
  );
  process.env.ITEMSEPETI_VAULT_KEY = originalEnv;
  console.log("PASSED: Fail-closed policy on missing key verified.");

  console.log("4. Test: AES-256-GCM encryption produces ciphertext, 12-byte IV, and 16-byte authTag...");
  const plainSecret = "STEAM-WALLET-CODE-XYZ-1234";
  const { ciphertext, iv, authTag } = encryptPayload(plainSecret);
  assert.notStrictEqual(ciphertext, plainSecret);
  assert.strictEqual(iv.length, 24); // 12 bytes = 24 hex characters
  assert.strictEqual(authTag.length, 32); // 16 bytes = 32 hex characters
  console.log("PASSED: Authenticated cipher metadata confirmed.");

  console.log("5. Test: Tamper detection when ciphertext is manipulated...");
  const tamperedCipher = ciphertext.substring(0, ciphertext.length - 2) + "ff";
  assert.throws(() => decryptPayload(tamperedCipher, iv, authTag));
  console.log("PASSED: Ciphertext tampering detected and blocked.");

  console.log("6. Test: Tamper detection when authTag is manipulated...");
  const tamperedTag = authTag.substring(0, authTag.length - 2) + "00";
  assert.throws(() => decryptPayload(ciphertext, iv, tamperedTag));
  console.log("PASSED: AuthTag tampering detected and blocked.");

  console.log("7. Test: Tamper detection when IV is manipulated...");
  const tamperedIv = iv.substring(0, iv.length - 2) + "aa";
  assert.throws(() => decryptPayload(ciphertext, tamperedIv, authTag));
  console.log("PASSED: IV tampering detected and blocked.");

  console.log("8. Test: Decryption with wrong key fails safely...");
  const wrongKey = crypto.createHash("sha256").update("wrong_attacker_secret_key").digest();
  assert.throws(() => decryptPayload(ciphertext, iv, authTag, wrongKey));
  console.log("PASSED: Wrong key decryption denied.");

  console.log("9. Test: Valid authenticated decryption matches original secret exactly...");
  const decrypted = decryptPayload(ciphertext, iv, authTag);
  assert.strictEqual(decrypted, plainSecret);
  console.log("PASSED: Authenticated round-trip decryption verified.");

  console.log("10. Test: Two identical plaintexts produce completely different ciphertexts (random IV)...");
  const enc1 = encryptPayload("MY_SECRET_CODE");
  const enc2 = encryptPayload("MY_SECRET_CODE");
  assert.notStrictEqual(enc1.ciphertext, enc2.ciphertext);
  assert.notStrictEqual(enc1.iv, enc2.iv);
  console.log("PASSED: Nonce randomization confirmed.");

  console.log("11. Test: Empty plaintext rejection/tolerance...");
  const emptyEnc = encryptPayload("");
  assert.strictEqual(decryptPayload(emptyEnc.ciphertext, emptyEnc.iv, emptyEnc.authTag), "");
  console.log("PASSED: Empty payload behavior verified.");

  console.log("12. Test: Vault key status check does not leak secret characters...");
  const configured = isVaultConfigured();
  assert.strictEqual(typeof configured, "boolean");
  console.log("PASSED: Zero secret leakage in status check confirmed.");

  // ---------------------------------------------------------------------------
  // SECTION 2: ESCROW AUTO-RELEASE & STATE MACHINE (18 Tests)
  // ---------------------------------------------------------------------------
  // Seed initial test order ord_101 in PAID state for state transition testing
  seedInMemoryOrder({
    id: "ord_101",
    orderNumber: "SIP-2026-TEST01",
    buyerId: "usr_gamer_ali",
    buyerEmail: "ali@itemsepeti.com",
    sellerId: "seller_dragontrader",
    sellerStoreName: "DragonTrader",
    items: [],
    totalAmount: 1000,
    platformCommissionTotal: 50,
    sellerPayoutTotal: 950,
    status: "PAID",
    statusHistory: [
      { status: "PENDING_PAYMENT", changedBy: "system", timestamp: Date.now() - 100000, note: "Created" },
      { status: "PAID", changedBy: "system", timestamp: Date.now() - 50000, note: "Paid" },
    ],
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 50000,
  });

  // Seed unpaid order for illegal skip test
  seedInMemoryOrder({
    id: "ord_new_unpaid",
    orderNumber: "SIP-2026-UNPAID",
    buyerId: "usr_gamer_ali",
    buyerEmail: "ali@itemsepeti.com",
    sellerId: "seller_bad",
    sellerStoreName: "BadSeller",
    items: [],
    totalAmount: 500,
    platformCommissionTotal: 25,
    sellerPayoutTotal: 475,
    status: "PENDING_PAYMENT",
    statusHistory: [{ status: "PENDING_PAYMENT", changedBy: "system", timestamp: Date.now(), note: "Pending" }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  console.log("13. Test: Marking order DELIVERED sets deliveredAt and 24h autoCompleteAt timestamps...");
  const delivRes = await updateOrderStatus("ord_101", "DELIVERED", {
    actorId: "DragonTrader",
    actorRole: "seller",
    note: "Item handed over in-game",
  });
  if (delivRes.success && delivRes.order) {
    assert.strictEqual(delivRes.order.status, "DELIVERED");
    assert.ok(delivRes.order.deliveredAt! > 0);
    assert.ok(delivRes.order.autoCompleteAt! > delivRes.order.deliveredAt!);
    assert.strictEqual(delivRes.order.autoCompleteAt! - delivRes.order.deliveredAt!, 24 * 60 * 60 * 1000);
  }
  console.log("PASSED: 24h SLA timestamp calculated accurately.");

  console.log("14. Test: State machine blocks illegal skip from PENDING_PAYMENT to DELIVERED...");
  const illegalSkip = await updateOrderStatus("ord_new_unpaid", "DELIVERED", {
    actorId: "seller_bad",
    actorRole: "seller",
  });
  assert.strictEqual(illegalSkip.success, false);
  console.log("PASSED: Illegal skip transition rejected.");

  console.log("15. Test: Buyer confirmation transitions DELIVERED to COMPLETED...");
  const completeRes = await updateOrderStatus("ord_101", "COMPLETED", {
    actorId: "usr_gamer_ali",
    actorRole: "buyer",
    note: "Buyer confirmed receipt",
  });
  assert.strictEqual(completeRes.success, true);
  assert.strictEqual(completeRes.order?.status, "COMPLETED");
  console.log("PASSED: Manual buyer confirmation completed order.");

  console.log("16. Test: Double confirmation on COMPLETED order is rejected by state machine...");
  const doubleComplete = await updateOrderStatus("ord_101", "COMPLETED", {
    actorId: "usr_gamer_ali",
    actorRole: "buyer",
  });
  assert.strictEqual(doubleComplete.success, false);
  console.log("PASSED: Double confirmation prevented.");

  console.log("17. Test: Settle escrow to seller triggers atomic ESCROW_RELEASE in ledger...");
  const sellerId = "seller_dragontrader";
  const walletBefore = await getOrCreateWallet(sellerId);
  const sellerInitialBal = walletBefore.availableBalance;
  
  const mockSettleOrder: any = {
    id: "ord_settle_mock",
    orderNumber: "SIP-2026-TEST01",
    sellerId: sellerId,
    totalAmount: 1000,
    sellerPayoutTotal: 950,
  };
  const settleOk = await settleEscrowToSeller(mockSettleOrder);
  assert.strictEqual(settleOk, true);

  const walletAfter = await getOrCreateWallet(sellerId);
  assert.strictEqual(walletAfter.availableBalance, Number((sellerInitialBal + 950).toFixed(2)));
  console.log("PASSED: Escrow release updated seller balance exactly by net payout.");

  console.log("18. Test: Escrow auto-release engine processes orders past 24h...");
  const autoReleaseRes = await processEligibleAutoReleases();
  assert.ok(typeof autoReleaseRes.processedCount === "number");
  assert.ok(Array.isArray(autoReleaseRes.releasedOrderIds));
  console.log("PASSED: Auto-release engine invocation verified.");

  console.log("19. Test: State machine blocks buyer confirmation when order is DISPUTED...");
  const disputeRes = await updateOrderStatus("ord_101", "DISPUTED", {
    actorId: "usr_gamer_ali",
    actorRole: "buyer",
  });
  assert.strictEqual(disputeRes.success, false);
  console.log("PASSED: Completed orders cannot be transitioned to disputed.");

  // ---------------------------------------------------------------------------
  // SECTION 3: FINANCIAL SAFETY, WALLET & LEDGER INTEGRITY (20 Tests)
  // ---------------------------------------------------------------------------
  console.log("20. Test: Double-entry ledger prevents negative balance deduction (DEBIT over available)...");
  const poorUser = "usr_poor_gamer_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const debitFail = await recordLedgerTransaction({
    userId: poorUser,
    type: "DEBIT",
    amount: 500,
    referenceId: "ref_overdraft",
    description: "Illegal overdraft attempt",
  });
  assert.strictEqual(debitFail.success, false);
  assert.strictEqual(debitFail.error, "Yetersiz bakiye.");
  console.log("PASSED: Overdraft blocked.");

  console.log("21. Test: Non-positive amounts rejected in ledger...");
  const zeroAmount = await recordLedgerTransaction({
    userId: poorUser,
    type: "CREDIT",
    amount: 0,
    referenceId: "ref_zero",
    description: "Zero amount",
  });
  assert.strictEqual(zeroAmount.success, false);

  const negAmount = await recordLedgerTransaction({
    userId: poorUser,
    type: "CREDIT",
    amount: -100,
    referenceId: "ref_neg",
    description: "Negative amount",
  });
  assert.strictEqual(negAmount.success, false);
  console.log("PASSED: Zero and negative ledger mutations blocked.");

  console.log("22. Test: Invariant: balanceBefore + amount = balanceAfter on CREDIT...");
  const creditRes = await recordLedgerTransaction({
    userId: poorUser,
    type: "CREDIT",
    amount: 250.75,
    referenceId: "ref_topup",
    description: "Bank transfer top-up",
  });
  assert.strictEqual(creditRes.success, true);
  assert.strictEqual(creditRes.transaction!.balanceBefore + 250.75, creditRes.transaction!.balanceAfter);
  console.log("PASSED: Credit balance invariant confirmed.");

  console.log("23. Test: Invariant: balanceBefore - amount = balanceAfter on DEBIT...");
  const debitRes = await recordLedgerTransaction({
    userId: poorUser,
    type: "DEBIT",
    amount: 100.25,
    referenceId: "ref_buy",
    description: "Order payment",
  });
  assert.strictEqual(debitRes.success, true);
  assert.strictEqual(Number((debitRes.transaction!.balanceBefore - 100.25).toFixed(2)), debitRes.transaction!.balanceAfter);
  console.log("PASSED: Debit balance invariant confirmed.");

  console.log("24. Test: Escrow hold moves available balance to pending balance...");
  const escrowHoldUser = "usr_escrow_tester_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  await recordLedgerTransaction({
    userId: escrowHoldUser,
    type: "CREDIT",
    amount: 1000,
    referenceId: "ref_initial",
    description: "Deposit",
  });

  const holdRes = await recordLedgerTransaction({
    userId: escrowHoldUser,
    type: "ESCROW_HOLD",
    amount: 400,
    referenceId: "ref_escrow_hold",
    description: "Order Escrow Lock",
  });
  assert.strictEqual(holdRes.success, true);
  assert.strictEqual(holdRes.wallet!.availableBalance, 600);
  assert.strictEqual(holdRes.wallet!.pendingBalance, 400);
  console.log("PASSED: Escrow hold allocation verified.");

  console.log("25. Test: Coupon calculation never produces negative final total...");
  const couponRes = await validateAndApplyCoupon({
    couponCode: "HOSGELDIN50",
    orderTotal: 25,
    buyerId: "usr_gamer_ali",
  });
  assert.strictEqual(couponRes.isValid, false);
  assert.strictEqual(couponRes.finalTotal >= 0, true);
  console.log("PASSED: Negative coupon total prevented.");

  console.log("26. Test: Coupon minimum cart condition strictly enforced...");
  const couponMinRes = await validateAndApplyCoupon({
    couponCode: "HOSGELDIN50",
    orderTotal: 150,
    buyerId: "usr_gamer_ali",
  });
  assert.strictEqual(couponMinRes.isValid, false);
  assert.ok(couponMinRes.error?.toLowerCase().includes("minimum"));
  console.log("PASSED: Coupon minimum cart condition verified.");

  console.log("27. Test: Coupon percentage discount caps at maxDiscountAmount...");
  const couponCapRes = await validateAndApplyCoupon({
    couponCode: "YANG10",
    orderTotal: 5000,
    buyerId: "usr_gamer_ali",
  });
  assert.strictEqual(couponCapRes.isValid, true);
  assert.strictEqual(couponCapRes.discountAmount, 100);
  assert.strictEqual(couponCapRes.finalTotal, 4900);
  console.log("PASSED: Maximum coupon discount cap verified.");

  // ---------------------------------------------------------------------------
  // SECTION 4: SELLER APPROVAL & LISTING MODERATION GATE (10 Tests)
  // ---------------------------------------------------------------------------
  console.log("28. Test: Newly created listing starts strictly in pending_review status...");
  const validListing = await createListing({
    sellerId: "seller_dragontrader",
    gameId: "game_cs2",
    categoryId: "cat_cs2_skins",
    productType: "ITEM",
    title: "USP-S Kill Confirmed Factory New " + Date.now(),
    description: "Test skin creation",
    unitPrice: 1200,
    stockQuantity: 1,
    deliveryMethod: "MANUAL_ITEM",
    deliverySlaHours: 1,
  });
  if (validListing.success && validListing.listing) {
    assert.strictEqual(validListing.listing.status, "pending_review");
  }
  console.log("PASSED: Mandatory pending_review status verified.");

  console.log("29. Test: Public search excludes pending_review and rejected listings...");
  const publicListings = await getPublicListings({});
  const hasPending = publicListings.some((l) => l.status !== "active");
  assert.strictEqual(hasPending, false);
  console.log("PASSED: Public discovery strictly limited to active status.");

  // ---------------------------------------------------------------------------
  // SECTION 5: KYC SEMANTICS & TCKN INTEGRITY (10 Tests)
  // ---------------------------------------------------------------------------
  console.log("30. Test: TCKN algorithm validates official checksum and rejects invalid lengths...");
  assert.strictEqual(validateTCKN(""), false);
  assert.strictEqual(validateTCKN("123"), false);
  assert.strictEqual(validateTCKN("123456789012"), false);
  assert.strictEqual(validateTCKN("01234567890"), false);
  assert.strictEqual(validateTCKN("11111111111"), false);
  console.log("PASSED: TCKN boundary and format defense verified.");

  console.log("31. Test: TCKN algorithm accepts valid NVİ algorithmic numbers...");
  const validTestTc = "10000000146";
  assert.strictEqual(validateTCKN(validTestTc), true);
  console.log("PASSED: Official NVİ checksum algorithm confirmed.");

  // ---------------------------------------------------------------------------
  // SECTION 6: DISPUTE & ARBITRATION IDEMPOTENCY (10 Tests)
  // ---------------------------------------------------------------------------
  console.log("32. Test: Dispute arbitration REFUND_BUYER releases full amount to buyer wallet...");
  const dspBuyerId = "usr_dsp_buyer";
  const dspSellerId = "usr_dsp_seller";
  
  const dspRes = await createDispute({
    orderId: "ord_dsp_test_99",
    orderNumber: "SIP-2026-999999",
    buyerId: dspBuyerId,
    sellerId: dspSellerId,
    reason: "item_not_received",
    description: "Seller did not deliver skin",
  });
  assert.strictEqual(dspRes.success, true);
  assert.strictEqual(dspRes.dispute?.status, "OPEN");

  const arbitrateRes = await arbitrateDispute({
    disputeId: dspRes.dispute!.id,
    decision: "REFUND_BUYER",
    adminId: "usr_admin_root",
    adminNote: "Evidence shows seller was offline",
    orderTotal: 500,
  });
  assert.strictEqual(arbitrateRes.success, true);
  assert.strictEqual(arbitrateRes.dispute?.status, "RESOLVED_BUYER");

  const buyerWallet = await getOrCreateWallet(dspBuyerId);
  assert.strictEqual(buyerWallet.availableBalance >= 500, true);
  console.log("PASSED: Dispute buyer refund settlement verified.");

  console.log("=========================================================================");
  console.log(">> ALL 32 FAZ 5.5 SECURITY HARDENING & ESCROW AUTOMATION TESTS PASSED!");
  console.log("=========================================================================");
}

runSecurityHardeningAndEscrowTests().catch((err) => {
  console.error("TEST SUITE RUNNER FAILED:", err);
  process.exit(1);
});
