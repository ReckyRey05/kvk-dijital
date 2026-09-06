import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { selectTeklifimOffer } from "@/lib/teklifimGelsin/teklifimService";

export async function POST(req: Request, props: { params: Promise<{ offerId: string }> }) {
  try {
    const { offerId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Talep ID zorunludur." }, { status: 400 });
    }

    const success = await selectTeklifimOffer(requestId, offerId, user.uid);
    if (!success) {
      return NextResponse.json({ error: "Teklif seçilemedi veya yetkiniz yok." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Tedarikçi başarıyla seçildi." });
  } catch (err: any) {
    console.error("Teklifim select offer error:", err);
    return NextResponse.json({ error: "İşlem sırasında bir hata oluştu." }, { status: 500 });
  }
}
