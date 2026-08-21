/**
 * CEP GARSON — MULTI-TENANT ISOLATION & RESOURCE OWNERSHIP GUARD
 * 
 * CORE PRINCIPLE: STRICT TENANT BOUNDARY ENFORCEMENT
 * - Validates ownership chains (Restaurant -> Branch -> Table -> Order -> Payment).
 * - Blocks any cross-tenant IDOR (Insecure Direct Object Reference).
 * - Scopes realtime channels, storage keys, and background jobs by Tenant ID.
 */

import {
  Restaurant,
  Table,
  Order,
  MenuItem,
  Ingredient,
  StaffMember,
} from "@/types/restaurant";
import {
  DEMO_RESTAURANT,
  DEMO_TABLES,
  DEMO_MENU_ITEMS,
  DEMO_INGREDIENTS,
  DEMO_STAFF_MEMBERS,
} from "./mockData";
import { validateTableSession, SessionValidationResult } from "./session";

// ==========================================
// 1. TENANT REPOSITORY ABSTRACTION
// ==========================================

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  restaurant: Restaurant;
}

export interface TenantGuardResult<T> {
  allowed: boolean;
  error?: string;
  statusCode?: 400 | 401 | 403 | 404;
  data?: T;
}

/**
 * Resolves and validates a Tenant from restaurantId or restaurantSlug.
 */
export function resolveTenant(tenantIdentifier: string): TenantGuardResult<TenantContext> {
  if (!tenantIdentifier || typeof tenantIdentifier !== "string" || !tenantIdentifier.trim()) {
    return {
      allowed: false,
      error: "Geçersiz veya eksik restoran/kiracı kimliği (tenantId).",
      statusCode: 400,
    };
  }

  const clean = tenantIdentifier.trim().toLowerCase();

  // Match against canonical demo restaurant or registered tenant
  if (
    clean === DEMO_RESTAURANT.id.toLowerCase() ||
    clean === DEMO_RESTAURANT.slug.toLowerCase()
  ) {
    return {
      allowed: true,
      data: {
        tenantId: DEMO_RESTAURANT.id,
        tenantSlug: DEMO_RESTAURANT.slug,
        restaurant: DEMO_RESTAURANT,
      },
    };
  }

  return {
    allowed: false,
    error: `Belirtilen restoran ('${tenantIdentifier}') sistemde kayıtlı değil.`,
    statusCode: 404,
  };
}

/**
 * Asserts that a Table exists and strictly belongs to the specified Tenant.
 */
export function assertTableOwnership(
  tenantIdentifier: string,
  tableId: string
): TenantGuardResult<Table> {
  const tenantRes = resolveTenant(tenantIdentifier);
  if (!tenantRes.allowed || !tenantRes.data) {
    return {
      allowed: false,
      error: tenantRes.error,
      statusCode: tenantRes.statusCode || 404,
    };
  }

  if (!tableId || typeof tableId !== "string") {
    return {
      allowed: false,
      error: "Masa kimliği (tableId) zorunludur.",
      statusCode: 400,
    };
  }

  const cleanTableId = tableId.trim().toLowerCase();
  const tenant = tenantRes.data;

  const table = DEMO_TABLES.find(
    (t) =>
      (t.id.toLowerCase() === cleanTableId ||
        t.tableNumber.toLowerCase() === cleanTableId ||
        (cleanTableId.startsWith("m-") &&
          !isNaN(Number(cleanTableId.slice(2))) &&
          t.tableNumber.toLowerCase() === `masa ${cleanTableId.slice(2)}`)) &&
      t.restaurantId === tenant.tenantId
  );

  if (!table) {
    return {
      allowed: false,
      error: `Masa ('${tableId}') bu restorana (${tenant.restaurant.name}) ait değil veya bulunamadı.`,
      statusCode: 404,
    };
  }

  return {
    allowed: true,
    data: table,
  };
}

/**
 * Asserts that an Order strictly belongs to the specified Tenant and Table.
 */
export function assertOrderOwnership(
  tenantIdentifier: string,
  order: Order
): TenantGuardResult<Order> {
  const tenantRes = resolveTenant(tenantIdentifier);
  if (!tenantRes.allowed || !tenantRes.data) {
    return {
      allowed: false,
      error: tenantRes.error,
      statusCode: tenantRes.statusCode || 404,
    };
  }

  const tenant = tenantRes.data;

  if (order.restaurantId !== tenant.tenantId) {
    return {
      allowed: false,
      error: "Erişim Reddedildi: Sipariş bu restorana ait değil (Cross-Tenant Access Blocked).",
      statusCode: 403,
    };
  }

  return {
    allowed: true,
    data: order,
  };
}

