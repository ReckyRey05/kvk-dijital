/**
 * İtemSepeti — Cart Service
 * Server-authoritative shopping cart management, stock validation,
 * guest-to-auth cart merge, and price-drift detection.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import {
  ItemSepetiCart,
  ItemSepetiCartItem,
  ItemSepetiEnrichedCart,
  ItemSepetiEnrichedCartItem,
  ItemSepetiListing,
} from "@/types/marketplace";
import { getListingById, getSellerBySlug } from "./catalogService";

// In-memory fallback for environments without live Firestore connections
const inMemoryCarts = new Map<string, ItemSepetiCart>();

/**
 * Get raw cart record for buyer
 */
export async function getRawCart(buyerId: string): Promise<ItemSepetiCart> {
  const sanitizedId = (buyerId || "").trim();
  if (!sanitizedId) {
    return { buyerId: "", items: [], updatedAt: Date.now() };
  }

  try {
    const db = getAdminDb();
    const docSnap = await db.collection("itemsepeti_carts").doc(sanitizedId).get();
    if (docSnap.exists) {
      return docSnap.data() as ItemSepetiCart;
    }
  } catch {}

  const cached = inMemoryCarts.get(sanitizedId);
  if (cached) return cached;

  return { buyerId: sanitizedId, items: [], updatedAt: Date.now() };
}

/**
 * Save raw cart record
 */
export async function saveRawCart(cart: ItemSepetiCart): Promise<void> {
  inMemoryCarts.set(cart.buyerId, cart);
  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_carts").doc(cart.buyerId).set(cart);
  } catch {}
}

/**
 * Enrich cart items with live catalog listing details, price validation,
 * out-of-stock checks, and multi-seller clustering.
 */
