import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getConsents,
  recordConsent,
} from "@/lib/teklifimGelsin/integrationService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const [preferences, consents] = await Promise.all([
      getNotificationPreferences(user.uid),
      getConsents(user.uid),
    ]);

    return NextResponse.json({
      success: true,
      preferences,
      consents,
    });
  } catch (err: any) {
    console.error("Get preferences error:", err);
    return NextResponse.json({ error: "Bildirim tercihleri alinamadi." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateNotificationPreferences(user.uid, body.preferences || {});

    // If marketing consent is included, record it
    if (typeof body.marketingConsent === "boolean") {
      const channels: ("sms" | "email" | "whatsapp")[] = ["email", "sms", "whatsapp"];
      for (const ch of channels) {
        await recordConsent(
          user.uid,
          ch,
          "marketing",
          body.marketingConsent,
          body.source || "user_settings_panel"
        );
      }
    }

    return NextResponse.json({
      success: true,
      preferences: updated,
    });
  } catch (err: any) {
    console.error("Update preferences error:", err);
    return NextResponse.json({ error: "Bildirim tercihleri guncellenemedi." }, { status: 500 });
  }
}
