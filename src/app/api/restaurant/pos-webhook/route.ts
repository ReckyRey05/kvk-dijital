import { NextResponse } from "next/server";
import { invalidateAllTableSessions } from "@/lib/restaurant/session";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

/**
 * Webhook endpoint for receiving asynchronous events from External Cloud POS systems (Adisyo, Simpra, etc.)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { event, restaurantId, tableId, ticketId, status } = body;

    if (!event || !restaurantId) {
      return NextResponse.json(
        { error: "INVALID_WEBHOOK_PAYLOAD", message: "event ve restaurantId zorunludur." },
        { status: 400 }
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
