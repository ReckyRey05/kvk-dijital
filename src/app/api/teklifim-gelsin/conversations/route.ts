import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserConversations,
  getOrCreateConversation,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const conversations = await getUserConversations(user.uid);
    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error("Teklifim get conversations error:", err);
    return NextResponse.json(
      { error: err.message || "Konuşmalar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { requestId, offerId } = body;

    if (!requestId || !offerId) {
      return NextResponse.json(
        { error: "requestId ve offerId parametreleri zorunludur." },
        { status: 400 }
      );
    }

    const conversation = await getOrCreateConversation(requestId, offerId, user.uid);
    return NextResponse.json({ conversation });
  } catch (err: any) {
    console.error("Teklifim start conversation error:", err);
    return NextResponse.json(
      { error: err.message || "Konuşma oluşturulurken bir hata oluştu." },
      { status: 400 }
    );
  }
}
