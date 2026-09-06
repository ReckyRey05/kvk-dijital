import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getRequestDetails,
  getOffersForRequest,
  submitTeklifimOffer,
  getTeklifimProfile,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request, props: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const request = await getRequestDetails(requestId);
    if (!request) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    const isBusinessOwner = request.businessId === user.uid;
    const offers = await getOffersForRequest(requestId, user.uid, isBusinessOwner);

    return NextResponse.json({
      isBusinessOwner,
      offers,
    });
  } catch (err: any) {
    console.error("Teklifim GET offers error:", err);
    return NextResponse.json({ error: "Teklifler getirilirken hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { unitPrice, totalPrice, deliveryDays, description } = body;

    if (!unitPrice && !totalPrice) {
      return NextResponse.json({ error: "Lütfen geçerli bir fiyat belirtin." }, { status: 400 });
    }

    let profile = await getTeklifimProfile(user.uid);
    if (!profile) {
      profile = {
        uid: user.uid,
        role: "supplier",
        companyName: body.supplierName || "Tedarikçi Firma",
        contactName: "Yetkili",
        phone: body.supplierPhone || "",
        email: user.email || "",
        city: body.supplierCity || "İstanbul",
        categories: ["Tümü"],
        isVerified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const offer = await submitTeklifimOffer(user.uid, profile, requestId, body);
    return NextResponse.json({ success: true, offer });
  } catch (err: any) {
    console.error("Teklifim POST offer error:", err);
    return NextResponse.json({ error: err.message || "Teklif iletilirken hata oluştu." }, { status: 500 });
  }
}
