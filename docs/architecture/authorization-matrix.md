# İtemSepeti — Authorization & Security Matrix

## 1. Resource Permission Matrix

| Resource / Action | Buyer | Seller | Ops Admin | Finance Admin | Super Admin | Server Worker |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **View Public Listing** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Create Listing** | No | Yes (Active KYC) | Yes | No | Yes | No |
| **Edit/Delete Listing** | No | Yes (Own Only) | Yes (Moderate) | No | Yes | No |
| **Create Order / Checkout** | Yes | No (Self-deal blocked)| No | No | No | Yes |
| **View Order Details** | Yes (Own) | Yes (Own) | Yes | Yes | Yes | Yes |
| **Mark Order Delivered** | No | Yes (Own) | Yes | No | Yes | Yes (Automated) |
| **Confirm Delivery** | Yes (Own) | No | No | No | Yes (Arbitrate) | Yes (SLA Timer) |
| **Open Dispute** | Yes (Own) | No | No | No | No | No |
| **Arbitrate Dispute** | No | No | Yes | No | Yes | No |
| **Release Escrow** | No | No | No | No | Yes (Emergency) | Yes (Authoritative)|
| **Direct Wallet Credit** | No | No | No | No | Yes (Audited) | Yes (Payment Webhook)|
| **Request Payout (IBAN)** | No | Yes (Available Bal)| No | No | No | No |
| **Approve / Execute Payout**| No | No | No | Yes | Yes | No |
| **View System Audit Logs** | No | No | Read-Only | Read-Only | Full Access | Yes |

---

## 2. Server vs Client Responsibility Rules

### STRICT CLIENT BOUNDARIES:
- Client NEVER calculates discounts, final totals, commission cuts, or seller payouts.
- Client NEVER provides `order.status`, `payment.status`, or `escrow.status` in API mutation payloads.
- Client CANNOT decrypt digital codes directly; codes are decrypted on server only upon authenticated session inspection.
- Client CANNOT execute balance top-ups without cryptographic webhook signature verification from the authorized payment gateway.

### STRICT SERVER INVARIANTS:
- All financial balance modifications occur inside isolated ACID transactions with optimistic locking.
- Self-dealing (a seller purchasing their own listing using another account on the same IP/Device/Fingerprint) is detected and blocked.
- Role privilege escalation payloads in profile update endpoints are discarded and logged to security alerts.
