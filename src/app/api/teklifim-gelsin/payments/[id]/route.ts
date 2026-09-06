import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAndProcessPayment } from "@/lib/payments/paymentService";
import { TeklifimPayment } from "@/types/teklifimGelsin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { id } = await params;
    const db = getAdminDb();
    const doc = await db.collection("teklifim_payments").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Ödeme kaydı bulunamadı." }, { status: 404 });
    }

    const payment = doc.data() as TeklifimPayment;
    if (
      payment.businessId !== user.uid &&
      payment.supplierId !== user.uid &&
      user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Bu ödemeyi görüntüleme yetkiniz yok." }, { status: 403 });
    }

    return NextResponse.json({ payment });
  } catch (err: any) {
    console.error("Teklifim get payment details error:", err);
    return NextResponse.json(
      { error: err.message || "Ödeme detayı alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const payment = await verifyAndProcessPayment(id, user.uid, body);
    return NextResponse.json({ success: true, payment });
  } catch (err: any) {
    console.error("Teklifim verify payment error:", err);
    return NextResponse.json(
      { error: err.message || "Ödeme doğrulanamadı." },
      { status: 400 }
    );
  }
}
