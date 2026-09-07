import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getTeklifimProfile } from "@/lib/teklifimGelsin/teklifimService";
import { importProductsFromCsv } from "@/lib/teklifimGelsin/productService";

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const profile = await getTeklifimProfile(user.uid);
    if (profile && profile.role !== "supplier" && profile.role !== "admin") {
      return NextResponse.json(
        { error: "Sadece toptancı / tedarikçi hesapları toplu ürün yükleyebilir." },
        { status: 403 }
      );
    }

    let csvContent = "";
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "CSV dosyası seçilmedi." }, { status: 400 });
      }
      csvContent = await file.text();
    } else {
      const body = await req.json().catch(() => ({}));
      csvContent = body.csv || body.csvContent || "";
    }

    if (!csvContent.trim()) {
      return NextResponse.json({ error: "CSV içeriği boş olamaz." }, { status: 400 });
    }

    // Strict tenant isolation: supplierId is strictly user.uid
    const report = await importProductsFromCsv(user.uid, csvContent);

    return NextResponse.json({
      success: report.successfulCount > 0,
      report,
    });
  } catch (err: any) {
    console.error("POST /api/teklifim-gelsin/products/import error:", err);
    return NextResponse.json(
      { error: err.message || "Toplu ürün yükleme işlemi başarısız oldu." },
      { status: 500 }
    );
  }
}
