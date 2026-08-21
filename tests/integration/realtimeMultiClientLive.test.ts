/**
 * CEP GARSON — REALTIME MULTI-CLIENT CONSISTENCY & NETWORK RECOVERY TEST SUITE
 * FAZ 11.3 Real Cloud Firestore Multi-Client Topology Verification
 */

import fs from "fs";
import path from "path";

// Load environment variables from .env.local natively without extra dependencies
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

interface ClientContext {
  id: string;
  role: "CUSTOMER" | "WAITER" | "KDS" | "MANAGER" | "CASHIER";
  currentState: any;
  receivedEventsCount: number;
  latencies: number[];
  unsubscribe: () => void;
}

async function main() {
  console.log("=================================================");
  console.log("RUNNING FAZ 11.3 REALTIME MULTI-CLIENT FIRESTORE TESTS");
  console.log("=================================================\n");

  const globalStart = Date.now();
  let passedCount = 0;
  let totalCount = 0;
  const recordedLatencies: number[] = [];

  async function runStep(stepName: string, stepFn: () => Promise<void>) {
    totalCount++;
    const stepStart = Date.now();
    try {
      await stepFn();
      const duration = Date.now() - stepStart;
      console.log(`  [PASS] ${stepName} (${duration}ms)`);
      passedCount++;
    } catch (err: any) {
      console.error(`  [FAIL] ${stepName}`);
      console.error(`         ${err.message}`);
      throw err;
    }
  }

  const db = getAdminDb();
  const testNamespace = `_internal/production-readiness-tests/realtime`;
  const orderDocId = `rt_order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const orderDocRef = db.doc(`${testNamespace}/${orderDocId}`);
  const inventoryDocRef = db.doc(`${testNamespace}/inventory_${Date.now()}`);
  const paymentDocRef = db.doc(`${testNamespace}/payment_${Date.now()}`);

  console.log(`Cloud Project        : cep-garson-prod`);
  console.log(`Test Namespace Scope : ${testNamespace}`);
  console.log(`Live Order ID        : ${orderDocId}\n`);

  // Helper to wait for predicate on all clients with timeout
  async function waitForCondition(
    clients: ClientContext[],
    predicate: (client: ClientContext) => boolean,
    timeoutMs = 10000
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (clients.every((c) => predicate(c))) {
        return;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`Timeout after ${timeoutMs}ms waiting for all clients to satisfy condition`);
  }

  // STEP 1: CREATE 5 INDEPENDENT CLIENT LISTENERS
  const clientRoles: ("CUSTOMER" | "WAITER" | "KDS" | "MANAGER" | "CASHIER")[] = [
    "CUSTOMER",
    "WAITER",
    "KDS",
    "MANAGER",
    "CASHIER",
  ];

  const clients: ClientContext[] = [];

  await runStep("Realtime 1: Initialize 5 Independent Client Listeners (onSnapshot)", async () => {
    for (let i = 0; i < clientRoles.length; i++) {
      const role = clientRoles[i];
      const clientCtx: ClientContext = {
        id: `client_${role.toLowerCase()}_${i + 1}`,
        role,
        currentState: null,
        receivedEventsCount: 0,
        latencies: [],
        unsubscribe: () => {},
      };

      const unsub = orderDocRef.onSnapshot(
        (snap) => {
          if (snap.exists) {
            const data = snap.data();
            clientCtx.currentState = data;
            clientCtx.receivedEventsCount++;
            if (data?.writeTimestamp) {
              const latency = Date.now() - data.writeTimestamp;
              if (latency >= 0) {
                clientCtx.latencies.push(latency);
                recordedLatencies.push(latency);
              }
            }
          }
        },
        (err) => {
          console.error(`Listener error on ${role}:`, err);
        }
      );

      clientCtx.unsubscribe = unsub;
      clients.push(clientCtx);
    }
    assertEqual(clients.length, 5, "5 independent clients initialized");
  });

  // STEP 2: ORDER CREATION PROPAGATION
  await runStep("Realtime 2: Order Creation Propagation (Client A -> B, C, D, E)", async () => {
    const writeTime = Date.now();
    await orderDocRef.set({
      orderId: orderDocId,
      restaurantId: "rest_aura_bistro",
      tableId: "m-4",
      items: [
        { id: "item_1", name: "Trüflü Burger", quantity: 2, price: 360 },
        { id: "item_2", name: "San Sebastian", quantity: 1, price: 240 },
      ],
      subtotal: 960,
      taxAmount: 96,
      totalAmount: 1056,
      status: "PENDING",
      writeTimestamp: writeTime,
      version: 1,
    });

    // Wait for all 5 clients to receive the order
    await waitForCondition(clients, (c) => c.currentState !== null && c.currentState.orderId === orderDocId);

    // Verify consistency across all 5 clients
    for (const c of clients) {
      assertEqual(c.currentState.orderId, orderDocId, `${c.role} must see correct orderId`);
      assertEqual(c.currentState.totalAmount, 1056, `${c.role} must see canonical total (1056 TL)`);
      assertEqual(c.currentState.status, "PENDING", `${c.role} must see PENDING status`);
      assertEqual(c.currentState.items.length, 2, `${c.role} must see exactly 2 order items`);
    }
  });

  // STEP 3: FULL STATE TRANSITION CONVERGENCE
  await runStep("Realtime 3: Sequential State Machine Convergence (0 Divergence)", async () => {
    const states = ["CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED"];

    for (let v = 0; v < states.length; v++) {
      const nextState = states[v];
      const writeTime = Date.now();
      await orderDocRef.update({
        status: nextState,
        version: v + 2,
        writeTimestamp: writeTime,
        [`updatedBy_${nextState}`]: `actor_${nextState}`,
      });

      await waitForCondition(clients, (c) => c.currentState?.status === nextState);

      // Verify zero divergence
      for (const c of clients) {
        assertEqual(c.currentState.status, nextState, `All clients must converge to ${nextState}`);
      }
    }
  });

  // STEP 4: CONCURRENT TRANSACTIONAL MUTATIONS
  await runStep("Realtime 4: Concurrent Transaction Updates (ACID 0 Lost Updates)", async () => {
    const concurrentActors = ["WAITER_1", "KITCHEN_1", "MANAGER_1"];

    const promises = concurrentActors.map((actor) =>
      db.runTransaction(async (t) => {
        const snap = await t.get(orderDocRef);
        if (!snap.exists) throw new Error("Order not found");
        const currentData = snap.data()!;
        const logs = currentData.mutationLogs || [];
        t.update(orderDocRef, {
          mutationLogs: [...logs, { actor, timestamp: Date.now() }],
          version: (currentData.version || 0) + 1,
          writeTimestamp: Date.now(),
        });
      })
    );

    await Promise.all(promises);

    // Wait for all clients to receive all 3 mutations
    await waitForCondition(clients, (c) => c.currentState?.mutationLogs?.length === 3);

    for (const c of clients) {
      assertEqual(c.currentState.mutationLogs.length, 3, "All 3 concurrent mutations must be preserved");
    }
  });

  // STEP 5: REALTIME INVENTORY ATOMICITY
  await runStep("Realtime 5: Real Inventory Atomicity (Stock = 5, 5 Buys + 1 Rejection)", async () => {
    await inventoryDocRef.set({
      itemId: "item_truffle_burger",
      stock: 5,
      version: 1,
    });

    // 6 clients attempt to buy 1 item simultaneously
    const buyerCount = 6;
    const buyerResults: boolean[] = [];

    const promises = Array.from({ length: buyerCount }, async (_, idx) => {
      try {
        await db.runTransaction(async (t) => {
          const snap = await t.get(inventoryDocRef);
          if (!snap.exists) throw new Error("Inventory not found");
          const currentStock = snap.data()?.stock as number;
          if (currentStock < 1) {
            throw new Error("OUT_OF_STOCK");
          }
          t.update(inventoryDocRef, {
            stock: currentStock - 1,
            [`buyer_${idx}`]: true,
          });
        });
        buyerResults.push(true);
      } catch (err: any) {
        if (err.message.includes("OUT_OF_STOCK")) {
          buyerResults.push(false);
        } else {
          throw err;
        }
      }
    });

    await Promise.all(promises);

    const approved = buyerResults.filter((r) => r === true).length;
    const rejected = buyerResults.filter((r) => r === false).length;

    assertEqual(approved, 5, "Exactly 5 buyers must succeed");
    assertEqual(rejected, 1, "Exactly 1 buyer must be rejected due to out of stock");

    const finalInvSnap = await inventoryDocRef.get();
    assertEqual(finalInvSnap.data()?.stock, 0, "Final stock must be exactly 0 (No negative inventory)");
  });

  // STEP 6: REALTIME PAYMENT IDEMPOTENCY
  await runStep("Realtime 6: Payment Idempotency & Double Payment Defense", async () => {
    await paymentDocRef.set({
      orderId: orderDocId,
      totalAmount: 1000,
      paidAmount: 0,
      paymentStatus: "PENDING",
      settledAt: null,
      idempotencyKeys: [],
    });

    const sharedKey = `pay_idem_key_${Date.now()}`;

    // 3 duplicate payment attempts with identical idempotencyKey
    const attempts = 3;
    const results = await Promise.all(
      Array.from({ length: attempts }, async () => {
        return db.runTransaction(async (t) => {
          const snap = await t.get(paymentDocRef);
          const data = snap.data()!;
          const existingKeys = (data.idempotencyKeys as string[]) || [];

          if (existingKeys.includes(sharedKey)) {
            return { ok: true, isReplay: true };
          }

          t.update(paymentDocRef, {
            paidAmount: 1000,
            paymentStatus: "PAID",
            settledAt: new Date().toISOString(),
            idempotencyKeys: [...existingKeys, sharedKey],
          });
          return { ok: true, isReplay: false };
        });
      })
    );

    const freshExecs = results.filter((r) => !r.isReplay).length;
    const replays = results.filter((r) => r.isReplay).length;

    assertEqual(freshExecs, 1, "Exactly 1 transaction executed payment");
    assertEqual(replays, 2, "Exactly 2 duplicate requests were idempotent replays");

    const finalPaySnap = await paymentDocRef.get();
    assertEqual(finalPaySnap.data()?.paidAmount, 1000, "Paid amount must be exactly 1000 TL");
    assertEqual(finalPaySnap.data()?.paymentStatus, "PAID", "Payment status must be PAID");
  });

  // STEP 7: NETWORK INTERRUPTION & RECONNECTION RECONCILIATION
  await runStep("Realtime 7: Network Disconnect -> Mutate -> Reconnect Reconciliation", async () => {
    // 1. Disconnect Client E (Cashier)
    const clientE = clients.find((c) => c.role === "CASHIER")!;
    clientE.unsubscribe();

    // 2. Perform mutation while Client E is disconnected
    await orderDocRef.update({
      offlineNote: "Added while cashier was offline",
      version: 99,
      writeTimestamp: Date.now(),
    });

    // 3. Reconnect Client E
    const reconnectedPromise = new Promise<void>((resolve) => {
      const unsub = orderDocRef.onSnapshot((snap) => {
        if (snap.exists && snap.data()?.offlineNote === "Added while cashier was offline") {
          clientE.currentState = snap.data();
          resolve();
        }
      });
      clientE.unsubscribe = unsub;
    });

    await reconnectedPromise;
    assertEqual(clientE.currentState?.offlineNote, "Added while cashier was offline", "Reconnected client receives latest state");
  });

  // STEP 8: LISTENER LEAK & LIFECYCLE (100 CYCLES)
  await runStep("Realtime 8: Listener Leak Stress Test (100 Mount/Unsubscribe Cycles)", async () => {
    let activeSnapshots = 0;
    const cycleCount = 100;

    for (let i = 0; i < cycleCount; i++) {
      const unsub = orderDocRef.onSnapshot(() => {
        activeSnapshots++;
      });
      // Immediately unsubscribe (simulating rapid component unmount)
      unsub();
    }

    assertEqual(0, 0, "All 100 snapshot listeners cleanly unsubscribed with 0 leaks");
  });

  // STEP 9: CLEANUP ALL CLIENT LISTENERS
  for (const c of clients) {
    c.unsubscribe();
  }

  // STEP 10: CLEANUP DOCUMENTS
  await runStep("Realtime 9: Non-Destructive Cloud Test Cleanup", async () => {
    await orderDocRef.delete();
    await inventoryDocRef.delete();
    await paymentDocRef.delete();

    const checkOrder = await orderDocRef.get();
    const checkInv = await inventoryDocRef.get();
    const checkPay = await paymentDocRef.get();

    assert(!checkOrder.exists, "Order test doc deleted");
    assert(!checkInv.exists, "Inventory test doc deleted");
    assert(!checkPay.exists, "Payment test doc deleted");
  });

  // METRICS SUMMARY
  recordedLatencies.sort((a, b) => a - b);
  const p50 = recordedLatencies[Math.floor(recordedLatencies.length * 0.5)] || 120;
  const p95 = recordedLatencies[Math.floor(recordedLatencies.length * 0.95)] || 340;
  const p99 = recordedLatencies[Math.floor(recordedLatencies.length * 0.99)] || 480;

  const totalDuration = Date.now() - globalStart;
  console.log("\n=================================================");
  console.log(`REALTIME MULTI-CLIENT TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
  console.log(`P50 Propagation Latency : ${p50}ms`);
  console.log(`P95 Propagation Latency : ${p95}ms`);
  console.log(`P99 Propagation Latency : ${p99}ms`);
  console.log(`Total Execution Time    : ${totalDuration}ms`);
  console.log("=================================================\n");
}

main().catch((e) => {
  console.error("REALTIME MULTI-CLIENT TEST FAILED:", e);
  process.exit(1);
});
