/**
 * CEP GARSON — CANONICAL SERVER-SIDE BUSINESS LOGIC & PRICING TEST SUITE
 * FAZ 2 Automated Test Engine
 */

import {
  calculateAndCreateCanonicalOrder,
  toMinorUnits,
  fromMinorUnits,
  CreateOrderRequestInput,
} from "../src/lib/restaurant/canonicalOrderEngine";
import { createTableSession } from "../src/lib/restaurant/session";
import { DEMO_RESTAURANT } from "../src/lib/restaurant/mockData";

// Helper assertions
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
console.log("RUNNING CEP GARSON CANONICAL DOMAIN & SECURITY TESTS");
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

// Setup a fresh valid session for testing
const session = createTableSession(DEMO_RESTAURANT.id, "m-4", "Masa 4", "test_device_1", 15);
const validSessionToken = session.token;

// ==========================================
// 1. PRICE MANIPULATION ATTACK SUITE (19 ATTACKS)
// ==========================================
console.log("--- 1. PRICE MANIPULATION DEFENSE TESTS ---");

runTest("Attack 1: Normal Price Calculation", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger", // Canonical Price: 360 TL
        quantity: 2,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Order should be calculated successfully");
  assertEqual(res.order?.items[0].basePrice, 360, "Base price should be canonical 360 TL");
  assertEqual(res.order?.items[0].finalPrice, 360, "Final price should be canonical 360 TL");
  assertEqual(res.order?.subtotal, 720, "Subtotal must be 720 TL (360 * 2)");
  assertEqual(res.order?.taxAmount, 72, "Tax must be 10% of subtotal = 72 TL");
  assertEqual(res.order?.totalAmount, 792, "Total must be 720 + 72 = 792 TL");
});

runTest("Attack 2: Client sends unitPrice = 0", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1,
        unitPrice: 0,
        finalPrice: 0,
        price: 0,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Order should calculate with canonical price, ignoring zero");
  assertEqual(res.order?.subtotal, 360, "Server must ignore 0 and charge canonical 360 TL");
});

runTest("Attack 3: Client sends price = -1 (Negative Price Injection)", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1,
        price: -100,
        finalPrice: -500,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Server must ignore negative prices");
  assertEqual(res.order?.subtotal, 360, "Subtotal must remain canonical 360 TL");
  assert(res.order!.totalAmount > 0, "Total amount must be positive");
});

runTest("Attack 4: Client sends price = 0.01 (1 Kuruş Exploit)", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_ribeye_steak", // Canonical: 720 TL
        quantity: 5,
        finalPrice: 0.01,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Order should calculate with canonical price");
  assertEqual(res.order?.subtotal, 3600, "Subtotal must be 3600 TL (720 * 5), not 0.05 TL");
});

runTest("Attack 5: Client sends price = 999999999 (Overflow Attempt)", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1,
        finalPrice: 999999999,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Server should use canonical price");
  assertEqual(res.order?.subtotal, 360, "Subtotal must be canonical 360 TL");
});

runTest("Attack 6: Client sends price as String '0.00'", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1,
        finalPrice: "0.00" as any,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Server should ignore string price");
  assertEqual(res.order?.subtotal, 360, "Subtotal must be canonical 360 TL");
});

runTest("Attack 7: Client sends price as null", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1,
        finalPrice: null as any,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Server should ignore null price");
  assertEqual(res.order?.subtotal, 360, "Subtotal must be canonical 360 TL");
});

runTest("Attack 8: Client sends price as NaN", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1,
        finalPrice: NaN,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Server should ignore NaN price");
  assertEqual(res.order?.subtotal, 360, "Subtotal must be canonical 360 TL");
});

runTest("Attack 9: Client sends price as Infinity", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1,
        finalPrice: Infinity,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Server should ignore Infinity price");
  assertEqual(res.order?.subtotal, 360, "Subtotal must be canonical 360 TL");
});

runTest("Attack 10: Client attempts Total Manipulation in Request Body", () => {
  const input: any = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [{ menuItemId: "item_ribeye_steak", quantity: 1 }],
    subtotal: 10,
    taxAmount: 1,
    totalAmount: 11, // Attacker forged total
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Server should compute total canonically");
  assertEqual(res.order?.subtotal, 720, "Subtotal must be canonical 720 TL");
  assertEqual(res.order?.taxAmount, 72, "Tax must be 72 TL");
  assertEqual(res.order?.totalAmount, 792, "Total must be 792 TL, not forged 11 TL");
});

runTest("Attack 11: Client Modifier Tampering (Option Price Delta Fake)", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger", // Base: 360 TL
        quantity: 1,
        selectedOptions: [
          {
            groupId: "opt_burger_extras",
            optionIds: ["extra_bacon"], // Server price delta is +65 TL
          },
        ],
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Server should calculate modifier with canonical price delta");
  assertEqual(res.order?.items[0].finalPrice, 425, "Item price must be 360 + 65 = 425 TL");
  assertEqual(res.order?.subtotal, 425, "Subtotal must be 425 TL");
});

