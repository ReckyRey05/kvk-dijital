/**
 * İtemSepeti — Catalog & Listing Service
 * Server-authoritative data layer for games, categories, products,
 * seller listing CRUD, inventory transactions, and moderation.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import {
  ItemSepetiGame,
  ItemSepetiCategory,
  ItemSepetiProduct,
  ItemSepetiListing,
  ItemSepetiListingStatus,
  ItemSepetiAuditLog,
  ItemSepetiPurchaseIntent,
} from "@/types/marketplace";
import {
  SEED_GAMES,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_LISTINGS,
  SEED_SELLERS,
  SeedSeller,
} from "./catalogSeedData";
import {
  validateListingInput,
  generateListingFingerprint,
  normalizeTitle,
  canTransitionListingStatus,
  ListingValidationInput,
} from "./catalogUtils";

// =============================================================================
// 1. GAME CATALOG QUERIES
// =============================================================================

export async function getGames(): Promise<ItemSepetiGame[]> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("itemsepeti_games").where("isActive", "==", true).get();
    if (!snap.empty) {
      return snap.docs.map((doc) => doc.data() as ItemSepetiGame);
    }
  } catch {
    // Fallback to in-memory seed if Firestore not configured
  }
  return SEED_GAMES.filter((g) => g.isActive);
}

export async function getGameBySlug(slug: string): Promise<ItemSepetiGame | null> {
  const normSlug = (slug || "").trim().toLowerCase();
  try {
    const db = getAdminDb();
    const snap = await db.collection("itemsepeti_games").where("slug", "==", normSlug).limit(1).get();
    if (!snap.empty) {
      return snap.docs[0].data() as ItemSepetiGame;
    }
  } catch {}
  return SEED_GAMES.find((g) => g.slug === normSlug) || null;
}

// =============================================================================
// 2. CATEGORY & PRODUCT QUERIES
// =============================================================================

export async function getCategoriesByGame(gameId: string): Promise<ItemSepetiCategory[]> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("itemsepeti_categories").where("gameId", "==", gameId).where("isActive", "==", true).get();
    if (!snap.empty) {
      return snap.docs.map((doc) => doc.data() as ItemSepetiCategory);
    }
  } catch {}
  return SEED_CATEGORIES.filter((c) => c.gameId === gameId && c.isActive);
}

export async function getCategoryById(categoryId: string): Promise<ItemSepetiCategory | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection("itemsepeti_categories").doc(categoryId).get();
    if (doc.exists) {
      return doc.data() as ItemSepetiCategory;
    }
  } catch {}
  return SEED_CATEGORIES.find((c) => c.id === categoryId) || null;
}

export async function getProductsByCategory(categoryId: string): Promise<ItemSepetiProduct[]> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("itemsepeti_products").where("categoryId", "==", categoryId).where("isActive", "==", true).get();
    if (!snap.empty) {
      return snap.docs.map((doc) => doc.data() as ItemSepetiProduct);
    }
  } catch {}
  return SEED_PRODUCTS.filter((p) => p.categoryId === categoryId && p.isActive);
}

// =============================================================================
// 3. LISTING CRUD & VALIDATION
// =============================================================================

export async function createListing(input: ListingValidationInput): Promise<{
  success: boolean;
  listing?: ItemSepetiListing;
  error?: string;
  errors?: string[];
}> {
    // 1.0 Seller Approval Gate: Pending or rejected sellers strictly prohibited from creating listings
  if (input.sellerId) {
    const seller = await getSellerBySlug(input.sellerId);
    if (seller && seller.isVerifiedSeller === false) {
      return {
        success: false,
        error: "Satıcı profiliniz henüz yönetici tarafından onaylanmamıştır (pending). İlan oluşturmak için onay bekleyiniz.",
      };
    }
  }

  // 1. Fetch game and category for relationship validation
  const game = SEED_GAMES.find((g) => g.id === input.gameId) || null;
  const category = SEED_CATEGORIES.find((c) => c.id === input.categoryId) || null;

  // 2. Pure validation
  const valResult = validateListingInput(input, game, category);
  if (!valResult.isValid) {
    return { success: false, errors: valResult.errors, error: valResult.errors[0] };
  }

  // 3. Duplicate check via normalized identity
  const normalizedTitle = normalizeTitle(input.title);
  const fingerprint = generateListingFingerprint({
    sellerId: input.sellerId,
    gameId: input.gameId,
    categoryId: input.categoryId,
    serverId: input.serverId,
    normalizedTitle,
  });

  const db = getAdminDb();
  try {
    const existing = await db
      .collection("itemsepeti_listings")
      .where("duplicateFingerprint", "==", fingerprint)
      .where("status", "in", ["active", "pending_review", "paused"])
      .limit(1)
      .get();

    if (!existing.empty) {
      return {
        success: false,
        error: "Aynı ürün ve sunucu için aktif bir ilanınız zaten bulunmaktadır. Lütfen mevcut ilanınızı güncelleyin.",
      };
    }
  } catch {}

  const listingId = `lst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const newListing: ItemSepetiListing = {
    id: listingId,
    sellerId: input.sellerId,
    gameId: input.gameId,
    gameName: game?.name || "Bilinmeyen Oyun",
    categoryId: input.categoryId,
    categoryName: category?.name || "Genel",
    serverId: input.serverId,
    productType: input.productType,
    title: input.title.trim(),
    normalizedTitle,
    description: input.description.trim(),
    unitPrice: input.unitPrice,
    stockQuantity: input.stockQuantity,
    minQuantity: input.minQuantity || 1,
    deliveryMethod: input.deliveryMethod,
    deliverySlaHours: input.deliverySlaHours,
    images: [],
    status: "pending_review", // Every listing requires admin approval before becoming active
    duplicateFingerprint: fingerprint,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.collection("itemsepeti_listings").doc(listingId).set(newListing);
  } catch {
    // If running in local dev without live Firestore creds, return created object
  }

  return { success: true, listing: newListing };
}

export async function updateListingStatus(
  listingId: string,
  sellerId: string,
  targetStatus: ItemSepetiListingStatus,
  isAdmin = false
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminDb();
  try {
    const docRef = db.collection("itemsepeti_listings").doc(listingId);
    const snap = await docRef.get();
    if (!snap.exists) return { success: false, error: "İlan bulunamadı." };

    const listing = snap.data() as ItemSepetiListing;

    // Authorization: seller can only mutate their own listing unless admin
    if (!isAdmin && listing.sellerId !== sellerId) {
      return { success: false, error: "Yetkisiz işlem: Bu ilan size ait değil." };
    }

    // State machine validation
    if (!canTransitionListingStatus(listing.status, targetStatus)) {
      return {
        success: false,
        error: `${listing.status} durumundaki bir ilan ${targetStatus} durumuna geçirilemez.`,
      };
    }

    await docRef.update({
      status: targetStatus,
      updatedAt: Date.now(),
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "İlan durumu güncellenemedi." };
  }
}

// =============================================================================
// 4. LISTINGS SEARCH & FILTERS
// =============================================================================

export interface ListingFilterParams {
  gameId?: string;
  gameSlug?: string;
  categoryId?: string;
  productType?: string;
  serverId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  searchQuery?: string;
  sortBy?: "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "POPULAR";
  limit?: number;
}

export async function getPublicListings(params: ListingFilterParams): Promise<ItemSepetiListing[]> {
  try {
    const db = getAdminDb();
    let query = db.collection("itemsepeti_listings").where("status", "==", "active");

    if (params.gameId) query = query.where("gameId", "==", params.gameId);
    if (params.categoryId) query = query.where("categoryId", "==", params.categoryId);
    if (params.serverId) query = query.where("serverId", "==", params.serverId);

    const snap = await query.limit(params.limit || 50).get();
    if (!snap.empty) {
      let results = snap.docs.map((d) => d.data() as ItemSepetiListing);

      if (params.searchQuery) {
        const q = normalizeTitle(params.searchQuery);
        results = results.filter((l) => l.normalizedTitle.includes(q));
      }

      if (params.minPrice) results = results.filter((l) => l.unitPrice >= params.minPrice!);
      if (params.maxPrice) results = results.filter((l) => l.unitPrice <= params.maxPrice!);
      if (params.inStockOnly) results = results.filter((l) => l.stockQuantity > 0);

      if (params.sortBy === "PRICE_ASC") results.sort((a, b) => a.unitPrice - b.unitPrice);
      else if (params.sortBy === "PRICE_DESC") results.sort((a, b) => b.unitPrice - a.unitPrice);
      else results.sort((a, b) => b.createdAt - a.createdAt);

      return results;
    }
  } catch {}

  // Fallback to high-quality deterministic seed listings
  let results: ItemSepetiListing[] = (SEED_LISTINGS as ItemSepetiListing[]).filter((l) => l.status === "active");

  if (params.gameId) {
    results = results.filter((l) => l.gameId === params.gameId);
  }
  if (params.gameSlug) {
    const slugStr = params.gameSlug.toLowerCase();
    const matchedGame = SEED_GAMES.find((g) => g.slug === slugStr);
    if (matchedGame) {
      results = results.filter((l) => l.gameId === matchedGame.id);
    }
  }
  if (params.categoryId) {
    results = results.filter((l) => l.categoryId === params.categoryId);
  }
  if (params.productType) {
    results = results.filter((l) => l.productType === params.productType);
  }
  if (params.serverId) {
    results = results.filter((l) => l.serverId === params.serverId);
  }
  if (params.searchQuery) {
    const rawTokens = normalizeTitle(params.searchQuery).split(" ").filter(Boolean);
    results = results.filter((l) => {
      const searchTarget = `${normalizeTitle(l.normalizedTitle)} ${normalizeTitle(l.gameName)} ${normalizeTitle(l.categoryName)}`;
      return rawTokens.every((token) => searchTarget.includes(token));
    });
  }
  if (params.minPrice !== undefined) {
    results = results.filter((l) => l.unitPrice >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    results = results.filter((l) => l.unitPrice <= params.maxPrice!);
  }
  if (params.inStockOnly) {
    results = results.filter((l) => l.stockQuantity > 0);
  }

  if (params.sortBy === "PRICE_ASC") {
    results.sort((a, b) => a.unitPrice - b.unitPrice);
  } else if (params.sortBy === "PRICE_DESC") {
    results.sort((a, b) => b.unitPrice - a.unitPrice);
  } else {
    results.sort((a, b) => b.createdAt - a.createdAt);
  }

  if (params.limit) {
    results = results.slice(0, params.limit);
  }

  return results;
}

// =============================================================================
// 5. LISTING DETAIL & SINGLE QUERY
// =============================================================================

export async function getListingById(idOrSlug: string): Promise<ItemSepetiListing | null> {
  const norm = (idOrSlug || "").trim().toLowerCase();
  try {
    const db = getAdminDb();
    // Try by document ID first
    const doc = await db.collection("itemsepeti_listings").doc(idOrSlug).get();
    if (doc.exists) {
      const data = doc.data() as ItemSepetiListing;
      if (data.status === "active") return data;
    }
  } catch {}

  // Fallback to seed listings
  const found = (SEED_LISTINGS as ItemSepetiListing[]).find(
    (l) => l.id.toLowerCase() === norm && l.status === "active"
  );
  return found || null;
}

// =============================================================================
// 6. SELLER PROFILE & SELLER LISTINGS
// =============================================================================

export async function getSellerBySlug(slug: string): Promise<SeedSeller | null> {
  const norm = (slug || "").trim().toLowerCase();
  const seller = SEED_SELLERS.find(
    (s) => s.storeSlug.toLowerCase() === norm || s.id.toLowerCase() === norm || s.storeName.toLowerCase() === norm
  );
  return seller || null;
}

export async function getSellerListings(sellerIdOrName: string): Promise<ItemSepetiListing[]> {
  const norm = (sellerIdOrName || "").trim().toLowerCase();
  try {
    const db = getAdminDb();
    const snap = await db
      .collection("itemsepeti_listings")
      .where("status", "==", "active")
      .get();
    if (!snap.empty) {
      return (snap.docs.map((d) => d.data() as ItemSepetiListing)).filter(
        (l) => l.sellerId.toLowerCase() === norm
      );
    }
  } catch {}

  return (SEED_LISTINGS as ItemSepetiListing[]).filter(
    (l) => (l.sellerId.toLowerCase() === norm || (l as any).sellerName?.toLowerCase() === norm) && l.status === "active"
  );
}

// =============================================================================
// 7. PURCHASE INTENT (Pre-checkout validation abstraction)
// =============================================================================

export async function createPurchaseIntent(input: {
  buyerId: string;
  listingId: string;
  quantity: number;
}): Promise<{
  success: boolean;
  intent?: ItemSepetiPurchaseIntent;
  error?: string;
}> {
  if (!input.buyerId || !input.buyerId.trim()) {
    return { success: false, error: "Satın alma niyeti oluşturmak için giriş yapmalısınız." };
  }

  if (!input.quantity || input.quantity < 1 || !Number.isInteger(input.quantity)) {
    return { success: false, error: "Geçerli bir adet giriniz (en az 1)." };
  }

  const listing = await getListingById(input.listingId);
  if (!listing) {
    return { success: false, error: "İlan bulunamadı veya artık aktif değil." };
  }

  if (listing.status !== "active") {
    return { success: false, error: "Bu ilan şu anda satışta değil." };
  }

  if (listing.stockQuantity < input.quantity) {
    return {
      success: false,
      error: `Yetersiz stok. Mevcut stok: ${listing.stockQuantity}, talep edilen: ${input.quantity}.`,
    };
  }

  if (listing.minQuantity && input.quantity < listing.minQuantity) {
    return {
      success: false,
      error: `Bu ilan için minimum alım adedi: ${listing.minQuantity}.`,
    };
  }

  // Calculate pricing & platform fee
  const category = await getCategoryById(listing.categoryId);
  const feeRate = category?.platformFeeRate || 0.05;
  const totalAmount = Number((listing.unitPrice * input.quantity).toFixed(2));
  const platformCommissionAmount = Number((totalAmount * feeRate).toFixed(2));
  const sellerPayoutAmount = Number((totalAmount - platformCommissionAmount).toFixed(2));

  const intentId = `intent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const intent: ItemSepetiPurchaseIntent = {
    intentId,
    buyerId: input.buyerId,
    listingId: listing.id,
    sellerId: listing.sellerId,
    quantity: input.quantity,
    unitPrice: listing.unitPrice,
    totalAmount,
    platformCommissionRate: feeRate,
    platformCommissionAmount,
    sellerPayoutAmount,
    listingSnapshot: {
      title: listing.title,
      gameId: listing.gameId,
      gameName: listing.gameName,
      categoryId: listing.categoryId,
      categoryName: listing.categoryName,
      serverId: listing.serverId,
      serverName: listing.serverName,
      productType: listing.productType,
      deliveryMethod: listing.deliveryMethod,
      deliverySlaHours: listing.deliverySlaHours,
    },
    expiresAt: now + 15 * 60 * 1000, // Valid for 15 minutes
    createdAt: now,
  };

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_purchase_intents").doc(intentId).set(intent);
  } catch {}

  return { success: true, intent };
}


