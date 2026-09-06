import { NextResponse } from "next/server";
import { getPublicTagByCode } from "@/lib/etiketle/etiketleService";

export async function GET(req: Request, props: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await props.params;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Geçersiz etiket kodu." }, { status: 400 });
    }

    const publicTag = await getPublicTagByCode(code);

    if (!publicTag) {
      return NextResponse.json({ error: "Etiket bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ tag: publicTag });
  } catch (err: any) {
    console.error("Etiketle public GET error:", err);
    return NextResponse.json({ error: "Etiket bilgisi alınamadı." }, { status: 500 });
  }
}
