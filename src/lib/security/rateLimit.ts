import { NextResponse } from "next/server";
import { RateLimitConfig } from "@/config/rateLimit";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store (Zero external dependencies)
const store = new Map<string, RateLimitRecord>();

// Cleanup stale keys every 10 minutes to prevent memory leak
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    record.timestamps = record.timestamps.filter(ts => now - ts < 60 * 60 * 1000);
    if (record.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);
if (typeof cleanupInterval === "object" && typeof cleanupInterval?.unref === "function") {
  cleanupInterval.unref();
}

export interface RateLimitCheckResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSec: number;
}

/**
 * Extracts reliable client IP address from server request headers
 */
export function getClientIp(req: Request): string {
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    return ips[0].trim();
  }

  return "127.0.0.1";
}

/**
 * Checks sliding window rate limit for a specific key and configuration
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitCheckResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter(ts => ts > windowStart);

  if (record.timestamps.length >= config.max) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = oldestTimestamp + config.windowMs - now;
    const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));

    return {
      allowed: false,
      limit: config.max,
      remaining: 0,
      resetMs,
      retryAfterSec,
    };
  }

  // Record current request timestamp
  record.timestamps.push(now);
  const remaining = Math.max(0, config.max - record.timestamps.length);

  return {
    allowed: true,
    limit: config.max,
    remaining,
    resetMs: config.windowMs,
    retryAfterSec: 0,
  };
}

/**
 * Generates standardized HTTP 429 Too Many Requests response with exact Retry-After headers
 */
export function createRateLimitResponse(result: RateLimitCheckResult): NextResponse {
  const minutes = Math.ceil(result.retryAfterSec / 60);
  const message = minutes > 1 
    ? `Çok fazla istek gönderildi. Lütfen yaklaşık ${minutes} dakika sonra tekrar deneyin.`
    : `Çok fazla istek gönderildi. Lütfen ${result.retryAfterSec} saniye sonra tekrar deneyin.`;

  return NextResponse.json(
    {
      error: "RATE_LIMITED",
      message,
      retryAfter: result.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": result.retryAfterSec.toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

/**
 * Safely reads and parses request JSON body with a strict ReadableStream byte limit BEFORE full memory allocation.
 * Returns { ok: true, data: any } or { ok: false, errorResponse: NextResponse (HTTP 413) }.
 */
export async function parseJsonWithByteLimit(
  req: Request,
  maxBytes: number = 2 * 1024 * 1024 // 2 MB Default
): Promise<{ ok: true; data: any } | { ok: false; errorResponse: NextResponse }> {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return {
        ok: false,
        errorResponse: NextResponse.json(
          { error: "PAYLOAD_TOO_LARGE", message: "İstek boyutu 2MB sınırını aşıyor." },
          { status: 413 }
        ),
      };
    }

    if (!req.body) {
      return { ok: true, data: {} };
    }

    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        totalBytes += value.length;
        if (totalBytes > maxBytes) {
          reader.cancel();
          return {
            ok: false,
            errorResponse: NextResponse.json(
              { error: "PAYLOAD_TOO_LARGE", message: "İstek boyutu 2MB sınırını aşıyor." },
              { status: 413 }
            ),
          };
        }
        chunks.push(value);
      }
    }

    const concatenated = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }

    const text = new TextDecoder("utf-8").decode(concatenated);
    if (!text.trim()) {
      return { ok: true, data: {} };
    }

    const data = JSON.parse(text);
    return { ok: true, data };
  } catch {
    return { ok: true, data: {} };
  }
}
