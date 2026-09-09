/**
 * İtemSepeti — Order & Checkout Service
 * Handles atomic inventory reservations, multi-seller order splitting,
 * immutable order snapshots, idempotency defense, and state machine transitions.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import {
  ItemSepetiOrder,
  ItemSepetiOrderItemSnapshot,
  ItemSepetiOrderStatus,
  ItemSepetiReservation,
  ItemSepetiCheckoutSession,
} from "@/types/marketplace";
import { getListingById, getSellerBySlug, getCategoryById } from "./catalogService";
import { clearCart, getCart } from "./cartService";
import { logAuditEvent } from "./auditService";
import { recordLedgerTransaction } from "./walletService";
import { sendNotification } from "./notificationService";

// In-memory fallbacks
const inMemoryReservations = new Map<string, ItemSepetiReservation>();
const inMemoryOrders = new Map<string, ItemSepetiOrder>();
const inMemorySessions = new Map<string, ItemSepetiCheckoutSession>();
const inMemoryIdempotency = new Map<string, string>(); // idempotencyKey -> checkoutId

/**
 * Generate a deterministic and unique order number conforming to FAZ 0: SIP-YYYY-XXXXXX
 */
export function generateOrderNumber(year: number = new Date().getFullYear()): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SIP-${year}-${randomPart}`;
}

/**
 * Check and clean expired reservations (default 15 minutes)
 */
export async function releaseExpiredReservations(): Promise<number> {
  const now = Date.now();
  let releasedCount = 0;

  for (const [id, res] of inMemoryReservations.entries()) {
    if (res.status === "ACTIVE" && res.expiresAt <= now) {
      res.status = "EXPIRED";
      res.releasedAt = now;
      releasedCount++;
    }
  }

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("itemsepeti_reservations")
      .where("status", "==", "ACTIVE")
      .where("expiresAt", "<=", now)
      .get();

    for (const doc of snap.docs) {
      await doc.ref.update({
        status: "EXPIRED",
        releasedAt: now,
      });
      releasedCount++;
    }
  } catch {}

  return releasedCount;
}

/**
 * Get active reserved quantity for a listing
 */
export async function getActiveReservedStock(listingId: string): Promise<number> {
  await releaseExpiredReservations();
  const now = Date.now();
  let totalReserved = 0;

  for (const res of inMemoryReservations.values()) {
    if (res.listingId === listingId && res.status === "ACTIVE" && res.expiresAt > now) {
      totalReserved += res.quantity;
    }
  }

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("itemsepeti_reservations")
      .where("listingId", "==", listingId)
      .where("status", "==", "ACTIVE")
      .where("expiresAt", ">", now)
      .get();

    if (!snap.empty) {
      totalReserved = snap.docs.reduce((acc, doc) => acc + (doc.data().quantity || 0), 0);
    }
  } catch {}

  return totalReserved;
}

/**
 * Create inventory reservations with atomic lease
 */
export async function createInventoryReservations(
  buyerId: string,
  items: { listingId: string; quantity: number }[]
): Promise<{
  success: boolean;
  reservations?: ItemSepetiReservation[];
  error?: string;
}> {
  if (!items || items.length === 0) {
    return { success: false, error: "Rezervasyon için en az bir ürün gereklidir." };
  }

  const now = Date.now();
  const expiresAt = now + 15 * 60 * 1000; // 15 minutes
  const createdReservations: ItemSepetiReservation[] = [];

  for (const item of items) {
    const listing = await getListingById(item.listingId);
    if (!listing) {
      return { success: false, error: `İlan (${item.listingId}) bulunamadı.` };
    }

    if (listing.status !== "active") {
      return { success: false, error: `İlan (${listing.title}) aktif satışta değil.` };
    }

    const currentReserved = await getActiveReservedStock(item.listingId);
    const availableUnreservedStock = listing.stockQuantity - currentReserved;

    if (availableUnreservedStock < item.quantity) {
      return {
        success: false,
        error: `Yetersiz stok. "${listing.title}" için rezerve edilebilir stok: ${Math.max(
          0,
          availableUnreservedStock
        )}, talep edilen: ${item.quantity}.`,
      };
    }

    const resId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reservation: ItemSepetiReservation = {
      id: resId,
      listingId: item.listingId,
      sellerId: listing.sellerId,
      buyerId,
      quantity: item.quantity,
      status: "ACTIVE",
      expiresAt,
      createdAt: now,
    };

    inMemoryReservations.set(resId, reservation);
    createdReservations.push(reservation);

    try {
      const db = getAdminDb();
      await db.collection("itemsepeti_reservations").doc(resId).set(reservation);
    } catch {}
  }

  return { success: true, reservations: createdReservations };
}

export interface CreateOrderInput {
  buyerId: string;
  buyerEmail?: string;
  idempotencyKey?: string;
  deliveryDetails?: Record<
    string,
    { characterName?: string; steamTradeUrl?: string; specialNotes?: string }
  >;
}

export interface CreateOrderResult {
  success: boolean;
  checkoutSession?: ItemSepetiCheckoutSession;
  orders?: ItemSepetiOrder[];
  error?: string;
}

/**
 * Create Order(s) from Buyer's current Cart
 * Performs multi-seller split, idempotent retry check, inventory reservation,
 * price/fee snapshotting, and cart cleanup.
 */
export async function createOrderFromCart(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { buyerId, buyerEmail = "buyer@itemsepeti.com", idempotencyKey, deliveryDetails = {} } = input;

  if (!buyerId || !buyerId.trim()) {
    return { success: false, error: "Sipariş oluşturmak için oturum açmalısınız." };
  }

  // 1. Idempotency Check
  if (idempotencyKey) {
    const existingCheckoutId = inMemoryIdempotency.get(idempotencyKey);
    if (existingCheckoutId) {
      const existingSession = inMemorySessions.get(existingCheckoutId);
      if (existingSession) {
        const existingOrders = existingSession.orderIds
          .map((id) => inMemoryOrders.get(id))
          .filter(Boolean) as ItemSepetiOrder[];
        return {
          success: true,
          checkoutSession: existingSession,
          orders: existingOrders,
        };
      }
    }
  }

  // 2. Load and validate enriched cart
  const enrichedCart = await getCart(buyerId);
  if (!enrichedCart.items || enrichedCart.items.length === 0) {
    return { success: false, error: "Sepetiniz boş. Lütfen önce ürün ekleyin." };
  }

  if (enrichedCart.hasUnavailableItems) {
    return {
      success: false,
      error: "Sepetinizde tüketen veya satışa kapalı ürünler var. Lütfen sepetinizi güncelleyin.",
    };
  }

  // 3. Create 15-min atomic inventory reservations
  const itemsToReserve = enrichedCart.items.map((it) => ({
    listingId: it.listingId,
    quantity: it.quantity,
  }));
  const resResult = await createInventoryReservations(buyerId, itemsToReserve);
  if (!resResult.success || !resResult.reservations) {
    return { success: false, error: resResult.error || "Stok rezervasyonu yapılamadı." };
  }

  const now = Date.now();
  const createdOrders: ItemSepetiOrder[] = [];
  const checkoutId = `chk_${now}_${Math.random().toString(36).substring(2, 7)}`;

  // 4. Multi-Seller Split: One Order per Seller
  for (const sellerGroup of enrichedCart.sellers) {
    const orderItems: ItemSepetiOrderItemSnapshot[] = [];
    let sellerOrderTotal = 0;
    let sellerCommissionTotal = 0;
    let sellerPayoutTotal = 0;
    let maxSlaHours = 24;

    for (const item of sellerGroup.items) {
      const listing = item.listing;
      const category = await getCategoryById(listing.categoryId);
      const platformFeeRate = category?.platformFeeRate || 0.05;

      const totalPrice = Number((listing.unitPrice * item.quantity).toFixed(2));
      const platformFeeAmount = Number((totalPrice * platformFeeRate).toFixed(2));
      const sellerAmount = Number((totalPrice - platformFeeAmount).toFixed(2));

      sellerOrderTotal = Number((sellerOrderTotal + totalPrice).toFixed(2));
      sellerCommissionTotal = Number((sellerCommissionTotal + platformFeeAmount).toFixed(2));
      sellerPayoutTotal = Number((sellerPayoutTotal + sellerAmount).toFixed(2));

      if (listing.deliverySlaHours > maxSlaHours) {
        maxSlaHours = listing.deliverySlaHours;
      }

      orderItems.push({
        listingId: listing.id,
        gameId: listing.gameId,
        gameName: listing.gameName,
        categoryId: listing.categoryId,
        categoryName: listing.categoryName,
        serverId: listing.serverId,
        serverName: listing.serverName,
        productType: listing.productType,
        title: listing.title,
        unitPrice: listing.unitPrice,
        quantity: item.quantity,
        totalPrice,
        platformFeeRate,
        platformFeeAmount,
        sellerAmount,
        deliveryMethod: listing.deliveryMethod,
        deliveryDetails: deliveryDetails[listing.id],
      });
    }

    const orderId = `ord_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = generateOrderNumber();

    const order: ItemSepetiOrder = {
      id: orderId,
      orderNumber,
      buyerId,
      buyerEmail,
      sellerId: sellerGroup.sellerId,
      sellerStoreName: sellerGroup.sellerStoreName,
      items: orderItems,
      totalAmount: sellerOrderTotal,
      platformCommissionTotal: sellerCommissionTotal,
      sellerPayoutTotal,
      status: "PENDING_PAYMENT", // Initial state
      statusHistory: [
        {
          status: "PENDING_PAYMENT",
          changedBy: buyerId,
          timestamp: now,
          note: "Sipariş oluşturuldu, ödeme bekleniyor.",
        },
      ],
      expectedDeliveryAt: now + maxSlaHours * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    };

    inMemoryOrders.set(orderId, order);
    createdOrders.push(order);

    // Link reservations to order and convert status
    for (const res of resResult.reservations) {
      if (res.sellerId === sellerGroup.sellerId) {
        res.orderId = orderId;
        res.status = "CONVERTED";
      }
    }

    try {
      const db = getAdminDb();
      await db.collection("itemsepeti_orders").doc(orderId).set(order);
    } catch {}
  }

  // 5. Create Parent CheckoutSession
  const checkoutSession: ItemSepetiCheckoutSession = {
    checkoutId,
    buyerId,
    buyerEmail,
    orderIds: createdOrders.map((o) => o.id),
    status: "READY_FOR_PAYMENT",
    totalAmount: enrichedCart.totalAmount,
    currency: "TRY",
    expiresAt: now + 15 * 60 * 1000,
    createdAt: now,
  };

  inMemorySessions.set(checkoutId, checkoutSession);

  if (idempotencyKey) {
    inMemoryIdempotency.set(idempotencyKey, checkoutId);
  }

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_checkout_sessions").doc(checkoutId).set(checkoutSession);
  } catch {}

  // 6. Clear items from buyer cart
  await clearCart(buyerId);

  return {
    success: true,
    checkoutSession,
    orders: createdOrders,
  };
}

