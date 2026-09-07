import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserOrgRole,
  getProcurementPolicy,
  updateProcurementPolicy,
} from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const policy = await getProcurementPolicy(user.uid);
    const orgRole = await getUserOrgRole(user.uid, user.uid);

    return NextResponse.json({ policy, userRole: orgRole });
  } catch (err: any) {
    console.error("Get procurement policy error:", err);
    return NextResponse.json({ error: "Politika ayarlari alinamadi." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const orgRole = await getUserOrgRole(user.uid, user.uid);
    if (!hasOrgPermission(orgRole, "manage_policy")) {
      return NextResponse.json(
        { error: "Satin alma politikasini guncelleme yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await updateProcurementPolicy(user.uid, body, {
      id: user.uid,
      name: user.email.split("@")[0],
      role: orgRole,
    });

    return NextResponse.json({ policy: updated, message: "Politika basariyla guncellendi." });
  } catch (err: any) {
    console.error("Update procurement policy error:", err);
    return NextResponse.json({ error: "Politika guncellenemedi." }, { status: 500 });
  }
}
