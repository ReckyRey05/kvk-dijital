import { NextResponse } from "next/server";
import { verifyTeklifimAdmin } from "@/lib/teklifimGelsin/teklifimAuth";
import { processVerificationRequest } from "@/lib/teklifimGelsin/teklifimService";

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyTeklifimAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca yetkili yöneticiler doğrulama işlemini onaylayabilir veya reddedebilir." },
        { status: 403 }
      );
    }

    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const { action, rejectionReason } = body;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Geçersiz işlem ('approve' veya 'reject' olmalıdır)." }, { status: 400 });
    }

    const updated = await processVerificationRequest(
      id,
      admin.email || "admin",
      action,
      rejectionReason
    );

    return NextResponse.json({ success: true, verification: updated });
  } catch (err: any) {
    console.error("Teklifim PUT verification error:", err);
    return NextResponse.json(
      { error: err.message || "Doğrulama işlemi gerçekleştirilemedi." },
      { status: 400 }
    );
  }
}
