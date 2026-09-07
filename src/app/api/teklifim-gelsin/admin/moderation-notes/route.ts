import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  addModerationNote,
  getModerationNotes,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "moderation_notes.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType ve targetId zorunludur." },
        { status: 400 }
      );
    }

    const notes = await getModerationNotes(targetType, targetId);
    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Moderasyon notlari yuklenirken hata olustu." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "moderation_notes.manage");
    if (!auth.authorized || !auth.user || !auth.role) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { targetType, targetId, note } = body;

    if (!targetType || !targetId || !note || typeof note !== "string" || !note.trim()) {
      return NextResponse.json(
        { error: "targetType, targetId ve note zorunludur." },
        { status: 400 }
      );
    }

    const createdNote = await addModerationNote(
      auth.user,
      auth.role,
      targetType,
      targetId,
      note.trim()
    );

    return NextResponse.json({ success: true, note: createdNote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Moderasyon notu kaydedilirken hata olustu." },
      { status: 500 }
    );
  }
}
