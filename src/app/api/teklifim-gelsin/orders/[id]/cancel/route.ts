import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { cancelTeklifimOrder } from "@/lib/teklifimGelsin/teklifimService";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { reason, note } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Lütfen bir iptal gerekçesi belirtin." }, { status: 400 });
    }

    const order = await cancelTeklifimOrder(id, user.uid, { reason, note });

    return NextResponse.json({
      success: true,
      order,
      message: "Sipariş başarıyla iptal edildi.",
    });
  } catch (err: any) {
    console.error("Teklifim cancel order error:", err);
    return NextResponse.json(
      { error: err.message || "Sipariş iptal edilirken bir hata oluştu." },
      { status: 400 }
    );
  }
}
