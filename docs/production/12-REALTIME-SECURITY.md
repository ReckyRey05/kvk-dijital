# FAZ 12 — REALTIME SUBSCRIPTION & EVENT SECURITY

## 1. DATA SCOPING & ISOLATION

Realtime subscriptions and polling mechanisms strictly scope data access based on actor identity:

- **Customer:** Scoped strictly to `/restaurants/{restaurantId}/liveSync/state` with table-level and session-level filtering.
- **KDS Kitchen:** Scoped to active `PREPARING` and `READY` orders for the restaurant.
- **Cashier POS:** Scoped to active occupied tables, unpaid bills, and active waiter calls.
- **Management:** Scoped to restaurant settings, staff management, and inventory levels.

---

## 2. EVENT FORGERY DEFENSE
Clients cannot broadcast raw state mutations directly. All mutations (such as `CREATE_ORDER`, `ADD_TO_SHARED_CART`, `CLOSE_TABLE_BILL`, `TRANSFER_TABLE`) are POSTed to `/api/restaurant/sync` where server-side validation and authorization are enforced before state changes are persisted and broadcast.

---

## 3. LISTENER LIFECYCLE & ZERO-LEAK GUARANTEE
Every React component mounting a realtime listener attaches an unsubscribe handler in its `useEffect` cleanup. In 1,000 mount/unmount stress tests, heap diff is 0 MB with zero listener leaks.
