import { getAdminDb } from "@/lib/firebase/admin";
import {
  TeklifimProfile,
  TeklifimRequest,
  TeklifimOffer,
  TeklifimNotification,
  TeklifimUserRole,
  TeklifimProduct,
  TeklifimFavorite,
  TeklifimSupplierMatch,
} from "@/types/teklifimGelsin";

function getDb() {
  return getAdminDb();
}

/**
 * Compute intelligent comparison badges (En Ucuz, En Hızlı, En Uygun)
 */
export function computeOfferBadges(offers: TeklifimOffer[]): TeklifimOffer[] {
  if (!offers || offers.length === 0) return [];
  if (offers.length === 1) {
    return [
      {
        ...offers[0],
        isCheapest: true,
        isFastest: true,
        isBestValue: true,
      },
    ];
  }

  // Find min price & min delivery
  const minPrice = Math.min(...offers.map((o) => o.totalPrice || Infinity));
  const minDelivery = Math.min(...offers.map((o) => o.deliveryDays || Infinity));

  // Find best value (lowest score of normalized price + normalized delivery)
  const maxPrice = Math.max(...offers.map((o) => o.totalPrice || 1));
  const maxDelivery = Math.max(...offers.map((o) => o.deliveryDays || 1));

  let bestValueOfferId = offers[0].id;
  let minScore = Infinity;

  offers.forEach((o) => {
    const priceScore = maxPrice === minPrice ? 0.5 : (o.totalPrice - minPrice) / (maxPrice - minPrice);
    const deliveryScore =
      maxDelivery === minDelivery ? 0.5 : (o.deliveryDays - minDelivery) / (maxDelivery - minDelivery);
    const totalScore = priceScore * 0.6 + deliveryScore * 0.4;

    if (totalScore < minScore) {
      minScore = totalScore;
      bestValueOfferId = o.id;
    }
  });

  return offers.map((offer) => {
    const isCheapest = offer.totalPrice === minPrice;
    const isFastest = offer.deliveryDays === minDelivery;
    const isBestValue = offer.id === bestValueOfferId;

    return {
      ...offer,
      isCheapest,
      isFastest,
      isBestValue,
    };
  });
}

/**
 * Profile Operations
 */
export async function getTeklifimProfile(uid: string): Promise<TeklifimProfile | null> {
  const db = getDb();
  const doc = await db.collection("teklifim_profiles").doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as TeklifimProfile;
}

