import { NextResponse } from "next/server";
import { verifyAdminWithPermission, listAdminUsers } from "@/lib/teklifimGelsin/adminOperationsService";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "users.read");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const users = await listAdminUsers({ role, status, search, limit });
    return NextResponse.json({ success: true, users, count: users.length });
  } catch (err: any) {
    console.error("Admin list users error:", err);
    return NextResponse.json({ error: "Kullanicilar getirilemedi." }, { status: 500 });
  }
}
