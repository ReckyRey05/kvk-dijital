import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserOrgRole,
  getProcurementListById,
  updateProcurementList,
  deleteProcurementList,
} from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim." }, { status: 401 });
    }

    const businessId = user.uid;
    const list = await getProcurementListById(id, businessId);
    if (!list) {
      return NextResponse.json({ error: "Liste bulunamadi." }, { status: 404 });
    }

    const orgRole = await getUserOrgRole(businessId, user.uid);
    return NextResponse.json({ list, userRole: orgRole });
  } catch (err: any) {
    console.error("Get procurement list details error:", err);
    return NextResponse.json({ error: "Liste getirilemedi." }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim." }, { status: 401 });
    }

    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);

    if (!hasOrgPermission(orgRole, "create_list")) {
      return NextResponse.json(
        { error: "Listeyi guncelleme yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await updateProcurementList(id, businessId, body, {
      id: user.uid,
      name: user.email.split("@")[0],
      role: orgRole,
    });

    if (!updated) {
      return NextResponse.json({ error: "Liste bulunamadi." }, { status: 404 });
    }

    return NextResponse.json({ list: updated });
  } catch (err: any) {
    console.error("Update procurement list error:", err);
    return NextResponse.json({ error: "Liste guncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim." }, { status: 401 });
    }

    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);

    if (!hasOrgPermission(orgRole, "create_list")) {
      return NextResponse.json(
        { error: "Listeyi silme yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const success = await deleteProcurementList(id, businessId);
    if (!success) {
      return NextResponse.json({ error: "Liste bulunamadi." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Liste basariyla silindi." });
  } catch (err: any) {
    console.error("Delete procurement list error:", err);
    return NextResponse.json({ error: "Liste silinemedi." }, { status: 500 });
  }
}
