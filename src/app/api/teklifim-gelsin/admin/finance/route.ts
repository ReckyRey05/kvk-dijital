import { NextResponse } from "next/server";
import { verifyTeklifimAdmin } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getAdminFinanceOverview,
  exportFinanceRecordsToCsv,
} from "@/lib/payments/paymentService";
import { TeklifimPayment } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz erişim. Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const status = searchParams.get("status");

    const db = getAdminDb();
    let q = db.collection("teklifim_payments").orderBy("createdAt", "desc");
    if (status && status !== "all") {
      q = db.collection("teklifim_payments").where("status", "==", status).orderBy("createdAt", "desc");
    }

    const snap = await q.get();
    const payments: TeklifimPayment[] = snap.docs.map((d) => d.data() as TeklifimPayment);

    // If CSV format requested, return CSV file attachment
    if (format === "csv") {
      const csv = exportFinanceRecordsToCsv(payments);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="toptancim-finans-raporu-${Date.now()}.csv"`,
        },
      });
    }

    const metrics = await getAdminFinanceOverview();
    return NextResponse.json({ metrics, payments });
  } catch (err: any) {
    console.error("Admin finance error:", err);
    return NextResponse.json(
      { error: err.message || "Finans verileri alınamadı." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz erişim. Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { paymentId, payoutStatus, payoutReference } = body;

    if (!paymentId || !payoutStatus) {
      return NextResponse.json(
        { error: "paymentId ve payoutStatus parametreleri zorunludur." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const payDoc = await db.collection("teklifim_payments").doc(paymentId).get();
    if (!payDoc.exists) {
      return NextResponse.json({ error: "Ödeme kaydı bulunamadı." }, { status: 404 });
    }

    const now = Date.now();
    const updateData: any = {
      payoutStatus,
      updatedAt: now,
    };

    if (payoutStatus === "payout_completed") {
      updateData.payoutCompletedAt = now;
      if (payoutReference) updateData.payoutReference = payoutReference;
    }

    await payDoc.ref.update(updateData);
    return NextResponse.json({ success: true, message: "Hakediş durumu güncellendi." });
  } catch (err: any) {
    console.error("Admin update payout error:", err);
    return NextResponse.json(
      { error: err.message || "Hakediş güncellenemedi." },
      { status: 400 }
    );
  }
}
