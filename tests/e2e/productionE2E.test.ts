/**
 * CEP GARSON — FINAL REAL-WORLD END-TO-END PRODUCTION ACCEPTANCE SUITE
 * FAZ 10 Complete Production Simulation: Customer -> KDS -> Waiter -> Cashier -> POS -> Reconciliation
 */

import {
  calculateAndCreateCanonicalOrder,
  CreateOrderRequestInput,
  toMinorUnits,
  fromMinorUnits,
  defaultCanonicalDataSource,
} from "../../src/lib/restaurant/canonicalOrderEngine";
import {
  createTableSession,
  validateTableSession,
  invalidateAllTableSessions,
} from "../../src/lib/restaurant/session";
import {
  authenticateStaffWithPin,
  verifySessionToken,
} from "../../src/lib/auth/restaurantAuth";
import {
  validateOrderStateTransition,
  validatePaymentTransition,
} from "../../src/lib/restaurant/stateMachine";
import {
  assertTableOwnership,
  assertOrderOwnership,
} from "../../src/lib/restaurant/tenantGuard";
import {
  DEMO_RESTAURANT,
  DEMO_TABLES,
  DEMO_MENU_ITEMS,
} from "../../src/lib/restaurant/mockData";
import { Order } from "../../src/types/restaurant";

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
console.log("RUNNING FAZ 10 REAL-WORLD E2E PRODUCTION ACCEPTANCE TESTS");
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
const TABLE_ID = "m-4";

// ==========================================
// 1. FULL END-TO-END RESTAURANT OPERATION LIFECYCLE
// ==========================================
console.log("--- 1. FULL END-TO-END RESTAURANT OPERATION SIMULATION ---");

runTest("E2E Lifecycle 1: Complete Customer -> Kitchen -> Waiter -> Cashier -> Close Cycle", () => {
  // Step 1: Customer sits at Table 4 and scans QR code
  const tableCheck = assertTableOwnership(REST_ID, TABLE_ID);
  assert(tableCheck.allowed, "Table 4 is valid and belongs to Aura Bistro");

  const session = createTableSession(REST_ID, TABLE_ID, "Masa 4", "customer_phone_safari", 15);
  assert(session.isActive, "Session is active");

  // Step 2: Customer adds 2x Truffle Burger and 1x San Sebastian Cheesecake
  const orderInput: CreateOrderRequestInput = {
    restaurantId: REST_ID,
    tableId: TABLE_ID,
    sessionToken: session.token,
    items: [
      { menuItemId: "item_truffle_burger", quantity: 2 },
      { menuItemId: "item_san_sebastian", quantity: 1 },
    ],
    idempotencyKey: `e2e_order_${Date.now()}`,
  };

  // Step 3: Canonical Order Creation on Server
  const orderRes = calculateAndCreateCanonicalOrder(orderInput, defaultCanonicalDataSource);
  assert(Boolean(orderRes.ok && orderRes.order), "Order submitted and created by canonical engine");
  const order = orderRes.order!;

  // Verify Minor Units Arithmetic:
  // Burger: 2 * 360 = 720 TL
  // Cheesecake: 1 * 180 = 180 TL
  // Subtotal = 900 TL
  // KDV (%10) = 90.00 TL -> Total = 990.00 TL
  assertEqual(order.subtotal, 900, "Subtotal is canonical 900.00 TL");
  assertEqual(order.totalAmount, 990, "Total amount is 990.00 TL");
  assertEqual(order.status, "PENDING_CONFIRMATION", "Initial state is PENDING_CONFIRMATION");

  // Step 4: Kitchen (KDS) receives and confirms order -> PREPARING
  const kdsTransition = validateOrderStateTransition(order.status, "PREPARING");
  assert(kdsTransition.valid, "KDS confirms order to PREPARING");
  order.status = "PREPARING";

  // Step 5: Kitchen finishes cooking -> READY
  const readyTransition = validateOrderStateTransition(order.status, "READY");
  assert(readyTransition.valid, "KDS moves order to READY");
  order.status = "READY";

  // Step 6: Waiter logs in with PIN and delivers food to Table 4 -> SERVED
  const waiterAuth = authenticateStaffWithPin(REST_ID, "staff_waiter_1", "1234");
  assert(waiterAuth.success && waiterAuth.token !== undefined, "Waiter successfully authenticated with PIN");

  const servedTransition = validateOrderStateTransition(order.status, "SERVED");
  assert(servedTransition.valid, "Waiter marks order as SERVED");
  order.status = "SERVED";

  // Step 7: Cashier handles settlement -> PAID_CASHIER
  const paymentTransition = validatePaymentTransition("PENDING", "PAID_CASHIER");
  assert(paymentTransition.valid, "Cashier completes payment to PAID_CASHIER");
  order.paymentStatus = "PAID_CASHIER";

  // Step 8: Order marked as COMPLETED
  const completedTransition = validateOrderStateTransition(order.status, "COMPLETED");
  assert(completedTransition.valid, "Order successfully closed as COMPLETED");
  order.status = "COMPLETED";

  // Step 9: Table is closed and all customer sessions for Table 4 are revoked
  const invalidatedCount = invalidateAllTableSessions(REST_ID, TABLE_ID);
  assert(invalidatedCount > 0, "Table sessions cleared upon table closing");

  // Verify customer cannot re-order with old QR link
  const postCloseCheck = validateTableSession(session.token, REST_ID, TABLE_ID);
  assert(!postCloseCheck.valid, "Customer QR session is completely disabled after bill closure");
});