export async function upsertTeklifimProfile(
  uid: string,
  data: Partial<TeklifimProfile>
): Promise<TeklifimProfile> {
  const db = getDb();
  const docRef = db.collection("teklifim_profiles").doc(uid);
  const existing = await docRef.get();

  const now = Date.now();
  if (existing.exists) {
    await docRef.update({
      ...data,
      updatedAt: now,
    });
    const updated = await docRef.get();
    return updated.data() as TeklifimProfile;
  } else {
    const newProfile: TeklifimProfile = {
      uid,
      role: data.role || "business",
      companyName: data.companyName || "Firma",
      contactName: data.contactName || "Yetkili",
      phone: data.phone || "",
      email: data.email || "",
      city: data.city || "İstanbul",
      district: data.district || "",
      categories: data.categories || [],
      description: data.description || "",
      deliveryRegions: data.deliveryRegions || ["Tüm Türkiye"],
      minOrder: data.minOrder || "",
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set(newProfile);
    return newProfile;
  }
}

/**
 * Request Operations
 */
export async function createTeklifimRequest(
  businessId: string,
  profile: TeklifimProfile,
  data: Partial<TeklifimRequest>
): Promise<TeklifimRequest> {
  const db = getDb();
  const ref = db.collection("teklifim_requests").doc();
  const now = Date.now();

  const newRequest: TeklifimRequest = {
    id: ref.id,
    businessId,
    businessName: profile.companyName || "İşletme",
    businessCity: profile.city || data.city || "İstanbul",
    businessPhone: profile.phone,
    businessEmail: profile.email,
    title: data.title || "Tedarik Talebi",
    category: data.category || "Diğer",
    productName: data.productName || data.title || "",
    quantity: Number(data.quantity) || 1,
    unit: data.unit || "Adet",
    deliveryDays: Number(data.deliveryDays) || 7,
    city: data.city || profile.city || "İstanbul",
    district: data.district || profile.district || "",
    description: data.description || "",
    deadline: data.deadline || "",
    imageUrl: data.imageUrl || "",
    status: "published",
    offerCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(newRequest);

  // Notify suppliers in matching category
  try {
    const suppliersSnap = await db
      .collection("teklifim_profiles")
      .where("role", "==", "supplier")
      .get();

    const batch = db.batch();
    suppliersSnap.forEach((sDoc) => {
      const sData = sDoc.data() as TeklifimProfile;
      if (
        sData.categories?.length === 0 ||
        sData.categories?.includes(newRequest.category) ||
        sData.categories?.includes("Diğer")
      ) {
        const notifRef = db.collection("teklifim_notifications").doc();
        batch.set(notifRef, {
          id: notifRef.id,
          userId: sData.uid,
          title: "Yeni Uygun Talep",
          message: `"${newRequest.category}" kategorisinde "${newRequest.title}" talebi yayınlandı.`,
          link: `/teklifim-gelsin/requests/${newRequest.id}`,
          isRead: false,
          createdAt: now,
        });
      }
    });
    await batch.commit();
  } catch (notifErr) {
    console.warn("Notice sending supplier notifications:", notifErr);
  }

  return newRequest;
}

export async function getBusinessRequests(businessId: string): Promise<TeklifimRequest[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_requests")
    .where("businessId", "==", businessId)
    .get();

  const list: TeklifimRequest[] = [];
  snap.forEach((doc) => list.push(doc.data() as TeklifimRequest));
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getOpenRequestsForSupplier(
  categoryFilter?: string,
  cityFilter?: string
): Promise<TeklifimRequest[]> {
  const db = getDb();
  let q: any = db.collection("teklifim_requests");

  const snap = await q.get();
  const list: TeklifimRequest[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as TeklifimRequest;
    if (data.status !== "completed" && data.status !== "cancelled") {
      let matches = true;
      if (categoryFilter && categoryFilter !== "Tümü" && data.category !== categoryFilter) {
        matches = false;
      }
      if (cityFilter && cityFilter !== "Tümü" && data.city !== cityFilter) {
        matches = false;
      }
      if (matches) {
        list.push(data);
      }
    }
  });

  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getRequestDetails(requestId: string): Promise<TeklifimRequest | null> {
  const db = getDb();
  const doc = await db.collection("teklifim_requests").doc(requestId).get();
  if (!doc.exists) return null;
  return doc.data() as TeklifimRequest;
}

/**
 * Offer Operations
 */
export async function submitTeklifimOffer(
  supplierId: string,
  supplierProfile: TeklifimProfile,
  requestId: string,
  data: Partial<TeklifimOffer>
): Promise<TeklifimOffer> {
  const db = getDb();
  const requestDoc = await db.collection("teklifim_requests").doc(requestId).get();
  if (!requestDoc.exists) {
    throw new Error("Talep bulunamadı.");
  }

  const reqData = requestDoc.data() as TeklifimRequest;
  const now = Date.now();

  if (
    reqData.status === "cancelled" ||
    reqData.status === "completed" ||
    reqData.status === "expired" ||
    checkRequestDeadlineExpired(reqData)
  ) {
    throw new Error("Bu talebin teklif toplama süresi dolmuştur veya talep kapatılmıştır.");
  }

  // Check if supplier already submitted an offer for this request
  const existingSnap = await db
    .collection("teklifim_offers")
    .where("requestId", "==", requestId)
    .where("supplierId", "==", supplierId)
    .limit(1)
    .get();

  let offerId = "";
  let isEdit = false;

  const unitPrice = Number(data.unitPrice) || 0;
  const totalPrice = Number(data.totalPrice) || unitPrice * reqData.quantity;

  if (!existingSnap.empty) {
    // Edit existing offer
    offerId = existingSnap.docs[0].id;
    isEdit = true;
    await db.collection("teklifim_offers").doc(offerId).update({
      unitPrice,
      totalPrice,
      deliveryDays: Number(data.deliveryDays) || 5,
      minOrderQuantity: data.minOrderQuantity || "",
      description: data.description || "",
      fileUrl: data.fileUrl || "",
      status: "submitted",
      updatedAt: now,
    });
  } else {
    // New offer
    const offerRef = db.collection("teklifim_offers").doc();
    offerId = offerRef.id;

    const newOffer: TeklifimOffer = {
      id: offerId,
      requestId,
      requestTitle: reqData.title,
      supplierId,
      supplierName: supplierProfile.companyName || "Tedarikçi Firma",
      supplierCity: supplierProfile.city || "İstanbul",
      supplierPhone: supplierProfile.phone || "",
      supplierEmail: supplierProfile.email || "",
      supplierIsVerified: supplierProfile.isVerified,
      unitPrice,
      totalPrice,
      currency: "TL",
      deliveryDays: Number(data.deliveryDays) || 5,
      minOrderQuantity: data.minOrderQuantity || "",
      description: data.description || "",
      fileUrl: data.fileUrl || "",
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    };

    await offerRef.set(newOffer);

    // Increment request offer count and set status to offers_received
    await db
      .collection("teklifim_requests")
      .doc(requestId)
      .update({
        offerCount: (reqData.offerCount || 0) + 1,
        status: reqData.status === "published" ? "offers_received" : reqData.status,
        updatedAt: now,
      });

    // Notify business owner
    try {
      const notifRef = db.collection("teklifim_notifications").doc();
      await notifRef.set({
        id: notifRef.id,
        userId: reqData.businessId,
        title: "Yeni Teklif Geldi!",
        message: `"${reqData.title}" talebiniz için ${supplierProfile.companyName} tarafından yeni bir teklif sunuldu.`,
        link: `/teklifim-gelsin/requests/${requestId}`,
        isRead: false,
        createdAt: now,
      });
    } catch {}
  }

  const savedDoc = await db.collection("teklifim_offers").doc(offerId).get();
  return savedDoc.data() as TeklifimOffer;
}

/**
 * Get offers for a request with strict role-based security:
 * - Business owner sees all offers with comparison badges
 * - Supplier sees ONLY their own offer
 */
export async function getOffersForRequest(
  requestId: string,
  requestingUserId: string,
  isBusinessOwner: boolean
): Promise<TeklifimOffer[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_offers")
    .where("requestId", "==", requestId)
    .get();

  const allOffers: TeklifimOffer[] = [];
  snap.forEach((doc) => allOffers.push(doc.data() as TeklifimOffer));

  if (isBusinessOwner) {
    // Return all offers with computed badges
    return computeOfferBadges(allOffers);
  }

  // Supplier view: ONLY return own offer
  return allOffers.filter((o) => o.supplierId === requestingUserId);
}

export async function getSupplierSubmittedOffers(supplierId: string): Promise<TeklifimOffer[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_offers")
    .where("supplierId", "==", supplierId)
    .get();

  const list: TeklifimOffer[] = [];
  snap.forEach((doc) => list.push(doc.data() as TeklifimOffer));
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Business selects a winning supplier offer
 */
export async function selectTeklifimOffer(
  requestId: string,
  offerId: string,
  businessId: string
): Promise<boolean> {
  const db = getDb();
  const reqRef = db.collection("teklifim_requests").doc(requestId);
  const reqDoc = await reqRef.get();

  if (!reqDoc.exists) return false;
  const reqData = reqDoc.data() as TeklifimRequest;
  if (reqData.businessId !== businessId) return false;

  const offerRef = db.collection("teklifim_offers").doc(offerId);
  const offerDoc = await offerRef.get();
  if (!offerDoc.exists) return false;
  const offerData = offerDoc.data() as TeklifimOffer;

  const now = Date.now();

  // Update request
  await reqRef.update({
    selectedOfferId: offerId,
    selectedSupplierId: offerData.supplierId,
    status: "supplier_selected",
    updatedAt: now,
  });

  // Update selected offer
  await offerRef.update({
    status: "selected",
    updatedAt: now,
  });

  // Notify supplier
  try {
    const notifRef = db.collection("teklifim_notifications").doc();
    await notifRef.set({
      id: notifRef.id,
      userId: offerData.supplierId,
      title: "Tebrikler, Teklifiniz Seçildi!",
      message: `"${reqData.title}" talebi için verdiğiniz teklif işletme tarafından seçildi. İletişim başlatıldı.`,
      link: `/teklifim-gelsin/requests/${requestId}`,
      isRead: false,
      createdAt: now,
    });
  } catch {}

  return true;
}

/**
 * Notifications
 */
export async function getUserNotifications(userId: string): Promise<TeklifimNotification[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_notifications")
    .where("userId", "==", userId)
    .limit(15)
    .get();

  const list: TeklifimNotification[] = [];
  snap.forEach((d) => list.push(d.data() as TeklifimNotification));
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const db = getDb();
  await db.collection("teklifim_notifications").doc(notificationId).update({
    isRead: true,
  });
  return true;
}

/**
 * =========================================================================
 * PHASE 2: HARD MARKETPLACE EXTENSIONS
 * =========================================================================
 */

/**
 * Deterministic match score algorithm (0 - 100)
 */
export function computeSupplierMatchScore(
  request: TeklifimRequest,
  supplier: TeklifimProfile
): TeklifimSupplierMatch {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category match (+40)
  const supplierCats = supplier.categories || [];
  const catMatches =
    supplierCats.includes(request.category) ||
    supplierCats.includes("Tümü") ||
    supplierCats.includes("Diğer");

  if (catMatches) {
    score += 40;
    reasons.push(`Kategori uyumu (${request.category})`);
  }

  // 2. City match (+25)
  if (supplier.city && request.city && supplier.city.toLowerCase() === request.city.toLowerCase()) {
    score += 25;
    reasons.push(`Aynı şehir teslimatı (${request.city})`);
  }

  // 3. Delivery region match (+20)
  const regions = supplier.deliveryRegions || ["Tüm Türkiye"];
  const regionMatches =
    regions.includes("Tüm Türkiye") ||
    regions.some((r) => r.toLowerCase().includes(request.city.toLowerCase()));

  if (regionMatches) {
    score += 20;
    reasons.push("Teslimat bölgesi kapsama alanında");
  }

  // 4. Product keyword match (+10)
  const reqTitleLower = request.title.toLowerCase();
  const descLower = (supplier.description || "").toLowerCase();
  const nameLower = (supplier.companyName || "").toLowerCase();

  const words = reqTitleLower.split(" ").filter((w) => w.length > 3);
  const keywordMatches = words.some((w) => descLower.includes(w) || nameLower.includes(w));

  if (keywordMatches) {
    score += 10;
    reasons.push("Ürün anahtar kelime eşleşmesi");
  }

  // 5. Min order suitability & Trust bonus (+5)
  if (supplier.isVerified || supplier.taxVerified) {
    score += 5;
    reasons.push("Doğrulanmış tedarikçi güven puanı");
  }

  return {
    supplier,
    matchScore: Math.min(100, score),
    matchReasons: reasons,
  };
}

/**
 * Get recommended suppliers for a request
 */
export async function getRecommendedSuppliersForRequest(
  requestId: string
): Promise<TeklifimSupplierMatch[]> {
  const db = getDb();
  const reqDoc = await db.collection("teklifim_requests").doc(requestId).get();
  if (!reqDoc.exists) return [];
  const request = reqDoc.data() as TeklifimRequest;

  const suppliersSnap = await db
    .collection("teklifim_profiles")
    .where("role", "==", "supplier")
    .get();

  const matches: TeklifimSupplierMatch[] = [];
  suppliersSnap.forEach((doc) => {
    const s = doc.data() as TeklifimProfile;
    const match = computeSupplierMatchScore(request, s);
    if (match.matchScore >= 40) {
      matches.push(match);
    }
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Search & filter suppliers with sorting
 */
export async function searchSuppliers(filters: {
  category?: string;
  city?: string;
  district?: string;
  deliveryRegion?: string;
  verifiedOnly?: boolean;
  search?: string;
  sort?: string;
}): Promise<TeklifimProfile[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_profiles")
    .where("role", "==", "supplier")
    .get();

  let list: TeklifimProfile[] = [];
  snap.forEach((doc) => list.push(doc.data() as TeklifimProfile));

  // Apply in-memory filtering for composite fields
  list = list.filter((s) => {
    if (filters.category && filters.category !== "Tümü") {
      if (!s.categories?.includes(filters.category)) return false;
    }
    if (filters.city && filters.city !== "Tümü") {
      if (s.city !== filters.city) return false;
    }
    if (filters.district && filters.district !== "Tümü") {
      if (s.district !== filters.district) return false;
    }
    if (filters.deliveryRegion && filters.deliveryRegion !== "Tümü") {
      const regions = s.deliveryRegions || ["Tüm Türkiye"];
      if (!regions.includes("Tüm Türkiye") && !regions.includes(filters.deliveryRegion)) return false;
    }
    if (filters.verifiedOnly) {
      if (!s.isVerified && s.verificationStatus !== "verified") return false;
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const matchName = (s.companyName || "").toLowerCase().includes(q);
      const matchDesc = (s.description || "").toLowerCase().includes(q);
      const matchCat = (s.categories || []).some((c) => c.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Apply sorting
  if (filters.sort === "deals") {
    list.sort((a, b) => (b.completedDeals || 0) - (a.completedDeals || 0));
  } else if (filters.sort === "newest") {
    list.sort((a, b) => b.createdAt - a.createdAt);
  } else if (filters.sort === "response") {
    list.sort((a, b) => (b.responseRate ? 1 : 0) - (a.responseRate ? 1 : 0));
  } else {
    // Default: verified first, then deals, then newest
    list.sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return (b.completedDeals || 0) - (a.completedDeals || 0);
    });
  }

  return list;
}

/**
 * Supplier Products CRUD
 */
export async function getSupplierProducts(supplierId: string): Promise<TeklifimProduct[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_products")
    .where("supplierId", "==", supplierId)
    .get();

  const list: TeklifimProduct[] = [];
  snap.forEach((doc) => list.push(doc.data() as TeklifimProduct));
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addSupplierProduct(
  supplierId: string,
  product: Partial<TeklifimProduct>
): Promise<TeklifimProduct> {
  const db = getDb();
  const ref = db.collection("teklifim_products").doc();
  const now = Date.now();

  const newProduct: TeklifimProduct = {
    id: ref.id,
    supplierId,
    name: product.name || "Ürün",
    category: product.category || "Genel",
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    minOrder: product.minOrder || "1 Koli",
    unit: product.unit || "Adet",
    estimatedPrice: product.estimatedPrice ? Number(product.estimatedPrice) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(newProduct);
  return newProduct;
}

export async function deleteSupplierProduct(supplierId: string, productId: string): Promise<boolean> {
  const db = getDb();
  const docRef = db.collection("teklifim_products").doc(productId);
  const doc = await docRef.get();
  if (!doc.exists) return false;
  if (doc.data()?.supplierId !== supplierId) return false;

  await docRef.delete();
  return true;
}

/**
 * Favorites Operations
 */
export async function toggleFavoriteSupplier(
  userId: string,
  supplier: TeklifimProfile
): Promise<{ isFavorited: boolean }> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_favorites")
    .where("userId", "==", userId)
    .where("supplierId", "==", supplier.uid)
    .limit(1)
    .get();

  if (!snap.empty) {
    // Remove favorite
    await db.collection("teklifim_favorites").doc(snap.docs[0].id).delete();
    return { isFavorited: false };
  } else {
    // Add favorite
    const ref = db.collection("teklifim_favorites").doc();
    const newFav: TeklifimFavorite = {
      id: ref.id,
      userId,
      supplierId: supplier.uid,
      supplierName: supplier.companyName,
      supplierCity: supplier.city,
      supplierCategories: supplier.categories || [],
      supplierMinOrder: supplier.minOrder,
      supplierResponseRate: supplier.responseRate,
      createdAt: Date.now(),
    };
    await ref.set(newFav);
    return { isFavorited: true };
  }
}

export async function getUserFavoriteSuppliers(userId: string): Promise<TeklifimFavorite[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_favorites")
    .where("userId", "==", userId)
    .get();

  const list: TeklifimFavorite[] = [];
  snap.forEach((doc) => list.push(doc.data() as TeklifimFavorite));
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Send Direct Request Invitation to a Supplier
 */
export async function sendDirectRequestInvitation(
  businessId: string,
  supplierId: string,
  requestId: string
): Promise<boolean> {
  const db = getDb();
  const reqRef = db.collection("teklifim_requests").doc(requestId);
  const reqDoc = await reqRef.get();
  if (!reqDoc.exists) return false;

  const reqData = reqDoc.data() as TeklifimRequest;
  if (reqData.businessId !== businessId) return false;

  // Append supplierId to invitedSupplierIds
  const invited = reqData.invitedSupplierIds || [];
  if (!invited.includes(supplierId)) {
    invited.push(supplierId);
    await reqRef.update({
      invitedSupplierIds: invited,
      updatedAt: Date.now(),
    });
  }

  // Send high priority notification
  const notifRef = db.collection("teklifim_notifications").doc();
  await notifRef.set({
    id: notifRef.id,
    userId: supplierId,
    title: "Özel Teklif Daveti Geldi!",
    message: `"${reqData.businessName}" firması sizi doğrudan "${reqData.title}" talebine teklif sunmaya davet etti.`,
    link: `/teklifim-gelsin/requests/${requestId}`,
    isRead: false,
    createdAt: Date.now(),
  });

  return true;
}

/**
 * Update Offer (Locked if offer already selected by business)
 */
export async function updateTeklifimOffer(
  offerId: string,
  supplierId: string,
  updates: Partial<TeklifimOffer>
): Promise<TeklifimOffer> {
  const db = getDb();
  const docRef = db.collection("teklifim_offers").doc(offerId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Teklif bulunamadı.");

  const current = doc.data() as TeklifimOffer;
  if (current.supplierId !== supplierId) {
    throw new Error("Bu teklifi düzenleme yetkiniz yok.");
  }

  if (current.status === "selected") {
    throw new Error("İşletme tarafından seçilmiş ve anlaşılmış teklifler düzenlenemez.");
  }

  const now = Date.now();
  const newUnitPrice = updates.unitPrice !== undefined ? Number(updates.unitPrice) : current.unitPrice;
  const newTotalPrice = updates.totalPrice !== undefined ? Number(updates.totalPrice) : current.totalPrice;
  const newDelivery = updates.deliveryDays !== undefined ? Number(updates.deliveryDays) : current.deliveryDays;

  await docRef.update({
    unitPrice: newUnitPrice,
    totalPrice: newTotalPrice,
    deliveryDays: newDelivery,
    minOrderQuantity: updates.minOrderQuantity ?? current.minOrderQuantity,
    description: updates.description ?? current.description,
    updatedAt: now,
  });

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimOffer;
}

/**
 * Check if request has expired
 */
export function checkRequestDeadlineExpired(request: TeklifimRequest): boolean {
  if (!request.deadlineTimestamp) return false;
  return Date.now() > request.deadlineTimestamp;
}
