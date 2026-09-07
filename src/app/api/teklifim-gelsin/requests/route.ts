import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getBusinessRequests,
  getOpenRequestsForSupplier,
  createTeklifimRequest,
  getTeklifimProfile,
} from "@/lib/teklifimGelsin/teklifimService";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rateLimit";
import { RATE_LIMITS } from "@/config/rateLimit";
import { sanitizeSafeString } from "@/lib/teklifimGelsin/security/inputValidation";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const category = searchParams.get("category") || undefined;
    const city = searchParams.get("city") || undefined;

    if (role === "business") {
      const user = await verifyTeklifimUser(req);
      if (!user) {
        return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
      }
      const requests = await getBusinessRequests(user.uid);
      return NextResponse.json({ requests });
    }

    // Default or supplier: get open requests
    const requests = await getOpenRequestsForSupplier(category, city);
    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error("Teklifim GET requests error:", err);
    return NextResponse.json({ error: "Talepler getirilirken hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    // Rate Limiting (15 RFQ / min)
    const rateCheck = checkRateLimit(`teklifim_rfq:${user.uid}`, RATE_LIMITS.teklifim.requests);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck);
    }

    const body = await req.json().catch(() => ({}));
    const { title, category, quantity, unit, deliveryDays, city, description } = body;

    const safeTitle = sanitizeSafeString(title, 150);
    if (!safeTitle || safeTitle.length < 3) {
      return NextResponse.json({ error: "Talep başlığı en az 3 karakter olmalıdır." }, { status: 400 });
    }

    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return NextResponse.json({ error: "Geçerli bir miktar giriniz." }, { status: 400 });
    }

    const safeCategory = sanitizeSafeString(category, 80) || "Diğer";
    const safeCity = sanitizeSafeString(city, 50) || "İstanbul";
    const safeDescription = sanitizeSafeString(description, 5000);

    let profile = await getTeklifimProfile(user.uid);
    if (!profile) {
      profile = {
        uid: user.uid,
        role: "business",
        companyName: sanitizeSafeString(body.businessName, 100) || "İşletme",
        contactName: "Yetkili",
        phone: sanitizeSafeString(body.phone, 30) || "",
        email: user.email || "",
        city: safeCity,
        categories: [safeCategory],
        isVerified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const sanitizedPayload = {
      ...body,
      title: safeTitle,
      category: safeCategory,
      city: safeCity,
      description: safeDescription,
      quantity: numQuantity,
      unit: sanitizeSafeString(unit, 30) || "Adet",
      deliveryDays: Number(deliveryDays) || 3,
    };

    const newRequest = await createTeklifimRequest(user.uid, profile, sanitizedPayload);
    return NextResponse.json({ success: true, request: newRequest });
  } catch (err: any) {
    return createSecureServerErrorResponse("CreateRequest", err, "Talep yayınlanırken bir hata oluştu.");
  }
}
