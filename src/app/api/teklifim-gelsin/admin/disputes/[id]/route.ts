import { NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  resolveAdminDispute,
} from "@/lib/teklifimGelsin/adminOperationsService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminWithPermission(req, "disputes.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    const { outcome, notes, refundAmount } = body;

    if (!outcome || !notes) {
      return NextResponse.json({ error: "outcome ve notes zorunludur." }, { status: 400 });
    }

    await resolveAdminDispute(auth.user!, auth.role!, id, outcome, notes, refundAmount);
    return NextResponse.json({ success: true, message: "Uyusmazlik karara baglandi." });
  } catch (err: any) {
    console.error("Admin resolve dispute error:", err);
    return NextResponse.json({ error: err.message || "Uyusmazlik cozumlenemedi." }, { status: 500 });
  }
}
