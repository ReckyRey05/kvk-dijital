/**
 * CEP GARSON — FULL MULTI-TENANT ISOLATION & IDOR SECURITY TEST SUITE
 * FAZ 3 Automated Multi-Tenant Red Team Test Engine
 */

import {
  resolveTenant,
  assertTableOwnership,
  assertOrderOwnership,
  assertMenuItemOwnership,
  assertIngredientOwnership,
  assertStaffOwnership,
  assertSessionOwnership,
  getTenantBroadcastChannelName,
  getTenantStorageKey,
} from "../../../src/lib/restaurant/tenantGuard";
import {
  calculateAndCreateCanonicalOrder,
  CreateOrderRequestInput,
  CanonicalRestaurantDataSource,
} from "../../../src/lib/restaurant/canonicalOrderEngine";
import { createTableSession } from "../../../src/lib/restaurant/session";
import { DEMO_RESTAURANT, DEMO_TABLES, DEMO_MENU_ITEMS } from "../../../src/lib/restaurant/mockData";
import { Order, Table, Restaurant, MenuItem } from "../../../src/types/restaurant";

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
console.log("RUNNING FAZ 3 MULTI-TENANT ISOLATION & IDOR TESTS");
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

// Setup Multi-Tenant Mock Data fixtures
const TENANT_A_ID = "rest_aura_bistro";
const TENANT_B_ID = "rest_other_lounge";

const RESTAURANT_B: Restaurant = {
  ...DEMO_RESTAURANT,
  id: TENANT_B_ID,
  slug: "other-lounge",
  name: "Other Lounge & Bar",
};

const TABLE_B1: Table = {
  id: "m-b-1",
  restaurantId: TENANT_B_ID,
  tableNumber: "Masa B1",
  capacity: 4,
  section: "MAIN",
  status: "EMPTY",
  activeBillTotal: 0,
};

const multiTenantDataSource: CanonicalRestaurantDataSource = {
  getRestaurant(id: string) {
    if (id === TENANT_A_ID || id === DEMO_RESTAURANT.slug) return DEMO_RESTAURANT;
    if (id === TENANT_B_ID || id === RESTAURANT_B.slug) return RESTAURANT_B;
    return null;
  },
  getTable(restaurantId: string, tableId: string) {
    if (restaurantId === TENANT_A_ID) {
      return DEMO_TABLES.find((t) => t.id === tableId) || null;
    }
    if (restaurantId === TENANT_B_ID) {
      return tableId === "m-b-1" ? TABLE_B1 : null;
    }
    return null;
  },
  getMenuItem(restaurantId: string, menuItemId: string) {
    if (restaurantId === TENANT_A_ID) {
      return DEMO_MENU_ITEMS.find((m) => m.id === menuItemId) || null;
    }
    if (restaurantId === TENANT_B_ID) {
      return menuItemId === "item_b_special"
        ? ({
            id: "item_b_special",
            restaurantId: TENANT_B_ID,
            categoryId: "cat_b",
            name: "Tenant B Special Cocktail",
            description: "Signature drink for Lounge B",
            price: 300,
            isAvailable: true,
            order: 1,
          } as MenuItem)
        : null;
    }
    return null;
  },
  getAllMenuItems(restaurantId: string) {
    if (restaurantId === TENANT_A_ID) return DEMO_MENU_ITEMS;
    return [];
  },
};

// Create valid sessions for Tenant A and Tenant B
const sessionA = createTableSession(TENANT_A_ID, "m-4", "Masa 4", "device_a_1", 15);
const sessionB = createTableSession(TENANT_B_ID, "m-b-1", "Masa B1", "device_b_1", 15);

// ==========================================
// 1. CROSS-TENANT DATA ACCESS & INJECTION ATTACKS
// ==========================================
console.log("--- 1. CROSS-TENANT RESOURCE ISOLATION TESTS ---");

runTest("Attack 1: Tenant A User requests Tenant B Table Order", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: TENANT_A_ID,
    tableId: "m-b-1", // Belongs to Tenant B
    sessionToken: sessionA.token,
    items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
  };

  const res = calculateAndCreateCanonicalOrder(input, multiTenantDataSource);
  assert(!res.ok, "Cross-tenant table access must be rejected");
  assertEqual(res.errorCode, "TENANT_MISMATCH", "Should return TENANT_MISMATCH");
});

runTest("Attack 2: Tenant B User attempts to order from Tenant A Menu", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: TENANT_B_ID,
    tableId: "m-b-1",
    sessionToken: sessionB.token,
    items: [{ menuItemId: "item_truffle_burger", quantity: 1 }], // Truffle Burger belongs to Tenant A
  };

  const res = calculateAndCreateCanonicalOrder(input, multiTenantDataSource);
  assert(!res.ok, "Cross-tenant menu item order must be rejected");
  assertEqual(res.errorCode, "PRODUCT_NOT_FOUND", "Tenant B cannot order Tenant A products");
});