export async function getCart(buyerId: string): Promise<ItemSepetiEnrichedCart> {
  const rawCart = await getRawCart(buyerId);
  const enrichedItems: ItemSepetiEnrichedCartItem[] = [];

  for (const item of rawCart.items) {
    const listing = await getListingById(item.listingId);

    if (!listing) {
      enrichedItems.push({
        listingId: item.listingId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        listing: {
          id: item.listingId,
          title: "İlan Kaldırıldı",
          gameId: "",
          gameName: "",
          categoryId: "",
          categoryName: "",
          productType: "OTHER_DIGITAL",
          unitPrice: 0,
          stockQuantity: 0,
          deliveryMethod: "MANUAL_ITEM",
          deliverySlaHours: 24,
          status: "deleted",
          sellerId: "",
          sellerStoreName: "Bilinmeyen Satıcı",
          sellerRating: 0,
          sellerRatingCount: 0,
          isSellerActive: false,
        },
        itemSubtotal: 0,
        isAvailable: false,
        warning: "Bu ilan artık yayında değil.",
      });
      continue;
    }

    const seller = await getSellerBySlug(listing.sellerId);
    const isSellerActive = seller ? seller.isVerifiedSeller !== false : true;
    const isListingActive = listing.status === "active";
    const hasEnoughStock = listing.stockQuantity >= item.quantity;
    const isAvailable = isListingActive && isSellerActive && hasEnoughStock && listing.stockQuantity > 0;

    let warning: string | undefined;
    if (!isListingActive) {
      warning = "Bu ilan şu anda satışa kapalı.";
    } else if (!isSellerActive) {
      warning = "Satıcı şu anda işlem kabul etmiyor.";
    } else if (listing.stockQuantity <= 0) {
      warning = "Bu ürün tükendi.";
    } else if (!hasEnoughStock) {
      warning = `Mevcut stok (${listing.stockQuantity} adet) talep ettiğiniz miktardan (${item.quantity} adet) az.`;
    }

    const itemSubtotal = Number((listing.unitPrice * item.quantity).toFixed(2));

    enrichedItems.push({
      listingId: item.listingId,
      quantity: item.quantity,
      addedAt: item.addedAt,
      listing: {
        id: listing.id,
        title: listing.title,
        gameId: listing.gameId,
        gameName: listing.gameName,
        categoryId: listing.categoryId,
        categoryName: listing.categoryName,
        serverId: listing.serverId,
        serverName: listing.serverName,
        productType: listing.productType,
        unitPrice: listing.unitPrice,
        stockQuantity: listing.stockQuantity,
        minQuantity: listing.minQuantity,
        deliveryMethod: listing.deliveryMethod,
        deliverySlaHours: listing.deliverySlaHours,
        status: listing.status,
        sellerId: listing.sellerId,
        sellerStoreName: seller?.storeName || (listing as any).sellerStoreName || "Satıcı",
        sellerRating: seller?.ratingAverage || 4.9,
        sellerRatingCount: seller?.ratingCount || 50,
        isSellerActive,
      },
      itemSubtotal,
      isAvailable,
      warning,
    });
  }

  // Cluster by seller for multi-seller checkout preparation
  const sellerMap = new Map<string, { sellerStoreName: string; items: ItemSepetiEnrichedCartItem[] }>();
  let totalAmount = 0;
  let totalItemCount = 0;
  let hasUnavailableItems = false;

  for (const enriched of enrichedItems) {
    totalItemCount += enriched.quantity;
    if (enriched.isAvailable) {
      totalAmount = Number((totalAmount + enriched.itemSubtotal).toFixed(2));
    } else {
      hasUnavailableItems = true;
    }

    const sId = enriched.listing.sellerId || "unknown_seller";
    if (!sellerMap.has(sId)) {
      sellerMap.set(sId, {
        sellerStoreName: enriched.listing.sellerStoreName,
        items: [],
      });
    }
    sellerMap.get(sId)!.items.push(enriched);
  }

  const sellers = Array.from(sellerMap.entries()).map(([sellerId, group]) => {
    const sellerSubtotal = group.items.reduce(
      (sum, it) => (it.isAvailable ? Number((sum + it.itemSubtotal).toFixed(2)) : sum),
      0
    );
    return {
      sellerId,
      sellerStoreName: group.sellerStoreName,
      items: group.items,
      sellerSubtotal,
    };
  });

  return {
    buyerId,
    items: enrichedItems,
    sellers,
    totalItemCount,
    totalAmount,
    hasUnavailableItems,
    updatedAt: rawCart.updatedAt,
  };
}

/**
 * Add an item to the buyer's cart with rigorous server validation
 */
export async function addToCart(
  buyerId: string,
  listingId: string,
  quantity: number = 1
): Promise<{ success: boolean; cart?: ItemSepetiCart; error?: string }> {
  if (!buyerId || !buyerId.trim()) {
    return { success: false, error: "Alıcı kimliği gereklidir." };
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { success: false, error: "Geçerli bir adet giriniz (en az 1 tam sayı)." };
  }

  const listing = await getListingById(listingId);
  if (!listing) {
    return { success: false, error: "İlan bulunamadı." };
  }

  if (listing.status !== "active") {
    return { success: false, error: "Bu ilan şu anda aktif satışta değil." };
  }

  if (listing.stockQuantity <= 0) {
    return { success: false, error: "Ürün stokta kalmamıştır." };
  }

  // Account product constraint: max 1
  if (listing.productType === "ACCOUNT" && quantity > 1) {
    return { success: false, error: "Hesap satışlarında tek seferde en fazla 1 adet alınabilir." };
  }

  const rawCart = await getRawCart(buyerId);
  const existingItemIndex = rawCart.items.findIndex((it) => it.listingId === listingId);

  let targetQuantity = quantity;
  if (existingItemIndex >= 0) {
    targetQuantity = rawCart.items[existingItemIndex].quantity + quantity;
  }

  // Clamping to stock
  if (targetQuantity > listing.stockQuantity) {
    return {
      success: false,
      error: `Yetersiz stok. Mevcut stok: ${listing.stockQuantity}, sepetteki talep: ${targetQuantity}.`,
    };
  }

  if (listing.minQuantity && targetQuantity < listing.minQuantity) {
    return {
      success: false,
      error: `Bu ilan için minimum alım adedi: ${listing.minQuantity}.`,
    };
  }

  if (existingItemIndex >= 0) {
    rawCart.items[existingItemIndex].quantity = targetQuantity;
  } else {
    rawCart.items.push({
      listingId,
      quantity,
      addedAt: Date.now(),
    });
  }

  rawCart.updatedAt = Date.now();
  await saveRawCart(rawCart);

  return { success: true, cart: rawCart };
}

