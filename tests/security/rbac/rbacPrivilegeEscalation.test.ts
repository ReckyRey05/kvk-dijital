/**
 * CEP GARSON — RBAC & PRIVILEGE ESCALATION SECURITY TEST SUITE
 * FAZ 4 Automated RBAC Red Team Test Engine
 */

import {
  isRoleAuthorized,
  authorizeServerAction,
  RestaurantAction,
} from "../../../src/lib/auth/rbacGuard";
import { signSessionToken, UserSessionPayload } from "../../../src/lib/auth/restaurantAuth";
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
console.log("RUNNING FAZ 4 RBAC & PRIVILEGE ESCALATION TESTS");
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

function createTestToken(role: any, restaurantId: string = REST_ID): string {
  const payload: UserSessionPayload = {
    sessionId: `sess_rbac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: `user_${role.toLowerCase()}`,
    restaurantId,
    role,
    name: `Test ${role}`,
    tokenVersion: 1,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  };
  return `Bearer ${signSessionToken(payload)}`;
}

// ==========================================
// 1. VERTICAL PRIVILEGE ESCALATION ATTACKS
// ==========================================
console.log("--- 1. VERTICAL PRIVILEGE ESCALATION DEFENSE ---");

runTest("Escalation 1: Waiter attempts to view Financial Z-Reports", () => {
  const waiterHeader = createTestToken("WAITER");
  const res = authorizeServerAction(waiterHeader, REST_ID, "VIEW_REPORTS_AND_Z");
  assert(!res.authorized, "Waiter must be blocked from viewing financial reports");
  assertEqual(res.statusCode, 403, "Returns HTTP 403 Forbidden");
});

runTest("Escalation 2: Waiter attempts to edit Menu and Prices", () => {
  const waiterHeader = createTestToken("WAITER");
  const res = authorizeServerAction(waiterHeader, REST_ID, "EDIT_MENU_AND_PRICES");
  assert(!res.authorized, "Waiter must be blocked from editing menu & prices");
  assertEqual(res.statusCode, 403, "Returns HTTP 403 Forbidden");
});

runTest("Escalation 3: Waiter attempts to view Recipe BOM Costs", () => {
  const waiterHeader = createTestToken("WAITER");
  const res = authorizeServerAction(waiterHeader, REST_ID, "VIEW_RECIPES_AND_COSTS");
  assert(!res.authorized, "Waiter must be blocked from viewing proprietary recipe costs");
  assertEqual(res.statusCode, 403, "Returns HTTP 403 Forbidden");
});

runTest("Escalation 4: Waiter attempts to Manage Users / Staff", () => {
  const waiterHeader = createTestToken("WAITER");
  const res = authorizeServerAction(waiterHeader, REST_ID, "MANAGE_USERS");
  assert(!res.authorized, "Waiter must be blocked from user management");
  assertEqual(res.statusCode, 403, "Returns HTTP 403 Forbidden");
});

runTest("Escalation 5: Cashier attempts to edit Menu Prices", () => {
  const cashierHeader = createTestToken("CASHIER");
  const res = authorizeServerAction(cashierHeader, REST_ID, "EDIT_MENU_AND_PRICES");
  assert(!res.authorized, "Cashier must be blocked from editing menu & prices");
  assertEqual(res.statusCode, 403, "Returns HTTP 403 Forbidden");
});

runTest("Escalation 6: Kitchen attempts to perform Financial Payment Settlement", () => {
  const kitchenHeader = createTestToken("KITCHEN");
  const res = authorizeServerAction(kitchenHeader, REST_ID, "SETTLE_PAYMENT");
  assert(!res.authorized, "Kitchen must be blocked from financial settlement");
  assertEqual(res.statusCode, 403, "Returns HTTP 403 Forbidden");
});

runTest("Escalation 7: Customer attempts Staff/Admin Action", () => {
  const customerHeader = createTestToken("CUSTOMER");
  const res = authorizeServerAction(customerHeader, REST_ID, "CONFIRM_ORDER");
  assert(!res.authorized, "Customer must have 0 access to staff actions");
  assertEqual(res.statusCode, 403, "Returns HTTP 403 Forbidden");
});

// ==========================================
// 2. HORIZONTAL & CROSS-TENANT ESCALATION
// ==========================================
console.log("\n--- 2. HORIZONTAL & CROSS-TENANT ESCALATION ---");

runTest("Horizontal 1: Manager of Restaurant A attempts action in Restaurant B", () => {
  const managerAHeader = createTestToken("MANAGER", "rest_aura_bistro");
  const res = authorizeServerAction(managerAHeader, "rest_other_cafe", "VIEW_REPORTS_AND_Z");
  assert(!res.authorized, "Manager cannot access foreign restaurant reports");
  assertEqual(res.statusCode, 403, "Returns HTTP 403 Forbidden");
});

// ==========================================
// 3. AUTHORIZED PRIVILEGE MATRIX
// ==========================================
console.log("\n--- 3. AUTHORIZED ROLE PERMISSION MATRIX ---");

runTest("Role Matrix 1: Owner has Full Permissions", () => {
  const ownerHeader = createTestToken("OWNER");
  const actions: RestaurantAction[] = [
    "CONFIRM_ORDER",
    "GIVE_DISCOUNT",
    "TRANSFER_TABLE",
    "CANCEL_BILL",
    "VIEW_REPORTS_AND_Z",
    "EDIT_MENU_AND_PRICES",
    "VIEW_COMPLAINTS",
    "VIEW_RECIPES_AND_COSTS",
    "MANAGE_USERS",
    "MANAGE_SETTINGS",
    "SETTLE_PAYMENT",
    "KITCHEN_PREPARE",
  ];

  for (const act of actions) {
    const res = authorizeServerAction(ownerHeader, REST_ID, act);
    assert(res.authorized, `Owner must be authorized for ${act}`);
  }
});

runTest("Role Matrix 2: Cashier can Settle Payments and Confirm Orders", () => {
  const cashierHeader = createTestToken("CASHIER");
  assert(authorizeServerAction(cashierHeader, REST_ID, "SETTLE_PAYMENT").authorized, "Cashier can settle payments");
  assert(authorizeServerAction(cashierHeader, REST_ID, "CONFIRM_ORDER").authorized, "Cashier can confirm orders");
});

console.log("\n=================================================");
console.log(`ALL RBAC & PRIVILEGE TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
