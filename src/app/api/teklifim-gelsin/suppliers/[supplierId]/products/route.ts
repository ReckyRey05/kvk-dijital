import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getSupplierProducts,
  addSupplierProduct,
  deleteSupplierProduct,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request, props: { params: Promise<{ supplierId: string }> }) {
  try {
    const { supplierId } = await props.params;
    const products = await getSupplierProducts(supplierId);
    return NextResponse.json({ products });
  } catch (err: any) {
    console.error("Teklifim GET products error:", err);
    return NextResponse.json({ error: "Ürünler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ supplierId: string }> }) {
  try {
    const { supplierId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user || user.uid !== supplierId) {
      return NextResponse.json({ error: "Bu firmaya ürün ekleme yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    if (!body.name) {
      return NextResponse.json({ error: "Lütfen ürün adını belirtin." }, { status: 400 });
    }

    const newProduct = await addSupplierProduct(supplierId, body);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error("Teklifim POST product error:", err);
    return NextResponse.json({ error: err.message || "Ürün eklenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ supplierId: string }> }) {
  try {
    const { supplierId } = await props.params;
    const user = await verifyTeklifimUser(req);
    if (!user || user.uid !== supplierId) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "Ürün ID gerekli." }, { status: 400 });
    }

    const deleted = await deleteSupplierProduct(supplierId, productId);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    console.error("Teklifim DELETE product error:", err);
    return NextResponse.json({ error: "Ürün silinemedi." }, { status: 500 });
  }
}
