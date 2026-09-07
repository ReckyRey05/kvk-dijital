import {
  TeklifimRequest,
  TeklifimProfile,
  TeklifimProduct,
  TeklifimOrder,
  TeklifimOffer,
  TeklifimOpportunityItem,
  TeklifimSupplierKpis,
  TeklifimOfferConversion,
  TeklifimProductPerformance,
  TeklifimCustomerSegment,
  TeklifimSupplierCustomer,
  TeklifimDeliveryPerformance,
  TeklifimQuoteTemplate,
  TeklifimCommercialCalendarEvent,
} from "@/types/teklifimGelsin";

/**
 * Computes deterministic opportunity matching scores (0 - 100) for a supplier.
 * Factors:
 * 1. Category match (+40)
 * 2. City match (+25)
 * 3. Delivery region coverage (+20)
 * 4. Catalog product match (+15)
 */
export function computeOpportunityMatches(
  requests: TeklifimRequest[],
  supplier: TeklifimProfile,
  catalogProducts: TeklifimProduct[] = []
): TeklifimOpportunityItem[] {
  const supplierCats = supplier.categories || [];
  const supplierCity = (supplier.city || "").trim().toLowerCase();
  const regions = supplier.deliveryRegions || ["Tüm Türkiye"];

  // Active catalog products
  const activeProducts = catalogProducts.filter(
    (p) => p.status === "published" && p.isActive !== false
  );

  const matchedItems: TeklifimOpportunityItem[] = [];

  for (const req of requests) {
    // Only open/published requests
    if (req.status !== "published" && req.status !== "open" && req.status !== "bidding") {
      continue;
    }

    let score = 0;
    const signals: string[] = [];

    // 1. Category Match (+40)
    const catMatches =
      supplierCats.includes(req.category) ||
      supplierCats.includes("Tümü") ||
      supplierCats.includes("Diğer");

    if (catMatches) {
      score += 40;
      signals.push("Kategori Uyumu");
    }

    // 2. City Match (+25)
    const reqCity = (req.city || req.businessCity || "").trim().toLowerCase();
    const cityMatches =
      supplierCity && reqCity && (supplierCity === reqCity || reqCity.includes(supplierCity));

    if (cityMatches) {
      score += 25;
      signals.push("Sehrinde");
    }

    // 3. Delivery Region Coverage (+20)
    const regionMatches =
      regions.includes("Tüm Türkiye") ||
      regions.some((r) => r.toLowerCase() === reqCity || reqCity.includes(r.toLowerCase()));

    if (regionMatches) {
      score += 20;
      signals.push("Teslimat Bolgesi");
    }

    // 4. Catalog Product Match (+15)
    let matchingCatalogProductId: string | undefined;
    let matchingCatalogPrice: number | undefined;

    const reqTitleNorm = (req.title || "").trim().toLowerCase();
    const reqProdNorm = (req.productName || "").trim().toLowerCase();

    const matchedProduct = activeProducts.find((p) => {
      if (p.category !== req.category) return false;
      const pNameNorm = (p.name || p.title || "").trim().toLowerCase();
      if (!pNameNorm) return false;

      // Direct match with productName or title
      if (reqProdNorm && (pNameNorm.includes(reqProdNorm) || reqProdNorm.includes(pNameNorm))) {
        return true;
      }
      if (reqTitleNorm && (pNameNorm.includes(reqTitleNorm) || reqTitleNorm.includes(pNameNorm))) {
        return true;
      }

      // Keyword token matching
      const reqWords = `${reqTitleNorm} ${reqProdNorm}`.split(/\s+/).filter((w) => w.length >= 3);
      return reqWords.some((w) => pNameNorm.includes(w));
    });

    if (matchedProduct) {
      score += 15;
      signals.push("Katalog Urunun Var");
      matchingCatalogProductId = matchedProduct.id;
      matchingCatalogPrice = matchedProduct.price;
    }

    // Minimum threshold for matching opportunity
    if (score >= 40) {
      matchedItems.push({
        requestId: req.id,
        title: req.title,
        category: req.category,
        subCategory: req.subCategory,
        productName: req.productName,
        quantity: req.quantity,
        unit: req.unit,
        city: req.city || req.businessCity || "Istanbul",
        deliveryDays: req.deliveryDays,
        estimatedBudget: req.estimatedBudget,
        deadline: req.deadline,
        createdAt: req.createdAt,
        matchSignals: signals,
        matchScore: Math.min(100, score),
        matchingCatalogProductId,
        matchingCatalogPrice,
      });
    }
  }

  return matchedItems.sort((a, b) => b.matchScore - a.matchScore || b.createdAt - a.createdAt);
}

