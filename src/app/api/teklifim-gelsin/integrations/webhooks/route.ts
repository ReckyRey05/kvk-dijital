import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { listWebhookEndpoints, registerWebhookEndpoint } from "@/lib/teklifimGelsin/integrationService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const endpoints = await listWebhookEndpoints(user.uid);
    // Mask secrets before sending to frontend
    const sanitized = endpoints.map(ep => ({
      ...ep,
      secret: `${ep.secret.substring(0, 10)}****************`,
    }));

    return NextResponse.json({ success: true, endpoints: sanitized });
  } catch (err: any) {
    console.error("Get webhooks error:", err);
    return NextResponse.json({ error: "Webhook endpointleri alinamadi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const body = await req.json();
    const url = (body.url || "").trim();
    const events = Array.isArray(body.events) ? body.events : [];

    const result = await registerWebhookEndpoint(user.uid, url, events);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, endpoint: result.endpoint }, { status: 201 });
  } catch (err: any) {
    console.error("Register webhook error:", err);
    return NextResponse.json({ error: "Webhook kaydedilemedi." }, { status: 500 });
  }
}
