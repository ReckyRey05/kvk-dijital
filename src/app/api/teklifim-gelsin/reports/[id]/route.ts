import { NextResponse } from "next/server";
import { verifyTeklifimAdmin } from "@/lib/teklifimGelsin/teklifimAuth";
import { updateReportStatus } from "@/lib/teklifimGelsin/teklifimService";

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz işlem. Admin yetkisi gereklidir." }, { status: 403 });
    }

    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const { status, adminNotes } = body;

    if (!status) {
      return NextResponse.json({ error: "Durum belirtilmelidir." }, { status: 400 });
    }

    const updated = await updateReportStatus(id, status, adminNotes);
    return NextResponse.json({ success: true, report: updated });
  } catch (err: any) {
    console.error("Teklifim PUT report error:", err);
    return NextResponse.json(
      { error: err.message || "Şikayet durumu güncellenemedi." },
      { status: 400 }
    );
  }
}
