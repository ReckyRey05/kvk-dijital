import { NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  listAdminDisputes,
} from "@/lib/teklifimGelsin/adminOperationsService";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "disputes.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const disputes = await listAdminDisputes(status || undefined);
    return NextResponse.json({ success: true, disputes, count: disputes.length });
  } catch (err: any) {
    console.error("Admin list disputes error:", err);
    return NextResponse.json({ error: "Uyusmazliklar alinamadi." }, { status: 500 });
  }
}
