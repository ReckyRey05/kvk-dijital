import { NextResponse } from "next/server";
import { verifyTekLinkTenant } from "@/lib/teklink/teklinkAuth";
import { getTenantFormById, updateTenantForm, deleteTenantForm } from "@/lib/teklink/teklinkService";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await props.params;
    const user = await verifyTekLinkTenant(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const form = await getTenantFormById(user.uid, formId);
    if (!form) {
      return NextResponse.json({ error: "Form bulunamadı veya erişim yetkiniz yok." }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (err: any) {
    return NextResponse.json({ error: "Form yüklenirken hata oluştu." }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await props.params;
    const user = await verifyTekLinkTenant(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const success = await updateTenantForm(user.uid, formId, body);

    if (!success) {
      return NextResponse.json({ error: "Form güncellenemedi veya yetkiniz yok." }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Form güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await props.params;
    const user = await verifyTekLinkTenant(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const success = await deleteTenantForm(user.uid, formId);
    if (!success) {
      return NextResponse.json({ error: "Form silinemedi veya yetkiniz yok." }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Form silinirken hata oluştu." }, { status: 500 });
  }
}
