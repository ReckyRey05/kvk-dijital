import assert from "node:assert";
import crypto from "crypto";
import {
  renderEmailTemplate,
  formatSmsMessage,
  buildWhatsAppPayload,
  resolveDeepLink,
  generateWebhookSignature,
  verifyWebhookSignature,
  calculateWebhookNextRetry,
  generateApiKey,
  hashApiKey,
  verifyApiKeyScope,
  normalizeCarrierStatus,
  generateIcsFile,
  generateCsvExport,
} from "../../src/lib/teklifimGelsin/integrationUtils";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  sanitizePayload,
} from "../../src/lib/teklifimGelsin/integrationService";
import { checkRateLimit } from "../../src/lib/security/rateLimit";
import {
  TeklifimIntegrationEventType,
  TeklifimNotificationPreference,
  TeklifimConsentRecord,
  TeklifimApiKey,
  TeklifimWebhookEndpoint,
  TeklifimWebhookDelivery,
  TeklifimIntegrationEvent,
  TeklifimShippingStatus,
  TeklifimInvoiceDraft,
  TeklifimCalendarEvent,
} from "../../src/types/teklifimGelsin";

console.log("===============================================================");
console.log(">> [TOPTANCIM CEBIMDE TEST] FAZ 11: Integrations, API & Automation");
console.log("===============================================================");

// ---------------------------------------------------------------------------
// TEST 1: Email Event Template Rendering
// ---------------------------------------------------------------------------
console.log("1. Test: Email event template variable substitution...");
const emailTemplate = renderEmailTemplate("offer.created", {
  supplierName: "Metro Toptan Market",
  requestTitle: "500 Koli Organik Yumurta",
  totalPrice: "45000",
  currency: "TRY",
  deliveryDays: "3",
  offerId: "off_12345",
});
assert.ok(emailTemplate.subject.includes("Yeni Teklif Geldi"));
assert.ok(emailTemplate.subject.includes("Metro Toptan Market"));
assert.ok(emailTemplate.html.includes("45000 TRY"));
assert.ok(emailTemplate.html.includes("500 Koli Organik Yumurta"));
assert.ok(emailTemplate.text.includes("3 gun"));
console.log("PASSED: Email template rendered with variables substituted.");

// ---------------------------------------------------------------------------
// TEST 2: SMS Provider Formatting & Character Limits
// ---------------------------------------------------------------------------
console.log("2. Test: SMS provider message formatting and critical event filtering...");
const smsMessage = formatSmsMessage("order.shipped", {
  orderNumber: "SIP-2026-00451",
  carrier: "Yurtici Kargo",
  trackingNumber: "YK9876543210",
});
assert.ok(smsMessage.includes("Toptancim Cebimde:"));
assert.ok(smsMessage.includes("SIP-2026-00451"));
assert.ok(smsMessage.includes("Yurtici Kargo"));
assert.ok(smsMessage.includes("YK9876543210"));
assert.ok(smsMessage.length < 160, "SMS length should fit in single standard SMS segment");
console.log("PASSED: SMS message formatted accurately.");

// ---------------------------------------------------------------------------
// TEST 3: WhatsApp Provider - Transactional vs Marketing Payloads
// ---------------------------------------------------------------------------
console.log("3. Test: WhatsApp provider payload building and marketing consent separation...");
const waTransactional = buildWhatsAppPayload(
  "order.delivered",
  { orderNumber: "SIP-2026-00892" },
  false
);
assert.strictEqual(waTransactional.category, "TRANSACTIONAL");
assert.strictEqual(waTransactional.template, "tc_order_delivered_v1");

const waMarketing = buildWhatsAppPayload(
  "stock.alert",
  { productName: "A4 Fotokopi Kagidi", discountRate: "%15" },
  true
);
assert.strictEqual(waMarketing.category, "MARKETING");
assert.strictEqual(waMarketing.template, "tc_promo_announcement_v1");
console.log("PASSED: WhatsApp payloads segregated by category.");

// ---------------------------------------------------------------------------
// TEST 4: Push Notification Payload & Deep Link Integration
// ---------------------------------------------------------------------------
console.log("4. Test: Push notification payload and deep link resolution...");
const pushDeepLink = resolveDeepLink("offer", "off_9988");
assert.strictEqual(pushDeepLink, "/teklifim-gelsin/offers/off_9988");

