import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminWithPermission } from "@/lib/teklifimGelsin/adminOperationsService";
import { TeklifimRequest } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "requests.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection("teklifim_requests").orderBy("createdAt", "desc");

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }
    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    const snap = await query.limit(100).get();
    let requests = snap.docs.map((d) => d.data() as TeklifimRequest);

    if (search) {
      requests = requests.filter(
        (r) =>
          r.title.toLowerCase().includes(search) ||
          r.businessName.toLowerCase().includes(search) ||
          r.productName?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, requests, count: requests.length });
  } catch (err: any) {
    console.error("Admin list requests error:", err);
    return NextResponse.json({ error: "Talepler alinamadi." }, { status: 500 });
  }
}
