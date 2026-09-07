import {
  TeklifimAdminRole,
  TeklifimAdminPermission,
  TeklifimAdminAuditLog,
  TeklifimPlatformSettings,
  TeklifimFeatureFlag,
} from "@/types/teklifimGelsin";

/**
 * Granular Role-Permissions Mapping
 */
export const ROLE_PERMISSIONS_MAP: Record<TeklifimAdminRole, TeklifimAdminPermission[]> = {
  super_admin: ["*"],
  operations_admin: [
    "users.read",
    "users.suspend",
    "users.edit",
    "suppliers.manage",
    "suppliers.verify",
    "businesses.manage",
    "categories.manage",
    "requests.manage",
    "offers.manage",
    "orders.manage",
    "announcements.manage",
    "audit.view",
    "system.view",
  ],
  finance_admin: [
    "payments.view",
    "payments.manage",
    "refunds.manage",
    "finance.view",
    "orders.manage",
    "audit.view",
  ],
  moderation_admin: [
    "products.moderate",
    "suppliers.verify",
    "reports.manage",
    "moderation_notes.manage",
    "disputes.manage",
    "audit.view",
  ],
  support_admin: [
    "support.manage",
    "users.read",
    "orders.manage",
    "requests.manage",
    "offers.manage",
    "audit.view",
  ],
};

/**
 * Checks whether an admin role possesses a required permission.
 * Supports exact permission matches and wildcard syntax (e.g. '*').
 */
export function hasAdminPermission(
  role: TeklifimAdminRole | undefined,
  requiredPermission: TeklifimAdminPermission
): boolean {
  if (!role) return false;
  if (role === "super_admin") return true;

  const permissions = ROLE_PERMISSIONS_MAP[role] || [];
  if (permissions.includes("*")) return true;
  if (permissions.includes(requiredPermission)) return true;

  // Wildcard scope support e.g. "users.*"
  return permissions.some((p) => {
    if (p.endsWith(".*")) {
      const prefix = p.slice(0, -1);
      return requiredPermission.startsWith(prefix);
    }
    return false;
  });
}

/**
 * Calculates genuine platform KPIs strictly from real transaction data.
 * Zero fake numbers.
 */
export function calculatePlatformKpis(
  orders: any[] = [],
  payments: any[] = [],
  businessesCount: number = 0,
  suppliersCount: number = 0,
  requestsCount: number = 0
) {
  // GMV: Total volume of paid payments OR completed/delivered orders
  let gmv = 0;
  let platformRevenue = 0;

  if (payments && payments.length > 0) {
    const paidPayments = payments.filter((p) => p.status === "paid" || p.status === "partially_refunded");
    gmv = paidPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    platformRevenue = paidPayments.reduce((acc, p) => acc + (Number(p.platformFee) || 0), 0);
  } else if (orders && orders.length > 0) {
    const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "delivered");
    gmv = completedOrders.reduce((acc, o) => acc + (Number(o.totalAmount || o.price || 0)), 0);
    platformRevenue = completedOrders.reduce((acc, o) => acc + (Number(o.commissionAmount || 0)), 0);
  }

  // Refunds volume
  const refundVolume = payments.reduce((acc, p) => {
    const refunds = Array.isArray(p.refunds) ? p.refunds : [];
    const sumRefunds = refunds.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
    return acc + sumRefunds;
  }, 0);

  // Order Counts
  const activeOrdersCount = orders.filter(
    (o) => o.status === "active" || o.status === "preparing" || o.status === "shipped"
  ).length;
  const completedOrdersCount = orders.filter((o) => o.status === "completed" || o.status === "delivered").length;
  const failedPaymentsCount = payments.filter((p) => p.status === "failed").length;

  // Deal size
  const paidCount = payments.length > 0 ? payments.filter((p) => p.status === "paid").length : completedOrdersCount;
  const averageDealSize =
    paidCount > 0 ? Math.round((gmv / paidCount) * 100) / 100 : 0;

  const roundedGmv = Math.round(gmv * 100) / 100;
  const roundedRevenue = Math.round(platformRevenue * 100) / 100;

  return {
    gmv: roundedGmv,
    totalGmv: roundedGmv,
    platformRevenue: roundedRevenue,
    platformNetCommission: roundedRevenue,
    netRevenue: Math.round((platformRevenue - refundVolume * 0.03) * 100) / 100,
    refundVolume: Math.round(refundVolume * 100) / 100,
    totalBusinesses: businessesCount,
    activeBusinessesCount: businessesCount,
    totalSuppliers: suppliersCount,
    activeSuppliersCount: suppliersCount,
    activeRequests: requestsCount,
    openRequestsCount: requestsCount,
    activeOrders: activeOrdersCount,
    completedOrders: completedOrdersCount,
    completedOrdersCount: completedOrdersCount,
    failedPayments: failedPaymentsCount,
    averageDealSize,
    currency: "TRY",
  };
}

