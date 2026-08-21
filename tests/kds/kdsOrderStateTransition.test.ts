/**
 * CEP GARSON — KDS ORDER STATE TRANSITION & REVERSION REGRESSION TEST
 * Validates PREPARING -> READY -> SERVED -> COMPLETED monotonic progression
 */

import { Order, OrderStatus } from "../../src/types/restaurant";
import { validateOrderStateTransition } from "../../src/lib/restaurant/stateMachine";

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

const STATUS_RANK: Record<string, number> = {
  PENDING_CONFIRMATION: 0,
  PREPARING: 1,
  READY: 2,
  SERVED: 3,
  COMPLETED: 4,
  CANCELLED: 99,
};

function mergeOrdersMonotonically(incomingOrders: Order[], currentOrders: Order[]): Order[] {
  if (!incomingOrders || incomingOrders.length === 0) return currentOrders;
  const currentMap = new Map(currentOrders.map((o) => [o.id, o]));

  return incomingOrders.map((inc) => {
    const curr = currentMap.get(inc.id);
    if (!curr) return inc;

    const incRank = STATUS_RANK[inc.status] ?? 0;
    const currRank = STATUS_RANK[curr.status] ?? 0;

    if (currRank > incRank && inc.status !== "CANCELLED") {
      return {
        ...inc,
        status: curr.status,
        readyAt: curr.readyAt || inc.readyAt,
        servedAt: curr.servedAt || inc.servedAt,
        completedAt: curr.completedAt || inc.completedAt,
      };
    }
    return inc;
  });
}

function runTest(testName: string, testFn: () => void) {
  try {
    testFn();
    console.log(`  [PASS] ${testName}`);
  } catch (err: any) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

console.log("=================================================");
console.log("RUNNING KDS STATE TRANSITION REGRESSION TESTS");
console.log("=================================================\n");

runTest("KDS 1: Linear state progression validation (PREPARING -> READY -> SERVED)", () => {
  const step1 = validateOrderStateTransition("PREPARING", "READY");
  assert(step1.valid, "PREPARING -> READY is a valid transition");

  const step2 = validateOrderStateTransition("READY", "SERVED");
  assert(step2.valid, "READY -> SERVED is a valid transition");

  const step3 = validateOrderStateTransition("SERVED", "COMPLETED");
  assert(step3.valid, "SERVED -> COMPLETED is a valid transition");
});

runTest("KDS 2: Backward state progression blocked by state machine (READY -> PREPARING)", () => {
  const invalidStep = validateOrderStateTransition("READY", "PREPARING");
  assert(!invalidStep.valid, "READY -> PREPARING must be blocked by state machine");
});

runTest("KDS 3: Stale Server Payload does NOT revert READY state to PREPARING", () => {
  const localOrder: Order = {
    id: "ord_kds_test_1",
    restaurantId: "rest_aura_bistro",
    tableId: "m-4",
    tableNumber: "Masa 4",
    sessionToken: "tok_test_1",
    status: "READY",
    items: [{ id: "item_1", menuItemId: "item_truffle_burger", name: "Trüflü Burger", quantity: 1, basePrice: 360, finalPrice: 360 }],
    subtotal: 360,
    taxAmount: 36,
    serviceCharge: 0,
    totalAmount: 396,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readyAt: new Date().toISOString(),
  };

  // Delayed stale in-flight GET payload arrives with PREPARING status
  const staleServerOrder: Order = {
    ...localOrder,
    status: "PREPARING",
    readyAt: undefined,
  };

  const merged = mergeOrdersMonotonically([staleServerOrder], [localOrder]);
  assertEqual(merged[0].status, "READY", "Merged order status must remain READY and not revert to PREPARING");
});

runTest("KDS 4: SERVED transition replaces READY and advances order", () => {
  const localReadyOrder: Order = {
    id: "ord_kds_test_2",
    restaurantId: "rest_aura_bistro",
    tableId: "m-4",
    tableNumber: "Masa 4",
    sessionToken: "tok_test_2",
    status: "READY",
    items: [{ id: "item_1", menuItemId: "item_truffle_burger", name: "Trüflü Burger", quantity: 1, basePrice: 360, finalPrice: 360 }],
    subtotal: 360,
    taxAmount: 36,
    serviceCharge: 0,
    totalAmount: 396,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readyAt: new Date().toISOString(),
  };

  // Waiter or Chef marks SERVED
  const servedOrder: Order = {
    ...localReadyOrder,
    status: "SERVED",
    servedAt: new Date().toISOString(),
  };

  const merged = mergeOrdersMonotonically([servedOrder], [localReadyOrder]);
  assertEqual(merged[0].status, "SERVED", "Order transitions to SERVED");
});

console.log("\n=================================================");
console.log("ALL KDS REGRESSION TESTS PASSED (100% SUCCESS)");
console.log("=================================================\n");
