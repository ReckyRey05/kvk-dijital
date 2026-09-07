import { NextRequest, NextResponse } from "next/server";
import { getPlansList } from "@/lib/teklifimGelsin/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const plans = await getPlansList(false);
    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Plan listesi alinirken hata olustu." },
      { status: 500 }
    );
  }
}
