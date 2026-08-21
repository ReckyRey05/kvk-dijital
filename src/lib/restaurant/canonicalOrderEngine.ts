/**
 * CEP GARSON — CANONICAL SERVER-SIDE ORDER & PRICING ENGINE
 * 
 * CORE PRINCIPLE: ZERO TRUST ON CLIENT DATA
 * - Any price, unitPrice, subtotal, tax, discount, or total sent by the client is discarded.
 * - All financial calculations are executed strictly server-side using canonical menu definitions.
 * - Money arithmetic uses integer minor units (kuruş) to prevent IEEE-754 floating point inaccuracies.
 * - Tenant, branch, table, and session relationships are strictly verified before order creation.
 */

import {
  Order,
  OrderItem,
  MenuItem,
  SelectedOptionPayload,
  Restaurant,
  Table,
} from "@/types/restaurant";
import { DEMO_RESTAURANT, DEMO_MENU_ITEMS, DEMO_TABLES, DEMO_INGREDIENTS } from "./mockData";
import { validateTableSession } from "./session";

// ==========================================
// 1. MONEY & CURRENCY HANDLING (MINOR UNITS)
// ==========================================

export type MinorUnits = number; // Integer Kuruş / Cents (e.g. 100.50 TL -> 10050)

/**
 * Converts a major currency decimal value (TL) to integer minor units (Kuruş).
 * Uses Math.round to eliminate floating point noise (e.g. 19.999999999999996 -> 2000).
 */
export function toMinorUnits(amount: number): MinorUnits {
  if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount)) {
    return 0;
  }
  return Math.round(amount * 100);
}

/**
 * Converts integer minor units (Kuruş) back to major currency decimal value (TL).
 */
export function fromMinorUnits(minorUnits: MinorUnits): number {
  return minorUnits / 100;
}

// ==========================================
// 2. CANONICAL REPOSITORY & DATA SOURCES
// ==========================================

export interface CanonicalRestaurantDataSource {
  getRestaurant(restaurantId: string): Restaurant | null;
  getTable(restaurantId: string, tableId: string): Table | null;
  getMenuItem(restaurantId: string, menuItemId: string): MenuItem | null;
  getAllMenuItems(restaurantId: string): MenuItem[];
}

/**
 * Default In-Memory Canonical Provider.
 * In a database-backed environment, this queries Firestore/SQL.
 */
export const defaultCanonicalDataSource: CanonicalRestaurantDataSource = {
  getRestaurant(restaurantId: string): Restaurant | null {
    if (restaurantId === DEMO_RESTAURANT.id || restaurantId === DEMO_RESTAURANT.slug) {
      return DEMO_RESTAURANT;
    }
    return null;
  },

  getTable(restaurantId: string, tableId: string): Table | null {
    const rest = this.getRestaurant(restaurantId);
    if (!rest) return null;

    const normalizedTableId = tableId.toLowerCase().trim();
    const table = DEMO_TABLES.find(
      (t) =>
        (t.id.toLowerCase() === normalizedTableId ||
          t.tableNumber.toLowerCase() === normalizedTableId ||
          (normalizedTableId.startsWith("m-") &&
            !isNaN(Number(normalizedTableId.slice(2))) &&
            t.tableNumber.toLowerCase() === `masa ${normalizedTableId.slice(2)}`)) &&
        t.restaurantId === DEMO_RESTAURANT.id
    );

    return table || null;
  },

  getMenuItem(restaurantId: string, menuItemId: string): MenuItem | null {
    const rest = this.getRestaurant(restaurantId);
    if (!rest) return null;

    const item = DEMO_MENU_ITEMS.find(
      (m) => m.id === menuItemId && (m.restaurantId === DEMO_RESTAURANT.id || m.restaurantId === rest.id)
    );
    return item || null;
  },

  getAllMenuItems(restaurantId: string): MenuItem[] {
    const rest = this.getRestaurant(restaurantId);
    if (!rest) return [];
    return DEMO_MENU_ITEMS.filter((m) => m.restaurantId === DEMO_RESTAURANT.id || m.restaurantId === rest.id);
  },
};

// ==========================================
// 3. IDEMPOTENCY REGISTRY
// ==========================================

interface IdempotentRecord {
  order: Order;
  createdAt: number;
}

const idempotencyStore = new Map<string, IdempotentRecord>();
let orderCounter = 0;

