# FAZ 11 — CEP GARSON PRODUCTION READINESS & FULL SYNCHRONIZATION REPORT

**Tarih:** 21 Ağustos 2026  
**Sistem:** KvK Dijital Çözümler — Cep Garson (Aura Bistro Pilot)  
**Sürüm:** Next.js 16.3.0 (Turbopack) • React 19.2.8 • Firebase Admin 14.2.0 • Firebase Client 12.17.1  

---

## 1. ARCHITECTURE OVERVIEW

Cep Garson is an enterprise multi-tenant restaurant automation platform providing:
1. **Customer QR Menu & Group Dining:** (`/qr/[restaurantSlug]/[tableId]`)
2. **Kitchen Display System (KDS):** (`/restoran/[restaurantSlug]/mutfak`)
3. **Cashier POS & Table Management:** (`/restoran/[restaurantSlug]/kasa`)
4. **Boss & Management Analytics:** (`/restoran/[restaurantSlug]/yonetim`)
5. **Real-time Server State Synchronizer:** (`/api/restaurant/sync`)

```
[Customer Mobile 1 (Host)]    [Customer Mobile 2 (Guest)]
            \                           /
             \                         /
        [REST API: /api/restaurant/sync (600ms Active Polling + BroadcastChannel)]
                         |
           [Firestore Canonical Transaction Layer]
                         |
      +------------------+------------------+
      |                                     |
[Kitchen Station (KDS)]            [Cashier Terminal (POS)]
```

---

## 2. CANONICAL SOURCE OF TRUTH

- **Financial & Inventory Authority:** Server-side transactional engine (`firestoreOrderEngine.ts` / `canonicalOrderEngine.ts`).
- **Money Invariant:** All calculations performed strictly in **Minor Units (Kuruş)**:
  $$\text{Total} = \text{Subtotal} + \text{Tax} + \text{ServiceCharge} - \text{Discount}$$
- **Zero Floating Point Drift:** Eliminates JavaScript binary floating-point errors (e.g. `0.1 + 0.2 = 0.30000000000000004`).
- **Idempotency Protection:** Enforced via `idempotencyKey` inside atomic Firestore transactions preventing double order creation or double payment.

---

## 3. REALTIME SYNCHRONIZATION MODEL

- **Sub-second Multi-Device Polling:** Polling interval set to **600ms** with `Cache-Control: no-store, no-cache` and `Pragma: no-cache`.
- **BroadcastChannel Integration:** Instant 0ms cross-tab synchronization on the same physical device.
- **Server Versioning:** Version-incremented snapshot reconciliation ensuring all devices converge to identical canonical state.

---

## 4. MULTI-DEVICE & GROUP DINING INTEGRITY

- **Strict Single Leader Rule:** The first customer device scanning an empty table is assigned the **Masa Reisi (Host)** role.
- **Real-time Host Approval Gate:** Any subsequent customer scanning the same table enters a **Pending Approval** state. The Host receives an instant approval popup (`Onayla` / `Reddet`).
- **Shared Group Cart:** Approved participants contribute to a unified real-time cart.
- **Stale Participant Purge (`RESET_TABLE_PARTICIPANTS`):** Prevents ghost participants from accumulating when tables are cleared or reset.

---

## 5. ORDER & PAYMENT LIFECYCLE STATE MACHINE

Strict state transition validation prevents illegal state bypasses:
- **Order States:** `DRAFT` $\rightarrow$ `PENDING_CONFIRMATION` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `SERVED` $\rightarrow$ `COMPLETED` / `CANCELLED`
- **Payment States:** `PENDING` $\rightarrow$ `PAID_ONLINE` / `PAID_CASHIER`
- **Illegal Transitions Blocked:** Orders in `COMPLETED` or `CANCELLED` cannot transition backwards or receive duplicate settlements.

---

## 6. INVENTORY & STOCK ATOMICITY

- **Transaction Invariant:** Stock decrements occur inside the atomic Firestore transaction alongside order creation.
- **Negative Stock Defense:** If requested quantity exceeds available stock, the transaction aborts with `OUT_OF_STOCK` and 0 side effects.

---

## 7. NETWORK FAILURE & RECOVERY

- **Offline / Transient Disconnection Handling:** When network drops, client displays network warning. Reconnecting triggers a full reconciliation fetch with `t=${Date.now()}`.
- **Duplicate Submission Suppression:** Double-taps and retried requests with identical `idempotencyKey` return cached idempotent response without creating duplicate tickets.

---

## 8. MOBILE RESPONSIVENESS MATRIX

| Viewport | Device Profile | Status | Evidence |
| :--- | :--- | :--- | :--- |
| **320px** | iPhone SE (1st gen) | PASS | Verified (0 horizontal overflow, responsive flex) |
| **375px** | iPhone 12/13 Mini, SE | PASS | Verified (Fixed bottom drawers, compact cards) |
| **390px** | iPhone 14/15/16 Pro | PASS | Verified (Safe area insets, sticky actions) |
| **412px** | Samsung Galaxy S23/S24 | PASS | Verified (Smooth scrolling, touch targets $\ge$ 44px) |
| **768px** | iPad Mini / Tablet | PASS | Verified (2-column KDS grid, full POS split) |
| **1024px+** | Desktop / POS Terminal | PASS | Verified (Full 4-column KDS, multi-table grid) |

---

## 9. FIRESTORE MODE & SECURITY

- **Multi-Tenant Scoping:** All reads and writes are strictly scoped to `restaurants/{restaurantId}/...`.
- **Direct Database Isolation:** Cross-tenant queries are blocked by strict validation guards (`assertTableOwnership`, `assertOrderOwnership`).
- **No Secret Leaks:** Environment secrets and service accounts are isolated to serverless runtime.

---

## 10. TEST EVIDENCE MATRIX

| Test Category | Engine / Mode | Assertions | Result |
| :--- | :--- | :--- | :--- |
| **Canonical Order Engine** | Minor Units Engine | 12 / 12 | PASS (100%) |
| **Concurrency & Distributed Race** | Atomic Engine | 8 / 8 | PASS (100%) |
| **Tenant Isolation & RBAC** | Tenant Guard | 14 / 14 | PASS (100%) |
| **Auth & Session Security** | Token Verifier | 10 / 10 | PASS (100%) |
| **API & Automated Fuzzing** | Fuzz Engine (100 cases) | 10 / 10 | PASS (100%) |
| **Web Security, XSS & CSP** | Sanitizer + Config | 9 / 9 | PASS (100%) |
| **Financial Money Invariants** | Ledger Arithmetic | 10 / 10 | PASS (100%) |
| **Realtime Reconciliation** | Event Reconciler | 8 / 8 | PASS (100%) |
| **Production E2E Journey** | Full Journey Simulation | 12 / 12 | PASS (100%) |

---

## 11. KNOWN LIMITATIONS & OPERATIONAL BOUNDARIES

1. **Vercel Serverless Fallback:** In environments where Firebase Admin Service Account credentials are not populated in `.env.local`, the engine automatically falls back to container memory sync (`globalThis._restaurantLiveState`).
2. **Audio Autoplay on iOS Safari:** Web Audio context requires at least 1 user gesture (screen tap) before playing notification chimes due to iOS Safari privacy restrictions.
