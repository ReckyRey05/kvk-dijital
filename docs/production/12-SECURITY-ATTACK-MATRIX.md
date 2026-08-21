# FAZ 12 — SECURITY ATTACK MATRIX & OWASP ASVS 5.0 VERIFICATION

## 1. COMPREHENSIVE ATTACK VECTORS & DEFENSE VERIFICATION

| Vector ID | Category | Attack Description | Expected Defense | Verified Result |
|---|---|---|---|---|
| ATK-01 | Financial | Negative / Zero Price Injection | Discard client prices, compute from verified menu | PASS (Server Enforces Canonical) |
| ATK-02 | Session | HMAC Token Forgery | Verify cryptographic signature via HMAC-SHA256 | PASS (Rejected 403) |
| ATK-03 | Session | Stale Token Resurrection | Check active session registry; delete on close | PASS (Rejected SESSION_INVALID) |
| ATK-04 | IDOR | Cross-Tenant Table Access | TenantGuard ownership assertion | PASS (Blocked 404/403) |
| ATK-05 | RBAC | Customer Calls Cash Close | Require Cashier / Manager role | PASS (Denied) |
| ATK-06 | State Machine | Reverse Transition (SERVED -> PREPARING) | Linear monotonic state machine validator | PASS (Blocked) |
| ATK-07 | XSS | Malicious Script in Guest Name / Notes | DOMPurify / sanitizeHtmlContent | PASS (Sanitized) |
| ATK-08 | Inventory | Concurrent Overselling Race (5 stock, 6 buys) | ACID atomic Firestore transaction decrement | PASS (5 Succeeded, 1 Rejected) |
| ATK-09 | Concurrency | Concurrent Shared Cart Additions | Server-side atomic merge / append | PASS (0 Lost Updates) |
| ATK-10 | Network | Offline Reconnect State Synchronization | Monotonic state reconciliation | PASS (Canonical State Restored) |
