import { NextResponse } from "next/server";
import { verifyTeklifimUser, verifyTeklifimAdmin } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  createTeklifimReport,
  getAllReports,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz işlem. Admin yetkisi gereklidir." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const reports = await getAllReports(status);

    return NextResponse.json({ reports });
  } catch (err: any) {
    console.error("Teklifim GET reports error:", err);
    return NextResponse.json({ error: "Şikayetler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { targetId, targetType, targetName, reason, description, reporterRole } = body;

    if (!targetId || !targetType) {
      return NextResponse.json({ error: "Şikayet edilen hedef belirtilmelidir." }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: "Lütfen bir şikayet nedeni seçin." }, { status: 400 });
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ error: "Lütfen şikayet gerekçenizi kısaca açıklayın." }, { status: 400 });
    }

    const report = await createTeklifimReport(user.uid, user.email, {
      targetId,
      targetType,
      targetName,
      reason,
      description: description.trim(),
      reporterRole,
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error("Teklifim POST report error:", err);
    return NextResponse.json(
      { error: err.message || "Şikayet bildirimi kaydedilemedi." },
      { status: 400 }
    );
  }
}
