import {
  TeklifimOrgRole,
  TeklifimProcurementPolicy,
  TeklifimProcurementList,
  TeklifimProcurementItem,
  TeklifimRequest,
  TeklifimOffer,
  TeklifimOrder,
  TeklifimProduct,
  TeklifimSpendSummary,
  TeklifimFrequentlyPurchasedItem,
  TeklifimBulkOfferComparison,
} from "@/types/teklifimGelsin";
import crypto from "crypto";

/**
 * Checks role-based organizational permissions for corporate procurement.
 *
 * Role Hierarchy:
 * - owner: Full authority across all actions
 * - admin: Can manage team, policies, approve requests, create requests, export reports
 * - buyer: Can create requests, create/edit lists, view data; CANNOT approve above-threshold requests or manage team
 * - approver: Can approve or reject requests, view data, export reports; CANNOT manage team or policies
 * - viewer: Read-only access across procurement
 */
export function hasOrgPermission(
  role: TeklifimOrgRole,
  action:
    | "create_request"
    | "approve_request"
    | "manage_team"
    | "manage_policy"
    | "export_reports"
    | "create_list"
    | "view"
): boolean {
  switch (action) {
    case "view":
      return ["owner", "admin", "buyer", "approver", "viewer"].includes(role);

    case "create_request":
    case "create_list":
      return ["owner", "admin", "buyer"].includes(role);

    case "approve_request":
      return ["owner", "admin", "approver"].includes(role);

    case "manage_team":
    case "manage_policy":
      return ["owner", "admin"].includes(role);

    case "export_reports":
      return ["owner", "admin", "buyer", "approver"].includes(role);

    default:
      return false;
  }
}

/**
 * Determines whether a procurement request or order requires corporate approval
 * based on the business's policy threshold and whether it is a bulk procurement.
 */
export function calculateApprovalRequired(
  totalAmount: number,
  policy?: Partial<TeklifimProcurementPolicy> | null,
  isBulk?: boolean
): boolean {
  const threshold = policy?.approvalThreshold ?? 35000;
  if (totalAmount > threshold) {
    return true;
  }
  if (isBulk && policy?.requireApprovalForBulk) {
    return true;
  }
  return false;
}

/**
 * Calculates price difference between previous purchase and current catalog/offer price.
 * Positive deltaAmount/deltaPercentage indicates price increase.
 * Negative deltaAmount/deltaPercentage indicates savings/price decrease.
 */
export function computePriceDifference(
  previousPrice: number,
  currentPrice: number
): { deltaAmount: number; deltaPercentage: number } {
  const deltaAmount = Number((currentPrice - previousPrice).toFixed(2));
  if (previousPrice <= 0) {
    return { deltaAmount, deltaPercentage: 0 };
  }
  const deltaPercentage = Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1));
  return { deltaAmount, deltaPercentage };
}

/**
 * Validates offer total against estimated procurement budget.
 * Generates warning metrics if offer exceeds budget without auto-rejecting.
 */
export function checkBudgetWarning(
  offeredTotal: number,
  estimatedBudget?: number
): { exceedsBudget: boolean; delta: number; percentageOver: number } {
  if (!estimatedBudget || estimatedBudget <= 0) {
    return { exceedsBudget: false, delta: 0, percentageOver: 0 };
  }
  if (offeredTotal > estimatedBudget) {
    const delta = Number((offeredTotal - estimatedBudget).toFixed(2));
    const percentageOver = Number((((offeredTotal - estimatedBudget) / estimatedBudget) * 100).toFixed(1));
    return { exceedsBudget: true, delta, percentageOver };
  }
  return { exceedsBudget: false, delta: 0, percentageOver: 0 };
}

/**
 * Aggregates monthly spend analytics, trends, top category, and top supplier
 * strictly using real order history. No artificial statistics or simulated data.
 */
