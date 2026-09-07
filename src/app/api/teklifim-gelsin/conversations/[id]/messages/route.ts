import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getConversationMessages,
  markMessagesAsRead,
  sendTeklifimMessage,
} from "@/lib/teklifimGelsin/teklifimService";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rateLimit";
import { RATE_LIMITS } from "@/config/rateLimit";
import { sanitizeSafeString } from "@/lib/teklifimGelsin/security/inputValidation";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

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

    // Rate Limiting: 20 msg / min strictly enforced
    const rateCheck = checkRateLimit(`teklifim_msg:${user.uid}`, RATE_LIMITS.teklifim.messaging);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck);
    }

    const body = await req.json().catch(() => ({}));
    const { content, type, attachment, counterOfferData } = body;

    if (!content && !attachment && !counterOfferData) {
      return NextResponse.json(
        { error: "Mesaj içeriği veya dosya eki zorunludur." },
        { status: 400 }
      );
    }

    const safeContent = content ? sanitizeSafeString(content, 5000) : "";

    const message = await sendTeklifimMessage(conversationId, user.uid, {
      content: safeContent,
      type: type || (attachment ? "text" : "text"),
      attachment,
      counterOfferData,
    });

    return NextResponse.json({ message });
  } catch (err: any) {
    console.error("Teklifim send message error:", err);
    if (err.message && (err.message.includes("yetkiniz") || err.message.includes("engellen"))) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return createSecureServerErrorResponse("SendMessage", err, "Mesaj gönderilirken bir hata oluştu.");
  }
}
