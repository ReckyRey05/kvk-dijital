import { NextResponse } from "next/server";
import { getSimilarProductsForProduct } from "@/lib/teklifimGelsin/searchService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Ürün ID'si belirtilmelidir." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 4;

    const similar = await getSimilarProductsForProduct(id, limit);

    return NextResponse.json({
      success: true,
      products: similar,
    });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/products/[id]/similar error:", err);
    return NextResponse.json(
      { error: "Benzer ürünler getirilemedi." },
      { status: 500 }
    );
  }
}
