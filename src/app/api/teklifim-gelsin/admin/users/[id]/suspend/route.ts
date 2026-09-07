import { NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  suspendUser,
  unsuspendUser,
} from "@/lib/teklifimGelsin/adminOperationsService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminWithPermission(req, "users.suspend");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    const action = body.action || "suspend";

    if (action === "suspend") {
      const reason = (body.reason || "Kural ihlali").trim();
      const durationDays = body.durationDays ? Number(body.durationDays) : undefined;
      const notes = body.notes || "";

      await suspendUser(auth.user!, auth.role!, id, reason, durationDays, notes);
      return NextResponse.json({ success: true, message: "Kullanici askiya alindi." });
    } else if (action === "unsuspend") {
      await unsuspendUser(auth.user!, auth.role!, id);
      return NextResponse.json({ success: true, message: "Kullanici askidan cikarildi." });
    }

    return NextResponse.json({ error: "Gecersiz islem turu." }, { status: 400 });
  } catch (err: any) {
    console.error("Admin suspend user error:", err);
    return NextResponse.json({ error: "Islem gerceklestirilemedi." }, { status: 500 });
  }
}
