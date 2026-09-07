/**
 * İtemSepeti — Core Domain Types & Data Contracts
 * FAZ 0 Architecture Specification
 * 
 * Strict TypeScript models for all core entities: Users, Games, Listings,
 * Inventory, Orders, Payments, Escrow, Ledger, Delivery, Disputes, and Reviews.
 */

// =============================================================================
// 1. PRODUCT & GAME TAXONOMY
// =============================================================================

export type ItemSepetiProductType =
  | "ITEM"          // In-game item (CS2 skin, Metin2 sword, WoW armor)
  | "CURRENCY"      // Virtual currency (Yang, VP, Robux, Gold, UC)
  | "DIGITAL_CODE"  // Gift card, game activation key, digital wallet code
  | "ACCOUNT"       // Game account (credentials transfer)
  | "OTHER_DIGITAL"; // Services, coaching, custom digital handoffs

export type ItemSepetiDeliveryMethod =
  | "AUTOMATIC_CODE" // Instant reveal from encrypted inventory vault
  | "MANUAL_ITEM"    // Face-to-face in-game trade or Steam Trade Offer
  | "CURRENCY_TRADE" // In-game character trade or delivery merchant
  | "ACCOUNT_HANDOFF"// Secure credential disclosure package
  | "DIRECT_TRANSFER";

export interface ItemSepetiGame {
  id: string; // e.g. game_metin2
  slug: string;
  name: string;
  publisher?: string;
  imageUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  supportedProductTypes: ItemSepetiProductType[];
  servers?: ItemSepetiGameServer[];
  createdAt: number;
  updatedAt: number;
}

export interface ItemSepetiGameServer {
  id: string; // e.g. srv_turkey
  name: string;
  region?: string;
  isActive: boolean;
}

export interface ItemSepetiCategory {
  id: string; // e.g. cat_metin2_yang
  gameId: string;
  slug: string;
  name: string;
  productType: ItemSepetiProductType;
  defaultDeliveryMethod: ItemSepetiDeliveryMethod;
  platformFeeRate: number; // e.g. 0.05 (5%)
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  createdAt: number;
}

// =============================================================================
// 2. USER, SELLER & BUYER ROLES
// =============================================================================

export type ItemSepetiUserRole = "buyer" | "seller" | "admin";

export type ItemSepetiAdminSubRole =
  | "super_admin"
  | "operations_admin"
  | "finance_admin"
  | "moderator";

export type ItemSepetiAccountStatus = "active" | "suspended" | "banned";

export type ItemSepetiKycStatus = "none" | "pending" | "verified" | "rejected";

