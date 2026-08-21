# FAZ 12 — SESSION SECURITY SPECIFICATION

## 1. CRYPTOGRAPHIC SESSION TOKEN DESIGN

Session tokens are generated using server-side HMAC-SHA256 signatures:

$$\text{Token} = \text{base64url}(\text{Payload} \mathbin{\Vert} "." \mathbin{\Vert} \text{HMAC-SHA256}(\text{Payload}, K_{\text{session}}))$$

Where:
- $\text{Payload} = \text{restaurantId} : \text{tableId} : \text{fingerprint} : \text{timestamp} : \text{nonce}$
- $K_{\text{session}} = \text{process.env.SESSION\_SECRET}$

---

## 2. TIMING-SAFE VERIFICATION
All token signature verifications execute using `crypto.timingSafeEqual` to prevent side-channel timing attacks.

---

## 3. SESSION SECURITY CONTROLS & INVARIANTS

| Control | Mechanism | Verification Status |
|---|---|---|
| Expiration | 15-minute sliding window with heartbeat renewal | VERIFIED |
| Table Binding | Token strictly bound to `restaurantId:tableId` | VERIFIED |
| Invalidation on Close | `invalidateAllTableSessions` clears active tokens on bill payment | VERIFIED |
| Non-Resurrection | Closed sessions cannot be re-activated by replaying tokens | VERIFIED |
| Tenant Isolation | Cross-tenant token replay returns `INVALID_TOKEN` (403) | VERIFIED |
