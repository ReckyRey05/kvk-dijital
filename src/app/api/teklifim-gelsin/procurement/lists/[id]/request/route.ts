import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserOrgRole,
  convertListToProcurementRequest,
} from "@/lib/teklifimGelsin/procurementService";
import { hasOrgPermission } from "@/lib/teklifimGelsin/procurementUtils";

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

    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);

    if (!hasOrgPermission(orgRole, "create_request")) {
      return NextResponse.json(
        { error: "Toplu talep olusturma yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const deliveryDays = Number(body.deliveryDays) || 7;
    const deadline = body.deadline;
    const budget = typeof body.budget === "number" ? body.budget : undefined;

    const request = await convertListToProcurementRequest(
      id,
      businessId,
      {
        id: user.uid,
        name: user.email.split("@")[0],
        role: orgRole,
      },
      {
        deliveryDays,
        deadline,
        budget,
      }
    );

    return NextResponse.json({
      success: true,
      requestId: request.id,
      request,
      message: "Listeden toplu satin alma talebi basariyla olusturuldu.",
    });
  } catch (err: any) {
    console.error("Convert list to procurement request error:", err);
    return NextResponse.json(
      { error: err.message || "Toplu talep olusturulamadi." },
      { status: 500 }
    );
  }
}
