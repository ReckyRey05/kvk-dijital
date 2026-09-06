import {
  TeklifimOffer,
  TeklifimRequest,
  TeklifimProfile,
  TeklifimSupplierMatch,
} from "@/types/teklifimGelsin";

/**
 * Intelligent Badge Calculator for Offers
 * Computes:
 * - isCheapest: Lowest totalPrice
 * - isFastest: Lowest deliveryDays
 * - isBestValue: Highest score combining price efficiency and speed
 */
export function computeOfferBadges(offers: TeklifimOffer[]): TeklifimOffer[] {
  if (offers.length === 0) return [];

  const minPrice = Math.min(...offers.map((o) => o.totalPrice));
  const minDelivery = Math.min(...offers.map((o) => o.deliveryDays));

  // Calculate best value: 65% price weight, 35% speed weight
  const scored = offers.map((o) => {
    const priceRatio = minPrice > 0 ? minPrice / o.totalPrice : 1;
    const speedRatio = minDelivery > 0 ? minDelivery / o.deliveryDays : 1;
    const compositeScore = priceRatio * 0.65 + speedRatio * 0.35;
    return { offer: o, score: compositeScore };
  });

  const bestValueOffer = scored.reduce((prev, curr) =>
    curr.score > prev.score ? curr : prev
  ).offer;

  return offers.map((o) => {
    const isCheapest = o.totalPrice === minPrice;
    const isFastest = o.deliveryDays === minDelivery;
    const isBestValue = o.id === bestValueOffer.id;

    return {
      ...o,
      isCheapest,
      isFastest,
      isBestValue,
    };
  });
}

/**
 * Check if request has expired
 */
export function checkRequestDeadlineExpired(request: TeklifimRequest): boolean {
  if (!request.deadlineTimestamp) return false;
  return Date.now() > request.deadlineTimestamp;
}

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

  // 4. Verification bonus (+10)
  if (supplier.isVerified || supplier.verificationStatus === "verified") {
    score += 10;
    reasons.push("Doğrulanmış kurumsal toptancı");
  }

  // 5. Speed / Activity bonus (+5)
  if (supplier.completedDeals && supplier.completedDeals > 10) {
    score += 5;
    reasons.push("Aktif ve deneyimli tedarikçi");
  }

  return {
    supplier,
    matchScore: Math.min(100, score),
    matchReasons: reasons,
  };
}

/**
 * Calculate Profile Completion Percentage & Missing Fields
 */
export function computeProfileCompletion(profile: Partial<TeklifimProfile>): {
  percentage: number;
  missingFields: string[];
} {
  const checks = [
    { field: "companyName", label: "Firma Adı", weight: 15, valid: !!profile.companyName?.trim() },
    { field: "contactName", label: "Yetkili Adı", weight: 10, valid: !!profile.contactName?.trim() },
    { field: "phone", label: "Telefon Numarası", weight: 10, valid: !!profile.phone?.trim() },
    { field: "city", label: "Şehir ve Lokasyon", weight: 10, valid: !!profile.city?.trim() },
    { field: "categories", label: "Uzmanlık Kategorileri", weight: 15, valid: (profile.categories || []).length > 0 },
    { field: "description", label: "Firma Tanıtımı / Açıklama", weight: 15, valid: !!profile.description && profile.description.trim().length >= 10 },
    { field: "deliveryRegions", label: "Teslimat / Dağıtım Ağları", weight: 10, valid: (profile.deliveryRegions || []).length > 0 },
    { field: "minOrder", label: "Minimum Sipariş Şartı", weight: 5, valid: !!profile.minOrder?.trim() },
    { field: "logoUrl", label: "Firma Logosu", weight: 5, valid: !!profile.logoUrl?.trim() },
    { field: "yearFounded", label: "Kuruluş Yılı", weight: 5, valid: typeof profile.yearFounded === "number" && profile.yearFounded > 1900 },
  ];

  let score = 0;
  const missing: string[] = [];

  for (const c of checks) {
    if (c.valid) {
      score += c.weight;
    } else {
      missing.push(c.label);
    }
  }

  return {
    percentage: Math.min(100, Math.max(0, score)),
    missingFields: missing,
  };
}
