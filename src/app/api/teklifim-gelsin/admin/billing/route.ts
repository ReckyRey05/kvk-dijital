import { NextRequest, NextResponse } from "next/server";
import { verifyAdminWithPermission } from "@/lib/teklifimGelsin/adminOperationsService";
import { getAdminSubscriptionAnalytics } from "@/lib/teklifimGelsin/subscriptionService";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rateLimit";
import { RATE_LIMITS } from "@/config/rateLimit";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "finance.view");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Rate Limiting: 60 admin req / min
    const rateCheck = checkRateLimit(`teklifim_admin:${auth.user?.uid ?? "unknown"}`, RATE_LIMITS.teklifim.admin);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck);
    }

    const analytics = await getAdminSubscriptionAnalytics();

    return NextResponse.json({
      success: true,
      ...analytics,
    });
  } catch (error: any) {
    return createSecureServerErrorResponse("AdminBillingAnalytics", error, "Abonelik analitiği alınırken hata oluştu.");
  }
}
