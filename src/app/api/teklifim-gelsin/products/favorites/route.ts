import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getUserFavoriteProducts } from "@/lib/teklifimGelsin/productService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const favorites = await getUserFavoriteProducts(user.uid);
    return NextResponse.json({ favorites });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/products/favorites error:", err);
    return NextResponse.json(
      { error: "Favori ürünler getirilemedi." },
      { status: 500 }
    );
  }
}
