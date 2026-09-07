import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminWithPermission } from "@/lib/teklifimGelsin/adminOperationsService";
import { TeklifimProfile } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "businesses.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const city = searchParams.get("city");

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db
      .collection("teklifim_profiles")
      .where("role", "==", "business");

    if (city) {
      query = query.where("city", "==", city);
    }

    const snap = await query.limit(100).get();
    let businesses = snap.docs.map((d) => {
      const data = d.data() as TeklifimProfile;
      return {
        uid: d.id,
        companyName: data.companyName || "Isletme",
        contactName: data.contactName || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        district: data.district || "",
        status: (data as any).status || "active",
        createdAt: data.createdAt || 0,
      };
    });

    if (search) {
      businesses = businesses.filter(
        (b) =>
          b.companyName.toLowerCase().includes(search) ||
          b.contactName.toLowerCase().includes(search) ||
          b.email.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, businesses, count: businesses.length });
  } catch (err: any) {
    console.error("Admin list businesses error:", err);
    return NextResponse.json({ error: "Isletmeler getirilemedi." }, { status: 500 });
  }
}