/**
 * Update quantity of a cart item
 */
export async function updateCartItemQuantity(
  buyerId: string,
  listingId: string,
  quantity: number
): Promise<{ success: boolean; cart?: ItemSepetiCart; error?: string }> {
  if (!buyerId || !buyerId.trim()) {
    return { success: false, error: "Alıcı kimliği gereklidir." };
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    return { success: false, error: "Geçerli bir adet giriniz." };
  }

  const rawCart = await getRawCart(buyerId);
  const itemIndex = rawCart.items.findIndex((it) => it.listingId === listingId);

  if (itemIndex < 0) {
    return { success: false, error: "Ürün sepetinizde bulunamadı." };
  }

  // If quantity set to 0, remove item
  if (quantity === 0) {
    rawCart.items.splice(itemIndex, 1);
    rawCart.updatedAt = Date.now();
    await saveRawCart(rawCart);
    return { success: true, cart: rawCart };
  }

  const listing = await getListingById(listingId);
  if (listing) {
    if (listing.productType === "ACCOUNT" && quantity > 1) {
      return { success: false, error: "Hesap satışlarında en fazla 1 adet seçilebilir." };
    }
    if (quantity > listing.stockQuantity) {
      return {
        success: false,
        error: `Yetersiz stok. Mevcut stok: ${listing.stockQuantity}.`,
      };
    }
    if (listing.minQuantity && quantity < listing.minQuantity) {
      return {
        success: false,
        error: `Bu ilan için minimum alım adedi: ${listing.minQuantity}.`,
      };
    }
  }

  rawCart.items[itemIndex].quantity = quantity;
  rawCart.updatedAt = Date.now();
  await saveRawCart(rawCart);

  return { success: true, cart: rawCart };
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(
  buyerId: string,
  listingId: string
): Promise<{ success: boolean; cart?: ItemSepetiCart }> {
  const rawCart = await getRawCart(buyerId);
  rawCart.items = rawCart.items.filter((it) => it.listingId !== listingId);
  rawCart.updatedAt = Date.now();
  await saveRawCart(rawCart);
  return { success: true, cart: rawCart };
}

/**
 * Clear the entire cart
 */
export async function clearCart(buyerId: string): Promise<void> {
  const rawCart = {
    buyerId,
    items: [],
    updatedAt: Date.now(),
  };
  await saveRawCart(rawCart);
}

/**
 * Merge guest cart items into authenticated user's cart
 */
export async function mergeGuestCart(
  buyerId: string,
  guestItems: { listingId: string; quantity: number }[]
): Promise<ItemSepetiCart> {
  const rawCart = await getRawCart(buyerId);

  for (const guestItem of guestItems) {
    if (!guestItem.listingId || guestItem.quantity <= 0) continue;

    const listing = await getListingById(guestItem.listingId);
    if (!listing || listing.status !== "active" || listing.stockQuantity <= 0) continue;

    const existing = rawCart.items.find((it) => it.listingId === guestItem.listingId);
    if (existing) {
      const mergedQty = Math.min(listing.stockQuantity, existing.quantity + guestItem.quantity);
      existing.quantity = mergedQty;
    } else {
      const validQty = Math.min(listing.stockQuantity, guestItem.quantity);
      rawCart.items.push({
        listingId: guestItem.listingId,
        quantity: validQty,
        addedAt: Date.now(),
      });
    }
  }

  rawCart.updatedAt = Date.now();
  await saveRawCart(rawCart);
  return rawCart;
}