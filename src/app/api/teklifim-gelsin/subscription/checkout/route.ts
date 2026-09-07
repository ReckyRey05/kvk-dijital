import { NextRequest, NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { createSubscriptionCheckout } from "@/lib/teklifimGelsin/subscriptionService";

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
    const { planId, interval, couponCode, idempotencyKey } = body;

    if (!planId || !interval) {
      return NextResponse.json(
        { error: "planId ve interval ('monthly' veya 'yearly') zorunludur." },
        { status: 400 }
      );
    }

    const result = await createSubscriptionCheckout(
      user,
      planId,
      interval,
      couponCode,
      idempotencyKey
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Odeme oturumu olusturulurken hata olustu." },
      { status: 400 }
    );
  }
}
