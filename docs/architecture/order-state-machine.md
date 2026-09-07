# İtemSepeti — Order State Machine & Lifecycle Specification

## 1. Formal State Machine Definition

The order lifecycle strictly enforces deterministic, monotonic state progression. Any state jump or backwards mutation not explicitly permitted throws an immediate `IllegalStateTransitionError`.

```text
[ PENDING_PAYMENT ]
       |
       +---> (Payment Succeeded) ---> [ PAID ] ---> [ PREPARING ]
       |                                                |
       +---> (Payment Timeout/Failed)                   +---> (Delivered by Seller / Revealed)
       |           |                                    |           |
       v           v                                    v           v
  [ CANCELLED ]                                    [ DELIVERED ]
       ^                                                |
       |                                                +---> (Buyer Confirmed / 24h Auto-Complete)
       |                                                |           |
       |                                                |           v
       |                                                |     [ BUYER_CONFIRMED ] ---> [ COMPLETED ]
       |                                                |
       |                                                +---> (Dispute Raised within Window)
       |                                                            |
       |                                                            v
       |                                                      [ DISPUTED ]
       |                                                            |
       +---------------- (Refund Decided / Arbitration) <-----------+
       |
       v
  [ REFUNDED ]
```

---

## 2. Order States & Transition Rules

| Source State | Target State | Actor / Trigger | Pre-Conditions & Invariants | Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| `PENDING_PAYMENT` | `PAID` | Payment Webhook / Gateway Callback | Verified cryptographic signature, exact amount match | Create `EscrowTransaction` (HELD), lock inventory |
| `PENDING_PAYMENT` | `CANCELLED` | System Timeout / Buyer Cancel | Checkout session expired (>15 min) | Release reserved inventory |
| `PAID` | `PREPARING` | Seller Acceptance / Auto-dispatch | Seller acknowledged order SLA | Notify buyer via push/SMS |
| `PAID` / `PREPARING`| `DELIVERED` | Seller Action / Automated Engine | Digital codes decrypted / In-game proof attached | Start buyer inspection timer (24h SLA) |
| `DELIVERED` | `BUYER_CONFIRMED`| Buyer Confirmation | Buyer confirms receipt in-app | Prepare escrow release queue |
| `DELIVERED` | `COMPLETED` | System Auto-Settle | 24 hours elapsed with zero dispute opened | Trigger `EscrowRelease` -> Credit Seller Wallet |
| `BUYER_CONFIRMED` | `COMPLETED` | System Execution | Immediate upon buyer confirmation | Trigger `EscrowRelease` -> Credit Seller Wallet |
| `DELIVERED` | `DISPUTED` | Buyer Dispute Submission | Within 24h inspection window, reason & proof provided | Lock escrow indefinitely, notify dispute admin |
| `DISPUTED` | `COMPLETED` | Admin Dispute Arbitration | Admin finds in favor of Seller | Release escrow to seller wallet, log audit decision |
| `DISPUTED` | `REFUNDED` | Admin Dispute Arbitration | Admin finds in favor of Buyer | Trigger gateway refund or buyer wallet credit |
| `PAID` / `PREPARING`| `CANCELLED` | Seller Out of Stock / Admin | Mutual agreement or seller stock failure | Reverse escrow, initiate 100% buyer refund |

---

## 3. Order Item Snapshot Guarantee

An `Order` NEVER references mutable properties of a listing. Upon order creation, all historical values are permanently snapshotted:

```typescript
interface OrderItemSnapshot {
  listingId: string;
  gameId: string;
  gameName: string;
  categoryId: string;
  categoryName: string;
  productType: ItemSepetiProductType;
  title: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  platformCommissionRate: number;
  platformCommissionAmount: number;
  sellerEarningsAmount: number;
  deliveryMethod: ItemSepetiDeliveryMethod;
}
```

*Rule: If a seller changes their listing price from 100 TL to 150 TL or deletes the listing entirely, historical orders remain 100% immutable and intact.*
