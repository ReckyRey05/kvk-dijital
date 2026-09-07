import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  getAdminPlatformSettings,
  updateAdminPlatformSettings,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "settings.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await getAdminPlatformSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Platform ayarlari alinirken hata olustu." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "settings.manage");
    if (!auth.authorized || !auth.user || !auth.role) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Gecersiz ayar verisi." }, { status: 400 });
    }

    const updated = await updateAdminPlatformSettings(auth.user, auth.role, body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Platform ayarlari guncellenirken hata olustu." },
      { status: 500 }
    );
  }
}
