import { NextRequest, NextResponse } from "next/server";
import { verifyAdminWithPermission } from "@/lib/teklifimGelsin/adminOperationsService";
import { getAdminSubscriptionAnalytics } from "@/lib/teklifimGelsin/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "finance.view");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const analytics = await getAdminSubscriptionAnalytics();

    return NextResponse.json({
      success: true,
      ...analytics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Abonelik analitigi alinirken hata olustu." },
      { status: 500 }
    );
  }
}
