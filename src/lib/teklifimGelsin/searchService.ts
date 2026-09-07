import { getAdminDb } from "@/lib/firebase/admin";
import {
  TeklifimProduct,
  TeklifimSupplierProfile,
  TeklifimProfile,
  TeklifimSearchFilters,
  TeklifimUnifiedSearchResult,
  TeklifimAutocompleteSuggestion,
  TeklifimSavedSearch,
  TeklifimSearchHistoryItem,
  TeklifimPersonalizedRecommendations,
  TEKLIFIM_CATEGORIES,
} from "@/types/teklifimGelsin";
import {
  filterAndRankProducts,
  filterAndRankSuppliers,
  extractCategoryMatches,
  generateAutocompleteSuggestions,
  getSimilarProducts,
  getSimilarSuppliers,
  sanitizeSearchQuery,
  normalizeSearchText,
} from "./searchUtils";

function getDb() {
  return getAdminDb();
}

/**
 * Executes a unified search across products, suppliers, and categories.
 */
export async function performUnifiedSearch(
  filters: TeklifimSearchFilters
): Promise<TeklifimUnifiedSearchResult> {
  const db = getDb();
  const type = filters.type || "all";
  const query = sanitizeSearchQuery(filters.query || "");

  // 1. Fetch products if type is "all" or "products"
  let products: TeklifimProduct[] = [];
  if (type === "all" || type === "products") {
    let productRef: FirebaseFirestore.Query = db.collection("teklifim_products");
    if (filters.category) {
      productRef = productRef.where("category", "==", filters.category);
    }
    const snap = await productRef.limit(250).get();
    products = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TeklifimProduct, "id">),
    }));
  }

  // 2. Fetch suppliers if type is "all" or "suppliers"
  let suppliers: TeklifimSupplierProfile[] = [];
  if (type === "all" || type === "suppliers") {
    let supplierRef: FirebaseFirestore.Query = db
      .collection("teklifim_profiles")
      .where("role", "==", "supplier");

    if (filters.city) {
      supplierRef = supplierRef.where("city", "==", filters.city);
    }
    const snap = await supplierRef.limit(200).get();
    suppliers = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TeklifimProfile, "id">),
    })) as TeklifimSupplierProfile[];
  }

  // 3. Category count aggregation maps
  const productsCountMap: Record<string, number> = {};
  const suppliersCountMap: Record<string, number> = {};

  if (type === "all" || type === "categories") {
    // If not fetched yet, fetch product summaries for category counts
    let allProductsForCounts = products;
    if (type === "categories") {
      const pSnap = await db.collection("teklifim_products").limit(300).get();
      allProductsForCounts = pSnap.docs.map((doc) => doc.data() as TeklifimProduct);
    }
    for (const p of allProductsForCounts) {
      if (p.category) {
        productsCountMap[p.category] = (productsCountMap[p.category] || 0) + 1;
      }
    }

    let allSuppliersForCounts = suppliers;
    if (type === "categories") {
      const sSnap = await db
        .collection("teklifim_profiles")
        .where("role", "==", "supplier")
        .limit(200)
        .get();
      allSuppliersForCounts = sSnap.docs.map((doc) => doc.data() as TeklifimSupplierProfile);
    }
    for (const s of allSuppliersForCounts) {
      for (const cat of s.categories || []) {
        suppliersCountMap[cat] = (suppliersCountMap[cat] || 0) + 1;
      }
    }
  }

  // 4. Rank and filter
  const rankedProducts = filterAndRankProducts(products, filters);
  const rankedSuppliers = filterAndRankSuppliers(suppliers, filters);
  const matchedCategories =
    type === "all" || type === "categories"
      ? extractCategoryMatches(query, productsCountMap, suppliersCountMap)
      : [];

  return {
    query,
    filters,
    products: rankedProducts.items,
    suppliers: rankedSuppliers.items,
    categories: matchedCategories,
    totalProducts: rankedProducts.total,
    totalSuppliers: rankedSuppliers.total,
    totalCategories: matchedCategories.length,
  };
}

/**
 * Autocomplete suggestions endpoint service.
 */
