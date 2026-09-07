# İtemSepeti — Data Model & Firestore Index Strategy

## 1. Primary Firestore Collections

To avoid excessive cross-document joins (N+1 queries) while maintaining strict tenant isolation, İtemSepeti uses a normalized root collection strategy with indexed foreign keys:

| Collection Name | Document ID Pattern | Source of Truth For | Write Actors |
| :--- | :--- | :--- | :--- |
| `itemsepeti_users` | `{uid}` (Firebase Auth UID) | Auth profile, role, KYC status | User / Admin |
| `itemsepeti_seller_profiles` | `seller_{uid}` | Merchant badges, store rating, sales count | Seller / System Worker |
| `itemsepeti_games` | `game_{slug}` (e.g. `game_metin2`)| Available game taxonomy & server realms | Super Admin / Ops Admin |
| `itemsepeti_categories` | `cat_{slug}` | Subcategory configurations & metadata | Super Admin / Ops Admin |
| `itemsepeti_listings` | `lst_{randomId}` | Live offers, active stock count, unit price | Seller (via Server API) |
| `itemsepeti_inventory` | `inv_{randomId}` | Secure encrypted codes & account credentials | Seller / System Worker |
| `itemsepeti_orders` | `ord_{orderNumber}` | Transaction snapshot, delivery state | System Worker (Server Only) |
| `itemsepeti_payments` | `pay_{paymentId}` | External gateway transaction records | System Webhook Processor |
| `itemsepeti_escrows` | `esc_{orderId}` | Legal custody state & fund release timers | System Worker (Server Only) |
| `itemsepeti_wallets` | `wal_{uid}` | Available & pending financial balances | System Ledger Processor |
| `itemsepeti_ledger` | `txn_{uuid}` | Immutable double-entry balance log | System Ledger Processor |
| `itemsepeti_disputes` | `dsp_{orderId}` | Mediation evidence, arguments, admin verdict | Buyer / Seller / Admin |
| `itemsepeti_reviews` | `rev_{orderId}` | 1-5 star ratings and buyer review texts | Buyer (Completed orders) |
| `itemsepeti_audit_logs` | `aud_{timestamp}_{rand}` | Immutable security and financial audit events | Server / Admin Operations |

---

## 2. Composite Index Requirements

High-frequency queries require pre-defined composite indexes in `firestore.indexes.json`:

1. **Active Marketplace Search**:
   - `itemsepeti_listings`: `(gameId ASC, categoryId ASC, status ASC, price ASC)`
   - `itemsepeti_listings`: `(gameId ASC, status ASC, createdAt DESC)`
   - `itemsepeti_listings`: `(sellerId ASC, status ASC, createdAt DESC)`
2. **Buyer & Seller Order Hubs**:
   - `itemsepeti_orders`: `(buyerId ASC, status ASC, createdAt DESC)`
   - `itemsepeti_orders`: `(sellerId ASC, status ASC, createdAt DESC)`
   - `itemsepeti_orders`: `(status ASC, expectedDeliveryAt ASC)` (Auto-complete Sweeper)
3. **Escrow & Ledger Processing**:
   - `itemsepeti_escrows`: `(status ASC, autoReleaseAt ASC)` (SLA Execution)
   - `itemsepeti_ledger`: `(walletId ASC, createdAt DESC)` (Transaction History)
4. **Dispute Arbitration**:
   - `itemsepeti_disputes`: `(status ASC, createdAt ASC)` (Admin Queue)