// Clean up stale idempotency keys older than 24 hours
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of idempotencyStore.entries()) {
      if (now - record.createdAt > 24 * 60 * 60 * 1000) {
        idempotencyStore.delete(key);
      }
    }
  }, 30 * 60 * 1000);
  if (cleanupTimer && typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
}

// ==========================================
// 4. REQUEST VALIDATION TYPES & INTERFACES
// ==========================================

export interface RawOrderItemInput {
  menuItemId: string;
  quantity: number;
  selectedOptions?: {
    groupId: string;
    optionIds: string[];
  }[];
  removedIngredients?: string[];
  itemNotes?: string;
  // Any client-supplied price properties (which will be strictly ignored)
  price?: any;
  unitPrice?: any;
  finalPrice?: any;
  basePrice?: any;
  total?: any;
}

export interface CreateOrderRequestInput {
  restaurantId: string;
  tableId: string;
  sessionToken: string;
  items: RawOrderItemInput[];
  notes?: string;
  paymentMethod?: "CASH" | "CREDIT_CARD" | "ONLINE_POS" | "ONLINE";
  idempotencyKey?: string;
}

export interface CanonicalOrderCalculationResult {
  ok: boolean;
  error?: string;
  errorCode?:
    | "INVALID_PAYLOAD"
    | "RESTAURANT_NOT_FOUND"
    | "TABLE_NOT_FOUND"
    | "TENANT_MISMATCH"
    | "SESSION_INVALID"
    | "SESSION_EXPIRED"
    | "PRODUCT_NOT_FOUND"
    | "PRODUCT_UNAVAILABLE"
    | "INVALID_QUANTITY"
    | "INVALID_MODIFIER"
    | "IDEMPOTENCY_CONFLICT";
  order?: Order;
  breakdown?: {
    subtotalMinorUnits: MinorUnits;
    taxMinorUnits: MinorUnits;
    serviceChargeMinorUnits: MinorUnits;
    discountMinorUnits: MinorUnits;
    totalMinorUnits: MinorUnits;
  };
  isIdempotentReplay?: boolean;
}

// ==========================================
// 5. CANONICAL CALCULATION ENGINE
// ==========================================

/**
 * Calculates a 100% server-authoritative canonical order.
 * Rejects or ignores any client-side prices, validates tenant ownership,
 * enforces integer minor unit math, and checks data invariants.
 */