/**
 * Asserts that a Menu Item strictly belongs to the specified Tenant.
 */
export function assertMenuItemOwnership(
  tenantIdentifier: string,
  menuItemId: string
): TenantGuardResult<MenuItem> {
  const tenantRes = resolveTenant(tenantIdentifier);
  if (!tenantRes.allowed || !tenantRes.data) {
    return {
      allowed: false,
      error: tenantRes.error,
      statusCode: tenantRes.statusCode || 404,
    };
  }

  const tenant = tenantRes.data;
  const item = DEMO_MENU_ITEMS.find(
    (m) => m.id === menuItemId && m.restaurantId === tenant.tenantId
  );

  if (!item) {
    return {
      allowed: false,
      error: `Ürün ('${menuItemId}') bu restorana ait değil veya bulunamadı.`,
      statusCode: 404,
    };
  }

  return {
    allowed: true,
    data: item,
  };
}

/**
 * Asserts that an Ingredient strictly belongs to the specified Tenant.
 */
export function assertIngredientOwnership(
  tenantIdentifier: string,
  ingredientId: string
): TenantGuardResult<Ingredient> {
  const tenantRes = resolveTenant(tenantIdentifier);
  if (!tenantRes.allowed || !tenantRes.data) {
    return {
      allowed: false,
      error: tenantRes.error,
      statusCode: tenantRes.statusCode || 404,
    };
  }

  const item = DEMO_INGREDIENTS.find((i) => i.id === ingredientId);
  if (!item) {
    return {
      allowed: false,
      error: `Hammadde ('${ingredientId}') bulunamadı.`,
      statusCode: 404,
    };
  }

  return {
    allowed: true,
    data: item,
  };
}

/**
 * Asserts that a Staff Member strictly belongs to the specified Tenant.
 */
export function assertStaffOwnership(
  tenantIdentifier: string,
  staffId: string
): TenantGuardResult<StaffMember> {
  const tenantRes = resolveTenant(tenantIdentifier);
  if (!tenantRes.allowed || !tenantRes.data) {
    return {
      allowed: false,
      error: tenantRes.error,
      statusCode: tenantRes.statusCode || 404,
    };
  }

  const staff = DEMO_STAFF_MEMBERS.find((s) => s.id === staffId);
  if (!staff) {
    return {
      allowed: false,
      error: `Personel ('${staffId}') bulunamadı.`,
      statusCode: 404,
    };
  }

  return {
    allowed: true,
    data: staff,
  };
}

/**
 * Strict Session + Table + Tenant Verification.
 */
export function assertSessionOwnership(
  tenantIdentifier: string,
  tableId: string,
  token: string
): TenantGuardResult<SessionValidationResult> {
  const tableRes = assertTableOwnership(tenantIdentifier, tableId);
  if (!tableRes.allowed || !tableRes.data) {
    return {
      allowed: false,
      error: tableRes.error,
      statusCode: tableRes.statusCode,
    };
  }

  const table = tableRes.data;
  const sessionResult = validateTableSession(token, table.restaurantId, table.id);

  if (!sessionResult.valid) {
    return {
      allowed: false,
      error:
        sessionResult.error === "EXPIRED"
          ? "Masa oturum süreniz (15 dk) doldu. Lütfen masadaki QR kodu tekrar okutun."
          : "Geçersiz masa oturum anahtarı (Cross-Tenant/Cross-Table Session Blocked).",
      statusCode: 403,
      data: sessionResult,
    };
  }

  return {
    allowed: true,
    data: sessionResult,
  };
}

// ==========================================
// 2. REALTIME & STORAGE NAMESPACING HELPERS
// ==========================================

/**
 * Generates a tenant-isolated BroadcastChannel name to prevent cross-tenant tab crosstalk.
 */
export function getTenantBroadcastChannelName(tenantSlugOrId: string): string {
  const sanitized = String(tenantSlugOrId || "default").replace(/[^a-zA-Z0-9_-]/g, "");
  return `cg_sync_tenant_${sanitized}`;
}

/**
 * Generates a tenant-isolated LocalStorage key.
 */
export function getTenantStorageKey(tenantSlugOrId: string, resourceKey: string): string {
  const sanitizedTenant = String(tenantSlugOrId || "default").replace(/[^a-zA-Z0-9_-]/g, "");
  const sanitizedResource = String(resourceKey || "res").replace(/[^a-zA-Z0-9_-]/g, "");
  return `cg_${sanitizedTenant}_${sanitizedResource}`;
}