export async function getAutocompleteSuggestions(
  rawQuery: string
): Promise<TeklifimAutocompleteSuggestion[]> {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query || query.length < 2) return [];

  const db = getDb();
  const [prodSnap, suppSnap] = await Promise.all([
    db.collection("teklifim_products").limit(100).get(),
    db.collection("teklifim_profiles").where("role", "==", "supplier").limit(60).get(),
  ]);

  const products = prodSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<TeklifimProduct, "id">),
  }));

  const suppliers = suppSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<TeklifimProfile, "id">),
  })) as TeklifimSupplierProfile[];

  return generateAutocompleteSuggestions(query, products, suppliers);
}

/**
 * Saves a user search.
 */
export async function saveUserSearch(
  userId: string,
  data: {
    title: string;
    query: string;
    filters: TeklifimSearchFilters;
    notifyOnNew?: boolean;
    userRole?: string;
  }
): Promise<TeklifimSavedSearch> {
  const db = getDb();
  const ref = db.collection("teklifim_saved_searches").doc();
  const now = Date.now();

  const savedSearch: TeklifimSavedSearch = {
    id: ref.id,
    userId,
    userRole: data.userRole || "buyer",
    title: data.title || data.query || "Arama Kaydı",
    query: sanitizeSearchQuery(data.query),
    filters: data.filters,
    notifyOnNew: data.notifyOnNew ?? false,
    createdAt: now,
  };

  await ref.set(savedSearch);
  return savedSearch;
}

/**
 * Lists all saved searches for a given user.
 */
export async function getUserSavedSearches(userId: string): Promise<TeklifimSavedSearch[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_saved_searches")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snap.docs.map((doc) => doc.data() as TeklifimSavedSearch);
}

/**
 * Deletes a saved search with user authorization check.
 */
export async function deleteUserSavedSearch(
  userId: string,
  searchId: string
): Promise<boolean> {
  const db = getDb();
  const docRef = db.collection("teklifim_saved_searches").doc(searchId);
  const snap = await docRef.get();

  if (!snap.exists) return false;
  const data = snap.data() as TeklifimSavedSearch;
  if (data.userId !== userId) {
    throw new Error("Bu kayıtlı aramayı silme yetkiniz bulunmamaktadır.");
  }

  await docRef.delete();
  return true;
}

/**
 * Records a search to user history.
 */
export async function recordSearchHistory(
  userId: string,
  rawQuery: string,
  filters?: TeklifimSearchFilters,
  resultsCount: number = 0
): Promise<TeklifimSearchHistoryItem> {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query) {
    throw new Error("Arama sorgusu boş olamaz.");
  }

  const db = getDb();
  const ref = db.collection("teklifim_search_history").doc();
  const now = Date.now();

  const item: TeklifimSearchHistoryItem = {
    id: ref.id,
    userId,
    query,
    filters: filters || {},
    resultsCount,
    timestamp: now,
  };

  await ref.set(item);
  return item;
}

/**
 * Gets recent search history for a user.
 */
export async function getUserSearchHistory(
  userId: string,
  limit: number = 10
): Promise<TeklifimSearchHistoryItem[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_search_history")
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => doc.data() as TeklifimSearchHistoryItem);
}

/**
 * Clears search history for a user.
 */
export async function clearUserSearchHistory(userId: string): Promise<boolean> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_search_history")
    .where("userId", "==", userId)
    .get();

  const batch = db.batch();
  snap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return true;
}

/**
 * Retrieves similar products for a product.
 */
export async function getSimilarProductsForProduct(
  productId: string,
  limit: number = 4
): Promise<TeklifimProduct[]> {
  const db = getDb();
  const targetDoc = await db.collection("teklifim_products").doc(productId).get();
  if (!targetDoc.exists) return [];

  const targetProduct = {
    id: targetDoc.id,
    ...(targetDoc.data() as Omit<TeklifimProduct, "id">),
  };

  const poolSnap = await db
    .collection("teklifim_products")
    .where("category", "==", targetProduct.category)
    .limit(40)
    .get();

  const pool = poolSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<TeklifimProduct, "id">),
  }));

  return getSimilarProducts(targetProduct, pool, limit);
}

