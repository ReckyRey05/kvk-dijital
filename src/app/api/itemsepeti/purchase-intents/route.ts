import { NextRequest, NextResponse } from "next/server";
import { createPurchaseIntent } from "@/lib/itemsepeti/catalogService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check authorization header or buyerId
    const authHeader = req.headers.get("Authorization");
    const buyerId = authHeader ? authHeader.replace("Bearer ", "").trim() : body.buyerId;

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "Satın alma işlemine devam etmek için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const { listingId, quantity } = body;
    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "İlan ID gereklidir." },
        { status: 400 }
      );
    }

    const result = await createPurchaseIntent({
      buyerId,
      listingId,
      quantity: Number(quantity || 1),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, intent: result.intent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Satın alma niyeti oluşturulamadı." },
      { status: 500 }
    );
  }
}
