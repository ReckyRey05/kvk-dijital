import { NextRequest, NextResponse } from "next/server";
import { getSellerBySlug, getSellerListings } from "@/lib/itemsepeti/catalogService";
import { getSellerReviews, calculateSellerReputation } from "@/lib/itemsepeti/reviewService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  try {
    const { storeSlug } = await params;
    const seller = await getSellerBySlug(storeSlug);

    const storeName = seller?.storeName || storeSlug;
    const listings = await getSellerListings(storeName);
    const reviews = getSellerReviews(storeName);
    const reputation = calculateSellerReputation(storeName);

    return NextResponse.json({
      success: true,
      seller: seller || {
        id: "seller_" + storeSlug,
        storeName: storeSlug,
        storeSlug: storeSlug,
        isVerifiedSeller: true,
        ratingAverage: reputation.averageRating,
        ratingCount: reputation.reviewCount || 85,
        completedSalesCount: 120,
        averageDeliveryMinutes: 15,
        memberSinceYears: 2,
        bio: "Güvenilir oyuncu pazarı satıcısı. Anında teslimat ve 7/24 canlı destek.",
      },
      listings,
      reviews,
      reputation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Mağaza yüklenemedi." },
      { status: 500 }
    );
  }
}
