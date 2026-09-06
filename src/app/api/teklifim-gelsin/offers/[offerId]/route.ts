import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { updateTeklifimOffer } from "@/lib/teklifimGelsin/teklifimService";

export async function PUT(req: Request, props: { params: Promise<{ offerId: string }> }) {
  try {
    const { offerId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const updatedOffer = await updateTeklifimOffer(offerId, user.uid, body);
    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (err: any) {
    console.error("Teklifim PUT offer error:", err);
    return NextResponse.json({ error: err.message || "Teklif güncellenemedi." }, { status: 400 });
  }
}
