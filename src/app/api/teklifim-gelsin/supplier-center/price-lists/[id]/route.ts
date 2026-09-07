import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  updatePriceList,
  deletePriceList,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    await updatePriceList(id, auth.user.uid, body);

    return NextResponse.json({ success: true, message: "Fiyat listesi guncellendi." });
  } catch (err: any) {
    console.error("Update price list error:", err);
    return NextResponse.json(
      { error: err?.message || "Fiyat listesi guncellenemedi." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    await deletePriceList(id, auth.user.uid);

    return NextResponse.json({ success: true, message: "Fiyat listesi silindi." });
  } catch (err: any) {
    console.error("Delete price list error:", err);
    return NextResponse.json(
      { error: err?.message || "Fiyat listesi silinemedi." },
      { status: 400 }
    );
  }
}
