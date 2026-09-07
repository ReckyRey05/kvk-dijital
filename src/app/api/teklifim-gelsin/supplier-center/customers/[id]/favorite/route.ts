import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  toggleFavoriteCustomer,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const isFavorite = await toggleFavoriteCustomer(auth.user.uid, id);

    return NextResponse.json({
      success: true,
      customerId: id,
      isFavorite,
      message: isFavorite
        ? "Musteri favorilere eklendi."
        : "Musteri favorilerden cikarildi.",
    });
  } catch (err: any) {
    console.error("Toggle customer favorite error:", err);
    return NextResponse.json(
      { error: err?.message || "Favori islemi basarisiz oldu." },
      { status: 400 }
    );
  }
}
