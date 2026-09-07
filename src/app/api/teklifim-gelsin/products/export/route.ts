import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { exportSupplierProductsToCsv } from "@/lib/teklifimGelsin/productService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedSupplierId = searchParams.get("supplierId");

    // Supplier can only export their own products, unless admin
    const targetSupplierId = requestedSupplierId && user.role === "admin"
      ? requestedSupplierId
      : user.uid;

    const csvData = await exportSupplierProductsToCsv(targetSupplierId);

    const filename = `urun-katalogu-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/products/export error:", err);
    return NextResponse.json(
      { error: "Katalog dışa aktarma başarısız." },
      { status: 500 }
    );
  }
}
