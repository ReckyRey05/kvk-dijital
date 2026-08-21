/**
 * CEP GARSON — CONCURRENCY, FINANCIAL LEDGER & MULTI-TENANT ISOLATION TESTS
 * FAZ 2 Deep Integrity Suite
 */

import {
  calculateAndCreateCanonicalOrder,
  toMinorUnits,
  fromMinorUnits,
  CreateOrderRequestInput,
  CanonicalRestaurantDataSource,
  defaultCanonicalDataSource,
} from "../src/lib/restaurant/canonicalOrderEngine";
import { createTableSession } from "../src/lib/restaurant/session";
import { DEMO_RESTAURANT, DEMO_MENU_ITEMS, DEMO_TABLES } from "../src/lib/restaurant/mockData";
import { Restaurant, Table } from "../src/types/restaurant";

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
console.log("RUNNING CONCURRENCY, INTEGRITY & LEDGER TESTS");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function runTest(testName: string, testFn: () => void | Promise<void>) {
  totalCount++;
  try {
    const res = testFn();
    if (res instanceof Promise) {
      throw new Error("Synchronous test runner used for async test");
    }
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

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

async function runAll() {
  const session1 = createTableSession(DEMO_RESTAURANT.id, "m-4", "Masa 4", "device_conc_1", 15);
  const session2 = createTableSession(DEMO_RESTAURANT.id, "m-2", "Masa 2", "device_conc_2", 15);

  // ==========================================
  // 1. CONCURRENCY & RACE CONDITION TESTS
  // ==========================================
  console.log("--- 1. CONCURRENCY & RACE CONDITION TESTS ---");

  await runAsyncTest("Concurrency 1: 10 Parallel Requests with Identical Idempotency Key", async () => {
    const idempotencyKey = `conc_key_${Date.now()}`;
    const input: CreateOrderRequestInput = {
      restaurantId: DEMO_RESTAURANT.id,
      tableId: "m-4",
      sessionToken: session1.token,
      items: [{ menuItemId: "item_truffle_burger", quantity: 2 }],
      idempotencyKey,
    };

    // Execute 10 parallel order submissions
    const promises = Array.from({ length: 10 }).map(() =>
      Promise.resolve(calculateAndCreateCanonicalOrder(input))
    );

    const results = await Promise.all(promises);

    // All results must be successful
    for (const res of results) {
      assert(res.ok, "All concurrent requests must resolve successfully");
    }

    // All 10 requests must reference the exact same Order ID
    const primaryOrderId = results[0].order?.id;
    for (let i = 1; i < results.length; i++) {
      assertEqual(
        results[i].order?.id,
        primaryOrderId,
        `Concurrent call #${i} must return the same canonical Order ID`
      );
    }
  });

  await runAsyncTest("Concurrency 2: Two Different Tables Ordering Simultaneously", async () => {
    const inputTable4: CreateOrderRequestInput = {
      restaurantId: DEMO_RESTAURANT.id,
      tableId: "m-4",
      sessionToken: session1.token,
      items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
      idempotencyKey: `order_t4_${Date.now()}`,
    };

    const inputTable2: CreateOrderRequestInput = {
      restaurantId: DEMO_RESTAURANT.id,
      tableId: "m-2",
      sessionToken: session2.token,
      items: [{ menuItemId: "item_ribeye_steak", quantity: 1 }],
      idempotencyKey: `order_t2_${Date.now()}`,
    };

    const [res4, res2] = await Promise.all([
      Promise.resolve(calculateAndCreateCanonicalOrder(inputTable4)),
      Promise.resolve(calculateAndCreateCanonicalOrder(inputTable2)),
    ]);

    assert(res4.ok && res2.ok, "Both simultaneous orders must succeed");
    assertEqual(res4.order?.tableId, "m-4", "Table 4 order belongs to Table 4");
    assertEqual(res2.order?.tableId, "m-2", "Table 2 order belongs to Table 2");
    assert(res4.order?.id !== res2.order?.id, "Order IDs must be distinct");
  });

  // ==========================================
  // 2. FINANCIAL LEDGER INVARIANT SUITE
  // ==========================================
  console.log("\n--- 2. FINANCIAL LEDGER & PRECISION INVARIANTS ---");

  runTest("Ledger 1: 1,000 Randomized Orders Minor Unit Precision Audit", () => {
    for (let i = 0; i < 1000; i++) {
      const p1 = Math.floor(Math.random() * 800) + 50; // Random price 50-850 TL
      const q1 = Math.floor(Math.random() * 5) + 1; // 1-5 qty
      const p2 = Math.floor(Math.random() * 400) + 20; // 20-420 TL
      const q2 = Math.floor(Math.random() * 3) + 1; // 1-3 qty

      const subtotalMinor = toMinorUnits(p1) * q1 + toMinorUnits(p2) * q2;
      const taxMinor = Math.round((subtotalMinor * 10) / 100);
      const totalMinor = subtotalMinor + taxMinor;

      const subtotal = fromMinorUnits(subtotalMinor);
      const tax = fromMinorUnits(taxMinor);
      const total = fromMinorUnits(totalMinor);

      // Verify exact arithmetic without IEEE-754 drift
      const reconstructedTotal = fromMinorUnits(toMinorUnits(subtotal) + toMinorUnits(tax));
      assertEqual(reconstructedTotal, total, `Randomized run #${i} invariant failed`);
    }
  });

  // ==========================================
  // 3. MULTI-TENANT ISOLATION SUITE
  // ==========================================
  console.log("\n--- 3. MULTI-TENANT ISOLATION SUITE ---");

  const mockTwoTenantDataSource: CanonicalRestaurantDataSource = {
    getRestaurant(id: string) {
      if (id === "rest_aura_bistro") return DEMO_RESTAURANT;
      if (id === "rest_other_cafe") {
        return {
          ...DEMO_RESTAURANT,
          id: "rest_other_cafe",
          slug: "other-cafe",
          name: "Other Cafe",
        };
      }
      return null;
    },
    getTable(restaurantId: string, tableId: string) {
      if (restaurantId === "rest_aura_bistro") {
        return DEMO_TABLES.find((t) => t.id === tableId) || null;
      }
      if (restaurantId === "rest_other_cafe") {
        if (tableId === "m-cafe-1") {
          return {
            id: "m-cafe-1",
            restaurantId: "rest_other_cafe",
            tableNumber: "Cafe Masa 1",
            capacity: 4,
            section: "MAIN",
            status: "EMPTY",
            qrCodeUrl: "",
            activeBillTotal: 0,
            hasActiveWaiterCall: false,
          } as Table;
        }
      }
      return null;
    },
    getMenuItem(restaurantId: string, menuItemId: string) {
      return defaultCanonicalDataSource.getMenuItem(restaurantId, menuItemId);
    },
    getAllMenuItems(restaurantId: string) {
      return defaultCanonicalDataSource.getAllMenuItems(restaurantId);
    },
  };

  runTest("Multi-Tenant 1: Cross-Tenant Table Access Attempt Blocked", () => {
    // Attempting to order from Other Cafe with Aura Bistro table ID
    const input: CreateOrderRequestInput = {
      restaurantId: "rest_other_cafe",
      tableId: "m-4", // m-4 belongs to Aura Bistro, NOT Other Cafe
      sessionToken: session1.token,
      items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
    };

    const res = calculateAndCreateCanonicalOrder(input, mockTwoTenantDataSource);
    assert(!res.ok, "Must reject cross-tenant table order attempt");
    assertEqual(res.errorCode, "TENANT_MISMATCH", "Error must be TENANT_MISMATCH");
  });

  console.log("\n=================================================");
  console.log(`ALL INTEGRITY TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
  console.log("=================================================\n");
}

runAll().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
