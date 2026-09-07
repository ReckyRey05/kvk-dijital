import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  getSupplierOpportunities,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function GET(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const opportunities = await getSupplierOpportunities(auth.user.uid);
    return NextResponse.json({ success: true, opportunities });
  } catch (err: any) {
    console.error("Supplier opportunities error:", err);
    return NextResponse.json(
      { error: err?.message || "Firsatlar yuklenemedi." },
      { status: 500 }
    );
  }
}
