import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminWithPermission } from "@/lib/teklifimGelsin/adminOperationsService";
import { TeklifimProfile } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "suppliers.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const city = searchParams.get("city");
    const verified = searchParams.get("verified");

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db
      .collection("teklifim_profiles")
      .where("role", "==", "supplier");

    if (city) {
      query = query.where("city", "==", city);
    }

    const snap = await query.limit(100).get();
    let suppliers = snap.docs.map((d) => {
      const data = d.data() as TeklifimProfile;
      return {
        uid: d.id,
        companyName: data.companyName || "Tedarikci",
        contactName: data.contactName || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        district: data.district || "",
        categories: data.categories || [],
        isVerified: data.isVerified || false,
        rating: data.rating || 5,
        reviewCount: data.reviewCount || 0,
        completedDeals: data.completedDeals || 0,
        status: (data as any).status || "active",
        createdAt: data.createdAt || 0,
      };
    });

    if (verified === "true") {
      suppliers = suppliers.filter((s) => s.isVerified);
    } else if (verified === "false") {
      suppliers = suppliers.filter((s) => !s.isVerified);
    }

    if (search) {
      suppliers = suppliers.filter(
        (s) =>
          s.companyName.toLowerCase().includes(search) ||
          s.contactName.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, suppliers, count: suppliers.length });
  } catch (err: any) {
    console.error("Admin list suppliers error:", err);
    return NextResponse.json({ error: "Tedarikciler getirilemedi." }, { status: 500 });
  }
}
