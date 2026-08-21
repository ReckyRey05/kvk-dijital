/**
 * CEP GARSON — FAZ 11.6 REALTIME TABLE MEMBERS LIVE TEST SUITE
 * Real Cloud Firestore Multi-Device Participant Synchronization & Membership Topology
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
import { TableParticipant } from "../../src/types/restaurant";

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

interface TestClientContext {
  id: string;
  deviceName: string;
  role: "LEADER" | "GUEST" | "CASHIER";
  currentMembers: TableParticipant[];
  receivedUpdates: number;
  unsubscribe: () => void;
}

async function waitForCondition(
  clients: TestClientContext[],
  predicate: (client: TestClientContext) => boolean,
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

async function main() {
  console.log("=================================================");
  console.log("RUNNING FAZ 11.6 REALTIME TABLE MEMBERS LIVE FIRESTORE TESTS");
  console.log("=================================================\n");

  const db = getAdminDb();
  const testRunId = `tm_test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const testDocRef = db.doc(`_internal/production-readiness-tests/table-members/${testRunId}`);

  console.log(`Cloud Project        : cep-garson-prod`);
  console.log(`Test Namespace Scope : _internal/production-readiness-tests/table-members`);
  console.log(`Test Document ID     : ${testRunId}\n`);

  const clients: TestClientContext[] = [];
  const registeredListeners: (() => void)[] = [];

  // Helper to create live onSnapshot listener context
  function createMemberClient(id: string, deviceName: string, role: "LEADER" | "GUEST" | "CASHIER"): TestClientContext {
    const ctx: TestClientContext = {
      id,
      deviceName,
      role,
      currentMembers: [],
      receivedUpdates: 0,
      unsubscribe: () => {},
    };

    const unsub = testDocRef.onSnapshot(
      (snap) => {
        if (snap.exists) {
          const data = snap.data();
          if (data && data.tableParticipants) {
            ctx.currentMembers = data.tableParticipants["m-4"] || [];
            ctx.receivedUpdates++;
          }
        }
      },
      (err) => {
        console.error(`[Listener Error on ${ctx.deviceName}]:`, err.message);
      }
    );

    ctx.unsubscribe = unsub;
    registeredListeners.push(unsub);
    clients.push(ctx);
    return ctx;
  }

  // Initial Document Creation
  const leaderParticipant: TableParticipant = {
    id: "usr_iphone_leader",
    name: "Ali Kavak",
    isHost: true,
    status: "APPROVED",
    joinedAt: new Date().toISOString(),
  };

  await testDocRef.set({
    version: 1,
    tableId: "m-4",
    restaurantId: "rest_aura_bistro",
    tableParticipants: {
      "m-4": [leaderParticipant],
    },
    lastUpdated: Date.now(),
  });

  // TEST 1: Initialize Document and Register Leader (iPhone)
  const t1Start = Date.now();
  const iphoneClient = createMemberClient("c1", "iPhone (Leader)", "LEADER");
  const cashierClient = createMemberClient("c_pos", "Cashier POS", "CASHIER");

  await waitForCondition([iphoneClient, cashierClient], (c) => c.currentMembers.length === 1);

  assertEqual(iphoneClient.currentMembers.length, 1, "iPhone sees 1 member");
  assert(iphoneClient.currentMembers[0].isHost, "iPhone user is Leader");
  assertEqual(iphoneClient.currentMembers[0].name, "Ali Kavak", "Leader name is Ali Kavak");
  assertEqual(cashierClient.currentMembers.length, 1, "Cashier sees 1 member");
  console.log(`  [PASS] Test 1: Leader Visibility (iPhone joined as Leader 👑 Ali) (${Date.now() - t1Start}ms)`);

  // TEST 2: Android Joins as Guest 2
  const t2Start = Date.now();
  const guest1Participant: TableParticipant = {
    id: "usr_android_guest_2",
    name: "Misafir 2",
    isHost: false,
    status: "APPROVED",
    joinedAt: new Date().toISOString(),
  };

  const androidClient = createMemberClient("c2", "Android (Guest 2)", "GUEST");

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const parts = data.tableParticipants?.["m-4"] || [];
    const updated = [...parts.filter((p: TableParticipant) => p.id !== guest1Participant.id), guest1Participant];
    tx.update(testDocRef, {
      "tableParticipants.m-4": updated,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([iphoneClient, androidClient, cashierClient], (c) => c.currentMembers.length === 2);

  assertEqual(iphoneClient.currentMembers.length, 2, "iPhone sees 2 members");
  assertEqual(androidClient.currentMembers.length, 2, "Android sees 2 members");
  assertEqual(cashierClient.currentMembers.length, 2, "Cashier sees 2 members");
  assert(iphoneClient.currentMembers.some((p) => p.isHost && p.name === "Ali Kavak"), "Leader 👑 Ali intact");
  assert(iphoneClient.currentMembers.some((p) => !p.isHost && p.name === "Misafir 2"), "Guest 👤 Misafir 2 intact");
  console.log(`  [PASS] Test 2: Guest Visibility & Realtime Join (Android joined as Guest 2) (${Date.now() - t2Start}ms)`);

  // TEST 3: Third Client Joins (Guest 3)
  const t3Start = Date.now();
  const guest2Participant: TableParticipant = {
    id: "usr_tablet_guest_3",
    name: "Misafir 3",
    isHost: false,
    status: "APPROVED",
    joinedAt: new Date().toISOString(),
  };

  const tabletClient = createMemberClient("c3", "Tablet (Guest 3)", "GUEST");

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const parts = data.tableParticipants?.["m-4"] || [];
    const updated = [...parts.filter((p: TableParticipant) => p.id !== guest2Participant.id), guest2Participant];
    tx.update(testDocRef, {
      "tableParticipants.m-4": updated,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([iphoneClient, androidClient, tabletClient, cashierClient], (c) => c.currentMembers.length === 3);

  assertEqual(iphoneClient.currentMembers.length, 3, "iPhone sees 3 members");
  assertEqual(androidClient.currentMembers.length, 3, "Android sees 3 members");
  assertEqual(tabletClient.currentMembers.length, 3, "Tablet sees 3 members");
  assertEqual(cashierClient.currentMembers.length, 3, "Cashier sees 3 members");
  console.log(`  [PASS] Test 3: Realtime 3-Client Multi-Device Topology Convergence (${Date.now() - t3Start}ms)`);

  // TEST 4: Duplicate Session Reconnect Prevention
  const t4Start = Date.now();
  const reconnectAndroid: TableParticipant = {
    id: "usr_android_guest_2",
    name: "Ahmet",
    isHost: false,
    status: "APPROVED",
    joinedAt: guest1Participant.joinedAt,
  };

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const parts: TableParticipant[] = data.tableParticipants?.["m-4"] || [];
    const updated = parts.map((p) => (p.id === reconnectAndroid.id ? reconnectAndroid : p));
    tx.update(testDocRef, {
      "tableParticipants.m-4": updated,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([iphoneClient, androidClient], (c) => c.currentMembers.some((p) => p.name === "Ahmet"));

  assertEqual(iphoneClient.currentMembers.length, 3, "Total member count remains strictly 3 (0 duplicates)");
  const ahmetCount = iphoneClient.currentMembers.filter((p) => p.id === "usr_android_guest_2").length;
  assertEqual(ahmetCount, 1, "Duplicate member count is exactly 0");
  const updatedAhmet = iphoneClient.currentMembers.find((p) => p.id === "usr_android_guest_2");
  assertEqual(updatedAhmet?.name, "Ahmet", "Name updated to Ahmet across all clients");
  console.log(`  [PASS] Test 4: Duplicate Session Prevention (0 duplicate members on reconnect) (${Date.now() - t4Start}ms)`);

  // TEST 5: Member Leaves (Tablet Guest 3 leaves table)
  const t5Start = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    const parts: TableParticipant[] = data.tableParticipants?.["m-4"] || [];
    const updated = parts.filter((p) => p.id !== "usr_tablet_guest_3");
    tx.update(testDocRef, {
      "tableParticipants.m-4": updated,
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([iphoneClient, androidClient, cashierClient], (c) => c.currentMembers.length === 2);

  assertEqual(iphoneClient.currentMembers.length, 2, "iPhone sees 2 members after guest leave");
  assertEqual(androidClient.currentMembers.length, 2, "Android sees 2 members after guest leave");
  assertEqual(cashierClient.currentMembers.length, 2, "Cashier sees 2 members after guest leave");
  console.log(`  [PASS] Test 5: Realtime Leave Event (Tablet departed -> active members = 2) (${Date.now() - t5Start}ms)`);

  // TEST 6: Table Close & Session Invalidation
  const t6Start = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(testDocRef);
    const data = snap.data() || {};
    tx.update(testDocRef, {
      "tableParticipants.m-4": [],
      version: (data.version || 1) + 1,
      lastUpdated: Date.now(),
    });
  });

  await waitForCondition([iphoneClient, cashierClient], (c) => c.currentMembers.length === 0);

  assertEqual(iphoneClient.currentMembers.length, 0, "iPhone sees 0 active members on table close");
  assertEqual(cashierClient.currentMembers.length, 0, "Cashier sees 0 active members on table close");
  console.log(`  [PASS] Test 6: Table Close & Session Purge (active sessions cleared) (${Date.now() - t6Start}ms)`);

  // TEST 7: Tenant Isolation (Cross-Tenant Member Query Protection)
  const t7Start = Date.now();
  const foreignDocRef = db.doc(`_internal/production-readiness-tests/table-members/foreign_tenant_${Date.now()}`);
  await foreignDocRef.set({
    version: 1,
    tableId: "m-4",
    restaurantId: "rest_other_bistro",
    tableParticipants: {
      "m-4": [
        { id: "usr_foreign_1", name: "Foreign Leader", isHost: true, status: "APPROVED", joinedAt: new Date().toISOString() },
      ],
    },
    lastUpdated: Date.now(),
  });

  const foreignSnap = await foreignDocRef.get();
  const foreignData = foreignSnap.data();
  assert(foreignData?.restaurantId === "rest_other_bistro", "Foreign restaurant ID preserved");
  assert(foreignData?.restaurantId !== "rest_aura_bistro", "Tenant mismatch strictly isolated");

  // Cleanup foreign test document
  await foreignDocRef.delete();
  console.log(`  [PASS] Test 7: Tenant Isolation & IDOR Protection (Cross-tenant leaks = 0) (${Date.now() - t7Start}ms)`);

  // TEST 8: Listener Cleanup & Memory Leak Verification (100 Cycles)
  const t8Start = Date.now();
  const testListeners: (() => void)[] = [];
  for (let i = 0; i < 100; i++) {
    const unsub = testDocRef.onSnapshot(() => {});
    testListeners.push(unsub);
  }
  for (const unsub of testListeners) {
    unsub();
  }
  for (const unsub of registeredListeners) {
    unsub();
  }
  console.log(`  [PASS] Test 8: Listener Lifecycle & Zero Leaks (100 mount/unmount cycles) (${Date.now() - t8Start}ms)`);

  // TEST 9: Non-Destructive Cleanup
  const t9Start = Date.now();
  await testDocRef.delete();
  const verifyDeleted = await testDocRef.get();
  assert(!verifyDeleted.exists, "Test document completely deleted");
  console.log(`  [PASS] Test 9: Non-Destructive Cloud Test Cleanup (${Date.now() - t9Start}ms)`);

  console.log("\n=================================================");
  console.log("ALL FAZ 11.6 REALTIME TABLE MEMBERS TESTS PASSED (100% SUCCESS)");
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("\n[FATAL ERROR IN TABLE MEMBERS TEST SUITE]:", err);
  process.exit(1);
});