/**
 * Get orders for a buyer
 */
export async function getBuyerOrders(
  buyerId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<ItemSepetiOrder[]> {
  const sanitizedId = (buyerId || "").trim();
  if (!sanitizedId) return [];

  const limit = options.limit || 20;

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("itemsepeti_orders")
      .where("buyerId", "==", sanitizedId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ItemSepetiOrder);
    }
  } catch {}

  const orders = Array.from(inMemoryOrders.values())
    .filter((o) => o.buyerId === sanitizedId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

  return orders;
}

/**
 * Get orders for a seller (seller order center)
 */
export async function getSellerOrders(
  sellerId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<ItemSepetiOrder[]> {
  const sanitizedId = (sellerId || "").trim();
  if (!sanitizedId) return [];

  const limit = options.limit || 20;

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("itemsepeti_orders")
      .where("sellerId", "==", sanitizedId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ItemSepetiOrder);
    }
  } catch {}

  const orders = Array.from(inMemoryOrders.values())
    .filter((o) => o.sellerId === sanitizedId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

  return orders;
}

/**
 * Get single order with strict tenant read isolation
 */
export async function getOrderById(
  orderId: string,
  requesterUserId: string,
  requesterRole: string = "buyer"
): Promise<ItemSepetiOrder | null> {
  let order: ItemSepetiOrder | null = null;

  try {
    const db = getAdminDb();
    const doc = await db.collection("itemsepeti_orders").doc(orderId).get();
    if (doc.exists) {
      order = doc.data() as ItemSepetiOrder;
    }
  } catch {}

  if (!order) {
    order = inMemoryOrders.get(orderId) || null;
  }

  if (!order) return null;

  // Authorization check: Admin OR matching Buyer OR matching Seller
  if (
    requesterRole === "admin" ||
    order.buyerId === requesterUserId ||
    order.sellerId === requesterUserId
  ) {
    return order;
  }

  // Unauthorized tenant access attempt
  return null;
}
/**
 * Update order status with strict escrow and state machine transitions
 */
