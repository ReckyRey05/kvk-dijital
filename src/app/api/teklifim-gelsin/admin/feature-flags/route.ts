import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  getAdminFeatureFlags,
  updateAdminFeatureFlag,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "feature_flags.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const flags = await getAdminFeatureFlags();
    return NextResponse.json({ success: true, flags });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Ozellik bayraklari alinirken hata olustu." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "feature_flags.manage");
    if (!auth.authorized || !auth.user || !auth.role) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { key, enabled } = body;

    if (!key || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "key ve boolean enabled degeri zorunludur." },
        { status: 400 }
      );
    }

    const updated = await updateAdminFeatureFlag(auth.user, auth.role, key, enabled);
    return NextResponse.json({ success: true, flag: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Ozellik bayragi guncellenirken hata olustu." },
      { status: 500 }
    );
  }
}