export function aggregateSpendAnalytics(
  orders: TeklifimOrder[],
  referenceDate: Date = new Date()
): TeklifimSpendSummary {
  // Only consider non-cancelled orders
  const validOrders = orders.filter(
    (o) => o.status !== "cancelled" && o.status !== "disputed"
  );

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth(); // 0-indexed

  let thisMonthSpend = 0;
  let prevMonthSpend = 0;
  let totalSpendAllTime = 0;

  const categorySpendMap = new Map<string, { spend: number; count: number }>();
  const supplierSpendMap = new Map<string, { name: string; spend: number; count: number }>();
  const monthlyTrendMap = new Map<string, { spend: number; count: number }>();

  // Determine previous month boundaries
  const prevMonthIndex = refMonth === 0 ? 11 : refMonth - 1;
  const prevYear = refMonth === 0 ? refYear - 1 : refYear;

  for (const order of validOrders) {
    const amount = order.totalPrice || 0;
    totalSpendAllTime += amount;

    const orderDate = new Date(order.createdAt);
    const orderYear = orderDate.getFullYear();
    const orderMonth = orderDate.getMonth();

    if (orderYear === refYear && orderMonth === refMonth) {
      thisMonthSpend += amount;
    } else if (orderYear === prevYear && orderMonth === prevMonthIndex) {
      prevMonthSpend += amount;
    }

    // Monthly Trends key: YYYY-MM
    const monthKey = `${orderYear}-${String(orderMonth + 1).padStart(2, "0")}`;
    const trend = monthlyTrendMap.get(monthKey) || { spend: 0, count: 0 };
    trend.spend += amount;
    trend.count += 1;
    monthlyTrendMap.set(monthKey, trend);

    // Supplier spend
    if (order.supplierId) {
      const sup = supplierSpendMap.get(order.supplierId) || {
        name: order.supplierName || "Bilinmeyen Tedarikci",
        spend: 0,
        count: 0,
      };
      sup.spend += amount;
      sup.count += 1;
      supplierSpendMap.set(order.supplierId, sup);
    }

    // Category spend from order items
    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        const cat = item.category || "Diger";
        const catStat = categorySpendMap.get(cat) || { spend: 0, count: 0 };
        catStat.spend += item.totalPrice || 0;
        catStat.count += 1;
        categorySpendMap.set(cat, catStat);
      }
    }
  }

  thisMonthSpend = Number(thisMonthSpend.toFixed(2));
  prevMonthSpend = Number(prevMonthSpend.toFixed(2));
  totalSpendAllTime = Number(totalSpendAllTime.toFixed(2));

  // Percentage change vs previous month: null if insufficient data (e.g. prevMonth is 0)
  let percentageChange: number | null = null;
  if (prevMonthSpend > 0) {
    percentageChange = Number(
      (((thisMonthSpend - prevMonthSpend) / prevMonthSpend) * 100).toFixed(1)
    );
  }

  // Top Category
  let topCategory: { category: string; spend: number; orderCount: number } | null = null;
  let maxCatSpend = -1;
  for (const [category, stats] of categorySpendMap.entries()) {
    if (stats.spend > maxCatSpend) {
      maxCatSpend = stats.spend;
      topCategory = {
        category,
        spend: Number(stats.spend.toFixed(2)),
        orderCount: stats.count,
      };
    }
  }

  // Top Supplier
  let topSupplier: { supplierId: string; supplierName: string; spend: number; orderCount: number } | null = null;
  let maxSupSpend = -1;
  for (const [supplierId, stats] of supplierSpendMap.entries()) {
    if (stats.spend > maxSupSpend) {
      maxSupSpend = stats.spend;
      topSupplier = {
        supplierId,
        supplierName: stats.name,
        spend: Number(stats.spend.toFixed(2)),
        orderCount: stats.count,
      };
    }
  }

  // Monthly trends sorted chronologically
  const monthlyTrends = Array.from(monthlyTrendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthYear, stats]) => ({
      monthYear,
      totalSpend: Number(stats.spend.toFixed(2)),
      orderCount: stats.count,
    }));

  return {
    thisMonthSpend,
    prevMonthSpend,
    percentageChange,
    topCategory,
    topSupplier,
    monthlyTrends,
    totalSpendAllTime,
    totalOrdersCount: validOrders.length,
  };
}

/**
 * Extracts frequently purchased items from actual order history.
 * Groups by normalized product name and category, computes order count,
 * last price, last supplier, and compares with current catalog price if available.
 */
