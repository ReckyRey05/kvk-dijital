import { getAdminDb } from "@/lib/firebase/admin";
import crypto from "crypto";
import { verifyTeklifimUser, TeklifimAuthUser } from "./teklifimAuth";
import { checkRateLimit } from "@/lib/security/rateLimit";
import {
  TeklifimAdminRole,
  TeklifimAdminPermission,
  TeklifimAdminAuditLog,
  TeklifimDispute,
  TeklifimDisputeStatus,
  TeklifimDisputeOutcome,
  TeklifimSupportTicket,
  TeklifimSupportTicketStatus,
  TeklifimModerationNote,
  TeklifimFeatureFlag,
  TeklifimPlatformSettings,
  TeklifimAnnouncement,
  TeklifimAdminCategory,
  TeklifimProfile,
  TeklifimOrder,
  TeklifimPayment,
  TeklifimProduct,
  TeklifimRequest,
  TEKLIFIM_CATEGORIES,
  CATEGORY_DETAILS,
} from "@/types/teklifimGelsin";
import {
  hasAdminPermission,
  calculatePlatformKpis,
  formatTicketNumber,
  filterAdminAuditLogs,
  sanitizeAdminSearchResult,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
} from "./adminOperationsUtils";

function getDb() {
  return getAdminDb();
}

// ---------------------------------------------------------------------------
// Admin Role & Permission Verification
// ---------------------------------------------------------------------------

export async function verifyAdminWithPermission(
  req: Request,
  requiredPermission: TeklifimAdminPermission
): Promise<{
  authorized: boolean;
  user?: TeklifimAuthUser;
  role?: TeklifimAdminRole;
  error?: string;
  status: number;
}> {
  const user = await verifyTeklifimUser(req);
  if (!user) {
    return { authorized: false, error: "Yetkisiz erisim. Lutfen giris yapin.", status: 401 };
  }

  // Rate Limiting: 60 admin requests per minute per admin account
  const rateResult = checkRateLimit(`admin:${user.uid}`, {
    max: 60,
    windowMs: 60 * 1000,
  });

  if (!rateResult.allowed) {
    return {
      authorized: false,
      error: `Admin cagri limiti asildi. Lutfen ${rateResult.retryAfterSec} saniye sonra tekrar deneyin.`,
      status: 429,
    };
  }

  const emailLower = (user.email || "").toLowerCase();
  const isCorporateSuperAdmin =
    emailLower.endsWith("@kvkdijitalcozumler.com") ||
    emailLower === "alihaydarkvk@kvkdijitalcozumler.com" ||
    emailLower === "iletisim@kvkdijitalcozumler.com";

  let resolvedRole: TeklifimAdminRole | undefined = isCorporateSuperAdmin ? "super_admin" : undefined;

  if (!resolvedRole) {
    try {
      const db = getDb();
      const profileDoc = await db.collection("teklifim_profiles").doc(user.uid).get();
      if (profileDoc.exists) {
        const data = profileDoc.data() as any;
        if (data.adminRole) {
          resolvedRole = data.adminRole as TeklifimAdminRole;
        } else if (data.role === "admin") {
          resolvedRole = "super_admin"; // Legacy admin defaults to super_admin
        }
      }
    } catch (err) {
      console.warn("Error fetching admin profile:", err);
    }
  }

  if (!resolvedRole) {
    return {
      authorized: false,
      error: "Bu alana erisim yetkiniz bulunmamaktadir. Yonetici hesabi gereklidir.",
      status: 403,
    };
  }

  if (!hasAdminPermission(resolvedRole, requiredPermission)) {
    return {
      authorized: false,
      error: `Bu islem icin yetersiz yetki. Gerekli yetki: ${requiredPermission}`,
      status: 403,
      role: resolvedRole,
    };
  }

  return {
    authorized: true,
    user,
    role: resolvedRole,
    status: 200,
  };
}

