import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getConversationDetails,
  submitCounterOffer,
} from "@/lib/teklifimGelsin/teklifimService";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { conversation } = await getConversationDetails(conversationId, user.uid);
    if (!conversation) {
      return NextResponse.json({ error: "Konuşma bulunamadı." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { price, unitPrice, deliveryDays, quantity, note } = body;

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Geçerli bir teklif tutarı belirtilmelidir." }, { status: 400 });
    }

    const result = await submitCounterOffer(conversation.offerId, user.uid, {
      price: Number(price),
      unitPrice: unitPrice ? Number(unitPrice) : undefined,
      deliveryDays: Number(deliveryDays) || 5,
      quantity: quantity ? Number(quantity) : undefined,
      note,
    });

    return NextResponse.json({
      success: true,
      version: result.version,
      message: result.message,
    });
  } catch (err: any) {
    console.error("Teklifim counter offer error:", err);
    return NextResponse.json(
      { error: err.message || "Karşı teklif iletilirken bir hata oluştu." },
      { status: 400 }
    );
  }
}
