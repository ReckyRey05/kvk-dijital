import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getTeklifimProfile, upsertTeklifimProfile } from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const profile = await getTeklifimProfile(user.uid);
    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("Teklifim GET profile error:", err);
    return NextResponse.json({ error: "Profil getirilirken hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const profile = await upsertTeklifimProfile(user.uid, {
      ...body,
      email: user.email || body.email,
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("Teklifim POST profile error:", err);
    return NextResponse.json({ error: "Profil kaydedilirken hata oluştu." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { updateTeklifimProfile } = await import("@/lib/teklifimGelsin/teklifimService");
    const updated = await updateTeklifimProfile(user.uid, body);

    return NextResponse.json({ success: true, profile: updated });
  } catch (err: any) {
    console.error("Teklifim PUT profile error:", err);
    return NextResponse.json(
      { error: err.message || "Profil güncellenirken hata oluştu." },
      { status: 400 }
    );
  }
}