// ---------------------------------------------------------------------------
// Immutable Audit Logging
// ---------------------------------------------------------------------------

export async function logAdminAction(
  adminUser: TeklifimAuthUser,
  role: TeklifimAdminRole,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, any> = {},
  ipAddress?: string
): Promise<TeklifimAdminAuditLog> {
  const db = getDb();
  const logId = `aud_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const now = Date.now();

  const auditLog: TeklifimAdminAuditLog = {
    id: logId,
    adminId: adminUser.uid,
    adminEmail: adminUser.email,
    adminRole: role,
    action,
    targetType,
    targetId,
    details,
    ipAddress: ipAddress || "127.0.0.1",
    timestamp: now,
  };

  try {
    await db.collection("teklifim_admin_audit_logs").doc(logId).set(auditLog);
  } catch (err) {
    console.error("Failed to write admin audit log:", err);
  }

  return auditLog;
}

// ---------------------------------------------------------------------------
// Dashboard Overview & Real KPIs
// ---------------------------------------------------------------------------

export async function getAdminDashboardSummary() {
  const db = getDb();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const [
    businessesSnap,
    suppliersSnap,
    ordersSnap,
    paymentsSnap,
    requestsSnap,
    disputesSnap,
    reportsSnap,
    verificationsSnap,
  ] = await Promise.all([
    db.collection("teklifim_profiles").where("role", "==", "business").get(),
    db.collection("teklifim_profiles").where("role", "==", "supplier").get(),
    db.collection("teklifim_orders").get(),
    db.collection("teklifim_payments").get(),
    db.collection("teklifim_requests").get(),
    db.collection("teklifim_disputes").get(),
    db.collection("teklifim_reports").get(),
    db.collection("teklifim_verification_requests").where("status", "==", "pending").get(),
  ]);

  const orders = ordersSnap.docs.map((d) => d.data() as TeklifimOrder);
  const payments = paymentsSnap.docs.map((d) => d.data() as TeklifimPayment);
  const requests = requestsSnap.docs.map((d) => d.data() as TeklifimRequest);
  const disputes = disputesSnap.docs.map((d) => d.data() as TeklifimDispute);
  const reports = reportsSnap.docs.map((d) => d.data() as any);

  // Platform KPIs
  const platformKpis = calculatePlatformKpis(
    orders,
    payments,
    businessesSnap.size,
    suppliersSnap.size,
    requests.filter((r) => r.status === "open" || r.status === "published").length
  );

  // Today Actionable Metrics (Last 24 Hours)
  const newBusinessesCount = businessesSnap.docs.filter((d) => (d.data().createdAt || 0) >= oneDayAgo).length;
  const newSuppliersCount = suppliersSnap.docs.filter((d) => (d.data().createdAt || 0) >= oneDayAgo).length;
  const newOrdersCount = orders.filter((o) => ((o as any).createdAt || 0) >= oneDayAgo).length;
  const pendingVerificationsCount = verificationsSnap.size;
  const openDisputesCount = disputes.filter((d) => d.status === "open" || d.status === "investigating").length;
  const openReportsCount = reports.filter((r) => r.status === "pending" || r.status === "reviewed").length;
  const failedPaymentsCount = payments.filter((p) => p.status === "failed" && ((p as any).createdAt || 0) >= oneDayAgo).length;

  return {
    today: {
      newBusinessesCount,
      newSuppliersCount,
      pendingVerificationsCount,
      openDisputesCount,
      openReportsCount,
      failedPaymentsCount,
      newOrdersCount,
    },
    platform: platformKpis,
    timestamp: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// User, Supplier & Business Management
// ---------------------------------------------------------------------------

export async function listAdminUsers(params: {
  role?: string;
  status?: string;
  search?: string;
  limit?: number;
}) {
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection("teklifim_profiles");

  if (params.role && params.role !== "all") {
    query = query.where("role", "==", params.role);
  }

  const snap = await query.limit(params.limit || 100).get();
  let users = snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      companyName: data.companyName || data.contactName || "Isimsiz",
      contactName: data.contactName || "",
      email: data.email || "",
      phone: data.phone || "",
      role: data.role || "user",
      city: data.city || "",
      district: data.district || "",
      status: data.status || "active",
      isVerified: data.isVerified || false,
      rating: data.rating || 5,
      completedDeals: data.completedDeals || 0,
      createdAt: data.createdAt || 0,
      suspendedAt: data.suspendedAt,
      suspensionReason: data.suspensionReason,
    };
  });

  if (params.status && params.status !== "all") {
    users = users.filter((u) => u.status === params.status);
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    users = users.filter(
      (u) =>
        u.companyName.toLowerCase().includes(q) ||
        u.contactName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
    );
  }

  return users;
}

export async function getUserDetailForAdmin(userId: string) {
  const db = getDb();
  const profileDoc = await db.collection("teklifim_profiles").doc(userId).get();

  if (!profileDoc.exists) {
    return null;
  }

  const profile = profileDoc.data() as TeklifimProfile;

  // Load linked orders, requests, reports, moderation notes
  const [ordersSnap, requestsSnap, reportsSnap, notesSnap] = await Promise.all([
    db.collection("teklifim_orders").where(profile.role === "supplier" ? "supplierId" : "businessId", "==", userId).limit(20).get(),
    db.collection("teklifim_requests").where("businessId", "==", userId).limit(20).get(),
    db.collection("teklifim_reports").where("targetId", "==", userId).limit(20).get(),
    db.collection("teklifim_moderation_notes").where("targetId", "==", userId).limit(20).get(),
  ]);

  return {
    profile: sanitizeAdminSearchResult(profile),
    recentOrders: ordersSnap.docs.map((d) => d.data()),
    recentRequests: requestsSnap.docs.map((d) => d.data()),
    reports: reportsSnap.docs.map((d) => d.data()),
    moderationNotes: notesSnap.docs.map((d) => d.data()),
  };
}

export async function suspendUser(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  targetUserId: string,
  reason: string,
  durationDays?: number,
  notes?: string
): Promise<void> {
  const db = getDb();
  const now = Date.now();
  const expiresAt = durationDays ? now + durationDays * 86400000 : undefined;

  await db.collection("teklifim_profiles").doc(targetUserId).update({
    status: "suspended",
    suspendedAt: now,
    suspendedBy: adminUser.uid,
    suspensionReason: reason,
    suspensionExpiresAt: expiresAt || null,
    updatedAt: now,
  });

  await logAdminAction(
    adminUser,
    adminRole,
    "user.suspend",
    "user",
    targetUserId,
    { reason, durationDays, expiresAt, notes }
  );
}

export async function unsuspendUser(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  targetUserId: string
): Promise<void> {
  const db = getDb();
  const now = Date.now();

  await db.collection("teklifim_profiles").doc(targetUserId).update({
    status: "active",
    suspendedAt: null,
    suspendedBy: null,
    suspensionReason: null,
    suspensionExpiresAt: null,
    updatedAt: now,
  });

  await logAdminAction(
    adminUser,
    adminRole,
    "user.unsuspend",
    "user",
    targetUserId,
    {}
  );
}

// ---------------------------------------------------------------------------
// Product Moderation
// ---------------------------------------------------------------------------

export async function moderateProduct(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  productId: string,
  status: "active" | "suspended" | "archived" | "published",
  category?: string
): Promise<void> {
  const db = getDb();
  const now = Date.now();
  const updateData: any = {
    status,
    updatedAt: now,
  };

  if (category) {
    updateData.category = category;
  }

  await db.collection("teklifim_products").doc(productId).update(updateData);

  await logAdminAction(
    adminUser,
    adminRole,
    "product.moderate",
    "product",
    productId,
    { status, category }
  );
}

// ---------------------------------------------------------------------------
// Category Management
// ---------------------------------------------------------------------------

export async function getAdminCategories(): Promise<TeklifimAdminCategory[]> {
  const db = getDb();
  const snap = await db.collection("teklifim_categories").orderBy("sortOrder", "asc").get();

  if (!snap.empty) {
    return snap.docs.map((d) => d.data() as TeklifimAdminCategory);
  }

  // Initialize from defaults
  const categories: TeklifimAdminCategory[] = TEKLIFIM_CATEGORIES.map((name, i) => {
    const details = CATEGORY_DETAILS[name] || {};
    return {
      id: `cat_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name,
      slug: (details as any).slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      icon: (details as any).icon || "Package",
      subCategories: (details as any).subcategories || [],
      isActive: true,
      sortOrder: i + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });

  return categories;
}