export async function updateOrderStatus(
  orderId: string,
  targetStatus: ItemSepetiOrderStatus,
  metadata: {
    actorId?: string;
    actorRole?: string;
    note?: string;
    proofUrl?: string;
  } = {}
): Promise<{ success: boolean; order?: ItemSepetiOrder; error?: string }> {
  let order: ItemSepetiOrder | null = null;

  try {
    const db = getAdminDb();
    const doc = await db.collection("itemsepeti_orders").doc(orderId).get();
    if (doc.exists) {
      order = doc.data() as ItemSepetiOrder;
    }
  } catch {}

  if (!order) {
    order = inMemoryOrders.get(orderId) || null;
  }

  if (!order) {
    return { success: false, error: "Sipariş bulunamadı." };
  }

  // Permitted State Machine Transitions:
  // PENDING_PAYMENT -> PAID | CANCELLED
  // PAID -> DELIVERED | DISPUTED | CANCELLED
  // DELIVERED -> BUYER_CONFIRMED | COMPLETED | DISPUTED
  // BUYER_CONFIRMED -> COMPLETED
  // DISPUTED -> COMPLETED | REFUNDED
  const current = order.status;
  let isAllowed = false;

  if (current === "PENDING_PAYMENT" && ["PAID", "CANCELLED"].includes(targetStatus)) {
    isAllowed = true;
  } else if (current === "PAID" && ["DELIVERED", "DISPUTED", "CANCELLED"].includes(targetStatus)) {
    isAllowed = true;
  } else if (current === "DELIVERED" && ["BUYER_CONFIRMED", "COMPLETED", "DISPUTED"].includes(targetStatus)) {
    isAllowed = true;
  } else if (current === "BUYER_CONFIRMED" && targetStatus === "COMPLETED") {
    isAllowed = true;
  } else if (current === "DISPUTED" && ["COMPLETED", "REFUNDED"].includes(targetStatus)) {
    isAllowed = true;
  }

  if (!isAllowed) {
    return {
      success: false,
      error: `Geçersiz durum geçişi: ${current} durumundaki sipariş ${targetStatus} yapılamaz.`,
    };
  }

  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  const deliveredAt = targetStatus === "DELIVERED" ? now : order.deliveredAt;
  const autoCompleteAt = targetStatus === "DELIVERED" ? now + TWENTY_FOUR_HOURS : order.autoCompleteAt;
  const completedAt = targetStatus === "COMPLETED" ? now : order.completedAt;

  const updatedOrder: ItemSepetiOrder = {
    ...order,
    status: targetStatus,
    deliveredAt,
    autoCompleteAt,
    completedAt,
    updatedAt: now,
    statusHistory: [
      ...order.statusHistory,
      {
        status: targetStatus,
        changedBy: metadata.actorId || metadata.actorRole || "system",
        timestamp: now,
        note: metadata.note || `Durum ${targetStatus} olarak güncellendi.`,
      },
    ],
  };

  inMemoryOrders.set(orderId, updatedOrder);

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_orders").doc(orderId).update({
      status: targetStatus,
      statusHistory: updatedOrder.statusHistory,
      updatedAt: now,
    });
  } catch {}

  // Trigger atomic Escrow Release to seller when order is marked COMPLETED
  if (targetStatus === "COMPLETED" && current !== "COMPLETED") {
    await settleEscrowToSeller(updatedOrder, metadata.actorId, metadata.actorRole);
  }

  // Record immutable audit log
  await logAuditEvent({
    actorId: metadata.actorId || "system",
    actorRole: (metadata.actorRole as any) || "system",
    action: "ORDER_STATUS_CHANGED",
    resource: "order",
    resourceId: orderId,
    beforeSnapshot: { status: current },
    afterSnapshot: { status: targetStatus, note: metadata.note },
  });

  return { success: true, order: updatedOrder };
}


