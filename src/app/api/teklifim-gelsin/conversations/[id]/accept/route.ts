import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getConversationDetails,
  acceptTeklifimOffer,
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

    const agreement = await acceptTeklifimOffer(conversation.offerId, user.uid);

    return NextResponse.json({
      success: true,
      agreement,
      message: "Teklif onaylandı ve resmi anlaşma oluşturuldu.",
    });
  } catch (err: any) {
    console.error("Teklifim accept offer error:", err);
    return NextResponse.json(
      { error: err.message || "Teklif kabul edilirken bir hata oluştu." },
      { status: 400 }
    );
  }
}
