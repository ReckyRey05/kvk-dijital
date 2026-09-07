import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  getPriceLists,
  createPriceList,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function GET(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const priceLists = await getPriceLists(auth.user.uid);
    return NextResponse.json({ success: true, priceLists });
  } catch (err: any) {
    console.error("Get price lists error:", err);
    return NextResponse.json(
      { error: err?.message || "Fiyat listeleri yuklenemedi." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const priceList = await createPriceList(auth.user.uid, body);
    return NextResponse.json({ success: true, priceList }, { status: 201 });
  } catch (err: any) {
    console.error("Create price list error:", err);
    return NextResponse.json(
      { error: err?.message || "Fiyat listesi olusturulamadi." },
      { status: 400 }
    );
  }
}
