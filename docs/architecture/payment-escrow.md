# İtemSepeti — Payment, Escrow & Ledger Architecture

## 1. Escrow vs Payment Segregation

In digital marketplaces, treating Payment and Escrow as the same entity leads to severe accounting vulnerabilities and chargeback loopholes. In İtemSepeti, they are strictly separated:

1. **Payment**: The external fiat money ingestion process (e.g., Credit Card via Iyzico/PayTR, Havale/EFT, Wallet top-up).
2. **Escrow**: The internal legal custodian agreement holding the buyer's funds in trust until the seller fulfills the digital delivery obligations.
3. **Ledger / WalletTransaction**: The double-entry accounting book documenting every kuruş entering or leaving the system.

---

## 2. Escrow State Machine

```text
       [ PENDING ] (Awaiting gateway payment confirmation)
            |
            v
         [ HELD ] (Funds secured in escrow; seller delivers)
         /      \
        /        \ (Dispute opened)
       v          v
[ RELEASING ]   [ DISPUTED ] (Escrow frozen)
     |            /         \
     v           v           v
[ RELEASED ] [ REFUNDED ] [ PARTIALLY_REFUNDED ]
```

### Invariants:
- While an escrow is in `HELD` or `DISPUTED` state, the seller CANNOT withdraw the funds.
- An escrow can ONLY transition to `RELEASED` if:
  1. The buyer explicitly clicked "Onayla" (Buyer confirmed), OR
  2. The 24-hour auto-completion SLA elapsed with zero disputes, OR
  3. A dispute was resolved in favor of the seller by an authorized admin.

---

## 3. Double-Entry Ledger Architecture

The wallet balance is NEVER mutated directly via unsafe increments (`balance += amount`). Every balance modification requires an immutable `WalletTransaction` record:

```typescript
type WalletTransactionType =
  | "CREDIT"          // Wallet deposit (credit card or EFT)
  | "DEBIT"           // Wallet spend on marketplace order
  | "ESCROW_HOLD"     // Funds locked for active order
  | "ESCROW_RELEASE"  // Earnings released to seller
  | "REFUND"          // Returned funds from cancelled/disputed order
  | "COMMISSION"      // Platform revenue deduction
  | "PAYOUT"          // Withdrawal to IBAN bank account
  | "ADJUSTMENT";     // Manual admin adjustment (audit required)
```

### Wallet Balance Derivation
A seller's wallet maintains two numbers:
- `availableBalance`: Total funds cleared from finished escrows, ready for IBAN payout or new purchases.
- `pendingBalance`: Total funds currently locked in active escrows for orders in progress.

Formula:
$$\text{availableBalance} = \sum \text{Credits} - \sum \text{Debits} - \sum \text{Payouts}$$
$$\text{pendingBalance} = \sum \text{HeldEscrows} - \sum \text{ReleasedEscrows} - \sum \text{RefundedEscrows}$$

---

## 4. Idempotency & Replay Defense

All financial endpoints enforce strict idempotency keys generated via:
$$\text{IdempotencyKey} = \text{SHA256}(\text{userId} + \text{action} + \text{resourceId} + \text{timestampBucket})$$

- Webhook callbacks check an `idempotencyKeys` collection inside an atomic transaction.
- If a webhook replay arrives, the system returns `HTTP 200 { status: "already_processed" }` without re-crediting the wallet or re-releasing escrow.