runTest("Attack 3: Cross-Tenant Session Replay (Session A used in Tenant B)", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: TENANT_B_ID,
    tableId: "m-b-1",
    sessionToken: sessionA.token, // Session issued by Tenant A
    items: [{ menuItemId: "item_b_special", quantity: 1 }],
  };

  const res = calculateAndCreateCanonicalOrder(input, multiTenantDataSource);
  assert(!res.ok, "Tenant A session must be rejected for Tenant B table");
  assertEqual(res.errorCode, "SESSION_INVALID", "Cross-tenant session token rejected");
});

runTest("Attack 4: Assert Order Ownership Guard against Foreign Tenant Order", () => {
  const foreignOrder: Order = {
    id: "ord_foreign_99",
    restaurantId: "rest_foreign_cafe",
    tableId: "m-1",
    tableNumber: "Masa 1",
    sessionToken: "sess_xyz",
    status: "PENDING_CONFIRMATION",
    items: [],
    subtotal: 500,
    taxAmount: 50,
    serviceCharge: 0,
    totalAmount: 550,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const guardRes = assertOrderOwnership(TENANT_A_ID, foreignOrder);
  assert(!guardRes.allowed, "Foreign order access must be blocked");
  assertEqual(guardRes.statusCode, 403, "Must return HTTP 403 Forbidden");
});

// ==========================================
// 2. IDOR & ENUMERATION PROTECTION TESTS
// ==========================================
console.log("\n--- 2. IDOR & ENUMERATION DEFENSE TESTS ---");

runTest("IDOR Test 1: Table IDOR Enumeration across Tenants", () => {
  const forgedTableIds = ["m-b-1", "m-999", "../admin", "m-0", "' OR 1=1 --"];

  for (const forgedId of forgedTableIds) {
    const res = assertTableOwnership(TENANT_A_ID, forgedId);
    assert(!res.allowed, `IDOR attempt for table '${forgedId}' must be blocked`);
    assert(res.statusCode === 404 || res.statusCode === 400, "Must return 404 or 400");
  }
});

runTest("IDOR Test 2: Menu Item IDOR across Tenants", () => {
  const foreignItemId = "item_secret_recipe_b";
  const res = assertMenuItemOwnership(TENANT_A_ID, foreignItemId);
  assert(!res.allowed, "Access to non-existent or foreign menu item must be blocked");
  assertEqual(res.statusCode, 404, "Returns 404 Not Found");
});

runTest("IDOR Test 3: Staff Member IDOR across Tenants", () => {
  const foreignStaffId = "staff_foreign_99";
  const res = assertStaffOwnership(TENANT_A_ID, foreignStaffId);
  assert(!res.allowed, "Access to foreign staff ID must be blocked");
  assertEqual(res.statusCode, 404, "Returns 404 Not Found");
});

runTest("IDOR Test 4: Session IDOR & Table Cross-Binding", () => {
  // Session belongs to Table m-4, attempt to validate against Table m-2
  const res = assertSessionOwnership(TENANT_A_ID, "m-2", sessionA.token);
  assert(!res.allowed, "Session validated against wrong table must be blocked");
  assertEqual(res.statusCode, 403, "Returns 403 Forbidden");
});

// ==========================================
// 3. REALTIME & STORAGE NAMESPACING ISOLATION TESTS
// ==========================================
console.log("\n--- 3. REALTIME & STORAGE ISOLATION TESTS ---");

runTest("Realtime Test 1: BroadcastChannel Namespace Scoping", () => {
  const channelA = getTenantBroadcastChannelName(TENANT_A_ID);
  const channelB = getTenantBroadcastChannelName(TENANT_B_ID);

  assert(channelA !== channelB, "BroadcastChannel names must be strictly isolated per tenant");
  assertEqual(channelA, `cg_sync_tenant_${TENANT_A_ID}`, "Channel name matches tenant format");
  assertEqual(channelB, `cg_sync_tenant_${TENANT_B_ID}`, "Channel name matches tenant format");
});

runTest("Storage Test 1: LocalStorage Key Namespace Scoping", () => {
  const keyA = getTenantStorageKey(TENANT_A_ID, "orders");
  const keyB = getTenantStorageKey(TENANT_B_ID, "orders");

  assert(keyA !== keyB, "Storage keys for different tenants must not collide");
  assertEqual(keyA, `cg_${TENANT_A_ID}_orders`, "Storage key format matches tenant namespace");
  assertEqual(keyB, `cg_${TENANT_B_ID}_orders`, "Storage key format matches tenant namespace");
});

console.log("\n=================================================");
console.log(`ALL FAZ 3 MULTI-TENANT TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
