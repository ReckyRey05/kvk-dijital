import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  listAdminAuditLogs,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "audit.view");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const adminEmail = searchParams.get("adminEmail") || undefined;
    const action = searchParams.get("action") || undefined;
    const targetType = searchParams.get("targetType") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 100;

    const logs = await listAdminAuditLogs({
      adminEmail,
      action,
      targetType,
      limit,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Audit loglari alinirken hata olustu." },
      { status: 500 }
    );
  }
}
