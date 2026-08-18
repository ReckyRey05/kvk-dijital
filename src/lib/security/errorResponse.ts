import { NextResponse } from "next/server";

/**
 * Generates a unique 6-character alphanumeric error reference code (e.g., KVK-8F3A29)
 */
export function generateErrorRefCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "KVK-";
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

/**
 * Masks sensitive strings (emails, phone numbers, tokens, passwords) for secure logging.
 * E.g., "alihaydarkvk@kvkdijitalcozumler.com" -> "alih...@kvkdijitalcozumler.com"
 * E.g., "+905348914905" -> "+905...4905"
 * E.g., "secretPassword123" -> "secr..."
 */
export function maskSensitiveData(val: string | null | undefined): string {
  if (!val || typeof val !== "string") return "***";
  const trimmed = val.trim();
  if (!trimmed) return "***";

  // Email Masking
  if (trimmed.includes("@")) {
    const [local, domain] = trimmed.split("@");
    if (local.length <= 4) {
      return `${local.slice(0, 1)}***@${domain}`;
    }
    return `${local.slice(0, 4)}...@${domain}`;
  }

  // Long Strings / Phone Numbers / Tokens
  if (trimmed.length > 8) {
    return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
  }

  return `${trimmed.slice(0, 2)}...`;
}

/**
 * Sanitizes any raw object/error by stripping sensitive keys (password, token, creditCard, tcNo, etc.)
 */
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== "object") return data;

  const SENSITIVE_KEYS = ["password", "pass", "token", "idtoken", "secret", "card", "cvv", "tc", "phone", "email"];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
      if (typeof sanitized[key] === "string") {
        sanitized[key] = maskSensitiveData(sanitized[key]);
      } else {
        sanitized[key] = "[PROTECTED_SENSITIVE_DATA]";
      }
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Logs full technical details silently to server console with sensitive data masking,
 * and returns a clean, secure HTTP response for users containing a Reference Code.
 */
export function createSecureServerErrorResponse(
  contextName: string,
  error: any,
  userMessage: string = "İşlem gerçekleştirilirken bir sunucu hatası oluştu.",
  statusCode: number = 500
): NextResponse {
  const refCode = generateErrorRefCode();

  // Full error details logged to server logs ONLY (Sanitized against raw secret leaks)
  console.error(`[${refCode}] ${contextName} Server Error:`, {
    message: typeof error?.message === "string" ? sanitizeLogData(error.message) : "Internal Server Error",
    code: error?.code,
    timestamp: new Date().toISOString(),
  });

  // Clean, safe response sent to the client
  return NextResponse.json(
    {
      error: "SERVER_ERROR",
      message: `${userMessage} (Destek Kodu: ${refCode})`,
      refCode,
    },
    { status: statusCode }
  );
}
