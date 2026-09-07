import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  executeBulkPriceUpdate,
} from "@/lib/teklifimGelsin/supplierCenterService";
import { applyBulkPriceAdjustment } from "@/lib/teklifimGelsin/supplierCenterUtils";
import { getAdminDb } from "@/lib/firebase/admin";
import { TeklifimProduct } from "@/types/teklifimGelsin";

export async function POST(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { productIds, percentage, previewOnly } = body;

    if (typeof percentage !== "number" || percentage === 0) {
      return NextResponse.json(
        { error: "Gecerli bir yuzde degeri girilmelidir." },
        { status: 400 }
      );
    }

    if (percentage < -50 || percentage > 50) {
      return NextResponse.json(
        { error: "Tek seferde yapilabilecek maksimum fiyat degisim orani %50'dir." },
        { status: 400 }
      );
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "En az bir urun secilmelidir." },
        { status: 400 }
      );
    }

    // Preview mode
    if (previewOnly) {
      const db = getAdminDb();
      const snap = await db
        .collection("teklifim_products")
        .where("supplierId", "==", auth.user.uid)
        .get();

      const products: TeklifimProduct[] = [];
      snap.forEach((doc) => products.push(doc.data() as TeklifimProduct));

      const targetProducts = products.filter((p) => productIds.includes(p.id));
      const previews = applyBulkPriceAdjustment(targetProducts, percentage, productIds);

      return NextResponse.json({
        success: true,
        previewOnly: true,
        count: previews.length,
        previews,
      });
    }

    // Execution mode
    const result = await executeBulkPriceUpdate(auth.user.uid, productIds, percentage);
    return NextResponse.json({
      success: true,
      message: `${result.updatedCount} urunun fiyati basariyla guncellendi.`,
      ...result,
    });
  } catch (err: any) {
    console.error("Bulk price update error:", err);
    return NextResponse.json(
      { error: err?.message || "Fiyat guncelleme islemi basarisiz oldu." },
      { status: 400 }
    );
  }
}
