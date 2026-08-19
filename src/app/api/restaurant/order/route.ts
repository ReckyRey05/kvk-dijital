import { NextResponse } from "next/server";
import { validateTableSession } from "@/lib/restaurant/session";
import { forwardOrderToPos } from "@/lib/restaurant/posBridge";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { Order } from "@/types/restaurant";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tableId, tableNumber, sessionToken, items, notes, paymentMethod } = body;

    // 1. Basic validation
    if (!restaurantId || !tableId || !sessionToken || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "INVALID_ORDER_PAYLOAD", message: "Geçersiz sipariş verisi veya boş sepet." },
        { status: 400 }
      );
    }

    // 2. Strict 15-Minute Table Session Verification
    const sessionCheck = validateTableSession(sessionToken, restaurantId, tableId);
    if (!sessionCheck.valid) {
      return NextResponse.json(
        {
          error: "SESSION_INVALID",
          code: sessionCheck.error,
          message:
            sessionCheck.error === "EXPIRED"
              ? "Masa oturum süreniz (15 dk) doldu. Lütfen masadaki QR kodu tekrar okutun."
              : "Geçersiz masa oturumu. Sipariş verilemedi.",
        },
        { status: 403 }
      );
    }

    // 3. Calculate total
    const totalAmount = items.reduce(
      (sum: number, it: any) => sum + (it.finalPrice || it.basePrice || 0) * (it.quantity || 1),
      0
    );

    const orderId = `ord_${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      restaurantId,
      tableId,
      tableNumber: tableNumber || `Masa ${tableId}`,
      sessionToken,
      status:
        DEMO_RESTAURANT.settings.orderMode === "DIRECT_KITCHEN"
          ? "PREPARING"
          : "PENDING_CONFIRMATION",
      items,
      subtotal: totalAmount,
      taxAmount: Math.round(totalAmount * 0.1),
      serviceCharge: 0,
      totalAmount,
      notes: typeof notes === "string" ? notes.slice(0, 300) : undefined,
      paymentStatus: "PENDING",
      paymentMethod: paymentMethod || "CREDIT_CARD",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. Dispatch to POS Bridge
    const posResult = await forwardOrderToPos(newOrder, DEMO_RESTAURANT.settings);

    return NextResponse.json({
      success: true,
      order: newOrder,
      posSync: posResult,
    });
  } catch (error) {
    return createSecureServerErrorResponse("RestaurantOrderAPI", error);
  }
}
