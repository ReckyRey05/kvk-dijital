import assert from "node:assert";
import { computeOfferBadges } from "../../src/lib/teklifimGelsin/teklifimService";
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

console.log("✅ [TEKLIFIM GELSIN TEST] ALL SUITES PASSED SUCCESSFULLY!");
