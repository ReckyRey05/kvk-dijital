import { NextResponse } from "next/server";
import { calculateAndCreateCanonicalOrder } from "@/lib/restaurant/canonicalOrderEngine";
import { forwardOrderToPos } from "@/lib/restaurant/posBridge";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export async function POST(req: Request) {
  try {
    const idempotencyKey = req.headers.get("x-idempotency-key") || undefined;
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tableId, sessionToken, items, notes, paymentMethod } = body;

    // 1. Execute 100% Server-Authoritative Canonical Order Calculation
    const result = calculateAndCreateCanonicalOrder({
      restaurantId,
      tableId,
      sessionToken,
      items,
      notes,
      paymentMethod,
      idempotencyKey,
    });

    if (!result.ok || !result.order) {
      const statusCode =
        result.errorCode === "SESSION_EXPIRED" || result.errorCode === "SESSION_INVALID"
          ? 403
          : result.errorCode === "TENANT_MISMATCH" || result.errorCode === "RESTAURANT_NOT_FOUND"
          ? 404
          : 400;

      return NextResponse.json(
        {
          error: result.errorCode || "ORDER_CALCULATION_FAILED",
          message: result.error || "Sipariş doğrulanamadı.",
        },
        { status: statusCode }
      );
    }

    const canonicalOrder = result.order;

    // 2. Dispatch to POS Bridge
    const posResult = await forwardOrderToPos(canonicalOrder, DEMO_RESTAURANT.settings);

    return NextResponse.json({
      success: true,
      order: canonicalOrder,
      posSync: posResult,
      isIdempotentReplay: result.isIdempotentReplay || false,
    });
  } catch (error) {
    return createSecureServerErrorResponse("RestaurantOrderAPI", error);
  }
}

