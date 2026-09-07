import { NextRequest, NextResponse } from "next/server";
import { createListing, getPublicListings } from "@/lib/itemsepeti/catalogService";
import { ListingValidationInput } from "@/lib/itemsepeti/catalogUtils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const serverId = searchParams.get("serverId") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const searchQuery = searchParams.get("q") || undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "NEWEST";

    const listings = await getPublicListings({
      gameId,
      categoryId,
      serverId,
      minPrice,
      maxPrice,
      inStockOnly,
      searchQuery,
      sortBy,
    });

    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "İlanlar listelenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check authorization header or mock seller for development
    const authHeader = req.headers.get("Authorization");
    const sellerId = authHeader ? authHeader.replace("Bearer ", "").trim() : body.sellerId;

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: "İlan oluşturmak için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const payload: ListingValidationInput = {
      sellerId,
      gameId: body.gameId,
      categoryId: body.categoryId,
      serverId: body.serverId,
      productType: body.productType,
      title: body.title,
      description: body.description,
      unitPrice: Number(body.unitPrice),
      stockQuantity: Number(body.stockQuantity),
      minQuantity: body.minQuantity ? Number(body.minQuantity) : 1,
      deliveryMethod: body.deliveryMethod,
      deliverySlaHours: Number(body.deliverySlaHours || 1),
    };

    const result = await createListing(payload);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, errors: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, listing: result.listing }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "İlan oluşturulamadı." },
      { status: 500 }
    );
  }
}