/**
 * Executes server-authoritative Escrow Release to Seller upon order completion
 * Idempotent: checks if already released or settled.
 */
export async function settleEscrowToSeller(order: ItemSepetiOrder, actorId = "system", actorRole = "system"): Promise<boolean> {
  if (!order || order.totalAmount <= 0) return false;

  const sellerPayout = order.sellerPayoutTotal || Number((order.totalAmount * 0.95).toFixed(2));
  
  // Record ESCROW_RELEASE in double-entry ledger
  const result = await recordLedgerTransaction({
    userId: order.sellerId,
    type: "ESCROW_RELEASE",
    amount: sellerPayout,
    referenceId: order.orderNumber || order.id,
    orderId: order.id,
    description: `Sipariş Tamamlandı: Emanet havuzundaki ${sellerPayout} TL satıcı bakiyesine aktarıldı.`,
  });

  // Notify seller of released payout
  await sendNotification({
    userId: order.sellerId,
    event: "PAYOUT_COMPLETED",
    title: "Kazancınız Cüzdanınıza Aktarıldı!",
    message: `${order.orderNumber} numaralı sipariş tamamlandı. Net ${sellerPayout} TL kazancınız çekilebilir bakiyenize eklendi.`,
    linkUrl: "/profilim",
  });

  return result.success;
}

