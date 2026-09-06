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
  TeklifimReview,
  TeklifimVerificationRequest,
  TeklifimReport,
  TeklifimReportReason,
  TeklifimReportStatus,
  TeklifimBlock,
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
export async function sendTeklifimNotification(data: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}): Promise<boolean> {
  try {
    const db = getDb();
    const ref = db.collection("teklifim_notifications").doc();
    await ref.set({
      id: ref.id,
      userId: data.userId,
      title: data.title,
      message: data.message,
      link: data.link || "/teklifim-gelsin/dashboard",
      isRead: false,
      createdAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.warn("Notification send notice:", err);
    return false;
  }
}

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
  if (filters.sort === "rating") {
    list.sort((a, b) => {
      const rA = a.rating || 0;
      const rB = b.rating || 0;
      if (rB !== rA) return rB - rA;
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });
  } else if (filters.sort === "deals") {
    list.sort((a, b) => (b.completedDeals || 0) - (a.completedDeals || 0));
  } else if (filters.sort === "speed" || filters.sort === "response") {
    list.sort((a, b) => {
      const mA = a.responseMinutes ?? 999999;
      const mB = b.responseMinutes ?? 999999;
      return mA - mB;
    });
  } else if (filters.sort === "new" || filters.sort === "newest") {
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else {
    // Default (relevant): Verified first, then rating, then deals, then newest
    list.sort((a, b) => {
      const aVer = a.isVerified || a.verificationStatus === "verified";
      const bVer = b.isVerified || b.verificationStatus === "verified";
      if (aVer && !bVer) return -1;
      if (!aVer && bVer) return 1;
      const rDiff = (b.rating || 0) - (a.rating || 0);
      if (rDiff !== 0) return rDiff;
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

export { computeProfileCompletion } from "./teklifimUtils";

/**
 * Add Review for Completed Request
 * Enforces:
 * 1. Business must be owner of request.
 * 2. Request status must be 'completed' or 'supplier_selected'.
 * 3. Exactly 1 review per completed request (duplicate prevention).
 * 4. Recalculates supplier average rating and reviewCount.
 */
export async function addTeklifimReview(
  businessId: string,
  data: {
    requestId: string;
    rating: number;
    comment: string;
    isAnonymous?: boolean;
  }
): Promise<TeklifimReview> {
  const db = getDb();

  // 1. Fetch Request
  const reqDoc = await db.collection("teklifim_requests").doc(data.requestId).get();
  if (!reqDoc.exists) throw new Error("Talep bulunamadı.");

  const request = reqDoc.data() as TeklifimRequest;
  if (request.businessId !== businessId) {
    throw new Error("Yalnızca talebi açan işletme değerlendirme yapabilir.");
  }

  const isCompleted = request.status === "completed" || request.status === "supplier_selected";
  if (!isCompleted || !request.selectedSupplierId) {
    throw new Error("Yalnızca tamamlanmış ve tedarikçi seçilmiş işlemler değerlendirilebilir.");
  }

  const supplierId = request.selectedSupplierId;

  // 2. Prevent duplicate review
  const existingReviewSnap = await db
    .collection("teklifim_reviews")
    .where("requestId", "==", data.requestId)
    .where("businessId", "==", businessId)
    .get();

  if (!existingReviewSnap.empty) {
    throw new Error("Bu işlem için zaten bir değerlendirme yapılmıştır.");
  }

  const ratingNum = Math.max(1, Math.min(5, Math.round(Number(data.rating) || 5)));
  const now = Date.now();

  const reviewRef = db.collection("teklifim_reviews").doc();
  const newReview: TeklifimReview = {
    id: reviewRef.id,
    requestId: request.id,
    requestTitle: request.title,
    businessId,
    businessName: data.isAnonymous ? "Doğrulanmış İşletme" : request.businessName,
    supplierId,
    rating: ratingNum,
    comment: data.comment.trim(),
    isAnonymous: !!data.isAnonymous,
    createdAt: now,
  };

  await reviewRef.set(newReview);

  // 3. Recalculate Supplier Rating & Review Count
  const allReviewsSnap = await db
    .collection("teklifim_reviews")
    .where("supplierId", "==", supplierId)
    .get();

  const reviewsList = allReviewsSnap.docs.map((d) => d.data() as TeklifimReview);
  const totalCount = reviewsList.length;
  const avgRating = totalCount > 0
    ? Number((reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1))
    : 0;

  await db.collection("teklifim_profiles").doc(supplierId).update({
    rating: avgRating,
    reviewCount: totalCount,
    updatedAt: now,
  });

  // 4. Send Notification to Supplier
  await sendTeklifimNotification({
    userId: supplierId,
    title: "Yeni Müşteri Değerlendirmesi",
    message: `"${request.title}" siparişiniz için ${ratingNum} yıldızlı bir değerlendirme yapıldı.`,
    link: `/teklifim-gelsin/suppliers/${supplierId}`,
  });

  return newReview;
}

/**
 * Get Supplier Reviews
 */
export async function getSupplierReviews(supplierId: string): Promise<TeklifimReview[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_reviews")
    .where("supplierId", "==", supplierId)
    .get();

  const reviews = snap.docs.map((d) => d.data() as TeklifimReview);
  reviews.sort((a, b) => b.createdAt - a.createdAt);
  return reviews;
}

/**
 * Check if a business user can review a specific request
 */
export async function canUserReviewSupplier(
  businessId: string,
  requestId: string
): Promise<{ canReview: boolean; reason?: string; supplierId?: string; existingReview?: TeklifimReview }> {
  const db = getDb();
  const reqDoc = await db.collection("teklifim_requests").doc(requestId).get();
  if (!reqDoc.exists) {
    return { canReview: false, reason: "Talep bulunamadı." };
  }

  const request = reqDoc.data() as TeklifimRequest;
  if (request.businessId !== businessId) {
    return { canReview: false, reason: "Yetkisiz işletme." };
  }

  const isCompleted = request.status === "completed" || request.status === "supplier_selected";
  if (!isCompleted || !request.selectedSupplierId) {
    return { canReview: false, reason: "İşlem henüz tamamlanmadı." };
  }

  // Check existing
  const existingSnap = await db
    .collection("teklifim_reviews")
    .where("requestId", "==", requestId)
    .where("businessId", "==", businessId)
    .get();

  if (!existingSnap.empty) {
    return {
      canReview: false,
      reason: "Zaten değerlendirme yapıldı.",
      supplierId: request.selectedSupplierId,
      existingReview: existingSnap.docs[0].data() as TeklifimReview,
    };
  }

  return { canReview: true, supplierId: request.selectedSupplierId };
}

/**
 * Submit Verification Request (Supplier -> Admin)
 */
export async function submitVerificationRequest(
  supplierId: string,
  data: {
    legalTitle: string;
    taxNumber: string;
    taxOffice: string;
    tradeRegistryNumber?: string;
    documentUrl?: string;
    notes?: string;
  }
): Promise<TeklifimVerificationRequest> {
  const db = getDb();

  const supplierDoc = await db.collection("teklifim_profiles").doc(supplierId).get();
  if (!supplierDoc.exists) throw new Error("Tedarikçi profili bulunamadı.");

  const profile = supplierDoc.data() as TeklifimProfile;

  // Check if there is already a pending verification request
  const pendingSnap = await db
    .collection("teklifim_verifications")
    .where("supplierId", "==", supplierId)
    .where("status", "==", "pending")
    .get();

  if (!pendingSnap.empty) {
    throw new Error("Zaten incelenmekte olan bir doğrulama başvurunuz bulunmaktadır.");
  }

  const ref = db.collection("teklifim_verifications").doc();
  const now = Date.now();

  const newRequest: TeklifimVerificationRequest = {
    id: ref.id,
    supplierId,
    supplierName: profile.companyName,
    supplierCity: profile.city || "Türkiye",
    supplierCategory: (profile.categories || [])[0] || "Toptan Tedarik",
    legalTitle: data.legalTitle.trim(),
    taxNumber: data.taxNumber.trim(),
    taxOffice: data.taxOffice.trim(),
    tradeRegistryNumber: data.tradeRegistryNumber?.trim() || "",
    documentUrl: data.documentUrl?.trim() || "",
    notes: data.notes?.trim() || "",
    status: "pending",
    createdAt: now,
  };

  await ref.set(newRequest);

  // Update profile status to pending
  await db.collection("teklifim_profiles").doc(supplierId).update({
    verificationStatus: "pending",
    legalTitle: data.legalTitle.trim(),
    taxNumber: data.taxNumber.trim(),
    taxOffice: data.taxOffice.trim(),
    updatedAt: now,
  });

  return newRequest;
}

/**
 * Get Supplier Verification Application
 */
export async function getSupplierVerificationStatus(
  supplierId: string
): Promise<TeklifimVerificationRequest | null> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_verifications")
    .where("supplierId", "==", supplierId)
    .get();

  if (snap.empty) return null;
  const list = snap.docs.map((d) => d.data() as TeklifimVerificationRequest);
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list[0];
}

/**
 * Admin: Get All Verification Requests
 */
export async function getAllVerificationRequests(
  statusFilter?: string
): Promise<TeklifimVerificationRequest[]> {
  const db = getDb();
  let snap;
  if (statusFilter && statusFilter !== "all") {
    snap = await db
      .collection("teklifim_verifications")
      .where("status", "==", statusFilter)
      .get();
  } else {
    snap = await db.collection("teklifim_verifications").get();
  }

  const list = snap.docs.map((d) => d.data() as TeklifimVerificationRequest);
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

/**
 * Admin: Process Verification Request (Approve / Reject)
 */
export async function processVerificationRequest(
  verificationId: string,
  adminEmail: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<TeklifimVerificationRequest> {
  const db = getDb();
  const vRef = db.collection("teklifim_verifications").doc(verificationId);
  const vDoc = await vRef.get();
  if (!vDoc.exists) throw new Error("Doğrulama başvurusu bulunamadı.");

  const vData = vDoc.data() as TeklifimVerificationRequest;
  const now = Date.now();
  const newStatus = action === "approve" ? "approved" : "rejected";

  await vRef.update({
    status: newStatus,
    rejectionReason: action === "reject" ? (rejectionReason || "Belgeler doğrulanamadı.") : "",
    processedAt: now,
    processedBy: adminEmail,
  });

  // Update Supplier Profile
  const supRef = db.collection("teklifim_profiles").doc(vData.supplierId);
  if (action === "approve") {
    await supRef.update({
      verificationStatus: "verified",
      isVerified: true,
      taxVerified: true,
      verifiedAt: now,
      updatedAt: now,
    });

    await sendTeklifimNotification({
      userId: vData.supplierId,
      title: "Tebrikler! Firmanız Doğrulandı",
      message: "Doğrulama başvurunuz onaylandı. Profilinize Doğrulanmış Firma rozeti eklendi.",
      link: `/teklifim-gelsin/suppliers/${vData.supplierId}`,
    });
  } else {
    await supRef.update({
      verificationStatus: "rejected",
      isVerified: false,
      updatedAt: now,
    });

    await sendTeklifimNotification({
      userId: vData.supplierId,
      title: "Doğrulama Başvurusu Sonucu",
      message: `Doğrulama başvurunuz onaylanamadı. Gerekçe: ${rejectionReason || "Eksik bilgi."}`,
      link: `/teklifim-gelsin/verification`,
    });
  }

  const updatedDoc = await vRef.get();
  return updatedDoc.data() as TeklifimVerificationRequest;
}

/**
 * Calculate Real Trust Metrics & Stats for Supplier
 * Zero Fake Data: Returns null if insufficient sample size.
 */
export async function calculateSupplierTrustStats(supplierId: string): Promise<{
  completedDeals: number;
  totalOffers: number;
  selectedOffers: number;
  averageRating: number | null;
  reviewCount: number;
  responseMinutes: number | null;
  responseFormatted: string | null;
}> {
  const db = getDb();

  // 1. Completed Deals
  const completedReqSnap = await db
    .collection("teklifim_requests")
    .where("selectedSupplierId", "==", supplierId)
    .where("status", "==", "completed")
    .get();

  const completedDeals = completedReqSnap.size;

  // 2. All Submitted Offers
  const offersSnap = await db
    .collection("teklifim_offers")
    .where("supplierId", "==", supplierId)
    .get();

  const allOffers = offersSnap.docs.map((d) => d.data() as TeklifimOffer);
  const totalOffers = allOffers.length;
  const selectedOffers = allOffers.filter((o) => o.status === "selected").length;

  // 3. Reviews & Ratings
  const reviewsSnap = await db
    .collection("teklifim_reviews")
    .where("supplierId", "==", supplierId)
    .get();

  const reviews = reviewsSnap.docs.map((d) => d.data() as TeklifimReview);
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
    : null;

  // 4. Real Response Time Calculation
  // Calculate difference between offer.createdAt and request.createdAt
  let responseMinutes: number | null = null;
  let responseFormatted: string | null = null;

  if (allOffers.length >= 2) {
    const diffs: number[] = [];

    for (const off of allOffers) {
      if (off.createdAt && off.requestId) {
        try {
          const reqDoc = await db.collection("teklifim_requests").doc(off.requestId).get();
          if (reqDoc.exists) {
            const reqData = reqDoc.data() as TeklifimRequest;
            if (reqData.createdAt && off.createdAt >= reqData.createdAt) {
              const diffMin = (off.createdAt - reqData.createdAt) / 60000;
              diffs.push(diffMin);
            }
          }
        } catch {}
      }
    }

    if (diffs.length >= 2) {
      const avgMin = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      responseMinutes = avgMin;

      if (avgMin < 60) {
        responseFormatted = `${avgMin} dk`;
      } else {
        const hrs = Math.round(avgMin / 60);
        responseFormatted = `${hrs} saat`;
      }
    }
  }

  return {
    completedDeals,
    totalOffers,
    selectedOffers,
    averageRating,
    reviewCount,
    responseMinutes,
    responseFormatted,
  };
}

/**
 * Report (Complaint) CRUD
 */
export async function createTeklifimReport(
  reporterId: string,
  reporterEmail: string,
  data: {
    targetId: string;
    targetType: "supplier" | "business" | "request";
    reason: TeklifimReportReason;
    description: string;
    targetName?: string;
    reporterRole?: string;
  }
): Promise<TeklifimReport> {
  const db = getDb();
  const ref = db.collection("teklifim_reports").doc();

  const report: TeklifimReport = {
    id: ref.id,
    reporterId,
    reporterEmail,
    reporterRole: data.reporterRole || "user",
    targetId: data.targetId,
    targetName: data.targetName || "",
    targetType: data.targetType,
    reason: data.reason,
    description: data.description.trim(),
    status: "pending",
    createdAt: Date.now(),
  };

  await ref.set(report);
  return report;
}

export async function getAllReports(statusFilter?: string): Promise<TeklifimReport[]> {
  const db = getDb();
  let snap;
  if (statusFilter && statusFilter !== "all") {
    snap = await db
      .collection("teklifim_reports")
      .where("status", "==", statusFilter)
      .get();
  } else {
    snap = await db.collection("teklifim_reports").get();
  }

  const list = snap.docs.map((d) => d.data() as TeklifimReport);
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

export async function updateReportStatus(
  reportId: string,
  status: TeklifimReportStatus,
  adminNotes?: string
): Promise<TeklifimReport> {
  const db = getDb();
  const ref = db.collection("teklifim_reports").doc(reportId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Şikayet kaydı bulunamadı.");

  const now = Date.now();
  await ref.update({
    status,
    adminNotes: adminNotes || "",
    resolvedAt: now,
  });

  const updated = await ref.get();
  return updated.data() as TeklifimReport;
}

/**
 * Block (Mute / Engelleme) Management
 */
export async function blockUser(
  blockerId: string,
  blockedId: string,
  blockedName?: string,
  reason?: string
): Promise<TeklifimBlock> {
  const db = getDb();
  const blockId = `${blockerId}_${blockedId}`;
  const ref = db.collection("teklifim_blocks").doc(blockId);

  const block: TeklifimBlock = {
    id: blockId,
    blockerId,
    blockedId,
    blockedName: blockedName || "",
    reason: reason || "",
    createdAt: Date.now(),
  };

  await ref.set(block);
  return block;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  const db = getDb();
  const blockId = `${blockerId}_${blockedId}`;
  await db.collection("teklifim_blocks").doc(blockId).delete();
  return true;
}

export async function getUserBlocks(userId: string): Promise<TeklifimBlock[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_blocks")
    .where("blockerId", "==", userId)
    .get();

  return snap.docs.map((d) => d.data() as TeklifimBlock);
}

export async function isUserBlocked(userA: string, userB: string): Promise<boolean> {
  const db = getDb();
  const check1 = await db.collection("teklifim_blocks").doc(`${userA}_${userB}`).get();
  if (check1.exists) return true;

  const check2 = await db.collection("teklifim_blocks").doc(`${userB}_${userA}`).get();
  return check2.exists;
}

/**
 * Update Profile Details
 */
export async function updateTeklifimProfile(
  userId: string,
  updates: Partial<TeklifimProfile>
): Promise<TeklifimProfile> {
  const db = getDb();
  const ref = db.collection("teklifim_profiles").doc(userId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Profil bulunamadı.");

  const current = doc.data() as TeklifimProfile;
  const now = Date.now();

  // Clean restricted fields from direct user updates
  delete updates.uid;
  delete updates.isVerified;
  delete updates.verificationStatus;
  delete updates.rating;
  delete updates.reviewCount;
  delete updates.completedDeals;

  await ref.update({
    ...updates,
    updatedAt: now,
  });

  const updatedDoc = await ref.get();
  return updatedDoc.data() as TeklifimProfile;
}

/**
 * Helper to fetch cloneable request fields for repeat requests
 */
export async function getCloneableRequestData(
  requestId: string
): Promise<Partial<TeklifimRequest> | null> {
  const db = getDb();
  const doc = await db.collection("teklifim_requests").doc(requestId).get();
  if (!doc.exists) return null;

  const r = doc.data() as TeklifimRequest;
  return {
    title: `${r.title} (Yeniden)`,
    category: r.category,
    productName: r.productName,
    quantity: r.quantity,
    unit: r.unit,
    deliveryDays: r.deliveryDays,
    city: r.city,
    district: r.district,
    description: r.description,
    sampleRequired: r.sampleRequired,
  };
}
