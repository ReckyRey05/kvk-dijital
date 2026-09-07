import { NextResponse } from "next/server";
import { getSimilarSuppliersForSupplier } from "@/lib/teklifimGelsin/searchService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params;
    if (!supplierId) {
      return NextResponse.json({ error: "Tedarikçi ID'si belirtilmelidir." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 4;

    const similar = await getSimilarSuppliersForSupplier(supplierId, limit);

    return NextResponse.json({
      success: true,
      suppliers: similar,
    });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/suppliers/[supplierId]/similar error:", err);
    return NextResponse.json(
      { error: "Benzer tedarikçiler getirilemedi." },
      { status: 500 }
    );
  }
}
