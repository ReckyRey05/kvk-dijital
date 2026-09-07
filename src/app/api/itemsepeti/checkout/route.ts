import { NextRequest, NextResponse } from "next/server";
import { createOrderFromCart } from "@/lib/itemsepeti/orderService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buyerId, buyerEmail, idempotencyKey, deliveryDetails } = body;

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "buyerId alanı zorunludur." },
        { status: 400 }
      );
    }

    const result = await createOrderFromCart({
      buyerId,
      buyerEmail,
      idempotencyKey,
      deliveryDetails,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutSession: result.checkoutSession,
      orders: result.orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Sipariş oluşturulurken hata meydana geldi." },
      { status: 500 }
    );
  }
}