import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getRequestDetails,
  getOffersForRequest,
  submitTeklifimOffer,
  getTeklifimProfile,
} from "@/lib/teklifimGelsin/teklifimService";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rateLimit";
import { RATE_LIMITS } from "@/config/rateLimit";
import { sanitizeSafeString } from "@/lib/teklifimGelsin/security/inputValidation";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

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

    // Rate Limiting (30 offers / min)
    const rateCheck = checkRateLimit(`teklifim_offer:${user.uid}`, RATE_LIMITS.teklifim.offers);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck);
    }

    const body = await req.json().catch(() => ({}));
    const { unitPrice, totalPrice, deliveryDays, description } = body;

    const numUnitPrice = Number(unitPrice);
    const numTotalPrice = Number(totalPrice);

    if ((isNaN(numUnitPrice) || numUnitPrice <= 0) && (isNaN(numTotalPrice) || numTotalPrice <= 0)) {
      return NextResponse.json({ error: "Lütfen 0'dan büyük geçerli bir fiyat belirtin." }, { status: 400 });
    }

    let profile = await getTeklifimProfile(user.uid);
    if (!profile) {
      profile = {
        uid: user.uid,
        role: "supplier",
        companyName: sanitizeSafeString(body.supplierName, 100) || "Tedarikçi Firma",
        contactName: "Yetkili",
        phone: sanitizeSafeString(body.supplierPhone, 30) || "",
        email: user.email || "",
        city: sanitizeSafeString(body.supplierCity, 50) || "İstanbul",
        categories: ["Tümü"],
        isVerified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const sanitizedPayload = {
      ...body,
      unitPrice: !isNaN(numUnitPrice) && numUnitPrice > 0 ? numUnitPrice : undefined,
      totalPrice: !isNaN(numTotalPrice) && numTotalPrice > 0 ? numTotalPrice : undefined,
      deliveryDays: Math.max(1, Number(deliveryDays) || 3),
      description: sanitizeSafeString(description, 2000),
    };

    const offer = await submitTeklifimOffer(user.uid, profile, requestId, sanitizedPayload);
    return NextResponse.json({ success: true, offer });
  } catch (err: any) {
    if (err.message && (err.message.includes("kapalı") || err.message.includes("yetkiniz"))) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return createSecureServerErrorResponse("SubmitOffer", err, "Teklif iletilirken bir hata oluştu.");
  }
}
