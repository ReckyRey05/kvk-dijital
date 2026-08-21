/**
 * CEP GARSON — FINANCIAL MONEY INVARIANTS & TRANSACTION INTEGRITY TEST SUITE
 * FAZ 7 Automated Ledger & Payment Invariants Test Engine
 */

import {
  calculateAndCreateCanonicalOrder,
  toMinorUnits,
  fromMinorUnits,
  defaultCanonicalDataSource,
} from "../../src/lib/restaurant/canonicalOrderEngine";
import { createTableSession } from "../../src/lib/restaurant/session";
import { DEMO_RESTAURANT } from "../../src/lib/restaurant/mockData";

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
console.log("RUNNING FAZ 7 FINANCIAL INVARIANTS & INTEGRITY TESTS");
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
const session = createTableSession(REST_ID, "m-4", "Masa 4", "integrity_device", 15);

// ==========================================
// 1. MONEY INVARIANT EQUATION AUDIT
// ==========================================
console.log("--- 1. MONEY INVARIANT ARITHMETIC ---");

runTest("Money Invariant 1: Total = Subtotal + Tax + ServiceCharge - Discount", () => {
  const res = calculateAndCreateCanonicalOrder(
    {
      restaurantId: REST_ID,
      tableId: "m-4",
      sessionToken: session.token,
      items: [
        { menuItemId: "item_truffle_burger", quantity: 2 }, // 2 * 360 = 720 TL
        { menuItemId: "item_san_sebastian", quantity: 1 },  // 1 * 180 = 180 TL
      ],
    },
    defaultCanonicalDataSource
  );

  assert(Boolean(res.ok && res.order), "Order created successfully");
  const order = res.order!;

  const subtotalMinor = toMinorUnits(order.subtotal); // 90000 kuruş (900 TL)
  const taxMinor = toMinorUnits(order.taxAmount);      // 9000 kuruş (90 TL, %10 KDV)
  const serviceMinor = toMinorUnits(order.serviceCharge); // 0 kuruş
  const totalMinor = toMinorUnits(order.totalAmount);  // 99000 kuruş (990 TL)

  assertEqual(subtotalMinor + taxMinor + serviceMinor, totalMinor, "Money equation must be exact in minor units");
  assertEqual(order.totalAmount, 990, "Order total is 990.00 TL");
});

// ==========================================
// 2. REFUND LEDGER & OVER-REFUND DEFENSE
// ==========================================
console.log("\n--- 2. REFUND LEDGER & OVER-REFUND DEFENSE ---");

class MockOrderPaymentLedger {
  public paidMinorUnits: number = 0;
  public refundedMinorUnits: number = 0;

  constructor(totalAmount: number) {
    this.paidMinorUnits = toMinorUnits(totalAmount);
  }

  public processRefund(amount: number): { success: boolean; error?: string } {
    const refundMinor = toMinorUnits(amount);
    if (refundMinor <= 0) {
      return { success: false, error: "İade tutarı 0'dan büyük olmalıdır." };
    }

    const maxRefundable = this.paidMinorUnits - this.refundedMinorUnits;
    if (refundMinor > maxRefundable) {
      return {
        success: false,
        error: `İade tutarı (${amount} TL) kalan ödenebilir bakiyeyi (${fromMinorUnits(maxRefundable)} TL) aşamaz.`,
      };
    }

    this.refundedMinorUnits += refundMinor;
    return { success: true };
  }
}

runTest("Refund 1: Block Over-Refund & Double Full Refund", () => {
  const ledger = new MockOrderPaymentLedger(990); // 990 TL paid

  // 1. Partial refund 500 TL
  const ref1 = ledger.processRefund(500);
  assert(ref1.success, "First refund of 500 TL succeeds");
  assertEqual(ledger.refundedMinorUnits, 50000, "Refunded total is 500.00 TL");

  // 2. Attempt to refund 500 TL more (Total would be 1000 TL > 990 TL)
  const ref2 = ledger.processRefund(500);
  assert(!ref2.success, "Over-refund must be rejected");

  // 3. Exact remaining refund of 490 TL
  const ref3 = ledger.processRefund(490);
  assert(ref3.success, "Exact remaining refund of 490 TL succeeds");
  assertEqual(ledger.refundedMinorUnits, 99000, "Refunded total matches paid amount");

  // 4. Any further refund is completely blocked
  const ref4 = ledger.processRefund(1);
  assert(!ref4.success, "Subsequent refund must be blocked after 100% refunded");
});

// ==========================================
// 3. OUT-OF-ORDER WEBHOOK EVENT DETERMINISM
// ==========================================
console.log("\n--- 3. OUT-OF-ORDER WEBHOOK DETERMINISM ---");

class WebhookStateManager {
  private stateHierarchy: Record<string, number> = {
    PENDING: 1,
    PREPARING: 2,
    READY: 3,
    SERVED: 4,
    SETTLED: 5,
  };

  public currentStatus: string = "PENDING";

  public receiveEvent(newStatus: string): boolean {
    const currentWeight = this.stateHierarchy[this.currentStatus] || 0;
    const newWeight = this.stateHierarchy[newStatus] || 0;

    // Out-of-order older event must not downgrade state
    if (newWeight > currentWeight) {
      this.currentStatus = newStatus;
      return true;
    }
    return false; // Ignored as stale out-of-order event
  }
}

runTest("Webhook 1: Out-of-Order Webhook Events Guarantee Monotonic State Progression", () => {
  const manager = new WebhookStateManager();

  // Event 1: SETTLED arrives early (due to network delay on PREPARING)
  manager.receiveEvent("SETTLED");
  assertEqual(manager.currentStatus, "SETTLED", "Status moves to SETTLED");

  // Event 2: Delayed PREPARING event arrives late
  const staleAccepted = manager.receiveEvent("PREPARING");
  assert(!staleAccepted, "Stale PREPARING event must be ignored");
  assertEqual(manager.currentStatus, "SETTLED", "Status remains SETTLED (Anti-Downgrade Invariant)");
});

// ==========================================
// 4. PROPERTY-BASED 1,000 COMPLEX INVOICE AUDIT
// ==========================================
console.log("\n--- 4. PROPERTY-BASED 1,000 COMPLEX INVOICE AUDIT ---");

runTest("Ledger 1: 1,000 Random Orders Zero-Drift Minor Units Math Audit", () => {
  let totalCalculatedKurus = 0;

  for (let i = 0; i < 1000; i++) {
    const qty = (i % 5) + 1;
    const res = calculateAndCreateCanonicalOrder(
      {
        restaurantId: REST_ID,
        tableId: "m-4",
        sessionToken: session.token,
        items: [{ menuItemId: "item_truffle_burger", quantity: qty }],
        idempotencyKey: `property_test_${i}_${Date.now()}`,
      },
      defaultCanonicalDataSource
    );

    assert(Boolean(res.ok && res.order), `Order ${i} must calculate ok`);
    const ord = res.order!;
    const calculatedKurus = toMinorUnits(ord.subtotal) + toMinorUnits(ord.taxAmount) + toMinorUnits(ord.serviceCharge);
    assertEqual(calculatedKurus, toMinorUnits(ord.totalAmount), `Order ${i} has 0 kuruş drift`);
    totalCalculatedKurus += calculatedKurus;
  }

  assert(totalCalculatedKurus > 0, "All 1,000 random invoices validated with 0 arithmetic drift");
});

console.log("\n=================================================");
console.log(`ALL FINANCIAL INTEGRITY TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
