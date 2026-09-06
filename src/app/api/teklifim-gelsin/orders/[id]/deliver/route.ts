import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { confirmTeklifimOrderDelivery } from "@/lib/teklifimGelsin/teklifimService";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { receivedBy, proofNote, proofPhotoUrl } = body;

    if (!receivedBy || !receivedBy.trim()) {
      return NextResponse.json(
        { error: "Teslim alan kişi adı belirtilmelidir." },
        { status: 400 }
      );
    }

    const order = await confirmTeklifimOrderDelivery(id, user.uid, {
      receivedBy,
      proofNote,
      proofPhotoUrl,
    });

    return NextResponse.json({
      success: true,
      order,
      message: "Sipariş teslim alındı olarak onaylandı.",
    });
  } catch (err: any) {
    console.error("Teklifim confirm delivery error:", err);
    return NextResponse.json(
      { error: err.message || "Teslim alma işlemi sırasında hata oluştu." },
      { status: 400 }
    );
  }
}
