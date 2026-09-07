import sanitizeHtml from "sanitize-html";

/**
 * TOPTANCIM CEBIMDE - INPUT VALIDATION & SANITIZATION ENGINE
 * FAZ 14 Security Hardening
 */

export interface ValidationOutput<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

/**
 * Strips dangerous HTML tags, inline scripts, event handlers and javascript: URLs.
 * Keeps plain text safe from XSS and HTML injection.
 */
export function sanitizeSafeString(input: string | null | undefined, maxLength: number = 5000): string {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Strip null bytes and control characters (except newline and tab)
  const cleanChars = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Strip all HTML tags completely for plain text fields
  const cleanHtml = sanitizeHtml(cleanChars, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });

  return cleanHtml.slice(0, maxLength);
}

/**
 * Sanitizes uploaded file names to strictly prevent Directory Traversal (../),
 * null byte poisoning, and command injection attacks.
 */
export function sanitizeFilename(filename: string | null | undefined): string {
  if (!filename || typeof filename !== "string") return "attachment.bin";

  // Remove path components (both unix and windows)
  let baseName = filename.replace(/^.*[\\\/]/, "");

  // Strip null bytes and control chars
  baseName = baseName.replace(/[\x00-\x1F\x7F]/g, "");

  // Replace multiple dots or path traversal patterns like ..
  baseName = baseName.replace(/\.{2,}/g, ".");

  // Keep only safe alphanumeric characters, dashes, underscores, and single dots
  baseName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Prevent leading dot (hidden files)
  if (baseName.startsWith(".")) {
    baseName = `file_${baseName.slice(1)}`;
  }

  return baseName.slice(0, 100) || "attachment.bin";
}

/**
 * Inspects raw buffer magic bytes to verify genuine file formats
 * and prevent Polyglot / MIME-sniffing exploits.
 */
export function validateMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (declaredMimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47 (0x89 'PNG')
  if (declaredMimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WEBP: 'RIFF' .... 'WEBP'
  if (declaredMimeType === "image/webp") {
    if (buffer.length < 12) return false;
    const isRiff = buffer.subarray(0, 4).toString("ascii") === "RIFF";
    const isWebp = buffer.subarray(8, 12).toString("ascii") === "WEBP";
    return isRiff && isWebp;
  }

  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (declaredMimeType === "application/pdf") {
    return (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46 &&
      buffer[4] === 0x2d
    );
  }

  // Plain text / CSV: Reject binary control characters
  if (declaredMimeType === "text/plain" || declaredMimeType === "text/csv") {
    const sampleSize = Math.min(buffer.length, 512);
    for (let i = 0; i < sampleSize; i++) {
      const byte = buffer[i];
      // Allow tab(9), LF(10), CR(13), and printable ASCII(32..126) + UTF-8 (>127)
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
        return false;
      }
    }
    return true;
  }

  // Office documents (ZIP-based: PK 03 04)
  if (
    declaredMimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    declaredMimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  // Legacy MS Office (D0 CF 11 E0)
  if (declaredMimeType === "application/msword" || declaredMimeType === "application/vnd.ms-excel") {
    return buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0;
  }

  return false;
}

/**
 * Clamps and sanitizes pagination parameters to prevent unbounded memory allocation
 * or DoS through oversized page limits.
 */
export function validatePagination(
  rawPage?: any,
  rawLimit?: any,
  defaultLimit: number = 20,
  maxLimit: number = 100
): { page: number; limit: number; offset: number } {
  let page = parseInt(String(rawPage || 1), 10);
  let limit = parseInt(String(rawLimit || defaultLimit), 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Validates and sanitizes RFQ (Request for Quote) payloads.
 */
export function validateRfqPayload(payload: any): ValidationOutput<{
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  targetBudget?: number;
  deliveryCity: string;
}> {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Gecersiz istek verisi." };
  }

  const title = sanitizeSafeString(payload.title, 150);
  if (!title || title.length < 3) {
    return { isValid: false, error: "Talep basligi en az 3 karakter olmalidir." };
  }

  const description = sanitizeSafeString(payload.description, 4000);
  if (!description || description.length < 10) {
    return { isValid: false, error: "Talep aciklamasi en az 10 karakter olmalidir." };
  }

  const category = sanitizeSafeString(payload.category, 80);
  if (!category) {
    return { isValid: false, error: "Lutfen bir kategori secin." };
  }

  const quantity = Number(payload.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    return { isValid: false, error: "Miktar 0'dan buyuk bir sayi olmalidir." };
  }

  const unit = sanitizeSafeString(payload.unit, 30) || "Adet";
  const deliveryCity = sanitizeSafeString(payload.deliveryCity, 50);
  if (!deliveryCity) {
    return { isValid: false, error: "Teslimat sehri belirtilmelidir." };
  }

  const targetBudget = payload.targetBudget !== undefined ? Number(payload.targetBudget) : undefined;
  if (targetBudget !== undefined && (isNaN(targetBudget) || targetBudget < 0)) {
    return { isValid: false, error: "Hedef butce gecerli bir pozitif sayi olmalidir." };
  }

  return {
    isValid: true,
    data: {
      title,
      description,
      category,
      quantity,
      unit,
      targetBudget,
      deliveryCity,
    },
  };
}

/**
 * Validates and sanitizes Offer payloads.
 */
export function validateOfferPayload(payload: any): ValidationOutput<{
  price: number;
  currency: string;
  deliveryDays: number;
  notes?: string;
  vatIncluded: boolean;
}> {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Gecersiz teklif verisi." };
  }

  const price = Number(payload.price || payload.totalPrice);
  if (isNaN(price) || price <= 0) {
    return { isValid: false, error: "Teklif tutari 0'dan buyuk bir sayi olmalidir." };
  }

  const allowedCurrencies = ["TRY", "USD", "EUR"];
  const currency = String(payload.currency || "TRY").toUpperCase();
  if (!allowedCurrencies.includes(currency)) {
    return { isValid: false, error: "Desteklenmeyen para birimi." };
  }

  const deliveryDays = Number(payload.deliveryDays);
  if (isNaN(deliveryDays) || deliveryDays < 1 || deliveryDays > 365) {
    return { isValid: false, error: "Teslimat suresi 1 ile 365 gun arasinda olmalidir." };
  }

  const notes = payload.notes ? sanitizeSafeString(payload.notes, 2000) : undefined;
  const vatIncluded = Boolean(payload.vatIncluded);

  return {
    isValid: true,
    data: {
      price,
      currency,
      deliveryDays,
      notes,
      vatIncluded,
    },
  };
}

/**
 * Validates and sanitizes chat/messaging payloads.
 */
export function validateMessagePayload(payload: any): ValidationOutput<{
  text: string;
  conversationId: string;
  attachments?: any[];
}> {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Gecersiz mesaj verisi." };
  }

  const conversationId = String(payload.conversationId || "").trim();
  if (!conversationId) {
    return { isValid: false, error: "Konusma ID zorunludur." };
  }

  const text = sanitizeSafeString(payload.text, 5000);
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

  if (!text && attachments.length === 0) {
    return { isValid: false, error: "Mesaj metni veya ek dosya gereklidir." };
  }

  return {
    isValid: true,
    data: {
      text,
      conversationId,
      attachments,
    },
  };
}
