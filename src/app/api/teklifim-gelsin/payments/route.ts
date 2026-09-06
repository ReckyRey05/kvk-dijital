import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  createOrderPaymentSession,
  getSupplierFinanceOverview,
  exportFinanceRecordsToCsv,
} from "@/lib/payments/paymentService";
import { TeklifimPayment } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // "buyer" | "supplier" | null
    const status = searchParams.get("status");
    const format = searchParams.get("format");

    const db = getAdminDb();
    const payments: TeklifimPayment[] = [];

    // Query for buyer payments
    if (!role || role === "buyer") {
      let q = db.collection("teklifim_payments").where("businessId", "==", user.uid);
      if (status && status !== "all") {
        q = q.where("status", "==", status);
      }
      const snap = await q.get();
      snap.docs.forEach((d) => payments.push(d.data() as TeklifimPayment));
    }

    // Query for supplier payments
    if (!role || role === "supplier") {
      let q = db.collection("teklifim_payments").where("supplierId", "==", user.uid);
      if (status && status !== "all") {
        q = q.where("status", "==", status);
      }
      const snap = await q.get();
      snap.docs.forEach((d) => {
        if (!payments.some((p) => p.id === d.id)) {
          payments.push(d.data() as TeklifimPayment);
        }
      });
    }

    // Sort by createdAt desc
    payments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (format === "csv") {
      const csv = exportFinanceRecordsToCsv(payments);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="odemelerim-${Date.now()}.csv"`,
        },
      });
    }

    let supplierOverview = null;
    if (role === "supplier") {
      supplierOverview = await getSupplierFinanceOverview(user.uid);
    }

    return NextResponse.json({ payments, supplierOverview });
  } catch (err: any) {
    console.error("Teklifim get payments error:", err);
    return NextResponse.json(
      { error: err.message || "Ödeme kayıtları alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, idempotencyKey, callbackUrl, providerName } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId parametresi zorunludur." }, { status: 400 });
    }

    // Generate fallback idempotencyKey if not provided
    const finalKey = idempotencyKey || `idemp_${orderId}_${user.uid}_${Date.now()}`;

    const result = await createOrderPaymentSession(orderId, user.uid, finalKey, {
      callbackUrl,
      providerName,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Teklifim create payment session error:", err);
    return NextResponse.json(
      { error: err.message || "Ödeme oturumu oluşturulamadı." },
      { status: 400 }
    );
  }
}
