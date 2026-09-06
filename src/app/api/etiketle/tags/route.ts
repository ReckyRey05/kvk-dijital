import { NextResponse } from "next/server";
import { verifyEtiketleUser } from "@/lib/etiketle/etiketleAuth";
import {
  getBusinessTags,
  createEtiketleTag,
  createBatchEtiketleTags,
} from "@/lib/etiketle/etiketleService";

export async function GET(req: Request) {
  try {
    const user = await verifyEtiketleUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const tags = await getBusinessTags(user.uid);
    return NextResponse.json({ tags });
  } catch (err: any) {
    console.error("Etiketle GET tags error:", err);
    return NextResponse.json({ error: "Etiketler getirilirken bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyEtiketleUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Batch tag creation support
    if (body.isBatch && Array.isArray(body.names) && body.names.length > 0) {
      const tags = await createBatchEtiketleTags(
        user.uid,
        body.businessName || "İşletme",
        body.names,
        body.category,
        body.location
      );
      return NextResponse.json({ success: true, tags });
    }

    // Single tag creation
    const { name, category, quantity, unit, location, description, imageUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Etiket adı zorunludur." }, { status: 400 });
    }

    const newTag = await createEtiketleTag(user.uid, body.businessName || "İşletme", {
      name,
      category,
      quantity,
      unit,
      location,
      description,
      imageUrl,
    });

    return NextResponse.json({ success: true, tag: newTag });
  } catch (err: any) {
    console.error("Etiketle POST tag error:", err);
    return NextResponse.json({ error: "Etiket oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}