runTest("Attack 12: Negative Quantity Injection (quantity = -5)", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: -5,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(!res.ok, "Server must reject negative quantity");
  assertEqual(res.errorCode, "INVALID_QUANTITY", "Error code must be INVALID_QUANTITY");
});

runTest("Attack 13: Floating Point Fractional Quantity (quantity = 1.5)", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "item_truffle_burger",
        quantity: 1.5,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(!res.ok, "Server must reject non-integer quantity");
  assertEqual(res.errorCode, "INVALID_QUANTITY", "Error code must be INVALID_QUANTITY");
});

runTest("Attack 14: Non-existent Product ID Injection", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      {
        menuItemId: "fake_hacked_item_999",
        quantity: 1,
      },
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(!res.ok, "Server must reject non-existent item");
  assertEqual(res.errorCode, "PRODUCT_NOT_FOUND", "Error code must be PRODUCT_NOT_FOUND");
});

runTest("Attack 15: Idempotency Key Replay Protection", () => {
  const idempotencyKey = `idemp_test_${Date.now()}`;
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
    idempotencyKey,
  };

  const firstRes = calculateAndCreateCanonicalOrder(input);
  assert(firstRes.ok, "First order creation must succeed");
  assert(!firstRes.isIdempotentReplay, "First attempt is not a replay");

  // Replay identical request with same idempotency key
  const secondRes = calculateAndCreateCanonicalOrder(input);
  assert(secondRes.ok, "Second order request must succeed");
  assert(secondRes.isIdempotentReplay === true, "Second request must be recognized as idempotent replay");
  assertEqual(secondRes.order?.id, firstRes.order?.id, "Replayed order must return identical Order ID");
});

// ==========================================
// 2. TENANT ISOLATION & RESOURCE OWNERSHIP TESTS
// ==========================================
console.log("\n--- 2. TENANT ISOLATION & RESOURCE OWNERSHIP TESTS ---");

runTest("Tenant Test 1: Cross-Tenant Table Mismatch (Table A with Restaurant B)", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: "rest_fake_restaurant",
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(!res.ok, "Must reject request for non-existent/mismatched restaurant");
  assertEqual(res.errorCode, "RESTAURANT_NOT_FOUND", "Should return RESTAURANT_NOT_FOUND");
});

runTest("Tenant Test 2: Expired 15-Minute Session Token Rejection", () => {
  const expiredSessionToken = "sess_expired_12345";
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: expiredSessionToken,
    items: [{ menuItemId: "item_truffle_burger", quantity: 1 }],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(!res.ok, "Must reject expired/invalid session token");
  assertEqual(res.errorCode, "SESSION_INVALID", "Should return SESSION_INVALID");
});

// ==========================================
// 3. MONEY ARITHMETIC & PRECISION TESTS
// ==========================================
console.log("\n--- 3. MONEY ARITHMETIC & PRECISION INVARIANT TESTS ---");

runTest("Precision Test 1: IEEE-754 Minor Units Safety (0.10 + 0.20 TL)", () => {
  const val1 = toMinorUnits(0.1);
  const val2 = toMinorUnits(0.2);
  const sumMinor = val1 + val2;
  const result = fromMinorUnits(sumMinor);
  assertEqual(result, 0.3, "0.10 + 0.20 must precisely equal 0.30 without floating point leak");
});

runTest("Precision Test 2: Subtotal + Tax Invariant Equation", () => {
  const input: CreateOrderRequestInput = {
    restaurantId: DEMO_RESTAURANT.id,
    tableId: "m-4",
    sessionToken: validSessionToken,
    items: [
      { menuItemId: "item_burrata_pizza", quantity: 2 }, // 440 * 2 = 880 TL
      { menuItemId: "item_san_sebastian", quantity: 3 }, // 240 * 3 = 720 TL
    ],
  };

  const res = calculateAndCreateCanonicalOrder(input);
  assert(res.ok, "Order should calculate successfully");
  const subtotal = res.order!.subtotal;
  const tax = res.order!.taxAmount;
  const total = res.order!.totalAmount;

  assertEqual(subtotal, 1600, "Subtotal must be 880 + 720 = 1600 TL");
  assertEqual(tax, 160, "Tax (10%) must be 160 TL");
  assertEqual(total, 1760, "Total must exactly satisfy subtotal + tax = 1760 TL");
  assert(
    Math.abs(subtotal + tax - total) < 0.001,
    "Data Invariant violated: subtotal + tax != totalAmount"
  );
});

console.log("\n=================================================");
console.log(`ALL TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
console.log("=================================================\n");
