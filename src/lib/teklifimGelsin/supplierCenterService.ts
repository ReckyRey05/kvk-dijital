import { getAdminDb } from "@/lib/firebase/admin";
import { verifyTeklifimUser, TeklifimAuthUser } from "./teklifimAuth";
import {
  TeklifimOrder,
  TeklifimOffer,
  TeklifimProduct,
  TeklifimRequest,
  TeklifimProfile,
  TeklifimQuoteTemplate,
  TeklifimPriceList,
  TeklifimSupplierAvailability,
  TeklifimOpportunityItem,
  TeklifimSupplierCustomer,
} from "@/types/teklifimGelsin";
import {
  computeOpportunityMatches,
  calculateSupplierKpis,
  calculateOfferConversion,
  computeProductPerformances,
  extractSupplierCustomers,
  calculateDeliveryPerformance,
  applyBulkPriceAdjustment,
  buildCommercialCalendarEvents,
  exportSupplierSalesReportToCsv,
} from "./supplierCenterUtils";

function getDb() {
  return getAdminDb();
}

/**
 * Verifies that the requester is an authorized supplier or corporate admin.
 */
export async function verifySupplierAccess(req: Request): Promise<{
  error: string | null;
  status: number;
  user: TeklifimAuthUser | null;
  profile?: TeklifimProfile | null;
}> {
  const user = await verifyTeklifimUser(req);
  if (!user) {
    return { error: "Yetkisiz erisim. Lutfen giris yapin.", status: 401, user: null };
  }

  const db = getDb();
  const profDoc = await db.collection("teklifim_profiles").doc(user.uid).get();
  const profile = profDoc.exists ? (profDoc.data() as TeklifimProfile) : null;

  // Allow supplier or admin
  const isSupplier = profile?.role === "supplier" || user.role === "supplier" || user.role === "admin";
  if (!isSupplier) {
    return {
      error: "Bu alana yalnizca tedarikciler erisebilir.",
      status: 403,
      user,
      profile,
    };
  }

  return { error: null, status: 200, user, profile };
}

/**
 * Fetches dashboard overview for a supplier.
 */
export async function getSupplierDashboardOverview(supplierId: string) {
  const db = getDb();

  // 1. Fetch supplier profile
  const profileDoc = await db.collection("teklifim_profiles").doc(supplierId).get();
  const profile = (profileDoc.exists ? profileDoc.data() : { id: supplierId, role: "supplier" }) as TeklifimProfile;

  // 2. Fetch supplier orders
  const ordersSnap = await db
    .collection("teklifim_orders")
    .where("supplierId", "==", supplierId)
    .get();
  const orders: TeklifimOrder[] = [];
  ordersSnap.forEach((doc) => orders.push(doc.data() as TeklifimOrder));

  // 3. Fetch supplier offers
  const offersSnap = await db
    .collection("teklifim_offers")
    .where("supplierId", "==", supplierId)
    .get();
  const offers: TeklifimOffer[] = [];
  offersSnap.forEach((doc) => offers.push(doc.data() as TeklifimOffer));

  // 4. Fetch catalog products
  const productsSnap = await db
    .collection("teklifim_products")
    .where("supplierId", "==", supplierId)
    .get();
  const products: TeklifimProduct[] = [];
  productsSnap.forEach((doc) => products.push(doc.data() as TeklifimProduct));

  // 5. Fetch active requests for opportunity matching
  const requestsSnap = await db.collection("teklifim_requests").get();
  const requests: TeklifimRequest[] = [];
  requestsSnap.forEach((doc) => {
    const data = doc.data() as TeklifimRequest;
    if (data.status === "open" || data.status === "published" || data.status === "bidding") {
      requests.push(data);
    }
  });

  // Calculate metrics
  const kpis = calculateSupplierKpis(orders, offers);
  const conversion = calculateOfferConversion(offers, orders);
  const opportunities = computeOpportunityMatches(requests, profile, products);
  const productPerformances = computeProductPerformances(products, orders);
  const delivery = calculateDeliveryPerformance(orders);
  const calendarEvents = buildCommercialCalendarEvents(orders, offers);

  // Stock alerts
  const stockAlerts = products.filter((p) => {
    if (p.stockStatus === "out_of_stock") return true;
    if (p.stockStatus === "low_stock") return true;
    if (typeof p.stockCount === "number") {
      const threshold = p.lowStockThreshold || 5;
      return p.stockCount <= threshold;
    }
    return false;
  });

  // Today dispatch count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayDispatches = orders.filter((o) => {
    if (o.status === "preparing" || o.status === "shipped") {
      if (o.deliveryDueDate) {
        const d = new Date(o.deliveryDueDate).getTime();
        return d >= todayStart.getTime() && d <= todayEnd.getTime();
      }
      return true;
    }
    return false;
  });

  // Today actions strip
  const todayActions = {
    newOpportunitiesCount: opportunities.length,
    pendingOffersCount: kpis.pendingOffersCount,
    negotiatingOffersCount: kpis.negotiatingOffersCount,
    activeOrdersCount: kpis.activeOrdersCount,
    thisMonthSales: kpis.thisMonthSales,
    todayDispatchCount: todayDispatches.length,
  };

  const availability: TeklifimSupplierAvailability = profile.availability || {
    isOnline: true,
    isAcceptingOrders: true,
    vacationMode: false,
  };

  return {
    supplier: {
      id: profile.id,
      companyName: profile.companyName,
      city: profile.city,
      rating: profile.rating,
      verified: profile.verified,
    },
    todayActions,
    kpis,
    conversion,
    opportunities: opportunities.slice(0, 10),
    topProducts: productPerformances.slice(0, 5),
    stockAlerts: stockAlerts.slice(0, 10),
    delivery,
    calendarEvents: calendarEvents.slice(0, 15),
    availability,
  };
}

