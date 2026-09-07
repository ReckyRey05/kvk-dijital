import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getUserOrgRole,
  createTeamInvitation,
} from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";
import { TeklifimOrgRole, TeklifimProfile } from "@/types/teklifimGelsin";

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);
    if (!hasOrgPermission(orgRole, "manage_team")) {
      return NextResponse.json(
        { error: "Ekip arkadasi davet etme yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, role } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Gecerli bir e-posta adresi giriniz." }, { status: 400 });
    }

    const assignedRole = (role as TeklifimOrgRole) || "buyer";
    if (!["admin", "buyer", "approver", "viewer"].includes(assignedRole)) {
      return NextResponse.json({ error: "Gecersiz rol secimi." }, { status: 400 });
    }

    // Fetch business profile name
    const db = getAdminDb();
    const profDoc = await db.collection("teklifim_profiles").doc(businessId).get();
    const profData = profDoc.data() as TeklifimProfile | undefined;
    const businessName = profData?.companyName || "Isletme";

    const invitation = await createTeamInvitation(
      businessId,
      businessName,
      email,
      assignedRole,
      {
        id: user.uid,
        name: user.email.split("@")[0],
      }
    );

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/teklifim-gelsin/team/invite/${invitation.token}`;

    return NextResponse.json({
      success: true,
      invitation,
      inviteUrl,
      message: "Ekip daveti basariyla olusturuldu.",
    });
  } catch (err: any) {
    console.error("Create team invitation error:", err);
    return NextResponse.json({ error: "Davet olusturulamadi." }, { status: 500 });
  }
}
