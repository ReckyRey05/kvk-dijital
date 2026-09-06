import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { processOrderRefund } from "@/lib/payments/paymentService";
import { getAdminDb } from "@/lib/firebase/admin";
import { TeklifimPayment } from "@/types/teklifimGelsin";

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
    const { amount, reason } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Geçerli bir iade tutarı belirtilmelidir." }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "İade gerekçesi zorunludur." }, { status: 400 });
    }

    // Find payment to get orderId
    const db = getAdminDb();
    const payDoc = await db.collection("teklifim_payments").doc(id).get();
    if (!payDoc.exists) {
      return NextResponse.json({ error: "Ödeme kaydı bulunamadı." }, { status: 404 });
    }

    const payment = payDoc.data() as TeklifimPayment;
    const result = await processOrderRefund(payment.orderId, user.uid, Number(amount), reason.trim());

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Teklifim refund error:", err);
    return NextResponse.json(
      { error: err.message || "İade işlemi gerçekleştirilemedi." },
      { status: 400 }
    );
  }
}
