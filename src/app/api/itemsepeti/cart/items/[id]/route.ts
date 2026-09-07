import { NextRequest, NextResponse } from "next/server";
import { updateCartItemQuantity, removeCartItem } from "@/lib/itemsepeti/cartService";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const body = await req.json();
    const { buyerId, quantity } = body;

    if (!buyerId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "buyerId ve quantity alanları zorunludur." },
        { status: 400 }
      );
    }

    const result = await updateCartItemQuantity(buyerId, listingId, Number(quantity));
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, cart: result.cart });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Sepet güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "buyerId parametresi zorunludur." },
        { status: 400 }
      );
    }

    const result = await removeCartItem(buyerId, listingId);
    return NextResponse.json({ success: true, cart: result.cart });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Ürün sepetten silinirken hata oluştu." },
      { status: 500 }
    );
  }
}