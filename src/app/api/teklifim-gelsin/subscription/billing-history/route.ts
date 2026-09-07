import { NextRequest, NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { listUserBillingRecords } from "@/lib/teklifimGelsin/subscriptionService";

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

    const records = await listUserBillingRecords(user.uid);

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Fatura gecmisi alinirken hata olustu." },
      { status: 500 }
    );
  }
}
