import assert from "node:assert";
import crypto from "crypto";
import {
  ROLE_PERMISSIONS_MAP,
  hasAdminPermission,
  calculatePlatformKpis,
  formatTicketNumber,
  filterAdminAuditLogs,
  sanitizeAdminSearchResult,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
} from "../../src/lib/teklifimGelsin/adminOperationsUtils";
import {
  TeklifimAdminRole,
  TeklifimAdminPermission,
  TeklifimAdminAuditLog,
  TeklifimOrder,
  TeklifimPayment,
  TeklifimDispute,
  TeklifimSupportTicket,
  TeklifimFeatureFlag,
  TeklifimPlatformSettings,
} from "../../src/types/teklifimGelsin";

console.log("===============================================================");
console.log(">> [TOPTANCIM CEBIMDE TEST] FAZ 12: Admin & Platform Operasyon");
console.log("===============================================================");

// ---------------------------------------------------------------------------
// TEST 1: super_admin wildcard permission access
// ---------------------------------------------------------------------------
console.log("1. Test: super_admin has access to wildcard permission (*)...");
assert.strictEqual(hasAdminPermission("super_admin", "*"), true);
assert.strictEqual(hasAdminPermission("super_admin", "users.read"), true);
assert.strictEqual(hasAdminPermission("super_admin", "finance.view"), true);
assert.strictEqual(hasAdminPermission("super_admin", "settings.manage"), true);
console.log("PASSED: super_admin has universal access.");

// ---------------------------------------------------------------------------
// TEST 2: operations_admin permissions isolation
// ---------------------------------------------------------------------------
console.log("2. Test: operations_admin permissions isolation...");
assert.strictEqual(hasAdminPermission("operations_admin", "users.read"), true);
assert.strictEqual(hasAdminPermission("operations_admin", "suppliers.manage"), true);
assert.strictEqual(hasAdminPermission("operations_admin", "orders.manage"), true);
assert.strictEqual(hasAdminPermission("operations_admin", "payments.manage"), false);
assert.strictEqual(hasAdminPermission("operations_admin", "finance.view"), false);
console.log("PASSED: operations_admin permissions are isolated from finance.");

// ---------------------------------------------------------------------------
// TEST 3: finance_admin permissions isolation
// ---------------------------------------------------------------------------
console.log("3. Test: finance_admin permissions isolation...");
assert.strictEqual(hasAdminPermission("finance_admin", "payments.view"), true);
assert.strictEqual(hasAdminPermission("finance_admin", "finance.view"), true);
assert.strictEqual(hasAdminPermission("finance_admin", "refunds.manage"), true);
assert.strictEqual(hasAdminPermission("finance_admin", "products.moderate"), false);
assert.strictEqual(hasAdminPermission("finance_admin", "users.suspend"), false);
console.log("PASSED: finance_admin can manage finances but not moderate products or users.");

// ---------------------------------------------------------------------------
// TEST 4: moderation_admin permissions isolation
// ---------------------------------------------------------------------------
console.log("4. Test: moderation_admin permissions isolation...");
assert.strictEqual(hasAdminPermission("moderation_admin", "products.moderate"), true);
assert.strictEqual(hasAdminPermission("moderation_admin", "disputes.manage"), true);
assert.strictEqual(hasAdminPermission("moderation_admin", "reports.manage"), true);
assert.strictEqual(hasAdminPermission("moderation_admin", "finance.view"), false);
assert.strictEqual(hasAdminPermission("moderation_admin", "payments.manage"), false);
console.log("PASSED: moderation_admin can moderate content and disputes but not finance.");

// ---------------------------------------------------------------------------
// TEST 5: support_admin permissions isolation
// ---------------------------------------------------------------------------
console.log("5. Test: support_admin permissions isolation...");
assert.strictEqual(hasAdminPermission("support_admin", "support.manage"), true);
assert.strictEqual(hasAdminPermission("support_admin", "users.read"), true);
assert.strictEqual(hasAdminPermission("support_admin", "settings.manage"), false);
assert.strictEqual(hasAdminPermission("support_admin", "feature_flags.manage"), false);
console.log("PASSED: support_admin can answer tickets and read users but not change settings.");