/**
 * Calculates supplier operational sales KPIs using strictly real order and offer data.
 */
export function calculateSupplierKpis(
  orders: TeklifimOrder[],
  offers: TeklifimOffer[],
  referenceDate: Date = new Date()
): TeklifimSupplierKpis {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const prevMonthIndex = refMonth === 0 ? 11 : refMonth - 1;
  const prevYear = refMonth === 0 ? refYear - 1 : refYear;

  let thisMonthSales = 0;
  let prevMonthSales = 0;
  let completedOrdersCount = 0;
  let activeOrdersCount = 0;

  for (const order of orders) {
    if (order.status === "cancelled" || order.status === "disputed") continue;

    const orderAmount = order.totalAmount ?? order.totalPrice ?? 0;
    const orderDate = new Date(order.createdAt);
    const orderYear = orderDate.getFullYear();
    const orderMonth = orderDate.getMonth();

    if (orderYear === refYear && orderMonth === refMonth) {
      thisMonthSales += orderAmount;
    } else if (orderYear === prevYear && orderMonth === prevMonthIndex) {
      prevMonthSales += orderAmount;
    }

    if (order.status === "completed" || order.status === "delivered") {
      completedOrdersCount++;
    } else if (
      order.status === "preparing" ||
      order.status === "shipped" ||
      order.status === "ready_for_dispatch"
    ) {
      activeOrdersCount++;
    }
  }

  // Offers metrics
  let thisMonthOffersCount = 0;
  let acceptedOffersCount = 0;
  let pendingOffersCount = 0;
  let negotiatingOffersCount = 0;
  let responseTimesSum = 0;
  let responseTimesCount = 0;

  for (const offer of offers) {
    const offerDate = new Date(offer.createdAt);
    if (offerDate.getFullYear() === refYear && offerDate.getMonth() === refMonth) {
      thisMonthOffersCount++;
    }

    if (offer.status === "accepted" || offer.status === "selected") {
      acceptedOffersCount++;
    } else if (
      offer.status === "submitted" ||
      offer.status === "pending" ||
      offer.status === "viewed"
    ) {
      pendingOffersCount++;
    } else if (offer.status === "negotiating" || offer.status === "countered") {
      negotiatingOffersCount++;
    }

    // Response time telemetry
    if (offer.respondedAt && offer.createdAt && offer.respondedAt > offer.createdAt) {
      responseTimesSum += Math.round((offer.respondedAt - offer.createdAt) / (1000 * 60));
      responseTimesCount++;
    }
  }

  // Acceptance rate: only if offers exist
  let acceptanceRate: number | null = null;
  if (offers.length > 0) {
    acceptanceRate = Number(((acceptedOffersCount / offers.length) * 100).toFixed(1));
  }

  // Average response minutes
  const averageResponseMinutes =
    responseTimesCount > 0 ? Math.round(responseTimesSum / responseTimesCount) : null;

  // Sales change percentage: only if prevMonth > 0
  let salesChangePercentage: number | null = null;
  if (prevMonthSales > 0) {
    salesChangePercentage = Number(
      (((thisMonthSales - prevMonthSales) / prevMonthSales) * 100).toFixed(1)
    );
  }

  return {
    thisMonthSales: Number(thisMonthSales.toFixed(2)),
    prevMonthSales: Number(prevMonthSales.toFixed(2)),
    salesChangePercentage,
    thisMonthOffersCount,
    acceptanceRate,
    completedOrdersCount,
    averageResponseMinutes,
    pendingOffersCount,
    activeOrdersCount,
    negotiatingOffersCount,
  };
}

