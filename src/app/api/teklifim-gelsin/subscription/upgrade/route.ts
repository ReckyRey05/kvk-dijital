import { NextRequest, NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  upgradeSubscription,
  downgradeSubscription,
} from "@/lib/teklifimGelsin/subscriptionService";

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
    const { targetPlanId, interval, action } = body;

    if (!targetPlanId) {
      return NextResponse.json(
        { error: "targetPlanId zorunludur." },
        { status: 400 }
      );
    }

    if (action === "downgrade") {
      const res = await downgradeSubscription(user, targetPlanId);
      return NextResponse.json({
        success: true,
        ...res,
      });
    }

    const updated = await upgradeSubscription(user, targetPlanId, interval);
    return NextResponse.json({
      success: true,
      subscription: updated,
      message: "Planiniz basariyla yukseltildi.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Plan degisikligi sirasinda hata olustu." },
      { status: 400 }
    );
  }
}
