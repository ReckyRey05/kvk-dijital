import { getAdminDb } from "@/lib/firebase/admin";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/security/rateLimit";
import {
  TeklifimIntegrationChannel,
  TeklifimIntegrationEventType,
  TeklifimNotificationPreference,
  TeklifimConsentRecord,
  TeklifimApiKey,
  TeklifimWebhookEndpoint,
  TeklifimWebhookDelivery,
  TeklifimIntegrationEvent,
  TeklifimShippingStatus,
  TeklifimShippingTracking,
  TeklifimInvoiceDraft,
  TeklifimCalendarEvent,
  TeklifimOrder,
} from "@/types/teklifimGelsin";
import {
  renderEmailTemplate,
  formatSmsMessage,
  buildWhatsAppPayload,
  resolveDeepLink,
  generateWebhookSignature,
  calculateWebhookNextRetry,
  generateApiKey,
  hashApiKey,
  verifyApiKeyScope,
  normalizeCarrierStatus,
  generateIcsFile,
  generateCsvExport,
} from "./integrationUtils";

function getDb() {
  return getAdminDb();
}

// ---------------------------------------------------------------------------
// Provider Interfaces
// ---------------------------------------------------------------------------

export interface NotificationProviderResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface EmailProvider {
  sendEmail(to: string, subject: string, html: string, text: string): Promise<NotificationProviderResult>;
}

export interface SmsProvider {
  sendSms(to: string, message: string): Promise<NotificationProviderResult>;
}

export interface WhatsAppProvider {
  sendWhatsApp(to: string, payload: Record<string, any>): Promise<NotificationProviderResult>;
}

export interface PushProvider {
  sendPush(userId: string, title: string, body: string, data?: Record<string, string>): Promise<NotificationProviderResult>;
}

export interface ShippingProvider {
  getTracking(carrier: string, trackingNumber: string): Promise<TeklifimShippingTracking>;
}

export interface InvoiceProvider {
  createDraft(draft: TeklifimInvoiceDraft): Promise<{ success: boolean; gibInvoiceNumber?: string; error?: string }>;
}

// ---------------------------------------------------------------------------
// Sandbox / Mock Implementations
// ---------------------------------------------------------------------------

export class SandboxEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<NotificationProviderResult> {
    const messageId = `email_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await logIntegrationAction({
      provider: "mock_email",
      channel: "email",
      eventType: "email.sent",
      status: "success",
      details: { to, subject, messageId, length: text.length },
    });
    return { success: true, messageId };
  }
}

export class SandboxSmsProvider implements SmsProvider {
  async sendSms(to: string, message: string): Promise<NotificationProviderResult> {
    const messageId = `sms_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await logIntegrationAction({
      provider: "mock_sms",
      channel: "sms",
      eventType: "sms.sent",
      status: "success",
      details: { to, messageId, length: message.length },
    });
    return { success: true, messageId };
  }
}

export class SandboxWhatsAppProvider implements WhatsAppProvider {
  async sendWhatsApp(to: string, payload: Record<string, any>): Promise<NotificationProviderResult> {
    const messageId = `wa_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await logIntegrationAction({
      provider: "mock_whatsapp",
      channel: "whatsapp",
      eventType: "whatsapp.sent",
      status: "success",
      details: { to, messageId, template: payload.template },
    });
    return { success: true, messageId };
  }
}

export class SandboxPushProvider implements PushProvider {
  async sendPush(userId: string, title: string, body: string, data?: Record<string, string>): Promise<NotificationProviderResult> {
    const messageId = `push_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await logIntegrationAction({
      provider: "mock_push",
      channel: "push",
      eventType: "push.sent",
      status: "success",
      details: { userId, title, messageId, data },
    });
    return { success: true, messageId };
  }
}

export class SandboxShippingProvider implements ShippingProvider {
  async getTracking(carrier: string, trackingNumber: string): Promise<TeklifimShippingTracking> {
    const normalizedStatus = normalizeCarrierStatus("Teslim Edildi");
    return {
      trackingNumber,
      carrier,
      status: normalizedStatus,
      trackingUrl: `https://kargo-takip.local/${carrier.toLowerCase()}/${trackingNumber}`,
      shipmentDate: Date.now() - 86400000,
      estimatedDelivery: Date.now(),
      events: [
        {
          date: Date.now() - 86400000,
          location: "Istanbul Transfer Merkezi",
          description: "Kargo kabul edildi",
          status: "shipped",
        },
        {
          date: Date.now() - 43200000,
          location: "Ankara Dagitim Merkezi",
          description: "Dagitima cikarildi",
          status: "out_for_delivery",
        },
        {
          date: Date.now(),
          location: "Teslim Adresi",
          description: "Aliciya teslim edildi",
          status: "delivered",
        },
      ],
    };
  }
}

