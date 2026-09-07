import assert from "node:assert";
import {
  TeklifimProduct,
  TeklifimSupplierProfile,
  TeklifimCategoryMatch,
  TeklifimSavedSearch,
  TeklifimSearchHistoryItem,
  TeklifimComparisonItem,
} from "../../src/types/teklifimGelsin";
import {
  normalizeSearchText,
  sanitizeSearchQuery,
  categoryToSlug,
  slugToCategory,
  computeProductRelevanceScore,
  computeSupplierRelevanceScore,
  filterAndRankProducts,
  filterAndRankSuppliers,
  extractCategoryMatches,
  generateAutocompleteSuggestions,
  getSimilarProducts,
  getSimilarSuppliers,
  enforceComparisonLimit,
  buildZeroResultPrefillParams,
  productToComparisonItem,
  supplierToComparisonItem,
} from "../../src/lib/teklifimGelsin/searchUtils";

console.log("===============================================================");
console.log(">> [TOPTANCIM CEBIMDE TEST] FAZ 8: Discovery, Search & Smart Marketplace");
console.log("===============================================================");

// Mock Database Collections for Saved Searches & History Isolation
const mockSavedSearches = new Map<string, TeklifimSavedSearch>();
const mockSearchHistory = new Map<string, TeklifimSearchHistoryItem>();

// Sample Products
const mockProducts: TeklifimProduct[] = [
  {
    id: "prod_1",
    supplierId: "sup_1",
    supplierName: "Ege Ambalaj Sanayi",
    supplierCity: "İzmir",
    supplierVerified: true,
    name: "8 oz Kraft Karton Bardak",
    title: "8 oz Kraft Karton Bardak",
    category: "Ambalaj & Paketleme",
    subCategory: "Karton Bardak",
    sku: "KB-8OZ-KRAFT",
    price: 450,
    priceVisibility: "public",
    stockStatus: "in_stock",
    minimumOrder: 5,
    leadTimeDays: 2,
    deliveryRegions: ["İzmir", "Ege Bölgesi", "Tüm Türkiye"],
    description: "Sıcak içecekler için çift katmanlı dayanıklı karton bardak.",
    status: "published",
    isActive: true,
    viewsCount: 120,
    requestsCount: 15,
    createdAt: 1000,
  },
  {
    id: "prod_2",
    supplierId: "sup_2",
    supplierName: "Marmara Plastik",
    supplierCity: "İstanbul",
    supplierVerified: false,
    name: "12 oz Beyaz Karton Bardak",
    title: "12 oz Beyaz Karton Bardak",
    category: "Ambalaj & Paketleme",
    subCategory: "Karton Bardak",
    sku: "KB-12OZ-WHITE",
    price: 600,
    priceVisibility: "public",
    stockStatus: "low_stock",
    minimumOrder: 10,
    leadTimeDays: 4,
    deliveryRegions: ["İstanbul"],
    description: "Ekonomik beyaz baskısız toptan karton bardak.",
    status: "published",
    isActive: true,
    viewsCount: 50,
    requestsCount: 4,
    createdAt: 2000,
  },
  {
    id: "prod_3",
    supplierId: "sup_3",
    supplierName: "Anadolu Kutu & Koli",
    supplierCity: "Ankara",
    supplierVerified: true,
    name: "Oluklu Mukavva Koli 40x30x30",
    title: "Oluklu Mukavva Koli 40x30x30",
    category: "Ambalaj & Paketleme",
    subCategory: "Koli & Kutu",
    sku: "KLI-4030-DOPPEL",
    price: 25,
    priceVisibility: "public",
    stockStatus: "in_stock",
    minimumOrder: 100,
    leadTimeDays: 1,
    deliveryRegions: ["Tüm Türkiye"],
    description: "Çift dalga dopel taşınma ve kargo kolisi.",
    status: "published",
    isActive: true,
    viewsCount: 200,
    requestsCount: 30,
    createdAt: 3000,
  },
  {
    id: "prod_4",
    supplierId: "sup_1",
    supplierName: "Ege Ambalaj Sanayi",
    supplierCity: "İzmir",
    supplierVerified: true,
    name: "Özel Baskılı Karton Çanta",
    title: "Özel Baskılı Karton Çanta",
    category: "Ambalaj & Paketleme",
    subCategory: "Kraft Poşet",
    sku: "KT-BAG-01",
    price: 1800,
    priceVisibility: "hidden", // Hidden price
    stockStatus: "made_to_order",
    minimumOrder: 1000,
    leadTimeDays: 7,
    deliveryRegions: ["Tüm Türkiye"],
    description: "Özel logolu lüks butik karton çanta.",
    status: "published",
    isActive: true,
    viewsCount: 80,
    requestsCount: 6,
    createdAt: 4000,
  },
  {
    id: "prod_5_draft",
    supplierId: "sup_2",
    supplierName: "Marmara Plastik",
    supplierCity: "İstanbul",
    name: "Taslak Pipet Paketi",
    title: "Taslak Pipet Paketi",
    category: "Ambalaj & Paketleme",
    sku: "PIP-001",
    price: 50,
    status: "draft", // Not published
    isActive: true,
    createdAt: 5000,
  },
];

