import { NextRequest, NextResponse } from "next/server";
import { getCart, clearCart } from "@/lib/itemsepeti/cartService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "buyerId parametresi gereklidir." },
        { status: 400 }
      );
    }

    const cart = await getCart(buyerId);
    return NextResponse.json({ success: true, cart });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Sepet yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "buyerId parametresi gereklidir." },
        { status: 400 }
      );
    }

    await clearCart(buyerId);
    return NextResponse.json({ success: true, message: "Sepet temizlendi." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Sepet temizlenirken hata oluştu." },
      { status: 500 }
    );
  }
}