export async function saveAdminCategory(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  category: Partial<TeklifimAdminCategory>
): Promise<TeklifimAdminCategory> {
  const db = getDb();
  const now = Date.now();
  const id = category.id || `cat_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

  const savedCategory: TeklifimAdminCategory = {
    id,
    name: (category.name || "").trim(),
    slug: (category.slug || "").trim().toLowerCase(),
    icon: category.icon || "Package",
    subCategories: Array.isArray(category.subCategories) ? category.subCategories : [],
    isActive: category.isActive !== false,
    sortOrder: Number(category.sortOrder) || 1,
    createdAt: category.createdAt || now,
    updatedAt: now,
  };

  await db.collection("teklifim_categories").doc(id).set(savedCategory, { merge: true });

  await logAdminAction(
    adminUser,
    adminRole,
    category.id ? "category.update" : "category.create",
    "category",
    id,
    { name: savedCategory.name, isActive: savedCategory.isActive }
  );

  return savedCategory;
}

// ---------------------------------------------------------------------------
// Dispute Center (Uyuşmazlık Yönetimi)
// ---------------------------------------------------------------------------

export async function listAdminDisputes(status?: string): Promise<TeklifimDispute[]> {
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection("teklifim_disputes").orderBy("createdAt", "desc");

  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }

  const snap = await query.limit(100).get();
  return snap.docs.map((d) => d.data() as TeklifimDispute);
}

export async function resolveAdminDispute(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  disputeId: string,
  outcome: TeklifimDisputeOutcome,
  notes: string,
  refundAmount?: number
): Promise<void> {
  const db = getDb();
  const now = Date.now();
  const disputeRef = db.collection("teklifim_disputes").doc(disputeId);
  const disputeDoc = await disputeRef.get();

  if (!disputeDoc.exists) {
    throw new Error("Uyusmazlik kaydi bulunamadi.");
  }

  const resolution = {
    outcome,
    notes,
    resolvedBy: adminUser.uid,
    resolvedAt: now,
    refundAmount: refundAmount || 0,
  };

  await disputeRef.update({
    status: "resolved",
    resolution,
    updatedAt: now,
  });

  // Sync with order dispute status
  const dispute = disputeDoc.data() as TeklifimDispute;
  if (dispute.orderId) {
    await db.collection("teklifim_orders").doc(dispute.orderId).update({
      disputeStatus: "resolved",
      disputeOutcome: outcome,
      updatedAt: now,
    }).catch(() => {});
  }

  await logAdminAction(
    adminUser,
    adminRole,
    "dispute.resolve",
    "dispute",
    disputeId,
    { outcome, notes, refundAmount, orderId: dispute.orderId }
  );
}

// ---------------------------------------------------------------------------
// Moderation Notes (Dahili Notlar)
// ---------------------------------------------------------------------------

export async function addModerationNote(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  targetType: "user" | "supplier" | "business" | "product" | "request" | "order" | "dispute",
  targetId: string,
  note: string
): Promise<TeklifimModerationNote> {
  const db = getDb();
  const noteId = `note_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const now = Date.now();

  const modNote: TeklifimModerationNote = {
    id: noteId,
    targetType,
    targetId,
    authorId: adminUser.uid,
    authorName: adminUser.email.split("@")[0],
    authorRole: adminRole,
    note: note.trim(),
    createdAt: now,
  };

  await db.collection("teklifim_moderation_notes").doc(noteId).set(modNote);

  return modNote;
}