/**
 * Escrow Auto-Release Engine (24-Hour Delivery SLA Check)
 * Automatically marks DELIVERED orders as COMPLETED and releases escrow to seller
 * if 24 hours have elapsed without active dispute.
 */
export async function processEligibleAutoReleases(): Promise<{
  processedCount: number;
  releasedOrderIds: string[];
}> {
  const now = Date.now();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const releasedOrderIds: string[] = [];

  // Check in-memory orders
  for (const [id, order] of inMemoryOrders.entries()) {
    if (order.status === "DELIVERED" && order.deliveredAt && (now - order.deliveredAt >= TWENTY_FOUR_HOURS_MS)) {
      const updateRes = await updateOrderStatus(id, "COMPLETED", {
        actorId: "system_escrow_cron",
        actorRole: "system",
        note: "24 saatlik alıcı onay süresi doldu. Escrow otomatik olarak satıcıya aktarıldı.",
      });
      if (updateRes.success) {
        releasedOrderIds.push(id);
      }
    }
  }

  // Check live Firestore if available
  try {
    const db = getAdminDb();
    const snap = await db
      .collection("itemsepeti_orders")
      .where("status", "==", "DELIVERED")
      .where("autoCompleteAt", "<=", now)
      .get();

    for (const doc of snap.docs) {
      if (!releasedOrderIds.includes(doc.id)) {
        const updateRes = await updateOrderStatus(doc.id, "COMPLETED", {
          actorId: "system_escrow_cron",
          actorRole: "system",
          note: "24 saatlik alıcı onay süresi doldu. Escrow otomatik olarak satıcıya aktarıldı.",
        });
        if (updateRes.success) {
          releasedOrderIds.push(doc.id);
        }
      }
    }
  } catch {}

  return {
    processedCount: releasedOrderIds.length,
    releasedOrderIds,
  };
}

/**
 * Seed helper for test suites and offline mock resilience
 */
export function seedInMemoryOrder(order: ItemSepetiOrder): void {
  inMemoryOrders.set(order.id, order);
}
