import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getUserOrgRole,
  processProcurementApproval,
} from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";
import { TeklifimRequest } from "@/types/teklifimGelsin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const body = await req.json();
    const { action, note } = body;

    if (action !== "approved" && action !== "rejected") {
      return NextResponse.json(
        { error: "Gecersiz onay islemi. 'approved' veya 'rejected' olmalidir." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const reqDoc = await db.collection("teklifim_requests").doc(id).get();
    if (!reqDoc.exists) {
      return NextResponse.json({ error: "Talep bulunamadi." }, { status: 404 });
    }

    const request = reqDoc.data() as TeklifimRequest;
    const userRole = await getUserOrgRole(request.businessId, user.uid);

    if (!hasOrgPermission(userRole, "approve_request")) {
      return NextResponse.json(
        { error: "Satin alma talebini onaylama veya reddetme yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const updatedRequest = await processProcurementApproval(
      id,
      request.businessId,
      {
        id: user.uid,
        name: user.email.split("@")[0],
        role: userRole,
      },
      action,
      note
    );

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: action === "approved" ? "Talep basariyla onaylandi." : "Talep reddedildi.",
    });
  } catch (err: any) {
    console.error("Procurement approval error:", err);
    return NextResponse.json(
      { error: err.message || "Onay islemi gerceklestirilemedi." },
      { status: 400 }
    );
  }
}