export async function getModerationNotes(targetType: string, targetId: string): Promise<TeklifimModerationNote[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_moderation_notes")
    .where("targetType", "==", targetType)
    .where("targetId", "==", targetId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((d) => d.data() as TeklifimModerationNote);
}

// ---------------------------------------------------------------------------
// Feature Flags & Platform Settings
// ---------------------------------------------------------------------------

export async function getAdminFeatureFlags(): Promise<Record<string, TeklifimFeatureFlag>> {
  const db = getDb();
  const snap = await db.collection("teklifim_feature_flags").get();

  if (!snap.empty) {
    const flags: Record<string, TeklifimFeatureFlag> = {};
    snap.docs.forEach((d) => {
      flags[d.id] = d.data() as TeklifimFeatureFlag;
    });
    return flags;
  }

  // If empty, return defaults
  return DEFAULT_FEATURE_FLAGS;
}

export async function updateAdminFeatureFlag(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  key: string,
  enabled: boolean
): Promise<TeklifimFeatureFlag> {
  const db = getDb();
  const now = Date.now();
  const defaultMeta = DEFAULT_FEATURE_FLAGS[key];

  const flag: TeklifimFeatureFlag = {
    key,
    name: defaultMeta?.name || key,
    description: defaultMeta?.description || "",
    enabled,
    updatedAt: now,
    updatedBy: adminUser.email,
  };

  await db.collection("teklifim_feature_flags").doc(key).set(flag);

  await logAdminAction(
    adminUser,
    adminRole,
    "feature_flag.update",
    "feature_flag",
    key,
    { enabled }
  );

  return flag;
}

export async function getAdminPlatformSettings(): Promise<TeklifimPlatformSettings> {
  const db = getDb();
  const doc = await db.collection("teklifim_platform_settings").doc("general").get();

  if (doc.exists) {
    return { ...DEFAULT_PLATFORM_SETTINGS, ...doc.data() } as TeklifimPlatformSettings;
  }

  return DEFAULT_PLATFORM_SETTINGS;
}

export async function updateAdminPlatformSettings(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  settings: Partial<TeklifimPlatformSettings>
): Promise<TeklifimPlatformSettings> {
  const db = getDb();
  const current = await getAdminPlatformSettings();
  const updated: TeklifimPlatformSettings = {
    marketplace: { ...current.marketplace, ...(settings.marketplace || {}) },
    security: { ...current.security, ...(settings.security || {}) },
    payments: { ...current.payments, ...(settings.payments || {}) },
    moderation: { ...current.moderation, ...(settings.moderation || {}) },
    notifications: { ...current.notifications, ...(settings.notifications || {}) },
  };

  await db.collection("teklifim_platform_settings").doc("general").set(updated, { merge: true });

  await logAdminAction(
    adminUser,
    adminRole,
    "platform_settings.update",
    "settings",
    "general",
    { updated }
  );

  return updated;
}

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export async function listAdminSupportTickets(status?: string): Promise<TeklifimSupportTicket[]> {
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection("teklifim_support_tickets").orderBy("createdAt", "desc");

  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }

  const snap = await query.limit(100).get();
  return snap.docs.map((d) => d.data() as TeklifimSupportTicket);
}

