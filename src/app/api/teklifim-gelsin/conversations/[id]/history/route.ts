import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getConversationDetails,
  getOfferVersionHistory,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
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

    const versions = await getOfferVersionHistory(conversation.offerId, user.uid);
    return NextResponse.json({ versions });
  } catch (err: any) {
    console.error("Teklifim get history error:", err);
    return NextResponse.json(
      { error: err.message || "Teklif geçmişi alınırken bir hata oluştu." },
      { status: 400 }
    );
  }
}
