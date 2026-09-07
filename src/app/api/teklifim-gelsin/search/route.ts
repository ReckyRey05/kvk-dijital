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
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";
import { RATE_LIMITS } from "@/config/rateLimit";
import { sanitizeSafeString } from "@/lib/teklifimGelsin/security/inputValidation";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export async function GET(req: Request) {
  try {
    // Rate Limiting (60 searches / min per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`teklifim_search:${clientIp}`, RATE_LIMITS.teklifim.search);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck);
    }

    const { searchParams } = new URL(req.url);

    const rawQuery = searchParams.get("q") || searchParams.get("query") || undefined;
    const query = rawQuery ? sanitizeSafeString(rawQuery, 128) : undefined;

    const type = (searchParams.get("type") as TeklifimSearchType) || "all";
    const category = searchParams.get("category") ? sanitizeSafeString(searchParams.get("category"), 80) : undefined;
    const subCategory = searchParams.get("subCategory") ? sanitizeSafeString(searchParams.get("subCategory"), 80) : undefined;
    const city = searchParams.get("city") ? sanitizeSafeString(searchParams.get("city"), 50) : undefined;
    const district = searchParams.get("district") ? sanitizeSafeString(searchParams.get("district"), 50) : undefined;
    const deliveryRegion = searchParams.get("deliveryRegion") ? sanitizeSafeString(searchParams.get("deliveryRegion"), 50) : undefined;
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

    // Clamp limit to max 100 to prevent unbounded memory allocation
    const parsedLimit = limitStr ? parseInt(limitStr, 10) : 30;
    const safeLimit = Math.min(Math.max(1, isNaN(parsedLimit) ? 30 : parsedLimit), 100);
    const parsedOffset = offsetStr ? parseInt(offsetStr, 10) : 0;
    const safeOffset = Math.max(0, isNaN(parsedOffset) ? 0 : parsedOffset);

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
      limit: safeLimit,
      offset: safeOffset,
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

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          // Public search cache for 60s
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    return createSecureServerErrorResponse("UnifiedSearch", err, "Arama işlemi gerçekleştirilemedi.");
  }
}
