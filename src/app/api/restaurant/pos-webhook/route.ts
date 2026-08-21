import { NextResponse } from "next/server";
import { invalidateAllTableSessions } from "@/lib/restaurant/session";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { getClientIp, checkRateLimit, createRateLimitResponse, parseJsonWithByteLimit } from "@/lib/security/rateLimit";
import { RATE_LIMITS } from "@/config/rateLimit";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

/**
 * Webhook endpoint for receiving asynchronous events from External Cloud POS systems (Adisyo, Simpra, etc.)
 */
export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const ipCheck = checkRateLimit(`restWebhook:ip:${clientIp}`, RATE_LIMITS.restaurant.webhook.ip);
    if (!ipCheck.allowed) return createRateLimitResponse(ipCheck);

    const parseResult = await parseJsonWithByteLimit(req, 1 * 1024 * 1024);
    if (!parseResult.ok) return parseResult.errorResponse;

    const authHeader = req.headers.get("authorization") || req.headers.get("x-pos-key");
    const configuredKey = DEMO_RESTAURANT.settings.posApiKey || "pos_secret_aura_demo";

    // Validate POS Webhook Secret if configured
    if (authHeader && authHeader.replace("Bearer ", "").trim() !== configuredKey && authHeader !== configuredKey) {
      return NextResponse.json(
        { error: "UNAUTHORIZED_WEBHOOK", message: "Geçersiz POS Webhook Anahtarı." },
        { status: 401 }
      );
    }

    const body = parseResult.data || {};
    const { event, restaurantId, tableId, ticketId, status } = body;

    if (!event || !restaurantId) {
      return NextResponse.json(
        { error: "INVALID_WEBHOOK_PAYLOAD", message: "event ve restaurantId zorunludur." },
        { status: 400 }
      );
    }

    // Verify restaurant matches
    if (restaurantId !== DEMO_RESTAURANT.id && restaurantId !== DEMO_RESTAURANT.slug) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND", message: "Belirtilen restoran bulunamadı." },
        { status: 404 }
      );
    }

    // EVENT 1: TABLE CHECKOUT & SETTLEMENT COMPLETED BY CASHIER IN EXTERNAL POS
    if (event === "BILL_SETTLED" || event === "TABLE_CLOSED") {
      if (tableId) {
        const revokedCount = invalidateAllTableSessions(restaurantId, tableId);
        console.log(`[POS Webhook] Table ${tableId} closed. Revoked ${revokedCount} active QR sessions.`);
      }
    }

    // EVENT 2: TICKET STATUS UPDATED
    if (event === "TICKET_UPDATED") {
      console.log(`[POS Webhook] Ticket ${ticketId} updated to ${status}.`);
    }

    return NextResponse.json({
      received: true,
      event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return createSecureServerErrorResponse("RestaurantPosWebhookAPI", error);
  }
}