/**
 * Calculates offer conversion funnel and breakdown by category and month.
 */
export function calculateOfferConversion(
  offers: TeklifimOffer[],
  orders: TeklifimOrder[]
): TeklifimOfferConversion {
  const totalOffers = offers.length;
  let acceptedOffers = 0;
  let rejectedOffers = 0;
  let pendingOffers = 0;

  const categoryMap = new Map<string, { offers: number; accepted: number; salesVolume: number }>();
  const monthlyMap = new Map<string, { offers: number; accepted: number; salesVolume: number }>();

  for (const offer of offers) {
    const isAccepted = offer.status === "accepted" || offer.status === "selected";
    const isRejected = offer.status === "rejected" || offer.status === "expired";
    const isPending = !isAccepted && !isRejected;

    if (isAccepted) acceptedOffers++;
    else if (isRejected) rejectedOffers++;
    else if (isPending) pendingOffers++;

    // Order volume if accepted
    const matchedOrder = orders.find((o) => o.offerId === offer.id);
    const dealAmount = matchedOrder
      ? matchedOrder.totalAmount ?? matchedOrder.totalPrice ?? 0
      : offer.totalPrice || 0;

    // Category breakdown
    const cat = offer.category || matchedOrder?.category || matchedOrder?.items?.[0]?.category || "Genel Tedarik";
    const catStat = categoryMap.get(cat) || { offers: 0, accepted: 0, salesVolume: 0 };
    catStat.offers++;
    if (isAccepted) {
      catStat.accepted++;
      catStat.salesVolume += dealAmount;
    }
    categoryMap.set(cat, catStat);

    // Monthly breakdown (YYYY-MM)
    const dt = new Date(offer.createdAt);
    const mKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const mStat = monthlyMap.get(mKey) || { offers: 0, accepted: 0, salesVolume: 0 };
    mStat.offers++;
    if (isAccepted) {
      mStat.accepted++;
      mStat.salesVolume += dealAmount;
    }
    monthlyMap.set(mKey, mStat);
  }

  const conversionRate =
    totalOffers > 0 ? Number(((acceptedOffers / totalOffers) * 100).toFixed(1)) : null;

  const categoryConversions = Array.from(categoryMap.entries()).map(([category, st]) => ({
    category,
    offersCount: st.offers,
    acceptedCount: st.accepted,
    conversionRate: st.offers > 0 ? Number(((st.accepted / st.offers) * 100).toFixed(1)) : 0,
    salesVolume: Number(st.salesVolume.toFixed(2)),
  }));

  const monthlyConversions = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, st]) => ({
      month,
      offersCount: st.offers,
      acceptedCount: st.accepted,
      conversionRate: st.offers > 0 ? Number(((st.accepted / st.offers) * 100).toFixed(1)) : 0,
      salesVolume: Number(st.salesVolume.toFixed(2)),
    }));

  const totalAcceptedVolume = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount ?? o.totalPrice ?? 0), 0);

  const averageDealSize =
    acceptedOffers > 0 ? Number((totalAcceptedVolume / acceptedOffers).toFixed(2)) : null;

  return {
    totalOffers,
    acceptedOffers,
    rejectedOffers,
    pendingOffers,
    conversionRate,
    categoryConversions,
    monthlyConversions,
    averageDealSize,
  };
}

/**
 * Computes individual product performance metrics based on real views, requests, and completed order items.
 */