export function calculateAndCreateCanonicalOrder(
  input: CreateOrderRequestInput,
  dataSource: CanonicalRestaurantDataSource = defaultCanonicalDataSource
): CanonicalOrderCalculationResult {
  // 1. Basic Structure Validation
  if (!input || typeof input !== "object") {
    return { ok: false, error: "İstek verisi geçersiz.", errorCode: "INVALID_PAYLOAD" };
  }

  const { restaurantId, tableId, sessionToken, items, notes, paymentMethod, idempotencyKey } = input;

  if (!restaurantId || typeof restaurantId !== "string" || !restaurantId.trim()) {
    return { ok: false, error: "restaurantId zorunludur.", errorCode: "INVALID_PAYLOAD" };
  }

  if (!tableId || typeof tableId !== "string" || !tableId.trim()) {
    return { ok: false, error: "tableId zorunludur.", errorCode: "INVALID_PAYLOAD" };
  }

  if (!sessionToken || typeof sessionToken !== "string" || !sessionToken.trim()) {
    return { ok: false, error: "sessionToken zorunludur.", errorCode: "SESSION_INVALID" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Sipariş en az bir ürün içermelidir.", errorCode: "INVALID_PAYLOAD" };
  }

  // 2. Check Idempotency Key
  if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
    const existing = idempotencyStore.get(idempotencyKey)!;
    return {
      ok: true,
      order: existing.order,
      isIdempotentReplay: true,
      breakdown: {
        subtotalMinorUnits: toMinorUnits(existing.order.subtotal),
        taxMinorUnits: toMinorUnits(existing.order.taxAmount),
        serviceChargeMinorUnits: toMinorUnits(existing.order.serviceCharge || 0),
        discountMinorUnits: 0,
        totalMinorUnits: toMinorUnits(existing.order.totalAmount),
      },
    };
  }

  // 3. Authenticate and Validate Tenant
  const restaurant = dataSource.getRestaurant(restaurantId.trim());
  if (!restaurant) {
    return { ok: false, error: "Belirtilen restoran bulunamadı.", errorCode: "RESTAURANT_NOT_FOUND" };
  }

  // 4. Validate Table Ownership
  const table = dataSource.getTable(restaurant.id, tableId.trim());
  if (!table) {
    return {
      ok: false,
      error: `Masa (${tableId}) bu restorana (${restaurant.name}) ait değil veya bulunamadı.`,
      errorCode: "TENANT_MISMATCH",
    };
  }

  // 5. Strict 15-Minute Session Verification
  const sessionCheck = validateTableSession(sessionToken.trim(), restaurant.id, table.id);
  if (!sessionCheck.valid) {
    return {
      ok: false,
      error:
        sessionCheck.error === "EXPIRED"
          ? "Masa oturum süreniz (15 dk) doldu. Lütfen masadaki QR kodu tekrar okutun."
          : "Geçersiz masa oturumu.",
      errorCode: sessionCheck.error === "EXPIRED" ? "SESSION_EXPIRED" : "SESSION_INVALID",
    };
  }

  // 6. Process Order Items & Calculate Server-Authoritative Prices
  const canonicalOrderItems: OrderItem[] = [];
  let subtotalMinorUnits: MinorUnits = 0;

  for (let i = 0; i < items.length; i++) {
    const rawItem = items[i];

    if (!rawItem || typeof rawItem !== "object") {
      return { ok: false, error: `Sipariş kalemi #${i + 1} geçersiz.`, errorCode: "INVALID_PAYLOAD" };
    }

    const menuItemId = rawItem.menuItemId;
    if (!menuItemId || typeof menuItemId !== "string") {
      return { ok: false, error: `Ürün kimliği (#${i + 1}) belirtilmedi.`, errorCode: "INVALID_PAYLOAD" };
    }

    // Lookup canonical menu item from server database
    const canonicalProduct = dataSource.getMenuItem(restaurant.id, menuItemId.trim());
    if (!canonicalProduct) {
      return {
        ok: false,
        error: `Menüde '${menuItemId}' kimlikli ürün bulunamadı.`,
        errorCode: "PRODUCT_NOT_FOUND",
      };
    }

    if (!canonicalProduct.isAvailable) {
      return {
        ok: false,
        error: `'${canonicalProduct.name}' şu an tükendi olarak işaretlenmiştir.`,
        errorCode: "PRODUCT_UNAVAILABLE",
      };
    }

    // Validate Quantity: Strict positive integer >= 1 and <= 100
    const rawQuantity = rawItem.quantity;
    if (
      typeof rawQuantity !== "number" ||
      isNaN(rawQuantity) ||
      !Number.isInteger(rawQuantity) ||
      rawQuantity < 1 ||
      rawQuantity > 100
    ) {
      return {
        ok: false,
        error: `'${canonicalProduct.name}' için miktar 1 ile 100 arasında geçerli bir tam sayı olmalıdır.`,
        errorCode: "INVALID_QUANTITY",
      };
    }

    const quantity = rawQuantity;

    // Determine Canonical Base Price (Respecting active discount if valid)
    let canonicalBasePrice = canonicalProduct.price;
    const now = new Date();
    if (
      canonicalProduct.originalPrice &&
      canonicalProduct.discountUntil &&
      new Date(canonicalProduct.discountUntil) > now
    ) {
      canonicalBasePrice = canonicalProduct.price; // Active promotional price
    } else if (
      canonicalProduct.originalPrice &&
      canonicalProduct.discountUntil &&
      new Date(canonicalProduct.discountUntil) <= now
    ) {
      canonicalBasePrice = canonicalProduct.originalPrice; // Expired, revert to original
    }

    let itemUnitMinorUnits = toMinorUnits(canonicalBasePrice);
    const structuredSelectedOptions: SelectedOptionPayload[] = [];

    // Process & Validate Modifiers / Options Server-Side
    if (rawItem.selectedOptions && Array.isArray(rawItem.selectedOptions) && canonicalProduct.optionGroups) {
      for (const selGroup of rawItem.selectedOptions) {
        if (!selGroup || !selGroup.groupId) continue;

        const canonicalGroup = canonicalProduct.optionGroups.find((g) => g.id === selGroup.groupId);
        if (!canonicalGroup) continue; // Ignore non-existent option groups

        const optionIds = Array.isArray(selGroup.optionIds) ? selGroup.optionIds : [];
        if (canonicalGroup.type === "SINGLE" && optionIds.length > 1) {
          return {
            ok: false,
            error: `'${canonicalGroup.title}' grubu için yalnızca 1 seçenek belirlenebilir.`,
            errorCode: "INVALID_MODIFIER",
          };
        }

        const validSelectedOptionsList: { id: string; name: string; priceDelta: number }[] = [];

        for (const optId of optionIds) {
          const canonicalOption = canonicalGroup.options.find((o) => o.id === optId);
          if (!canonicalOption) continue;

          // Add server-defined price delta in minor units
          const deltaMinor = toMinorUnits(canonicalOption.priceDelta || 0);
          itemUnitMinorUnits += deltaMinor;

          validSelectedOptionsList.push({
            id: canonicalOption.id,
            name: canonicalOption.name,
            priceDelta: canonicalOption.priceDelta || 0,
          });
        }

        if (validSelectedOptionsList.length > 0) {
          structuredSelectedOptions.push({
            groupId: canonicalGroup.id,
            groupTitle: canonicalGroup.title,
            selectedItems: validSelectedOptionsList,
          });
        }
      }
    }

    const itemTotalMinorUnits = itemUnitMinorUnits * quantity;
    subtotalMinorUnits += itemTotalMinorUnits;

    canonicalOrderItems.push({
      id: `item_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: canonicalProduct.id,
      name: canonicalProduct.name,
      basePrice: canonicalBasePrice,
      finalPrice: fromMinorUnits(itemUnitMinorUnits),
      quantity,
      selectedOptions: structuredSelectedOptions.length > 0 ? structuredSelectedOptions : undefined,
      removedIngredients: Array.isArray(rawItem.removedIngredients)
        ? rawItem.removedIngredients.map((s) => String(s).slice(0, 50)).slice(0, 10)
        : undefined,
      itemNotes: typeof rawItem.itemNotes === "string" ? rawItem.itemNotes.trim().slice(0, 150) : undefined,
    });
  }

  // 7. Calculate Canonical Tax & Service Charge
  const taxRate = restaurant.settings.taxRatePercent || 10;
  const taxMinorUnits = Math.round((subtotalMinorUnits * taxRate) / 100);

  const serviceChargePercent = restaurant.settings.serviceChargePercent || 0;
  const serviceChargeMinorUnits = Math.round((subtotalMinorUnits * serviceChargePercent) / 100);

  const discountMinorUnits = 0;
  const grandTotalMinorUnits = subtotalMinorUnits + taxMinorUnits + serviceChargeMinorUnits - discountMinorUnits;

  // 8. Construct Verified Canonical Order (Collision-proof ID with timestamp + monotonic counter + entropy)
  const orderId = `ord_${Date.now().toString().slice(-6)}_${(++orderCounter % 10000).toString().padStart(4, "0")}_${Math.random().toString(36).substring(2, 6)}`;
  const orderStatus =
    restaurant.settings.orderMode === "DIRECT_KITCHEN" ? "PREPARING" : "PENDING_CONFIRMATION";

  const canonicalOrder: Order = {
    id: orderId,
    restaurantId: restaurant.id,
    tableId: table.id,
    tableNumber: table.tableNumber,
    sessionToken,
    status: orderStatus,
    items: canonicalOrderItems,
    subtotal: fromMinorUnits(subtotalMinorUnits),
    taxAmount: fromMinorUnits(taxMinorUnits),
    serviceCharge: fromMinorUnits(serviceChargeMinorUnits),
    totalAmount: fromMinorUnits(grandTotalMinorUnits),
    notes: typeof notes === "string" ? notes.trim().slice(0, 300) : undefined,
    paymentStatus: "PENDING",
    paymentMethod: paymentMethod === "ONLINE" ? "ONLINE_POS" : (paymentMethod || "CREDIT_CARD"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 9. Store in Idempotency Registry if key was provided
  if (idempotencyKey) {
    idempotencyStore.set(idempotencyKey, {
      order: canonicalOrder,
      createdAt: Date.now(),
    });
  }

  return {
    ok: true,
    order: canonicalOrder,
    breakdown: {
      subtotalMinorUnits,
      taxMinorUnits,
      serviceChargeMinorUnits,
      discountMinorUnits,
      totalMinorUnits: grandTotalMinorUnits,
    },
  };
}
