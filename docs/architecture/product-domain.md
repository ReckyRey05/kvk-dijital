# İtemSepeti — Product Architecture & Domain Modeling

## 1. Executive Summary & Product Vision

İtemSepeti is a high-trust, low-friction digital gaming marketplace tailored for Turkish gamers and verified digital merchants. It facilitates the secure peer-to-peer (P2P) and merchant-to-peer (B2C) exchange of in-game items, virtual currencies, game activation/gift keys, accounts, and custom digital services.

### Core Marketplace Loop
- **Buyer**: Search -> Inspect Listing -> Cart / Immediate Checkout -> Payment Hold in Escrow -> Delivery Handshake -> Confirmation & Review
- **Seller**: Inventory Deposit / Listing -> Notification of Sale -> Fulfillment (Automated Code / Manual Trade) -> Proof Upload -> Escrow Release to Wallet -> Bank Payout
- **Platform**: Anti-Fraud Inspection -> Immutable Escrow Lock -> Real-time Delivery Auditing -> Automated or Mediated Arbitration -> Double-Entry Ledger Settlement

---

## 2. User Roles & Identity Hierarchy

- **User (Global Entity)**: Holds Firebase Auth UID, primary email, phone verification, KYC tier, security flags (2FA), and global status (`active`, `suspended`, `banned`).
- **BuyerProfile**: Buyer metrics, delivery game tags, saved payment tokens, address/billing information (for invoice generation).
- **SellerProfile**: Merchant store name, verified status badge, average delivery duration, completion rate, feedback score, commission tier override.
- **Admin Permissions**: Role-based access control (RBAC) preventing unauthorized operations (e.g., support agents cannot execute bank payouts).

---

## 3. Product Type Architecture & Game Hierarchy

The marketplace decouples physical gaming goods from digital game assets using a structured 4-tier categorization:

```text
Game (e.g., Metin2, CS2, Valorant, Steam)
 └── ProductType (ITEM, CURRENCY, DIGITAL_CODE, ACCOUNT, OTHER_DIGITAL)
      └── Category (e.g., Yang, Knives, Points, Accounts)
           └── Server / Realm (Optional: e.g., Turkey-1, Marmara, Global, TR-East)
                └── Listing (Seller's offer with pricing, quantity, and delivery SLA)
```

### 3.1 Product Types & Fulfillment Strategies

| Product Type | Example Goods | Fulfillment Mechanism | Primary Fraud Risk | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **ITEM** | CS2 Dragon Lore, Metin2 Dolunay | In-game Trade / Steam Trade URL | Trade cancellation, item takeback | Steam API trade verification, screenshot/video proof upload |
| **CURRENCY** | Metin2 Yang, WoW Gold, Albion Silver | Face-to-face trade / In-game mail | Chargeback, GM ban / rollback | Delivery character match, seller trade recording, escrow hold window |
| **DIGITAL_CODE** | Steam Wallet TL, Valorant VP code | Automated Instant Decryption (`code_reveal`) | Invalid/Duplicate code | One-time reservation, pre-validation check, AES-256 encrypted vault |
| **ACCOUNT** | LoL Diamond account, Valorant Smurf | Secure Credential Handoff | Email recovery by original owner | Linked email transfer guarantee, 48h dispute protection hold |
| **OTHER_DIGITAL** | In-game boosting, customized coaching | Milestone / Proof of Service | Non-completion of service | Partial milestones, chat verification, admin mediation |

---

## 4. Duplicate & Spam Listing Mitigation

To prevent sellers from flooding category pages with duplicate entries:
- **Fingerprinting**: Listings compute a composite normalization hash:
  `Hash = SHA256(sellerId + gameId + categoryId + serverId + normalizedTitle)`
- **ListingGroup**: For identical standardized items (e.g., "Valorant 1200 VP Code"), multiple sellers compete on the same Buy-Box / Product Card, sorted deterministically by `(price ASC, sellerRating DESC, deliverySpeed ASC)`.

---

## 5. Inventory Reservation & Race Condition Defense

Digital codes and unique account credentials require zero-collision reservation:
1. **Available**: Item resides in cold vault encrypted with master key.
2. **Reserved**: When checkout session begins, atomic Firestore transaction transitions status:
   `available` -> `reserved` with `reservationExpiresAt = now + 15 min`.
3. **Sold**: Upon payment webhook confirmation, status transitions `reserved` -> `sold` and assigns `orderId`.
4. **Rollback**: If payment fails or timeout expires, background sweeper reverts `reserved` -> `available`.