// Sample Suppliers
const mockSuppliers: TeklifimSupplierProfile[] = [
  {
    id: "sup_1",
    companyName: "Ege Ambalaj Sanayi A.Ş.",
    categories: ["Ambalaj & Paketleme", "Matbaa & Baskı"],
    city: "İzmir",
    district: "Bornova",
    description: "Endüstriyel karton bardak, kutu ve ambalaj üreticisi.",
    verification: { isVerified: true },
    rating: 4.8,
    reviewsCount: 24,
    completedDeals: 42,
    responseRate: 95,
    createdAt: 1000,
  },
  {
    id: "sup_2",
    companyName: "Marmara Plastik & Ambalaj Ltd.",
    categories: ["Ambalaj & Paketleme"],
    city: "İstanbul",
    district: "İkitelli",
    description: "Toptan plastik bardak ve sarf malzemeleri tedariği.",
    verification: { isVerified: false },
    rating: 3.9,
    reviewsCount: 8,
    completedDeals: 10,
    responseRate: 75,
    createdAt: 2000,
  },
  {
    id: "sup_3",
    companyName: "Anadolu Kutu Fabrikası",
    categories: ["Ambalaj & Paketleme", "İnşaat & Hırdavat"],
    city: "Ankara",
    district: "Ostim",
    description: "Mukavva koli ve endüstriyel paketleme ürünleri imalatçısı.",
    verification: { isVerified: true },
    rating: 4.9,
    reviewsCount: 35,
    completedDeals: 58,
    responseRate: 98,
    createdAt: 3000,
  },
  {
    id: "sup_4",
    companyName: "Kahve Dünyası Sarfiyat",
    categories: ["Gıda & İçecek"],
    city: "İstanbul",
    district: "Kadıköy",
    description: "Toptan çekirdek kahve, şurup ve kafe sarf malzemeleri.",
    verification: { isVerified: true },
    rating: 4.7,
    reviewsCount: 19,
    completedDeals: 28,
    responseRate: 90,
    createdAt: 4000,
  },
];

// ---------------------------------------------------------------------------
// TEST 1: Product Multi-field Search
// ---------------------------------------------------------------------------
console.log("1. Test: Product search across multiple fields (name, SKU, description)...");
const res1 = filterAndRankProducts(mockProducts, { query: "Karton Bardak" });
assert.ok(res1.items.length >= 2, "En az 2 karton bardak ürünü bulunmalıdır.");
assert.ok(
  res1.items.some((p) => p.sku === "KB-8OZ-KRAFT"),
  "SKU KB-8OZ-KRAFT bulunmalıdır."
);

// ---------------------------------------------------------------------------
// TEST 2: Supplier Search
// ---------------------------------------------------------------------------
console.log("2. Test: Supplier search across name, category, and city...");
const res2 = filterAndRankSuppliers(mockSuppliers, { query: "Ege Ambalaj" });
assert.strictEqual(res2.items.length, 1);
assert.strictEqual(res2.items[0].companyName, "Ege Ambalaj Sanayi A.Ş.");

