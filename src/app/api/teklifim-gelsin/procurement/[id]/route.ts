import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import { getUserOrgRole } from "@/lib/teklifimGelsin/procurementService";
import { buildBulkOfferComparison } from "@/lib/teklifimGelsin/procurementUtils";
import { TeklifimRequest, TeklifimOffer, TeklifimOrder } from "@/types/teklifimGelsin";

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

    const db = getAdminDb();
    const reqDoc = await db.collection("teklifim_requests").doc(id).get();
    if (!reqDoc.exists) {
      return NextResponse.json({ error: "Talep bulunamadi." }, { status: 404 });
    }

    const request = reqDoc.data() as TeklifimRequest;
    const userRole = await getUserOrgRole(request.businessId, user.uid);

    // Fetch offers for this request
    const offersSnap = await db
      .collection("teklifim_offers")
      .where("requestId", "==", id)
      .get();
    const offers: TeklifimOffer[] = [];
    offersSnap.forEach((doc) => offers.push(doc.data() as TeklifimOffer));

    // Fetch completed orders for comparison context
    const ordersSnap = await db
      .collection("teklifim_orders")
      .where("businessId", "==", request.businessId)
      .get();
    const orders: TeklifimOrder[] = [];
    ordersSnap.forEach((doc) => orders.push(doc.data() as TeklifimOrder));

    const comparison = buildBulkOfferComparison(request, offers, orders);

    return NextResponse.json({
      request,
      offers,
      comparison,
      userRole,
    });
  } catch (err: any) {
    console.error("Get procurement request error:", err);
    return NextResponse.json({ error: "Talep getirilemedi." }, { status: 500 });
  }
}