/**
 * Retrieves similar suppliers for a supplier.
 */
export async function getSimilarSuppliersForSupplier(
  supplierId: string,
  limit: number = 4
): Promise<TeklifimSupplierProfile[]> {
  const db = getDb();
  const targetDoc = await db.collection("teklifim_profiles").doc(supplierId).get();
  if (!targetDoc.exists) return [];

  const targetSupplier = {
    id: targetDoc.id,
    ...(targetDoc.data() as Omit<TeklifimProfile, "id">),
  } as TeklifimSupplierProfile;

  const poolSnap = await db
    .collection("teklifim_profiles")
    .where("role", "==", "supplier")
    .limit(50)
    .get();

  const pool = poolSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<TeklifimProfile, "id">),
  })) as TeklifimSupplierProfile[];

  return getSimilarSuppliers(targetSupplier, pool, limit);
}

/**
 * Computes rule-based personalized recommendations for a user.
 */
export async function getPersonalizedRecommendationsForUser(
  userId?: string
): Promise<TeklifimPersonalizedRecommendations> {
  const db = getDb();

  // 1. If user is logged in, inspect recent requests or orders
  let preferredCategories: string[] = [];
  if (userId) {
    const [reqSnap, orderSnap] = await Promise.all([
      db.collection("teklifim_requests").where("businessId", "==", userId).limit(5).get(),
      db.collection("teklifim_orders").where("businessId", "==", userId).limit(5).get(),
    ]);

    for (const doc of reqSnap.docs) {
      const data = doc.data();
      if (data.category && !preferredCategories.includes(data.category)) {
        preferredCategories.push(data.category);
      }
    }

    for (const doc of orderSnap.docs) {
      const data = doc.data();
      if (data.category && !preferredCategories.includes(data.category)) {
        preferredCategories.push(data.category);
      }
    }
  }

  // 2. Fetch products and suppliers
  const [prodSnap, suppSnap] = await Promise.all([
    db.collection("teklifim_products").limit(80).get(),
    db.collection("teklifim_profiles").where("role", "==", "supplier").limit(40).get(),
  ]);

  const allProducts = prodSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<TeklifimProduct, "id">),
  }));

  const allSuppliers = suppSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<TeklifimProfile, "id">),
  })) as TeklifimSupplierProfile[];

  let recommendedProducts: TeklifimProduct[] = [];
  let recommendedSuppliers: TeklifimSupplierProfile[] = [];
  let reason = "Platformda en çok tercih edilen ürün ve tedarikçiler";

  if (preferredCategories.length > 0) {
    reason = `Daha önceki taleplerinize ve ilgi alanlarınıza göre (${preferredCategories.slice(0, 2).join(", ")})`;
    recommendedProducts = allProducts.filter(
      (p) =>
        preferredCategories.includes(p.category) &&
        (!p.status || p.status === "published") &&
        p.isActive !== false
    );
    recommendedSuppliers = allSuppliers.filter((s) =>
      (s.categories || []).some((c: string) => preferredCategories.includes(c))
    );
  }

  // Fallback if not enough matching
  if (recommendedProducts.length < 4) {
    const fallbackProducts = allProducts.filter(
      (p) =>
        (!p.status || p.status === "published") &&
        p.isActive !== false &&
        !recommendedProducts.some((rp) => rp.id === p.id)
    );
    recommendedProducts = [...recommendedProducts, ...fallbackProducts].slice(0, 6);
  }

  if (recommendedSuppliers.length < 3) {
    const fallbackSuppliers = allSuppliers.filter(
      (s) => !recommendedSuppliers.some((rs) => rs.id === s.id)
    );
    recommendedSuppliers = [...recommendedSuppliers, ...fallbackSuppliers].slice(0, 4);
  }

  // Matched category metadata
  const recommendedCategories = extractCategoryMatches(
    preferredCategories[0] || ""
  ).slice(0, 4);

  return {
    recommendedProducts: recommendedProducts.slice(0, 6),
    recommendedSuppliers: recommendedSuppliers.slice(0, 4),
    recommendedCategories,
    reason,
  };
}
