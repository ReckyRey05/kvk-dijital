import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getTeklifimOrderDetails,
  updateTeklifimOrderStatus,
} from "@/lib/teklifimGelsin/teklifimService";
import { TeklifimOrderStatus } from "@/types/teklifimGelsin";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const order = await getTeklifimOrderDetails(id, user.uid);
    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("Teklifim get order error:", err);
    return NextResponse.json(
      { error: err.message || "Sipariş detayları alınamadı." },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { status, note } = body;

    const validStatuses: TeklifimOrderStatus[] = [
      "preparing",
      "ready_for_dispatch",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
      "disputed",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Geçersiz sipariş durumu." }, { status: 400 });
    }

    const order = await updateTeklifimOrderStatus(id, user.uid, status, note);
    return NextResponse.json({
      success: true,
      order,
      message: "Sipariş durumu başarıyla güncellendi.",
    });
  } catch (err: any) {
    console.error("Teklifim update order status error:", err);
    return NextResponse.json(
      { error: err.message || "Sipariş durumu güncellenirken hata oluştu." },
      { status: 400 }
    );
  }
}
