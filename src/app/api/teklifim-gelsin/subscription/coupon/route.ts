import { NextRequest, NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { applyCoupon } from "@/lib/teklifimGelsin/subscriptionService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erisim. Lutfen giris yapin." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code, planTier } = body;

    if (!code || !planTier) {
      return NextResponse.json(
        { error: "Kupon kodu ve plan bilgisi zorunludur." },
        { status: 400 }
      );
    }

    const result = await applyCoupon(code, user.uid, planTier);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error || "Kupon gecersiz." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      discount: result.discount,
      coupon: {
        code: result.coupon?.code,
        discountType: result.coupon?.discountType,
        discountValue: result.coupon?.discountValue,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Kupon kontrolu yapilirken hata olustu." },
      { status: 500 }
    );
  }
}
