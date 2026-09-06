import { NextResponse } from "next/server";
import { verifyTekLinkTenant } from "@/lib/teklink/teklinkAuth";
import { getFormSubmissions } from "@/lib/teklink/teklinkService";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await props.params;
    const user = await verifyTekLinkTenant(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const submissions = await getFormSubmissions(user.uid, formId);
    return NextResponse.json({ submissions });
  } catch (err: any) {
    console.error("TekLink GET responses error:", err);
    return NextResponse.json({ error: "Yanıtlar getirilirken hata oluştu." }, { status: 500 });
  }
}
