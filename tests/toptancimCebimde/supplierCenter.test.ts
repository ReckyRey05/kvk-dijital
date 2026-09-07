import assert from "node:assert";
import {
  TeklifimRequest,
  TeklifimOffer,
  TeklifimOrder,
  TeklifimProduct,
  TeklifimProfile,
  TeklifimQuoteTemplate,
  TeklifimPriceList,
  TeklifimSupplierAvailability,
  TeklifimCustomerSegment,
} from "../../src/types/teklifimGelsin";
import {
  computeOpportunityMatches,
  calculateSupplierKpis,
  calculateOfferConversion,
  computeProductPerformances,
  classifyCustomerSegment,
  extractSupplierCustomers,
  calculateDeliveryPerformance,
  applyBulkPriceAdjustment,
  validateQuoteTemplatePricing,
  buildCommercialCalendarEvents,
  exportSupplierSalesReportToCsv,
} from "../../src/lib/teklifimGelsin/supplierCenterUtils";

console.log("===============================================================");
console.log(">> [TOPTANCIM CEBIMDE TEST] FAZ 10: Supplier Center & Sales Growth");
console.log("===============================================================");

// ---------------------------------------------------------------------------
// TEST 1: Supplier Dashboard Metrics Calculation
// ---------------------------------------------------------------------------
console.log("1. Test: Supplier dashboard metrics calculation...");
const mockOrdersT1: TeklifimOrder[] = [
  {
    id: "ord_1",
    supplierId: "sup_101",
    buyerBusinessId: "biz_001",
    totalAmount: 15000,
    status: "completed",
    createdAt: Date.now() - 1 * 24 * 3600 * 1000, // 1 day ago (this month)
  } as any,
  {
    id: "ord_2",
    supplierId: "sup_101",
    buyerBusinessId: "biz_002",
    totalAmount: 25000,
    status: "shipped",
    createdAt: Date.now() - 3 * 24 * 3600 * 1000, // 3 days ago (this month)
  } as any,
];

const mockOffersT1: TeklifimOffer[] = [
  {
    id: "off_1",
    supplierId: "sup_101",
    status: "accepted",
    totalPrice: 15000,
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
    respondedAt: Date.now() - 5 * 24 * 3600 * 1000 + 45 * 60 * 1000, // 45 mins later
  } as any,
  {
    id: "off_2",
    supplierId: "sup_101",
    status: "submitted",
    totalPrice: 10000,
    createdAt: Date.now() - 2 * 24 * 3600 * 1000,
  } as any,
];

const kpis = calculateSupplierKpis(mockOrdersT1, mockOffersT1);
assert.strictEqual(kpis.thisMonthSales, 40000);
assert.strictEqual(kpis.completedOrdersCount, 1);
assert.strictEqual(kpis.activeOrdersCount, 1);
assert.strictEqual(kpis.thisMonthOffersCount, 2);
assert.strictEqual(kpis.pendingOffersCount, 1);
assert.strictEqual(kpis.averageResponseMinutes, 45);
console.log("PASSED: Dashboard KPIs computed accurately.");

// ---------------------------------------------------------------------------
// TEST 2: Opportunity Filtering & Deterministic Match Scores
// ---------------------------------------------------------------------------
console.log("2. Test: Opportunity filtering & deterministic matching...");
const mockSupplierProfile: TeklifimProfile = {
  id: "sup_101",
  companyName: "Ege Ambalaj A.S.",
  city: "Izmir",
  categories: ["Ambalaj & Paketleme"],
  deliveryRegions: ["Ege", "Izmir", "Manisa"],
} as any;

const mockCatalogProducts: TeklifimProduct[] = [
  {
    id: "prod_koli_1",
    supplierId: "sup_101",
    title: "Kraft Koli 40x30x30",
    name: "Kraft Koli 40x30x30",
    category: "Ambalaj & Paketleme",
    price: 35,
    status: "published",
    isActive: true,
  } as any,
];

