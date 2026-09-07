import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  verifyAdminWithPermission,
  moderateProduct,
} from "@/lib/teklifimGelsin/adminOperationsService";
import { TeklifimProduct } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "products.moderate");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection("teklifim_products");

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }
    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    const snap = await query.limit(100).get();
    let products = snap.docs.map((d) => d.data() as TeklifimProduct);

    if (search) {
      products = products.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.name?.toLowerCase().includes(search) ||
          p.supplierName?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, products, count: products.length });
  } catch (err: any) {
    console.error("Admin list products error:", err);
    return NextResponse.json({ error: "Urunler getirilemedi." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "products.moderate");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { productId, status, category } = body;

    if (!productId || !status) {
      return NextResponse.json({ error: "productId ve status zorunludur." }, { status: 400 });
    }

    await moderateProduct(auth.user!, auth.role!, productId, status, category);
    return NextResponse.json({ success: true, message: "Urun moderasyonu kaydedildi." });
  } catch (err: any) {
    console.error("Admin moderate product error:", err);
    return NextResponse.json({ error: "Urun moderasyonu basarisiz oldu." }, { status: 500 });
  }
}
