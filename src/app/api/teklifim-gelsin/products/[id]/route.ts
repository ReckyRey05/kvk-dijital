import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getProductById,
  updateProduct,
  deleteOrArchiveProduct,
} from "@/lib/teklifimGelsin/productService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const incrementView = searchParams.get("view") === "true";

    const product = await getProductById(id, incrementView);
    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/products/[id] error:", err);
    return NextResponse.json({ error: "Ürün getirilemedi." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const updates = await req.json().catch(() => ({}));
    const updated = await updateProduct(id, user.uid, updates);

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error("PUT /api/teklifim-gelsin/products/[id] error:", err);
    const status = err.message?.includes("Yetkisiz") ? 403 : 400;
    return NextResponse.json(
      { error: err.message || "Ürün güncellenemedi." },
      { status }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get("hard") === "true";

    const success = await deleteOrArchiveProduct(id, user.uid, hardDelete);
    if (!success) {
      return NextResponse.json({ error: "Ürün bulunamadı veya silinemedi." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Ürün başarıyla kaldırıldı." });
  } catch (err: any) {
    console.error("DELETE /api/teklifim-gelsin/products/[id] error:", err);
    const status = err.message?.includes("yetkiniz") ? 403 : 400;
    return NextResponse.json(
      { error: err.message || "Ürün silinemedi." },
      { status }
    );
  }
}
