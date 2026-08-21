/**
 * CEP GARSON — SECRET ROTATION & ZERO-DOWNTIME RECOVERY TEST SUITE
 * FAZ 8 Automated Key Rotation Test Engine
 */

import crypto from "crypto";
import { SecretKeyRingManager } from "../../src/lib/security/secretRotation";

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
console.log("RUNNING FAZ 8 SECRET ROTATION & RECOVERY TESTS");
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
// 1. DUAL-KEY ROTATION & GRACE PERIOD
// ==========================================
console.log("--- 1. DUAL-KEY SECRET ROTATION ---");

runTest("Rotation 1: Graceful Dual-Key Validation During Active Key Rotation", () => {
  const manager = new SecretKeyRingManager("secret_v1");
  const payload = JSON.stringify({ userId: "staff_1", role: "WAITER" });

  // 1. Token signed with Key V1
  const sigV1 = crypto.createHmac("sha256", "secret_v1").update(payload).digest("base64url");
  assert(manager.verifySignature(payload, sigV1).valid, "Signature valid under Key V1");

  // 2. Administrator rotates to Key V2 with 1-hour grace period
  manager.rotateSecret("secret_v2", 3600 * 1000);

  // New tokens signed with Key V2
  const sigV2 = crypto.createHmac("sha256", "secret_v2").update(payload).digest("base64url");
  const checkV2 = manager.verifySignature(payload, sigV2);
  assert(checkV2.valid, "New token valid under Key V2");
  assertEqual(checkV2.keyVersionUsed, 2, "Used Key Version 2");

  // Existing in-flight tokens signed with Key V1 still valid during grace period
  const checkV1 = manager.verifySignature(payload, sigV1);
  assert(checkV1.valid, "Old token still valid during grace period");
  assertEqual(checkV1.keyVersionUsed, 1, "Used Key Version 1");
});

runTest("Rotation 2: Instant Emergency Revocation of Compromised Key", () => {
  const manager = new SecretKeyRingManager("secret_v1");
  const payload = JSON.stringify({ userId: "staff_1", role: "WAITER" });
  const sigV1 = crypto.createHmac("sha256", "secret_v1").update(payload).digest("base64url");

  // Rotate to V2
  manager.rotateSecret("secret_v2", 3600 * 1000);

  // Emergency: Key V1 was compromised -> revoke immediately
  manager.emergencyRevokePreviousKey();

  // Old token V1 is immediately rejected
  const checkV1 = manager.verifySignature(payload, sigV1);
  assert(!checkV1.valid, "Compromised Key V1 is rejected immediately");
});

console.log("\n=================================================");
console.log(`ALL SECRET ROTATION TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
