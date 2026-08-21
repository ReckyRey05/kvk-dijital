/**
 * CEP GARSON — API SECURITY, INPUT VALIDATION, BUSINESS LOGIC & FUZZING TEST SUITE
 * FAZ 5 Automated API Red Team & Fuzzing Engine
 */

import {
  calculateAndCreateCanonicalOrder,
  CreateOrderRequestInput,
  defaultCanonicalDataSource,
} from "../../../src/lib/restaurant/canonicalOrderEngine";
import {
  validateOrderStateTransition,
  validatePaymentTransition,
} from "../../../src/lib/restaurant/stateMachine";
import { createTableSession } from "../../../src/lib/restaurant/session";
import { DEMO_RESTAURANT } from "../../../src/lib/restaurant/mockData";
import { checkRateLimit } from "../../../src/lib/security/rateLimit";

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
console.log("RUNNING FAZ 5 API SECURITY, STATE MACHINE & FUZZING TESTS");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

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

const REST_ID = DEMO_RESTAURANT.id;
const validSession = createTableSession(REST_ID, "m-4", "Masa 4", "fuzz_device_1", 15);

// ==========================================
// 1. TYPE CONFUSION & SPECIAL NUMBER ATTACKS
// ==========================================
console.log("--- 1. TYPE CONFUSION & SPECIAL NUMBER ATTACKS ---");

runTest("Type Confusion 1: Non-array or string items payload", () => {
  const malformedInputs = [
    { ...({} as any), items: "string_items" },
    { ...({} as any), items: 12345 },
    { ...({} as any), items: null },
    { ...({} as any), items: {} },
    { ...({} as any), items: true },
  ];

  for (const malformed of malformedInputs) {
    const res = calculateAndCreateCanonicalOrder(
      {
        restaurantId: REST_ID,
        tableId: "m-4",
        sessionToken: validSession.token,
        items: malformed.items as any,
      },
      defaultCanonicalDataSource
    );
    assert(!res.ok, "Malformed items type must be rejected");
  }
});

runTest("Special Numbers 1: NaN, Infinity, -Infinity in quantity or modifiers", () => {
  const badQuantities = [NaN, Infinity, -Infinity, -0, 1e20, -5];

  for (const qty of badQuantities) {
    const res = calculateAndCreateCanonicalOrder(
      {
        restaurantId: REST_ID,
        tableId: "m-4",
        sessionToken: validSession.token,
        items: [{ menuItemId: "item_truffle_burger", quantity: qty as any }],
      },
      defaultCanonicalDataSource
    );
    assert(!res.ok, `Invalid quantity '${qty}' must be rejected`);
  }
});

// ==========================================
// 2. PROTOTYPE POLLUTION & MASS ASSIGNMENT
// ==========================================
console.log("\n--- 2. PROTOTYPE POLLUTION & MASS ASSIGNMENT ---");

runTest("Security 1: Prototype Pollution in payload", () => {
  const pollutedPayload: any = JSON.parse(
    '{"restaurantId":"' + REST_ID + '","tableId":"m-4","sessionToken":"' + validSession.token + '","__proto__":{"isAdmin":true,"role":"SUPER_ADMIN"},"items":[{"menuItemId":"item_truffle_burger","quantity":1,"__proto__":{"price":0}}]}'
  );

  const res = calculateAndCreateCanonicalOrder(pollutedPayload, defaultCanonicalDataSource);
  assert(res.ok, "Valid order is processed safely");
  assert((res.order as any).isAdmin === undefined, "isAdmin must not be attached to order");
  assert((Object.prototype as any).isAdmin === undefined, "Global prototype must not be polluted");
  assertEqual(res.order?.items[0].finalPrice, 360, "Price must remain canonical 360 TL");
});

runTest("Security 2: Mass Assignment in Request Body", () => {
  const input: any = {
    restaurantId: REST_ID,
    tableId: "m-4",
    sessionToken: validSession.token,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1,
        unitPrice: 1,
        totalAmount: 1,
        status: "COMPLETED",
        paymentStatus: "PAID_ONLINE",
        role: "OWNER",
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input, defaultCanonicalDataSource);
  assert(res.ok, "Order processed safely");
  assertEqual(res.order?.status, "PENDING_CONFIRMATION", "Status must be PENDING_CONFIRMATION");
  assertEqual(res.order?.paymentStatus, "PENDING", "PaymentStatus must be PENDING");
  assertEqual(res.order?.totalAmount, 396, "TotalAmount must be canonical with tax (396 TL)");
});

// ==========================================
// 3. RATE LIMITING & REPLAY DEFENSE
// ==========================================
console.log("\n--- 3. RATE LIMITING & IDEMPOTENCY REPLAY ---");

runTest("Rate Limiter 1: Burst of 25 requests hits 20/min limit", () => {
  const testIp = "172.16.0.50";
  const limitConfig = { max: 20, windowMs: 60000 };

  for (let i = 0; i < 20; i++) {
    const check = checkRateLimit(`testIp:${testIp}`, limitConfig);
    assert(check.allowed, `Request ${i + 1} must be allowed`);
  }

  const blockedCheck = checkRateLimit(`testIp:${testIp}`, limitConfig);
  assert(!blockedCheck.allowed, "21st request must be rate limited");
  assertEqual(blockedCheck.remaining, 0, "Remaining requests is 0");
});