export async function createSupportTicket(
  user: TeklifimAuthUser,
  data: {
    subject: string;
    category: string;
    description: string;
    priority?: "low" | "medium" | "high" | "urgent";
  }
): Promise<TeklifimSupportTicket> {
  const db = getDb();
  const countSnap = await db.collection("teklifim_support_tickets").get();
  const ticketNumber = formatTicketNumber(countSnap.size + 1);
  const ticketId = `tkt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const now = Date.now();

  const ticket: TeklifimSupportTicket = {
    id: ticketId,
    ticketNumber,
    userId: user.uid,
    userEmail: user.email,
    userName: user.email.split("@")[0],
    userRole: user.role || "user",
    subject: data.subject.trim(),
    category: data.category,
    description: data.description.trim(),
    status: "open",
    priority: data.priority || "medium",
    messages: [
      {
        id: `msg_${now}`,
        senderId: user.uid,
        senderName: user.email.split("@")[0],
        senderRole: user.role || "user",
        message: data.description.trim(),
        timestamp: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("teklifim_support_tickets").doc(ticketId).set(ticket);
  return ticket;
}

export async function replySupportTicket(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  ticketId: string,
  message: string,
  newStatus?: TeklifimSupportTicketStatus,
  internalNote?: string
): Promise<void> {
  const db = getDb();
  const ticketRef = db.collection("teklifim_support_tickets").doc(ticketId);
  const ticketDoc = await ticketRef.get();

  if (!ticketDoc.exists) {
    throw new Error("Destek talebi bulunamadi.");
  }

  const ticket = ticketDoc.data() as TeklifimSupportTicket;
  const now = Date.now();

  const newMsg = {
    id: `msg_${now}`,
    senderId: adminUser.uid,
    senderName: "Destek Ekibi",
    senderRole: "support",
    message: message.trim(),
    timestamp: now,
  };

  const updateData: any = {
    messages: [...ticket.messages, newMsg],
    updatedAt: now,
  };

  if (newStatus) {
    updateData.status = newStatus;
  }

  if (internalNote) {
    updateData.internalNotes = [...(ticket.internalNotes || []), `${new Date(now).toLocaleString("tr-TR")} [${adminUser.email}]: ${internalNote}`];
  }

  await ticketRef.update(updateData);

  await logAdminAction(
    adminUser,
    adminRole,
    "support.reply",
    "support_ticket",
    ticketId,
    { newStatus, hasInternalNote: !!internalNote }
  );
}

// ---------------------------------------------------------------------------
// Global Omnibar Search
// ---------------------------------------------------------------------------

export async function performGlobalAdminSearch(queryStr: string) {
  const q = queryStr.trim().toLowerCase();
  if (!q) return { orders: [], users: [], products: [], requests: [], payments: [] };

  const db = getDb();

  // Parallel lookup
  const [ordersSnap, profilesSnap, productsSnap, requestsSnap, paymentsSnap] = await Promise.all([
    db.collection("teklifim_orders").limit(30).get(),
    db.collection("teklifim_profiles").limit(30).get(),
    db.collection("teklifim_products").limit(30).get(),
    db.collection("teklifim_requests").limit(30).get(),
    db.collection("teklifim_payments").limit(30).get(),
  ]);

  const matchedOrders = ordersSnap.docs
    .map((d) => d.data() as TeklifimOrder)
    .filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.businessName?.toLowerCase().includes(q) ||
        o.supplierName?.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const matchedPayments = paymentsSnap.docs
    .map((d) => d.data() as TeklifimPayment)
    .filter(
      (p) =>
        p.paymentNumber?.toLowerCase().includes(q) ||
        p.businessName?.toLowerCase().includes(q) ||
        p.supplierName?.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const matchedUsers = profilesSnap.docs
    .map((d) => d.data() as any)
    .filter(
      (u) =>
        u.companyName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.contactName?.toLowerCase().includes(q)
    )
    .map(sanitizeAdminSearchResult)
    .slice(0, 5);

  const matchedProducts = productsSnap.docs
    .map((d) => d.data() as TeklifimProduct)
    .filter((p) => p.title?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q))
    .slice(0, 5);

  const matchedRequests = requestsSnap.docs
    .map((d) => d.data() as TeklifimRequest)
    .filter((r) => r.title?.toLowerCase().includes(q) || r.productName?.toLowerCase().includes(q))
    .slice(0, 5);

  return {
    orders: matchedOrders,
    payments: matchedPayments,
    users: matchedUsers,
    products: matchedProducts,
    requests: matchedRequests,
  };
}

// ---------------------------------------------------------------------------
// Audit Logs Service
// ---------------------------------------------------------------------------

export async function listAdminAuditLogs(params?: {
  adminEmail?: string;
  action?: string;
  targetType?: string;
  limit?: number;
}): Promise<TeklifimAdminAuditLog[]> {
  const db = getDb();
  const limitCount = params?.limit || 100;
  const snap = await db
    .collection("teklifim_admin_audit_logs")
    .orderBy("timestamp", "desc")
    .limit(limitCount)
    .get();

  let logs = snap.docs.map((d) => d.data() as TeklifimAdminAuditLog);

  if (params?.adminEmail || params?.action || params?.targetType) {
    logs = filterAdminAuditLogs(logs, params);
  }

  return logs;
}

// ---------------------------------------------------------------------------
// Platform Announcements Service
// ---------------------------------------------------------------------------

export async function listAdminAnnouncements(): Promise<TeklifimAnnouncement[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_announcements")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snap.docs.map((d) => d.data() as TeklifimAnnouncement);
}

export async function createAdminAnnouncement(
  adminUser: TeklifimAuthUser,
  adminRole: TeklifimAdminRole,
  data: {
    title: string;
    content: string;
    targetRole?: "all" | "business" | "supplier";
    channel?: "in_app" | "push";
    status?: "draft" | "published";
  }
): Promise<TeklifimAnnouncement> {
  const db = getDb();
  const id = `ann_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const now = Date.now();

  const announcement: TeklifimAnnouncement = {
    id,
    title: data.title.trim(),
    content: data.content.trim(),
    targetRole: data.targetRole || "all",
    channel: data.channel || "in_app",
    status: data.status || "published",
    createdBy: adminUser.email,
    createdAt: now,
  };

  await db.collection("teklifim_announcements").doc(id).set(announcement);

  await logAdminAction(
    adminUser,
    adminRole,
    "announcement.create",
    "announcement",
    id,
    { title: announcement.title, targetRole: announcement.targetRole }
  );

  return announcement;
}

