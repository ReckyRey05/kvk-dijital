import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { disputeTeklifimOrder } from "@/lib/teklifimGelsin/teklifimService";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { reason, description } = body;

    if (!reason || !description) {
      return NextResponse.json(
        { error: "Anlaşmazlık nedeni ve detaylı açıklama zorunludur." },
        { status: 400 }
      );
    }

    const order = await disputeTeklifimOrder(id, user.uid, { reason, description });

    return NextResponse.json({
      success: true,
      order,
      message: "Anlaşmazlık başarıyla bildirildi ve incelemeye alındı.",
    });
  } catch (err: any) {
    console.error("Teklifim dispute order error:", err);
    return NextResponse.json(
      { error: err.message || "Anlaşmazlık bildirilirken bir hata oluştu." },
      { status: 400 }
    );
  }
}
