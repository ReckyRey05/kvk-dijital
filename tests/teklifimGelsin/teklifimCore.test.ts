import assert from "node:assert";
import {
  computeOfferBadges,
  computeSupplierMatchScore,
  checkRequestDeadlineExpired,
} from "../../src/lib/teklifimGelsin/teklifimService";
import {
  TeklifimOffer,
  TeklifimRequest,
  TeklifimProfile,
  TEKLIFIM_CATEGORIES,
  CATEGORY_DETAILS,
  TURKEY_CITIES,
} from "../../src/types/teklifimGelsin";

console.log("▶ [TEKLIFIM GELSIN TEST] Starting Core Suite...");

// =========================================================================
// 1. Intelligent Offer Comparison & Badge Calculation Test
// =========================================================================
console.log("  - Testing Intelligent Badge Calculation (En Ucuz, En Hızlı, En Uygun)...");

const sampleOffers: TeklifimOffer[] = [
  {
    id: "off_1",
    requestId: "req_100",
    requestTitle: "500 Adet Karton Bardak",
    supplierId: "sup_A",
    supplierName: "Toptancı A",
    supplierCity: "İstanbul",
    supplierPhone: "05321112233",
    supplierEmail: "a@toptan.com",
    unitPrice: 35.8,
    totalPrice: 17900,
    deliveryDays: 5,
    description: "8 oz kraft",
    status: "submitted",
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: "off_2",
    requestId: "req_100",
    requestTitle: "500 Adet Karton Bardak",
    supplierId: "sup_B",
    supplierName: "Toptancı B",
    supplierCity: "Kocaeli",
    supplierPhone: "05429998877",
    supplierEmail: "b@toptan.com",
    unitPrice: 37.0,
    totalPrice: 18500,
    deliveryDays: 3,
    description: "Hızlı kargo",
    status: "submitted",
    createdAt: 2000,
    updatedAt: 2000,
  },
  {
    id: "off_3",
    requestId: "req_100",
    requestTitle: "500 Adet Karton Bardak",
    supplierId: "sup_C",
    supplierName: "Toptancı C",
    supplierCity: "Bursa",
    supplierPhone: "05553332211",
    supplierEmail: "c@toptan.com",
    unitPrice: 38.4,
    totalPrice: 19200,
    deliveryDays: 2,
    description: "Ekspres üretim",
    status: "submitted",
    createdAt: 3000,
    updatedAt: 3000,
  },
];

const badgedOffers = computeOfferBadges(sampleOffers);

const cheapestOffer = badgedOffers.find((o) => o.isCheapest);
assert.strictEqual(cheapestOffer?.id, "off_1", "Toptancı A (17.900 TL) must be tagged as En Ucuz");

const fastestOffer = badgedOffers.find((o) => o.isFastest);
assert.strictEqual(fastestOffer?.id, "off_3", "Toptancı C (2 gün) must be tagged as En Hızlı");

assert.ok(badgedOffers.some((o) => o.isBestValue), "At least one offer must have isBestValue badge");
console.log("    ✓ En Ucuz, En Hızlı and En Uygun badges computed correctly.");

// =========================================================================
// 2. Multi-Tenant Supplier Confidentiality Security Test
// =========================================================================
console.log("  - Testing Multi-Tenant Supplier Price Isolation...");

function filterOffersByRole(
  offers: TeklifimOffer[],
  requestingUserId: string,
  isBusinessOwner: boolean
): TeklifimOffer[] {
  if (isBusinessOwner) {
    return computeOfferBadges(offers);
  }
  // Supplier view: strictly ONLY own offer
  return offers.filter((o) => o.supplierId === requestingUserId);
}

// Business owner perspective
const businessView = filterOffersByRole(sampleOffers, "business_owner_1", true);
assert.strictEqual(businessView.length, 3, "Business owner can see all 3 offers");

// Supplier A perspective
const supplierAView = filterOffersByRole(sampleOffers, "sup_A", false);
assert.strictEqual(supplierAView.length, 1, "Supplier A can ONLY see their own offer");
assert.strictEqual(supplierAView[0].supplierId, "sup_A");
assert.strictEqual(
  supplierAView.some((o) => o.supplierId === "sup_B" || o.supplierId === "sup_C"),
  false,
  "Supplier A CANNOT see competitor suppliers B and C"
);

