import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { validateApiKeyRequest } from "@/lib/teklifimGelsin/integrationService";
import { TeklifimProfile } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const auth = await validateApiKeyRequest(req, "suppliers:read");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const limitParam = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db
      .collection("teklifim_profiles")
      .where("role", "==", "supplier");

    if (city) {
      query = query.where("city", "==", city);
    }

    const snapshot = await query.limit(limitParam).get();
    const suppliers = snapshot.docs
      .map(doc => {
        const d = doc.data() as TeklifimProfile;
        // Filter out sensitive private info
        return {
          id: d.uid,
          companyName: d.companyName || d.contactName || "Tedarikci",
          city: d.city,
          district: d.district,
          categories: d.categories || [],
          rating: d.rating || 5.0,
          reviewCount: d.reviewCount || 0,
          isVerified: d.isVerified || false,
          badges: (d as any).badges || [],
        };
      })
      .filter(s => (!category ? true : s.categories.includes(category)));

    return NextResponse.json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (err: any) {
    console.error("API v1 suppliers GET error:", err);
    return NextResponse.json({ error: "Tedarikciler getirilemedi." }, { status: 500 });
  }
}