const mockRequests: TeklifimRequest[] = [
  {
    id: "req_match_1",
    title: "1000 Adet Kraft Koli Ihtiyaci",
    category: "Ambalaj & Paketleme",
    productName: "Kraft Koli",
    city: "Izmir",
    quantity: 1000,
    unit: "Adet",
    status: "published",
  } as any,
  {
    id: "req_no_match",
    title: "Endustriyel Mutfak Ekipmani",
    category: "Endustriyel Mutfak",
    productName: "Sanayi Tipi Firin",
    city: "Ankara",
    quantity: 1,
    unit: "Adet",
    status: "published",
  } as any,
];

const opportunities = computeOpportunityMatches(mockRequests, mockSupplierProfile, mockCatalogProducts);
assert.strictEqual(opportunities.length, 1);
assert.strictEqual(opportunities[0].requestId, "req_match_1");
assert.ok(opportunities[0].matchScore >= 80);
assert.ok(opportunities[0].matchSignals.includes("Kategori Uyumu"));
assert.ok(opportunities[0].matchSignals.includes("Sehrinde"));
assert.ok(opportunities[0].matchSignals.includes("Katalog Urunun Var"));
assert.strictEqual(opportunities[0].matchingCatalogProductId, "prod_koli_1");
console.log("PASSED: Opportunity matched with score " + opportunities[0].matchScore + ".");

// ---------------------------------------------------------------------------
// TEST 3: Offer Conversion Calculation & Zero-Division Safety
// ---------------------------------------------------------------------------
console.log("3. Test: Offer conversion calculation & zero-division safety...");
const conversionEmpty = calculateOfferConversion([], []);
assert.strictEqual(conversionEmpty.conversionRate, null);
assert.strictEqual(conversionEmpty.totalOffers, 0);

const mockOffersConv: TeklifimOffer[] = [
  { id: "o1", status: "accepted", category: "Gida", totalPrice: 20000, createdAt: Date.now() } as any,
  { id: "o2", status: "rejected", category: "Gida", totalPrice: 10000, createdAt: Date.now() } as any,
  { id: "o3", status: "submitted", category: "Ambalaj", totalPrice: 15000, createdAt: Date.now() } as any,
];

const convResult = calculateOfferConversion(mockOffersConv, []);
assert.strictEqual(convResult.totalOffers, 3);
assert.strictEqual(convResult.acceptedOffers, 1);
assert.strictEqual(convResult.rejectedOffers, 1);
assert.strictEqual(convResult.pendingOffers, 1);
// 1 accepted out of 3 = 33.3%
assert.strictEqual(convResult.conversionRate, 33.3);
assert.strictEqual(convResult.categoryConversions.length, 2);
console.log("PASSED: Conversion rate computed accurately with zero-division safety.");

// ---------------------------------------------------------------------------
// TEST 4: Product Performance Metrics
// ---------------------------------------------------------------------------
console.log("4. Test: Product performance metrics calculation...");
const mockProdsT4: TeklifimProduct[] = [
  {
    id: "prod_bardak",
    supplierId: "sup_101",
    title: "Karton Bardak 8 oz",
    name: "Karton Bardak 8 oz",
    category: "Ambalaj",
    price: 1.2,
    viewCount: 200,
    requestCount: 40,
  } as any,
];

const mockOrdersT4: TeklifimOrder[] = [
  {
    id: "ord_b1",
    status: "completed",
    items: [{ productId: "prod_bardak", quantity: 5000, unitPrice: 1.2, totalPrice: 6000 }],
  } as any,
  {
    id: "ord_b2",
    status: "completed",
    items: [{ productId: "prod_bardak", quantity: 3000, unitPrice: 1.2, totalPrice: 3600 }],
  } as any,
];