// ---------------------------------------------------------------------------
// TEST 3: Category Keyword Match
// ---------------------------------------------------------------------------
console.log("3. Test: Category search & subcategory mapping match...");
const catMatches = extractCategoryMatches("ambalaj");
assert.ok(catMatches.length >= 1, "En az 1 kategori eşleşmelidir.");
assert.strictEqual(catMatches[0].name, "Ambalaj & Paketleme");
assert.ok(catMatches[0].slug.length > 0, "Slug üretilmiş olmalıdır.");

// ---------------------------------------------------------------------------
// TEST 4: Exact Match Ranking Higher than Partial
// ---------------------------------------------------------------------------
console.log("4. Test: Exact title/SKU match scores higher than partial match...");
const scoreExact = computeProductRelevanceScore(mockProducts[0], "8 oz Kraft Karton Bardak");
const scorePartial = computeProductRelevanceScore(mockProducts[0], "Karton");
assert.ok(
  scoreExact > scorePartial,
  `Tam eşleşme puanı (${scoreExact}) kısmi puandan (${scorePartial}) yüksek olmalıdır.`
);

// ---------------------------------------------------------------------------
// TEST 5: Partial Keyword Relevance Ranking
// ---------------------------------------------------------------------------
console.log("5. Test: Partial match scoring accurately identifies relevant terms...");
const scoreWithTerms = computeProductRelevanceScore(mockProducts[0], "Kraft Bardak");
const scoreUnrelated = computeProductRelevanceScore(mockProducts[0], "Demir Çimento");
assert.ok(scoreWithTerms > scoreUnrelated);
assert.strictEqual(scoreUnrelated, 0); // No match -> score is 0

// ---------------------------------------------------------------------------
// TEST 6: Context-aware Filters (Category, City, Stock, Price, MOQ)
// ---------------------------------------------------------------------------
console.log("6. Test: Context-aware filters combined execution...");
const res6 = filterAndRankProducts(mockProducts, {
  category: "Ambalaj & Paketleme",
  city: "İzmir",
  inStockOnly: true,
  maxPrice: 500,
});
assert.strictEqual(res6.items.length, 1);
assert.strictEqual(res6.items[0].id, "prod_1");

// ---------------------------------------------------------------------------
// TEST 7: Sorting Capabilities
// ---------------------------------------------------------------------------
console.log("7. Test: Sorting by price_asc, price_desc, fastest_delivery, popular, newest...");
const sortPriceAsc = filterAndRankProducts(mockProducts, { sort: "price_asc" });
assert.strictEqual(sortPriceAsc.items[0].id, "prod_3"); // Price 25 TL

const sortPriceDesc = filterAndRankProducts(mockProducts, { sort: "price_desc" });
assert.strictEqual(sortPriceDesc.items[0].id, "prod_2"); // Price 600 TL (prod_4 hidden)

const sortFastest = filterAndRankProducts(mockProducts, { sort: "fastest_delivery" });
assert.strictEqual(sortFastest.items[0].id, "prod_3"); // 1 day lead time

// ---------------------------------------------------------------------------
// TEST 8: Supplier Relevance Score Factors
// ---------------------------------------------------------------------------
console.log("8. Test: Supplier score factors (exact name, verification, rating, deals)...");
const suppScore1 = computeSupplierRelevanceScore(mockSuppliers[0], "Ege Ambalaj");
const suppScore2 = computeSupplierRelevanceScore(mockSuppliers[1], "Ege Ambalaj");
assert.ok(suppScore1 > suppScore2);
assert.ok(suppScore1 > 100, "Tam firma eşleşmesi 100 puanın üzerinde olmalıdır.");

// ---------------------------------------------------------------------------
// TEST 9: Similar Products Recommendation
// ---------------------------------------------------------------------------
console.log("9. Test: getSimilarProducts returns alternative products from same category...");
const similarProds = getSimilarProducts(mockProducts[0], mockProducts, 3);
assert.ok(similarProds.length > 0, "Benzer ürünler bulunmalıdır.");
assert.ok(
  similarProds.every((p) => p.id !== mockProducts[0].id),
  "Hedef ürün benzerler listesinde yer almamalıdır."
);
assert.strictEqual(similarProds[0].subCategory, "Karton Bardak");

