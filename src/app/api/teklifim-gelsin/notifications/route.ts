import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserNotifications,
  markNotificationRead,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const notifications = await getUserNotifications(user.uid);
    return NextResponse.json({ notifications });
  } catch (err: any) {
    console.error("Teklifim GET notifications error:", err);
    return NextResponse.json({ error: "Bildirimler alınamadı." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await markNotificationRead(notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Teklifim POST notification error:", err);
    return NextResponse.json({ error: "Bildirim güncellenemedi." }, { status: 500 });
  }
}
