import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  listProducts,
  createProduct,
} from "@/lib/teklifimGelsin/productService";
import { getTeklifimProfile } from "@/lib/teklifimGelsin/teklifimService";
import {
  TeklifimStockStatus,
  TeklifimPriceVisibility,
  TeklifimProductStatus,
} from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const supplierId = searchParams.get("supplierId") || undefined;
    const category = searchParams.get("category") || undefined;
    const subCategory = searchParams.get("subCategory") || undefined;
    const stockStatus = (searchParams.get("stockStatus") as TeklifimStockStatus) || undefined;
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");
    const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
    const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;
    const priceVisibility = (searchParams.get("priceVisibility") as TeklifimPriceVisibility) || undefined;
    const searchQuery = searchParams.get("searchQuery") || searchParams.get("q") || undefined;
    const city = searchParams.get("city") || undefined;
    const status = (searchParams.get("status") as TeklifimProductStatus) || undefined;
    const sort = (searchParams.get("sort") as any) || "newest";
    const limitStr = searchParams.get("limit");
    const offsetStr = searchParams.get("offset");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;

    const result = await listProducts({
      supplierId,
      category,
      subCategory,
      stockStatus,
      inStockOnly,
      minPrice,
      maxPrice,
      priceVisibility,
      searchQuery,
      city,
      status,
      sort,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/products error:", err);
    return NextResponse.json({ error: "Ürünler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const profile = await getTeklifimProfile(user.uid);
    if (profile && profile.role !== "supplier" && profile.role !== "admin") {
      return NextResponse.json(
        { error: "Sadece toptancı / tedarikçi hesapları ürün yayınlayabilir." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      name,
      category,
      subCategory,
      sku,
      description,
      imageUrl,
      images,
      minOrder,
      minimumOrder,
      unit,
      price,
      estimatedPrice,
      currency,
      priceVisibility,
      stockStatus,
      stockQuantity,
      trackStock,
      leadTimeDays,
      deliveryRegions,
      status,
    } = body;

    const resolvedTitle = (title || name || "").trim();
    if (!resolvedTitle) {
      return NextResponse.json({ error: "Ürün adı zorunludur." }, { status: 400 });
    }

    if (!category || !category.trim()) {
      return NextResponse.json({ error: "Kategori seçimi zorunludur." }, { status: 400 });
    }

    const newProduct = await createProduct(user.uid, {
      supplierName: profile?.companyName || user.email || "Tedarikçi",
      supplierCity: profile?.city || "İstanbul",
      supplierLogoUrl: profile?.logoUrl || "",
      supplierVerified: profile?.isVerified || false,
      title: resolvedTitle,
      name: resolvedTitle,
      category: category.trim(),
      subCategory: subCategory ? subCategory.trim() : undefined,
      sku: sku ? sku.trim() : undefined,
      description: description ? description.trim() : "",
      imageUrl: imageUrl || (images && images[0]) || "",
      images: images || (imageUrl ? [imageUrl] : []),
      minOrder: minOrder || `${minimumOrder || 1} Adet`,
      minimumOrder: typeof minimumOrder === "number" ? minimumOrder : 1,
      unit: unit || "Adet",
      price: typeof price === "number" ? price : (typeof estimatedPrice === "number" ? estimatedPrice : undefined),
      estimatedPrice: typeof price === "number" ? price : (typeof estimatedPrice === "number" ? estimatedPrice : undefined),
      currency: currency || "TRY",
      priceVisibility: priceVisibility || "public",
      stockStatus: stockStatus || "in_stock",
      stockQuantity: typeof stockQuantity === "number" ? stockQuantity : undefined,
      trackStock: trackStock ?? (typeof stockQuantity === "number"),
      leadTimeDays: typeof leadTimeDays === "number" ? leadTimeDays : undefined,
      deliveryRegions: Array.isArray(deliveryRegions) ? deliveryRegions : (profile?.deliveryRegions || ["Tüm Türkiye"]),
      status: status || "published",
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/teklifim-gelsin/products error:", err);
    return NextResponse.json(
      { error: err.message || "Ürün oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