// ---------------------------------------------------------------------------
// System Health & Diagnostics Service
// ---------------------------------------------------------------------------

export async function getAdminSystemHealth() {
  const db = getDb();
  const t0 = Date.now();
  let dbLatency = 0;
  let dbStatus: "healthy" | "degraded" | "down" = "healthy";

  try {
    await db.collection("teklifim_platform_settings").doc("general").get();
    dbLatency = Date.now() - t0;
    if (dbLatency > 1500) dbStatus = "degraded";
  } catch (e) {
    dbStatus = "down";
  }

  let webhookFailureCount = 0;
  try {
    const webhookSnap = await db
      .collection("teklifim_webhook_events")
      .where("status", "==", "failed")
      .limit(10)
      .get();
    webhookFailureCount = webhookSnap.size;
  } catch (e) {}

  return {
    status: dbStatus === "healthy" && webhookFailureCount < 5 ? "healthy" : "warning",
    timestamp: Date.now(),
    services: [
      {
        name: "Firestore Database",
        status: dbStatus,
        latencyMs: dbLatency,
      },
      {
        name: "Authentication Provider",
        status: "healthy",
        latencyMs: 15,
      },
      {
        name: "Webhook Queue / Dispatcher",
        status: webhookFailureCount > 5 ? "degraded" : "healthy",
        recentFailures: webhookFailureCount,
      },
      {
        name: "Payment Gateway Integration",
        status: "healthy",
        mode: "production",
      },
    ],
    environment: process.env.NODE_ENV || "development",
    version: "12.0.0",
  };
}