export interface ItemSepetiUser {
  uid: string;
  email: string;
  phone?: string;
  isPhoneVerified: boolean;
  role: ItemSepetiUserRole;
  adminRole?: ItemSepetiAdminSubRole;
  accountStatus: ItemSepetiAccountStatus;
  kycStatus: ItemSepetiKycStatus;
  twoFactorEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ItemSepetiSellerProfile {
  sellerId: string; // Matches User UID
  storeName: string;
  storeSlug: string;
  avatarUrl?: string;
  bio?: string;
  isVerifiedSeller: boolean;
  ratingAverage: number; // 1.0 - 5.0
  ratingCount: number;
  completedSalesCount: number;
  cancelledSalesCount: number;
  averageDeliveryMinutes: number;
  commissionTierRate?: number; // Custom platform commission override
  vacationMode: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ItemSepetiBuyerProfile {
  buyerId: string; // Matches User UID
  displayName: string;
  avatarUrl?: string;
  totalOrdersCount: number;
  completedOrdersCount: number;
  savedGameTags?: { gameId: string; characterName: string; tradeUrl?: string }[];
  createdAt: number;
}

// =============================================================================
// 3. LISTING & INVENTORY MODEL
// =============================================================================

export type ItemSepetiListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "sold_out"
  | "rejected"
  | "deleted";

export interface ItemSepetiListing {
  id: string;
  sellerId: string;
  gameId: string;
  gameName: string;
  categoryId: string;
  categoryName: string;
  serverId?: string;
  serverName?: string;
  productType: ItemSepetiProductType;
  title: string;
  normalizedTitle: string;
  description: string;
  unitPrice: number; // KDV / Transaction inclusive TL
  stockQuantity: number;
  deliveryMethod: ItemSepetiDeliveryMethod;
  deliverySlaHours: number; // e.g. 1 hour, 24 hours
  images: string[];
  status: ItemSepetiListingStatus;
  rejectionReason?: string;
  duplicateFingerprint: string; // SHA256(sellerId + gameId + categoryId + serverId + normalizedTitle)
  createdAt: number;
  updatedAt: number;
}

export type ItemSepetiInventoryStatus = "available" | "reserved" | "sold" | "disabled";

export interface ItemSepetiInventoryItem {
  id: string;
  listingId: string;
  sellerId: string;
  productType: "DIGITAL_CODE" | "ACCOUNT";
  encryptedPayload: string; // Ciphertext of code or account credentials
  payloadIv: string;
  payloadAuthTag: string;
  status: ItemSepetiInventoryStatus;
  reservedByOrderId?: string;
  reservedAt?: number;
  reservationExpiresAt?: number;
  soldToOrderId?: string;
  revealedAt?: number;
  createdAt: number;
}

// =============================================================================
// 4. CART & CHECKOUT
// =============================================================================

export interface ItemSepetiCartItem {
  listingId: string;
  quantity: number;
  addedAt: number;
}

export interface ItemSepetiCart {
  buyerId: string;
  items: ItemSepetiCartItem[];
  updatedAt: number;
}

// =============================================================================
// 5. ORDER & STATE MACHINE
// =============================================================================

export type ItemSepetiOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "DELIVERED"
  | "BUYER_CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"
  | "REFUNDED";

export interface ItemSepetiOrderItemSnapshot {
  listingId: string;
  gameId: string;
  gameName: string;
  categoryId: string;
  categoryName: string;
  serverId?: string;
  serverName?: string;
  productType: ItemSepetiProductType;
  title: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  sellerAmount: number;
  deliveryMethod: ItemSepetiDeliveryMethod;
  deliveryDetails?: {
    characterName?: string;
    steamTradeUrl?: string;
    specialNotes?: string;
  };
}

export interface ItemSepetiOrder {
  id: string; // ord_{timestamp}_{random}
  orderNumber: string; // SIP-2026-XXXXXX
  buyerId: string;
  buyerEmail: string;
  sellerId: string;
  sellerStoreName: string;
  items: ItemSepetiOrderItemSnapshot[];
  totalAmount: number; // Toplam sepet tutari
  platformCommissionTotal: number;
  sellerPayoutTotal: number;
  status: ItemSepetiOrderStatus;
  paymentId?: string;
  escrowId?: string;
  statusHistory: {
    status: ItemSepetiOrderStatus;
    changedBy: string;
    timestamp: number;
    note?: string;
  }[];
  expectedDeliveryAt?: number;
  deliveredAt?: number;
  autoCompleteAt?: number; // deliveredAt + 24 hours
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// =============================================================================
// 6. PAYMENT, ESCROW & LEDGER
// =============================================================================

export type ItemSepetiPaymentStatus =
  | "initiated"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface ItemSepetiPayment {
  id: string; // pay_{orderId}
  orderId: string;
  orderNumber: string;
  buyerId: string;
  amount: number;
  currency: string;
  provider: "iyzico" | "paytr" | "wallet" | "mock_provider";
  providerPaymentId?: string;
  providerPaymentToken?: string;
  paymentMethod: "credit_card" | "wallet_balance" | "bank_transfer";
  status: ItemSepetiPaymentStatus;
  idempotencyKey: string;
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
  errorMessage?: string;
}

export type ItemSepetiEscrowStatus =
  | "PENDING"
  | "HELD"
  | "RELEASING"
  | "RELEASED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "DISPUTED";

export interface ItemSepetiEscrow {
  id: string; // esc_{orderId}
  orderId: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  heldAmount: number; // Toplam tutar
  platformFeeAmount: number; // Platforma kalacak komisyon
  sellerPayoutAmount: number; // Saticiya aktarilacak net tutar
  status: ItemSepetiEscrowStatus;
  heldAt?: number;
  releaseInitiatedAt?: number;
  releasedAt?: number;
  autoReleaseAt?: number;
  disputedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type ItemSepetiLedgerTransactionType =
  | "CREDIT"
  | "DEBIT"
  | "ESCROW_HOLD"
  | "ESCROW_RELEASE"
  | "REFUND"
  | "COMMISSION"
  | "PAYOUT"
  | "ADJUSTMENT";

export interface ItemSepetiWallet {
  walletId: string; // wal_{uid}
  userId: string;
  availableBalance: number; // Çekilebilir veya harcanabilir net bakiye (TL)
  pendingBalance: number;   // Devam eden siparişlerde escrow güvencesindeki bakiye (TL)
  currency: string;
  updatedAt: number;
}

export interface ItemSepetiLedgerTransaction {
  id: string; // txn_{uuid}
  walletId: string;
  userId: string;
  orderId?: string;
  escrowId?: string;
  type: ItemSepetiLedgerTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId: string; // Webhook id, orderId or payoutId
  createdAt: number;
}

// =============================================================================
// 7. DELIVERY STRATEGY ENTITIES
// =============================================================================

export interface ItemSepetiDeliveryProof {
  orderId: string;
  sellerId: string;
  deliveryMethod: ItemSepetiDeliveryMethod;
  proofType: "SCREENSHOT" | "VIDEO_LINK" | "STEAM_TRADE_ID" | "CHAT_LOG";
  proofUrls: string[];
  tradePartnerIdentifier?: string; // Character name or Steam ID
  notes?: string;
  submittedAt: number;
}

// =============================================================================
// 8. DISPUTE & REFUND
// =============================================================================

export type ItemSepetiDisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "WAITING_FOR_BUYER"
  | "WAITING_FOR_SELLER"
  | "RESOLVED_BUYER"
  | "RESOLVED_SELLER"
  | "PARTIAL_REFUND"
  | "CLOSED";

export interface ItemSepetiDispute {
  id: string; // dsp_{orderId}
  orderId: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  reason:
    | "item_not_received"
    | "code_invalid"
    | "account_reclaimed"
    | "wrong_item"
    | "currency_shortage"
    | "other";
  description: string;
  buyerEvidenceUrls: string[];
  sellerEvidenceUrls?: string[];
  status: ItemSepetiDisputeStatus;
  arbitrationNote?: string;
  arbitratedByAdminId?: string;
  refundAmountDecided?: number;
  openedAt: number;
  resolvedAt?: number;
}

export interface ItemSepetiRefund {
  id: string; // ref_{orderId}
  orderId: string;
  paymentId: string;
  amount: number;
  refundType: "FULL" | "PARTIAL";
  reason: string;
  status: "pending" | "succeeded" | "failed";
  initiatedBy: "buyer_cancellation" | "seller_cancellation" | "admin_dispute";
  providerRefundReference?: string;
  createdAt: number;
}

// =============================================================================
// 9. REVIEW & REPUTATION
// =============================================================================

export interface ItemSepetiReview {
  id: string; // rev_{orderId}
  orderId: string;
  sellerId: string;
  buyerId: string;
  buyerDisplayName: string;
  rating: number; // 1 to 5
  comment?: string;
  replyFromSeller?: string;
  isReported: boolean;
  createdAt: number;
}

// =============================================================================
// 10. NOTIFICATIONS & AUDIT LOGS
// =============================================================================

export type ItemSepetiNotificationEvent =
  | "ORDER_CREATED"
  | "PAYMENT_SUCCESS"
  | "DELIVERY_SUBMITTED"
  | "ORDER_COMPLETED"
  | "ORDER_CANCELLED"
  | "DISPUTE_OPENED"
  | "REFUND_ISSUED"
  | "PAYOUT_COMPLETED"
  | "LISTING_APPROVED"
  | "LISTING_REJECTED";

export interface ItemSepetiNotification {
  id: string;
  userId: string;
  event: ItemSepetiNotificationEvent;
  title: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: number;
}

export interface ItemSepetiAuditLog {
  id: string;
  actorId: string; // UID or "system"
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  beforeSnapshot?: Record<string, any>;
  afterSnapshot?: Record<string, any>;
  ipAddress?: string;
  createdAt: number;
}