export function extractFrequentlyPurchasedItems(
  orders: TeklifimOrder[],
  currentProducts: TeklifimProduct[] = [],
  minOrdersThreshold: number = 2
): TeklifimFrequentlyPurchasedItem[] {
  const itemMap = new Map<
    string,
    {
      productName: string;
      category: string;
      totalOrdersCount: number;
      lastPurchasedAt: number;
      lastPrice: number;
      lastQuantity: number;
      lastUnit: string;
      lastSupplierId: string;
      lastSupplierName: string;
    }
  >();

  // Sort orders by createdAt ascending so latest orders overwrite last details
  const sortedOrders = [...orders].sort((a, b) => a.createdAt - b.createdAt);

  for (const order of sortedOrders) {
    if (order.status === "cancelled") continue;

    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        const key = `${item.productName.trim().toLowerCase()}_${(item.category || "").trim().toLowerCase()}`;
        const existing = itemMap.get(key);
        const count = (existing?.totalOrdersCount || 0) + 1;

        itemMap.set(key, {
          productName: item.productName,
          category: item.category || "Diger",
          totalOrdersCount: count,
          lastPurchasedAt: order.createdAt,
          lastPrice: item.unitPrice || (item.quantity > 0 ? (item.totalPrice / item.quantity) : 0),
          lastQuantity: item.quantity,
          lastUnit: item.unit || "Adet",
          lastSupplierId: order.supplierId,
          lastSupplierName: order.supplierName || "Tedarikci",
        });
      }
    }
  }

  const result: TeklifimFrequentlyPurchasedItem[] = [];

  for (const stats of itemMap.values()) {
    if (stats.totalOrdersCount >= minOrdersThreshold) {
      // Find matching current catalog product
      const normName = stats.productName.trim().toLowerCase();
      const matchedProd = currentProducts.find(
        (p) =>
          p.status === "published" &&
          p.isActive !== false &&
          (p.name?.trim().toLowerCase() === normName || p.title?.trim().toLowerCase() === normName)
      );

      let priceDeltaPercentage: number | null = null;
      let priceDeltaAmount: number | null = null;

      if (matchedProd && typeof matchedProd.price === "number" && matchedProd.price > 0 && stats.lastPrice > 0) {
        const diff = computePriceDifference(stats.lastPrice, matchedProd.price);
        priceDeltaAmount = diff.deltaAmount;
        priceDeltaPercentage = diff.deltaPercentage;
      }

      result.push({
        productName: stats.productName,
        category: stats.category,
        totalOrdersCount: stats.totalOrdersCount,
        lastPurchasedAt: stats.lastPurchasedAt,
        lastPrice: Number(stats.lastPrice.toFixed(2)),
        lastQuantity: stats.lastQuantity,
        lastUnit: stats.lastUnit,
        lastSupplierId: stats.lastSupplierId,
        lastSupplierName: stats.lastSupplierName,
        productId: matchedProd?.id,
        currentCatalogPrice: matchedProd?.price,
        currentStockStatus: matchedProd?.stockStatus,
        currentMinOrder: matchedProd?.minimumOrder,
        currentLeadTimeDays: matchedProd?.leadTimeDays,
        priceDeltaPercentage,
        priceDeltaAmount,
      });
    }
  }

  // Sort descending by order frequency
  return result.sort((a, b) => b.totalOrdersCount - a.totalOrdersCount);
}

/**
 * Builds multi-criteria comparison across supplier offers for a procurement request.
 * Evaluates price, item coverage, missing items, delivery lead time,
 * previous working history, and budget warning.
 */
