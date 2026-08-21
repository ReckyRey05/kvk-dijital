/**
 * CEP GARSON — SESSION SECURITY & TOKEN VERIFICATION TEST SUITE
 * FAZ 4 Automated Session Test Engine
 */

import {
  signSessionToken,
  verifySessionToken,
  revokeSession,
  invalidateAllUserSessions,
  UserSessionPayload,
} from "../../../src/lib/auth/restaurantAuth";
import { validateTableSession, createTableSession } from "../../../src/lib/restaurant/session";
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
console.log("RUNNING FAZ 4 SESSION SECURITY & TOKEN TESTS");
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

// ==========================================
// 1. TOKEN CRYPTOGRAPHY & TAMPERING TESTS
// ==========================================
console.log("--- 1. TOKEN CRYPTOGRAPHY & TAMPERING TESTS ---");

runTest("Session 1: Valid Token Issuance & Verification", () => {
  const payload: UserSessionPayload = {
    sessionId: "sess_test_101",
    userId: "staff_waiter_1",
    restaurantId: REST_ID,
    role: "WAITER",
    name: "Ahmet Garson",
    tokenVersion: 1,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  };

  const token = signSessionToken(payload);
  const result = verifySessionToken(token);

  assert(result.valid, "Valid token must verify successfully");
  assertEqual(result.payload?.userId, "staff_waiter_1", "User ID matches");
  assertEqual(result.payload?.role, "WAITER", "Role matches");
});

runTest("Session 2: Forged / Tampered Payload Token Rejection", () => {
  const payload: UserSessionPayload = {
    sessionId: "sess_test_102",
    userId: "staff_waiter_1",
    restaurantId: REST_ID,
    role: "WAITER",
    name: "Ahmet Garson",
    tokenVersion: 1,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  };

  const token = signSessionToken(payload);
  const [serialized, signature] = token.split(".");

  // Attacker decodes payload, changes role to OWNER, and re-encodes without valid secret
  const decoded = JSON.parse(Buffer.from(serialized, "base64url").toString("utf-8"));
  decoded.role = "OWNER"; // Privilege Escalation Attempt
  const tamperedSerialized = Buffer.from(JSON.stringify(decoded)).toString("base64url");
  const tamperedToken = `${tamperedSerialized}.${signature}`;

  const result = verifySessionToken(tamperedToken);
  assert(!result.valid, "Tampered token must fail verification");
  assertEqual(result.error, "INVALID_SIGNATURE", "Error must be INVALID_SIGNATURE");
});

runTest("Session 3: Expired Token Rejection", () => {
  const expiredPayload: UserSessionPayload = {
    sessionId: "sess_test_103",
    userId: "staff_waiter_1",
    restaurantId: REST_ID,
    role: "WAITER",
    name: "Ahmet Garson",
    tokenVersion: 1,
    issuedAt: Date.now() - 2 * 60 * 60 * 1000,
    expiresAt: Date.now() - 1 * 60 * 1000, // Expired 1 minute ago
  };

  const token = signSessionToken(expiredPayload);
  const result = verifySessionToken(token);
  assert(!result.valid, "Expired token must be rejected");
  assertEqual(result.error, "EXPIRED", "Error must be EXPIRED");
});

runTest("Session 4: Explicit Logout / Revocation Invalidation", () => {
  const payload: UserSessionPayload = {
    sessionId: "sess_test_logout_104",
    userId: "staff_waiter_1",
    restaurantId: REST_ID,
    role: "WAITER",
    name: "Ahmet Garson",
    tokenVersion: 1,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  };

  const token = signSessionToken(payload);
  assert(verifySessionToken(token).valid, "Token is initially valid");

  // User logs out
  revokeSession(payload.sessionId);

  // Subsequent request with the same token
  const afterLogout = verifySessionToken(token);
  assert(!afterLogout.valid, "Revoked session token must be rejected");
  assertEqual(afterLogout.error, "REVOKED", "Error must be REVOKED");
});

runTest("Session 5: Role Downgrade & Password Change Session Invalidation", () => {
  const userId = "staff_downgrade_user";
  const oldPayload: UserSessionPayload = {
    sessionId: "sess_test_105",
    userId,
    restaurantId: REST_ID,
    role: "OWNER",
    name: "Eski Müdür",
    tokenVersion: 1,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  };

  const oldToken = signSessionToken(oldPayload);
  assert(verifySessionToken(oldToken).valid, "Old token is valid before downgrade");

  // Administrator downgrades user role from OWNER to WAITER -> invalidates all existing sessions
  invalidateAllUserSessions(userId);

  // User attempts to use old OWNER token
  const downgradeCheck = verifySessionToken(oldToken);
  assert(!downgradeCheck.valid, "Old token must fail due to version mismatch after downgrade");
  assertEqual(downgradeCheck.error, "VERSION_MISMATCH", "Error must be VERSION_MISMATCH");
});

runTest("Session 6: Customer QR Session Boundary Isolation", () => {
  const customerSession = createTableSession(REST_ID, "m-4", "Masa 4", "cust_device_1", 15);
  // Attempt to pass customer session token into staff session verifier
  const verifyAsStaff = verifySessionToken(customerSession.token);
  assert(!verifyAsStaff.valid, "Customer session token must not parse as valid Staff signed token");
});

console.log("\n=================================================");
console.log(`ALL SESSION TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
