import {
  TeklifimProduct,
  TeklifimSupplierProfile,
  TeklifimSearchFilters,
  TeklifimUnifiedSearchResult,
  TeklifimCategoryMatch,
  TeklifimAutocompleteSuggestion,
  TeklifimComparisonItem,
  TeklifimPersonalizedRecommendations,
  TEKLIFIM_CATEGORIES,
  CATEGORY_DETAILS,
  SUBCATEGORY_MAPPING,
} from "@/types/teklifimGelsin";

/**
 * Normalizes text for Turkish locale search matching.
 * Converts to lowercase and normalizes special Turkish characters and punctuation.
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return "";
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ğüşıöç\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sanitizes search input to prevent injection, strips HTML tags, and truncates excess length.
 */
export function sanitizeSearchQuery(query?: string | null): string {
  if (!query) return "";
  const cleaned = query
    .replace(/<[^>]*>?/gm, "")
    .replace(/[;'"\\]/g, "")
    .trim();
  return cleaned.slice(0, 120);
}

/**
 * Converts a category title to a URL-friendly slug.
 */
export function categoryToSlug(category: string): string {
  return normalizeSearchText(category)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

/**
 * Maps a URL slug back to the standard category name.
 */
export function slugToCategory(slug: string): string | undefined {
  if (!slug) return undefined;
  const normalizedSlug = slug.toLowerCase().trim();
  return TEKLIFIM_CATEGORIES.find(
    (cat) => categoryToSlug(cat) === normalizedSlug
  );
}

/**
 * Computes deterministic relevance score for a product given a search query.
 */
export function computeProductRelevanceScore(
  product: TeklifimProduct,
  rawQuery: string
): number {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 10; // Default base score if no query

  const productName = normalizeSearchText(product.name || product.title || "");
  const sku = normalizeSearchText(product.sku || "");
  const category = normalizeSearchText(product.category || "");
  const subCategory = normalizeSearchText(product.subCategory || "");
  const description = normalizeSearchText(product.description || "");

  const fullSearchable = `${productName} ${sku} ${category} ${subCategory} ${description}`;
  const queryWords = query.split(" ").filter((w) => w.length > 1);

  // Require all words to match across searchable fields
  const allWordsMatch =
    queryWords.length === 0 || queryWords.every((word) => fullSearchable.includes(word));
  if (!allWordsMatch) {
    return 0;
  }

  let score = 0;

  // 1. Exact Title / SKU Match
  if (productName === query) {
    score += 100;
  } else if (productName.startsWith(query)) {
    score += 50;
  } else if (productName.includes(query)) {
    score += 35;
  }

  if (sku && sku === query) {
    score += 90;
  } else if (sku && sku.includes(query)) {
    score += 40;
  }

  // 2. Word by word match in Title
  for (const word of queryWords) {
    if (productName.includes(word)) {
      score += 15;
    }
  }

  // 3. Subcategory and Category Matches
  if (subCategory && (subCategory === query || subCategory.includes(query))) {
    score += 25;
  }
  if (category && (category === query || category.includes(query))) {
    score += 20;
  }

  // 4. Description Match
  if (description && description.includes(query)) {
    score += 10;
  }

  // 5. Stock Status Bonus
  if (product.stockStatus === "in_stock") {
    score += 10;
  } else if (product.stockStatus === "low_stock") {
    score += 5;
  }

  // 6. Verified Supplier Bonus
  if (product.supplierVerified) {
    score += 8;
  }

  // 7. Popularity Bonus (capped at 10)
  const popularity =
    (product.requestsCount || 0) * 2 + Math.floor((product.viewsCount || 0) / 25);
  score += Math.min(10, popularity);

  return score;
}

/**
 * Computes deterministic relevance score for a supplier given a search query.
 */
export function computeSupplierRelevanceScore(
  supplier: TeklifimSupplierProfile,
  rawQuery: string
): number {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 10;

  const companyName = normalizeSearchText(supplier.companyName || "");
  const description = normalizeSearchText(supplier.description || "");
  const city = normalizeSearchText(supplier.city || "");
  const district = normalizeSearchText(supplier.district || "");
  const categories = (supplier.categories || []).map((c: string) =>
    normalizeSearchText(c)
  );

  const fullSearchable = `${companyName} ${categories.join(" ")} ${city} ${district} ${description}`;
  const queryWords = query.split(" ").filter((w) => w.length > 1);

  // Require all words to match across searchable fields
  const allWordsMatch =
    queryWords.length === 0 || queryWords.every((word) => fullSearchable.includes(word));
  if (!allWordsMatch) {
    return 0;
  }

  let score = 0;

  // 1. Company Name Match
  if (companyName === query) {
    score += 100;
  } else if (companyName.startsWith(query)) {
    score += 55;
  } else if (companyName.includes(query)) {
    score += 40;
  }

  // 2. Word match in company name
  for (const word of queryWords) {
    if (companyName.includes(word)) {
      score += 15;
    }
  }

  // 3. Categories Match
  for (const cat of categories) {
    if (cat === query || cat.includes(query)) {
      score += 30;
      break;
    }
  }

  // 4. City / District Match
  if (city && (city === query || city.includes(query))) {
    score += 20;
  }
  if (district && (district === query || district.includes(query))) {
    score += 10;
  }

  // 5. Description Match
  if (description && description.includes(query)) {
    score += 15;
  }

  // 6. Verification Status Bonus
  if (supplier.verification?.isVerified) {
    score += 15;
  }

  // 7. Rating Bonus (0-5 stars -> up to 20 points)
  if (supplier.rating && supplier.rating > 0) {
    score += Math.min(20, Math.round(supplier.rating * 4));
  }

  // 8. Completed Deals Bonus (up to 15 points)
  const completedDeals = supplier.completedDeals || 0;
  score += Math.min(15, Math.round(completedDeals * 1.5));

  // 9. Response Rate Bonus
  if ((supplier.responseRate || 0) >= 80) {
    score += 5;
  }

  return score;
}

/**
 * Filter, score and rank products.
 * Also protects hidden prices by masking them before returning.
 */
export function filterAndRankProducts(
  products: TeklifimProduct[],
  filters: TeklifimSearchFilters = {}
): { items: TeklifimProduct[]; total: number } {
  const query = sanitizeSearchQuery(filters.query || "");
  const normalizedQuery = normalizeSearchText(query);

  let filtered = products.filter((p) => {
    // 1. Status and Active check: only published products
    if (p.status && p.status !== "published") return false;
    if (p.isActive === false) return false;

    // 2. Category filter
    if (filters.category && p.category !== filters.category) {
      return false;
    }

    // 3. SubCategory filter
    if (filters.subCategory && p.subCategory !== filters.subCategory) {
      return false;
    }

    // 4. City filter
    if (filters.city && p.supplierCity) {
      const pCity = normalizeSearchText(p.supplierCity);
      const fCity = normalizeSearchText(filters.city);
      if (!pCity.includes(fCity)) return false;
    }

    // 5. Delivery Region filter
    if (filters.deliveryRegion && p.deliveryRegions && p.deliveryRegions.length > 0) {
      const hasRegion = p.deliveryRegions.some((r) =>
        normalizeSearchText(r).includes(normalizeSearchText(filters.deliveryRegion))
      );
      if (!hasRegion) return false;
    }

    // 6. Stock status filter
    if (filters.stockStatus && p.stockStatus !== filters.stockStatus) {
      return false;
    }
    if (filters.inStockOnly && p.stockStatus !== "in_stock") {
      return false;
    }

    // 7. Price range filter
    const effectivePrice = p.price ?? p.estimatedPrice;
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      if (effectivePrice === undefined || effectivePrice < filters.minPrice) {
        return false;
      }
    }
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      if (effectivePrice === undefined || effectivePrice > filters.maxPrice) {
        return false;
      }
    }

    // 8. Minimum Order Quantity (MOQ)
    const effectiveMoq = p.minimumOrder ?? (p.minOrder ? parseInt(p.minOrder, 10) : undefined);
    if (filters.minMoq !== undefined && filters.minMoq > 0) {
      if (effectiveMoq === undefined || effectiveMoq < filters.minMoq) {
        return false;
      }
    }
    if (filters.maxMoq !== undefined && filters.maxMoq > 0) {
      if (effectiveMoq === undefined || effectiveMoq > filters.maxMoq) {
        return false;
      }
    }

    // 9. Verified Supplier filter
    if (filters.verifiedOnly && !p.supplierVerified) {
      return false;
    }

    // 10. Query search match (if query is present)
    if (normalizedQuery) {
      const score = computeProductRelevanceScore(p, query);
      if (score < 10) return false;
    }

    return true;
  });

  // Sort
  const sort = filters.sort || "relevance";
  filtered.sort((a, b) => {
    if (sort === "relevance") {
      const scoreA = computeProductRelevanceScore(a, query);
      const scoreB = computeProductRelevanceScore(b, query);
      return scoreB - scoreA;
    }
    if (sort === "price_asc") {
      const priceA = a.priceVisibility === "hidden" ? 999999999 : (a.price ?? a.estimatedPrice ?? 999999999);
      const priceB = b.priceVisibility === "hidden" ? 999999999 : (b.price ?? b.estimatedPrice ?? 999999999);
      return priceA - priceB;
    }
    if (sort === "price_desc") {
      const priceA = a.priceVisibility === "hidden" ? -1 : (a.price ?? a.estimatedPrice ?? -1);
      const priceB = b.priceVisibility === "hidden" ? -1 : (b.price ?? b.estimatedPrice ?? -1);
      return priceB - priceA;
    }
    if (sort === "moq_asc") {
      const moqA = a.minimumOrder ?? 999999;
      const moqB = b.minimumOrder ?? 999999;
      return moqA - moqB;
    }
    if (sort === "fastest_delivery") {
      const leadA = a.leadTimeDays ?? 999;
      const leadB = b.leadTimeDays ?? 999;
      return leadA - leadB;
    }
    if (sort === "popular") {
      const popA = (a.requestsCount || 0) * 3 + (a.viewsCount || 0);
      const popB = (b.requestsCount || 0) * 3 + (b.viewsCount || 0);
      return popB - popA;
    }
    if (sort === "newest") {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    return 0;
  });

  const total = filtered.length;
  const offset = filters.offset || 0;
  const limit = filters.limit || 50;
  const sliced = filtered.slice(offset, offset + limit);

  // Hidden price protection: mask price if priceVisibility is hidden
  const sanitizedItems = sliced.map((item) => {
    if (item.priceVisibility === "hidden") {
      return {
        ...item,
        price: undefined,
        estimatedPrice: undefined,
      };
    }
    return item;
  });

  return { items: sanitizedItems, total };
}

/**
 * Filter, score and rank suppliers.
 */
export function filterAndRankSuppliers(
  suppliers: TeklifimSupplierProfile[],
  filters: TeklifimSearchFilters = {}
): { items: TeklifimSupplierProfile[]; total: number } {
  const query = sanitizeSearchQuery(filters.query || "");
  const normalizedQuery = normalizeSearchText(query);

  let filtered = suppliers.filter((s) => {
    // 1. Category filter
    if (filters.category) {
      const hasCat = (s.categories || []).some(
        (c: string) => normalizeSearchText(c) === normalizeSearchText(filters.category)
      );
      if (!hasCat) return false;
    }

    // 2. City filter
    if (filters.city) {
      const sCity = normalizeSearchText(s.city || "");
      const fCity = normalizeSearchText(filters.city);
      if (!sCity.includes(fCity)) return false;
    }

    // 3. Verified only
    if (filters.verifiedOnly && !s.verification?.isVerified) {
      return false;
    }

    // 4. Min Rating
    if (filters.minRating !== undefined && filters.minRating > 0) {
      if (!s.rating || s.rating < filters.minRating) {
        return false;
      }
    }

    // 5. Query matching
    if (normalizedQuery) {
      const score = computeSupplierRelevanceScore(s, query);
      if (score < 10) return false;
    }

    return true;
  });

  // Sort
  const sort = filters.sort || "relevance";
  filtered.sort((a, b) => {
    if (sort === "relevance") {
      const scoreA = computeSupplierRelevanceScore(a, query);
      const scoreB = computeSupplierRelevanceScore(b, query);
      return scoreB - scoreA;
    }
    if (sort === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sort === "deals") {
      return (b.completedDeals || 0) - (a.completedDeals || 0);
    }
    if (sort === "fastest_response") {
      return (b.responseRate || 0) - (a.responseRate || 0);
    }
    if (sort === "newest") {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    return 0;
  });

  const total = filtered.length;
  const offset = filters.offset || 0;
  const limit = filters.limit || 50;
  const sliced = filtered.slice(offset, offset + limit);

  return { items: sliced, total };
}

/**
 * Matches categories and subcategories against a search query.
 */
export function extractCategoryMatches(
  rawQuery: string,
  productsCountMap: Record<string, number> = {},
  suppliersCountMap: Record<string, number> = {}
): TeklifimCategoryMatch[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) {
    // Return all standard categories when query is empty
    return TEKLIFIM_CATEGORIES.map((cat) => {
      const meta = CATEGORY_DETAILS[cat] || {
        name: cat,
        description: "",
        popularItems: [],
      };
      return {
        name: cat,
        slug: categoryToSlug(cat),
        description: meta.description,
        popularItems: meta.popularItems,
        subCategories: SUBCATEGORY_MAPPING[cat] || [],
        productsCount: productsCountMap[cat] || 0,
        suppliersCount: suppliersCountMap[cat] || 0,
      };
    });
  }

  const matches: TeklifimCategoryMatch[] = [];

  for (const cat of TEKLIFIM_CATEGORIES) {
    const meta = CATEGORY_DETAILS[cat] || {
      name: cat,
      description: "",
      popularItems: [],
    };
    const subCats = SUBCATEGORY_MAPPING[cat] || [];
    const normCat = normalizeSearchText(cat);

    const isCatMatch = normCat.includes(query) || query.includes(normCat);
    const matchingSub = subCats.filter((sub) => {
      const normSub = normalizeSearchText(sub);
      return normSub.includes(query) || query.includes(normSub);
    });

    const isMetaMatch = meta.popularItems.some((item) =>
      normalizeSearchText(item).includes(query)
    );

    if (isCatMatch || matchingSub.length > 0 || isMetaMatch) {
      matches.push({
        name: cat,
        slug: categoryToSlug(cat),
        description: meta.description,
        popularItems: meta.popularItems,
        subCategories: subCats,
        matchingSubCategories: matchingSub,
        productsCount: productsCountMap[cat] || 0,
        suppliersCount: suppliersCountMap[cat] || 0,
      });
    }
  }

  return matches;
}

/**
 * Generates live autocomplete suggestions for products, categories, subcategories, and suppliers.
 */
export function generateAutocompleteSuggestions(
  rawQuery: string,
  products: TeklifimProduct[],
  suppliers: TeklifimSupplierProfile[],
  maxSuggestions: number = 8
): TeklifimAutocompleteSuggestion[] {
  const query = sanitizeSearchQuery(rawQuery);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }

  const suggestions: TeklifimAutocompleteSuggestion[] = [];

  // 1. Check matching categories & subcategories first
  for (const cat of TEKLIFIM_CATEGORIES) {
    if (normalizeSearchText(cat).includes(normalizedQuery)) {
      suggestions.push({
        type: "category",
        title: cat,
        subtitle: "Ana Kategori",
        category: cat,
        url: `/teklifim-gelsin/search?type=products&category=${encodeURIComponent(cat)}`,
        badge: "Kategori",
      });
    }
    const subCats = SUBCATEGORY_MAPPING[cat] || [];
    for (const sub of subCats) {
      if (normalizeSearchText(sub).includes(normalizedQuery)) {
        suggestions.push({
          type: "subCategory",
          title: sub,
          subtitle: `${cat} Alt Kategorisi`,
          category: cat,
          url: `/teklifim-gelsin/search?type=products&category=${encodeURIComponent(cat)}&subCategory=${encodeURIComponent(sub)}`,
          badge: "Alt Kategori",
        });
      }
    }
  }

  // 2. Check matching products (published only)
  const productMatches = products
    .filter((p) => (!p.status || p.status === "published") && p.isActive !== false)
    .map((p) => ({
      product: p,
      score: computeProductRelevanceScore(p, query),
    }))
    .filter((entry) => entry.score > 15)
    .sort((a, b) => b.score - a.score);

  for (const entry of productMatches.slice(0, 4)) {
    const p = entry.product;
    const isSkuMatch = p.sku && normalizeSearchText(p.sku).includes(normalizedQuery);
    suggestions.push({
      type: isSkuMatch ? "sku" : "product",
      id: p.id,
      title: p.name || p.title || "Ürün",
      subtitle: p.supplierName ? `${p.supplierName} • ${p.category}` : p.category,
      category: p.category,
      url: `/teklifim-gelsin/products/${p.id}`,
      badge: isSkuMatch ? `SKU: ${p.sku}` : "Ürün",
    });
  }

  // 3. Check matching suppliers
  const supplierMatches = suppliers
    .map((s) => ({
      supplier: s,
      score: computeSupplierRelevanceScore(s, query),
    }))
    .filter((entry) => entry.score > 20)
    .sort((a, b) => b.score - a.score);

  for (const entry of supplierMatches.slice(0, 3)) {
    const s = entry.supplier;
    suggestions.push({
      type: "supplier",
      id: s.id,
      title: s.companyName,
      subtitle: `${s.city || "Türkiye"} • ${(s.categories || []).slice(0, 2).join(", ")}`,
      url: `/teklifim-gelsin/suppliers/${s.id}`,
      badge: s.verification?.isVerified ? "Doğrulanmış Tedarikçi" : "Tedarikçi",
    });
  }

  return suggestions.slice(0, maxSuggestions);
}

/**
 * Finds similar products based on category, subCategory, and supplier.
 */
export function getSimilarProducts(
  targetProduct: TeklifimProduct,
  allProducts: TeklifimProduct[],
  limit: number = 4
): TeklifimProduct[] {
  const activeProducts = allProducts.filter(
    (p) =>
      p.id !== targetProduct.id &&
      (!p.status || p.status === "published") &&
      p.isActive !== false
  );

  const scored = activeProducts.map((p) => {
    let score = 0;
    // Same subcategory is top priority
    if (
      targetProduct.subCategory &&
      p.subCategory &&
      targetProduct.subCategory === p.subCategory
    ) {
      score += 50;
    }
    // Same category
    if (p.category === targetProduct.category) {
      score += 30;
    }
    // In stock bonus
    if (p.stockStatus === "in_stock") {
      score += 10;
    }
    // Verified supplier bonus
    if (p.supplierVerified) {
      score += 5;
    }
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((entry) => entry.score >= 30)
    .slice(0, limit)
    .map((entry) => {
      if (entry.product.priceVisibility === "hidden") {
        return {
          ...entry.product,
          price: undefined,
          estimatedPrice: undefined,
        };
      }
      return entry.product;
    });
}

/**
 * Finds similar suppliers based on shared categories and location.
 */
export function getSimilarSuppliers(
  targetSupplier: TeklifimSupplierProfile,
  allSuppliers: TeklifimSupplierProfile[],
  limit: number = 4
): TeklifimSupplierProfile[] {
  const targetCategories = new Set(targetSupplier.categories || []);

  const candidates = allSuppliers.filter((s) => s.id !== targetSupplier.id);

  const scored = candidates.map((s) => {
    let score = 0;
    const supplierCats = s.categories || [];
    let sharedCount = 0;
    for (const c of supplierCats) {
      if (targetCategories.has(c)) {
        sharedCount++;
      }
    }
    score += sharedCount * 25;

    if (targetSupplier.city && s.city === targetSupplier.city) {
      score += 15;
    }

    if (s.verification?.isVerified) {
      score += 10;
    }

    if (s.rating && s.rating > 4.0) {
      score += 10;
    }

    return { supplier: s, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((entry) => entry.score > 0)
    .slice(0, limit)
    .map((entry) => entry.supplier);
}

/**
 * Enforces maximum comparison items limit (max 3 items).
 */
export function enforceComparisonLimit(
  existingIds: string[],
  newId: string,
  maxItems: number = 3
): { allowed: boolean; updatedIds: string[]; error?: string } {
  if (existingIds.includes(newId)) {
    // Remove if already present (toggle behavior)
    return {
      allowed: true,
      updatedIds: existingIds.filter((id) => id !== newId),
    };
  }

  if (existingIds.length >= maxItems) {
    return {
      allowed: false,
      updatedIds: existingIds,
      error: `En fazla ${maxItems} öğe karşılaştırılabilir. Lütfen bir öğeyi kaldırıp tekrar deneyin.`,
    };
  }

  return {
    allowed: true,
    updatedIds: [...existingIds, newId],
  };
}

/**
 * Builds prefilled request parameters from a zero-result search query.
 */
export function buildZeroResultPrefillParams(
  rawQuery: string,
  category?: string,
  city?: string
): { prompt: string; title: string; category?: string; city?: string } {
  const query = sanitizeSearchQuery(rawQuery);
  const title = query ? `${query.charAt(0).toLocaleUpperCase("tr-TR")}${query.slice(1)} Tedariği` : "Toptan Malzeme Tedariği";
  const prompt = query ? `Aranan ürün/hizmet: ${query}. Toptan alım için teklif bekliyoruz.` : "";

  return {
    prompt,
    title,
    category: category || undefined,
    city: city || undefined,
  };
}

/**
 * Converts a TeklifimProduct to TeklifimComparisonItem format.
 */
export function productToComparisonItem(product: TeklifimProduct): TeklifimComparisonItem {
  return {
    id: product.id,
    type: "product",
    title: product.name || product.title || "Ürün",
    imageUrl: product.imageUrl || (product.images && product.images[0]),
    category: product.category,
    subCategory: product.subCategory,
    supplierName: product.supplierName,
    supplierId: product.supplierId,
    price: product.priceVisibility === "hidden" ? undefined : (product.price ?? product.estimatedPrice),
    priceVisibility: product.priceVisibility,
    minimumOrder: product.minimumOrder ?? (product.minOrder ? parseInt(product.minOrder, 10) : undefined),
    unit: product.unit,
    stockStatus: product.stockStatus,
    leadTimeDays: product.leadTimeDays,
    deliveryRegions: product.deliveryRegions,
    isVerified: product.supplierVerified,
    city: product.supplierCity,
    url: `/teklifim-gelsin/products/${product.id}`,
  };
}

/**
 * Converts a TeklifimSupplierProfile to TeklifimComparisonItem format.
 */
export function supplierToComparisonItem(supplier: TeklifimSupplierProfile): TeklifimComparisonItem {
  return {
    id: supplier.id,
    type: "supplier",
    title: supplier.companyName,
    imageUrl: supplier.logoUrl,
    category: (supplier.categories && supplier.categories[0]) || "Genel Tedarik",
    subCategory: supplier.categories ? supplier.categories.slice(1).join(", ") : undefined,
    supplierName: supplier.companyName,
    supplierId: supplier.id,
    rating: supplier.rating,
    reviewsCount: supplier.reviewsCount,
    isVerified: supplier.verification?.isVerified,
    city: supplier.city,
    completedDeals: supplier.completedDeals,
    responseRate: supplier.responseRate,
    url: `/teklifim-gelsin/suppliers/${supplier.id}`,
  };
}
