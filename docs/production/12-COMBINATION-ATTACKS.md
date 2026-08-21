# FAZ 12 — MULTI-VECTOR COMBINATION ATTACKS ANALYSIS

## 1. COMPLEX ADVERSARIAL SCENARIOS

### Scenario A: QR Photo + Old Session Token + DevTools Tampered Cart
- **Attack:** An attacker at home scans a photo of Table 4 QR, loads an expired session token into LocalStorage, and crafts a POST request with `{ quantity: -5, price: 0 }`.
- **Defense:**
  1. Token validation detects session is expired/invalid (`SESSION_INVALID`).
  2. Input validator rejects negative quantity (`INVALID_QUANTITY`).
  3. Pricing engine discards price = 0.
- **Outcome:** **BLOCKED (Triple Layer Defense)**.

### Scenario B: Table Transfer + Flaky Network Reconnect + New Order
- **Attack:** During a table transfer from Table 1 to Table 4, a customer loses network, places an order, and reconnects.
- **Defense:**
  1. Reconnect triggers immediate canonical state reload (`lastKnownServerVersion = 0`).
  2. Target table ID `m-4` is resolved.
  3. Order is bound to new table `m-4` without orphan records on `m-1`.
- **Outcome:** **SUCCESSFUL RECONCILIATION**.

### Scenario C: Concurrent Cash Close + New Order Placement
- **Attack:** Cashier clicks "Nakit Kapat" at the exact moment a customer submits a new order.
- **Defense:**
  1. Firestore transaction executes atomically.
  2. If close commits first, customer order receives `SESSION_CLOSED` (403).
  3. If order commits first, cashier transaction includes the order in the final bill.
  4. Zero orphan orders and zero partial states.
- **Outcome:** **DETERMINISTIC CONVERGENCE**.