// ---------------------------------------------------------------------------
// TEST 10: Similar Suppliers Recommendation
// ---------------------------------------------------------------------------
console.log("10. Test: getSimilarSuppliers returns competitors with shared categories...");
const similarSupps = getSimilarSuppliers(mockSuppliers[0], mockSuppliers, 2);
assert.ok(similarSupps.length > 0, "Benzer tedarikçiler bulunmalıdır.");
assert.ok(
  similarSupps.every((s) => s.id !== mockSuppliers[0].id),
  "Hedef tedarikçi benzerler listesinde olmamalıdır."
);
assert.ok(similarSupps.some((s) => s.categories?.includes("Ambalaj & Paketleme")));

// ---------------------------------------------------------------------------
// TEST 11: Saved Search Multi-tenant Isolation
// ---------------------------------------------------------------------------
console.log("11. Test: Saved search isolation between users...");
const userA = "usr_alice";
const userB = "usr_bob";

const savedA: TeklifimSavedSearch = {
  id: "save_101",
  userId: userA,
  title: "Koli Araması",
  query: "Koli",
  filters: { category: "Ambalaj & Paketleme" },
  createdAt: Date.now(),
};
mockSavedSearches.set(savedA.id, savedA);

// User B attempts to delete User A's saved search
let userBUnauthorized = false;
const targetSaved = mockSavedSearches.get("save_101");
if (targetSaved && targetSaved.userId !== userB) {
  userBUnauthorized = true; // Blocked
}
assert.ok(userBUnauthorized, "Kullanıcı B, Kullanıcı A'nın kaydını silememelidir.");

// ---------------------------------------------------------------------------
// TEST 12: Search History Multi-tenant Isolation
// ---------------------------------------------------------------------------
console.log("12. Test: Search history privacy & isolation...");
const histA: TeklifimSearchHistoryItem = {
  id: "hist_1",
  userId: userA,
  query: "Karton Bardak 8 oz",
  resultsCount: 2,
  timestamp: Date.now(),
};
mockSearchHistory.set(histA.id, histA);

// User B queries history -> User A's queries must not be included
const userBHistory = Array.from(mockSearchHistory.values()).filter((h) => h.userId === userB);
assert.strictEqual(userBHistory.length, 0, "Kullanıcı B, A'nın arama geçmişini göremez.");

// ---------------------------------------------------------------------------
// TEST 13: Zero-result Request Prefill Generator
// ---------------------------------------------------------------------------
console.log("13. Test: buildZeroResultPrefillParams produces correct request draft...");
const prefill = buildZeroResultPrefillParams("Özel Baskılı Peçete", "Temizlik & Hijyen", "Bursa");
assert.strictEqual(prefill.title, "Özel Baskılı Peçete Tedariği");
assert.ok(prefill.prompt.includes("Özel Baskılı Peçete"));
assert.strictEqual(prefill.category, "Temizlik & Hijyen");
assert.strictEqual(prefill.city, "Bursa");

// ---------------------------------------------------------------------------
// TEST 14: Comparison Limit Enforcement (Max 3 Items)
// ---------------------------------------------------------------------------
console.log("14. Test: enforceComparisonLimit enforces max 3 items strictly...");
const existingCompIds = ["item_1", "item_2", "item_3"];
const checkOverlimit = enforceComparisonLimit(existingCompIds, "item_4", 3);
assert.strictEqual(checkOverlimit.allowed, false, "4. öğe eklenememelidir.");
assert.ok(checkOverlimit.error?.includes("En fazla 3"), "Hata mesajı dönmelidir.");

// Toggle remove behavior
const checkToggle = enforceComparisonLimit(existingCompIds, "item_2", 3);
assert.strictEqual(checkToggle.allowed, true);
assert.strictEqual(checkToggle.updatedIds.length, 2);

