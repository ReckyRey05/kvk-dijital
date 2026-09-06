import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getSupplierSubmittedOffers } from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const offers = await getSupplierSubmittedOffers(user.uid);
    return NextResponse.json({ offers });
  } catch (err: any) {
    console.error("Teklifim GET supplier offers error:", err);
    return NextResponse.json({ error: "Teklifler getirilemedi." }, { status: 500 });
  }
}