/**
 * Formats standard support ticket identifiers e.g. #TG-0001.
 */
export function formatTicketNumber(seq: number, prefix: string = "#TG"): string {
  const padded = String(seq).padStart(4, "0");
  return `${prefix}-${padded}`;
}

/**
 * Filter immutable audit logs by actor, action, target or date range.
 */
export function filterAdminAuditLogs(
  logs: TeklifimAdminAuditLog[],
  filters: {
    adminId?: string;
    adminEmail?: string;
    action?: string;
    targetType?: string;
    fromDate?: number;
    toDate?: number;
  }
): TeklifimAdminAuditLog[] {
  return logs.filter((log) => {
    if (filters.adminId && log.adminId !== filters.adminId) return false;
    if (filters.adminEmail && log.adminEmail?.toLowerCase() !== filters.adminEmail.toLowerCase()) return false;
    if (filters.action && log.action !== filters.action) return false;
    if (filters.targetType && log.targetType !== filters.targetType) return false;
    if (filters.fromDate && log.timestamp < filters.fromDate) return false;
    if (filters.toDate && log.timestamp > filters.toDate) return false;
    return true;
  });
}

/**
 * Masks confidential keys, secrets and passwords from admin search results.
 */
export function sanitizeAdminSearchResult(item: any): any {
  if (!item || typeof item !== "object") return item;
  const sanitized = { ...item };
  const sensitive = [
    "password",
    "passwordHash",
    "keyHash",
    "secret",
    "secretKey",
    "rawKey",
    "idToken",
    "apiKey",
    "authToken",
    "token",
  ];
  for (const field of sensitive) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  return sanitized;
}

export const DEFAULT_PLATFORM_SETTINGS: TeklifimPlatformSettings = {
  marketplace: {
    defaultCommissionRate: 0.03, // 3%
    minRequestDurationDays: 3,
    maxNegotiationRevisions: 10,
  },
  security: {
    rateLimitPerMin: 120,
    maxUploadSizeMb: 10,
  },
  payments: {
    sandboxMode: true,
    activeProvider: "iyzico_mock",
  },
  moderation: {
    autoReportThreshold: 3,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    whatsappEnabled: true,
    pushEnabled: true,
  },
};

export const DEFAULT_FEATURE_FLAGS: Record<string, TeklifimFeatureFlag> = {
  marketplace_enabled: {
    key: "marketplace_enabled",
    name: "Pazaryeri Genel Erisimi",
    description: "Toptancim Cebimde pazaryerinin genel alim-satim erisimi",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  new_search_enabled: {
    key: "new_search_enabled",
    name: "Akilli Arama & Filtreleme",
    description: "Kategori bazli coklu filtre ve skorlu siralama motoru",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  reviews_enabled: {
    key: "reviews_enabled",
    name: "Musteri Degerlendirmeleri",
    description: "Tamamlanan siparisler sonrasi toptanci degerlendirme sistemi",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  payments_enabled: {
    key: "payments_enabled",
    name: "Online Tahsilat & Odeme",
    description: "Kredi karti ve guvenli emanet hesap odeme akisi",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  new_checkout_enabled: {
    key: "new_checkout_enabled",
    name: "Tek Adimda Odeme (Checkout)",
    description: "Anlasma uzerinden tek tikla odeme ekrani",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  instant_messaging_enabled: {
    key: "instant_messaging_enabled",
    name: "Canli Pazarlik ve Mesajlasma",
    description: "Alici ve satici arasinda teklif ici anlik mesajlasma modulu",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  advanced_procurement_enabled: {
    key: "advanced_procurement_enabled",
    name: "Kurumsal Satin Alma Merkezi",
    description: "Satin alma listeleri, coklu onay akislari ve butce limitleri",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  dispute_arbitration_enabled: {
    key: "dispute_arbitration_enabled",
    name: "Uyuşmazlık & Tahkim Masası",
    description: "Alıcı ve satıcı arasındaki ihtilaflarda platform tahkim süreci",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  instant_messaging: {
    key: "instant_messaging",
    name: "Canlı Mesajlaşma",
    description: "Pazarlık içi mesajlaşma",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
  dispute_arbitration: {
    key: "dispute_arbitration",
    name: "Uyuşmazlık Tahkimi",
    description: "Tahkim sistemi",
    enabled: true,
    updatedAt: Date.now(),
    updatedBy: "system",
  },
};