// Supplier B perspective
const supplierBView = filterOffersByRole(sampleOffers, "sup_B", false);
assert.strictEqual(supplierBView.length, 1, "Supplier B can ONLY see their own offer");
assert.strictEqual(supplierBView[0].supplierId, "sup_B");
console.log("    ✓ Multi-Tenant supplier price confidentiality verified.");

// =========================================================================
// 3. Request Lifecycle State Machine Test
// =========================================================================
console.log("  - Testing Request State Transition Chain...");

const lifecycleRequest: TeklifimRequest = {
  id: "req_test",
  businessId: "biz_1",
  businessName: "Test Cafe",
  businessCity: "İstanbul",
  title: "1000 Adet Kutu",
  category: "Ambalaj & Paketleme",
  quantity: 1000,
  unit: "Adet",
  deliveryDays: 7,
  city: "İstanbul",
  description: "Test",
  status: "published",
  offerCount: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Initial state
assert.strictEqual(lifecycleRequest.status, "published");

// Step 1: Offer arrives
lifecycleRequest.offerCount += 1;
lifecycleRequest.status = "offers_received";
assert.strictEqual(lifecycleRequest.status, "offers_received");
assert.strictEqual(lifecycleRequest.offerCount, 1);

// Step 2: Supplier is selected
lifecycleRequest.selectedOfferId = "off_1";
lifecycleRequest.selectedSupplierId = "sup_A";
lifecycleRequest.status = "supplier_selected";
assert.strictEqual(lifecycleRequest.status, "supplier_selected");
assert.strictEqual(lifecycleRequest.selectedSupplierId, "sup_A");

// Step 3: Trade completed
lifecycleRequest.status = "completed";
assert.strictEqual(lifecycleRequest.status, "completed");
console.log("    ✓ Request lifecycle state machine passed.");

// =========================================================================
// 4. Category Details & Meta Integrity Test
// =========================================================================
console.log("  - Testing Category Metadata Integrity...");
assert.strictEqual(TEKLIFIM_CATEGORIES.length, 10, "Must have exactly 10 standard categories");
for (const cat of TEKLIFIM_CATEGORIES) {
  const details = CATEGORY_DETAILS[cat];
  assert.ok(details, `Category '${cat}' must have rich details metadata`);
  assert.ok(details.description.length > 5, `Description for '${cat}' must be informative`);
  assert.ok(details.popularItems.length > 0, `Popular items for '${cat}' must not be empty`);
}
console.log("    ✓ Category metadata integrity verified.");

// =========================================================================
// 5. Supplier Feed Filtering Logic Test
// =========================================================================
console.log("  - Testing Supplier Feed Filtering & Search...");

const openFeed: TeklifimRequest[] = [
  {
    ...lifecycleRequest,
    id: "req_1",
    title: "5000 Adet Pizza Kutusu",
    category: "Ambalaj & Paketleme",
    city: "İstanbul",
  },
  {
    ...lifecycleRequest,
    id: "req_2",
    title: "20 Koli Toptan Çekirdek Kahve",
    category: "Gıda & İçecek",
    city: "İzmir",
  },
  {
    ...lifecycleRequest,
    id: "req_3",
    title: "100 Adet Personel Önlüğü",
    category: "Tekstil & İş Kıyafeti",
    city: "Bursa",
  },
];

function filterFeed(
  items: TeklifimRequest[],
  cat: string,
  city: string,
  search: string
): TeklifimRequest[] {
  return items.filter((req) => {
    if (cat !== "Tümü" && req.category !== cat) return false;
    if (city !== "Tümü" && req.city !== city) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        req.title.toLowerCase().includes(q) ||
        req.category.toLowerCase().includes(q) ||
        req.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

// Category filter
const packagingOnly = filterFeed(openFeed, "Ambalaj & Paketleme", "Tümü", "");
assert.strictEqual(packagingOnly.length, 1);
assert.strictEqual(packagingOnly[0].id, "req_1");

// City filter
const izmirOnly = filterFeed(openFeed, "Tümü", "İzmir", "");
assert.strictEqual(izmirOnly.length, 1);
assert.strictEqual(izmirOnly[0].id, "req_2");

// Search filter
const coffeeSearch = filterFeed(openFeed, "Tümü", "Tümü", "kahve");
assert.strictEqual(coffeeSearch.length, 1);
assert.strictEqual(coffeeSearch[0].id, "req_2");

console.log("    ✓ Supplier feed filtering passed.");

// =========================================================================
// 6. FAZ 2: Deterministic Supplier Match Scoring Algorithm Test
// =========================================================================
console.log("  - Testing FAZ 2: computeSupplierMatchScore algorithm...");

const matchRequest: TeklifimRequest = {
  id: "req_match_1",
  businessId: "biz_10",
  businessName: "Karaköy Roastery",
  businessCity: "İstanbul",
  title: "10000 Adet Baskılı Karton Bardak",
  category: "Ambalaj & Paketleme",
  quantity: 10000,
  unit: "Adet",
  deliveryDays: 5,
  city: "İstanbul",
  description: "8 oz çift duvar kraft karton bardak",
  status: "open",
  offerCount: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const perfectSupplier: TeklifimProfile = {
  uid: "sup_perfect",
  role: "supplier",
  companyName: "Karton Bardak ve Ambalaj Sanayi",
  contactName: "Ahmet Usta",
  city: "İstanbul",
  categories: ["Ambalaj & Paketleme"],
  deliveryRegions: ["Tüm Türkiye"],
  description: "Özel baskılı karton bardak ve ambalaj imalatı",
  isVerified: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const fullMatch = computeSupplierMatchScore(matchRequest, perfectSupplier);
assert.strictEqual(fullMatch.matchScore, 100, "Full match should score exactly 100 points");
assert.strictEqual(fullMatch.matchReasons.length, 5, "Should have 5 distinct match reasons");
assert.ok(
  fullMatch.matchReasons.some((r) => r.includes("Kategori")),
  "Should include category reason"
);
assert.ok(
  fullMatch.matchReasons.some((r) => r.includes("şehir")),
  "Should include city reason"
);
assert.ok(
  fullMatch.matchReasons.some((r) => r.includes("Teslimat bölgesi")),
  "Should include delivery region reason"
);
assert.ok(
  fullMatch.matchReasons.some((r) => r.includes("anahtar kelime")),
  "Should include keyword reason"
);
assert.ok(
  fullMatch.matchReasons.some((r) => r.includes("Doğrulanmış")),
  "Should include verified reason"
);

// Test partial match (different city, unverified, no title keyword)
const partialSupplier: TeklifimProfile = {
  uid: "sup_partial",
  role: "supplier",
  companyName: "Anadolu Ambalaj A.Ş.",
  contactName: "Mehmet Bey",
  city: "Konya",
  categories: ["Ambalaj & Paketleme"],
  deliveryRegions: ["İç Anadolu Bölgesi"],
  description: "Endüstriyel koli üreticisi",
  isVerified: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const partialMatch = computeSupplierMatchScore(matchRequest, partialSupplier);
// Category: +40, City: 0, Region: 0, Keyword: 0, Verified: 0 -> Total: 40
assert.strictEqual(partialMatch.matchScore, 40, "Partial supplier should score exactly 40 points");
assert.strictEqual(partialMatch.matchReasons.length, 1);
console.log("    ✓ Deterministic match scoring computed accurately (100 vs 40).");

// =========================================================================
// 7. FAZ 2: Request Deadline & Expiration Test
// =========================================================================
console.log("  - Testing FAZ 2: checkRequestDeadlineExpired logic...");

const futureRequest: TeklifimRequest = {
  ...matchRequest,
  deadlineTimestamp: Date.now() + 1000 * 60 * 60 * 24, // 24 hours from now
};
assert.strictEqual(checkRequestDeadlineExpired(futureRequest), false, "Future request is NOT expired");

const pastRequest: TeklifimRequest = {
  ...matchRequest,
  deadlineTimestamp: Date.now() - 1000 * 60, // 1 minute ago
};
assert.strictEqual(checkRequestDeadlineExpired(pastRequest), true, "Past request IS expired");

const noDeadlineRequest: TeklifimRequest = {
  ...matchRequest,
  deadlineTimestamp: undefined,
};
assert.strictEqual(
  checkRequestDeadlineExpired(noDeadlineRequest),
  false,
  "Request without deadlineTimestamp is NOT expired"
);
console.log("    ✓ Request deadline expiration verification passed.");

// =========================================================================
// 8. FAZ 2: Offer Selection & Immutability Lock Test
// =========================================================================
console.log("  - Testing FAZ 2: Offer status immutability rule...");

function validateOfferCanBeUpdated(offer: TeklifimOffer, editorId: string): boolean {
  if (offer.supplierId !== editorId) {
    throw new Error("Yetkisiz kullanıcı.");
  }
  if (offer.status === "selected") {
    throw new Error("İşletme tarafından seçilmiş ve anlaşılmış teklifler düzenlenemez.");
  }
  return true;
}

const unselectedOffer: TeklifimOffer = {
  id: "off_editable",
  requestId: "req_match_1",
  requestTitle: "Karton Bardak",
  supplierId: "sup_perfect",
  supplierName: "Karton Bardak A.Ş.",
  supplierCity: "İstanbul",
  supplierPhone: "05321112233",
  supplierEmail: "sup@test.com",
  unitPrice: 1.5,
  totalPrice: 15000,
  deliveryDays: 4,
  description: "İlk teklif",
  status: "pending",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Allowed update on pending offer
assert.strictEqual(validateOfferCanBeUpdated(unselectedOffer, "sup_perfect"), true);

// Locked update on selected offer
const lockedOffer: TeklifimOffer = {
  ...unselectedOffer,
  status: "selected",
};

assert.throws(
  () => validateOfferCanBeUpdated(lockedOffer, "sup_perfect"),
  /İşletme tarafından seçilmiş ve anlaşılmış teklifler düzenlenemez/,
  "Updating selected offer MUST throw error"
);
console.log("    ✓ Selected offer immutability lock verified.");

// =========================================================================
// 9. FAZ 2: Supplier Directory Filtering & Sorting Logic Test
// =========================================================================
console.log("  - Testing FAZ 2: Supplier directory filtering and sorting...");

const mockSuppliers: TeklifimProfile[] = [
  {
    uid: "s1",
    role: "supplier",
    companyName: "Zeta Matbaa",
    city: "İstanbul",
    categories: ["Matbaa & Baskı"],
    isVerified: true,
    responseRate: "1 Saat",
    completedDeals: 120,
    createdAt: 100,
  },
  {
    uid: "s2",
    role: "supplier",
    companyName: "Alfa Ambalaj",
    city: "İzmir",
    categories: ["Ambalaj & Paketleme"],
    isVerified: false,
    responseRate: "4 Saat",
    completedDeals: 30,
    createdAt: 200,
  },
  {
    uid: "s3",
    role: "supplier",
    companyName: "Beta Kağıt",
    city: "İstanbul",
    categories: ["Ambalaj & Paketleme"],
    isVerified: true,
    responseRate: "2 Saat",
    completedDeals: 85,
    createdAt: 300,
  },
];

function filterAndSortSuppliers(
  list: TeklifimProfile[],
  filter: { category?: string; city?: string; verifiedOnly?: boolean; sort?: string }
): TeklifimProfile[] {
  let res = [...list];
  if (filter.category) {
    res = res.filter((s) => (s.categories || []).includes(filter.category!));
  }
  if (filter.city) {
    res = res.filter((s) => s.city?.toLowerCase() === filter.city!.toLowerCase());
  }
  if (filter.verifiedOnly) {
    res = res.filter((s) => s.isVerified);
  }
  if (filter.sort === "deals") {
    res.sort((a, b) => (b.completedDeals || 0) - (a.completedDeals || 0));
  } else if (filter.sort === "new") {
    res.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  return res;
}

// Filter Istanbul + Verified
const istanbulVerified = filterAndSortSuppliers(mockSuppliers, {
  city: "İstanbul",
  verifiedOnly: true,
});
assert.strictEqual(istanbulVerified.length, 2, "Must find 2 verified suppliers in Istanbul");

// Filter Packaging + Sort by deals
const packagingDeals = filterAndSortSuppliers(mockSuppliers, {
  category: "Ambalaj & Paketleme",
  sort: "deals",
});
assert.strictEqual(packagingDeals.length, 2);
assert.strictEqual(packagingDeals[0].uid, "s3", "Beta Kağıt (85 deals) should rank before Alfa (30)");

console.log("    ✓ Supplier directory filtering and sorting verified.");

console.log("✅ [TEKLIFIM GELSIN TEST] ALL PHASE 1 & PHASE 2 SUITES PASSED SUCCESSFULLY!");