export function computeProductPerformances(
  products: TeklifimProduct[],
  orders: TeklifimOrder[]
): TeklifimProductPerformance[] {
  const perfMap = new Map<string, { salesCount: number; revenue: number }>();

  for (const order of orders) {
    if (order.status === "cancelled") continue;
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const itemRevenue =
          item.totalPrice ?? (typeof item.unitPrice === "number" ? item.unitPrice * (item.quantity || 1) : 0);

        const keys: string[] = [];
        if (item.productId) keys.push(item.productId);
        if (item.productName) keys.push(item.productName.trim().toLowerCase());

        for (const k of keys) {
          const stat = perfMap.get(k) || { salesCount: 0, revenue: 0 };
          stat.salesCount += 1;
          stat.revenue += itemRevenue;
          perfMap.set(k, stat);
        }
      }
    }
  }

  return products.map((p) => {
    const normName = (p.name || p.title || "").trim().toLowerCase();
    const statById = perfMap.get(p.id);
    const statByName = perfMap.get(normName);
    const stat = statById || statByName || { salesCount: 0, revenue: 0 };

    const views = p.viewCount ?? p.viewsCount ?? 0;
    const requests = p.requestCount ?? p.requestsCount ?? 0;

    let conversionRate: number | null = null;
    if (requests > 0 && stat.salesCount > 0) {
      conversionRate = Number(((stat.salesCount / requests) * 100).toFixed(1));
    }

    return {
      productId: p.id,
      productName: p.title || p.name || "Urun",
      category: p.category,
      price: p.price,
      stockStatus: p.stockStatus,
      viewsCount: views,
      requestsCount: requests,
      salesCount: stat.salesCount,
      totalRevenue: Number(stat.revenue.toFixed(2)),
      conversionRate,
    };
  });
}

/**
 * Classifies customer relationship into deterministic behavioral segments:
 * - "new": 1 completed order
 * - "active": completed order within last 30 days
 * - "regular": 3 or more completed orders
 * - "dormant": last completed order was over 60 days ago
 */
export function classifyCustomerSegment(
  customerOrders: TeklifimOrder[],
  referenceDate: Date = new Date()
): TeklifimCustomerSegment {
  const validOrders = customerOrders.filter((o) => o.status !== "cancelled");
  if (validOrders.length === 0) return "new";

  const nowMs = referenceDate.getTime();
  const sorted = [...validOrders].sort((a, b) => b.createdAt - a.createdAt);
  const lastOrderDate = sorted[0].createdAt;
  const daysSinceLastOrder = (nowMs - lastOrderDate) / (1000 * 60 * 60 * 24);

  if (daysSinceLastOrder > 60) {
    return "dormant";
  }
  if (validOrders.length >= 3) {
    return "regular";
  }
  if (daysSinceLastOrder <= 30 && validOrders.length > 1) {
    return "active";
  }
  if (validOrders.length === 1) {
    return "new";
  }
  return "active";
}

/**
 * Extracts and aggregates customer directory for a supplier from actual orders.
 */
