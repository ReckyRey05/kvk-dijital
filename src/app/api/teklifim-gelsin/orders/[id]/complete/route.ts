import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { completeTeklifimOrder } from "@/lib/teklifimGelsin/teklifimService";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const order = await completeTeklifimOrder(id, user.uid);

    return NextResponse.json({
      success: true,
      order,
      message: "Sipariş başarıyla tamamlandı.",
    });
  } catch (err: any) {
    console.error("Teklifim complete order error:", err);
    return NextResponse.json(
      { error: err.message || "Sipariş tamamlanırken bir hata oluştu." },
      { status: 400 }
    );
  }
}
