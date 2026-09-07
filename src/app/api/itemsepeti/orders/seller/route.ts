import { NextRequest, NextResponse } from "next/server";
import { getSellerOrders } from "@/lib/itemsepeti/orderService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    const limit = Number(searchParams.get("limit")) || 20;

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: "sellerId parametresi zorunludur." },
        { status: 400 }
      );
    }

    const orders = await getSellerOrders(sellerId, { limit });
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Satıcı siparişleri getirilemedi." },
      { status: 500 }
    );
  }
}