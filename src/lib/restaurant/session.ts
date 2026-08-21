import crypto from "crypto";
import { TableSession } from "@/types/restaurant";

// In-memory / Serverless Session Store with Instant Invalidation registry
// Maps sessionId -> TableSession
const activeSessions = new Map<string, TableSession>();

// Maps restaurantId:tableId -> Set of active sessionIds
const tableSessionIndex = new Map<string, Set<string>>();

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes (900,000 ms)
const SESSION_HMAC_SECRET = process.env.SESSION_SECRET || "cep_garson_canonical_hmac_secret_2026";

function signPayload(payload: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_HMAC_SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

/**
 * Generates an HMAC-SHA256 cryptographically signed token for the 15-minute table session.
 */
function generateSessionToken(restaurantId: string, tableId: string, fingerprint: string): string {
  const timestamp = Date.now();
  const rand = crypto.randomBytes(8).toString("hex");
  const payload = `${restaurantId}:${tableId}:${fingerprint}:${timestamp}:${rand}`;
  const sig = signPayload(payload);
  const full = `${payload}.${sig}`;
  return Buffer.from(full).toString("base64url");
}

/**
 * Verifies the cryptographic HMAC signature of a session token.
 */
export function verifySessionTokenSignature(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return false;
    const payload = decoded.substring(0, lastDot);
    const sig = decoded.substring(lastDot + 1);
    const expectedSig = signPayload(payload);
    if (sig.length !== expectedSig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/**
 * Creates or retrieves a fresh 15-minute Table Session Token.
 */
export function createTableSession(
  restaurantId: string,
  tableId: string,
  tableNumber: string,
  deviceFingerprint: string,
  timeoutMinutes: number = 15
): TableSession {
  const now = Date.now();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const token = generateSessionToken(restaurantId, tableId, deviceFingerprint);
  const sessionId = `sess_${now}_${crypto.randomBytes(4).toString("hex")}`;

  const session: TableSession = {
    sessionId,
    restaurantId,
    tableId,
    tableNumber,
    deviceFingerprint,
    issuedAt: now,
    expiresAt: now + timeoutMs,
    isActive: true,
    token,
  };

  activeSessions.set(sessionId, session);
  activeSessions.set(token, session);

  const tableKey = `${restaurantId}:${tableId}`;
  if (!tableSessionIndex.has(tableKey)) {
    tableSessionIndex.set(tableKey, new Set<string>());
  }
  tableSessionIndex.get(tableKey)!.add(sessionId);
  tableSessionIndex.get(tableKey)!.add(token);

  return session;
}

export interface SessionValidationResult {
  valid: boolean;
  error?: "EXPIRED" | "INVALID_TOKEN" | "TABLE_CLOSED" | "DEVICE_MISMATCH";
  session?: TableSession;
  remainingMinutes?: number;
}

/**
 * Validates whether a given token is active, matches the table, and within the 15-minute window.
 */
export function validateTableSession(
  tokenOrId: string,
  restaurantId: string,
  tableId: string,
  deviceFingerprint?: string
): SessionValidationResult {
  if (!tokenOrId) {
    return { valid: false, error: "INVALID_TOKEN" };
  }

  const session = activeSessions.get(tokenOrId);
  if (!session || !session.isActive) {
    return { valid: false, error: "INVALID_TOKEN" };
  }

  // Cross-tenant or cross-table protection
  if (session.restaurantId !== restaurantId || session.tableId !== tableId) {
    return { valid: false, error: "INVALID_TOKEN" };
  }

  // Check 15-minute expiration
  const now = Date.now();
  if (now > session.expiresAt) {
    session.isActive = false;
    activeSessions.delete(tokenOrId);
    return { valid: false, error: "EXPIRED" };
  }

  // Device fingerprint check if provided
  if (deviceFingerprint && session.deviceFingerprint && session.deviceFingerprint !== deviceFingerprint) {
    return { valid: false, error: "DEVICE_MISMATCH" };
  }

  const remainingMs = session.expiresAt - now;
  const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

  return {
    valid: true,
    session,
    remainingMinutes,
  };
}

/**
 * Extends the active session while the customer is actively browsing/ordering (Heartbeat).
 */
export function refreshTableSession(tokenOrId: string, extensionMinutes: number = 15): boolean {
  const session = activeSessions.get(tokenOrId);
  if (!session || !session.isActive) return false;

  const now = Date.now();
  session.expiresAt = now + extensionMinutes * 60 * 1000;
  return true;
}

/**
 * INSTANT TABLE INVALIDATION (Masa Kapanışında Tüm Oturumları Anında Sıfırlama)
 * Called by Cashier/POS when the table pays the bill and closes.
 * Physically prevents anyone from ordering from home with previous QR links.
 */
export function invalidateAllTableSessions(restaurantId: string, tableId: string): number {
  const tableKey = `${restaurantId}:${tableId}`;
  const sessionIds = tableSessionIndex.get(tableKey);
  if (!sessionIds) return 0;

  let count = 0;
  for (const id of sessionIds) {
    const sess = activeSessions.get(id);
    if (sess) {
      sess.isActive = false;
      activeSessions.delete(id);
      count++;
    }
  }

  tableSessionIndex.delete(tableKey);
  return count;
}
