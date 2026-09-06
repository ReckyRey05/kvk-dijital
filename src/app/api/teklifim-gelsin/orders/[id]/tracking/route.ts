import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { addTeklifimOrderTracking } from "@/lib/teklifimGelsin/teklifimService";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { carrier, trackingNumber, trackingUrl } = body;

    if (!carrier || !trackingNumber) {
      return NextResponse.json(
        { error: "Kargo firması ve takip numarası alanları zorunludur." },
        { status: 400 }
      );
    }

    const order = await addTeklifimOrderTracking(id, user.uid, {
      carrier,
      trackingNumber,
      trackingUrl,
    });

    return NextResponse.json({
      success: true,
      order,
      message: "Kargo takip bilgileri başarıyla eklendi.",
    });
  } catch (err: any) {
    console.error("Teklifim add tracking error:", err);
    return NextResponse.json(
      { error: err.message || "Kargo bilgisi kaydedilirken bir hata oluştu." },
      { status: 400 }
    );
  }
}
