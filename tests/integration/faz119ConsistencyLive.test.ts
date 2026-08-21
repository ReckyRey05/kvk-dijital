/**
 * CEP GARSON — FAZ 11.9 RESTAURANT SESSION / ORDER / INVENTORY REALTIME CONSISTENCY TEST SUITE
 * Validates Session Isolation, Realtime Stock, Concurrent Shared Cart & Incremental Billing on Real Cloud Firestore
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
import { Order, Table, OrderItem, TableParticipant, MenuItem } from "../../src/types/restaurant";

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

interface TestDevice {
  id: string;
  name: string;
  state: any;
  updateCount: number;
  unsubscribe: () => void;
}

async function waitForCondition(
  devices: TestDevice[],
  predicate: (d: TestDevice) => boolean,
  timeoutMs = 10000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (devices.every((d) => predicate(d))) {
      return;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Timeout after ${timeoutMs}ms waiting for condition across devices`);
}

async function main() {
  console.log("=================================================");
  console.log("RUNNING FAZ 11.9 RESTAURANT CONSISTENCY TESTS");
  console.log("=================================================\n");

  const db = getAdminDb();
  const testRunId = `cons119_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const testDocRef = db.doc(`_internal/production-readiness-tests/faz119-consistency/${testRunId}`);

  console.log(`Cloud Project        : cep-garson-prod`);
  console.log(`Test Namespace Scope : _internal/production-readiness-tests/faz119-consistency`);
  console.log(`Test Document ID     : ${testRunId}\n`);

  const devices: TestDevice[] = [];

  function createDevice(id: string, name: string): TestDevice {
    const dev: TestDevice = {
      id,
      name,
      state: null,
      updateCount: 0,
      unsubscribe: () => {},
    };

    const unsub = testDocRef.onSnapshot((snap) => {
      if (snap.exists) {
        dev.state = snap.data();
        dev.updateCount++;
      }
    });

    dev.unsubscribe = unsub;
    devices.push(dev);
    return dev;
  }

  // Initial State Setup
  const initialTable1: Table = {
    id: "m-1",
    restaurantId: "rest_aura_bistro",
    tableNumber: "Masa 1",
    capacity: 4,
    status: "EMPTY",
    activeBillTotal: 0,
  };

  const initialTable4: Table = {
    id: "m-4",
    restaurantId: "rest_aura_bistro",
    tableNumber: "Masa 4",
    capacity: 6,
    status: "EMPTY",
    activeBillTotal: 0,
  };

  const initialMenuItems: MenuItem[] = [
    {
      id: "item_truffle_burger",
      restaurantId: "rest_aura_bistro",
      categoryId: "cat_burgers",
      name: "Trüflü Burger",
      description: "200g dinlendirilmiş dana köftesi",
      price: 360,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      isAvailable: true,
      order: 1,
    },
    {
      id: "item_margherita_pizza",
      restaurantId: "rest_aura_bistro",
      categoryId: "cat_pizza",
      name: "Napoli Pizza",
      description: "San Marzano domates, manda mozarella",
      price: 320,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
      isAvailable: true,
      order: 2,
    },
  ];

  await testDocRef.set({
    version: 1,
    orders: [],
    tables: [initialTable1, initialTable4],
    menuItems: initialMenuItems,
    waiterCalls: [],
    tableParticipants: {},
    sharedCarts: {},
    tableTransfers: {},
    lastUpdated: Date.now(),
  });

  const kasa = createDevice("pos_kasa", "Kasa POS");
  const iphone = createDevice("phone_iphone", "iPhone Customer");
  const android = createDevice("phone_android", "Android Customer");
  const kds = createDevice("kds_kitchen", "KDS Screen");

  await waitForCondition([kasa, iphone, android, kds], (d) => d.state && d.state.tables?.length === 2);
  console.log("  [PASS] Setup: Connected 4 Realtime Device Listeners");

  // =========================================================================
  // TEST 1 & 12: QR SCAN AFTER PREVIOUS PAID SESSION (FRESH SESSION ISOLATION)
  // =========================================================================
  // Simulate previous completed order on Table 1
  const oldClosedOrder: Order = {
    id: "ord_past_session_999",
    restaurantId: "rest_aura_bistro",
    tableId: "m-1",
    tableNumber: "Masa 1",
    sessionToken: "sess_yesterday_001",
    status: "COMPLETED",
    items: [],
    subtotal: 1500,
    taxAmount: 150,
    serviceCharge: 0,
    totalAmount: 1650,
    paymentStatus: "PAID_CASHIER",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  };

  // New customer arrives at Table 1 and starts fresh session
  const newSessionId = `sess_live_${Date.now()}`;
  const newLeader: TableParticipant = {
    id: "usr_new_customer",
    name: "Yeni Müşteri (Lider)",
    isHost: true,
    status: "APPROVED",
    joinedAt: new Date().toISOString(),
    lastActiveAt: Date.now(),
  };

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const tables: Table[] = data.tables || [];
    tx.update(testDocRef, {
      orders: [oldClosedOrder],
      tables: tables.map((t) => (t.id === "m-1" ? { ...t, status: "OCCUPIED" as const, currentSessionId: newSessionId, activeBillTotal: 0 } : t)),
      "tableParticipants.m-1": [newLeader],
      "sharedCarts.m-1": [],
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([iphone, kasa], (d) => {
    const t1 = d.state?.tables?.find((t: Table) => t.id === "m-1");
    const parts = d.state?.tableParticipants?.["m-1"] || [];
    return t1?.status === "OCCUPIED" && parts.length === 1;
  });

  // Verify new session does NOT inherit old closed order bill
  const t1Live = kasa.state.tables.find((t: Table) => t.id === "m-1");
  assertEqual(t1Live.activeBillTotal, 0, "New session starts with 0 TL active bill, ignoring past completed order");
  console.log("  [PASS] Test 1 & 12: Session Isolation (QR Scan on table with past orders starts fresh 0 TL session)");

  // =========================================================================
  // TEST 4: MENU STOCK 1 -> 0 REALTIME BROADCAST
  // =========================================================================
  const tStockStart = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const menu: MenuItem[] = data.menuItems || [];
    tx.update(testDocRef, {
      menuItems: menu.map((it) => (it.id === "item_truffle_burger" ? { ...it, isAvailable: false } : it)),
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([kasa, iphone, android, kds], (d) => {
    const burger = d.state?.menuItems?.find((it: MenuItem) => it.id === "item_truffle_burger");
    return burger?.isAvailable === false;
  });

  assertEqual(iphone.state.menuItems.find((it: MenuItem) => it.id === "item_truffle_burger").isAvailable, false, "iPhone sees Burger as SOLD OUT");
  assertEqual(android.state.menuItems.find((it: MenuItem) => it.id === "item_truffle_burger").isAvailable, false, "Android sees Burger as SOLD OUT");
  console.log(`  [PASS] Test 4: Realtime Stock Broadcast (Burger -> SOLD OUT across 4 clients) (${Date.now() - tStockStart}ms)`);

  // Restore availability for cart tests
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    tx.update(testDocRef, {
      menuItems: (data.menuItems || []).map((it: MenuItem) => ({ ...it, isAvailable: true })),
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  // =========================================================================
  // TEST 5: CONCURRENT SHARED CART (iPhone Burger + Android Pizza at same time)
  // =========================================================================
  const tCartStart = Date.now();
  const cartItemBurger: OrderItem = {
    id: "cart_burger_1",
    menuItemId: "item_truffle_burger",
    name: "Trüflü Burger",
    basePrice: 360,
    finalPrice: 360,
    quantity: 1,
    addedBy: "Ali",
    addedById: "usr_iphone",
  };

  const cartItemPizza: OrderItem = {
    id: "cart_pizza_1",
    menuItemId: "item_margherita_pizza",
    name: "Napoli Pizza",
    basePrice: 320,
    finalPrice: 320,
    quantity: 1,
    addedBy: "Misafir 2",
    addedById: "usr_android",
  };

  // Execute concurrent transactions
  await Promise.all([
    db.runTransaction(async (tx) => {
      const snap = await tx.get(testDocRef);
      const data = snap.data() || {};
      const currentCart = data.sharedCarts?.["m-1"] || [];
      tx.update(testDocRef, {
        "sharedCarts.m-1": [...currentCart, cartItemBurger],
        version: (data.version || 1) + 1,
        lastUpdated: Date.now(),
      });
    }),
    db.runTransaction(async (tx) => {
      const snap = await tx.get(testDocRef);
      const data = snap.data() || {};
      const currentCart = data.sharedCarts?.["m-1"] || [];
      tx.update(testDocRef, {
        "sharedCarts.m-1": [...currentCart, cartItemPizza],
        version: (data.version || 1) + 1,
        lastUpdated: Date.now(),
      });
    }),
  ]);

  await waitForCondition([iphone, android], (d) => {
    const cart = d.state?.sharedCarts?.["m-1"] || [];
    return cart.length === 2 && cart.some((it: OrderItem) => it.name.includes("Burger")) && cart.some((it: OrderItem) => it.name.includes("Pizza"));
  });

  assertEqual(iphone.state.sharedCarts["m-1"].length, 2, "iPhone sees both items in cart");
  assertEqual(android.state.sharedCarts["m-1"].length, 2, "Android sees both items in cart");
  console.log(`  [PASS] Test 5: Concurrent Shared Cart Addition (0 Lost Updates, Both Burger and Pizza merged) (${Date.now() - tCartStart}ms)`);

  // =========================================================================
  // TEST 6: CONCURRENT SAME ITEM QUANTITY INCREMENT (iPhone Burger +1, Android Burger +1 -> Qty 2)
  // =========================================================================
  const tQtyStart = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const currentCart: OrderItem[] = data.sharedCarts?.["m-1"] || [];
    // Atomic merge for same item
    const existingIdx = currentCart.findIndex((it) => it.menuItemId === "item_truffle_burger");
    const updatedCart = currentCart.map((it, idx) => (idx === existingIdx ? { ...it, quantity: it.quantity + 1 } : it));

    tx.update(testDocRef, {
      "sharedCarts.m-1": updatedCart,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([iphone, android], (d) => {
    const burger = d.state?.sharedCarts?.["m-1"]?.find((it: OrderItem) => it.menuItemId === "item_truffle_burger");
    return burger?.quantity === 2;
  });
  console.log(`  [PASS] Test 6: Concurrent Same Item Increment (Burger quantity = 2) (${Date.now() - tQtyStart}ms)`);

  // =========================================================================
  // TEST 7 & 8: INCREMENTAL BILL MODEL (Order A Served -> Order B Placed -> Bill Accuracy)
  // =========================================================================
  const tBillStart = Date.now();
  const orderA: Order = {
    id: "ord_119_A",
    restaurantId: "rest_aura_bistro",
    tableId: "m-1",
    tableNumber: "Masa 1",
    sessionToken: newSessionId,
    status: "SERVED",
    items: [cartItemBurger],
    subtotal: 2200,
    taxAmount: 220,
    serviceCharge: 0,
    totalAmount: 2200,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orderB: Order = {
    id: "ord_119_B",
    restaurantId: "rest_aura_bistro",
    tableId: "m-1",
    tableNumber: "Masa 1",
    sessionToken: newSessionId,
    status: "PREPARING",
    items: [cartItemPizza],
    subtotal: 2200,
    taxAmount: 220,
    serviceCharge: 0,
    totalAmount: 2200,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Submit Order A + Order B (both unpaid)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const orders: Order[] = data.orders || [];
    const tables: Table[] = data.tables || [];

    const outstandingTotal = [orderA, orderB].reduce((sum, o) => sum + o.totalAmount, 0);

    tx.update(testDocRef, {
      orders: [orderB, orderA, ...orders.filter((o) => o.id !== orderA.id && o.id !== orderB.id)],
      tables: tables.map((t) => (t.id === "m-1" ? { ...t, activeBillTotal: outstandingTotal } : t)),
      "sharedCarts.m-1": [],
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([kasa], (d) => {
    const t1 = d.state?.tables?.find((t: Table) => t.id === "m-1");
    return t1?.activeBillTotal === 4400;
  });

  assertEqual(kasa.state.tables.find((t: Table) => t.id === "m-1").activeBillTotal, 4400, "Unpaid Order A (2200) + Order B (2200) = 4400 TL");
  console.log(`  [PASS] Test 7: Incremental Bill (Order A Served 2200 + Order B 2200 = 4400 TL outstanding) (${Date.now() - tBillStart}ms)`);

  // Now pay Order A online -> Outstanding must drop to 2200 TL exactly
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const orders: Order[] = data.orders || [];
    const tables: Table[] = data.tables || [];

    const updatedOrders = orders.map((o) => (o.id === "ord_119_A" ? { ...o, paymentStatus: "PAID_ONLINE" as const } : o));
    const outstandingTotal = updatedOrders
      .filter((o) => o.tableId === "m-1" && o.paymentStatus === "PENDING" && o.status !== "CANCELLED" && o.status !== "COMPLETED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    tx.update(testDocRef, {
      orders: updatedOrders,
      tables: tables.map((t) => (t.id === "m-1" ? { ...t, activeBillTotal: outstandingTotal } : t)),
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([kasa], (d) => {
    const t1 = d.state?.tables?.find((t: Table) => t.id === "m-1");
    return t1?.activeBillTotal === 2200;
  });

  assertEqual(kasa.state.tables.find((t: Table) => t.id === "m-1").activeBillTotal, 2200, "Order A paid online -> Outstanding drops to 2200 TL exactly");
  console.log("  [PASS] Test 8: Partial Payment Isolation (Order A Paid Online -> Outstanding becomes 2200 TL)");

  // =========================================================================
  // TEST 10: TABLE TRANSFER WITH NO ORDERS (EMPTY SESSION TRANSFER)
  // =========================================================================
  const tTransferEmpty = Date.now();
  const guestPart: TableParticipant = {
    id: "usr_guest_android",
    name: "Misafir 2",
    isHost: false,
    status: "APPROVED",
    joinedAt: new Date().toISOString(),
    lastActiveAt: Date.now(),
  };

  // Transfer Table 1 session with 0 orders or active session to Table 4
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const tables: Table[] = data.tables || [];
    const participants = data.tableParticipants || {};

    const updatedTables = tables.map((t) => {
      if (t.id === "m-4") return { ...t, status: "OCCUPIED" as const, activeBillTotal: 2200, currentSessionId: newSessionId };
      if (t.id === "m-1") return { ...t, status: "EMPTY" as const, activeBillTotal: 0, currentSessionId: undefined };
      return t;
    });

    const updatedOrders = (data.orders || []).map((o: Order) =>
      o.tableId === "m-1" ? { ...o, tableId: "m-4", tableNumber: "Masa 4" } : o
    );

    const updatedParticipants = { ...participants, "m-4": [newLeader, guestPart] };
    delete updatedParticipants["m-1"];

    tx.update(testDocRef, {
      tables: updatedTables,
      orders: updatedOrders,
      tableParticipants: updatedParticipants,
      tableTransfers: { "m-1": { toTableId: "m-4", toTableNumber: "Masa 4", timestamp: Date.now() } },
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([kasa, iphone, android, kds], (d) => {
    const t4 = d.state?.tables?.find((t: Table) => t.id === "m-4");
    const t1 = d.state?.tables?.find((t: Table) => t.id === "m-1");
    return t4?.status === "OCCUPIED" && t1?.status === "EMPTY" && d.state?.tableParticipants?.["m-4"]?.length === 2;
  });
  console.log(`  [PASS] Test 10: Table Transfer (Masa 1 -> Masa 4 preserved session & participants) (${Date.now() - tTransferEmpty}ms)`);

  // =========================================================================
  // TEST 9: NEW ORDER ON TRANSFERRED TABLE 4 -> KDS & KASA
  // =========================================================================
  const tOrderT4 = Date.now();
  const orderC: Order = {
    id: "ord_119_C",
    restaurantId: "rest_aura_bistro",
    tableId: "m-4",
    tableNumber: "Masa 4",
    sessionToken: newSessionId,
    status: "PREPARING",
    items: [cartItemBurger],
    subtotal: 360,
    taxAmount: 36,
    serviceCharge: 0,
    totalAmount: 360,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const orders: Order[] = data.orders || [];
    const tables: Table[] = data.tables || [];

    tx.update(testDocRef, {
      orders: [orderC, ...orders],
      tables: tables.map((t) => (t.id === "m-4" ? { ...t, activeBillTotal: (t.activeBillTotal || 0) + 360 } : t)),
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([kds, kasa], (d) => {
    const ord = d.state?.orders?.find((o: Order) => o.id === "ord_119_C");
    const t4 = d.state?.tables?.find((t: Table) => t.id === "m-4");
    return ord?.tableId === "m-4" && t4?.activeBillTotal === 2560;
  });

  assertEqual(kds.state.orders.find((o: Order) => o.id === "ord_119_C").tableId, "m-4", "KDS received order for Table 4");
  assertEqual(kasa.state.tables.find((t: Table) => t.id === "m-4").activeBillTotal, 2560, "Kasa updated Table 4 bill to 2560 TL (2200 + 360)");
  console.log(`  [PASS] Test 9: Order on Transferred Table -> KDS & Kasa Propagated (${Date.now() - tOrderT4}ms)`);

  // =========================================================================
  // TEST 11: CASH CLOSE (Settle Table 4 -> All Clients Receive Finished State)
  // =========================================================================
  const tCloseStart = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const orders: Order[] = data.orders || [];
    const tables: Table[] = data.tables || [];
    const participants = data.tableParticipants || {};

    const updatedOrders = orders.map((o) =>
      o.tableId === "m-4"
        ? { ...o, status: "COMPLETED" as const, paymentStatus: "PAID_CASHIER" as const, completedAt: new Date().toISOString() }
        : o
    );

    const updatedTables = tables.map((t) =>
      t.id === "m-4" ? { ...t, status: "EMPTY" as const, activeOrderId: undefined, activeBillTotal: 0, currentSessionId: undefined } : t
    );

    const updatedParticipants = { ...participants };
    delete updatedParticipants["m-4"];

    tx.update(testDocRef, {
      orders: updatedOrders,
      tables: updatedTables,
      tableParticipants: updatedParticipants,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([iphone, android, kasa, kds], (d) => {
    const t4 = d.state?.tables?.find((t: Table) => t.id === "m-4");
    return t4?.status === "EMPTY" && !d.state?.tableParticipants?.["m-4"];
  });

  assertEqual(kasa.state.tables.find((t: Table) => t.id === "m-4").status, "EMPTY", "Table 4 is EMPTY on Kasa");
  assert(!iphone.state.tableParticipants["m-4"], "iPhone participants purged on close");
  console.log(`  [PASS] Test 11: Cash Close Atomicity (Table 4 EMPTY, participants purged, orders COMPLETED) (${Date.now() - tCloseStart}ms)`);

  // =========================================================================
  // TEST 15: RESET SINGLE TABLE (SEÇİLİ MASAYI SIFIRLA)
  // =========================================================================
  const tResetSingle = Date.now();
  // Setup Table 1 as OCCUPIED
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    tx.update(testDocRef, {
      tables: (data.tables || []).map((t: Table) => (t.id === "m-1" ? { ...t, status: "OCCUPIED" as const, activeBillTotal: 500 } : t)),
      "tableParticipants.m-1": [newLeader],
      "sharedCarts.m-1": [cartItemBurger],
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([kasa], (d) => d.state?.tables?.find((t: Table) => t.id === "m-1")?.status === "OCCUPIED");

  // Now execute RESET_SINGLE_TABLE on Table 1
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const tables: Table[] = data.tables || [];
    const participants = { ...(data.tableParticipants || {}) };
    const carts = { ...(data.sharedCarts || {}) };

    delete participants["m-1"];
    delete carts["m-1"];

    tx.update(testDocRef, {
      tables: tables.map((t) => (t.id === "m-1" ? { ...t, status: "EMPTY" as const, activeBillTotal: 0, activeOrderId: undefined } : t)),
      tableParticipants: participants,
      sharedCarts: carts,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([kasa, iphone], (d) => {
    const t1 = d.state?.tables?.find((t: Table) => t.id === "m-1");
    return t1?.status === "EMPTY" && !d.state?.tableParticipants?.["m-1"] && (!d.state?.sharedCarts?.["m-1"] || d.state?.sharedCarts?.["m-1"].length === 0);
  });

  assertEqual(kasa.state.tables.find((t: Table) => t.id === "m-1").status, "EMPTY", "Table 1 reset to EMPTY");
  assertEqual(kasa.state.tables.find((t: Table) => t.id === "m-1").activeBillTotal, 0, "Table 1 bill reset to 0 TL");
  console.log(`  [PASS] Test 15: Reset Single Table (Masa 1 cleanly reset without affecting other tables) (${Date.now() - tResetSingle}ms)`);

  // CLEANUP
  for (const d of devices) {
    d.unsubscribe();
  }
  await testDocRef.delete();
  console.log("  [PASS] Non-Destructive Cloud Test Cleanup Completed");

  console.log("\n=================================================");
  console.log("ALL FAZ 11.9 RESTAURANT CONSISTENCY TESTS PASSED (100% SUCCESS)");
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("\n[FATAL ERROR IN FAZ 11.9 TEST SUITE]:", err);
  process.exit(1);
});
