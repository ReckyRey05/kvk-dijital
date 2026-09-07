import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  getSupplierDashboardOverview,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function GET(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const data = await getSupplierDashboardOverview(auth.user.uid);
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    console.error("Supplier center dashboard error:", err);
    return NextResponse.json(
      { error: err?.message || "Sunucu hatasi olustu." },
      { status: 500 }
    );
  }
}
