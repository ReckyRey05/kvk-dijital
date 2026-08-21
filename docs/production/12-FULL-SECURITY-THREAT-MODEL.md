# FAZ 12 — FULL SECURITY THREAT MODEL & TRUST BOUNDARY MAP

## 1. EXECUTIVE SUMMARY
Cep Garson is an enterprise multi-tenant QR menu, ordering, and restaurant POS management platform. This threat model establishes zero-trust architectural boundaries across the application stack: from mobile customer browsers and QR code discovery to Next.js API validation, Cloud Firestore data persistence, and POS integration bridges.

---

## 2. COMPREHENSIVE TRUST BOUNDARY ARCHITECTURE

```
[ INTERNET / CLIENT DEVICES (Zero Trust) ]
  ├── Anonymous Users (Public Website / Discovery)
  ├── Customer Mobile Devices (QR Scanner / Browser)
  └── Restaurant Staff Terminals (Waiter / Cashier / Manager / KDS)
              │
              ▼ [ Boundary 1: Edge & Network Security ]
[ Cloudflare / Vercel Edge Protection ]
  ├── DDoS Mitigation & TLS 1.3 Termination
  ├── WAF / HTTP Header Hardening (CSP, HSTS, X-Content-Type-Options)
  └── Rate Limiting (IP, Route, Method, Request Size Limiting)
              │
              ▼ [ Boundary 2: Next.js API & Routing Layer ]
[ Next.js Server-Side Endpoints (/api/restaurant/*) ]
  ├── Input Parsing with 1MB Strict Byte-Limit
  ├── Tenant Resolution (resolveTenant) & Tenant Isolation Guard
  ├── Session HMAC-SHA256 Cryptographic Verification
  └── Role-Based Access Control (RBAC & Master PIN Validation)
              │
              ▼ [ Boundary 3: Canonical Calculation & Business Engine ]
[ Canonical Business Logic & State Machine Engine ]
  ├── 100% Server-Authoritative Price Calculation (Client Prices Discarded)
  ├── Integer Minor Units (Kuruş) Arithmetic (IEEE-754 Flaw Defense)
  ├── Idempotency Registry (x-idempotency-key Defense)
  └── State Machine Enforcement (Linear Non-Reversible Order & Payment States)
              │
              ▼ [ Boundary 4: Data Layer & Persistence ]
[ Google Cloud Firestore (cep-garson-prod) ]
  ├── Firebase Admin SDK with ignoreUndefinedProperties
  ├── ACID Atomic Transactions for Stock Decrements & Bill Settlement
  └── Sub-collection Isolation: /restaurants/{restaurantId}/...
              │
              ▼ [ Boundary 5: External POS & Webhook Integrations ]
[ POS Bridge & Webhooks ]
  ├── Outbound: Secure HTTPS Dispatch with Local ESC/POS Print Daemons
  └── Inbound Webhook: HMAC-SHA256 Signature Verification & Monotonic State Check
```

---

## 3. TRUST BOUNDARY VERIFICATION MATRIX

| Source Boundary | Destination Boundary | Trust Level | Validation & Controls | Failure Mode |
|---|---|---|---|---|
| Client Browser | Next.js API Route | Zero Trust | Rate Limit + 1MB Byte Limit + JSON Validation | 429 Too Many Requests / 400 Bad Request |
| QR Discovery URI | Table Session Engine | Untrusted | QR = Discovery Only. Server Generates HMAC Session | 403 Forbidden / Invalid Table |
| Client Order Payload | Canonical Pricing Engine | Zero Trust | Discards all client-provided prices, calculates from DB | 400 Canonical Validation Failure |
| Staff PIN Input | Staff Auth System | High Sensitivity | 4-Digit PBKDF2/HMAC verification + 15m JWT Session | 401 Unauthorized / Locked Account |
| External Webhook | POS Webhook Receiver | Untrusted External | HMAC-SHA256 Signature Verification (x-pos-signature) | 401 Invalid Signature |
| Server API | Cloud Firestore | High Trust (Admin SDK) | ACID Atomic Transactions + Snapshot Consistency | Fail-Closed / Transaction Rollback |
