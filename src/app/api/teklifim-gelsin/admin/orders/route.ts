import { NextResponse } from "next/server";
import { verifyTeklifimAdmin } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getAllTeklifimOrdersForAdmin,
  resolveTeklifimOrderDispute,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz işlem. Admin yetkisi gereklidir." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const orders = await getAllTeklifimOrdersForAdmin(status);
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Admin get orders error:", err);
    return NextResponse.json(
      { error: err.message || "Siparişler alınamadı." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz işlem. Admin yetkisi gereklidir." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, status, resolutionNotes } = body;

    if (!orderId || !status || !resolutionNotes) {
      return NextResponse.json(
        { error: "orderId, status ve resolutionNotes alanları zorunludur." },
        { status: 400 }
      );
    }

    const order = await resolveTeklifimOrderDispute(orderId, admin.uid, {
      status,
      resolutionNotes,
    });

    return NextResponse.json({
      success: true,
      order,
      message: "Anlaşmazlık yönetici tarafından başarıyla karara bağlandı.",
    });
  } catch (err: any) {
    console.error("Admin resolve dispute error:", err);
    return NextResponse.json(
      { error: err.message || "Anlaşmazlık çözümlenirken hata oluştu." },
      { status: 400 }
    );
  }
}
