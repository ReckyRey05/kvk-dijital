import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  listAdminAnnouncements,
  createAdminAnnouncement,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "announcements.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const announcements = await listAdminAnnouncements();
    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Duyurular alinirken hata olustu." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "announcements.manage");
    if (!auth.authorized || !auth.user || !auth.role) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { title, content, targetRole, channel, status } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "title ve content alanlari zorunludur." },
        { status: 400 }
      );
    }

    const announcement = await createAdminAnnouncement(auth.user, auth.role, {
      title,
      content,
      targetRole,
      channel,
      status,
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Duyuru olusturulurken hata olustu." },
      { status: 500 }
    );
  }
}
