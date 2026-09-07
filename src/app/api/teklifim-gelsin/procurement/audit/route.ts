import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAuditLogs, getUserOrgRole } from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const orgRole = await getUserOrgRole(user.uid, user.uid);
    if (!hasOrgPermission(orgRole, "view")) {
      return NextResponse.json({ error: "Denetim izi goruntuleme yetkiniz bulunmuyor." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = await getAuditLogs(user.uid, limit);
    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("Get audit logs error:", err);
    return NextResponse.json({ error: "Denetim kayitlari alinamadi." }, { status: 500 });
  }
}
