import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  replySupportTicket,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminWithPermission(req, "support.manage");
    if (!auth.authorized || !auth.user || !auth.role) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    const { message, newStatus, internalNote } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Yanit mesaji bos olamaz." },
        { status: 400 }
      );
    }

    await replySupportTicket(
      auth.user,
      auth.role,
      id,
      message.trim(),
      newStatus,
      internalNote
    );

    return NextResponse.json({ success: true, message: "Yanit basariyla iletildi." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Destek talebine yanit verilirken hata olustu." },
      { status: 500 }
    );
  }
}