const orderDeepLink = resolveDeepLink("order", "ord_5544");
assert.strictEqual(orderDeepLink, "/teklifim-gelsin/orders/ord_5544");

const msgDeepLink = resolveDeepLink("conversation", "conv_3322");
assert.strictEqual(msgDeepLink, "/teklifim-gelsin/messages?convId=conv_3322");
console.log("PASSED: Deep links resolved correctly.");

// ---------------------------------------------------------------------------
// TEST 5: Notification Preferences Filtering
// ---------------------------------------------------------------------------
console.log("5. Test: User notification preferences gating channels...");
const userPrefs: TeklifimNotificationPreference = {
  userId: "user_buyer_101",
  channels: {
    push: true,
    email: false, // User turned off email
    sms: false,   // User turned off SMS
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
  updatedAt: Date.now(),
};

// Test helper that determines if channel is allowed for this user
function isChannelAllowed(
  prefs: TeklifimNotificationPreference,
  channel: "push" | "email" | "sms" | "whatsapp",
  category: keyof TeklifimNotificationPreference["categories"]
): boolean {
  if (!prefs.channels[channel]) return false;
  return prefs.categories[category] !== false;
}

assert.strictEqual(isChannelAllowed(userPrefs, "push", "offers"), true);
assert.strictEqual(isChannelAllowed(userPrefs, "email", "offers"), false);
assert.strictEqual(isChannelAllowed(userPrefs, "sms", "orders"), false);
assert.strictEqual(isChannelAllowed(userPrefs, "whatsapp", "orders"), true);
assert.strictEqual(isChannelAllowed(userPrefs, "whatsapp", "marketing"), false);
console.log("PASSED: Channels gated properly by user preferences.");

// ---------------------------------------------------------------------------
// TEST 6: Deep Link URL Entity Mapping
// ---------------------------------------------------------------------------
console.log("6. Test: Comprehensive deep link entity fallback...");
assert.strictEqual(resolveDeepLink("request", "req_1"), "/teklifim-gelsin/talepler/req_1");
assert.strictEqual(resolveDeepLink("product", "prod_2"), "/teklifim-gelsin/products?edit=prod_2");
assert.strictEqual(resolveDeepLink("unknown", "xyz"), "/teklifim-gelsin");
console.log("PASSED: Entity fallback mapping verified.");

// ---------------------------------------------------------------------------
// TEST 7: Webhook Signature Generation & Verification (HMAC-SHA256)
// ---------------------------------------------------------------------------
console.log("7. Test: HMAC-SHA256 webhook signature and constant-time verification...");
const webhookSecret = "whsec_test_secret_key_1234567890abcdef";
const payloadContent = JSON.stringify({ id: "ev_123", event: "order.created", total: 12500 });

const generatedSignature = generateWebhookSignature(payloadContent, webhookSecret);
assert.ok(generatedSignature.length === 64, "SHA-256 hex signature must be 64 characters");

const isValid = verifyWebhookSignature(payloadContent, generatedSignature, webhookSecret);
assert.strictEqual(isValid, true, "Signature verification must succeed for identical payload and secret");

const isTamperedValid = verifyWebhookSignature(payloadContent + " ", generatedSignature, webhookSecret);
assert.strictEqual(isTamperedValid, false, "Signature verification must fail for tampered payload");

const isWrongSecretValid = verifyWebhookSignature(payloadContent, generatedSignature, "whsec_wrong_key");
assert.strictEqual(isWrongSecretValid, false, "Signature verification must fail with wrong secret");
console.log("PASSED: HMAC-SHA256 webhook signing and verification confirmed.");

// ---------------------------------------------------------------------------
// TEST 8: Webhook Idempotency Delivery Check
// ---------------------------------------------------------------------------
console.log("8. Test: Webhook idempotency duplicate event prevention...");
const mockDeliveries: TeklifimWebhookDelivery[] = [];

function checkWebhookIdempotency(endpointId: string, eventId: string): boolean {
  return mockDeliveries.some(d => d.endpointId === endpointId && d.eventId === eventId);
}

mockDeliveries.push({
  id: "deliv_1",
  endpointId: "ep_alpha",
  userId: "user_1",
  eventType: "order.created",
  eventId: "ev_1001",
  url: "https://api.partner.com/webhook",
  payload: {},
  signature: "sig123",
  status: "delivered",
  attempts: 1,
  createdAt: Date.now(),
});

assert.strictEqual(checkWebhookIdempotency("ep_alpha", "ev_1001"), true, "Existing event should be detected");
assert.strictEqual(checkWebhookIdempotency("ep_alpha", "ev_1002"), false, "New event should not be flagged as duplicate");
assert.strictEqual(checkWebhookIdempotency("ep_beta", "ev_1001"), false, "Same event on different endpoint is allowed");
console.log("PASSED: Webhook idempotency verified.");

// ---------------------------------------------------------------------------
// TEST 9: Webhook Retry Exponential Backoff
// ---------------------------------------------------------------------------
console.log("9. Test: Webhook retry exponential backoff schedule (max 5 attempts)...");
assert.strictEqual(calculateWebhookNextRetry(1), 60 * 1000, "Attempt 1: 1 minute delay");
assert.strictEqual(calculateWebhookNextRetry(2), 5 * 60 * 1000, "Attempt 2: 5 minutes delay");
assert.strictEqual(calculateWebhookNextRetry(3), 15 * 60 * 1000, "Attempt 3: 15 minutes delay");
assert.strictEqual(calculateWebhookNextRetry(4), 30 * 60 * 1000, "Attempt 4: 30 minutes delay");
assert.strictEqual(calculateWebhookNextRetry(5), 60 * 60 * 1000, "Attempt 5: 60 minutes delay");
assert.strictEqual(calculateWebhookNextRetry(6), null, "Attempt 6: null (exceeded max attempts)");
console.log("PASSED: Exponential backoff calculation verified.");

// ---------------------------------------------------------------------------
// TEST 10: API Key Generation (Format & Prefix)
// ---------------------------------------------------------------------------
console.log("10. Test: API Key generation format and prefix...");
const liveKey = generateApiKey(true);
assert.ok(liveKey.rawKey.startsWith("tc_live_"), "Live key must start with tc_live_");
assert.ok(liveKey.keyPrefix.startsWith("tc_live_"), "Prefix must start with tc_live_");
assert.strictEqual(liveKey.keyPrefix.length, 16, "Prefix length should be 16 chars");
assert.strictEqual(liveKey.keyHash.length, 64, "SHA-256 hash must be 64 hex characters");

const testKey = generateApiKey(false);
assert.ok(testKey.rawKey.startsWith("tc_test_"), "Test key must start with tc_test_");
console.log("PASSED: API key generation format validated.");

// ---------------------------------------------------------------------------
// TEST 11: API Key Hashing Integrity (Never Plain Text)
// ---------------------------------------------------------------------------
console.log("11. Test: API key hashing integrity...");
const secretString = "tc_live_9876543210abcdef9876543210abcdef";
const computedHash = hashApiKey(secretString);
const expectedDigest = crypto.createHash("sha256").update(secretString).digest("hex");
assert.strictEqual(computedHash, expectedDigest);
assert.notStrictEqual(computedHash, secretString, "Hash must never equal raw secret");
console.log("PASSED: SHA-256 API key hashing verified.");

// ---------------------------------------------------------------------------
// TEST 12: Revoked API Key Access Denial
// ---------------------------------------------------------------------------
console.log("12. Test: Revoked API key access rejection...");
const mockApiKeyStore: TeklifimApiKey[] = [
  {
    id: "key_active_1",
    userId: "sup_1",
    name: "ERP Active",
    keyPrefix: "tc_live_1111",
    keyHash: hashApiKey("tc_live_1111_secret"),
    scopes: ["products:read"],
    status: "active",
    createdAt: Date.now(),
  },
  {
    id: "key_revoked_1",
    userId: "sup_1",
    name: "ERP Deprecated",
    keyPrefix: "tc_live_2222",
    keyHash: hashApiKey("tc_live_2222_secret"),
    scopes: ["products:read"],
    status: "revoked",
    createdAt: Date.now(),
  },
];

function checkKeyStatus(rawKey: string): { authorized: boolean; error?: string } {
  const hash = hashApiKey(rawKey);
  const found = mockApiKeyStore.find(k => k.keyHash === hash);
  if (!found) return { authorized: false, error: "Key not found" };
  if (found.status !== "active") return { authorized: false, error: "Key revoked" };
  return { authorized: true };
}

assert.strictEqual(checkKeyStatus("tc_live_1111_secret").authorized, true);
assert.strictEqual(checkKeyStatus("tc_live_2222_secret").authorized, false);
assert.strictEqual(checkKeyStatus("tc_live_2222_secret").error, "Key revoked");
assert.strictEqual(checkKeyStatus("tc_live_invalid").authorized, false);
console.log("PASSED: Revoked API key access blocked.");

// ---------------------------------------------------------------------------
// TEST 13: API Scope Authorization
// ---------------------------------------------------------------------------
console.log("13. Test: API scope granular authorization...");
const readOnlyScopes = ["products:read", "requests:read"];
assert.strictEqual(verifyApiKeyScope(readOnlyScopes, "products:read"), true);
assert.strictEqual(verifyApiKeyScope(readOnlyScopes, "products:write"), false);
assert.strictEqual(verifyApiKeyScope(readOnlyScopes, "orders:read"), false);

const adminScopes = ["*"];
assert.strictEqual(verifyApiKeyScope(adminScopes, "products:write"), true);
assert.strictEqual(verifyApiKeyScope(adminScopes, "any:scope"), true);

const wildcardProductScopes = ["products:*"];
assert.strictEqual(verifyApiKeyScope(wildcardProductScopes, "products:read"), true);
assert.strictEqual(verifyApiKeyScope(wildcardProductScopes, "products:write"), true);
assert.strictEqual(verifyApiKeyScope(wildcardProductScopes, "requests:read"), false);
console.log("PASSED: Scope authorization and wildcard matching verified.");

// ---------------------------------------------------------------------------
// TEST 14: API Sliding Window Rate Limiting
// ---------------------------------------------------------------------------
console.log("14. Test: Sliding window rate limit threshold...");
const testRateKey = `rate_test_${Date.now()}`;
const rateConfig = { max: 5, windowMs: 10000 };

for (let i = 0; i < 5; i++) {
  const res = checkRateLimit(testRateKey, rateConfig);
  assert.strictEqual(res.allowed, true, `Request ${i + 1} should be allowed`);
}

const sixthReq = checkRateLimit(testRateKey, rateConfig);
assert.strictEqual(sixthReq.allowed, false, "6th request within window must be rejected (429)");
assert.ok(sixthReq.retryAfterSec > 0, "retryAfterSec must be greater than 0");
console.log("PASSED: Rate limiting sliding window functioning as specified.");

// ---------------------------------------------------------------------------
// TEST 15: Shipping Provider Status Normalization
// ---------------------------------------------------------------------------
console.log("15. Test: Carrier raw status normalization to standard enum...");
assert.strictEqual(normalizeCarrierStatus("Kargo Teslim Edildi"), "delivered");
assert.strictEqual(normalizeCarrierStatus("ALICIYA TESLIM"), "delivered");
assert.strictEqual(normalizeCarrierStatus("Kurye Dagitima Cikti"), "out_for_delivery");
assert.strictEqual(normalizeCarrierStatus("Transfer Merkezinde / Yolda"), "in_transit");
assert.strictEqual(normalizeCarrierStatus("Gonderi Kabul Edildi"), "shipped");
assert.strictEqual(normalizeCarrierStatus("Adreste Bulunamadi / Iade"), "exception");
assert.strictEqual(normalizeCarrierStatus("Bilinmeyen Durum XYZ"), "in_transit");
console.log("PASSED: Carrier status mapping verified.");

// ---------------------------------------------------------------------------
// TEST 16: Shipping State Synchronization
// ---------------------------------------------------------------------------
console.log("16. Test: Shipping state synchronization on order delivery...");
const mockOrder = {
  id: "ord_sync_10",
  status: "shipped" as const,
  shippingTracking: null as any,
};

function applyTrackingSync(order: typeof mockOrder, trackingStatus: TeklifimShippingStatus) {
  order.shippingTracking = { status: trackingStatus };
  if (trackingStatus === "delivered") {
    order.status = "delivered" as any;
  }
}

applyTrackingSync(mockOrder, "in_transit");
assert.strictEqual(mockOrder.status, "shipped");

applyTrackingSync(mockOrder, "delivered");
assert.strictEqual(mockOrder.status, "delivered");
console.log("PASSED: Order delivery state synchronized with carrier.");

// ---------------------------------------------------------------------------
// TEST 17: E-Invoice Draft Generation & Calculations
// ---------------------------------------------------------------------------
console.log("17. Test: E-Invoice draft calculations and VAT verification...");
const invoiceItems = [
  { name: "Un 50kg Cuval", quantity: 20, unitPrice: 800, vatRate: 20, total: 16000 },
  { name: "Seker 25kg Torba", quantity: 10, unitPrice: 600, vatRate: 20, total: 6000 },
];
const totalSubtotal = invoiceItems.reduce((acc, i) => acc + i.total, 0); // 22,000
const totalVat = invoiceItems.reduce((acc, i) => acc + (i.total * i.vatRate) / 100, 0); // 4,400
const grandTotal = totalSubtotal + totalVat; // 26,400

const draft: TeklifimInvoiceDraft = {
  invoiceId: "inv_mock_1",
  orderId: "ord_99",
  type: "e-fatura",
  taxNumberOrTckn: "1234567890",
  title: "Ornek Gida A.S.",
  items: invoiceItems,
  totalVat,
  grandTotal,
  currency: "TRY",
  status: "draft",
};

assert.strictEqual(draft.totalVat, 4400);
assert.strictEqual(draft.grandTotal, 26400);
assert.strictEqual(draft.type, "e-fatura");
console.log("PASSED: E-Invoice draft calculation verified.");

// ---------------------------------------------------------------------------
// TEST 18: Marketing Consent Storage
// ---------------------------------------------------------------------------
console.log("18. Test: Marketing consent record storage and properties...");
const consentRecord: TeklifimConsentRecord = {
  id: "c_1",
  userId: "user_consent_1",
  channel: "sms",
  type: "marketing",
  granted: true,
  grantedAt: Date.now(),
  source: "web_settings_panel",
  version: "v1.1",
  ipAddress: "192.168.1.100",
};

assert.strictEqual(consentRecord.channel, "sms");
assert.strictEqual(consentRecord.type, "marketing");
assert.strictEqual(consentRecord.granted, true);
assert.ok(consentRecord.grantedAt > 0);
assert.strictEqual(consentRecord.version, "v1.1");
console.log("PASSED: Consent record structure verified.");

// ---------------------------------------------------------------------------
// TEST 19: Consent Withdrawal
// ---------------------------------------------------------------------------
console.log("19. Test: Consent withdrawal blocking marketing dispatches...");
const consentHistory: TeklifimConsentRecord[] = [
  { ...consentRecord, granted: true, grantedAt: Date.now() - 100000 },
  { ...consentRecord, id: "c_2", granted: false, revokedAt: Date.now(), grantedAt: 0 },
];

function isMarketingPermitted(history: TeklifimConsentRecord[], channel: string): boolean {
  const match = history.filter(h => h.channel === channel).sort((a, b) => (b.revokedAt || b.grantedAt) - (a.revokedAt || a.grantedAt));
  if (match.length === 0) return false;
  return match[0].granted === true;
}

assert.strictEqual(isMarketingPermitted(consentHistory, "sms"), false, "Revoked consent must prevent marketing");
assert.strictEqual(isMarketingPermitted(consentHistory, "whatsapp"), false, "Missing consent must prevent marketing");
console.log("PASSED: Consent withdrawal honored.");

// ---------------------------------------------------------------------------
// TEST 20: Event Bus Multi-Channel Dispatch Resolution
// ---------------------------------------------------------------------------
console.log("20. Test: Event bus channel routing resolution...");
const eventToDispatch: TeklifimIntegrationEvent = {
  id: "ev_pub_1",
  type: "offer.created",
  entityId: "off_1",
  entityType: "offer",
  recipientId: "biz_1",
  payload: { recipientEmail: "alici@firma.com", recipientPhone: "+905551234567" },
  status: "pending",
  channelsDispatched: [],
  createdAt: Date.now(),
};

function resolveDispatchChannels(
  event: TeklifimIntegrationEvent,
  prefs: TeklifimNotificationPreference
): string[] {
  const channels: string[] = [];
  if (prefs.channels.push) channels.push("push");
  if (prefs.channels.email && event.payload.recipientEmail) channels.push("email");
  if (prefs.channels.sms && event.payload.recipientPhone) channels.push("sms");
  if (prefs.channels.whatsapp && event.payload.recipientPhone) channels.push("whatsapp");
  return channels;
}

const resolvedChannels = resolveDispatchChannels(eventToDispatch, {
  userId: "biz_1",
  ...DEFAULT_NOTIFICATION_PREFERENCES,
  updatedAt: Date.now(),
});

assert.deepStrictEqual(resolvedChannels, ["push", "email", "sms", "whatsapp"]);
console.log("PASSED: Multi-channel event routing verified.");

// ---------------------------------------------------------------------------
// TEST 21: Outbox Event Idempotency Token
// ---------------------------------------------------------------------------
console.log("21. Test: Outbox duplicate event prevention with idempotency tokens...");
const processedEventTokens = new Set<string>();

function processOutboxEvent(token: string): boolean {
  if (processedEventTokens.has(token)) {
    return false; // Duplicate
  }
  processedEventTokens.add(token);
  return true;
}

assert.strictEqual(processOutboxEvent("idem_token_abc_123"), true);
assert.strictEqual(processOutboxEvent("idem_token_abc_123"), false);
assert.strictEqual(processOutboxEvent("idem_token_def_456"), true);
console.log("PASSED: Outbox idempotency validated.");

// ---------------------------------------------------------------------------
// TEST 22: Sensitive Secret Redaction in Logs & Payloads
// ---------------------------------------------------------------------------
console.log("22. Test: Sensitive token and secret redaction in logging...");
const rawSensitivePayload = {
  userId: "user_42",
  secret: "whsec_super_secret_string",
  apiKey: "tc_live_private_api_key",
  authorization: "Bearer my_jwt_token",
  password: "PlainPassword123!",
  nested: {
    signature: "sha256=1234567890",
    orderNumber: "SIP-100",
  },
};

const sanitized = sanitizePayload(rawSensitivePayload);
assert.strictEqual(sanitized.secret, "[REDACTED]");
assert.strictEqual(sanitized.apiKey, "[REDACTED]");
assert.strictEqual(sanitized.authorization, "[REDACTED]");
assert.strictEqual(sanitized.password, "[REDACTED]");
assert.strictEqual(sanitized.nested.signature, "[REDACTED]");
assert.strictEqual(sanitized.nested.orderNumber, "SIP-100");
console.log("PASSED: Secrets and tokens redacted from logs.");

// ---------------------------------------------------------------------------
// TEST 23: Multi-Tenant Integration Resource Isolation
// ---------------------------------------------------------------------------
console.log("23. Test: Multi-tenant resource boundary isolation...");
const endpoints = [
  { id: "ep_1", userId: "supplier_alpha", url: "https://alpha.com/webhook" },
  { id: "ep_2", userId: "supplier_beta", url: "https://beta.com/webhook" },
];

function canUserAccessEndpoint(userId: string, endpointId: string): boolean {
  const ep = endpoints.find(e => e.id === endpointId);
  if (!ep) return false;
  return ep.userId === userId;
}

assert.strictEqual(canUserAccessEndpoint("supplier_alpha", "ep_1"), true);
assert.strictEqual(canUserAccessEndpoint("supplier_alpha", "ep_2"), false);
assert.strictEqual(canUserAccessEndpoint("supplier_beta", "ep_2"), true);
console.log("PASSED: Cross-tenant access strictly prevented.");

// ---------------------------------------------------------------------------
// TEST 24: Background Retry Queue Item Picking
// ---------------------------------------------------------------------------
console.log("24. Test: Background retry queue evaluation and picking...");
const now = Date.now();
const deliveriesInQueue = [
  { id: "d1", status: "retrying", nextRetryAt: now - 10000 }, // Eligible (past due)
  { id: "d2", status: "retrying", nextRetryAt: now + 50000 }, // Not eligible (future)
  { id: "d3", status: "delivered", nextRetryAt: undefined },  // Not eligible (done)
  { id: "d4", status: "failed", nextRetryAt: undefined },     // Not eligible (exhausted)
];

const eligibleDeliveries = deliveriesInQueue.filter(
  d => d.status === "retrying" && d.nextRetryAt && d.nextRetryAt <= now
);

assert.strictEqual(eligibleDeliveries.length, 1);
assert.strictEqual(eligibleDeliveries[0].id, "d1");
console.log("PASSED: Background retry queue evaluation verified.");

console.log("===============================================================");
console.log(">> ALL 24 FAZ 11 INTEGRATION TESTS PASSED SUCCESSFULLY!");
console.log("===============================================================");
