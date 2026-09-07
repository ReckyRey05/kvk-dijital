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
  TeklifimConversation,
  TeklifimMessage,
  TeklifimMessageAttachment,
  TeklifimMessageType,
  TeklifimOfferVersion,
  TeklifimAgreementStatus,
  TeklifimAgreement,
  TeklifimOfferStatus,
  TeklifimOrderStatus,
  TeklifimDeliveryMethod,
  TeklifimDeliveryAddress,
  TeklifimOrderItem,
  TeklifimOrderTracking,
  TeklifimDeliveryProof,
  TeklifimOrderDispute,
  TeklifimOrderCancellation,
  TeklifimOrder,
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
  supplier: TeklifimProfile,
  supplierProducts?: TeklifimProduct[]
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

  // 6. Product catalog match bonus (+15)
  if (supplierProducts && supplierProducts.length > 0) {
    const catLower = request.category.toLowerCase();
    const subCatLower = (request.subCategory || "").toLowerCase();

    const productMatched = supplierProducts.some((p) => {
      if (p.status === "archived" || p.isActive === false) return false;
      const pTitle = (p.title || p.name || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase();
      const pSubCat = (p.subCategory || "").toLowerCase();
      const pDesc = (p.description || "").toLowerCase();
      return (
        (catLower && pCat === catLower) ||
        (subCatLower && pSubCat === subCatLower) ||
        words.some((w) => pTitle.includes(w) || pDesc.includes(w))
      );
    });

    if (productMatched) {
      score += 15;
      reasons.push("Katalogda eşleşen ürün mevcut (+15)");
    }
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

// ==========================================
// FAZ 4: İLETİŞİM, PAZARLIK & ANLAŞMA MOTORU
// ==========================================

/**
 * Get or create unique conversation for a quote offer
 */
export async function getOrCreateConversation(
  requestId: string,
  offerId: string,
  requestingUserId: string
): Promise<TeklifimConversation> {
  const db = getDb();
  const convId = `conv_${offerId}`;
  const convRef = db.collection("teklifim_conversations").doc(convId);
  const convDoc = await convRef.get();

  if (convDoc.exists) {
    const convData = convDoc.data() as TeklifimConversation;
    if (convData.businessId !== requestingUserId && convData.supplierId !== requestingUserId) {
      throw new Error("Bu konuşmaya erişim yetkiniz bulunmamaktadır.");
    }
    const blocked = await isUserBlocked(convData.businessId, convData.supplierId);
    if (blocked) {
      throw new Error("Engellenmiş kullanıcılar arasında iletişim kurulamaz.");
    }
    return convData;
  }

  // Conversation does not exist yet; verify request and offer
  const reqDoc = await db.collection("teklifim_requests").doc(requestId).get();
  if (!reqDoc.exists) throw new Error("Talep bulunamadı.");
  const reqData = reqDoc.data() as TeklifimRequest;

  const offerDoc = await db.collection("teklifim_offers").doc(offerId).get();
  if (!offerDoc.exists) throw new Error("Teklif bulunamadı.");
  const offerData = offerDoc.data() as TeklifimOffer;

  if (requestingUserId !== reqData.businessId && requestingUserId !== offerData.supplierId) {
    throw new Error("Bu teklif için konuşma başlatma yetkiniz bulunmamaktadır.");
  }

  const blocked = await isUserBlocked(reqData.businessId, offerData.supplierId);
  if (blocked) {
    throw new Error("Engellenmiş kullanıcılar arasında iletişim kurulamaz.");
  }

  const now = Date.now();
  const newConversation: TeklifimConversation = {
    id: convId,
    requestId,
    requestTitle: reqData.title,
    offerId,
    businessId: reqData.businessId,
    businessName: reqData.businessName || "İşletme",
    supplierId: offerData.supplierId,
    supplierName: offerData.supplierName || "Tedarikçi",
    lastMessageText: "Görüşme başlatıldı.",
    lastMessageAt: now,
    unreadCountBusiness: 0,
    unreadCountSupplier: 0,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  await convRef.set(newConversation);
  return newConversation;
}

/**
 * Get all conversations for a user (either as business or supplier)
 */
export async function getUserConversations(userId: string): Promise<TeklifimConversation[]> {
  const db = getDb();
  const [bizSnap, supSnap] = await Promise.all([
    db.collection("teklifim_conversations").where("businessId", "==", userId).get(),
    db.collection("teklifim_conversations").where("supplierId", "==", userId).get(),
  ]);

  const map = new Map<string, TeklifimConversation>();
  bizSnap.docs.forEach((d) => map.set(d.id, d.data() as TeklifimConversation));
  supSnap.docs.forEach((d) => map.set(d.id, d.data() as TeklifimConversation));

  return Array.from(map.values()).sort(
    (a, b) => (b.lastMessageAt || b.updatedAt || 0) - (a.lastMessageAt || a.updatedAt || 0)
  );
}

/**
 * Get conversation details including current offer and request
 */
export async function getConversationDetails(
  conversationId: string,
  userId: string
): Promise<{ conversation: TeklifimConversation; offer: TeklifimOffer; request: TeklifimRequest }> {
  const db = getDb();
  const convDoc = await db.collection("teklifim_conversations").doc(conversationId).get();
  if (!convDoc.exists) throw new Error("Konuşma bulunamadı.");

  const conv = convDoc.data() as TeklifimConversation;
  if (conv.businessId !== userId && conv.supplierId !== userId) {
    throw new Error("Bu konuşmaya erişim yetkiniz yok.");
  }

  const [offerDoc, reqDoc] = await Promise.all([
    db.collection("teklifim_offers").doc(conv.offerId).get(),
    db.collection("teklifim_requests").doc(conv.requestId).get(),
  ]);

  if (!offerDoc.exists) throw new Error("İlgili teklif bulunamadı.");
  if (!reqDoc.exists) throw new Error("İlgili talep bulunamadı.");

  return {
    conversation: conv,
    offer: offerDoc.data() as TeklifimOffer,
    request: reqDoc.data() as TeklifimRequest,
  };
}

/**
 * Get messages of a conversation and mark received messages as read
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string
): Promise<TeklifimMessage[]> {
  const db = getDb();
  const convDoc = await db.collection("teklifim_conversations").doc(conversationId).get();
  if (!convDoc.exists) throw new Error("Konuşma bulunamadı.");

  const conv = convDoc.data() as TeklifimConversation;
  if (conv.businessId !== userId && conv.supplierId !== userId) {
    throw new Error("Bu konuşmaya erişim yetkiniz yok.");
  }

  const snap = await db
    .collection("teklifim_messages")
    .where("conversationId", "==", conversationId)
    .get();

  const messages: TeklifimMessage[] = [];
  snap.docs.forEach((d) => messages.push(d.data() as TeklifimMessage));

  // Sort ascending by createdAt
  messages.sort((a, b) => a.createdAt - b.createdAt);

  return messages;
}

/**
 * Mark messages as read by current user
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const db = getDb();
  const convRef = db.collection("teklifim_conversations").doc(conversationId);
  const convDoc = await convRef.get();
  if (!convDoc.exists) return;

  const conv = convDoc.data() as TeklifimConversation;
  if (conv.businessId !== userId && conv.supplierId !== userId) return;

  const isBusiness = conv.businessId === userId;
  const now = Date.now();

  const unreadSnap = await db
    .collection("teklifim_messages")
    .where("conversationId", "==", conversationId)
    .where("isRead", "==", false)
    .get();

  const batch = db.batch();
  let updatedCount = 0;

  unreadSnap.docs.forEach((doc) => {
    const msg = doc.data() as TeklifimMessage;
    if (msg.senderId !== userId) {
      batch.update(doc.ref, {
        isRead: true,
        readAt: now,
        status: "read",
      });
      updatedCount++;
    }
  });

  if (isBusiness) {
    batch.update(convRef, { unreadCountBusiness: 0, updatedAt: now });
  } else {
    batch.update(convRef, { unreadCountSupplier: 0, updatedAt: now });
  }

  if (updatedCount > 0 || isBusiness || !isBusiness) {
    await batch.commit();
  }
}

/**
 * Send a message within a conversation
 */
export async function sendTeklifimMessage(
  conversationId: string,
  senderId: string,
  data: {
    content: string;
    type?: TeklifimMessageType;
    attachment?: TeklifimMessageAttachment;
    counterOfferData?: TeklifimMessage["counterOfferData"];
  }
): Promise<TeklifimMessage> {
  const db = getDb();
  const convRef = db.collection("teklifim_conversations").doc(conversationId);
  const convDoc = await convRef.get();
  if (!convDoc.exists) throw new Error("Konuşma bulunamadı.");

  const conv = convDoc.data() as TeklifimConversation;
  if (conv.businessId !== senderId && conv.supplierId !== senderId) {
    throw new Error("Bu konuşmaya mesaj gönderme yetkiniz yok.");
  }

  // Check if users are blocked
  const blocked = await isUserBlocked(conv.businessId, conv.supplierId);
  if (blocked) {
    throw new Error("Engellenmiş kullanıcılar arasında mesaj gönderilemez.");
  }

  const now = Date.now();

  // Spam rate limiting: check messages sent in the last 60 seconds
  const recentSnap = await db
    .collection("teklifim_messages")
    .where("senderId", "==", senderId)
    .where("createdAt", ">=", now - 60000)
    .get();

  if (recentSnap.size >= 20) {
    throw new Error("Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin.");
  }

  const isBusiness = senderId === conv.businessId;
  const senderRole: "business" | "supplier" = isBusiness ? "business" : "supplier";
  const senderName = isBusiness ? conv.businessName : conv.supplierName;
  const recipientId = isBusiness ? conv.supplierId : conv.businessId;

  const msgRef = db.collection("teklifim_messages").doc();
  const newMsg: TeklifimMessage = {
    id: msgRef.id,
    conversationId,
    requestId: conv.requestId,
    offerId: conv.offerId,
    senderId,
    senderName,
    senderRole,
    content: (data.content || "").trim(),
    type: data.type || "text",
    attachment: data.attachment,
    counterOfferData: data.counterOfferData,
    isRead: false,
    status: "sent",
    createdAt: now,
  };

  await msgRef.set(newMsg);

  // Update conversation last message & unread counter
  const updateData: any = {
    lastMessageText: data.content || (data.attachment ? `[Dosya: ${data.attachment.name}]` : "Mesaj"),
    lastMessageAt: now,
    lastMessageSenderId: senderId,
    updatedAt: now,
  };

  if (isBusiness) {
    updateData.unreadCountSupplier = (conv.unreadCountSupplier || 0) + 1;
  } else {
    updateData.unreadCountBusiness = (conv.unreadCountBusiness || 0) + 1;
  }

  await convRef.update(updateData);

  // Send notification to recipient
  try {
    await sendTeklifimNotification({
      userId: recipientId,
      title: `${senderName} Mesaj Gönderdi`,
      message: data.content ? data.content.slice(0, 100) : "Yeni bir dosya veya teklif gönderildi.",
      link: `/teklifim-gelsin/messages?c=${conversationId}`,
    });
  } catch (err) {
    console.warn("Notification error:", err);
  }

  return newMsg;
}

/**
 * Submit a counter-offer (pazarlık revizyonu)
 */
export async function submitCounterOffer(
  offerId: string,
  userId: string,
  counterData: {
    price: number;
    unitPrice?: number;
    deliveryDays: number;
    quantity?: number;
    note?: string;
  }
): Promise<{ version: TeklifimOfferVersion; message: TeklifimMessage }> {
  const db = getDb();
  const offerRef = db.collection("teklifim_offers").doc(offerId);
  const offerDoc = await offerRef.get();
  if (!offerDoc.exists) throw new Error("Teklif bulunamadı.");
  const offer = offerDoc.data() as TeklifimOffer;

  const reqDoc = await db.collection("teklifim_requests").doc(offer.requestId).get();
  if (!reqDoc.exists) throw new Error("Talep bulunamadı.");
  const req = reqDoc.data() as TeklifimRequest;

  // Authorization check
  if (userId !== req.businessId && userId !== offer.supplierId) {
    throw new Error("Bu teklife karşı teklif verme yetkiniz yok.");
  }

  // Check request status
  if (
    req.status === "cancelled" ||
    req.status === "completed" ||
    req.status === "expired" ||
    checkRequestDeadlineExpired(req)
  ) {
    throw new Error("Bu talep kapatılmıştır veya süresi dolmuştur.");
  }

  // Check offer status
  if (offer.status === "accepted" || offer.status === "selected") {
    throw new Error("Kabul edilmiş bir teklife karşı teklif verilemez.");
  }
  if (offer.status === "rejected" || offer.status === "expired") {
    throw new Error("Reddedilmiş veya süresi dolmuş bir teklife karşı teklif verilemez.");
  }

  // Block check
  const blocked = await isUserBlocked(req.businessId, offer.supplierId);
  if (blocked) {
    throw new Error("Engellenmiş kullanıcılar arasında pazarlık yapılamaz.");
  }

  // Check existing versions
  const versionsSnap = await db
    .collection("teklifim_offer_versions")
    .where("offerId", "==", offerId)
    .get();

  if (versionsSnap.size >= 10) {
    throw new Error("Maksimum 10 pazarlık revizyon sınırına ulaşıldı.");
  }

  const proposedBy: "business" | "supplier" = userId === req.businessId ? "business" : "supplier";
  const proposerName = proposedBy === "business" ? req.businessName : offer.supplierName;
  const now = Date.now();

  // If this is the first counter-offer, archive the initial offer as version 1
  if (versionsSnap.empty) {
    const v1Ref = db.collection("teklifim_offer_versions").doc(`${offerId}_v1`);
    await v1Ref.set({
      id: v1Ref.id,
      offerId,
      requestId: offer.requestId,
      version: 1,
      proposedBy: "supplier",
      proposerId: offer.supplierId,
      proposerName: offer.supplierName,
      totalPrice: offer.totalPrice,
      unitPrice: offer.unitPrice,
      deliveryDays: offer.deliveryDays,
      quantity: req.quantity,
      description: offer.description || "İlk Teklif",
      status: "superseded",
      createdAt: offer.createdAt || now,
    });
  }

  const nextVersionNum = (versionsSnap.size === 0 ? 1 : versionsSnap.size) + 1;
  const newPrice = Number(counterData.price);
  const targetQuantity = Number(counterData.quantity) || req.quantity || 1;
  const newUnitPrice =
    Number(counterData.unitPrice) || Math.round((newPrice / targetQuantity) * 100) / 100;
  const newDeliveryDays = Number(counterData.deliveryDays) || offer.deliveryDays;

  // Create new version doc
  const vRef = db.collection("teklifim_offer_versions").doc(`${offerId}_v${nextVersionNum}`);
  const newVersion: TeklifimOfferVersion = {
    id: vRef.id,
    offerId,
    requestId: offer.requestId,
    version: nextVersionNum,
    proposedBy,
    proposerId: userId,
    proposerName,
    totalPrice: newPrice,
    unitPrice: newUnitPrice,
    deliveryDays: newDeliveryDays,
    quantity: targetQuantity,
    description: counterData.note || "",
    status: "submitted",
    createdAt: now,
  };

  await vRef.set(newVersion);

  // Update offer live data
  await offerRef.update({
    totalPrice: newPrice,
    unitPrice: newUnitPrice,
    deliveryDays: newDeliveryDays,
    version: nextVersionNum,
    negotiationCount: nextVersionNum,
    lastCounterBy: proposedBy,
    status: "countered",
    updatedAt: now,
  });

  // Ensure conversation exists and post counter_offer message
  const conv = await getOrCreateConversation(req.id, offer.id, userId);

  const messageText = `${proposerName} karşı teklif sundu (Revizyon #${nextVersionNum}): ${newPrice.toLocaleString("tr-TR")} TL, ${newDeliveryDays} gün teslimat.${counterData.note ? ` Not: "${counterData.note}"` : ""}`;

  const message = await sendTeklifimMessage(conv.id, userId, {
    content: messageText,
    type: "counter_offer",
    counterOfferData: {
      version: nextVersionNum,
      price: newPrice,
      unitPrice: newUnitPrice,
      deliveryDays: newDeliveryDays,
      quantity: targetQuantity,
      note: counterData.note,
      proposedBy,
    },
  });

  return { version: newVersion, message };
}

/**
 * Get all revision versions for an offer
 */
export async function getOfferVersionHistory(
  offerId: string,
  userId: string
): Promise<TeklifimOfferVersion[]> {
  const db = getDb();
  const offerDoc = await db.collection("teklifim_offers").doc(offerId).get();
  if (!offerDoc.exists) throw new Error("Teklif bulunamadı.");
  const offer = offerDoc.data() as TeklifimOffer;

  const reqDoc = await db.collection("teklifim_requests").doc(offer.requestId).get();
  if (!reqDoc.exists) throw new Error("Talep bulunamadı.");
  const req = reqDoc.data() as TeklifimRequest;

  if (userId !== req.businessId && userId !== offer.supplierId) {
    throw new Error("Teklif geçmişini görme yetkiniz yok.");
  }

  const snap = await db
    .collection("teklifim_offer_versions")
    .where("offerId", "==", offerId)
    .get();

  if (snap.empty) {
    // Return synthetic initial version
    return [
      {
        id: `${offerId}_v1`,
        offerId,
        requestId: offer.requestId,
        version: 1,
        proposedBy: "supplier",
        proposerId: offer.supplierId,
        proposerName: offer.supplierName,
        totalPrice: offer.totalPrice,
        unitPrice: offer.unitPrice,
        deliveryDays: offer.deliveryDays,
        quantity: req.quantity,
        description: offer.description || "İlk Teklif",
        status: "submitted",
        createdAt: offer.createdAt || Date.now(),
      },
    ];
  }

  const versions: TeklifimOfferVersion[] = [];
  snap.docs.forEach((d) => versions.push(d.data() as TeklifimOfferVersion));
  return versions.sort((a, b) => a.version - b.version);
}

/**
 * Accept a final offer, generate official Agreement contract ANL-2026-XXXX
 */
export async function acceptTeklifimOffer(
  offerId: string,
  acceptingUserId: string
): Promise<TeklifimAgreement> {
  const db = getDb();
  const offerRef = db.collection("teklifim_offers").doc(offerId);
  const offerDoc = await offerRef.get();
  if (!offerDoc.exists) throw new Error("Teklif bulunamadı.");
  const offer = offerDoc.data() as TeklifimOffer;

  const reqRef = db.collection("teklifim_requests").doc(offer.requestId);
  const reqDoc = await reqRef.get();
  if (!reqDoc.exists) throw new Error("Talep bulunamadı.");
  const req = reqDoc.data() as TeklifimRequest;

  // Authorization: Only business owner can accept offer
  if (acceptingUserId !== req.businessId) {
    throw new Error("Yalnızca talep sahibi işletme teklifi kabul edebilir.");
  }

  // State checks
  if (
    req.status === "cancelled" ||
    req.status === "completed" ||
    req.status === "expired" ||
    checkRequestDeadlineExpired(req)
  ) {
    throw new Error("Bu talep kapatılmıştır veya süresi dolmuştur.");
  }

  if (offer.status === "accepted" || offer.status === "selected") {
    throw new Error("Bu teklif zaten kabul edilmiştir.");
  }
  if (offer.status === "rejected" || offer.status === "expired") {
    throw new Error("Reddedilmiş veya süresi dolmuş teklif kabul edilemez.");
  }

  const now = Date.now();

  // Load profiles for contact info
  const [bizProfile, supProfile] = await Promise.all([
    getTeklifimProfile(req.businessId),
    getTeklifimProfile(offer.supplierId),
  ]);

  // Generate agreement number: ANL-2026-XXXX
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const agreementNumber = `ANL-2026-${randomSuffix}`;
  const agreementId = `agr_${offerId}`;

  const agreement: TeklifimAgreement = {
    id: agreementId,
    agreementNumber,
    requestId: req.id,
    requestTitle: req.title,
    offerId: offer.id,
    businessId: req.businessId,
    businessName: req.businessName || "İşletme",
    businessPhone: bizProfile?.phone || req.businessPhone || "",
    businessEmail: bizProfile?.email || req.businessEmail || "",
    supplierId: offer.supplierId,
    supplierName: offer.supplierName || "Tedarikçi",
    supplierPhone: supProfile?.phone || offer.supplierPhone || "",
    supplierEmail: supProfile?.email || offer.supplierEmail || "",
    productName: req.productName || req.title,
    category: req.category,
    quantity: req.quantity,
    unit: req.unit,
    acceptedPrice: offer.totalPrice,
    unitPrice: offer.unitPrice,
    currency: offer.currency || "TL",
    deliveryDays: offer.deliveryDays,
    city: req.city,
    district: req.district || "",
    termsNotes: offer.description || "",
    finalVersion: offer.version || 1,
    status: "agreement_reached",
    statusHistory: [
      {
        status: "agreement_reached",
        changedBy: acceptingUserId,
        timestamp: now,
        note: "Teklif işletme tarafından onaylandı ve resmi anlaşma sağlandı.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Save agreement
  await db.collection("teklifim_agreements").doc(agreementId).set(agreement);

  // Update offer to accepted & selected
  await offerRef.update({
    status: "accepted",
    updatedAt: now,
  });

  // Update request to supplier_selected
  await reqRef.update({
    status: "supplier_selected",
    selectedOfferId: offer.id,
    selectedSupplierId: offer.supplierId,
    updatedAt: now,
  });

  // Increment completed deals counter on supplier profile
  try {
    const sProfRef = db.collection("teklifim_profiles").doc(offer.supplierId);
    const sDoc = await sProfRef.get();
    if (sDoc.exists) {
      const currentDeals = sDoc.data()?.completedDeals || 0;
      await sProfRef.update({ completedDeals: currentDeals + 1, updatedAt: now });
    }
  } catch (err) {
    console.warn("Supplier deal increment notice:", err);
  }

  // Ensure conversation exists and send agreement notification & message
  const conv = await getOrCreateConversation(req.id, offer.id, acceptingUserId);

  await sendTeklifimMessage(conv.id, acceptingUserId, {
    content: `Resmi Anlaşma Sağlandı! Sözleşme No: ${agreementNumber}. Tutar: ${offer.totalPrice.toLocaleString("tr-TR")} TL, Teslimat: ${offer.deliveryDays} gün.`,
    type: "agreement",
  });

  // Notifications
  try {
    await Promise.all([
      sendTeklifimNotification({
        userId: offer.supplierId,
        title: "Tebrikler, Teklifiniz Kabul Edildi!",
        message: `"${req.title}" için ${offer.totalPrice.toLocaleString("tr-TR")} TL tutarındaki teklifiniz onaylandı. Anlaşma No: ${agreementNumber}.`,
        link: `/teklifim-gelsin/messages?c=${conv.id}`,
      }),
      sendTeklifimNotification({
        userId: req.businessId,
        title: "Anlaşma Oluşturuldu",
        message: `"${req.title}" talebiniz için ${offer.supplierName} ile anlaşma sağlandı. Anlaşma No: ${agreementNumber}.`,
        link: `/teklifim-gelsin/messages?c=${conv.id}`,
      }),
    ]);
  } catch (err) {
    console.warn("Notification notice:", err);
  }

  // Auto-generate initial order from accepted agreement
  try {
    await createOrderFromAgreement(agreementId, acceptingUserId);
  } catch (orderErr) {
    console.warn("Auto order generation notice:", orderErr);
  }

  return agreement;
}

/**
 * Get single agreement details
 */
export async function getAgreementDetails(
  agreementId: string,
  userId: string
): Promise<TeklifimAgreement> {
  const db = getDb();
  const doc = await db.collection("teklifim_agreements").doc(agreementId).get();
  if (!doc.exists) throw new Error("Anlaşma kaydı bulunamadı.");

  const agreement = doc.data() as TeklifimAgreement;
  if (agreement.businessId !== userId && agreement.supplierId !== userId) {
    throw new Error("Bu anlaşmayı görüntüleme yetkiniz yok.");
  }

  return agreement;
}

/**
 * Get all agreements for a user
 */
export async function getUserAgreements(userId: string): Promise<TeklifimAgreement[]> {
  const db = getDb();
  const [bizSnap, supSnap] = await Promise.all([
    db.collection("teklifim_agreements").where("businessId", "==", userId).get(),
    db.collection("teklifim_agreements").where("supplierId", "==", userId).get(),
  ]);

  const map = new Map<string, TeklifimAgreement>();
  bizSnap.docs.forEach((d) => map.set(d.id, d.data() as TeklifimAgreement));
  supSnap.docs.forEach((d) => map.set(d.id, d.data() as TeklifimAgreement));

  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Update agreement milestone status
 */
export async function updateAgreementStatus(
  agreementId: string,
  userId: string,
  newStatus: TeklifimAgreementStatus,
  note?: string
): Promise<TeklifimAgreement> {
  const db = getDb();
  const docRef = db.collection("teklifim_agreements").doc(agreementId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Anlaşma bulunamadı.");

  const agreement = doc.data() as TeklifimAgreement;
  if (agreement.businessId !== userId && agreement.supplierId !== userId) {
    throw new Error("Bu anlaşmayı güncelleme yetkiniz yok.");
  }

  const now = Date.now();
  const historyItem = {
    status: newStatus,
    changedBy: userId,
    timestamp: now,
    note: note || `Durum güncellendi: ${newStatus}`,
  };

  const updatedHistory = [...(agreement.statusHistory || []), historyItem];

  await docRef.update({
    status: newStatus,
    statusHistory: updatedHistory,
    updatedAt: now,
  });

  // If status is completed, update request to completed
  if (newStatus === "completed") {
    await db
      .collection("teklifim_requests")
      .doc(agreement.requestId)
      .update({ status: "completed", updatedAt: now });
  }

  // Notify other party
  const recipientId = userId === agreement.businessId ? agreement.supplierId : agreement.businessId;
  const senderName = userId === agreement.businessId ? agreement.businessName : agreement.supplierName;

  try {
    await sendTeklifimNotification({
      userId: recipientId,
      title: "Anlaşma Durumu Güncellendi",
      message: `${senderName}, ${agreement.agreementNumber} numaralı anlaşmayı "${newStatus}" olarak güncelledi.`,
      link: `/teklifim-gelsin/messages?c=conv_${agreement.offerId}`,
    });
  } catch {}

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimAgreement;
}

// ==========================================
// FAZ 5: SİPARİŞ, TESLİMAT & İŞLEM MOTORU
// ==========================================

/**
 * Generate human-readable, collision-free order number (SIP-2026-XXXXXX)
 */
export async function generateUniqueOrderNumber(): Promise<string> {
  const db = getDb();
  let attempts = 0;
  while (attempts < 10) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const candidate = `SIP-2026-${randomNum}`;
    const snap = await db
      .collection("teklifim_orders")
      .where("orderNumber", "==", candidate)
      .limit(1)
      .get();
    if (snap.empty) {
      return candidate;
    }
    attempts++;
  }
  return `SIP-2026-${Date.now().toString().slice(-6)}`;
}

/**
 * Compute real-time delivery status (remaining days or delay signal)
 */
export function computeDeliveryStatus(order: TeklifimOrder): {
  isDelayed: boolean;
  isApproaching: boolean;
  daysLeft: number;
  text: string;
} {
  if (order.status === "completed" || order.status === "delivered") {
    return { isDelayed: false, isApproaching: false, daysLeft: 0, text: "Teslim Edildi" };
  }
  if (order.status === "cancelled") {
    return { isDelayed: false, isApproaching: false, daysLeft: 0, text: "İptal Edildi" };
  }
  if (order.status === "disputed") {
    return { isDelayed: false, isApproaching: false, daysLeft: 0, text: "Anlaşmazlık Bildirildi" };
  }

  const now = Date.now();
  const diffMs = order.expectedDeliveryDate - now;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { isDelayed: true, isApproaching: false, daysLeft, text: "Teslimat gecikti" };
  }
  if (daysLeft <= 2) {
    return {
      isDelayed: false,
      isApproaching: true,
      daysLeft,
      text: daysLeft === 0 ? "Bugün teslimat bekleniyor" : `${daysLeft} gün kaldı`,
    };
  }
  return { isDelayed: false, isApproaching: false, daysLeft, text: `${daysLeft} gün kaldı` };
}

/**
 * Create Order from Accepted Agreement with complete snapshot integrity
 */
export async function createOrderFromAgreement(
  agreementId: string,
  requestingUserId: string,
  deliveryConfig?: {
    deliveryMethod?: TeklifimDeliveryMethod;
    deliveryAddress?: Partial<TeklifimDeliveryAddress>;
    notes?: string;
  }
): Promise<TeklifimOrder> {
  const db = getDb();
  const agrDoc = await db.collection("teklifim_agreements").doc(agreementId).get();
  if (!agrDoc.exists) throw new Error("Anlaşma bulunamadı.");

  const agr = agrDoc.data() as TeklifimAgreement;

  // Authorization: Only agreement parties or admin can spawn order
  if (requestingUserId !== agr.businessId && requestingUserId !== agr.supplierId) {
    throw new Error("Bu anlaşmadan sipariş oluşturma yetkiniz bulunmamaktadır.");
  }

  // Prevent duplicates: Check if order already exists for this agreement
  const orderId = `ord_${agreementId}`;
  const existingOrderDoc = await db.collection("teklifim_orders").doc(orderId).get();
  if (existingOrderDoc.exists) {
    return existingOrderDoc.data() as TeklifimOrder;
  }

  const existingByAgr = await db
    .collection("teklifim_orders")
    .where("agreementId", "==", agreementId)
    .limit(1)
    .get();
  if (!existingByAgr.empty) {
    return existingByAgr.docs[0].data() as TeklifimOrder;
  }

  const now = Date.now();
  const orderNumber = await generateUniqueOrderNumber();
  const expectedDeliveryDate = now + (Number(agr.deliveryDays) || 5) * 24 * 60 * 60 * 1000;

  // Snapshot items (never changes after creation)
  const items: TeklifimOrderItem[] = [
    {
      productName: agr.productName || agr.requestTitle || "Tedarik Kalemi",
      category: agr.category || "Diğer",
      quantity: Number(agr.quantity) || 1,
      unit: agr.unit || "Adet",
      unitPrice: Number(agr.unitPrice) || 0,
      totalPrice: Number(agr.acceptedPrice) || 0,
    },
  ];

  // Delivery Address snapshot
  const deliveryAddress: TeklifimDeliveryAddress = {
    contactName: deliveryConfig?.deliveryAddress?.contactName || agr.businessName || "Yetkili",
    phone: deliveryConfig?.deliveryAddress?.phone || agr.businessPhone || "",
    addressLine: deliveryConfig?.deliveryAddress?.addressLine || `${agr.city} Merkez Depo / İşletme Adresi`,
    city: deliveryConfig?.deliveryAddress?.city || agr.city || "İstanbul",
    district: deliveryConfig?.deliveryAddress?.district || agr.district || "",
  };

  const newOrder: TeklifimOrder = {
    id: orderId,
    orderNumber,
    agreementId,
    agreementNumber: agr.agreementNumber,
    requestId: agr.requestId,
    requestTitle: agr.requestTitle,
    offerId: agr.offerId,
    businessId: agr.businessId,
    businessName: agr.businessName,
    businessPhone: agr.businessPhone,
    businessEmail: agr.businessEmail,
    supplierId: agr.supplierId,
    supplierName: agr.supplierName,
    supplierPhone: agr.supplierPhone,
    supplierEmail: agr.supplierEmail,
    items,
    quantity: Number(agr.quantity) || 1,
    unit: agr.unit || "Adet",
    unitPrice: Number(agr.unitPrice) || 0,
    totalPrice: Number(agr.acceptedPrice) || 0,
    currency: agr.currency || "TL",
    deliveryDays: Number(agr.deliveryDays) || 5,
    expectedDeliveryDate,
    deliveryMethod: deliveryConfig?.deliveryMethod || "cargo",
    deliveryAddress,
    notes: deliveryConfig?.notes || agr.termsNotes || "",
    status: "preparing",
    statusHistory: [
      {
        status: "preparing",
        changedBy: requestingUserId,
        timestamp: now,
        note: "Sipariş kabul edilmiş anlaşmadan oluşturuldu ve hazırlık aşamasına alındı.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Save order to Firestore
  await db.collection("teklifim_orders").doc(orderId).set(newOrder);

  // Update agreement with orderId
  await db.collection("teklifim_agreements").doc(agreementId).update({
    orderId,
    updatedAt: now,
  });

  // Notifications
  try {
    await Promise.all([
      sendTeklifimNotification({
        userId: agr.businessId,
        title: "Siparişiniz Oluşturuldu",
        message: `${newOrder.orderNumber} numaralı siparişiniz oluşturuldu ve hazırlık aşamasına alındı.`,
        link: `/teklifim-gelsin/orders/${newOrder.id}`,
      }),
      sendTeklifimNotification({
        userId: agr.supplierId,
        title: "Yeni Sipariş Alındı!",
        message: `${newOrder.orderNumber} numaralı yeni siparişiniz oluşturuldu. Hazırlamaya başlayabilirsiniz.`,
        link: `/teklifim-gelsin/orders/${newOrder.id}`,
      }),
    ]);
  } catch (err) {
    console.warn("Order notification error:", err);
  }

  // Conversation system message
  try {
    const convId = `conv_${agr.offerId}`;
    const convDoc = await db.collection("teklifim_conversations").doc(convId).get();
    if (convDoc.exists) {
      await sendTeklifimMessage(convId, requestingUserId, {
        content: `Resmi Sipariş Oluşturuldu! Sipariş No: ${newOrder.orderNumber}. Durum: Hazırlanıyor.`,
        type: "system",
      });
    }
  } catch {}

  return newOrder;
}

/**
 * Get Order Details with multi-tenant privacy enforcement
 */
export async function getTeklifimOrderDetails(
  orderId: string,
  userId: string
): Promise<TeklifimOrder> {
  const db = getDb();
  const doc = await db.collection("teklifim_orders").doc(orderId).get();
  if (!doc.exists) throw new Error("Sipariş bulunamadı.");

  const order = doc.data() as TeklifimOrder;
  if (order.businessId !== userId && order.supplierId !== userId) {
    throw new Error("Bu siparişi görüntüleme yetkiniz yok.");
  }

  return order;
}

/**
 * Get All Orders for a User with role and status filtering
 */
export async function getUserTeklifimOrders(
  userId: string,
  statusFilter?: string
): Promise<TeklifimOrder[]> {
  const db = getDb();
  const [bizSnap, supSnap] = await Promise.all([
    db.collection("teklifim_orders").where("businessId", "==", userId).get(),
    db.collection("teklifim_orders").where("supplierId", "==", userId).get(),
  ]);

  const map = new Map<string, TeklifimOrder>();
  bizSnap.docs.forEach((d) => map.set(d.id, d.data() as TeklifimOrder));
  supSnap.docs.forEach((d) => map.set(d.id, d.data() as TeklifimOrder));

  let orders = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);

  if (statusFilter && statusFilter !== "all") {
    if (statusFilter === "active") {
      orders = orders.filter(
        (o) =>
          o.status === "preparing" ||
          o.status === "ready_for_dispatch" ||
          o.status === "shipped" ||
          o.status === "delivered"
      );
    } else if (statusFilter === "completed") {
      orders = orders.filter((o) => o.status === "completed");
    } else if (statusFilter === "cancelled") {
      orders = orders.filter((o) => o.status === "cancelled");
    } else if (statusFilter === "disputed") {
      orders = orders.filter((o) => o.status === "disputed");
    } else {
      orders = orders.filter((o) => o.status === statusFilter);
    }
  }

  return orders;
}

/**
 * Get All Orders for Admin Oversight
 */
export async function getAllTeklifimOrdersForAdmin(statusFilter?: string): Promise<TeklifimOrder[]> {
  const db = getDb();
  let snap;
  if (statusFilter && statusFilter !== "all") {
    snap = await db
      .collection("teklifim_orders")
      .where("status", "==", statusFilter)
      .limit(100)
      .get();
  } else {
    snap = await db.collection("teklifim_orders").limit(100).get();
  }

  const orders: TeklifimOrder[] = [];
  snap.forEach((d) => orders.push(d.data() as TeklifimOrder));
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Update Order Status with strict state machine transition validation
 */
export async function updateTeklifimOrderStatus(
  orderId: string,
  userId: string,
  newStatus: TeklifimOrderStatus,
  note?: string
): Promise<TeklifimOrder> {
  const db = getDb();
  const docRef = db.collection("teklifim_orders").doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Sipariş bulunamadı.");

  const order = doc.data() as TeklifimOrder;
  if (order.businessId !== userId && order.supplierId !== userId) {
    throw new Error("Bu siparişi güncelleme yetkiniz yok.");
  }

  const isBusiness = order.businessId === userId;
  const isSupplier = order.supplierId === userId;

  // Strict State Machine Verification
  if (order.status === "completed") {
    throw new Error("Tamamlanmış bir siparişin durumu değiştirilemez.");
  }
  if (order.status === "cancelled") {
    throw new Error("İptal edilmiş bir sipariş yeniden aktif hale getirilemez.");
  }

  // Restrictions on who can trigger what transition
  if (newStatus === "preparing" && !isSupplier) {
    throw new Error("Yalnızca tedarikçi hazırlık durumunu güncelleyebilir.");
  }
  if (newStatus === "ready_for_dispatch" && !isSupplier) {
    throw new Error("Yalnızca tedarikçi sevke hazır durumuna geçirebilir.");
  }
  if (newStatus === "shipped" && !isSupplier) {
    throw new Error("Yalnızca tedarikçi kargo/sevk durumunu işaretleyebilir.");
  }
  if (newStatus === "completed" && !isBusiness) {
    throw new Error("Yalnızca alıcı işletme siparişi tamamlayıp onaylayabilir.");
  }

  const now = Date.now();
  const historyItem = {
    status: newStatus,
    changedBy: userId,
    timestamp: now,
    note: note || `Sipariş durumu "${newStatus}" olarak güncellendi.`,
  };

  const updatedHistory = [...(order.statusHistory || []), historyItem];
  const updatePayload: any = {
    status: newStatus,
    statusHistory: updatedHistory,
    updatedAt: now,
  };

  if (newStatus === "completed") {
    updatePayload.completedAt = now;
  }

  await docRef.update(updatePayload);

  // Notify other party
  const recipientId = isBusiness ? order.supplierId : order.businessId;
  const senderName = isBusiness ? order.businessName : order.supplierName;

  try {
    await sendTeklifimNotification({
      userId: recipientId,
      title: "Sipariş Durumu Güncellendi",
      message: `${senderName}, ${order.orderNumber} numaralı siparişi "${newStatus}" olarak güncelledi.`,
      link: `/teklifim-gelsin/orders/${order.id}`,
    });
  } catch {}

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimOrder;
}

/**
 * Add Carrier & Tracking Information (Tedarikçi Kargo Girişi)
 */
export async function addTeklifimOrderTracking(
  orderId: string,
  userId: string,
  trackingData: {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
  }
): Promise<TeklifimOrder> {
  const db = getDb();
  const docRef = db.collection("teklifim_orders").doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Sipariş bulunamadı.");

  const order = doc.data() as TeklifimOrder;
  if (order.supplierId !== userId) {
    throw new Error("Yalnızca tedarikçi kargo takip bilgisi girebilir.");
  }

  if (order.status === "completed" || order.status === "cancelled") {
    throw new Error("Bu siparişe kargo bilgisi eklenemez.");
  }

  if (!trackingData.carrier || !trackingData.carrier.trim()) {
    throw new Error("Lütfen kargo / lojistik firması belirtin.");
  }
  if (!trackingData.trackingNumber || !trackingData.trackingNumber.trim()) {
    throw new Error("Lütfen geçerli bir kargo takip numarası belirtin.");
  }

  const now = Date.now();
  const trackingInfo: TeklifimOrderTracking = {
    carrier: trackingData.carrier.trim(),
    trackingNumber: trackingData.trackingNumber.trim(),
    trackingUrl: trackingData.trackingUrl?.trim(),
    shippedAt: now,
  };

  const historyItem = {
    status: "shipped" as TeklifimOrderStatus,
    changedBy: userId,
    timestamp: now,
    note: `Kargoya verildi. Kargo: ${trackingInfo.carrier}, Takip No: ${trackingInfo.trackingNumber}`,
  };

  await docRef.update({
    trackingInfo,
    status: "shipped",
    statusHistory: [...(order.statusHistory || []), historyItem],
    updatedAt: now,
  });

  // Notify business
  try {
    await sendTeklifimNotification({
      userId: order.businessId,
      title: "Siparişiniz Kargoya Verildi!",
      message: `${order.orderNumber} numaralı siparişiniz ${trackingInfo.carrier} ile kargoya verildi. Takip No: ${trackingInfo.trackingNumber}`,
      link: `/teklifim-gelsin/orders/${order.id}`,
    });
  } catch {}

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimOrder;
}

/**
 * Confirm Delivery with Proof of Delivery (İşletme Teslim Alma)
 */
export async function confirmTeklifimOrderDelivery(
  orderId: string,
  userId: string,
  proofData: {
    receivedBy: string;
    proofNote?: string;
    proofPhotoUrl?: string;
  }
): Promise<TeklifimOrder> {
  const db = getDb();
  const docRef = db.collection("teklifim_orders").doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Sipariş bulunamadı.");

  const order = doc.data() as TeklifimOrder;
  if (order.businessId !== userId) {
    throw new Error("Yalnızca alıcı işletme siparişi teslim aldığını bildirebilir.");
  }

  if (order.status === "completed" || order.status === "cancelled") {
    throw new Error("Bu sipariş için teslim alma işlemi yapılamaz.");
  }

  if (!proofData.receivedBy || !proofData.receivedBy.trim()) {
    throw new Error("Lütfen teslim alan kişi adını belirtin.");
  }

  const now = Date.now();
  const deliveryProof: TeklifimDeliveryProof = {
    deliveredAt: now,
    receivedBy: proofData.receivedBy.trim(),
    proofNote: proofData.proofNote?.trim(),
    proofPhotoUrl: proofData.proofPhotoUrl?.trim(),
  };

  const historyItem = {
    status: "delivered" as TeklifimOrderStatus,
    changedBy: userId,
    timestamp: now,
    note: `Teslim alındı. Teslim Alan: ${deliveryProof.receivedBy}${deliveryProof.proofNote ? ` Not: ${deliveryProof.proofNote}` : ""}`,
  };

  await docRef.update({
    deliveryProof,
    status: "delivered",
    statusHistory: [...(order.statusHistory || []), historyItem],
    updatedAt: now,
  });

  // Notify supplier
  try {
    await sendTeklifimNotification({
      userId: order.supplierId,
      title: "Sipariş Teslim Alındı",
      message: `${order.businessName}, ${order.orderNumber} numaralı siparişi teslim aldığını bildirdi.`,
      link: `/teklifim-gelsin/orders/${order.id}`,
    });
  } catch {}

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimOrder;
}

/**
 * Complete Order (İşletme Siparişi Tamamlar & Onaylar)
 */
export async function completeTeklifimOrder(
  orderId: string,
  userId: string
): Promise<TeklifimOrder> {
  const db = getDb();
  const docRef = db.collection("teklifim_orders").doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Sipariş bulunamadı.");

  const order = doc.data() as TeklifimOrder;
  if (order.businessId !== userId) {
    throw new Error("Yalnızca alıcı işletme siparişi tamamlayıp onaylayabilir.");
  }

  if (order.status === "completed") {
    return order;
  }
  if (order.status === "cancelled") {
    throw new Error("İptal edilmiş sipariş tamamlanamaz.");
  }

  const now = Date.now();
  const historyItem = {
    status: "completed" as TeklifimOrderStatus,
    changedBy: userId,
    timestamp: now,
    note: "Sipariş işletme tarafından eksiksiz onaylandı ve tamamlandı.",
  };

  await docRef.update({
    status: "completed",
    completedAt: now,
    statusHistory: [...(order.statusHistory || []), historyItem],
    updatedAt: now,
  });

  // Update request to completed as well
  try {
    await db
      .collection("teklifim_requests")
      .doc(order.requestId)
      .update({ status: "completed", updatedAt: now });
  } catch {}

  // Increment completedDeals on supplier profile
  try {
    const sProfRef = db.collection("teklifim_profiles").doc(order.supplierId);
    const sDoc = await sProfRef.get();
    if (sDoc.exists) {
      const deals = sDoc.data()?.completedDeals || 0;
      await sProfRef.update({ completedDeals: deals + 1, updatedAt: now });
    }
  } catch {}

  // Notify supplier
  try {
    await sendTeklifimNotification({
      userId: order.supplierId,
      title: "Tebrikler, Sipariş Başarıyla Tamamlandı!",
      message: `${order.orderNumber} numaralı sipariş başarıyla tamamlandı. İşlem geçmişinize eklendi.`,
      link: `/teklifim-gelsin/orders/${order.id}`,
    });
  } catch {}

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimOrder;
}

/**
 * Cancel Order with strict timing checks (İptal)
 */
export async function cancelTeklifimOrder(
  orderId: string,
  userId: string,
  cancelData: {
    reason: string;
    note?: string;
  }
): Promise<TeklifimOrder> {
  const db = getDb();
  const docRef = db.collection("teklifim_orders").doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Sipariş bulunamadı.");

  const order = doc.data() as TeklifimOrder;
  if (order.businessId !== userId && order.supplierId !== userId) {
    throw new Error("Bu siparişi iptal etme yetkiniz yok.");
  }

  if (order.status === "completed") {
    throw new Error("Tamamlanmış sipariş iptal edilemez.");
  }
  if (order.status === "cancelled") {
    throw new Error("Sipariş zaten iptal edilmiştir.");
  }
  if (order.status === "shipped") {
    throw new Error("Kargoya verilmiş sipariş doğrudan iptal edilemez. Lütfen anlaşmazlık bildiriniz.");
  }

  const now = Date.now();
  const cancellation: TeklifimOrderCancellation = {
    cancelledAt: now,
    cancelledBy: userId,
    reason: cancelData.reason as any,
    note: cancelData.note?.trim(),
  };

  const historyItem = {
    status: "cancelled" as TeklifimOrderStatus,
    changedBy: userId,
    timestamp: now,
    note: `Sipariş iptal edildi. Gerekçe: ${cancellation.reason}${cancellation.note ? ` - ${cancellation.note}` : ""}`,
  };

  await docRef.update({
    cancellation,
    status: "cancelled",
    statusHistory: [...(order.statusHistory || []), historyItem],
    updatedAt: now,
  });

  const isBusiness = order.businessId === userId;
  const recipientId = isBusiness ? order.supplierId : order.businessId;
  const senderName = isBusiness ? order.businessName : order.supplierName;

  try {
    await sendTeklifimNotification({
      userId: recipientId,
      title: "Sipariş İptal Edildi",
      message: `${senderName}, ${order.orderNumber} numaralı siparişi iptal etti. Gerekçe: ${cancellation.reason}`,
      link: `/teklifim-gelsin/orders/${order.id}`,
    });
  } catch {}

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimOrder;
}

/**
 * File Order Dispute (Anlaşmazlık Bildir)
 */
export async function disputeTeklifimOrder(
  orderId: string,
  userId: string,
  disputeData: {
    reason: string;
    description: string;
  }
): Promise<TeklifimOrder> {
  const db = getDb();
  const docRef = db.collection("teklifim_orders").doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Sipariş bulunamadı.");

  const order = doc.data() as TeklifimOrder;
  if (order.businessId !== userId && order.supplierId !== userId) {
    throw new Error("Bu sipariş için anlaşmazlık bildirme yetkiniz yok.");
  }

  if (order.status === "cancelled") {
    throw new Error("İptal edilmiş sipariş için anlaşmazlık açılamaz.");
  }

  if (!disputeData.reason || !disputeData.reason.trim()) {
    throw new Error("Lütfen anlaşmazlık nedenini seçin.");
  }
  if (!disputeData.description || !disputeData.description.trim()) {
    throw new Error("Lütfen anlaşmazlık açıklamasını detaylı belirtin.");
  }

  const now = Date.now();
  const dispute: TeklifimOrderDispute = {
    disputedAt: now,
    disputedBy: userId,
    reason: disputeData.reason as any,
    description: disputeData.description.trim(),
  };

  const historyItem = {
    status: "disputed" as TeklifimOrderStatus,
    changedBy: userId,
    timestamp: now,
    note: `Anlaşmazlık bildirildi. Neden: ${dispute.reason}. Açıklama: ${dispute.description}`,
  };

  await docRef.update({
    dispute,
    status: "disputed",
    statusHistory: [...(order.statusHistory || []), historyItem],
    updatedAt: now,
  });

  const isBusiness = order.businessId === userId;
  const recipientId = isBusiness ? order.supplierId : order.businessId;
  const senderName = isBusiness ? order.businessName : order.supplierName;

  try {
    await sendTeklifimNotification({
      userId: recipientId,
      title: "Sipariş Hakkında Anlaşmazlık Bildirildi",
      message: `${senderName}, ${order.orderNumber} numaralı sipariş için anlaşmazlık bildirdi: ${dispute.reason}`,
      link: `/teklifim-gelsin/orders/${order.id}`,
    });
  } catch {}

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimOrder;
}

/**
 * Admin Resolve Order Dispute (Admin Anlaşmazlık Çözümleme)
 */
export async function resolveTeklifimOrderDispute(
  orderId: string,
  adminUserId: string,
  resolutionData: {
    status: TeklifimOrderStatus;
    resolutionNotes: string;
  }
): Promise<TeklifimOrder> {
  const db = getDb();
  const docRef = db.collection("teklifim_orders").doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Sipariş bulunamadı.");

  const order = doc.data() as TeklifimOrder;
  if (order.status !== "disputed") {
    throw new Error("Yalnızca anlaşmazlık aşamasındaki siparişler çözümlenebilir.");
  }

  const now = Date.now();
  const updatedDispute: TeklifimOrderDispute = {
    ...(order.dispute || {
      disputedAt: now,
      disputedBy: adminUserId,
      reason: "other",
      description: "Admin incelemesi",
    }),
    resolvedAt: now,
    resolvedBy: adminUserId,
    resolutionNotes: resolutionData.resolutionNotes.trim(),
  };

  const historyItem = {
    status: resolutionData.status,
    changedBy: adminUserId,
    timestamp: now,
    note: `Yönetici kararı: ${resolutionData.resolutionNotes}`,
  };

  const updatePayload: any = {
    dispute: updatedDispute,
    status: resolutionData.status,
    statusHistory: [...(order.statusHistory || []), historyItem],
    updatedAt: now,
  };

  if (resolutionData.status === "completed") {
    updatePayload.completedAt = now;
  }

  await docRef.update(updatePayload);

  // Notify both parties
  try {
    await Promise.all([
      sendTeklifimNotification({
        userId: order.businessId,
        title: "Anlaşmazlık Yönetici Tarafından Karara Bağlandı",
        message: `${order.orderNumber} numaralı siparişteki anlaşmazlık "${resolutionData.status}" olarak çözümlendi.`,
        link: `/teklifim-gelsin/orders/${order.id}`,
      }),
      sendTeklifimNotification({
        userId: order.supplierId,
        title: "Anlaşmazlık Yönetici Tarafından Karara Bağlandı",
        message: `${order.orderNumber} numaralı siparişteki anlaşmazlık "${resolutionData.status}" olarak çözümlendi.`,
        link: `/teklifim-gelsin/orders/${order.id}`,
      }),
    ]);
  } catch {}

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as TeklifimOrder;
}

// Re-export FAZ 7 Product Catalog and Inventory Services
export * from "./productService";

