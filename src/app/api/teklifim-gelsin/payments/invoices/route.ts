import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import { saveCommercialInvoice } from "@/lib/payments/paymentService";
import { TeklifimInvoice } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId parametresi zorunludur." }, { status: 400 });
    }

    const db = getAdminDb();
    const snap = await db
      .collection("teklifim_invoices")
      .where("orderId", "==", orderId)
      .get();

    const invoices: TeklifimInvoice[] = [];
    snap.docs.forEach((d) => {
      const inv = d.data() as TeklifimInvoice;
      if (inv.businessId === user.uid || inv.supplierId === user.uid || user.role === "admin") {
        invoices.push(inv);
      }
    });

    return NextResponse.json({ invoices });
  } catch (err: any) {
    console.error("Teklifim get invoices error:", err);
    return NextResponse.json(
      { error: err.message || "Fatura kayıtları alınamadı." },
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
    const { orderId, invoiceNumber, amount, currency, fileUrl, fileName, fileSize, mimeType, notes } = body;

    if (!orderId || !invoiceNumber || !fileUrl) {
      return NextResponse.json(
        { error: "orderId, invoiceNumber ve fileUrl parametreleri zorunludur." },
        { status: 400 }
      );
    }

    const invoice = await saveCommercialInvoice(orderId, user.uid, {
      invoiceNumber: invoiceNumber.trim(),
      amount: Number(amount) || 0,
      currency: currency || "TRY",
      fileUrl,
      fileName: fileName || "fatura.pdf",
      fileSize: Number(fileSize) || 1024,
      mimeType: mimeType || "application/pdf",
      notes,
    });

    return NextResponse.json({ success: true, invoice });
  } catch (err: any) {
    console.error("Teklifim save invoice error:", err);
    return NextResponse.json(
      { error: err.message || "Fatura kaydedilemedi." },
      { status: 400 }
    );
  }
}
