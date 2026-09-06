import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getAgreementDetails,
  updateAgreementStatus,
} from "@/lib/teklifimGelsin/teklifimService";
import { TeklifimAgreementStatus } from "@/types/teklifimGelsin";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const agreement = await getAgreementDetails(id, user.uid);
    return NextResponse.json({ agreement });
  } catch (err: any) {
    console.error("Teklifim get agreement error:", err);
    return NextResponse.json(
      { error: err.message || "Anlaşma detayı alınırken bir hata oluştu." },
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

    const validStatuses: TeklifimAgreementStatus[] = [
      "agreement_reached",
      "preparing",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
      "disputed",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Geçersiz anlaşma durumu." },
        { status: 400 }
      );
    }

    const agreement = await updateAgreementStatus(id, user.uid, status, note);
    return NextResponse.json({
      success: true,
      agreement,
      message: "Anlaşma durumu başarıyla güncellendi.",
    });
  } catch (err: any) {
    console.error("Teklifim update agreement error:", err);
    return NextResponse.json(
      { error: err.message || "Anlaşma durumu güncellenirken bir hata oluştu." },
      { status: 400 }
    );
  }
}
