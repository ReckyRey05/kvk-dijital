import { NextResponse } from "next/server";
import { verifyTeklifimAdmin } from "@/lib/teklifimGelsin/teklifimAuth";
import { getIntegrationLogs, retryPendingWebhooks } from "@/lib/teklifimGelsin/integrationService";

export async function GET(req: Request) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz islem. Admin yetkisi gereklidir." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = await getIntegrationLogs(limit);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error("Admin get integration logs error:", err);
    return NextResponse.json({ error: "Entegrasyon loglari alinamadi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz islem. Admin yetkisi gereklidir." }, { status: 403 });
    }

    const result = await retryPendingWebhooks();
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Admin retry webhooks error:", err);
    return NextResponse.json({ error: "Webhook retry islemi basarisiz oldu." }, { status: 500 });
  }
}
