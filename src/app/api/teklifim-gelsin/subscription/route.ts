import { NextRequest, NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserSubscription,
  getUserUsage,
  getPlanByIdOrTier,
} from "@/lib/teklifimGelsin/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erisim. Lutfen giris yapin." },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(user.uid);
    const usage = await getUserUsage(user.uid);
    const plan = await getPlanByIdOrTier(subscription.planId);

    return NextResponse.json({
      success: true,
      subscription,
      usage,
      plan,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Abonelik bilgileri alinirken hata olustu." },
      { status: 500 }
    );
  }
}
