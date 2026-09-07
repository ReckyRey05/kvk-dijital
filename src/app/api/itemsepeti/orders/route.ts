import { NextRequest, NextResponse } from "next/server";
import { getBuyerOrders } from "@/lib/itemsepeti/orderService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const limit = Number(searchParams.get("limit")) || 20;

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "buyerId parametresi zorunludur." },
        { status: 400 }
      );
    }

    const orders = await getBuyerOrders(buyerId, { limit });
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Siparişler getirilemedi." },
      { status: 500 }
    );
  }
}