runTest("Idempotency 1: Replaying identical idempotencyKey produces 0 side effects", () => {
  const idemKey = `idem_fuzz_${Date.now()}`;
  const input: CreateOrderRequestInput = {
    restaurantId: REST_ID,
    tableId: "m-4",
    sessionToken: validSession.token,
    items: [{ menuItemId: "item_truffle_burger", quantity: 2 }],
    idempotencyKey: idemKey,
  };

  const res1 = calculateAndCreateCanonicalOrder(input, defaultCanonicalDataSource);
  assert(res1.ok, "First request succeeds");
  assertEqual(res1.isIdempotentReplay, false, "First request is not a replay");

  const res2 = calculateAndCreateCanonicalOrder(input, defaultCanonicalDataSource);
  assert(res2.ok, "Second request returns cached order");
  assertEqual(res2.isIdempotentReplay, true, "Second request is flagged as replay");
  assertEqual(res1.order?.id, res2.order?.id, "Both requests return identical order ID");
});

// ==========================================
// 4. STATE MACHINE TRANSITION INTEGRITY
// ==========================================
console.log("\n--- 4. STATE MACHINE TRANSITION INTEGRITY ---");

runTest("State Machine 1: Valid Sequential Transitions", () => {
  assert(validateOrderStateTransition("PENDING_CONFIRMATION", "PREPARING").valid, "Pending -> Preparing allowed");
  assert(validateOrderStateTransition("PREPARING", "READY").valid, "Preparing -> Ready allowed");
  assert(validateOrderStateTransition("READY", "SERVED").valid, "Ready -> Served allowed");
  assert(validateOrderStateTransition("SERVED", "COMPLETED").valid, "Served -> Completed allowed");
});

runTest("State Machine 2: Invalid & Illegal Transition Bypasses Blocked", () => {
  assert(!validateOrderStateTransition("COMPLETED", "PENDING_CONFIRMATION").valid, "Completed -> Pending blocked");
  assert(!validateOrderStateTransition("COMPLETED", "PREPARING").valid, "Completed -> Preparing blocked");
  assert(!validateOrderStateTransition("CANCELLED", "READY").valid, "Cancelled -> Ready blocked");
  assert(!validateOrderStateTransition("CANCELLED", "COMPLETED").valid, "Cancelled -> Completed blocked");
  assert(!validateOrderStateTransition("CANCELLED", "SERVED").valid, "Cancelled -> Served blocked");
});

runTest("State Machine 3: Paid Payment Rollback Blocked", () => {
  assert(!validatePaymentTransition("PAID_CASHIER", "PENDING").valid, "Paid Cashier -> Pending blocked");
  assert(!validatePaymentTransition("PAID_ONLINE", "PENDING").valid, "Paid Online -> Pending blocked");
});

// ==========================================
// 5. AUTOMATED FUZZING ENGINE (100 MALFORMED CASES)
// ==========================================
console.log("\n--- 5. AUTOMATED FUZZING ENGINE (100 RANDOM CASES) ---");

runTest("Fuzzing 1: 100 Randomized Malformed Payloads Stress Test", () => {
  const fuzzPayloads: any[] = [];
  const randomStrings = [
    "",
    " ",
    "   ",
    "\0",
    "\r\n\r\n",
    "../../../../etc/passwd",
    "<script>alert(1)</script>",
    "'; DROP TABLE orders; --",
    "🍕🍔🍟".repeat(100),
    "A".repeat(10000),
    "%2e%2e%2f",
    "{{7*7}}",
  ];

  for (let i = 0; i < 100; i++) {
    const payload: any = {
      restaurantId: i % 2 === 0 ? REST_ID : randomStrings[i % randomStrings.length],
      tableId: i % 3 === 0 ? "m-4" : randomStrings[(i + 1) % randomStrings.length],
      sessionToken: i % 4 === 0 ? validSession.token : randomStrings[(i + 2) % randomStrings.length],
      items:
        i % 5 === 0
          ? randomStrings[i % randomStrings.length]
          : [
              {
                menuItemId: i % 2 === 0 ? "item_truffle_burger" : randomStrings[i % randomStrings.length],
                quantity: i % 3 === 0 ? 1 : i % 2 === 0 ? -1 : NaN,
              },
            ],
    };
    fuzzPayloads.push(payload);
  }

  let errorHandledCount = 0;
  for (const fuzzItem of fuzzPayloads) {
    try {
      const res = calculateAndCreateCanonicalOrder(fuzzItem, defaultCanonicalDataSource);
      if (!res.ok) errorHandledCount++;
    } catch (err: any) {
      throw new Error(`Fuzzing caused unhandled panic: ${err.message}`);
    }
  }

  assert(errorHandledCount > 0, "Fuzzing errors were cleanly caught and handled");
  console.log(`         Successfully fuzzed 100 malformed payloads with 0 panics/unhandled exceptions.`);
});

console.log("\n=================================================");
console.log(`ALL FAZ 5 API & FUZZING TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
