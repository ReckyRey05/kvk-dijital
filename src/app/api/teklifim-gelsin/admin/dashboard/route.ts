import { NextResponse } from "next/server";
import { verifyAdminWithPermission, getAdminDashboardSummary } from "@/lib/teklifimGelsin/adminOperationsService";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "system.view");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const summary = await getAdminDashboardSummary();
    return NextResponse.json({ success: true, summary, role: auth.role });
  } catch (err: any) {
    console.error("Admin dashboard summary error:", err);
    return NextResponse.json({ error: "Dashboard verileri alinamadi." }, { status: 500 });
  }
}