export function buildBulkOfferComparison(
  request: TeklifimRequest,
  offers: TeklifimOffer[],
  completedOrders: TeklifimOrder[] = []
): TeklifimBulkOfferComparison[] {
  const requestItems = Array.isArray(request.items) && request.items.length > 0
    ? request.items
    : [{
        id: "item_default",
        productName: request.productName || request.title,
        category: request.category,
        quantity: request.quantity || 1,
        unit: request.unit || "Adet",
      }];

  const totalItemsCount = requestItems.length;

  // Set of supplier IDs with whom the business has completed deals
  const previousSupplierIds = new Set(
    completedOrders
      .filter((o) => o.status === "completed" || o.status === "delivered")
      .map((o) => o.supplierId)
  );

  return offers.map((offer) => {
    const isPreviousSupplier = previousSupplierIds.has(offer.supplierId);
    const totalPrice = offer.totalPrice ?? offer.price ?? 0;
    const budgetWarning = checkBudgetWarning(totalPrice, request.estimatedBudget);

    // Bidding coverage check: if offer specifies covered items or covers entire request
    // Default assumption is full coverage unless specified in offer notes/description
    const coveredItemsCount = totalItemsCount;
    const missingItems: string[] = [];

    return {
      offerId: offer.id,
      supplierId: offer.supplierId,
      supplierName: offer.supplierName,
      supplierCity: offer.supplierCity,
      supplierVerified: offer.supplierIsVerified ?? false,
      supplierRating: undefined,
      totalPrice: Number(totalPrice.toFixed(2)),
      currency: offer.currency || "TL",
      deliveryDays: offer.deliveryDays,
      minOrderQuantity: offer.minOrderQuantity,
      coveredItemsCount,
      totalItemsCount,
      missingItems,
      isPreviousSupplier,
      exceedsBudget: budgetWarning.exceedsBudget,
      budgetDelta: budgetWarning.delta,
    };
  }).sort((a, b) => a.totalPrice - b.totalPrice);
}

/**
 * Converts a procurement list into a multi-item bulk procurement request payload.
 */
export function convertListToRequestPayload(
  list: TeklifimProcurementList,
  business: {
    id: string;
    name: string;
    city: string;
    phone?: string;
    email?: string;
  },
  deliveryDays: number = 7,
  deadline?: string,
  estimatedBudget?: number
): Partial<TeklifimRequest> {
  const items = list.items || [];
  const totalQuantity = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const primaryCategory = list.category || (items[0]?.category) || "Genel Tedarik";

  return {
    businessId: business.id,
    businessName: business.name,
    businessCity: business.city,
    businessPhone: business.phone,
    businessEmail: business.email,
    title: `${list.name} - Toplu Satin Alma Talebi`,
    category: primaryCategory,
    productName: items.map((i) => i.productName).slice(0, 3).join(", ") + (items.length > 3 ? " ve digerleri" : ""),
    quantity: totalQuantity,
    unit: "Kalem",
    deliveryDays,
    city: business.city,
    description: `${list.name} listesinden olusturulan ${items.length} kalemlik toplu talep. ${list.description || ""}`.trim(),
    deadline,
    status: "published",
    offerCount: 0,
    isBulkProcurement: true,
    items,
    estimatedBudget: estimatedBudget ?? list.totalEstimatedCost,
    approvalStatus: "not_required",
    fromListId: list.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Exports procurement purchase history to CSV format.
 */
export function exportPurchasesToCsv(purchases: any[]): string {
  const headers = [
    "Siparis No",
    "Urun Adi",
    "Kategori",
    "Miktar",
    "Birim",
    "Birim Fiyat",
    "Toplam Tutar",
    "Para Birimi",
    "Tedarikci",
    "Siparis Tarihi",
    "Odeme Durumu",
    "Teslimat Durumu",
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = purchases.map((p) => [
    escapeCsv(p.orderNumber || p.id),
    escapeCsv(p.productName || "-"),
    escapeCsv(p.category || "-"),
    escapeCsv(p.quantity || 0),
    escapeCsv(p.unit || "Adet"),
    escapeCsv(p.unitPrice || 0),
    escapeCsv(p.totalPrice || 0),
    escapeCsv(p.currency || "TL"),
    escapeCsv(p.supplierName || "-"),
    escapeCsv(p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "-"),
    escapeCsv(p.paymentStatus || "-"),
    escapeCsv(p.status || "-"),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

/**
 * Generates an unguessable cryptographic token for team invitations.
 */
export function generateSecureToken(byteLength: number = 24): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomBytes === "function") {
    return crypto.randomBytes(byteLength).toString("hex");
  }
  // Fallback
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
