import { NextResponse } from "next/server";
import { verifyTekLinkTenant } from "@/lib/teklink/teklinkAuth";
import { getFormSubmissions, deleteTenantSubmission } from "@/lib/teklink/teklinkService";

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

export async function DELETE(req: Request) {
  try {
    const user = await verifyTekLinkTenant(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subId = searchParams.get("subId");

    if (!subId) {
      return NextResponse.json({ error: "Geçersiz yanıt ID." }, { status: 400 });
    }

    await deleteTenantSubmission(user.uid, subId);
    return NextResponse.json({ success: true, message: "Yanıt silindi." });
  } catch (err: any) {
    console.error("TekLink DELETE response error:", err);
    return NextResponse.json({ error: "Yanıt silinirken hata oluştu." }, { status: 500 });
  }
}