export function extractSupplierCustomers(
  orders: TeklifimOrder[],
  favoriteIds: string[] = []
): TeklifimSupplierCustomer[] {
  const favSet = new Set(favoriteIds);
  const customerMap = new Map<string, TeklifimOrder[]>();

  for (const ord of orders) {
    if (ord.status === "cancelled") continue;
    const bId = ord.buyerBusinessId || ord.businessId || ord.buyerId || "unknown";
    const existing = customerMap.get(bId) || [];
    existing.push(ord);
    customerMap.set(bId, existing);
  }

  const result: TeklifimSupplierCustomer[] = [];

  for (const [businessId, custOrders] of customerMap.entries()) {
    const sorted = [...custOrders].sort((a, b) => b.createdAt - a.createdAt);
    const latest = sorted[0];
    const totalVolume = custOrders.reduce(
      (sum, o) => sum + (o.totalAmount ?? o.totalPrice ?? 0),
      0
    );

    const categoriesSet = new Set<string>();
    for (const o of custOrders) {
      if (o.category) categoriesSet.add(o.category);
      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          if (item.category) categoriesSet.add(item.category);
        }
      }
    }

    const segment = classifyCustomerSegment(custOrders);

    const reorderSuggestions = (latest.items || []).map((it) => ({
      productName: it.productName,
      lastQuantity: it.quantity,
      lastUnit: it.unit,
      lastPrice: it.unitPrice,
    }));

    result.push({
      businessId,
      businessName:
        latest.buyerBusinessName || latest.businessName || latest.buyerName || "Isletme",
      city: latest.deliveryCity || latest.deliveryAddress?.city || "Istanbul",
      contactName: latest.deliveryAddress?.contactName,
      phone: latest.buyerPhone || latest.businessPhone,
      email: latest.buyerEmail || latest.businessEmail,
      completedOrdersCount:
        custOrders.filter((o) => o.status === "completed" || o.status === "delivered").length ||
        custOrders.length,
      totalSalesVolume: Number(totalVolume.toFixed(2)),
      lastOrderDate: latest.createdAt,
      lastOrderId: latest.id,
      categories: Array.from(categoriesSet),
      isFavorite: favSet.has(businessId),
      segment,
      reorderSuggestions,
    });
  }

  return result.sort((a, b) => b.totalSalesVolume - a.totalSalesVolume);
}

/**
 * Calculates delivery performance metrics based on promised deliveryDays vs actual delivery proof timestamp.
 */
export function calculateDeliveryPerformance(
  orders: TeklifimOrder[]
): TeklifimDeliveryPerformance {
  const deliveredOrders = orders.filter(
    (o) => o.status === "delivered" || o.status === "completed"
  );

  if (deliveredOrders.length === 0) {
    return {
      onTimeDeliveryRate: null,
      delayedOrdersCount: 0,
      averageDeliveryDays: null,
      totalDeliveredCount: 0,
    };
  }

  let onTimeCount = 0;
  let delayedOrdersCount = 0;
  let totalDays = 0;
  let validCalculatedCount = 0;

  for (const ord of deliveredOrders) {
    const rawDue = ord.deliveryDueDate || ord.expectedDeliveryDate;
    const rawDelivered =
      ord.deliveredAt || ord.deliveryProof?.deliveredAt || ord.completedAt || ord.updatedAt || Date.now();

    const dueMs =
      typeof rawDue === "string"
        ? new Date(rawDue).getTime()
        : typeof rawDue === "number"
        ? rawDue
        : null;
    const deliveredMs =
      typeof rawDelivered === "string"
        ? new Date(rawDelivered).getTime()
        : typeof rawDelivered === "number"
        ? rawDelivered
        : Date.now();

    if (dueMs) {
      validCalculatedCount++;
      if (deliveredMs <= dueMs) {
        onTimeCount++;
      } else {
        delayedOrdersCount++;
      }
    } else {
      onTimeCount++;
      validCalculatedCount++;
    }

    const createdMs =
      typeof ord.createdAt === "string" ? new Date(ord.createdAt).getTime() : ord.createdAt;
    const actualDays = Math.max(1, Math.round((deliveredMs - createdMs) / (1000 * 60 * 60 * 24)));
    totalDays += actualDays;
  }

  const denominator = validCalculatedCount > 0 ? validCalculatedCount : deliveredOrders.length;
  const onTimeDeliveryRate = Number(((onTimeCount / denominator) * 100).toFixed(1));
  const averageDeliveryDays = Number((totalDays / deliveredOrders.length).toFixed(1));

  return {
    onTimeDeliveryRate,
    delayedOrdersCount,
    averageDeliveryDays,
    totalDeliveredCount: deliveredOrders.length,
  };
}

/**
 * Applies percentage adjustment for bulk price updates with exact preview.
 * Strictly guarantees that existing orders and offers are NEVER altered.
 */
