# FAZ 12 — PERMANENT DEVICE IDENTITY & ZERO-AUTHORITY MODEL

## 1. IDENTITY ABSTRACTION MODEL

The system enforces a strict separation between physical device identifiers and authorization contexts:

$$\text{DEVICE\_ID} \neq \text{CUSTOMER\_ID} \neq \text{SESSION\_ID} \neq \text{PARTICIPANT\_ID} \neq \text{AUTH\_TOKEN}$$

```
+-------------------------------------------------------------+
| Physical Hardware Layer: Device Fingerprint / Hash          |
+-------------------------------------------------------------+
                              | (Ephemeral Identifier)
+-------------------------------------------------------------+
| Transient Client Session: 15-Min HMAC-Signed Table Session  |
+-------------------------------------------------------------+
                              | (Bound to Table & Tenant)
+-------------------------------------------------------------+
| Table Participant Role: Host (Masa Reisi) or Guest (Misafir)|
+-------------------------------------------------------------+
                              | (Authorized via Server State)
+-------------------------------------------------------------+
| Canonical Financial Order: Bound to Session & Verified DB   |
+-------------------------------------------------------------+
```

---

## 2. DEVICE IDENTITY SECURITY INVARIANTS

1. **Device ID Never Equals Authority:**
   A client sending a known `deviceId` or browser fingerprint gains zero automatic rights to place orders, view historical bills, or claim table leadership without server-side cryptographic session verification.

2. **Stolen Storage Immunity:**
   If an adversary clones a user's `localStorage` (`cg_participant_m-4`), the stolen token is validated against the server's live session registry. If the original table session has been closed or expired, the stolen token is rejected (`SESSION_INVALID`).

3. **Device Hopping & Multi-Tab Isolation:**
   When a device moves to a new table (e.g. from Table 1 to Table 4), the browser storage for Table 1 does not grant access to Table 4. Each table maintains an independent cryptographic context.
