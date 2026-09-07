import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  performGlobalAdminSearch,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "users.read");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({
        success: true,
        results: { orders: [], payments: [], users: [], products: [], requests: [] },
      });
    }

    const results = await performGlobalAdminSearch(q);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Arama yapilirken hata olustu." },
      { status: 500 }
    );
  }
}
