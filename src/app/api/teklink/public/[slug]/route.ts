import { NextResponse } from "next/server";
import { getPublicFormBySlug } from "@/lib/teklink/teklinkService";

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await props.params;
    if (!slug) {
      return NextResponse.json({ error: "Geçersiz form bağlantısı." }, { status: 400 });
    }

    const form = await getPublicFormBySlug(slug);
    if (!form) {
      return NextResponse.json({ error: "Form bulunamadı veya kapatılmış." }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (err: any) {
    console.error("TekLink public form lookup error:", err);
    return NextResponse.json({ error: "Form yüklenirken hata oluştu." }, { status: 500 });
  }
}