export class SandboxInvoiceProvider implements InvoiceProvider {
  async createDraft(draft: TeklifimInvoiceDraft): Promise<{ success: boolean; gibInvoiceNumber?: string; error?: string }> {
    const gibNumber = `GIB${new Date().getFullYear()}${Math.floor(100000000 + Math.random() * 900000000)}`;
    await logIntegrationAction({
      provider: "mock_einvoice",
      channel: "invoice",
      eventType: "invoice.drafted",
      status: "success",
      details: { orderId: draft.orderId, gibNumber, grandTotal: draft.grandTotal },
    });
    return { success: true, gibInvoiceNumber: gibNumber };
  }
}

// Global active providers (singleton references)
export const activeProviders = {
  email: new SandboxEmailProvider(),
  sms: new SandboxSmsProvider(),
  whatsapp: new SandboxWhatsAppProvider(),
  push: new SandboxPushProvider(),
  shipping: new SandboxShippingProvider(),
  invoice: new SandboxInvoiceProvider(),
};

// ---------------------------------------------------------------------------
// Integration Logs
// ---------------------------------------------------------------------------

export async function logIntegrationAction(data: {
  provider: string;
  channel: string;
  eventType: string;
  status: "success" | "failure" | "queued";
  details?: Record<string, any>;
  error?: string;
}) {
  try {
    const db = getDb();
    const logId = `log_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    // Sanitize any secret keys or sensitive tokens before saving
    const sanitizedDetails = data.details ? sanitizePayload(data.details) : undefined;
    await db.collection("teklifim_integration_logs").doc(logId).set({
      id: logId,
      provider: data.provider,
      channel: data.channel,
      eventType: data.eventType,
      status: data.status,
      details: sanitizedDetails || null,
      error: data.error || null,
      createdAt: Date.now(),
    });
  } catch (err) {
    // Non-blocking log error
    console.error("Failed to write integration log:", err);
  }
}

export async function getIntegrationLogs(limitCount = 50): Promise<any[]> {
  const db = getDb();
  const snapshot = await db
    .collection("teklifim_integration_logs")
    .orderBy("createdAt", "desc")
    .limit(limitCount)
    .get();

  return snapshot.docs.map(doc => doc.data());
}

/**
 * Strips secret tokens, API keys, and authorization headers from logs.
 */
export function sanitizePayload(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);

  const sensitiveKeys = ["secret", "secretkey", "apikey", "authorization", "token", "password", "signature"];
  const sanitized: Record<string, any> = {};

  for (const [key, val] of Object.entries(obj)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizePayload(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

// ---------------------------------------------------------------------------
// Notification Preferences & Consent Management
// ---------------------------------------------------------------------------

export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<TeklifimNotificationPreference, "userId" | "updatedAt"> = {
  channels: {
    push: true,
    email: true,
    sms: true,
    whatsapp: true,
  },
  categories: {
    offers: true,
    messages: true,
    orders: true,
    payments: true,
    delivery: true,
    marketing: false,
  },
};

export async function getNotificationPreferences(userId: string): Promise<TeklifimNotificationPreference> {
  const db = getDb();
  const doc = await db.collection("teklifim_notification_preferences").doc(userId).get();
  if (doc.exists) {
    const data = doc.data() as TeklifimNotificationPreference;
    return {
      userId,
      channels: { ...DEFAULT_NOTIFICATION_PREFERENCES.channels, ...data.channels },
      categories: { ...DEFAULT_NOTIFICATION_PREFERENCES.categories, ...data.categories },
      updatedAt: data.updatedAt || Date.now(),
    };
  }

  return {
    userId,
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    updatedAt: Date.now(),
  };
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<TeklifimNotificationPreference>
): Promise<TeklifimNotificationPreference> {
  const db = getDb();
  const existing = await getNotificationPreferences(userId);

  const updated: TeklifimNotificationPreference = {
    userId,
    channels: { ...existing.channels, ...(prefs.channels || {}) },
    // Transactional categories cannot be forcibly shut down if business critical
    categories: { ...existing.categories, ...(prefs.categories || {}) },
    updatedAt: Date.now(),
  };

  await db.collection("teklifim_notification_preferences").doc(userId).set(updated, { merge: true });
  return updated;
}

export async function recordConsent(
  userId: string,
  channel: "sms" | "email" | "whatsapp",
  type: "marketing" | "transactional",
  granted: boolean,
  source: string,
  ipAddress?: string
): Promise<TeklifimConsentRecord> {
  const db = getDb();
  const consentId = `consent_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const now = Date.now();

  const record: TeklifimConsentRecord = {
    id: consentId,
    userId,
    channel,
    type,
    granted,
    grantedAt: granted ? now : 0,
    revokedAt: granted ? undefined : now,
    source,
    version: "v1.1",
    ipAddress: ipAddress || "127.0.0.1",
  };

  await db.collection("teklifim_consents").doc(consentId).set(record);
  return record;
}

export async function getConsents(userId: string): Promise<TeklifimConsentRecord[]> {
  const db = getDb();
  const snapshot = await db
    .collection("teklifim_consents")
    .where("userId", "==", userId)
    .orderBy("grantedAt", "desc")
    .get();

  return snapshot.docs.map(doc => doc.data() as TeklifimConsentRecord);
}

export async function hasMarketingConsent(
  userId: string,
  channel: "sms" | "email" | "whatsapp"
): Promise<boolean> {
  const db = getDb();
  const snapshot = await db
    .collection("teklifim_consents")
    .where("userId", "==", userId)
    .where("channel", "==", channel)
    .where("type", "==", "marketing")
    .get();

  if (snapshot.empty) return false;

  // Find latest consent entry
  const docs = snapshot.docs.map(d => d.data() as TeklifimConsentRecord);
  docs.sort((a, b) => {
    const timeA = a.revokedAt || a.grantedAt || 0;
    const timeB = b.revokedAt || b.grantedAt || 0;
    return timeB - timeA;
  });

  return docs[0]?.granted === true;
}

// ---------------------------------------------------------------------------
// API Key Management
// ---------------------------------------------------------------------------

export async function createApiKey(
  userId: string,
  name: string,
  scopes: string[]
): Promise<{ apiKey: TeklifimApiKey; rawKey: string }> {
  const db = getDb();
  const { rawKey, keyPrefix, keyHash } = generateApiKey(true);
  const keyId = `key_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const apiKey: TeklifimApiKey = {
    id: keyId,
    userId,
    name: name.trim() || "Varsayilan API Anahtari",
    keyPrefix,
    keyHash,
    scopes: scopes.length > 0 ? scopes : ["products:read", "requests:read"],
    status: "active",
    createdAt: Date.now(),
  };

  await db.collection("teklifim_api_keys").doc(keyId).set(apiKey);

  return { apiKey, rawKey };
}

export async function listApiKeys(userId: string): Promise<TeklifimApiKey[]> {
  const db = getDb();
  const snapshot = await db
    .collection("teklifim_api_keys")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(doc => doc.data() as TeklifimApiKey);
}

export async function revokeApiKey(
  userId: string,
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const docRef = db.collection("teklifim_api_keys").doc(keyId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return { success: false, error: "API anahtari bulunamadi." };
  }

  const data = doc.data() as TeklifimApiKey;
  if (data.userId !== userId) {
    return { success: false, error: "Bu API anahtarini yonetme yetkiniz yok." };
  }

  await docRef.update({
    status: "revoked",
    revokedAt: Date.now(),
  });

  return { success: true };
}

export async function validateApiKeyRequest(
  req: Request,
  requiredScope?: string
): Promise<{
  authorized: boolean;
  userId?: string;
  key?: TeklifimApiKey;
  error?: string;
  status: number;
}> {
  // Extract key from Authorization: Bearer <key> or X-API-Key: <key>
  const authHeader = req.headers.get("authorization");
  const xApiKey = req.headers.get("x-api-key");
  let rawKey = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    rawKey = authHeader.substring(7).trim();
  } else if (xApiKey) {
    rawKey = xApiKey.trim();
  }

  if (!rawKey || !rawKey.startsWith("tc_live_")) {
    return {
      authorized: false,
      error: "Gecersiz veya eksik API anahtari. 'tc_live_...' formati gereklidir.",
      status: 401,
    };
  }

  const hashed = hashApiKey(rawKey);
  const db = getDb();
  const snapshot = await db
    .collection("teklifim_api_keys")
    .where("keyHash", "==", hashed)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return {
      authorized: false,
      error: "API anahtari gecersiz veya bulunamadi.",
      status: 401,
    };
  }

  const keyDoc = snapshot.docs[0];
  const apiKey = keyDoc.data() as TeklifimApiKey;

  if (apiKey.status !== "active") {
    return {
      authorized: false,
      error: "Bu API anahtari iptal edilmis veya pasif durumdadir.",
      status: 401,
    };
  }

  // Rate Limiting: 120 requests per minute per API key
  const rateResult = checkRateLimit(`apikey:${apiKey.id}`, {
    max: 120,
    windowMs: 60 * 1000,
  });

  if (!rateResult.allowed) {
    return {
      authorized: false,
      error: `API cagri limiti asildi. Lutfen ${rateResult.retryAfterSec} saniye sonra tekrar deneyin.`,
      status: 429,
    };
  }

  // Check scope if required
  if (requiredScope && !verifyApiKeyScope(apiKey.scopes, requiredScope)) {
    return {
      authorized: false,
      error: `Bu islem icin yetersiz yetki. Gerekli yetki alani: ${requiredScope}`,
      status: 403,
    };
  }

  // Async update lastUsedAt (non-blocking)
  keyDoc.ref.update({ lastUsedAt: Date.now() }).catch(() => {});

  return {
    authorized: true,
    userId: apiKey.userId,
    key: apiKey,
    status: 200,
  };
}

// ---------------------------------------------------------------------------
// Webhook Management & Delivery Engine
// ---------------------------------------------------------------------------

export async function registerWebhookEndpoint(
  userId: string,
  url: string,
  events: TeklifimIntegrationEventType[]
): Promise<{ success: boolean; endpoint?: TeklifimWebhookEndpoint; error?: string }> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { success: false, error: "Webhook URL http veya https protokolune sahip olmalidir." };
    }
  } catch {
    return { success: false, error: "Gecersiz URL formati." };
  }

  if (!events || events.length === 0) {
    return { success: false, error: "En az bir olay aboneligi secilmelidir." };
  }

  const db = getDb();
  const endpointId = `wh_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
  const now = Date.now();

  const endpoint: TeklifimWebhookEndpoint = {
    id: endpointId,
    userId,
    url,
    secret,
    events,
    status: "active",
    failureCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("teklifim_webhook_endpoints").doc(endpointId).set(endpoint);

  return { success: true, endpoint };
}

export async function listWebhookEndpoints(userId: string): Promise<TeklifimWebhookEndpoint[]> {
  const db = getDb();
  const snapshot = await db
    .collection("teklifim_webhook_endpoints")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(doc => doc.data() as TeklifimWebhookEndpoint);
}

export async function deleteWebhookEndpoint(
  userId: string,
  endpointId: string
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const docRef = db.collection("teklifim_webhook_endpoints").doc(endpointId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return { success: false, error: "Webhook endpoint bulunamadi." };
  }

  const data = doc.data() as TeklifimWebhookEndpoint;
  if (data.userId !== userId) {
    return { success: false, error: "Bu webhook'u silme yetkiniz yok." };
  }

  await docRef.delete();
  return { success: true };
}

export async function executeWebhookDelivery(
  endpoint: TeklifimWebhookEndpoint,
  event: TeklifimIntegrationEvent
): Promise<TeklifimWebhookDelivery> {
  const db = getDb();
  const deliveryId = `deliv_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  // Idempotency check: check if event already delivered to this endpoint
  const existingDeliveryQuery = await db
    .collection("teklifim_webhook_deliveries")
    .where("endpointId", "==", endpoint.id)
    .where("eventId", "==", event.id)
    .limit(1)
    .get();

  if (!existingDeliveryQuery.empty) {
    return existingDeliveryQuery.docs[0].data() as TeklifimWebhookDelivery;
  }

  const timestamp = Date.now();
  const payloadObject = {
    id: event.id,
    event: event.type,
    createdAt: event.createdAt,
    data: event.payload,
  };
  const payloadString = JSON.stringify(payloadObject);
  const signature = generateWebhookSignature(payloadString, endpoint.secret);

  const delivery: TeklifimWebhookDelivery = {
    id: deliveryId,
    endpointId: endpoint.id,
    userId: endpoint.userId,
    eventType: event.type,
    eventId: event.id,
    url: endpoint.url,
    payload: payloadObject,
    signature,
    status: "pending",
    attempts: 1,
    createdAt: timestamp,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-TC-Signature": `sha256=${signature}`,
        "X-TC-Timestamp": timestamp.toString(),
        "X-TC-Event": event.type,
        "X-TC-Delivery": deliveryId,
        "User-Agent": "TeklifimGelsin-Webhook/1.0 (KvK Dijital Cozumler)",
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    delivery.statusCode = response.status;

    if (response.ok) {
      delivery.status = "delivered";
      delivery.completedAt = Date.now();
      await db.collection("teklifim_webhook_endpoints").doc(endpoint.id).update({
        failureCount: 0,
        status: "active",
      });
    } else {
      const respText = await response.text().catch(() => "");
      delivery.responseBody = respText.substring(0, 500);
      handleWebhookFailure(delivery, endpoint);
    }
  } catch (err: any) {
    delivery.errorMessage = err.message || "Network request failed or timed out";
    handleWebhookFailure(delivery, endpoint);
  }

  await db.collection("teklifim_webhook_deliveries").doc(deliveryId).set(delivery);
  return delivery;
}

function handleWebhookFailure(delivery: TeklifimWebhookDelivery, endpoint: TeklifimWebhookEndpoint) {
  const nextDelay = calculateWebhookNextRetry(delivery.attempts);
  if (nextDelay !== null) {
    delivery.status = "retrying";
    delivery.nextRetryAt = Date.now() + nextDelay;
  } else {
    delivery.status = "failed";
    delivery.completedAt = Date.now();
  }

  // Increment failure count on endpoint
  const newFailureCount = (endpoint.failureCount || 0) + 1;
  const db = getDb();
  db.collection("teklifim_webhook_endpoints").doc(endpoint.id).update({
    failureCount: newFailureCount,
    status: newFailureCount >= 10 ? "failing" : endpoint.status,
    updatedAt: Date.now(),
  }).catch(() => {});
}

export async function retryPendingWebhooks(): Promise<{ processedCount: number; succeededCount: number; failedCount: number }> {
  const db = getDb();
  const now = Date.now();
  const snapshot = await db
    .collection("teklifim_webhook_deliveries")
    .where("status", "==", "retrying")
    .where("nextRetryAt", "<=", now)
    .limit(25)
    .get();

  let processedCount = 0;
  let succeededCount = 0;
  let failedCount = 0;

  for (const doc of snapshot.docs) {
    processedCount++;
    const delivery = doc.data() as TeklifimWebhookDelivery;
    const endpointDoc = await db.collection("teklifim_webhook_endpoints").doc(delivery.endpointId).get();

    if (!endpointDoc.exists) {
      await doc.ref.update({ status: "failed", errorMessage: "Endpoint deleted" });
      failedCount++;
      continue;
    }

    const endpoint = endpointDoc.data() as TeklifimWebhookEndpoint;
    delivery.attempts += 1;

    try {
      const payloadString = JSON.stringify(delivery.payload);
      const signature = generateWebhookSignature(payloadString, endpoint.secret);
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-TC-Signature": `sha256=${signature}`,
          "X-TC-Timestamp": Date.now().toString(),
          "X-TC-Event": delivery.eventType,
          "X-TC-Delivery": delivery.id,
          "User-Agent": "TeklifimGelsin-Webhook/1.0 (KvK Dijital Cozumler)",
        },
        body: payloadString,
      });

      delivery.statusCode = response.status;
      if (response.ok) {
        delivery.status = "delivered";
        delivery.completedAt = Date.now();
        succeededCount++;
      } else {
        handleWebhookFailure(delivery, endpoint);
        failedCount++;
      }
    } catch (err: any) {
      delivery.errorMessage = err.message || "Retry failed";
      handleWebhookFailure(delivery, endpoint);
      failedCount++;
    }

    await doc.ref.set(delivery, { merge: true });
  }

  return { processedCount, succeededCount, failedCount };
}

// ---------------------------------------------------------------------------
// Centralized Event Bus & Outbox
// ---------------------------------------------------------------------------

export async function dispatchPlatformEvent(
  eventData: Omit<TeklifimIntegrationEvent, "id" | "createdAt" | "status" | "channelsDispatched">
): Promise<TeklifimIntegrationEvent> {
  const db = getDb();
  const eventId = `ev_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const now = Date.now();

  const event: TeklifimIntegrationEvent = {
    id: eventId,
    type: eventData.type,
    entityId: eventData.entityId,
    entityType: eventData.entityType,
    actorId: eventData.actorId,
    recipientId: eventData.recipientId,
    payload: eventData.payload || {},
    status: "pending",
    channelsDispatched: [],
    createdAt: now,
  };

  // 1. Write outbox event to Firestore
  await db.collection("teklifim_integration_events").doc(eventId).set(event);

  const channelsDispatched: string[] = [];

  try {
    // 2. Resolve Recipient Preferences & Consents
    const recipientId = event.recipientId;
    let preferences: TeklifimNotificationPreference | null = null;

    if (recipientId) {
      preferences = await getNotificationPreferences(recipientId);
    }

    const payload = event.payload;
    const isMarketing = event.type === "stock.alert" || payload.isMarketing === true;

    // Categorize event
    let category: keyof TeklifimNotificationPreference["categories"] = "orders";
    if (event.type.startsWith("offer.")) category = "offers";
    else if (event.type.startsWith("message.")) category = "messages";
    else if (event.type.startsWith("payment.") || event.type.startsWith("refund.")) category = "payments";
    else if (event.type.startsWith("order.shipped") || event.type.startsWith("order.delivered")) category = "delivery";
    else if (isMarketing) category = "marketing";

    // 3. Dispatch Push Notification
    if (recipientId && (!preferences || (preferences.channels.push && preferences.categories[category] !== false))) {
      const title = payload.title || `Toptancim Cebimde: ${event.type}`;
      const body = payload.body || `Yeni bir olay gerceklesti: ${event.entityId}`;
      const deepLink = resolveDeepLink(event.entityType, event.entityId);
      await activeProviders.push.sendPush(recipientId, title, body, { deepLink, eventType: event.type });
      channelsDispatched.push("push");
    }

    // 4. Dispatch Email
    if (recipientId && payload.recipientEmail) {
      if (!preferences || (preferences.channels.email && preferences.categories[category] !== false)) {
        if (!isMarketing || (await hasMarketingConsent(recipientId, "email"))) {
          const template = renderEmailTemplate(event.type, payload);
          await activeProviders.email.sendEmail(payload.recipientEmail, template.subject, template.html, template.text);
          channelsDispatched.push("email");
        }
      }
    }

    // 5. Dispatch SMS
    if (recipientId && payload.recipientPhone) {
      if (!preferences || (preferences.channels.sms && preferences.categories[category] !== false)) {
        if (!isMarketing || (await hasMarketingConsent(recipientId, "sms"))) {
          const smsText = formatSmsMessage(event.type, payload);
          await activeProviders.sms.sendSms(payload.recipientPhone, smsText);
          channelsDispatched.push("sms");
        }
      }
    }

    // 6. Dispatch WhatsApp
    if (recipientId && payload.recipientPhone) {
      if (!preferences || (preferences.channels.whatsapp && preferences.categories[category] !== false)) {
        if (!isMarketing || (await hasMarketingConsent(recipientId, "whatsapp"))) {
          const waPayload = buildWhatsAppPayload(event.type, payload, isMarketing);
          await activeProviders.whatsapp.sendWhatsApp(payload.recipientPhone, waPayload);
          channelsDispatched.push("whatsapp");
        }
      }
    }

    // 7. Dispatch Webhooks
    const targetUserId = recipientId || event.actorId;
    if (targetUserId) {
      const endpointsSnapshot = await db
        .collection("teklifim_webhook_endpoints")
        .where("userId", "==", targetUserId)
        .where("status", "in", ["active", "failing"])
        .get();

      for (const epDoc of endpointsSnapshot.docs) {
        const ep = epDoc.data() as TeklifimWebhookEndpoint;
        if (ep.events.includes(event.type) || ep.events.includes("request.created" as any)) {
          executeWebhookDelivery(ep, event).catch(err => {
            console.error("Webhook dispatch error:", err);
          });
          channelsDispatched.push(`webhook:${ep.id}`);
        }
      }
    }

    // 8. Mark event processed
    event.status = "processed";
    event.channelsDispatched = channelsDispatched;
    event.processedAt = Date.now();
    await db.collection("teklifim_integration_events").doc(eventId).update({
      status: "processed",
      channelsDispatched,
      processedAt: event.processedAt,
    });
  } catch (err: any) {
    event.status = "failed";
    await db.collection("teklifim_integration_events").doc(eventId).update({
      status: "failed",
      error: err.message,
    });
  }

  return event;
}

// ---------------------------------------------------------------------------
// Shipping & Invoice Sync
// ---------------------------------------------------------------------------

export async function syncOrderShippingStatus(
  orderId: string,
  trackingNumber: string,
  carrier: string
): Promise<{ success: boolean; tracking?: TeklifimShippingTracking; error?: string }> {
  const db = getDb();
  const orderRef = db.collection("teklifim_orders").doc(orderId);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    return { success: false, error: "Siparis bulunamadi." };
  }

  const tracking = await activeProviders.shipping.getTracking(carrier, trackingNumber);

  await orderRef.update({
    shippingTracking: tracking,
    shippingStatus: tracking.status,
    updatedAt: Date.now(),
  });

  // Trigger integration event if delivered
  const orderData = orderDoc.data() as TeklifimOrder;
  if (tracking.status === "delivered") {
    await dispatchPlatformEvent({
      type: "order.delivered",
      entityId: orderId,
      entityType: "order",
      recipientId: orderData.businessId,
      actorId: orderData.supplierId,
      payload: {
        orderId,
        trackingNumber,
        carrier,
        recipientEmail: orderData.businessEmail,
        recipientPhone: orderData.businessPhone,
        title: "Siparisiniz Teslim Edildi",
        body: `${carrier} kargo ile gonderilen ${orderId} numarali siparisiniz teslim edilmistir.`,
      },
    });
  }

  return { success: true, tracking };
}

export async function createEInvoiceDraft(
  orderId: string,
  supplierId: string
): Promise<{ success: boolean; draft?: TeklifimInvoiceDraft; error?: string }> {
  const db = getDb();
  const orderRef = db.collection("teklifim_orders").doc(orderId);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    return { success: false, error: "Siparis bulunamadi." };
  }

  const order = orderDoc.data() as TeklifimOrder;
  if (order.supplierId !== supplierId) {
    return { success: false, error: "Bu siparis icin fatura duzenleme yetkiniz yok." };
  }

  const items = (order.items || []).map(item => {
    const unitPrice = item.unitPrice || (item as any).price || 0;
    const quantity = item.quantity || 1;
    const vatRate = 20; // 20% Standard B2B VAT rate
    const total = unitPrice * quantity;
    return {
      name: item.productName || (item as any).name || (item as any).title || "Urun",
      quantity,
      unitPrice,
      vatRate,
      total,
    };
  });

  const totalVat = items.reduce((acc, it) => acc + (it.total * it.vatRate) / 100, 0);
  const grandTotal = items.reduce((acc, it) => acc + it.total, 0) + totalVat;

  const draft: TeklifimInvoiceDraft = {
    invoiceId: `inv_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    orderId,
    type: "e-fatura",
    taxNumberOrTckn: (order as any).businessTaxNumber || "1111111111",
    title: order.businessName || "Alici Kurum",
    items,
    totalVat: Math.round(totalVat * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    currency: "TRY",
    status: "draft",
  };

  const invoiceResult = await activeProviders.invoice.createDraft(draft);
  if (invoiceResult.success && invoiceResult.gibInvoiceNumber) {
    draft.gibInvoiceNumber = invoiceResult.gibInvoiceNumber;
    draft.status = "issued";
  }

  await db.collection("teklifim_invoices").doc(draft.invoiceId!).set(draft);
  await orderRef.update({ invoiceId: draft.invoiceId, invoiceStatus: draft.status });

  return { success: true, draft };
}
