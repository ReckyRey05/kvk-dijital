/**
 * CEP GARSON — AUTHENTICATION & CREDENTIAL SECURITY TEST SUITE
 * FAZ 4 Automated Auth Test Engine
 */

import {
  authenticateStaffWithPin,
  authenticateBoss,
  timingSafeCompare,
} from "../../../src/lib/auth/restaurantAuth";
import { DEMO_RESTAURANT, DEMO_STAFF_MEMBERS } from "../../../src/lib/restaurant/mockData";

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
console.log("RUNNING FAZ 4 AUTHENTICATION SECURITY TESTS");
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
const WAITER_MEMBER = DEMO_STAFF_MEMBERS.find((s) => s.role === "WAITER")!;
const CASHIER_MEMBER = DEMO_STAFF_MEMBERS.find((s) => s.role === "CASHIER")!;

// ==========================================
// 1. PIN & CREDENTIAL VERIFICATION TESTS
// ==========================================
console.log("--- 1. PIN & CREDENTIAL VERIFICATION ---");

runTest("Auth 1: Valid Waiter PIN Authentication", () => {
  const res = authenticateStaffWithPin(REST_ID, WAITER_MEMBER.id, WAITER_MEMBER.pinCode, "10.0.0.1");
  assert(res.success, "Valid PIN must succeed");
  assert(typeof res.token === "string" && res.token.includes("."), "Must issue signed token");
  assertEqual(res.staff?.role, "WAITER", "Role must match server record");
});

runTest("Auth 2: Invalid PIN Attempt Rejection", () => {
  const res = authenticateStaffWithPin(REST_ID, WAITER_MEMBER.id, "0000", "10.0.0.2");
  assert(!res.success, "Invalid PIN must be rejected");
  assertEqual(res.errorCode, "INVALID_CREDENTIALS", "Returns INVALID_CREDENTIALS");
});

runTest("Auth 3: Brute-Force Rate Limiting (Lockout after 5 failed attempts)", () => {
  const ip = "192.168.1.100";
  // 4 failed attempts
  for (let i = 0; i < 4; i++) {
    const res = authenticateStaffWithPin(REST_ID, CASHIER_MEMBER.id, "9999", ip);
    assert(!res.success, `Attempt ${i + 1} must fail`);
  }

  // 5th failed attempt triggers lockout
  const lockRes = authenticateStaffWithPin(REST_ID, CASHIER_MEMBER.id, "9999", ip);
  assert(!lockRes.success, "5th attempt must fail");
  assertEqual(lockRes.errorCode, "ACCOUNT_LOCKED", "Must lock account after 5 attempts");

  // Subsequent attempt is blocked by lockout
  const blockedRes = authenticateStaffWithPin(REST_ID, CASHIER_MEMBER.id, CASHIER_MEMBER.pinCode, ip);
  assert(!blockedRes.success, "Even correct PIN must be blocked during lockout window");
  assertEqual(blockedRes.errorCode, "ACCOUNT_LOCKED", "Remains locked");
});

runTest("Auth 4: Constant-Time Timing-Safe Comparison", () => {
  assert(timingSafeCompare("1234", "1234") === true, "Identical strings return true");
  assert(timingSafeCompare("1234", "1235") === false, "Different strings return false");
  assert(timingSafeCompare("1234", "123") === false, "Different length strings return false");
  assert(timingSafeCompare("", "") === true, "Empty strings return true");
});

// ==========================================
// 2. BOSS MASTER AUTH & 2FA TESTS
// ==========================================
console.log("\n--- 2. BOSS MASTER AUTH & 2FA TESTS ---");

runTest("Boss 1: Valid Master PIN Authentication", () => {
  const res = authenticateBoss(REST_ID, "1923", undefined, {
    masterPin: "1923",
    is2FAEnabled: false,
    twoFactorMethod: "APP",
    autoLockMinutes: 30,
  });
  assert(res.success, "Master PIN 1923 must succeed");
  assert(typeof res.token === "string", "Must issue boss token");
});

runTest("Boss 2: Invalid Master PIN Rejection", () => {
  const res = authenticateBoss(REST_ID, "0000", undefined, {
    masterPin: "1923",
    is2FAEnabled: false,
    twoFactorMethod: "APP",
    autoLockMinutes: 30,
  });
  assert(!res.success, "Invalid Master PIN must fail");
});

runTest("Boss 3: 2FA Enforcement When Enabled", () => {
  // Correct PIN but missing 2FA code
  const res1 = authenticateBoss(REST_ID, "1923", undefined, {
    masterPin: "1923",
    is2FAEnabled: true,
    twoFactorMethod: "SMS",
    autoLockMinutes: 30,
  });
  assert(!res1.success, "Missing 2FA code must fail");

  // Correct PIN with valid 2FA code
  const res2 = authenticateBoss(REST_ID, "1923", "555888", {
    masterPin: "1923",
    is2FAEnabled: true,
    twoFactorMethod: "SMS",
    autoLockMinutes: 30,
  });
  assert(res2.success, "Valid 2FA code must succeed");
});

console.log("\n=================================================");
console.log(`ALL AUTHENTICATION TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
