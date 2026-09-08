import { NextRequest, NextResponse } from "next/server";
import { validateAndApplyCoupon } from "@/lib/itemsepeti/couponService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponCode, orderTotal, buyerId } = body;

    if (!couponCode || orderTotal === undefined) {
      return NextResponse.json(
        { success: false, error: "Kupon kodu ve sipariş tutarı zorunludur." },
        { status: 400 }
      );
    }

    const result = await validateAndApplyCoupon({
      couponCode,
      orderTotal: Number(orderTotal),
      buyerId: buyerId || "anonymous_buyer",
    });

    if (!result.isValid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      discountAmount: result.discountAmount,
      finalTotal: result.finalTotal,
      coupon: result.coupon,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Kupon doğrulanamadı." },
      { status: 500 }
    );
  }
}