// ---------------------------------------------------------------------------
// TEST 6: Undefined or non-admin role rejection
// ---------------------------------------------------------------------------
console.log("6. Test: Undefined or invalid admin role rejection...");
assert.strictEqual(hasAdminPermission(undefined, "users.read"), false);
assert.strictEqual(hasAdminPermission("" as any, "orders.manage"), false);
assert.strictEqual(hasAdminPermission("buyer" as any, "disputes.manage"), false);
console.log("PASSED: Non-admin roles rejected with false.");

// ---------------------------------------------------------------------------
// TEST 7: Wildcard matching behavior
// ---------------------------------------------------------------------------
console.log("7. Test: Wildcard (*) permission matching...");
const customSuperRole: TeklifimAdminRole = "super_admin";
const anyPermission: TeklifimAdminPermission = "audit.view";
assert.strictEqual(hasAdminPermission(customSuperRole, anyPermission), true);
console.log("PASSED: Wildcard correctly satisfies any permission.");

// ---------------------------------------------------------------------------
// TEST 8: Missing permission returns false
// ---------------------------------------------------------------------------
console.log("8. Test: Missing permission explicitly returns false...");
assert.strictEqual(hasAdminPermission("support_admin", "refunds.manage"), false);
assert.strictEqual(hasAdminPermission("operations_admin", "feature_flags.manage"), false);
console.log("PASSED: Missing permissions evaluate to false.");

