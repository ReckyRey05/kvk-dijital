import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getBusinessRequests,
  getOpenRequestsForSupplier,
  createTeklifimRequest,
  getTeklifimProfile,
} from "@/lib/teklifimGelsin/teklifimService";

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

    const body = await req.json().catch(() => ({}));
    const { title, category, quantity, unit, deliveryDays, city, description } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Talep başlığı zorunludur." }, { status: 400 });
    }

    if (!quantity || Number(quantity) <= 0) {
      return NextResponse.json({ error: "Geçerli bir miktar giriniz." }, { status: 400 });
    }

    let profile = await getTeklifimProfile(user.uid);
    if (!profile) {
      profile = {
        uid: user.uid,
        role: "business",
        companyName: body.businessName || "İşletme",
        contactName: "Yetkili",
        phone: body.phone || "",
        email: user.email || "",
        city: city || "İstanbul",
        categories: [category || "Diğer"],
        isVerified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const newRequest = await createTeklifimRequest(user.uid, profile, body);
    return NextResponse.json({ success: true, request: newRequest });
  } catch (err: any) {
    console.error("Teklifim POST request error:", err);
    return NextResponse.json({ error: "Talep yayınlanırken bir hata oluştu." }, { status: 500 });
  }
}
