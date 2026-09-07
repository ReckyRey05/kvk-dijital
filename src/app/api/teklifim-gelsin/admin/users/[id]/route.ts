import { NextResponse } from "next/server";
import { verifyAdminWithPermission, getUserDetailForAdmin } from "@/lib/teklifimGelsin/adminOperationsService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminWithPermission(req, "users.read");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const detail = await getUserDetailForAdmin(id);

    if (!detail) {
      return NextResponse.json({ error: "Kullanici bulunamadi." }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...detail });
  } catch (err: any) {
    console.error("Admin get user detail error:", err);
    return NextResponse.json({ error: "Kullanici detaylari alinamadi." }, { status: 500 });
  }
}
