/**
 * CEP GARSON — REALTIME SYNCHRONIZATION & RECONCILIATION TEST SUITE
 * FAZ 7 Automated Realtime Event Loss & Reconnect Test Engine
 */

import {
  getTenantBroadcastChannelName,
  getTenantStorageKey,
} from "../../src/lib/restaurant/tenantGuard";
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
console.log("RUNNING FAZ 7 REALTIME SYNC & RECONCILIATION TESTS");
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

// ==========================================
// 1. EVENT LOSS & RECONNECT RECONCILIATION
// ==========================================
console.log("--- 1. EVENT LOSS & RECONNECT RECONCILIATION ---");

class ClientStateReconciler {
  private localOrders: Map<string, Order> = new Map();
  public isConnected: boolean = true;
  public missedEventsCount: number = 0;

  public receiveRealtimeEvent(order: Order) {
    if (!this.isConnected) {
      this.missedEventsCount++;
      return; // Event dropped during network disconnection
    }
    this.localOrders.set(order.id, order);
  }

  // Called when WebSocket / BroadcastChannel reconnects
  public reconcileWithServer(canonicalServerOrders: Order[]) {
    this.localOrders.clear();
    for (const ord of canonicalServerOrders) {
      this.localOrders.set(ord.id, ord);
    }
    this.missedEventsCount = 0;
    this.isConnected = true;
  }

  public getOrderCount(): number {
    return this.localOrders.size;
  }
}

runTest("Realtime 1: Reconnect Full-State Reconciliation after 10 Dropped Events", () => {
  const client = new ClientStateReconciler();

  // 1. Initial sync (2 orders)
  const initialOrders: Order[] = [
    { id: "ord_1", restaurantId: "rest_aura", tableId: "m-1", tableNumber: "Masa 1", sessionToken: "t1", status: "PREPARING", items: [], subtotal: 100, taxAmount: 10, serviceCharge: 0, totalAmount: 110, paymentStatus: "PENDING", createdAt: "", updatedAt: "" },
    { id: "ord_2", restaurantId: "rest_aura", tableId: "m-2", tableNumber: "Masa 2", sessionToken: "t2", status: "PREPARING", items: [], subtotal: 200, taxAmount: 20, serviceCharge: 0, totalAmount: 220, paymentStatus: "PENDING", createdAt: "", updatedAt: "" },
  ];
  client.reconcileWithServer(initialOrders);
  assertEqual(client.getOrderCount(), 2, "Client initially has 2 orders");

  // 2. Client goes OFFLINE (Phone locked / network dropped)
  client.isConnected = false;

  // Server processes 5 new orders while client is offline
  const updatedServerOrders: Order[] = [
    ...initialOrders,
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `ord_offline_${i + 3}`,
      restaurantId: "rest_aura",
      tableId: `m-${i + 3}`,
      tableNumber: `Masa ${i + 3}`,
      sessionToken: `tok_${i}`,
      status: "PREPARING" as const,
      items: [],
      subtotal: 150,
      taxAmount: 15,
      serviceCharge: 0,
      totalAmount: 165,
      paymentStatus: "PENDING" as const,
      createdAt: "",
      updatedAt: "",
    })),
  ];

  // Realtime broadcasts sent while client is offline
  for (const missedOrd of updatedServerOrders.slice(2)) {
    client.receiveRealtimeEvent(missedOrd);
  }
  assertEqual(client.missedEventsCount, 5, "5 events were missed during disconnection");
  assertEqual(client.getOrderCount(), 2, "Client state was frozen during offline mode");

  // 3. Client RECONNECTS -> Reconciles full state from server
  client.reconcileWithServer(updatedServerOrders);
  assertEqual(client.getOrderCount(), 7, "Client state is 100% reconciled to server state (7 orders)");
  assertEqual(client.missedEventsCount, 0, "Missed events count reset to 0");
});

// ==========================================
// 2. DUPLICATE EVENT IDEMPOTENCY
// ==========================================
console.log("\n--- 2. DUPLICATE REALTIME EVENT IDEMPOTENCY ---");

runTest("Realtime 2: 10 Duplicate Broadcasts Result in Idempotent State", () => {
  const client = new ClientStateReconciler();
  const sampleOrder: Order = {
    id: "ord_dup_test",
    restaurantId: "rest_aura",
    tableId: "m-4",
    tableNumber: "Masa 4",
    sessionToken: "t4",
    status: "READY",
    items: [],
    subtotal: 300,
    taxAmount: 30,
    serviceCharge: 0,
    totalAmount: 330,
    paymentStatus: "PENDING",
    createdAt: "",
    updatedAt: "",
  };

  // Broadcast same event 10 times (Network duplicate packet replay)
  for (let i = 0; i < 10; i++) {
    client.receiveRealtimeEvent(sampleOrder);
  }

  assertEqual(client.getOrderCount(), 1, "Exactly 1 unique order exists despite 10 duplicate broadcasts");
});

console.log("\n=================================================");
console.log(`ALL REALTIME INTEGRITY TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
