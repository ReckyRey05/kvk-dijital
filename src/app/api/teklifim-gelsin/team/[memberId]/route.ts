import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserOrgRole,
  updateTeamMemberRole,
  removeTeamMember,
} from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";
import { TeklifimOrgRole } from "@/types/teklifimGelsin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim." }, { status: 401 });
    }

    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);
    if (!hasOrgPermission(orgRole, "manage_team")) {
      return NextResponse.json(
        { error: "Ekip rollerini degistirme yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const newRole = body.role as TeklifimOrgRole;
    if (!["owner", "admin", "buyer", "approver", "viewer"].includes(newRole)) {
      return NextResponse.json({ error: "Gecersiz rol." }, { status: 400 });
    }

    await updateTeamMemberRole(memberId, businessId, newRole, {
      id: user.uid,
      name: user.email.split("@")[0],
    });

    return NextResponse.json({ success: true, message: "Uye rolu basariyla guncellendi." });
  } catch (err: any) {
    console.error("Update team member error:", err);
    return NextResponse.json({ error: err.message || "Islem basarisiz." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim." }, { status: 401 });
    }

    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);
    if (!hasOrgPermission(orgRole, "manage_team")) {
      return NextResponse.json(
        { error: "Ekip uyesi silme yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    await removeTeamMember(memberId, businessId, {
      id: user.uid,
      name: user.email.split("@")[0],
    });

    return NextResponse.json({ success: true, message: "Ekip uyesi basariyla cikarildi." });
  } catch (err: any) {
    console.error("Remove team member error:", err);
    return NextResponse.json({ error: err.message || "Islem basarisiz." }, { status: 500 });
  }
}
