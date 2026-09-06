import { NextResponse } from "next/server";
import { verifyEtiketleUser } from "@/lib/etiketle/etiketleAuth";
import {
  getTagById,
  updateTagWithHistory,
  deleteEtiketleTag,
} from "@/lib/etiketle/etiketleService";

export async function GET(req: Request, props: { params: Promise<{ tagId: string }> }) {
  try {
    const { tagId } = await props.params;
    const user = await verifyEtiketleUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const res = await getTagById(user.uid, tagId);
    if (!res) {
      return NextResponse.json({ error: "Etiket bulunamadı veya yetkiniz yok." }, { status: 404 });
    }

    return NextResponse.json(res);
  } catch (err: any) {
    console.error("Etiketle GET tag error:", err);
    return NextResponse.json({ error: "Etiket detayları getirilirken hata oluştu." }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ tagId: string }> }) {
  try {
    const { tagId } = await props.params;
    const user = await verifyEtiketleUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const updated = await updateTagWithHistory(user.uid, tagId, body);

    if (!updated) {
      return NextResponse.json({ error: "Etiket güncellenemedi veya yetkiniz yok." }, { status: 404 });
    }

    return NextResponse.json({ success: true, tag: updated });
  } catch (err: any) {
    console.error("Etiketle PUT tag error:", err);
    return NextResponse.json({ error: "Etiket güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ tagId: string }> }) {
  try {
    const { tagId } = await props.params;
    const user = await verifyEtiketleUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const success = await deleteEtiketleTag(user.uid, tagId);
    if (!success) {
      return NextResponse.json({ error: "Etiket silinemedi veya yetkiniz yok." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Etiket başarıyla silindi." });
  } catch (err: any) {
    console.error("Etiketle DELETE tag error:", err);
    return NextResponse.json({ error: "Etiket silinirken hata oluştu." }, { status: 500 });
  }
}
