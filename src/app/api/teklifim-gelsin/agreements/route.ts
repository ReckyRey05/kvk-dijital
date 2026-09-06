import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getUserAgreements } from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const agreements = await getUserAgreements(user.uid);
    return NextResponse.json({ agreements });
  } catch (err: any) {
    console.error("Teklifim get agreements error:", err);
    return NextResponse.json(
      { error: err.message || "Anlaşmalar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