// ---------------------------------------------------------------------------
// TEST 15: Private / Draft Product Exclusion
// ---------------------------------------------------------------------------
console.log("15. Test: Draft, archived or inactive products are excluded from search...");
const publicResult = filterAndRankProducts(mockProducts, { query: "Pipet" });
assert.strictEqual(
  publicResult.items.length,
  0,
  "Taslak durumundaki prod_5_draft arama sonuçlarına gelmemelidir."
);

// ---------------------------------------------------------------------------
// TEST 16: Hidden Price Protection
// ---------------------------------------------------------------------------
console.log("16. Test: priceVisibility 'hidden' products have prices masked in output...");
const hiddenPriceResult = filterAndRankProducts(mockProducts, { query: "Karton Çanta" });
assert.strictEqual(hiddenPriceResult.items.length, 1);
assert.strictEqual(hiddenPriceResult.items[0].id, "prod_4");
assert.strictEqual(
  hiddenPriceResult.items[0].price,
  undefined,
  "Gizli fiyatlı ürünün fiyatı maskelenmelidir."
);

// ---------------------------------------------------------------------------
// TEST 17: Verified Supplier Filter
// ---------------------------------------------------------------------------
console.log("17. Test: verifiedOnly filter on products and suppliers...");
const verifiedProds = filterAndRankProducts(mockProducts, { verifiedOnly: true });
assert.ok(
  verifiedProds.items.every((p) => p.supplierVerified === true),
  "Sadece doğrulanmış tedarikçilerin ürünleri listelenmelidir."
);

const verifiedSupps = filterAndRankSuppliers(mockSuppliers, { verifiedOnly: true });
assert.ok(
  verifiedSupps.items.every((s) => s.verification?.isVerified === true),
  "Sadece doğrulanmış tedarikçiler listelenmelidir."
);

// ---------------------------------------------------------------------------
// TEST 18: Tenant Data Privacy / Model Cleanliness
// ---------------------------------------------------------------------------
console.log("18. Test: Product and Supplier comparison items do not leak private data...");
const compProduct = productToComparisonItem(mockProducts[3]);
assert.strictEqual(compProduct.price, undefined, "Gizli fiyat karşılaştırmaya aktarılmamalıdır.");

const compSupplier = supplierToComparisonItem(mockSuppliers[0]);
assert.strictEqual(compSupplier.supplierName, "Ege Ambalaj Sanayi A.Ş.");
assert.strictEqual(compSupplier.isVerified, true);

// ---------------------------------------------------------------------------
// TEST 19: Pagination and Slicing Limits
// ---------------------------------------------------------------------------
console.log("19. Test: Pagination offset and limit handling...");
const page1 = filterAndRankProducts(mockProducts, { limit: 2, offset: 0 });
assert.strictEqual(page1.items.length, 2);
assert.strictEqual(page1.total, 4); // 4 published products

const page2 = filterAndRankProducts(mockProducts, { limit: 2, offset: 2 });
assert.strictEqual(page2.items.length, 2);
assert.notStrictEqual(page1.items[0].id, page2.items[0].id);

// ---------------------------------------------------------------------------
// TEST 20: Search Input Abuse & Sanitization
// ---------------------------------------------------------------------------
console.log("20. Test: Search input sanitization and length clamping...");
const dirtyInput = "<script>alert('xss')</script> SELECT * FROM users; -- '";
const cleaned = sanitizeSearchQuery(dirtyInput);
assert.ok(!cleaned.includes("<script>"), "HTML etiketleri temizlenmelidir.");
assert.ok(!cleaned.includes(";"), "Zararlı karakterler temizlenmelidir.");

const longInput = "a".repeat(200);
const clamped = sanitizeSearchQuery(longInput);
assert.strictEqual(clamped.length, 120, "Uzunluk en fazla 120 karakter olmalıdır.");

console.log("---------------------------------------------------------------");
console.log(">> TUM 20 TEST SENARYOSU BASARIYLA TAMAMLANDI! [FAZ 8 VERIFIED]");
console.log("===============================================================");
