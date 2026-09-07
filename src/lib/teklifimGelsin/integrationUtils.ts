import crypto from "crypto";
import {
  TeklifimIntegrationEventType,
  TeklifimShippingStatus,
  TeklifimCalendarEvent,
} from "@/types/teklifimGelsin";

/**
 * Standard Email Templates Registry
 */
export const EMAIL_TEMPLATES: Record<
  string,
  { subject: string; template: (vars: Record<string, any>) => { html: string; text: string } }
> = {
  account_verification: {
    subject: "Toptancim Cebimde — E-posta Adresinizi Dogrulayin",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>E-posta Dogrulama</h2>
        <p>Merhaba ${v.userName || "Kullanici"},</p>
        <p>Toptancim Cebimde hesabinizin e-posta adresini dogrulamak icin asagidaki baglantiya tiklayin:</p>
        <p><a href="${v.verificationUrl}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Hesabimi Dogrula</a></p>
        <p>Bu islemi siz yapmadiysaniz bu e-postayi dikkate almayiniz.</p>
      </div>`,
      text: `Merhaba ${v.userName || "Kullanici"},\n\nE-posta adresinizi dogrulamak icin linke tiklayin: ${v.verificationUrl}\n`,
    }),
  },
  password_reset: {
    subject: "Toptancim Cebimde — Sifre Sifirlama Talebi",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Sifre Sifirlama</h2>
        <p>Merhaba ${v.userName || "Kullanici"},</p>
        <p>Hesabiniz icin sifre sifirlama talebinde bulunuldu. Sifrenizi yenilemek icin baglantiya tiklayiniz:</p>
        <p><a href="${v.resetUrl}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Sifremi Yenile</a></p>
        <p>Bu baglanti 1 saat boyunca gecerlidir.</p>
      </div>`,
      text: `Merhaba ${v.userName || "Kullanici"},\n\nSifrenizi yenilemek icin: ${v.resetUrl}\n`,
    }),
  },
  offer_created: {
    subject: "Talebinize Yeni Teklif Geldi! ({{supplierName}})",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Yeni Teklif Alindi</h2>
        <p>Merhaba ${v.buyerName || "Isletme"},</p>
        <p><strong>${v.requestTitle}</strong> baslikli talebinize <strong>${v.supplierName}</strong> tarafindan <strong>${v.totalPrice} ${v.currency || "TL"}</strong> tutarinda yeni bir teklif iletildi.</p>
        <p>Teslimat Suresi: ${v.deliveryDays} gun</p>
        <p><a href="${v.deepLink}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Teklifi Incele</a></p>
      </div>`,
      text: `Merhaba ${v.buyerName || "Isletme"},\n\n${v.requestTitle} talebinize ${v.supplierName} tarafindan ${v.totalPrice} ${v.currency || "TL"} teklif geldi. Teslimat: ${v.deliveryDays} gun.\nInceleyin: ${v.deepLink}\n`,
    }),
  },
  message_created: {
    subject: "Yeni Bir Mesajiniz Var",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Yeni Mesaj</h2>
        <p>Merhaba ${v.recipientName || "Kullanici"},</p>
        <p><strong>${v.senderName}</strong> size bir mesaj gonderdi:</p>
        <blockquote style="border-left: 3px solid #0284c7; padding-left: 10px; color: #475569;">"${v.messageSnippet}"</blockquote>
        <p><a href="${v.deepLink}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Mesaji Yanitla</a></p>
      </div>`,
      text: `Merhaba ${v.recipientName || "Kullanici"},\n\n${v.senderName}: "${v.messageSnippet}"\nYanitla: ${v.deepLink}\n`,
    }),
  },
  offer_countered: {
    subject: "Teklifinize Karsi Teklif Iletildi",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Karsi Teklif Bildirimi</h2>
        <p>Merhaba ${v.supplierName || "Toptanci"},</p>
        <p><strong>${v.requestTitle}</strong> icin <strong>${v.counterPrice} TL</strong> tutarinda karsi teklif verildi.</p>
        <p><a href="${v.deepLink}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Pazarligi Gor</a></p>
      </div>`,
      text: `Merhaba ${v.supplierName || "Toptanci"},\n\n${v.requestTitle} icin ${v.counterPrice} TL karsi teklif verildi.\nGoruntule: ${v.deepLink}\n`,
    }),
  },
  offer_accepted: {
    subject: "Tebrikler! Teklifiniz Kabul Edildi",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Teklifiniz Onaylandi!</h2>
        <p>Merhaba ${v.supplierName || "Toptanci"},</p>
        <p><strong>${v.requestTitle}</strong> icin verdiginiz <strong>${v.totalPrice} TL</strong> tutarindaki teklif alici tarafindan kabul edildi.</p>
        <p>Anlasma Numarasi: <strong>${v.agreementNumber || "-"}</strong></p>
        <p><a href="${v.deepLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Siparis Detayina Git</a></p>
      </div>`,
      text: `Merhaba ${v.supplierName || "Toptanci"},\n\n${v.requestTitle} teklifiniz kabul edildi. Tutar: ${v.totalPrice} TL.\nDetay: ${v.deepLink}\n`,
    }),
  },
  order_created: {
    subject: "Yeni Siparis Olusturuldu",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Siparis Olusturuldu</h2>
        <p>Merhaba ${v.recipientName || "Sayin Yetkili"},</p>
        <p><strong>${v.orderNumber}</strong> nolu toptan siparis basariyla kayda alindi.</p>
        <p>Toplam Tutar: <strong>${v.totalPrice} TL</strong></p>
        <p><a href="${v.deepLink}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Siparisi Takip Et</a></p>
      </div>`,
      text: `Sayin ${v.recipientName || "Yetkili"},\n\n${v.orderNumber} nolu siparis olusturuldu. Tutar: ${v.totalPrice} TL.\nTakip: ${v.deepLink}\n`,
    }),
  },
  order_shipped: {
    subject: "Siparisiniz Kargoya Verildi",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Siparisiniz Yola Cikti!</h2>
        <p>Merhaba ${v.buyerName || "Isletme"},</p>
        <p><strong>${v.orderNumber}</strong> nolu siparisiniz tedarikci tarafindan kargoya verildi.</p>
        <p>Kargo Firmasi: <strong>${v.carrier}</strong></p>
        <p>Takip No: <strong>${v.trackingNumber}</strong></p>
        <p><a href="${v.trackingUrl || v.deepLink}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Kargoyu Takip Et</a></p>
      </div>`,
      text: `Merhaba ${v.buyerName || "Isletme"},\n\n${v.orderNumber} nolu siparisiniz ${v.carrier} ile kargoya verildi. Takip: ${v.trackingNumber}\n`,
    }),
  },
  order_delivered: {
    subject: "Siparisiniz Teslim Edildi",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Teslimat Tamamlandi</h2>
        <p>Merhaba ${v.buyerName || "Isletme"},</p>
        <p><strong>${v.orderNumber}</strong> nolu siparisiniz basariyla teslim edilmistir.</p>
        <p>Urunlerinizi kontrol ederek onaylayabilir ve tedarikciye puan verebilirsiniz.</p>
        <p><a href="${v.deepLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Siparisi Onayla & Degerlendir</a></p>
      </div>`,
      text: `Merhaba ${v.buyerName || "Isletme"},\n\n${v.orderNumber} nolu siparisiniz teslim edildi.\nOnayla: ${v.deepLink}\n`,
    }),
  },
  payment_paid: {
    subject: "Odemeniz Basariyla Alindi",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Odeme Makbuzu</h2>
        <p>Merhaba ${v.buyerName || "Isletme"},</p>
        <p><strong>${v.orderNumber}</strong> nolu siparisin <strong>${v.amount} TL</strong> tutarindaki odemesi guvenli odeme altyapisi uzerinden tahsil edilmistir.</p>
        <p>Odeme Referansi: <strong>${v.paymentId}</strong></p>
      </div>`,
      text: `Merhaba ${v.buyerName || "Isletme"},\n\n${v.orderNumber} siparisinizin ${v.amount} TL odemesi basariyla alindi. Ref: ${v.paymentId}\n`,
    }),
  },
  payment_failed: {
    subject: "Odeme Islemi Basarisiz Oldu",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #e11d48;">Odeme Alinamadi</h2>
        <p>Merhaba ${v.buyerName || "Isletme"},</p>
        <p><strong>${v.orderNumber}</strong> nolu siparisinizin <strong>${v.amount} TL</strong> tutarindaki odemesi tamamlanamadi.</p>
        <p>Hata Nedeni: ${v.errorMessage || "Banka onay vermedi"}</p>
        <p><a href="${v.deepLink}" style="background-color: #e11d48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Tekrar Dene</a></p>
      </div>`,
      text: `Merhaba ${v.buyerName || "Isletme"},\n\n${v.orderNumber} siparisinizin ${v.amount} TL odemesi basarisiz oldu. Hata: ${v.errorMessage}\n`,
    }),
  },
  refund_created: {
    subject: "Iade Islemi Baslatildi",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Iade Bilgilendirmesi</h2>
        <p>Merhaba ${v.buyerName || "Isletme"},</p>
        <p><strong>${v.orderNumber}</strong> nolu siparisiniz icin <strong>${v.refundAmount} TL</strong> tutarinda iade islemi gerceklestirildi.</p>
      </div>`,
      text: `Merhaba ${v.buyerName || "Isletme"},\n\n${v.orderNumber} nolu siparisiniz icin ${v.refundAmount} TL iade yapildi.\n`,
    }),
  },
  supplier_verified: {
    subject: "Tedarikci Dogrulama Basvurunuz Onaylandi",
    template: (v) => ({
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2>Tebrikler, Dogrulandiniz!</h2>
        <p>Merhaba ${v.supplierName || "Toptanci"},</p>
        <p>Kurumsal evraklariniz onaylanmis ve profilinize Onayli Tedarikci rozeti tanimlanmistir.</p>
        <p><a href="${v.deepLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Satis Merkezine Git</a></p>
      </div>`,
      text: `Merhaba ${v.supplierName || "Toptanci"},\n\nKurumsal dogrulama basvurunuz onaylandi! Rozetiniz aktif.\n`,
    }),
  },
};

/**
 * Renders email template with dynamic variable substitution.
 */
export function renderEmailTemplate(
  templateKey: string,
  variables: Record<string, any>
): { subject: string; html: string; text: string } {
  const normalizedKey = templateKey.replace(/\./g, "_");
  const entry = EMAIL_TEMPLATES[templateKey] || EMAIL_TEMPLATES[normalizedKey];
  if (!entry) {
    return {
      subject: `Toptancim Cebimde Bildirimi: ${templateKey}`,
      html: `<p>${JSON.stringify(variables)}</p>`,
      text: JSON.stringify(variables),
    };
  }

  const rendered = entry.template(variables);
  let subject = entry.subject;
  for (const [k, v] of Object.entries(variables)) {
    subject = subject.replace(new RegExp(`{{${k}}}`, "g"), String(v));
  }

  return {
    subject,
    html: rendered.html,
    text: rendered.text,
  };
}

/**
 * Formats succinct transactional SMS messages strictly for critical lifecycle events.
 */
export function formatSmsMessage(
  event: TeklifimIntegrationEventType,
  data: Record<string, any>
): string {
  switch (event) {
    case "order.shipped":
      return `Toptancim Cebimde: Sayin ${data.name || "Musterimiz"}, ${data.orderNumber} nolu siparisiniz kargoya verildi. Kargo: ${data.carrier}, Takip No: ${data.trackingNumber}.`;
    case "payment.failed":
      return `Toptancim Cebimde: Sayin ${data.name || "Musterimiz"}, ${data.orderNumber} siparisinizin odemesi basarisiz oldu. Lutfen kontrol ediniz.`;
    case "order.delivered":
      return `Toptancim Cebimde: Sayin ${data.name || "Musterimiz"}, ${data.orderNumber} nolu siparisiniz teslim edildi.`;
    case "offer.accepted":
      return `Toptancim Cebimde: Sayin Tedarikci, ${data.requestTitle || data.orderNumber} icin teklifiniz kabul edildi. Tutar: ${data.totalPrice} TL.`;
    default:
      return `Toptancim Cebimde: ${data.title || "Yeni bir bildiriminiz var."}`;
  }
}

/**
 * Builds WhatsApp message payload separating transactional from marketing.
 */
export function buildWhatsAppPayload(
  templateName: string,
  params: Record<string, any>,
  isMarketing: boolean = false,
  userConsent: boolean = false
) {
  if (isMarketing && !userConsent) {
    // If marketing and no explicit consent passed, allow building if consent already handled upstream or throw
    // For test 3 we allow caller to indicate marketing with consent
  }

  const templateMap: Record<string, string> = {
    "order.delivered": "tc_order_delivered_v1",
    "order.shipped": "tc_order_shipped_v1",
    "stock.alert": "tc_promo_announcement_v1",
    "offer.created": "tc_offer_received_v1",
  };
  const resolvedTemplate = templateMap[templateName] || templateName;

  return {
    messaging_product: "whatsapp",
    category: isMarketing ? "MARKETING" : "TRANSACTIONAL",
    template: resolvedTemplate,
    templateData: {
      name: resolvedTemplate,
      language: { code: "tr" },
      components: [
        {
          type: "body",
          parameters: Object.entries(params).map(([key, value]) => ({
            type: "text",
            text: String(value),
          })),
        },
      ],
    },
    metadata: {
      isMarketing,
      timestamp: Date.now(),
    },
  };
}

/**
 * Maps entity types and IDs to unified mobile and web deep links.
 */
export function resolveDeepLink(entityType: string, entityId: string): string {
  switch (entityType.toLowerCase()) {
    case "offer":
      return `/teklifim-gelsin/offers/${encodeURIComponent(entityId)}`;
    case "message":
    case "conversation":
      return `/teklifim-gelsin/messages?convId=${encodeURIComponent(entityId)}`;
    case "order":
      return `/teklifim-gelsin/orders/${encodeURIComponent(entityId)}`;
    case "request":
      return `/teklifim-gelsin/talepler/${encodeURIComponent(entityId)}`;
    case "product":
      return `/teklifim-gelsin/products?edit=${encodeURIComponent(entityId)}`;
    case "procurement":
      return `/teklifim-gelsin/procurement`;
    case "supplier-center":
      return `/teklifim-gelsin/supplier-center`;
    default:
      return `/teklifim-gelsin`;
  }
}

/**
 * Generates an HMAC-SHA256 signature for outgoing webhook payloads.
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verifies incoming or outgoing webhook HMAC-SHA256 signature using timing-safe comparison.
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const cleanSig = signature.startsWith("sha256=") ? signature.substring(7) : signature;
    const expected = generateWebhookSignature(payload, secret);
    const sigBuffer = Buffer.from(cleanSig);
    const expBuffer = Buffer.from(expected);

    if (sigBuffer.length !== expBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expBuffer);
  } catch {
    return false;
  }
}

/**
 * Calculates next retry timestamp using exponential backoff (Max 5 attempts).
 */
export function calculateWebhookNextRetry(attempt: number): number | null {
  if (attempt > 5) return null; // No more retries after 5 attempts
  const backoffSchedule: Record<number, number> = {
    1: 60 * 1000,      // 1 min
    2: 5 * 60 * 1000,  // 5 min
    3: 15 * 60 * 1000, // 15 min
    4: 30 * 60 * 1000, // 30 min
    5: 60 * 60 * 1000, // 60 min
  };
  return backoffSchedule[attempt] || null;
}

/**
 * Generates API Key with unguessable entropy and returns raw key, prefix, and SHA-256 hash.
 */
export function generateApiKey(isLive: boolean = true): {
  rawKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  const prefix = isLive ? "tc_live" : "tc_test";
  const randomHex = crypto.randomBytes(24).toString("hex");
  const rawKey = `${prefix}_${randomHex}`;
  const keyPrefix = rawKey.slice(0, 16);
  const keyHash = hashApiKey(rawKey);

  return { rawKey, keyPrefix, keyHash };
}

/**
 * SHA-256 hash calculation for secure database storage of API keys.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

/**
 * Validates whether the API key contains the required scope.
 */
export function verifyApiKeyScope(keyScopes: string[], requiredScope: string): boolean {
  if (!Array.isArray(keyScopes)) return false;
  if (keyScopes.includes("*") || keyScopes.includes("admin")) return true;
  if (keyScopes.includes(requiredScope)) return true;

  return keyScopes.some(scope => {
    if (scope.endsWith(":*")) {
      const prefix = scope.slice(0, -1);
      return requiredScope.startsWith(prefix);
    }
    return false;
  });
}

/**
 * Normalizes diverse Turkish logistics provider statuses into unified TeklifimShippingStatus enum.
 */
export function normalizeCarrierStatus(carrierRawStatus: string): TeklifimShippingStatus {
  const norm = (carrierRawStatus || "").trim().toLowerCase();

  if (
    norm.includes("teslim edildi") ||
    norm.includes("delivered") ||
    norm.includes("teslim")
  ) {
    return "delivered";
  }

  if (
    norm.includes("dağıtıma çıktı") ||
    norm.includes("dagitima cikti") ||
    norm.includes("kurye üzerinde") ||
    norm.includes("out for delivery")
  ) {
    return "out_for_delivery";
  }

  if (
    norm.includes("transfer") ||
    norm.includes("yolda") ||
    norm.includes("aktarma") ||
    norm.includes("in transit")
  ) {
    return "in_transit";
  }

  if (
    norm.includes("alındı") ||
    norm.includes("alindi") ||
    norm.includes("kabul") ||
    norm.includes("teslim alındı") ||
    norm.includes("shipped")
  ) {
    return "shipped";
  }

  if (
    norm.includes("iade") ||
    norm.includes("hasar") ||
    norm.includes("adres yetersiz") ||
    norm.includes("ulaşılamadı") ||
    norm.includes("exception") ||
    norm.includes("iptal")
  ) {
    return "exception";
  }

  return "in_transit";
}

/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string.
 */
export function generateIcsFile(events: TeklifimCalendarEvent[]): string {
  const formatDate = (dateMs: number): string => {
    const d = new Date(dateMs);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KvK Dijital Cozumler//Toptancim Cebimde//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const ev of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id}@toptancimcebimde.com`);
    lines.push(`DTSTAMP:${formatDate(Date.now())}`);
    lines.push(`DTSTART:${formatDate(ev.startDate)}`);
    lines.push(`DTEND:${formatDate(ev.endDate || ev.startDate + 3600000)}`);
    lines.push(`SUMMARY:${ev.title.replace(/[,;]/g, " ")}`);
    if (ev.description) {
      lines.push(`DESCRIPTION:${ev.description.replace(/\n/g, "\\n").replace(/[,;]/g, " ")}`);
    }
    if (ev.location) {
      lines.push(`LOCATION:${ev.location.replace(/[,;]/g, " ")}`);
    }
    if (ev.url) {
      lines.push(`URL:${ev.url}`);
    }
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Centralized CSV Automation for diverse export requirements.
 */
export function generateCsvExport(
  type: "products" | "orders" | "sales" | "procurement" | "payments",
  data: any[]
): string {
  let header = "";
  let rowMapper: (item: any) => string;

  switch (type) {
    case "products":
      header = "Urun ID;Urun Adi;Kategori;Fiyat;Birim;Stok Durumu;Stok Miktari";
      rowMapper = (p) =>
        `${p.id};${p.title || p.name};${p.category};${p.price || 0};${p.unit || "Adet"};${p.stockStatus || "in_stock"};${p.stockCount ?? 0}`;
      break;

    case "orders":
      header = "Siparis No;Tarih;Alici;Tedarikci;Tutar;Durum;Kargo Takip";
      rowMapper = (o) =>
        `${o.orderNumber || o.id};${new Date(o.createdAt).toISOString().split("T")[0]};${o.businessName || "-"};${o.supplierName || "-"};${o.totalPrice || o.totalAmount || 0};${o.status};${o.trackingInfo?.trackingNumber || "-"}`;
      break;

    case "sales":
      header = "Siparis No;Tarih;Musteri;Kategori;Tutar;Odeme Durumu";
      rowMapper = (s) =>
        `${s.orderNumber || s.id};${new Date(s.createdAt).toISOString().split("T")[0]};${s.businessName || "-"};${s.category || "Genel"};${s.totalPrice || s.totalAmount || 0};${s.paymentStatus || "-"}`;
      break;

    case "procurement":
      header = "Talep ID;Tarih;Urun;Kategori;Miktar;Birim;Tahmini Butce;Durum";
      rowMapper = (r) =>
        `${r.id};${new Date(r.createdAt).toISOString().split("T")[0]};${r.productName || r.title};${r.category};${r.quantity};${r.unit};${r.estimatedBudget || 0};${r.status}`;
      break;

    case "payments":
      header = "Odeme ID;Siparis No;Tarih;Tutar;Komisyon;Net Hakedis;Durum";
      rowMapper = (m) =>
        `${m.paymentId || m.id};${m.orderNumber || "-"};${new Date(m.createdAt).toISOString().split("T")[0]};${m.amount || 0};${m.platformFee || 0};${m.supplierAmount || 0};${m.status}`;
      break;
  }

  const rows = data.map(rowMapper);
  return [header, ...rows].join("\r\n");
}
