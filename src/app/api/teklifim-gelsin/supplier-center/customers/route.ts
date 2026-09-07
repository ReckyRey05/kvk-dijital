import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  getSupplierCustomers,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function GET(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const customers = await getSupplierCustomers(auth.user.uid);
    return NextResponse.json({ success: true, customers });
  } catch (err: any) {
    console.error("Get customers error:", err);
    return NextResponse.json(
      { error: err?.message || "Musteri listesi yuklenemedi." },
      { status: 500 }
    );
  }
}
