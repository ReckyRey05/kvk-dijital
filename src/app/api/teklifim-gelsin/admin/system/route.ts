import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  getAdminSystemHealth,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "system.view");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const health = await getAdminSystemHealth();
    return NextResponse.json({ success: true, health });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Sistem saglik bilgisi alinirken hata olustu." },
      { status: 500 }
    );
  }
}
