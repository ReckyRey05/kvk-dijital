import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { listApiKeys, createApiKey } from "@/lib/teklifimGelsin/integrationService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const keys = await listApiKeys(user.uid);
    return NextResponse.json({ success: true, keys });
  } catch (err: any) {
    console.error("Get API keys error:", err);
    return NextResponse.json({ error: "API anahtarlari alinamadi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const body = await req.json();
    const name = (body.name || "").trim();
    const scopes = Array.isArray(body.scopes) ? body.scopes : ["products:read", "requests:read"];

    if (!name) {
      return NextResponse.json({ error: "API anahtari ismi zorunludur." }, { status: 400 });
    }

    const { apiKey, rawKey } = await createApiKey(user.uid, name, scopes);

    return NextResponse.json(
      {
        success: true,
        apiKey,
        rawKey, // Returned only once!
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Create API key error:", err);
    return NextResponse.json({ error: "API anahtari olusturulamadi." }, { status: 500 });
  }
}