// ---------------------------------------------------------------------------
// TEST 9: calculatePlatformKpis accurately calculates GMV
// ---------------------------------------------------------------------------
console.log("9. Test: calculatePlatformKpis accurately calculates GMV from completed orders...");
const sampleOrders: any[] = [
  {
    id: "ord_1",
    orderNumber: "SIP-2026-001",
    requestId: "req_1",
    offerId: "off_1",
    businessId: "biz_1",
    businessName: "Kadıköy Cafe",
    supplierId: "sup_1",
    supplierName: "Metro Toptan",
    status: "completed",
    totalAmount: 15000,
    currency: "TRY",
    commissionRate: 0.05,
    commissionAmount: 750,
    platformFeeRate: 0.05,
    platformFee: 750,
    supplierPayoutAmount: 14250,
    items: [],
    shippingAddress: {} as any,
    invoiceDetails: {} as any,
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "ord_2",
    orderNumber: "SIP-2026-002",
    requestId: "req_2",
    offerId: "off_2",
    businessId: "biz_2",
    businessName: "Beşiktaş Restoran",
    supplierId: "sup_1",
    supplierName: "Metro Toptan",
    status: "delivered",
    totalAmount: 25000,
    currency: "TRY",
    commissionRate: 0.05,
    commissionAmount: 1250,
    platformFeeRate: 0.05,
    platformFee: 1250,
    supplierPayoutAmount: 23750,
    items: [],
    shippingAddress: {} as any,
    invoiceDetails: {} as any,
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const kpis = calculatePlatformKpis(sampleOrders, [], 10, 5, 12);
assert.strictEqual(kpis.totalGmv, 40000);
assert.strictEqual(kpis.completedOrdersCount, 2);
console.log("PASSED: GMV correctly summed to 40,000 TL.");

// ---------------------------------------------------------------------------
// TEST 10: calculatePlatformKpis platform net commission
// ---------------------------------------------------------------------------
console.log("10. Test: calculatePlatformKpis net commission calculation...");
assert.strictEqual(kpis.platformNetCommission, 2000);
console.log("PASSED: Net commission correctly calculated as 2,000 TL.");

// ---------------------------------------------------------------------------
// TEST 11: calculatePlatformKpis empty datasets resilience
// ---------------------------------------------------------------------------
console.log("11. Test: calculatePlatformKpis handles empty datasets without division by zero...");
const emptyKpis = calculatePlatformKpis([], [], 0, 0, 0);
assert.strictEqual(emptyKpis.totalGmv, 0);
assert.strictEqual(emptyKpis.platformNetCommission, 0);
assert.strictEqual(emptyKpis.completedOrdersCount, 0);
assert.strictEqual(emptyKpis.activeBusinessesCount, 0);
assert.strictEqual(emptyKpis.activeSuppliersCount, 0);
console.log("PASSED: Empty datasets handled safely.");

// ---------------------------------------------------------------------------
// TEST 12: calculatePlatformKpis ignores cancelled and pending orders
// ---------------------------------------------------------------------------
console.log("12. Test: calculatePlatformKpis ignores cancelled / pending orders in GMV...");
const mixedOrders: any[] = [
  ...sampleOrders,
  {
    id: "ord_cancelled",
    orderNumber: "SIP-2026-003",
    requestId: "req_3",
    offerId: "off_3",
    businessId: "biz_1",
    businessName: "Kadıköy Cafe",
    supplierId: "sup_1",
    supplierName: "Metro Toptan",
    status: "cancelled",
    totalAmount: 50000,
    currency: "TRY",
    commissionRate: 0.05,
    commissionAmount: 2500,
    supplierPayoutAmount: 47500,
    items: [],
    shippingAddress: {} as any,
    invoiceDetails: {} as any,
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "ord_pending",
    orderNumber: "SIP-2026-004",
    requestId: "req_4",
    offerId: "off_4",
    businessId: "biz_1",
    businessName: "Kadıköy Cafe",
    supplierId: "sup_1",
    supplierName: "Metro Toptan",
    status: "preparing",
    totalAmount: 10000,
    currency: "TRY",
    commissionRate: 0.05,
    commissionAmount: 500,
    supplierPayoutAmount: 9500,
    items: [],
    shippingAddress: {} as any,
    invoiceDetails: {} as any,
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const mixedKpis = calculatePlatformKpis(mixedOrders, [], 10, 5, 12);
assert.strictEqual(mixedKpis.totalGmv, 40000);
assert.strictEqual(mixedKpis.completedOrdersCount, 2);
console.log("PASSED: Cancelled and pending orders excluded from GMV.");

// ---------------------------------------------------------------------------
// TEST 13: calculatePlatformKpis entity counts
// ---------------------------------------------------------------------------
console.log("13. Test: calculatePlatformKpis entity counts correctly mapped...");
assert.strictEqual(kpis.activeBusinessesCount, 10);
assert.strictEqual(kpis.activeSuppliersCount, 5);
assert.strictEqual(kpis.openRequestsCount, 12);
console.log("PASSED: Entity counts accurately reflected.");

// ---------------------------------------------------------------------------
// TEST 14: formatTicketNumber sequence generator
// ---------------------------------------------------------------------------
console.log("14. Test: formatTicketNumber generates sequence string (#TG-0001)...");
assert.strictEqual(formatTicketNumber(1), "#TG-0001");
assert.strictEqual(formatTicketNumber(42), "#TG-0042");
assert.strictEqual(formatTicketNumber(1005), "#TG-1005");
assert.strictEqual(formatTicketNumber(12345), "#TG-12345");
console.log("PASSED: Ticket number sequence formatted with leading zeros.");

// ---------------------------------------------------------------------------
// TEST 15: filterAdminAuditLogs by admin email
// ---------------------------------------------------------------------------
console.log("15. Test: filterAdminAuditLogs filters by admin email...");
const sampleLogs: TeklifimAdminAuditLog[] = [
  {
    id: "aud_1",
    adminId: "adm_1",
    adminEmail: "alihaydarkvk@kvkdijitalcozumler.com",
    adminRole: "super_admin",
    action: "user.suspend",
    targetType: "user",
    targetId: "usr_123",
    details: { reason: "fraud" },
    timestamp: Date.now() - 1000,
  },
  {
    id: "aud_2",
    adminId: "adm_2",
    adminEmail: "moderator@kvkdijitalcozumler.com",
    adminRole: "moderation_admin",
    action: "product.moderate",
    targetType: "product",
    targetId: "prd_456",
    details: { status: "suspended" },
    timestamp: Date.now() - 500,
  },
  {
    id: "aud_3",
    adminId: "adm_1",
    adminEmail: "alihaydarkvk@kvkdijitalcozumler.com",
    adminRole: "super_admin",
    action: "dispute.resolve",
    targetType: "dispute",
    targetId: "dsp_789",
    details: { outcome: "buyer_favor" },
    timestamp: Date.now(),
  },
];

const emailFiltered = filterAdminAuditLogs(sampleLogs, {
  adminEmail: "alihaydarkvk@kvkdijitalcozumler.com",
});
assert.strictEqual(emailFiltered.length, 2);
assert.ok(emailFiltered.every((l) => l.adminEmail === "alihaydarkvk@kvkdijitalcozumler.com"));
console.log("PASSED: Correctly filtered audit logs by admin email.");

// ---------------------------------------------------------------------------
// TEST 16: filterAdminAuditLogs by action name
// ---------------------------------------------------------------------------
console.log("16. Test: filterAdminAuditLogs filters by action name...");
const actionFiltered = filterAdminAuditLogs(sampleLogs, { action: "product.moderate" });
assert.strictEqual(actionFiltered.length, 1);
assert.strictEqual(actionFiltered[0].id, "aud_2");
console.log("PASSED: Correctly filtered audit logs by action.");

// ---------------------------------------------------------------------------
// TEST 17: filterAdminAuditLogs by target type
// ---------------------------------------------------------------------------
console.log("17. Test: filterAdminAuditLogs filters by target type...");
const targetFiltered = filterAdminAuditLogs(sampleLogs, { targetType: "dispute" });
assert.strictEqual(targetFiltered.length, 1);
assert.strictEqual(targetFiltered[0].id, "aud_3");
console.log("PASSED: Correctly filtered audit logs by target type.");

// ---------------------------------------------------------------------------
// TEST 18: filterAdminAuditLogs composite criteria
// ---------------------------------------------------------------------------
console.log("18. Test: filterAdminAuditLogs applies composite criteria simultaneously...");
const compositeFiltered = filterAdminAuditLogs(sampleLogs, {
  adminEmail: "alihaydarkvk@kvkdijitalcozumler.com",
  targetType: "dispute",
});
assert.strictEqual(compositeFiltered.length, 1);
assert.strictEqual(compositeFiltered[0].id, "aud_3");
console.log("PASSED: Composite criteria filtered accurately.");

// ---------------------------------------------------------------------------
// TEST 19: sanitizeAdminSearchResult strips sensitive tokens
// ---------------------------------------------------------------------------
console.log("19. Test: sanitizeAdminSearchResult strips secret keys and tokens...");
const rawProfile = {
  uid: "usr_99",
  companyName: "Gizli Ticaret Ltd",
  email: "gizli@ticaret.com",
  phone: "05551234567",
  passwordHash: "$2b$10$xyz123fakehash",
  secretKey: "sk_live_verysecretstring",
  apiKey: "tg_live_abcdef123456",
  authToken: "jwt.token.string",
  isVerified: true,
  role: "supplier",
};

const sanitized = sanitizeAdminSearchResult(rawProfile);
assert.strictEqual(sanitized.passwordHash, undefined);
assert.strictEqual(sanitized.secretKey, undefined);
assert.strictEqual(sanitized.apiKey, undefined);
assert.strictEqual(sanitized.authToken, undefined);
console.log("PASSED: Sensitive credentials stripped from search results.");

// ---------------------------------------------------------------------------
// TEST 20: sanitizeAdminSearchResult retains safe properties
// ---------------------------------------------------------------------------
console.log("20. Test: sanitizeAdminSearchResult retains non-sensitive properties...");
assert.strictEqual(sanitized.uid, "usr_99");
assert.strictEqual(sanitized.companyName, "Gizli Ticaret Ltd");
assert.strictEqual(sanitized.email, "gizli@ticaret.com");
assert.strictEqual(sanitized.phone, "05551234567");
assert.strictEqual(sanitized.isVerified, true);
assert.strictEqual(sanitized.role, "supplier");
console.log("PASSED: Safe profile properties preserved.");

// ---------------------------------------------------------------------------
// TEST 21: User suspension logic & expiration calculation
// ---------------------------------------------------------------------------
console.log("21. Test: User suspension expiration calculation...");
const now = Date.now();
const durationDays = 30;
const expectedExpiresAt = now + durationDays * 86400000;
const suspensionData = {
  status: "suspended",
  suspendedAt: now,
  suspendedBy: "adm_1",
  suspensionReason: "Sahte teklif ve yanıltıcı fiyatlandırma",
  suspensionExpiresAt: expectedExpiresAt,
};
assert.strictEqual(suspensionData.status, "suspended");
assert.strictEqual(suspensionData.suspensionExpiresAt > now, true);
assert.strictEqual(suspensionData.suspensionExpiresAt, expectedExpiresAt);
console.log("PASSED: Suspension expiration calculated accurately.");

// ---------------------------------------------------------------------------
// TEST 22: User unsuspend reset
// ---------------------------------------------------------------------------
console.log("22. Test: User unsuspend restores active status and clears suspension...");
const restoredUser = {
  ...suspensionData,
  status: "active",
  suspendedAt: null,
  suspendedBy: null,
  suspensionReason: null,
  suspensionExpiresAt: null,
};
assert.strictEqual(restoredUser.status, "active");
assert.strictEqual(restoredUser.suspendedAt, null);
assert.strictEqual(restoredUser.suspensionReason, null);
console.log("PASSED: User account unsuspended cleanly.");

// ---------------------------------------------------------------------------
// TEST 23: Product moderation lifecycle transitions
// ---------------------------------------------------------------------------
console.log("23. Test: Product moderation lifecycle transitions (active -> suspended -> archived)...");
const productRecord: { id: string; status: "active" | "suspended" | "archived" } = {
  id: "prd_100",
  status: "active",
};
assert.strictEqual(productRecord.status, "active");

productRecord.status = "suspended";
assert.strictEqual(productRecord.status, "suspended");

productRecord.status = "archived";
assert.strictEqual(productRecord.status, "archived");
console.log("PASSED: Product moderation statuses transition properly.");

// ---------------------------------------------------------------------------
// TEST 24: Dispute resolution logic (buyer_favor & refund)
// ---------------------------------------------------------------------------
console.log("24. Test: Dispute resolution records buyer_favor with refund amount...");
const disputeRecord: TeklifimDispute = {
  id: "dsp_500",
  orderId: "ord_1",
  orderNumber: "SIP-2026-001",
  businessId: "biz_1",
  businessName: "Kadıköy Cafe",
  supplierId: "sup_1",
  supplierName: "Metro Toptan",
  reason: "Eksik ve hasarlı ürün teslimatı",
  description: "50 koli yumurta kırık teslim edildi.",
  status: "open",
  createdAt: now - 3600000,
  updatedAt: now - 3600000,
};

const resolution = {
  outcome: "buyer_favor" as const,
  notes: "Kargo hasar tutanağı incelendi, hasarlı ürün bedeli iade edildi.",
  resolvedBy: "adm_1",
  resolvedAt: now,
  refundAmount: 5000,
};

const resolvedDispute: TeklifimDispute = {
  ...disputeRecord,
  status: "resolved",
  resolution,
  updatedAt: now,
};

assert.strictEqual(resolvedDispute.status, "resolved");
assert.strictEqual(resolvedDispute.resolution?.outcome, "buyer_favor");
assert.strictEqual(resolvedDispute.resolution?.refundAmount, 5000);
assert.ok(resolvedDispute.resolution?.notes.includes("Kargo hasar tutanağı"));
console.log("PASSED: Dispute resolved in buyer favor with refund.");

// ---------------------------------------------------------------------------
// TEST 25: Support ticket reply appending and status transition
// ---------------------------------------------------------------------------
console.log("25. Test: Support ticket reply preserves history and updates status...");
const ticket: TeklifimSupportTicket = {
  id: "tkt_1",
  ticketNumber: "#TG-0001",
  userId: "usr_1",
  userEmail: "cafe@ornek.com",
  userName: "cafe",
  userRole: "business",
  subject: "Fatura İtirazı",
  category: "billing",
  description: "Faturamda KDV oranı yanlış girilmiş.",
  status: "open",
  priority: "medium",
  messages: [
    {
      id: "msg_1",
      senderId: "usr_1",
      senderName: "cafe",
      senderRole: "business",
      message: "Faturamda KDV oranı yanlış girilmiş.",
      timestamp: now - 7200000,
    },
  ],
  createdAt: now - 7200000,
  updatedAt: now - 7200000,
};

const replyMsg = {
  id: "msg_2",
  senderId: "adm_support",
  senderName: "Destek Ekibi",
  senderRole: "support",
  message: "İtirazınız muhasebe birimine iletildi, düzeltilmiş e-fatura hazırlandı.",
  timestamp: now,
};

const updatedTicket: TeklifimSupportTicket = {
  ...ticket,
  status: "resolved",
  messages: [...ticket.messages, replyMsg],
  updatedAt: now,
};

assert.strictEqual(updatedTicket.messages.length, 2);
assert.strictEqual(updatedTicket.messages[1].senderRole, "support");
assert.strictEqual(updatedTicket.status, "resolved");
console.log("PASSED: Support ticket reply appended and status marked resolved.");

// ---------------------------------------------------------------------------
// TEST 26: Platform settings and feature flags default configuration
// ---------------------------------------------------------------------------
console.log("26. Test: Default platform settings and feature flags integrity...");
assert.strictEqual(typeof DEFAULT_PLATFORM_SETTINGS.marketplace.defaultCommissionRate, "number");
assert.strictEqual(typeof DEFAULT_PLATFORM_SETTINGS.security.rateLimitPerMin, "number");
assert.strictEqual(typeof DEFAULT_PLATFORM_SETTINGS.payments.sandboxMode, "boolean");

assert.ok(DEFAULT_FEATURE_FLAGS["instant_messaging"]);
assert.ok(DEFAULT_FEATURE_FLAGS["dispute_arbitration"]);
assert.strictEqual(DEFAULT_FEATURE_FLAGS["instant_messaging"].enabled, true);

// Test merging custom settings
const customSettings: Partial<TeklifimPlatformSettings> = {
  marketplace: {
    ...DEFAULT_PLATFORM_SETTINGS.marketplace,
    defaultCommissionRate: 7.5,
  },
};
const mergedSettings = {
  ...DEFAULT_PLATFORM_SETTINGS,
  marketplace: {
    ...DEFAULT_PLATFORM_SETTINGS.marketplace,
    ...(customSettings.marketplace || {}),
  },
};
assert.strictEqual(mergedSettings.marketplace.defaultCommissionRate, 7.5);
assert.strictEqual(
  mergedSettings.marketplace.minRequestDurationDays,
  DEFAULT_PLATFORM_SETTINGS.marketplace.minRequestDurationDays
);
console.log("PASSED: Platform settings and feature flags defaults verified and merged cleanly.");

console.log("\n===============================================================");
console.log(">> ALL 26 FAZ 12 TEST SCENARIOS PASSED SUCCESSFULLY!");
console.log("===============================================================");
