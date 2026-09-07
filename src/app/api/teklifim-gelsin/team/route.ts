import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getTeamMembers,
  getUserOrgRole,
} from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);
    if (!hasOrgPermission(orgRole, "view")) {
      return NextResponse.json({ error: "Ekip uyelerini goruntuleme yetkiniz bulunmuyor." }, { status: 403 });
    }

    const members = await getTeamMembers(businessId);
    return NextResponse.json({ members, userRole: orgRole });
  } catch (err: any) {
    console.error("Get team members error:", err);
    return NextResponse.json({ error: "Ekip uyeleri alinamadi." }, { status: 500 });
  }
}
