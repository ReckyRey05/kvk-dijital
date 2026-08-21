/**
 * CEP GARSON — REAL LIVE FIRESTORE INTEGRATION & TRANSACTION SMOKE TEST
 * FAZ 11.2 Real Firebase Cloud API Verification
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

async function main() {
  console.log("=================================================");
  console.log("RUNNING FAZ 11.2 REAL LIVE FIRESTORE CLOUD API TESTS");
  console.log("=================================================\n");

  const startTime = Date.now();
  let passedCount = 0;
  let totalCount = 0;

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

  // 1. INITIALIZE REAL FIRESTORE
  const db = getAdminDb();
  const testNamespace = `_internal/production-readiness-tests/smoke-tests`;
  const testDocId = `test_run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const testDocRef = db.doc(`${testNamespace}/${testDocId}`);
  const counterDocRef = db.doc(`${testNamespace}/concurrent_counter_${Date.now()}`);

  console.log(`Target Cloud Project : cep-garson-prod`);
  console.log(`Test Namespace Scope : ${testNamespace}\n`);

  // STEP 1: REAL API CONNECTION & WRITE
  await runStep("Real Firestore 1: Authenticated Cloud Write (Document Creation)", async () => {
    await testDocRef.set({
      testId: testDocId,
      createdAt: new Date().toISOString(),
      service: "Cep Garson Production Smoke",
      environment: "cloud_live",
      status: "ACTIVE",
    });
  });

  // STEP 2: REAL API READ & ASSERTION
  await runStep("Real Firestore 2: Authenticated Cloud Read & Integrity Check", async () => {
    const snap = await testDocRef.get();
    assert(snap.exists, "Document must exist in real Cloud Firestore");
    const data = snap.data();
    assertEqual(data?.testId, testDocId, "Document testId must match exactly");
    assertEqual(data?.status, "ACTIVE", "Document status must match written value");
  });

  // STEP 3: REAL CLOUD TRANSACTION WITH CONCURRENT MUTATIONS
  await runStep("Real Firestore 3: Cloud Firestore Transaction (ACID Atomic Increment)", async () => {
    // Initialize counter
    await counterDocRef.set({ count: 0, lastUpdated: new Date().toISOString() });

    // Execute 5 concurrent Firestore transactions
    const concurrentIncrements = 5;
    const promises = Array.from({ length: concurrentIncrements }, async (_, idx) => {
      await db.runTransaction(async (t) => {
        const doc = await t.get(counterDocRef);
        if (!doc.exists) {
          throw new Error("Counter document not found in transaction");
        }
        const currentCount = (doc.data()?.count as number) || 0;
        t.update(counterDocRef, {
          count: currentCount + 1,
          lastUpdated: new Date().toISOString(),
          [`worker_${idx}`]: true,
        });
      });
    });

    await Promise.all(promises);

    // Verify final count equals exactly 5 with 0 lost updates
    const finalSnap = await counterDocRef.get();
    const finalData = finalSnap.data();
    assertEqual(finalData?.count, concurrentIncrements, `Final count must be exactly ${concurrentIncrements}`);
  });

  // STEP 4: CLEANUP DELETION
  await runStep("Real Firestore 4: Non-Destructive Cleanup (Document Deletion)", async () => {
    await testDocRef.delete();
    await counterDocRef.delete();
  });

  // STEP 5: VERIFY ZERO RESIDUAL STATE
  await runStep("Real Firestore 5: Verify Complete Cleanup & Zero Residual Data", async () => {
    const check1 = await testDocRef.get();
    const check2 = await counterDocRef.get();
    assert(!check1.exists, "Test document must be completely expunged");
    assert(!check2.exists, "Counter document must be completely expunged");
  });

  const totalDuration = Date.now() - startTime;
  console.log("\n=================================================");
  console.log(`REAL FIRESTORE INTEGRATION TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
  console.log(`TOTAL CLOUD EXECUTION TIME: ${totalDuration}ms`);
  console.log("=================================================\n");
}

main().catch((e) => {
  console.error("LIVE FIRESTORE TEST FAILED:", e);
  process.exit(1);
});
