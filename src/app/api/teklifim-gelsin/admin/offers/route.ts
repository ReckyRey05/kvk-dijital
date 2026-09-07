import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminWithPermission } from "@/lib/teklifimGelsin/adminOperationsService";
import { TeklifimOffer } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "offers.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const requestId = searchParams.get("requestId");

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection("teklifim_offers").orderBy("createdAt", "desc");

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }
    if (requestId) {
      query = query.where("requestId", "==", requestId);
    }

    const snap = await query.limit(100).get();
    const offers = snap.docs.map((d) => d.data() as TeklifimOffer);

    return NextResponse.json({ success: true, offers, count: offers.length });
  } catch (err: any) {
    console.error("Admin list offers error:", err);
    return NextResponse.json({ error: "Teklifler alinamadi." }, { status: 500 });
  }
}