/**
 * Gets open matched opportunities for a supplier.
 */
export async function getSupplierOpportunities(supplierId: string): Promise<TeklifimOpportunityItem[]> {
  const db = getDb();

  const profileDoc = await db.collection("teklifim_profiles").doc(supplierId).get();
  const profile = (profileDoc.exists ? profileDoc.data() : { id: supplierId }) as TeklifimProfile;

  const productsSnap = await db
    .collection("teklifim_products")
    .where("supplierId", "==", supplierId)
    .get();
  const products: TeklifimProduct[] = [];
  productsSnap.forEach((doc) => products.push(doc.data() as TeklifimProduct));

  const requestsSnap = await db.collection("teklifim_requests").get();
  const requests: TeklifimRequest[] = [];
  requestsSnap.forEach((doc) => {
    const data = doc.data() as TeklifimRequest;
    if (data.status === "open" || data.status === "published" || data.status === "bidding") {
      requests.push(data);
    }
  });

  return computeOpportunityMatches(requests, profile, products);
}

/**
 * Gets customer directory and history for a supplier.
 */
export async function getSupplierCustomers(supplierId: string): Promise<TeklifimSupplierCustomer[]> {
  const db = getDb();

  const profileDoc = await db.collection("teklifim_profiles").doc(supplierId).get();
  const profile = (profileDoc.exists ? profileDoc.data() : {}) as TeklifimProfile;
  const favoriteIds = profile.favoriteCustomerIds || [];

  const ordersSnap = await db
    .collection("teklifim_orders")
    .where("supplierId", "==", supplierId)
    .get();
  const orders: TeklifimOrder[] = [];
  ordersSnap.forEach((doc) => orders.push(doc.data() as TeklifimOrder));

  return extractSupplierCustomers(orders, favoriteIds);
}

/**
 * Toggles a customer as favorite for a supplier.
 */
