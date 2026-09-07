import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { deleteWebhookEndpoint } from "@/lib/teklifimGelsin/integrationService";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteWebhookEndpoint(user.uid, id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete webhook error:", err);
    return NextResponse.json({ error: "Webhook silinemedi." }, { status: 500 });
  }
}