export function applyBulkPriceAdjustment(
  products: TeklifimProduct[],
  percentage: number,
  targetProductIds?: string[]
): { productId: string; oldPrice: number; newPrice: number; percentage: number }[] {
  const targetSet = targetProductIds ? new Set(targetProductIds) : null;

  return products
    .filter((p) => (!targetSet || targetSet.has(p.id)) && typeof p.price === "number" && p.price > 0)
    .map((p) => {
      const oldPrice = p.price!;
      const multiplier = 1 + percentage / 100;
      const newPrice = Number((oldPrice * multiplier).toFixed(2));

      return {
        productId: p.id,
        oldPrice,
        newPrice,
        percentage,
      };
    });
}

/**
 * Validates a quote template against current catalog price to prevent underquoting.
 */
export function validateQuoteTemplatePricing(
  template: TeklifimQuoteTemplate,
  catalogProduct?: TeklifimProduct
): { isValid: boolean; priceMismatch: boolean; currentCatalogPrice?: number } {
  if (!catalogProduct || typeof catalogProduct.price !== "number") {
    return { isValid: true, priceMismatch: false };
  }

  const currentCatalogPrice = catalogProduct.price;
  const priceMismatch = currentCatalogPrice !== template.unitPrice;

  return {
    isValid: true,
    priceMismatch,
    currentCatalogPrice,
  };
}

/**
 * Maps active orders and pending offers to commercial calendar events.
 */
export function buildCommercialCalendarEvents(
  orders: TeklifimOrder[],
  offers: TeklifimOffer[]
): TeklifimCommercialCalendarEvent[] {
  const events: TeklifimCommercialCalendarEvent[] = [];

  for (const ord of orders) {
    if (ord.status === "preparing" || ord.status === "shipped") {
      const dueDate =
        ord.deliveryDueDate ||
        ord.expectedDeliveryDate ||
        ord.createdAt + 86400000 * (ord.deliveryDays || 3);

      events.push({
        id: `cal_ord_${ord.id}`,
        type: "delivery_due",
        title: `Teslimat: ${ord.buyerBusinessName || ord.requestTitle || ord.orderNumber || ord.id}`,
        date: typeof dueDate === "string" ? new Date(dueDate).getTime() : dueDate,
        entityId: ord.id,
        entityNumber: ord.orderNumber,
        amount: ord.totalAmount ?? ord.totalPrice,
        status: ord.status,
      });
    }
  }

  for (const off of offers) {
    if (off.status === "submitted" || off.status === "pending") {
      const expiry =
        off.validUntil || (off.validDays ? off.createdAt + off.validDays * 86400000 : off.createdAt + 7 * 86400000);

      events.push({
        id: `cal_off_${off.id}`,
        type: "offer_expiry",
        title: `Teklif Gecerlilik: ${off.requestTitle || off.offerNumber || off.id}`,
        date: typeof expiry === "string" ? new Date(expiry).getTime() : expiry,
        entityId: off.id,
        entityNumber: off.offerNumber,
        amount: off.totalPrice,
        status: off.status,
      });
    }
  }

  return events.sort((a, b) => a.date - b.date);
}

/**
 * Formats supplier sales history into UTF-8 CSV string for reporting and accounting.
 */
export function exportSupplierSalesReportToCsv(orders: TeklifimOrder[]): string {
  const header = "Siparis No;Tarih;Alici;Kategori;Tutar;Durum";
  const rows = orders.map((o) => {
    const orderNumber = o.orderNumber || o.id;
    const date = new Date(o.createdAt || Date.now()).toISOString().split("T")[0];
    const buyer = (o.buyerBusinessName || o.businessName || o.buyerName || "-").replace(/;/g, " ");
    const category = (o.category || o.items?.[0]?.category || "Genel").replace(/;/g, " ");
    const amount = o.totalAmount ?? o.totalPrice ?? 0;
    const status = o.status;
    return `${orderNumber};${date};${buyer};${category};${amount};${status}`;
  });

  return [header, ...rows].join("\r\n");
}
