/**
 * İtemSepeti — Catalog & Listing Domain Utilities
 * Pure functions for validation, normalization, duplicate fingerprinting,
 * delivery compatibility, and state machine transitions.
 */

import crypto from "crypto";
import {
  ItemSepetiProductType,
  ItemSepetiDeliveryMethod,
  ItemSepetiListingStatus,
  ItemSepetiListing,
  ItemSepetiGame,
  ItemSepetiCategory,
} from "@/types/marketplace";

// =============================================================================
// 1. DELIVERY METHOD COMPATIBILITY MATRIX
// =============================================================================

export const PRODUCT_TYPE_DELIVERY_MATRIX: Record<
  ItemSepetiProductType,
  ItemSepetiDeliveryMethod[]
> = {
  DIGITAL_CODE: ["AUTOMATIC_CODE"],
  ITEM: ["MANUAL_ITEM", "DIRECT_TRANSFER"],
  CURRENCY: ["CURRENCY_TRADE", "DIRECT_TRANSFER"],
  ACCOUNT: ["ACCOUNT_HANDOFF"],
  OTHER_DIGITAL: ["MANUAL_ITEM", "DIRECT_TRANSFER", "AUTOMATIC_CODE"],
};

export function isDeliveryMethodCompatible(
  productType: ItemSepetiProductType,
  deliveryMethod: ItemSepetiDeliveryMethod
): boolean {
  const allowed = PRODUCT_TYPE_DELIVERY_MATRIX[productType];
  return Array.isArray(allowed) && allowed.includes(deliveryMethod);
}

// =============================================================================
// 2. DUPLICATE LISTING FINGERPRINTING
// =============================================================================

export function generateListingFingerprint(params: {
  sellerId: string;
  gameId: string;
  categoryId: string;
  serverId?: string;
  normalizedTitle: string;
}): string {
  const raw = [
    params.sellerId.trim().toLowerCase(),
    params.gameId.trim().toLowerCase(),
    params.categoryId.trim().toLowerCase(),
    (params.serverId || "none").trim().toLowerCase(),
    params.normalizedTitle.trim().toLowerCase().replace(/\s+/g, " "),
  ].join("::");

  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function normalizeTitle(title: string): string {
  return title
    .toLocaleLowerCase("tr")
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // replace special punctuation with space
    .replace(/\s+/g, " ")
    .trim();
}

// =============================================================================
// 3. LISTING STATE MACHINE TRANSITIONS
// =============================================================================

export const ALLOWED_LISTING_TRANSITIONS: Record<
  ItemSepetiListingStatus,
  ItemSepetiListingStatus[]
> = {
  draft: ["pending_review", "deleted"],
  pending_review: ["active", "rejected", "deleted"],
  active: ["paused", "sold_out", "deleted"],
  paused: ["active", "deleted"],
  sold_out: ["active", "deleted"], // Restock restores to active
  rejected: ["draft", "deleted"],
  deleted: [], // Terminal state
};

export function canTransitionListingStatus(
  current: ItemSepetiListingStatus,
  target: ItemSepetiListingStatus
): boolean {
  if (current === target) return true;
  const allowedTargets = ALLOWED_LISTING_TRANSITIONS[current] || [];
  return allowedTargets.includes(target);
}

// =============================================================================
// 4. SERVER-SIDE LISTING VALIDATION
// =============================================================================

export interface ListingValidationInput {
  sellerId: string;
  gameId: string;
  categoryId: string;
  serverId?: string;
  productType: ItemSepetiProductType;
  title: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  minQuantity?: number;
  deliveryMethod: ItemSepetiDeliveryMethod;
  deliverySlaHours: number;
  images?: string[];
}

export interface ListingValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateListingInput(
  input: ListingValidationInput,
  game?: ItemSepetiGame | null,
  category?: ItemSepetiCategory | null
): ListingValidationResult {
  const errors: string[] = [];

  // Title validation
  const title = (input.title || "").trim();
  if (title.length < 5) {
    errors.push("İlan başlığı en az 5 karakter olmalıdır.");
  } else if (title.length > 120) {
    errors.push("İlan başlığı en fazla 120 karakter olabilir.");
  }

  // Description validation
  const desc = (input.description || "").trim();
  if (desc.length < 10) {
    errors.push("İlan açıklaması en az 10 karakter olmalıdır.");
  } else if (desc.length > 3000) {
    errors.push("İlan açıklaması en fazla 3000 karakter olabilir.");
  }

  // Price validation
  if (typeof input.unitPrice !== "number" || isNaN(input.unitPrice) || input.unitPrice <= 0) {
    errors.push("Birim fiyat 0'dan büyük geçerli bir sayı olmalıdır.");
  } else if (category && input.unitPrice < category.minPrice) {
    errors.push(`Birim fiyat kategori taban fiyatından (${category.minPrice} TL) düşük olamaz.`);
  } else if (category && input.unitPrice > category.maxPrice) {
    errors.push(`Birim fiyat kategori tavan fiyatını (${category.maxPrice} TL) aşamaz.`);
  }

  // Stock validation
  if (!Number.isInteger(input.stockQuantity) || input.stockQuantity < 0) {
    errors.push("Stok miktarı sıfır veya pozitif bir tam sayı olmalıdır.");
  }

  // Delivery SLA validation
  if (input.deliverySlaHours < 1 || input.deliverySlaHours > 72) {
    errors.push("Teslimat süresi (SLA) 1 ile 72 saat arasında olmalıdır.");
  }

  // Delivery compatibility
  if (!isDeliveryMethodCompatible(input.productType, input.deliveryMethod)) {
    errors.push(
      `${input.productType} ürün tipi için ${input.deliveryMethod} teslimat türü geçerli değildir.`
    );
  }

  // Game & Category taxonomy validation
  if (game) {
    if (!game.isActive) {
      errors.push("Seçilen oyun şu anda aktif değildir.");
    }
    if (!game.supportedProductTypes.includes(input.productType)) {
      errors.push(`Seçilen oyun ${input.productType} ürün tipini desteklememektedir.`);
    }
    // Server requirement check (e.g. Metin2 requires server)
    if (game.servers && game.servers.length > 0 && !input.serverId) {
      errors.push("Bu oyun için sunucu (server) seçimi zorunludur.");
    }
  }

  if (category) {
    if (!category.isActive) {
      errors.push("Seçilen kategori şu anda aktif değildir.");
    }
    if (category.gameId !== input.gameId) {
      errors.push("Seçilen kategori seçilen oyuna ait değildir.");
    }
    if (category.productType !== input.productType) {
      errors.push("Kategori ürün tipi ile ilan ürün tipi uyuşmuyor.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
