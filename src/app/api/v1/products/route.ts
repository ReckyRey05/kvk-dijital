import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { validateApiKeyRequest } from "@/lib/teklifimGelsin/integrationService";
import { TeklifimProduct } from "@/types/teklifimGelsin";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const auth = await validateApiKeyRequest(req, "products:read");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limitParam = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection("teklifim_products").where("status", "==", "published");

    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.limit(limitParam).get();
    const products = snapshot.docs.map(doc => doc.data() as TeklifimProduct);

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err: any) {
    console.error("API v1 products GET error:", err);
    return NextResponse.json({ error: "Urunler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await validateApiKeyRequest(req, "products:write");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    if (!body.title || !body.category || !body.unit || body.wholesalePrice == null) {
      return NextResponse.json(
        { error: "Gecersiz urun verisi. 'title', 'category', 'unit' ve 'wholesalePrice' zorunludur." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const productId = `prod_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const now = Date.now();

    const newProduct: TeklifimProduct = {
      id: productId,
      name: body.title.trim(),
      supplierId: auth.userId!,
      supplierName: body.supplierName || "Entegre Tedarikci",
      title: body.title.trim(),
      description: body.description || "",
      category: body.category,
      unit: body.unit,
      minimumOrder: Number(body.minOrderQuantity) || 1,
      price: Number(body.wholesalePrice),
      currency: body.currency || "TRY",
      stockQuantity: Number(body.stockQuantity) || 0,
      leadTimeDays: Number(body.leadTimeDays) || 1,
      images: Array.isArray(body.images) ? body.images : [],
      status: "published",
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("teklifim_products").doc(productId).set(newProduct);

    return NextResponse.json(
      {
        success: true,
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("API v1 products POST error:", err);
    return NextResponse.json({ error: "Urun eklenemedi." }, { status: 500 });
  }
}
