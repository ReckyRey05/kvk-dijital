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
 * Logs full technical details silently to server console and returns a clean,
 * secure HTTP response for users containing a Reference Code.
 * Completely prevents stack trace, database schema, or credential leakage.
 */
export function createSecureServerErrorResponse(
  contextName: string,
  error: any,
  userMessage: string = "İşlem gerçekleştirilirken bir sunucu hatası oluştu.",
  statusCode: number = 500
): NextResponse {
  const refCode = generateErrorRefCode();

  // Full error details logged to server logs ONLY
  console.error(`[${refCode}] ${contextName} Server Error:`, {
    message: error?.message || error,
    code: error?.code,
    stack: error?.stack,
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