// ==========================================
// 2. HUMAN ERROR & RAPID MULTI-CLICK RESILIENCE
// ==========================================
console.log("\n--- 2. HUMAN ERROR & RAPID MULTI-CLICK RESILIENCE ---");

runTest("Human Error 1: Rapid 10x Multi-Click Button Hammering Produces Single Order", () => {
  const session = createTableSession(REST_ID, TABLE_ID, "Masa 4", "rapid_clicker", 15);
  const sharedIdempotencyKey = `multi_click_${Date.now()}`;

  const input: CreateOrderRequestInput = {
    restaurantId: REST_ID,
    tableId: TABLE_ID,
    sessionToken: session.token,
    items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
    idempotencyKey: sharedIdempotencyKey,
  };

  // Simulate user rapidly double-clicking/tapping 10 times in 50ms
  const responses = Array.from({ length: 10 }, () =>
    calculateAndCreateCanonicalOrder(input, defaultCanonicalDataSource)
  );

  const successful = responses.filter((r) => r.ok && r.order);
  assertEqual(successful.length, 10, "All 10 clicks responded gracefully");

  const orderId = responses[0].order?.id;
  for (let i = 1; i < 10; i++) {
    assertEqual(responses[i].order?.id, orderId, "All 10 clicks returned the exact same unique order");
  }

  const replays = responses.filter((r) => r.isIdempotentReplay === true).length;
  assertEqual(replays, 9, "Exactly 9 requests detected as idempotent replays");
});

// ==========================================
// 3. COMPLETE FINANCIAL RECONCILIATION
// ==========================================
console.log("\n--- 3. FINANCIAL INTEGRITY & MONEY RECONCILIATION ---");

runTest("Financial 1: Cashier Partial + Full Payment Exactly Reconciles Remaining Balance", () => {
  const billTotal = 1050.50; // 1050.50 TL (105050 kuruş)
  const totalMinor = toMinorUnits(billTotal);

  // Customer A pays 500 TL (50000 kuruş)
  const part1Minor = toMinorUnits(500);
  // Customer B pays remaining 550.50 TL (55050 kuruş)
  const part2Minor = toMinorUnits(550.50);

  const remainingAfterPart1 = totalMinor - part1Minor;
  assertEqual(fromMinorUnits(remainingAfterPart1), 550.50, "Remaining balance after part 1 is exactly 550.50 TL");

  const finalRemaining = remainingAfterPart1 - part2Minor;
  assertEqual(finalRemaining, 0, "Final remaining balance is exactly 0.00 TL (0 kuruş drift)");
});

console.log("\n=================================================");
console.log(`ALL FAZ 10 E2E ACCEPTANCE TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