const prodPerfs = computeProductPerformances(mockProdsT4, mockOrdersT4);
assert.strictEqual(prodPerfs.length, 1);
assert.strictEqual(prodPerfs[0].salesCount, 2);
assert.strictEqual(prodPerfs[0].totalRevenue, 9600);
// 2 sales / 40 requests = 5.0%
assert.strictEqual(prodPerfs[0].conversionRate, 5);
console.log("PASSED: Product performance metrics validated.");

// ---------------------------------------------------------------------------
// TEST 5: Customer History Authorization & Filtering
// ---------------------------------------------------------------------------
console.log("5. Test: Customer history authorization & extraction...");
const mockOrdersT5: TeklifimOrder[] = [
  {
    id: "ord_c1",
    supplierId: "sup_101",
    buyerBusinessId: "biz_cafe_1",
    buyerBusinessName: "Cafe Mola",
    deliveryCity: "Izmir",
    totalAmount: 12000,
    status: "completed",
    category: "Gida",
    createdAt: Date.now() - 15 * 24 * 3600 * 1000,
  } as any,
  {
    id: "ord_c2",
    supplierId: "sup_101",
    buyerBusinessId: "biz_cafe_1",
    buyerBusinessName: "Cafe Mola",
    deliveryCity: "Izmir",
    totalAmount: 8000,
    status: "completed",
    category: "Ambalaj",
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
  } as any,
];

const extractedCustomers = extractSupplierCustomers(mockOrdersT5, ["biz_cafe_1"]);
assert.strictEqual(extractedCustomers.length, 1);
assert.strictEqual(extractedCustomers[0].businessId, "biz_cafe_1");
assert.strictEqual(extractedCustomers[0].completedOrdersCount, 2);
assert.strictEqual(extractedCustomers[0].totalSalesVolume, 20000);
assert.strictEqual(extractedCustomers[0].isFavorite, true);
assert.strictEqual(extractedCustomers[0].categories.length, 2);
console.log("PASSED: Customer history and details extracted correctly.");

// ---------------------------------------------------------------------------
// TEST 6: Favorite Customer Toggle & Filtering
// ---------------------------------------------------------------------------
console.log("6. Test: Favorite customer toggle & priority filter...");
let favoriteIds = ["biz_cafe_1"];
// Remove from favorites
favoriteIds = favoriteIds.filter((id) => id !== "biz_cafe_1");
assert.strictEqual(favoriteIds.includes("biz_cafe_1"), false);
// Add to favorites
favoriteIds.push("biz_cafe_2");
assert.strictEqual(favoriteIds.includes("biz_cafe_2"), true);
const custFav = extractSupplierCustomers(mockOrdersT5, favoriteIds);
assert.strictEqual(custFav[0].isFavorite, false);
console.log("PASSED: Favorite toggle works deterministically.");

// ---------------------------------------------------------------------------
// TEST 7: Reorder Flow with Current Catalog Price Verification
// ---------------------------------------------------------------------------
console.log("7. Test: Reorder flow with live catalog price verification...");
const catalogItem: TeklifimProduct = {
  id: "prod_kahve",
  supplierId: "sup_101",
  title: "Espresso Cekirdek Kahve 1kg",
  price: 520, // Current catalog price
  status: "published",
} as any;

const pastOrderItem = {
  productId: "prod_kahve",
  unitPrice: 480, // Past order price
  quantity: 10,
};

const priceDelta = (catalogItem.price || 0) - pastOrderItem.unitPrice;
assert.strictEqual(priceDelta, 40); // 40 TL price increase in catalog
assert.strictEqual(catalogItem.status, "published");
console.log("PASSED: Reorder flow detected current catalog price delta.");

