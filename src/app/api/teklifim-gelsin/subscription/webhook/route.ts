import { NextRequest, NextResponse } from "next/server";
import { processSubscriptionWebhook } from "@/lib/teklifimGelsin/subscriptionService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let parsedBody: any = {};
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e) {}

    const headersObj: Record<string, string | undefined> = {};
    req.headers.forEach((val, key) => {
      headersObj[key.toLowerCase()] = val;
    });

    const secretKey = process.env.PAYMENT_WEBHOOK_SECRET || "default_mock_webhook_secret_key_2026";

    const result = await processSubscriptionWebhook(
      {
        headers: headersObj,
        rawBody,
        parsedBody,
      },
      secretKey
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Subscription webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Abonelik webhook islemi basarisiz." },
      { status: 400 }
    );
  }
}
