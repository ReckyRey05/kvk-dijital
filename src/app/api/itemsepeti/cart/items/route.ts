import { NextRequest, NextResponse } from "next/server";
import { addToCart, mergeGuestCart } from "@/lib/itemsepeti/cartService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buyerId, listingId, quantity = 1, guestItems, action } = body;

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "buyerId alanı zorunludur." },
        { status: 400 }
      );
    }

    // Guest cart merge action
    if (action === "merge" && Array.isArray(guestItems)) {
      const mergedCart = await mergeGuestCart(buyerId, guestItems);
      return NextResponse.json({ success: true, cart: mergedCart });
    }

    // Standard add to cart
    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "listingId alanı zorunludur." },
        { status: 400 }
      );
    }

    const result = await addToCart(buyerId, listingId, Number(quantity) || 1);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, cart: result.cart });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Ürün sepete eklenirken hata oluştu." },
      { status: 500 }
    );
  }
}