import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  performUnifiedSearch,
  recordSearchHistory,
} from "@/lib/teklifimGelsin/searchService";
import {
  TeklifimSearchFilters,
  TeklifimSearchType,
  TeklifimSearchSort,
  TeklifimStockStatus,
} from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q") || searchParams.get("query") || undefined;
    const type = (searchParams.get("type") as TeklifimSearchType) || "all";
    const category = searchParams.get("category") || undefined;
    const subCategory = searchParams.get("subCategory") || undefined;
    const city = searchParams.get("city") || undefined;
    const district = searchParams.get("district") || undefined;
    const deliveryRegion = searchParams.get("deliveryRegion") || undefined;
    const stockStatus = (searchParams.get("stockStatus") as TeklifimStockStatus) || undefined;
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";

    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");
    const minMoqStr = searchParams.get("minMoq");
    const maxMoqStr = searchParams.get("maxMoq");
    const minRatingStr = searchParams.get("minRating");
    const limitStr = searchParams.get("limit");
    const offsetStr = searchParams.get("offset");

    const filters: TeklifimSearchFilters = {
      query,
      type,
      category,
      subCategory,
      city,
      district,
      deliveryRegion,
      stockStatus,
      inStockOnly,
      verifiedOnly,
      minPrice: minPriceStr ? parseFloat(minPriceStr) : undefined,
      maxPrice: maxPriceStr ? parseFloat(maxPriceStr) : undefined,
      minMoq: minMoqStr ? parseInt(minMoqStr, 10) : undefined,
      maxMoq: maxMoqStr ? parseInt(maxMoqStr, 10) : undefined,
      minRating: minRatingStr ? parseFloat(minRatingStr) : undefined,
      sort: (searchParams.get("sort") as TeklifimSearchSort) || "relevance",
      limit: limitStr ? parseInt(limitStr, 10) : 30,
      offset: offsetStr ? parseInt(offsetStr, 10) : 0,
    };

    const result = await performUnifiedSearch(filters);

    // If user is authenticated and query is present, record history asynchronously
    try {
      const user = await verifyTeklifimUser(req);
      if (user && query) {
        recordSearchHistory(
          user.uid,
          query,
          filters,
          result.totalProducts + result.totalSuppliers
        ).catch(() => {});
      }
    } catch {
      // Non-critical, ignore auth errors on public search
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/search error:", err);
    return NextResponse.json(
      { error: "Arama işlemi gerçekleştirilemedi." },
      { status: 500 }
    );
  }
}
