import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getRecommendedSuppliersForRequest,
  sendDirectRequestInvitation,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request, props: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await props.params;
    const matches = await getRecommendedSuppliersForRequest(requestId);
    return NextResponse.json({ matches });
  } catch (err: any) {
    console.error("Teklifim GET matches error:", err);
    return NextResponse.json({ error: "Eşleşen tedarikçiler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { supplierId } = body;
    if (!supplierId) {
      return NextResponse.json({ error: "Tedarikçi ID gerekli." }, { status: 400 });
    }

    const success = await sendDirectRequestInvitation(user.uid, supplierId, requestId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Teklifim POST match invite error:", err);
    return NextResponse.json({ error: "Davet iletilemedi." }, { status: 500 });
  }
}
