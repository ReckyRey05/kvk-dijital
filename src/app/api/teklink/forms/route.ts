import { NextResponse } from "next/server";
import { verifyTekLinkTenant } from "@/lib/teklink/teklinkAuth";
import { getTenantForms, createTekLinkForm, getTenantDashboardStats, getOrCreateTenant, deleteAllTenantForms } from "@/lib/teklink/teklinkService";

export async function GET(req: Request) {
  try {
    const user = await verifyTekLinkTenant(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statsOnly = searchParams.get("stats") === "true";

    if (statsOnly) {
      const stats = await getTenantDashboardStats(user.uid);
      return NextResponse.json(stats);
    }

    const forms = await getTenantForms(user.uid);
    return NextResponse.json({ forms });
  } catch (err: any) {
    console.error("TekLink GET forms error:", err);
    return NextResponse.json({ error: "Formlar getirilirken bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTekLinkTenant(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { title, description, fields, businessName } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Form adı zorunludur." }, { status: 400 });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: "Formda en az 1 soru/alan bulunmalıdır." }, { status: 400 });
    }

    // Ensure tenant exists
    const tenantProfile = await getOrCreateTenant(user.uid, user.email, businessName);

    const newForm = await createTekLinkForm(user.uid, businessName || tenantProfile.businessName, {
      title,
      description,
      fields,
    });

    return NextResponse.json({ success: true, form: newForm });
  } catch (err: any) {
    console.error("TekLink POST form error:", err);
    return NextResponse.json({ error: "Form oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await verifyTekLinkTenant(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    await deleteAllTenantForms(user.uid);
    return NextResponse.json({ success: true, message: "Tüm formlar başarıyla silindi." });
  } catch (err: any) {
    console.error("TekLink DELETE all forms error:", err);
    return NextResponse.json({ error: "Formlar silinirken bir hata oluştu." }, { status: 500 });
  }
}