export async function toggleFavoriteCustomer(supplierId: string, customerId: string): Promise<boolean> {
  const db = getDb();
  const ref = db.collection("teklifim_profiles").doc(supplierId);
  const snap = await ref.get();

  let favorites: string[] = [];
  if (snap.exists) {
    const data = snap.data() as TeklifimProfile;
    favorites = data.favoriteCustomerIds || [];
  }

  let isFavoriteNow = false;
  if (favorites.includes(customerId)) {
    favorites = favorites.filter((id) => id !== customerId);
    isFavoriteNow = false;
  } else {
    favorites.push(customerId);
    isFavoriteNow = true;
  }

  await ref.set(
    {
      favoriteCustomerIds: favorites,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  return isFavoriteNow;
}

/**
 * Quote Templates CRUD
 */
export async function getQuoteTemplates(supplierId: string): Promise<TeklifimQuoteTemplate[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_quote_templates")
    .where("supplierId", "==", supplierId)
    .get();

  const list: TeklifimQuoteTemplate[] = [];
  snap.forEach((d) => list.push(d.data() as TeklifimQuoteTemplate));
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createQuoteTemplate(
  supplierId: string,
  data: Partial<TeklifimQuoteTemplate>
): Promise<TeklifimQuoteTemplate> {
  const db = getDb();
  const docRef = db.collection("teklifim_quote_templates").doc();

  if (!data.title || !data.category || typeof data.unitPrice !== "number") {
    throw new Error("Eksik sablon alanlari: title, category ve unitPrice zorunludur.");
  }

  const now = Date.now();
  const template: TeklifimQuoteTemplate = {
    id: docRef.id,
    supplierId,
    title: data.title.trim(),
    category: data.category.trim(),
    subCategory: data.subCategory?.trim(),
    productId: data.productId,
    productName: data.productName,
    unitPrice: data.unitPrice,
    deliveryDays: data.deliveryDays || 3,
    minOrderQuantity: data.minOrderQuantity || 1,
    description: data.description?.trim() || "",
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(template);
  return template;
}

export async function updateQuoteTemplate(
  templateId: string,
  supplierId: string,
  data: Partial<TeklifimQuoteTemplate>
): Promise<void> {
  const db = getDb();
  const docRef = db.collection("teklifim_quote_templates").doc(templateId);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new Error("Sablon bulunamadi.");
  }

  const existing = snap.data() as TeklifimQuoteTemplate;
  if (existing.supplierId !== supplierId) {
    throw new Error("Bu sablonu guncelleme yetkiniz yok.");
  }

  const updates: Partial<TeklifimQuoteTemplate> = {
    ...data,
    updatedAt: Date.now(),
  };
  delete updates.id;
  delete updates.supplierId;

  await docRef.update(updates);
}

export async function deleteQuoteTemplate(templateId: string, supplierId: string): Promise<void> {
  const db = getDb();
  const docRef = db.collection("teklifim_quote_templates").doc(templateId);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new Error("Sablon bulunamadi.");
  }

  const existing = snap.data() as TeklifimQuoteTemplate;
  if (existing.supplierId !== supplierId) {
    throw new Error("Bu sablonu silme yetkiniz yok.");
  }

  await docRef.delete();
}

/**
 * Price Lists CRUD
 */
export async function getPriceLists(supplierId: string): Promise<TeklifimPriceList[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_price_lists")
    .where("supplierId", "==", supplierId)
    .get();

  const list: TeklifimPriceList[] = [];
  snap.forEach((d) => list.push(d.data() as TeklifimPriceList));
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createPriceList(
  supplierId: string,
  data: Partial<TeklifimPriceList>
): Promise<TeklifimPriceList> {
  const db = getDb();
  const docRef = db.collection("teklifim_price_lists").doc();

  if (!data.name) {
    throw new Error("Fiyat listesi adi zorunludur.");
  }

  const now = Date.now();
  const priceList: TeklifimPriceList = {
    id: docRef.id,
    supplierId,
    name: data.name.trim(),
    description: data.description?.trim(),
    discountPercentage: data.discountPercentage || 0,
    productOverrides: data.productOverrides || {},
    targetCustomerIds: data.targetCustomerIds || [],
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(priceList);
  return priceList;
}

export async function updatePriceList(
  listId: string,
  supplierId: string,
  data: Partial<TeklifimPriceList>
): Promise<void> {
  const db = getDb();
  const docRef = db.collection("teklifim_price_lists").doc(listId);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new Error("Fiyat listesi bulunamadi.");
  }

  const existing = snap.data() as TeklifimPriceList;
  if (existing.supplierId !== supplierId) {
    throw new Error("Bu fiyat listesini guncelleme yetkiniz yok.");
  }

  const updates: Partial<TeklifimPriceList> = {
    ...data,
    updatedAt: Date.now(),
  };
  delete updates.id;
  delete updates.supplierId;

  await docRef.update(updates);
}

export async function deletePriceList(listId: string, supplierId: string): Promise<void> {
  const db = getDb();
  const docRef = db.collection("teklifim_price_lists").doc(listId);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new Error("Fiyat listesi bulunamadi.");
  }

  const existing = snap.data() as TeklifimPriceList;
  if (existing.supplierId !== supplierId) {
    throw new Error("Bu fiyat listesini silme yetkiniz yok.");
  }

  await docRef.delete();
}

/**
 * Bulk Price Update Execution
 * Updates product catalog prices in teklifim_products.
 * Guaranteed: NEVER modifies historical teklifim_offers, teklifim_agreements or teklifim_orders.
 */
export async function executeBulkPriceUpdate(
  supplierId: string,
  productIds: string[],
  percentage: number
): Promise<{ updatedCount: number; previews: any[] }> {
  if (typeof percentage !== "number" || percentage === 0) {
    throw new Error("Gecerli bir yuzde degeri girilmelidir.");
  }
  if (percentage < -50 || percentage > 50) {
    throw new Error("Tek seferde yapilabilecek maksimum fiyat degisim orani %50'dir.");
  }
  if (!productIds || productIds.length === 0) {
    throw new Error("En az bir urun secilmelidir.");
  }

  const db = getDb();
  const productsSnap = await db
    .collection("teklifim_products")
    .where("supplierId", "==", supplierId)
    .get();

  const allProducts: TeklifimProduct[] = [];
  productsSnap.forEach((doc) => allProducts.push(doc.data() as TeklifimProduct));

  const targetProducts = allProducts.filter((p) => productIds.includes(p.id));
  if (targetProducts.length === 0) {
    throw new Error("Secilen urunler bulunamadi.");
  }

  const adjustments = applyBulkPriceAdjustment(targetProducts, percentage, productIds);

  const batch = db.batch();
  const now = Date.now();

  for (const adj of adjustments) {
    const pRef = db.collection("teklifim_products").doc(adj.productId);
    batch.update(pRef, {
      price: adj.newPrice,
      updatedAt: now,
    });
  }

  await batch.commit();

  return {
    updatedCount: adjustments.length,
    previews: adjustments,
  };
}

/**
 * Updates supplier open/closed status, accepting orders, vacation mode.
 */
export async function updateSupplierAvailability(
  supplierId: string,
  availability: Partial<TeklifimSupplierAvailability>
): Promise<void> {
  const db = getDb();
  const ref = db.collection("teklifim_profiles").doc(supplierId);
  const snap = await ref.get();

  let existing: TeklifimSupplierAvailability = {
    isOnline: true,
    isAcceptingOrders: true,
    vacationMode: false,
  };

  if (snap.exists) {
    const prof = snap.data() as TeklifimProfile;
    if (prof.availability) {
      existing = { ...existing, ...prof.availability };
    }
  }

  const updated: TeklifimSupplierAvailability = {
    ...existing,
    ...availability,
  };

  await ref.set(
    {
      availability: updated,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

/**
 * Gets detailed sales report data and CSV string.
 */
export async function getSupplierSalesReportData(supplierId: string) {
  const db = getDb();

  const ordersSnap = await db
    .collection("teklifim_orders")
    .where("supplierId", "==", supplierId)
    .get();
  const orders: TeklifimOrder[] = [];
  ordersSnap.forEach((d) => orders.push(d.data() as TeklifimOrder));

  const csvContent = exportSupplierSalesReportToCsv(orders);

  // Group by category
  const categoryMap: Record<string, { count: number; volume: number }> = {};
  // Group by month
  const monthlyMap: Record<string, { count: number; volume: number }> = {};
  // Group by customer
  const customerMap: Record<string, { count: number; volume: number; name: string }> = {};

  let totalRevenue = 0;
  let completedCount = 0;

  for (const order of orders) {
    if (order.status === "completed" || order.status === "delivered" || order.paymentStatus === "paid") {
      const amount = order.totalAmount || 0;
      totalRevenue += amount;
      completedCount++;

      // Category
      const cat = order.category || "Diger";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, volume: 0 };
      categoryMap[cat].count++;
      categoryMap[cat].volume += amount;

      // Month
      const d = new Date(order.createdAt || Date.now());
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { count: 0, volume: 0 };
      monthlyMap[monthKey].count++;
      monthlyMap[monthKey].volume += amount;

      // Customer
      const cId = order.buyerBusinessId || order.buyerId || "unknown";
      const cName = order.buyerBusinessName || order.buyerName || "Isletme";
      if (!customerMap[cId]) customerMap[cId] = { count: 0, volume: 0, name: cName };
      customerMap[cId].count++;
      customerMap[cId].volume += amount;
    }
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
    category,
    orderCount: stats.count,
    totalVolume: Math.round(stats.volume * 100) / 100,
  })).sort((a, b) => b.totalVolume - a.totalVolume);

  const monthlyTrend = Object.entries(monthlyMap).map(([month, stats]) => ({
    month,
    orderCount: stats.count,
    totalVolume: Math.round(stats.volume * 100) / 100,
  })).sort((a, b) => a.month.localeCompare(b.month));

  const topCustomers = Object.entries(customerMap).map(([customerId, stats]) => ({
    customerId,
    customerName: stats.name,
    orderCount: stats.count,
    totalVolume: Math.round(stats.volume * 100) / 100,
  })).sort((a, b) => b.totalVolume - a.totalVolume);

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    completedCount,
    categoryBreakdown,
    monthlyTrend,
    topCustomers,
    csvContent,
  };
}
