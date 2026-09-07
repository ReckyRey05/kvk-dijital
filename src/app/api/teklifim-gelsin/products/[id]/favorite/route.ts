import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { toggleProductFavorite } from "@/lib/teklifimGelsin/productService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const result = await toggleProductFavorite(user.uid, id);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/teklifim-gelsin/products/[id]/favorite error:", err);
    return NextResponse.json(
      { error: "Favori işlemi gerçekleştirilemedi." },
      { status: 500 }
    );
  }
}
