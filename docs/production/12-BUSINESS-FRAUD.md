# FAZ 12 — FINANCIAL INTEGRITY & BUSINESS FRAUD DEFENSE

## 1. ZERO-TRUST FINANCIAL INVARIANTS

### 1.1. Integer Minor Units (Kuruş) Arithmetic
All financial values are stored and calculated as integers representing kuruş (cents):
$$\text{MinorUnits} = \text{Math.round}(\text{MajorUnits} \times 100)$$
This eliminates IEEE-754 floating-point inaccuracies (e.g. $0.1 + 0.2 = 0.30000000000000004$).

### 1.2. Client Price Discard Policy
Any price, unitPrice, discount, tax, or total submitted in the HTTP request payload is strictly discarded. The server computes prices using the verified menu item definitions from the canonical database.

---

## 2. ADVERSARIAL FRAUD SCENARIOS & DEFENSES

| Fraud Attack | Attacker Technique | Canonical Defense | Financial Impact |
|---|---|---|---|
| Negative Price Injection | Sends `{ price: -500 }` in order payload | Server ignores payload price, fetches 360 TL from database | 0 TL Loss (Denied) |
| Price Tampering | Modifies 450 TL Steak to 1.00 TL | Server recalculates unit price * quantity = 450 TL | 0 TL Loss (Denied) |
| Negative Quantity | Sends `{ quantity: -10 }` to reduce bill | Canonical validator checks `quantity >= 1` integer | 0 TL Loss (400 Bad Request) |
| Double Payment Replay | Replays payment request multiple times | Idempotency registry + Firestore atomic transaction | 0 Duplicate Charges |
| Post-Service Cancellation | Tries to cancel order after food is SERVED | State machine enforces `SERVED -> CANCELLED` is illegal | 0 Loss (Denied) |
| Stale Order Re-Aggregation | Order served, then second order placed | Bill aggregates only unpaid orders for active session | 0 Double Count |