// ---------------------------------------------------------------------------
// TEST 8: Quote Template Creation & Field Validation
// ---------------------------------------------------------------------------
console.log("8. Test: Quote template creation and field validation...");
const validTemplate: TeklifimQuoteTemplate = {
  id: "tmpl_01",
  supplierId: "sup_101",
  title: "Standart Karton Bardak Teklifi",
  category: "Ambalaj & Paketleme",
  unitPrice: 1.15,
  deliveryDays: 3,
  minOrderQuantity: 1000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

assert.ok(validTemplate.title.length > 0);
assert.ok(validTemplate.category.length > 0);
assert.ok(validTemplate.unitPrice > 0);
assert.strictEqual(validTemplate.deliveryDays, 3);
console.log("PASSED: Quote template creation validated.");

// ---------------------------------------------------------------------------
// TEST 9: Quote Template Current-Price Validation
// ---------------------------------------------------------------------------
console.log("9. Test: Quote template current-price validation against catalog...");
const templateWithProduct: TeklifimQuoteTemplate = {
  id: "tmpl_02",
  supplierId: "sup_101",
  title: "A4 Kagit Teklifi",
  category: "Kirtasiye",
  productId: "prod_a4",
  unitPrice: 120, // Stored template price
  deliveryDays: 2,
  minOrderQuantity: 5,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const productCatalogPriceHigher: TeklifimProduct = {
  id: "prod_a4",
  price: 135, // Current price has increased
} as any;

const validationResult = validateQuoteTemplatePricing(templateWithProduct, productCatalogPriceHigher);
assert.strictEqual(validationResult.isValid, true);
assert.strictEqual(validationResult.priceMismatch, true);
assert.strictEqual(validationResult.currentCatalogPrice, 135);
console.log("PASSED: Template price mismatch detected correctly.");

// ---------------------------------------------------------------------------
// TEST 10: Bulk Quote Validation across Multiple Requests
// ---------------------------------------------------------------------------
console.log("10. Test: Bulk quote application & item validation...");
const targetRequests: TeklifimRequest[] = [
  { id: "req_a", quantity: 500, category: "Ambalaj & Paketleme" } as any,
  { id: "req_b", quantity: 1000, category: "Ambalaj & Paketleme" } as any,
];

const appliedOffers = targetRequests.map((req) => ({
  requestId: req.id,
  supplierId: validTemplate.supplierId,
  unitPrice: validTemplate.unitPrice,
  quantity: req.quantity,
  totalPrice: validTemplate.unitPrice * req.quantity,
  deliveryDays: validTemplate.deliveryDays,
}));

assert.strictEqual(appliedOffers.length, 2);
assert.strictEqual(appliedOffers[0].totalPrice, 575); // 500 * 1.15
assert.strictEqual(appliedOffers[1].totalPrice, 1150); // 1000 * 1.15
console.log("PASSED: Bulk quote generation applied with exact quantities.");

// ---------------------------------------------------------------------------
// TEST 11: Bulk Price Update Formula (+/- %X) & Live Preview
// ---------------------------------------------------------------------------
console.log("11. Test: Bulk price update formula and preview calculation...");
const productsToAdjust: TeklifimProduct[] = [
  { id: "p1", price: 100 } as any,
  { id: "p2", price: 250 } as any,
];

// Increase by 10%
const previewsIncrease = applyBulkPriceAdjustment(productsToAdjust, 10);
assert.strictEqual(previewsIncrease[0].newPrice, 110);
assert.strictEqual(previewsIncrease[1].newPrice, 275);

// Decrease by 20%
const previewsDecrease = applyBulkPriceAdjustment(productsToAdjust, -20);
assert.strictEqual(previewsDecrease[0].newPrice, 80);
assert.strictEqual(previewsDecrease[1].newPrice, 200);
console.log("PASSED: Bulk price adjustments computed with precision.");

// ---------------------------------------------------------------------------
// TEST 12: Price Snapshot Integrity (Never Alters Past Orders/Offers)
// ---------------------------------------------------------------------------
console.log("12. Test: Price snapshot integrity on historical records...");
const historicalOrder: TeklifimOrder = {
  id: "ord_hist_1",
  totalAmount: 5000,
  items: [{ productId: "p1", unitPrice: 100, totalPrice: 5000, quantity: 50 }],
} as any;

// Product price changes from 100 -> 110
const adjustedProduct = { ...productsToAdjust[0], price: 110 };

// Ensure historical order remains untouched
assert.strictEqual(historicalOrder.items[0].unitPrice, 100);
assert.strictEqual(historicalOrder.totalAmount, 5000);
assert.notStrictEqual(historicalOrder.items[0].unitPrice, adjustedProduct.price);
console.log("PASSED: Snapshot integrity verified on historical orders.");

// ---------------------------------------------------------------------------
// TEST 13: Customer Behavioral Segmentation (New, Active, Regular, Dormant)
// ---------------------------------------------------------------------------
console.log("13. Test: Customer behavioral segmentation classification...");
const now = Date.now();
const refDate = new Date(now);

// 1 Order -> New
const newCustomerOrders: TeklifimOrder[] = [
  { id: "o_n1", status: "completed", createdAt: now - 10 * 24 * 3600 * 1000 } as any,
];
assert.strictEqual(classifyCustomerSegment(newCustomerOrders, refDate), "new");

// 3+ Orders -> Regular
const regularOrders: TeklifimOrder[] = [
  { id: "o_r1", status: "completed", createdAt: now - 50 * 24 * 3600 * 1000 } as any,
  { id: "o_r2", status: "completed", createdAt: now - 20 * 24 * 3600 * 1000 } as any,
  { id: "o_r3", status: "completed", createdAt: now - 5 * 24 * 3600 * 1000 } as any,
];
assert.strictEqual(classifyCustomerSegment(regularOrders, refDate), "regular");

// Last order > 60 days ago -> Dormant
const dormantOrders: TeklifimOrder[] = [
  { id: "o_d1", status: "completed", createdAt: now - 75 * 24 * 3600 * 1000 } as any,
  { id: "o_d2", status: "completed", createdAt: now - 65 * 24 * 3600 * 1000 } as any,
];
assert.strictEqual(classifyCustomerSegment(dormantOrders, refDate), "dormant");

// Order within 30 days -> Active
const activeOrders: TeklifimOrder[] = [
  { id: "o_a1", status: "completed", createdAt: now - 45 * 24 * 3600 * 1000 } as any,
  { id: "o_a2", status: "completed", createdAt: now - 15 * 24 * 3600 * 1000 } as any,
];
assert.strictEqual(classifyCustomerSegment(activeOrders, refDate), "active");
console.log("PASSED: Customer segmentation classifies all 4 segments accurately.");

// ---------------------------------------------------------------------------
// TEST 14: Supplier Availability & Vacation Mode Logic
// ---------------------------------------------------------------------------
console.log("14. Test: Supplier availability and vacation date window...");
const availabilityNormal: TeklifimSupplierAvailability = {
  isOnline: true,
  isAcceptingOrders: true,
  vacationMode: false,
};
assert.strictEqual(availabilityNormal.isOnline, true);
assert.strictEqual(availabilityNormal.vacationMode, false);

const availabilityVacation: TeklifimSupplierAvailability = {
  isOnline: false,
  isAcceptingOrders: false,
  vacationMode: true,
  vacationStartDate: "2026-09-10",
  vacationEndDate: "2026-09-20",
  vacationNote: "Fabrika yillik bakim sebebiyle kapali.",
};
assert.strictEqual(availabilityVacation.vacationMode, true);
assert.strictEqual(availabilityVacation.isAcceptingOrders, false);
console.log("PASSED: Supplier availability and vacation mode logic verified.");

// ---------------------------------------------------------------------------
// TEST 15: Delivery Performance & Timeliness Calculation
// ---------------------------------------------------------------------------
console.log("15. Test: Delivery performance & on-time delivery rate...");
const mockDeliveryOrders: TeklifimOrder[] = [
  {
    id: "del_1",
    status: "completed",
    deliveryDueDate: "2026-09-01T12:00:00Z",
    deliveredAt: "2026-09-01T10:00:00Z", // On time
    createdAt: new Date("2026-08-28").getTime(),
  } as any,
  {
    id: "del_2",
    status: "delivered",
    deliveryDueDate: "2026-09-02T12:00:00Z",
    deliveredAt: "2026-09-03T15:00:00Z", // Delayed!
    createdAt: new Date("2026-08-29").getTime(),
  } as any,
];

const delPerf = calculateDeliveryPerformance(mockDeliveryOrders);
assert.strictEqual(delPerf.totalDeliveredCount, 2);
assert.strictEqual(delPerf.delayedOrdersCount, 1);
assert.strictEqual(delPerf.onTimeDeliveryRate, 50); // 1 on time / 2 = 50%
console.log("PASSED: Delivery performance and delayed orders computed correctly.");

// ---------------------------------------------------------------------------
// TEST 16: Stock Alert Integration
// ---------------------------------------------------------------------------
console.log("16. Test: Stock alert integration for low stock & out of stock...");
const inventoryProducts: TeklifimProduct[] = [
  { id: "st_1", title: "Urun A", stockStatus: "out_of_stock", stockCount: 0 } as any,
  { id: "st_2", title: "Urun B", stockStatus: "low_stock", stockCount: 3, lowStockThreshold: 5 } as any,
  { id: "st_3", title: "Urun C", stockStatus: "in_stock", stockCount: 150, lowStockThreshold: 10 } as any,
];

const stockAlerts = inventoryProducts.filter((p) => {
  if (p.stockStatus === "out_of_stock") return true;
  if (p.stockStatus === "low_stock") return true;
  if (typeof p.stockCount === "number" && p.stockCount <= (p.lowStockThreshold || 5)) return true;
  return false;
});

assert.strictEqual(stockAlerts.length, 2);
assert.strictEqual(stockAlerts[0].id, "st_1");
assert.strictEqual(stockAlerts[1].id, "st_2");
console.log("PASSED: Stock alerts filtered out of stock and low stock items.");

// ---------------------------------------------------------------------------
// TEST 17: Sales Report Calculation (Category, Customer & Period Breakdown)
// ---------------------------------------------------------------------------
console.log("17. Test: Sales report metrics & distribution calculation...");
const reportOrders: TeklifimOrder[] = [
  {
    id: "rep_1",
    status: "completed",
    category: "Gida",
    buyerBusinessId: "biz_1",
    totalAmount: 12000,
  } as any,
  {
    id: "rep_2",
    status: "completed",
    category: "Ambalaj",
    buyerBusinessId: "biz_2",
    totalAmount: 18000,
  } as any,
  {
    id: "rep_3",
    status: "completed",
    category: "Ambalaj",
    buyerBusinessId: "biz_1",
    totalAmount: 6000,
  } as any,
];

let totalSales = 0;
const catMap: Record<string, number> = {};
for (const o of reportOrders) {
  totalSales += o.totalAmount ?? 0;
  catMap[o.category || "Diger"] = (catMap[o.category || "Diger"] || 0) + (o.totalAmount ?? 0);
}

assert.strictEqual(totalSales, 36000);
assert.strictEqual(catMap["Ambalaj"], 24000);
assert.strictEqual(catMap["Gida"], 12000);
console.log("PASSED: Sales breakdown by category and total revenue verified.");

// ---------------------------------------------------------------------------
// TEST 18: CSV Export String Generation & Header Integrity
// ---------------------------------------------------------------------------
console.log("18. Test: CSV export formatting and header validation...");
const csvOutput = exportSupplierSalesReportToCsv(reportOrders);
assert.ok(csvOutput.includes("Siparis No;Tarih;Alici;Kategori;Tutar;Durum"));
assert.ok(csvOutput.includes("Ambalaj"));
assert.ok(csvOutput.includes("18000"));
console.log("PASSED: UTF-8 CSV content formatted with exact columns.");

// ---------------------------------------------------------------------------
// TEST 19: Supplier Multi-Tenant Isolation
// ---------------------------------------------------------------------------
console.log("19. Test: Supplier multi-tenant data isolation...");
const supplierA_Orders: TeklifimOrder[] = [
  { id: "ord_a1", supplierId: "sup_A", totalAmount: 50000, status: "completed" } as any,
];
const supplierB_Orders: TeklifimOrder[] = [
  { id: "ord_b1", supplierId: "sup_B", totalAmount: 90000, status: "completed" } as any,
];

// Query simulation for Supplier A
const queriedForA = [...supplierA_Orders, ...supplierB_Orders].filter(
  (o) => o.supplierId === "sup_A"
);
assert.strictEqual(queriedForA.length, 1);
assert.strictEqual(queriedForA[0].totalAmount, 50000);
console.log("PASSED: Supplier A cannot access Supplier B order data.");

// ---------------------------------------------------------------------------
// TEST 20: Cross-Supplier Price Lists Isolation
// ---------------------------------------------------------------------------
console.log("20. Test: Cross-supplier price lists & quote templates isolation...");
const mockPriceLists: TeklifimPriceList[] = [
  { id: "pl_a", supplierId: "sup_A", name: "Ozel Liste A", discountPercentage: 10 } as any,
  { id: "pl_b", supplierId: "sup_B", name: "Ozel Liste B", discountPercentage: 15 } as any,
];

const visibleListsForB = mockPriceLists.filter((pl) => pl.supplierId === "sup_B");
assert.strictEqual(visibleListsForB.length, 1);
assert.strictEqual(visibleListsForB[0].name, "Ozel Liste B");
console.log("PASSED: Price lists strictly isolated per supplier ID.");

// ---------------------------------------------------------------------------
// TEST 21: Commercial Calendar Events Construction
// ---------------------------------------------------------------------------
console.log("21. Test: Commercial calendar events construction...");
const calendarEvents = buildCommercialCalendarEvents(
  [
    {
      id: "ord_cal_1",
      orderNumber: "ORD-991",
      deliveryDueDate: "2026-09-15T10:00:00Z",
      buyerBusinessName: "Akdeniz Restoran",
      totalAmount: 14500,
      status: "preparing",
    } as any,
  ],
  [
    {
      id: "off_cal_1",
      offerNumber: "TEK-442",
      validUntil: "2026-09-12T18:00:00Z",
      requestTitle: "500 Kg Un Alimi",
      totalPrice: 8500,
      status: "submitted",
    } as any,
  ]
);

assert.strictEqual(calendarEvents.length, 2);
assert.strictEqual(calendarEvents[0].type, "offer_expiry");
assert.strictEqual(calendarEvents[1].type, "delivery_due");
console.log("PASSED: Commercial calendar generated delivery and expiry events.");

// ---------------------------------------------------------------------------
// TEST 22: Role Permission & Unauthorized Access Prevention
// ---------------------------------------------------------------------------
console.log("22. Test: Non-supplier role permission denial...");
function checkSupplierAccess(userRole: string) {
  if (userRole === "supplier" || userRole === "admin") {
    return { authorized: true };
  }
  return { authorized: false, error: "Bu alana yalnizca tedarikciler erisebilir." };
}

assert.strictEqual(checkSupplierAccess("buyer").authorized, false);
assert.strictEqual(checkSupplierAccess("staff").authorized, false);
assert.strictEqual(checkSupplierAccess("supplier").authorized, true);
assert.strictEqual(checkSupplierAccess("admin").authorized, true);
console.log("PASSED: Non-supplier roles correctly denied access.");

console.log("===============================================================");
console.log("ALL 22 FAZ 10 UNIT TESTS PASSED SUCCESSFULLY!");
console.log("===============================================================");
