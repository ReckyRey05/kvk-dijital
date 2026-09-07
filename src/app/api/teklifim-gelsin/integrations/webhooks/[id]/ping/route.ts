import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { executeWebhookDelivery } from "@/lib/teklifimGelsin/integrationService";
import { TeklifimWebhookEndpoint, TeklifimIntegrationEvent } from "@/types/teklifimGelsin";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const { id } = await params;
    const db = getAdminDb();
    const epDoc = await db.collection("teklifim_webhook_endpoints").doc(id).get();

    if (!epDoc.exists) {
      return NextResponse.json({ error: "Webhook endpoint bulunamadi." }, { status: 404 });
    }

    const endpoint = epDoc.data() as TeklifimWebhookEndpoint;
    if (endpoint.userId !== user.uid) {
      return NextResponse.json({ error: "Bu webhook'u test etme yetkiniz yok." }, { status: 403 });
    }

    // Create synthetic test ping event
    const testEvent: TeklifimIntegrationEvent = {
      id: `ping_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      type: "request.created",
      entityId: "test_entity_123",
      entityType: "ping",
      actorId: user.uid,
      payload: {
        message: "Toptancim Cebimde Webhook Test Ping",
        timestamp: Date.now(),
        isTest: true,
      },
      status: "pending",
      channelsDispatched: [],
      createdAt: Date.now(),
    };

    const delivery = await executeWebhookDelivery(endpoint, testEvent);

    return NextResponse.json({
      success: delivery.status === "delivered",
      delivery,
    });
  } catch (err: any) {
    console.error("Webhook test ping error:", err);
    return NextResponse.json({ error: "Webhook ping testi basarisiz oldu." }, { status: 500 });
  }
}
