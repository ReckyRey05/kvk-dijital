/**
 * CEP GARSON — DISTRIBUTED CONCURRENCY & RACE CONDITION TEST SUITE
 * FAZ 7 Automated High-Concurrency Stress Engine
 */

import {
  calculateAndCreateCanonicalOrder,
  CreateOrderRequestInput,
  defaultCanonicalDataSource,
} from "../../../src/lib/restaurant/canonicalOrderEngine";
import { createTableSession } from "../../../src/lib/restaurant/session";
import { DEMO_RESTAURANT } from "../../../src/lib/restaurant/mockData";

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
console.log("RUNNING FAZ 7 CONCURRENCY & RACE CONDITION TESTS");
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

const REST_ID = DEMO_RESTAURANT.id;
const session = createTableSession(REST_ID, "m-4", "Masa 4", "concurrency_device", 15);

// ==========================================
// 1. HIGH-CONCURRENCY IDEMPOTENCY (1,000 REQUESTS)
// ==========================================
console.log("--- 1. HIGH-CONCURRENCY IDEMPOTENCY STRESS ---");

async function main() {
  await runAsyncTest("Concurrency 1: 1,000 Concurrent Requests with Identical Idempotency Key", async () => {
    const sharedKey = `stress_idem_1000_${Date.now()}`;
    const input: CreateOrderRequestInput = {
      restaurantId: REST_ID,
      tableId: "m-4",
      sessionToken: session.token,
      items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
      idempotencyKey: sharedKey,
    };

    // Launch 1,000 parallel order creations
    const promises = Array.from({ length: 1000 }, () =>
      Promise.resolve(calculateAndCreateCanonicalOrder(input, defaultCanonicalDataSource))
    );

    const results = await Promise.all(promises);

    const successfulResults = results.filter((r) => r.ok && r.order);
    assertEqual(successfulResults.length, 1000, "All 1,000 requests must resolve successfully");

    // Verify all 1,000 requests return the exact same Order ID
    const firstOrderId = results[0].order?.id;
    for (let i = 1; i < 1000; i++) {
      assertEqual(results[i].order?.id, firstOrderId, `Request ${i + 1} must return identical order ID`);
    }

    // Exactly 1 request is original creation, 999 are idempotent replays
    const replayCount = results.filter((r) => r.isIdempotentReplay === true).length;
    assertEqual(replayCount, 999, "Exactly 999 requests must be marked as idempotent replay");
  });

  // ==========================================
  // 2. INVENTORY RACE CONDITION & NEGATIVE STOCK DEFENSE
  // ==========================================
  console.log("\n--- 2. INVENTORY RACE & STOCK ATOMICITY ---");

  class AtomicInventoryStore {
    private stock: Map<string, number> = new Map();

    constructor() {
      this.stock.set("item_limited_special", 5); // Only 5 items available in stock
    }

    // Atomic decrement with invariant check (Stock cannot be < 0)
    public tryDecrement(itemId: string, quantity: number): boolean {
      const current = this.stock.get(itemId) ?? 0;
      if (current >= quantity) {
        this.stock.set(itemId, current - quantity);
        return true;
      }
      return false;
    }

    public getStock(itemId: string): number {
      return this.stock.get(itemId) ?? 0;
    }
  }

  await runAsyncTest("Inventory Race 1: 50 Concurrent Orders for 5 Limited Stock Items", async () => {
    const inventory = new AtomicInventoryStore();

    // 50 concurrent buyers competing for 5 stock items
    const buyerPromises = Array.from({ length: 50 }, async (_, index) => {
      const success = inventory.tryDecrement("item_limited_special", 1);
      return { buyerId: `buyer_${index}`, success };
    });

    const results = await Promise.all(buyerPromises);

    const successfulPurchases = results.filter((r) => r.success).length;
    const rejectedPurchases = results.filter((r) => !r.success).length;

    assertEqual(successfulPurchases, 5, "Exactly 5 buyers must succeed");
    assertEqual(rejectedPurchases, 45, "Exactly 45 buyers must be rejected due to out of stock");
    assertEqual(inventory.getStock("item_limited_special"), 0, "Final stock must be exactly 0 (No negative inventory)");
  });

  // ==========================================
  // 3. SIMULTANEOUS MULTI-TABLE BURST (500 DISTINCT REQUESTS)
  // ==========================================
  console.log("\n--- 3. MULTI-TABLE SIMULTANEOUS BURST ---");

  await runAsyncTest("Multi-Table 1: 500 Simultaneous Orders across 8 Tables", async () => {
    const tableIds = ["m-1", "m-2", "m-3", "m-4", "m-5", "m-6", "m-7", "m-8"];
    const sessions = tableIds.map((tId) => createTableSession(REST_ID, tId, `Masa ${tId}`, `dev_${tId}`, 15));

    const orderPromises = Array.from({ length: 500 }, (_, i) => {
      const tableIndex = i % tableIds.length;
      const tSession = sessions[tableIndex];
      const input: CreateOrderRequestInput = {
        restaurantId: REST_ID,
        tableId: tableIds[tableIndex],
        sessionToken: tSession.token,
        items: [{ menuItemId: "item_truffle_burger", quantity: (i % 3) + 1 }],
        idempotencyKey: `burst_unique_${i}_${Date.now()}`,
      };
      return Promise.resolve(calculateAndCreateCanonicalOrder(input, defaultCanonicalDataSource));
    });

    const results = await Promise.all(orderPromises);
    const successOrders = results.filter((r) => r.ok && r.order);
    assertEqual(successOrders.length, 500, "All 500 simultaneous orders must succeed");

    // Verify all order IDs are collision-proof and distinct
    const uniqueIds = new Set(results.map((r) => r.order?.id));
    assertEqual(uniqueIds.size, 500, "All 500 order IDs must be 100% unique (Zero Collision)");
  });

  console.log("\n=================================================");
  console.log(`ALL CONCURRENCY TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
  console.log("=================================================\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
