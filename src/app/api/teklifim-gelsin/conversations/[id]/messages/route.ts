import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getConversationMessages,
  markMessagesAsRead,
  sendTeklifimMessage,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const messages = await getConversationMessages(conversationId, user.uid);
    // Mark as read in background/async
    markMessagesAsRead(conversationId, user.uid).catch((e) =>
      console.warn("markMessagesAsRead error:", e)
    );

    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error("Teklifim get messages error:", err);
    return NextResponse.json(
      { error: err.message || "Mesajlar alınırken bir hata oluştu." },
      { status: 400 }
    );
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { content, type, attachment, counterOfferData } = body;

    if (!content && !attachment && !counterOfferData) {
      return NextResponse.json(
        { error: "Mesaj içeriği veya dosya eki zorunludur." },
        { status: 400 }
      );
    }

    const message = await sendTeklifimMessage(conversationId, user.uid, {
      content: content || "",
      type: type || (attachment ? "text" : "text"),
      attachment,
      counterOfferData,
    });

    return NextResponse.json({ message });
  } catch (err: any) {
    console.error("Teklifim send message error:", err);
    return NextResponse.json(
      { error: err.message || "Mesaj gönderilirken bir hata oluştu." },
      { status: 400 }
    );
  }
}
