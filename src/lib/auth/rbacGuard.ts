/**
 * CEP GARSON — ROLE-BASED ACCESS CONTROL (RBAC) & PRIVILEGE GUARD
 * 
 * CORE PRINCIPLE: LEAST PRIVILEGE & SERVER-AUTHORITATIVE PERMISSIONS
 * - Client-injected roles or permissions in JSON payloads are discarded.
 * - Enforces role hierarchy and action authorization across all HTTP methods.
 * - Blocks Vertical, Horizontal, and Customer-to-Admin privilege escalations.
 */

import { StaffRole, StaffPermissions } from "@/types/restaurant";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/restaurant/mockData";
import { UserSessionPayload, verifySessionToken } from "./restaurantAuth";

export type RestaurantAction =
  | "CONFIRM_ORDER"
  | "GIVE_DISCOUNT"
  | "TRANSFER_TABLE"
  | "CANCEL_BILL"
  | "VIEW_REPORTS_AND_Z"
  | "EDIT_MENU_AND_PRICES"
  | "VIEW_COMPLAINTS"
  | "VIEW_RECIPES_AND_COSTS"
  | "MANAGE_PLATFORM_ORDERS"
  | "MANAGE_USERS"
  | "MANAGE_SETTINGS"
  | "SETTLE_PAYMENT"
  | "KITCHEN_PREPARE";

export interface AuthorizationResult {
  authorized: boolean;
  error?: string;
  statusCode?: 401 | 403;
  session?: UserSessionPayload;
}

/**
 * Checks if a role is authorized to perform a specific action.
 */
export function isRoleAuthorized(
  role: StaffRole | "SUPER_ADMIN" | "CUSTOMER",
  action: RestaurantAction,
  customPermissions?: Partial<StaffPermissions>
): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (role === "CUSTOMER") {
    return false; // Customer has zero staff/admin permissions
  }

  // Owner has absolute permissions for the restaurant
  if (role === "OWNER") return true;

  const permissions: StaffPermissions = {
    ...DEFAULT_ROLE_PERMISSIONS[role],
    ...(customPermissions || {}),
  };

  switch (action) {
    case "CONFIRM_ORDER":
      return permissions.canConfirmOrders;

    case "GIVE_DISCOUNT":
      return permissions.canGiveDiscount;

    case "TRANSFER_TABLE":
      return permissions.canTransferTables;

    case "CANCEL_BILL":
      return permissions.canCancelBill;

    case "VIEW_REPORTS_AND_Z":
      return permissions.canViewReportsAndZ;

    case "EDIT_MENU_AND_PRICES":
      return permissions.canEditMenuAndPrices;

    case "VIEW_COMPLAINTS":
      return permissions.canViewComplaints;

    case "VIEW_RECIPES_AND_COSTS":
      return permissions.canViewRecipesAndCosts;

    case "MANAGE_PLATFORM_ORDERS":
      return permissions.canManagePlatformOrders;

    case "SETTLE_PAYMENT":
      return role === "CASHIER" || role === "MANAGER";

    case "KITCHEN_PREPARE":
      return role === "KITCHEN" || role === "MANAGER";

    case "MANAGE_USERS":
    case "MANAGE_SETTINGS":
      return false; // Only OWNER and SUPER_ADMIN have access (handled above)

    default:
      return false;
  }
}

/**
 * Authorizes an incoming server request for a specific restaurant action and tenant.
 */
export function authorizeServerAction(
  authHeader: string | null | undefined,
  requiredTenantId: string,
  requiredAction: RestaurantAction
): AuthorizationResult {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authorized: false,
      error: "Yetkilendirme başlığı (Authorization Bearer Token) eksik veya geçersiz.",
      statusCode: 401,
    };
  }

  const token = authHeader.substring(7).trim();
  const verification = verifySessionToken(token);

  if (!verification.valid || !verification.payload) {
    return {
      authorized: false,
      error:
        verification.error === "EXPIRED"
          ? "Oturum süreniz doldu. Lütfen tekrar giriş yapın."
          : verification.error === "REVOKED"
          ? "Oturum sonlandırıldı (Oturum Kapatıldı)."
          : verification.error === "VERSION_MISMATCH"
          ? "Yetkileriniz güncellendi veya oturum geçersiz kılındı. Tekrar giriş yapınız."
          : "Geçersiz oturum anahtarı.",
      statusCode: 401,
    };
  }

  const session = verification.payload;

  // 1. Validate Tenant Context (Anti-Cross-Tenant Escalation)
  if (session.role !== "SUPER_ADMIN" && session.restaurantId !== requiredTenantId) {
    return {
      authorized: false,
      error: "Yetkisiz Erişim: Bu restoranın kaynaklarına erişim izniniz yok (Cross-Tenant Blocked).",
      statusCode: 403,
      session,
    };
  }

  // 2. Validate Action Authorization (RBAC)
  const allowed = isRoleAuthorized(session.role, requiredAction);
  if (!allowed) {
    return {
      authorized: false,
      error: `Yetkisiz İşlem: '${session.role}' rolü '${requiredAction}' işlemini gerçekleştiremez (Privilege Escalation Blocked).`,
      statusCode: 403,
      session,
    };
  }

  return {
    authorized: true,
    session,
  };
}
