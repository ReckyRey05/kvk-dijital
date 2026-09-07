import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserOrgRole,
  getProcurementLists,
  createProcurementList,
} from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const businessId = user.uid;
    const lists = await getProcurementLists(businessId);
    const orgRole = await getUserOrgRole(businessId, user.uid);

    return NextResponse.json({ lists, userRole: orgRole });
  } catch (err: any) {
    console.error("Get procurement lists error:", err);
    return NextResponse.json({ error: "Listeler alinamadi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);

    if (!hasOrgPermission(orgRole, "create_list")) {
      return NextResponse.json(
        { error: "Satin alma listesi olusturma yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const list = await createProcurementList(businessId, body, {
      id: user.uid,
      name: user.email.split("@")[0],
      role: orgRole,
    });

    return NextResponse.json({ list }, { status: 201 });
  } catch (err: any) {
    console.error("Create procurement list error:", err);
    return NextResponse.json({ error: err.message || "Liste olusturulamadi." }, { status: 500 });
  }
}
