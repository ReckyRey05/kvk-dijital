import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import { computePriceDifference } from "@/lib/teklifimGelsin/procurementUtils";
import { TeklifimProduct, TeklifimOrder } from "@/types/teklifimGelsin";

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const body = await req.json();
    const { productName, previousPrice, productId, supplierId } = body;

    if (!productName && !productId) {
      return NextResponse.json(
        { error: "Urun adi veya urun ID zorunludur." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    let catalogProduct: TeklifimProduct | null = null;

    // 1. If productId provided, fetch directly
    if (productId) {
      const doc = await db.collection("teklifim_products").doc(productId).get();
      if (doc.exists) {
        catalogProduct = doc.data() as TeklifimProduct;
      }
    }

    // 2. If not found by ID, search by title/name and supplier
    if (!catalogProduct && productName) {
      const querySnap = await db
        .collection("teklifim_products")
        .where("status", "==", "published")
        .limit(50)
        .get();

      const normSearch = productName.trim().toLowerCase();
      querySnap.forEach((doc) => {
        if (!catalogProduct) {
          const p = doc.data() as TeklifimProduct;
          const normName = (p.name || p.title || "").trim().toLowerCase();
          if (normName === normSearch) {
            if (!supplierId || p.supplierId === supplierId) {
              catalogProduct = p;
            }
          }
        }
      });
    }

    const prevPrice = Number(previousPrice) || 0;
    const currentPrice = catalogProduct?.price ?? 0;
    const priceDiff = computePriceDifference(prevPrice, currentPrice);

    return NextResponse.json({
      productName: productName || catalogProduct?.name,
      previousPrice: prevPrice,
      currentCatalogPrice: catalogProduct?.price,
      priceDifference: priceDiff.deltaAmount,
      priceDifferencePercentage: priceDiff.deltaPercentage,
      stockStatus: catalogProduct?.stockStatus || "in_stock",
      minimumOrder: catalogProduct?.minimumOrder || 1,
      leadTimeDays: catalogProduct?.leadTimeDays || 3,
      unit: catalogProduct?.unit || "Adet",
      supplierId: catalogProduct?.supplierId || supplierId,
      supplierName: catalogProduct?.supplierName,
      hasCatalogProduct: Boolean(catalogProduct),
      catalogProductId: catalogProduct?.id,
    });
  } catch (err: any) {
    console.error("Reorder price check error:", err);
    return NextResponse.json(
      { error: "Guncel fiyat kontrolu gerceklestirilemedi." },
      { status: 500 }
    );
  }
}
