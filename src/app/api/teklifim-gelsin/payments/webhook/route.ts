import { NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/lib/payments/paymentService";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let parsedBody = {};
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {}

    // Extract headers
    const headers: Record<string, string | undefined> = {};
    req.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    const result = await handlePaymentWebhook({
      headers,
      rawBody,
      parsedBody,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Payment webhook error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook işlenemedi." },
      { status: 400 }
    );
  }
}
