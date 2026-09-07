import { NextRequest, NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { startTrial } from "@/lib/teklifimGelsin/subscriptionService";

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
    const planTier = body.planTier || (user.role === "supplier" ? "supplier" : "business");

    const subscription = await startTrial(user, planTier);

    return NextResponse.json({
      success: true,
      subscription,
      message: "14 gunluk ucretsiz deneme sureniz baslatildi.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Deneme suresi baslatilirken hata olustu." },
      { status: 400 }
    );
  }
}
