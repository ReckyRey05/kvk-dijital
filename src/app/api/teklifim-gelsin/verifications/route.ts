import { NextResponse } from "next/server";
import { verifyTeklifimUser, verifyTeklifimAdmin } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  submitVerificationRequest,
  getSupplierVerificationStatus,
  getAllVerificationRequests,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    // Admin mode: list all applications
    if (mode === "admin") {
      const admin = await verifyTeklifimAdmin(req);
      if (!admin) {
        return NextResponse.json({ error: "Yetkisiz işlem. Admin yetkisi gereklidir." }, { status: 403 });
      }

      const status = searchParams.get("status") || "all";
      const requests = await getAllVerificationRequests(status);
      return NextResponse.json({ requests });
    }

    // Supplier mode: get own application status
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const verification = await getSupplierVerificationStatus(user.uid);
    return NextResponse.json({ verification });
  } catch (err: any) {
    console.error("Teklifim GET verifications error:", err);
    return NextResponse.json({ error: "Başvuru bilgileri alınamadı." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { legalTitle, taxNumber, taxOffice, tradeRegistryNumber, documentUrl, notes } = body;

    if (!legalTitle || !legalTitle.trim()) {
      return NextResponse.json({ error: "Lütfen resmi şirket unvanınızı belirtin." }, { status: 400 });
    }
    if (!taxNumber || !taxNumber.trim()) {
      return NextResponse.json({ error: "Lütfen vergi kimlik veya TC numaranızı belirtin." }, { status: 400 });
    }
    if (!taxOffice || !taxOffice.trim()) {
      return NextResponse.json({ error: "Lütfen bağlı olduğunuz vergi dairesini belirtin." }, { status: 400 });
    }

    const verification = await submitVerificationRequest(user.uid, {
      legalTitle: legalTitle.trim(),
      taxNumber: taxNumber.trim(),
      taxOffice: taxOffice.trim(),
      tradeRegistryNumber: tradeRegistryNumber?.trim(),
      documentUrl: documentUrl?.trim(),
      notes: notes?.trim(),
    });

    return NextResponse.json({ success: true, verification });
  } catch (err: any) {
    console.error("Teklifim POST verification error:", err);
    return NextResponse.json(
      { error: err.message || "Doğrulama başvurusu gönderilemedi." },
      { status: 400 }
    );
  }
}
