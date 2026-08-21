# FAZ 12 — ROLE-BASED ACCESS CONTROL (RBAC) & AUTHORIZATION MATRIX

## 1. ACTOR ROLES & PERMISSIONS

```
[ ANONYMOUS ] ──> Public Website, Menu Discovery (Read-Only)
[ CUSTOMER  ] ──> Table Session Join, Shared Cart Mutation, Order Creation, Bill Request
[ WAITER    ] ──> Order Confirmation, Table Transfer, Table Status View, Waiter Call Resolution
[ KITCHEN   ] ──> KDS State Progression (PREPARING -> READY -> SERVED), Recipe View
[ CASHIER   ] ──> Bill Aggregation, Payment Settlement (Cash/Card), Table Close, Z-Report, E-Fatura
[ MANAGER   ] ──> Staff PIN Management, Menu Pricing, Inventory Adjustments, Table Resets
[ BOSS/OWNER] ──> Master Security PIN, Platform Settings, Full Financial Reports, Auditing
```

---

## 2. COMPREHENSIVE RBAC OPERATION MATRIX

| Operation | Anonymous | Customer | Waiter | Kitchen | Cashier | Manager | Boss/Owner |
|---|---|---|---|---|---|---|---|
| View Public Menu | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW |
| Add to Shared Cart | DENY | ALLOW (Joined) | DENY | DENY | DENY | DENY | DENY |
| Submit Order | DENY | ALLOW (Host) | ALLOW | DENY | ALLOW | ALLOW | ALLOW |
| Update KDS State | DENY | DENY | DENY | ALLOW | DENY | ALLOW | ALLOW |
| Transfer Table | DENY | DENY | ALLOW | DENY | ALLOW | ALLOW | ALLOW |
| Settle / Close Bill | DENY | DENY | DENY | DENY | ALLOW | ALLOW | ALLOW |
| Reset Single Table | DENY | DENY | DENY | DENY | ALLOW | ALLOW | ALLOW |
| Edit Prices / Stock | DENY | DENY | DENY | DENY | DENY | ALLOW | ALLOW |
| Master Security Lock | DENY | DENY | DENY | DENY | DENY | DENY | ALLOW |
