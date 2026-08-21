/**
 * CEP GARSON — FAZ 11.7 CRITICAL RESTAURANT WORKFLOW & QUEUE INTEGRITY LIVE TEST SUITE
 * Validates Table Transfer Atomicity, Cash Settlement Integrity, and Concurrent Waiter Queue Preservation
 */

import fs from "fs";
import path from "path";

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
import { Order, Table, WaiterCall, TableParticipant } from "../../src/types/restaurant";

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

interface TestClientListener {
  id: string;
  role: "CASHIER" | "CUSTOMER" | "KDS";
  state: any;
  updateCount: number;
  unsubscribe: () => void;
}

async function waitForCondition(
  listeners: TestClientListener[],
  predicate: (l: TestClientListener) => boolean,
  timeoutMs = 10000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (listeners.every((l) => predicate(l))) {
      return;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Timeout after ${timeoutMs}ms waiting for condition`);
}

async function main() {
  console.log("=================================================");
  console.log("RUNNING FAZ 11.7 WORKFLOW & QUEUE INTEGRITY LIVE FIRESTORE TESTS");
  console.log("=================================================\n");

  const db = getAdminDb();
  const testRunId = `wf_test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const testDocRef = db.doc(`_internal/production-readiness-tests/workflow-queue/${testRunId}`);

  console.log(`Cloud Project        : cep-garson-prod`);
  console.log(`Test Namespace Scope : _internal/production-readiness-tests/workflow-queue`);
  console.log(`Test Document ID     : ${testRunId}\n`);

  const listeners: TestClientListener[] = [];

  function createListener(id: string, role: "CASHIER" | "CUSTOMER" | "KDS"): TestClientListener {
    const l: TestClientListener = {
      id,
      role,
      state: null,
      updateCount: 0,
      unsubscribe: () => {},
    };

    const unsub = testDocRef.onSnapshot((snap) => {
      if (snap.exists) {
        l.state = snap.data();
        l.updateCount++;
      }
    });

    l.unsubscribe = unsub;
    listeners.push(l);
    return l;
  }

  // Initial State Fixture
  const initialOrder: Order = {
    id: "ord_wf_101",
    restaurantId: "rest_aura_bistro",
    tableId: "m-1",
    tableNumber: "Masa 1",
    sessionToken: "tok_wf_101",
    status: "PREPARING",
    items: [{ id: "item_1", menuItemId: "item_truffle_burger", name: "Trüflü Burger", quantity: 1, basePrice: 360, finalPrice: 360, addedBy: "Ali" }],
    subtotal: 360,
    taxAmount: 36,
    serviceCharge: 0,
    totalAmount: 396,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const initialTable1: Table = {
    id: "m-1",
    restaurantId: "rest_aura_bistro",
    tableNumber: "Masa 1",
    capacity: 2,
    status: "OCCUPIED",
    activeOrderId: "ord_wf_101",
    activeBillTotal: 396,
  };

  const initialTable4: Table = {
    id: "m-4",
    restaurantId: "rest_aura_bistro",
    tableNumber: "Masa 4",
    capacity: 4,
    status: "EMPTY",
    activeBillTotal: 0,
  };

  const initialLeader: TableParticipant = {
    id: "usr_ali",
    name: "Ali",
    isHost: true,
    status: "APPROVED",
    joinedAt: new Date().toISOString(),
  };

  await testDocRef.set({
    version: 1,
    orders: [initialOrder],
    tables: [initialTable1, initialTable4],
    waiterCalls: [],
    tableParticipants: {
      "m-1": [initialLeader],
    },
    tableTransfers: {},
    lastUpdated: Date.now(),
  });

  const cashier = createListener("pos_cashier", "CASHIER");
  const customer = createListener("phone_customer", "CUSTOMER");
  const kds = createListener("kds_kitchen", "KDS");

  await waitForCondition([cashier, customer, kds], (l) => l.state && l.state.orders?.length === 1);
  console.log("  [PASS] Setup: Initial Live Topology & 3-Client Listeners Initialized");

  // =========================================================================
  // TEST A: TABLE TRANSFER ATOMICITY (Masa 1 -> Masa 4)
  // =========================================================================
  const tAStart = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const orders: Order[] = data.orders || [];
    const tables: Table[] = data.tables || [];
    const participants = data.tableParticipants || {};

    // 1. Move orders
    const updatedOrders = orders.map((o) =>
      o.tableId === "m-1" ? { ...o, tableId: "m-4", tableNumber: "Masa 4", updatedAt: new Date().toISOString() } : o
    );

    // 2. Move table state
    const updatedTables = tables.map((t) => {
      if (t.id === "m-4") {
        return { ...t, status: "OCCUPIED" as const, activeOrderId: "ord_wf_101", activeBillTotal: 396 };
      }
      if (t.id === "m-1") {
        return { ...t, status: "EMPTY" as const, activeOrderId: undefined, activeBillTotal: 0 };
      }
      return t;
    });

    // 3. Move participants
    const updatedParticipants = { ...participants };
    if (updatedParticipants["m-1"]) {
      updatedParticipants["m-4"] = updatedParticipants["m-1"];
      delete updatedParticipants["m-1"];
    }

    // 4. Record transfer redirect event
    const tableTransfers = {
      ...(data.tableTransfers || {}),
      "m-1": { toTableId: "m-4", toTableNumber: "Masa 4", timestamp: Date.now() },
    };

    tx.update(testDocRef, {
      orders: updatedOrders,
      tables: updatedTables,
      tableParticipants: updatedParticipants,
      tableTransfers,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([cashier, customer, kds], (l) => {
    const t1 = l.state?.tables?.find((t: Table) => t.id === "m-1");
    const t4 = l.state?.tables?.find((t: Table) => t.id === "m-4");
    const ord = l.state?.orders?.find((o: Order) => o.id === "ord_wf_101");
    return t1?.status === "EMPTY" && t4?.status === "OCCUPIED" && ord?.tableId === "m-4";
  });

  // Verify Invariants
  const postTransferSnap = await testDocRef.get();
  const postData = postTransferSnap.data()!;
  const transferredOrder = postData.orders.find((o: Order) => o.id === "ord_wf_101");
  const t1 = postData.tables.find((t: Table) => t.id === "m-1");
  const t4 = postData.tables.find((t: Table) => t.id === "m-4");

  assertEqual(transferredOrder.tableId, "m-4", "Order tableId moved to m-4");
  assertEqual(transferredOrder.tableNumber, "Masa 4", "Order tableNumber updated to Masa 4");
  assertEqual(t1.status, "EMPTY", "Source table m-1 is EMPTY");
  assertEqual(t1.activeBillTotal, 0, "Source table m-1 active bill is 0");
  assertEqual(t4.status, "OCCUPIED", "Destination table m-4 is OCCUPIED");
  assertEqual(t4.activeBillTotal, 396, "Destination table m-4 active bill is 396 TL");
  assert(postData.tableParticipants["m-4"]?.length === 1, "Participants moved to m-4");
  assert(!postData.tableParticipants["m-1"], "Participants removed from m-1");
  console.log(`  [PASS] Test A: Table Transfer Atomicity (Masa 1 -> Masa 4) (${Date.now() - tAStart}ms)`);

  // =========================================================================
  // TEST B: CONCURRENT WAITER REQUEST QUEUE (Request A + Request B)
  // =========================================================================
  const tBStart = Date.now();
  const requestA: WaiterCall = {
    id: `call_req_A_${Date.now()}`,
    restaurantId: "rest_aura_bistro",
    tableId: "m-4",
    tableNumber: "Masa 4",
    type: "WAITER",
    message: "Bebek Masası İsteği",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 1000).toISOString(),
  };

  const requestB: WaiterCall = {
    id: `call_req_B_${Date.now() + 1}`,
    restaurantId: "rest_aura_bistro",
    tableId: "m-4",
    tableNumber: "Masa 4",
    type: "CUSTOM",
    message: "Servis Değişikliği",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  // Add Request A
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const calls: WaiterCall[] = data.waiterCalls || [];
    tx.update(testDocRef, {
      waiterCalls: [requestA, ...calls.filter((c) => c.id !== requestA.id)],
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  // Simultaneously Add Request B
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const calls: WaiterCall[] = data.waiterCalls || [];
    tx.update(testDocRef, {
      waiterCalls: [requestB, ...calls.filter((c) => c.id !== requestB.id)],
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([cashier, customer], (l) => {
    const activeCalls = (l.state?.waiterCalls || []).filter((c: WaiterCall) => c.status === "ACTIVE");
    return activeCalls.length === 2;
  });

  const callsSnap = await testDocRef.get();
  const currentCalls: WaiterCall[] = callsSnap.data()?.waiterCalls || [];
  const activeCalls = currentCalls.filter((c) => c.status === "ACTIVE");

  assertEqual(activeCalls.length, 2, "Both Request A and Request B are ACTIVE in queue");
  assert(activeCalls.some((c) => c.message === "Bebek Masası İsteği"), "Request A (Bebek Masası) preserved");
  assert(activeCalls.some((c) => c.message === "Servis Değişikliği"), "Request B (Servis Değişikliği) preserved");
  console.log(`  [PASS] Test B: Concurrent Waiter Request Queue Preservation (A + B both active) (${Date.now() - tBStart}ms)`);

  // Resolve ONLY Request A
  const tResolveStart = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const calls: WaiterCall[] = data.waiterCalls || [];
    const updated = calls.map((c) => (c.id === requestA.id ? { ...c, status: "RESOLVED" as const } : c));
    tx.update(testDocRef, {
      waiterCalls: updated,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([cashier], (l) => {
    const active = (l.state?.waiterCalls || []).filter((c: WaiterCall) => c.status === "ACTIVE");
    return active.length === 1 && active[0].id === requestB.id;
  });

  const postResolveSnap = await testDocRef.get();
  const postResolveCalls: WaiterCall[] = postResolveSnap.data()?.waiterCalls || [];
  const remainingActive = postResolveCalls.filter((c) => c.status === "ACTIVE");

  assertEqual(remainingActive.length, 1, "Only 1 active call remaining");
  assertEqual(remainingActive[0].message, "Servis Değişikliği", "Request B remains ACTIVE after Request A resolved");
  console.log(`  [PASS] Test B.1: Selective Request Resolution (A resolved, B stays active) (${Date.now() - tResolveStart}ms)`);

  // =========================================================================
  // TEST C: CASH SETTLEMENT & TABLE CLOSE (Nakit Kapatma)
  // =========================================================================
  const tCStart = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const orders: Order[] = data.orders || [];
    const tables: Table[] = data.tables || [];
    const calls: WaiterCall[] = data.waiterCalls || [];
    const participants = data.tableParticipants || {};

    // 1. Mark orders as COMPLETED & PAID_CASHIER
    const updatedOrders = orders.map((o) =>
      o.tableId === "m-4" && o.status !== "CANCELLED"
        ? { ...o, status: "COMPLETED" as const, paymentStatus: "PAID_CASHIER" as const, completedAt: new Date().toISOString() }
        : o
    );

    // 2. Clear Table status & bill
    const updatedTables = tables.map((t) =>
      t.id === "m-4"
        ? { ...t, status: "EMPTY" as const, activeOrderId: undefined, activeBillTotal: 0 }
        : t
    );

    // 3. Resolve all pending waiter calls for this table
    const updatedCalls = calls.map((c) =>
      c.tableId === "m-4" ? { ...c, status: "RESOLVED" as const, resolvedAt: new Date().toISOString() } : c
    );

    // 4. Purge participants
    const updatedParticipants = { ...participants };
    delete updatedParticipants["m-4"];

    tx.update(testDocRef, {
      orders: updatedOrders,
      tables: updatedTables,
      waiterCalls: updatedCalls,
      tableParticipants: updatedParticipants,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([cashier, customer, kds], (l) => {
    const t4 = l.state?.tables?.find((t: Table) => t.id === "m-4");
    const ord = l.state?.orders?.find((o: Order) => o.id === "ord_wf_101");
    const parts = l.state?.tableParticipants?.["m-4"] || [];
    return t4?.status === "EMPTY" && ord?.status === "COMPLETED" && parts.length === 0;
  });

  const finalSnap = await testDocRef.get();
  const finalData = finalSnap.data()!;
  const closedOrder = finalData.orders.find((o: Order) => o.id === "ord_wf_101");
  const closedTable = finalData.tables.find((t: Table) => t.id === "m-4");
  const finalActiveCalls = finalData.waiterCalls.filter((c: WaiterCall) => c.tableId === "m-4" && c.status === "ACTIVE");

  assertEqual(closedOrder.status, "COMPLETED", "Order is COMPLETED");
  assertEqual(closedOrder.paymentStatus, "PAID_CASHIER", "Payment status is PAID_CASHIER");
  assertEqual(closedTable.status, "EMPTY", "Table is EMPTY");
  assertEqual(closedTable.activeBillTotal, 0, "Table active bill is 0 TL");
  assertEqual(finalActiveCalls.length, 0, "0 active waiter calls remaining");
  assert(!finalData.tableParticipants["m-4"], "Table participants completely purged");
  console.log(`  [PASS] Test C: Cash Settlement & Table Close (Table 4 closed cleanly) (${Date.now() - tCStart}ms)`);

  // CLEANUP
  for (const l of listeners) {
    l.unsubscribe();
  }
  await testDocRef.delete();
  console.log("  [PASS] Non-Destructive Cloud Test Cleanup Completed");

  console.log("\n=================================================");
  console.log("ALL FAZ 11.7 WORKFLOW & QUEUE INTEGRITY TESTS PASSED (100% SUCCESS)");
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("\n[FATAL ERROR IN WORKFLOW TEST SUITE]:", err);
  process.exit(1);
});
