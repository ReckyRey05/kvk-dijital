import { NextRequest, NextResponse } from "next/server";
import { getSellerBySlug, getSellerListings } from "@/lib/itemsepeti/catalogService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Satıcı ID veya kullanıcı adı gereklidir." }, { status: 400 });
    }

    const seller = await getSellerBySlug(id);
    if (!seller) {
      return NextResponse.json({ success: false, error: "Satıcı bulunamadı." }, { status: 404 });
    }

    // Public sanitized profile: Do NOT leak IBAN, commissionTierRate or private financial info
    const publicSellerProfile = {
      id: seller.id,
      storeName: seller.storeName,
      storeSlug: seller.storeSlug,
      isVerifiedSeller: seller.isVerifiedSeller,
      ratingAverage: seller.ratingAverage,
      ratingCount: seller.ratingCount,
      completedSalesCount: seller.completedSalesCount,
      averageDeliveryMinutes: seller.averageDeliveryMinutes,
      memberSinceYears: seller.memberSinceYears,
      bio: seller.bio,
    };

    const listings = await getSellerListings(seller.id);

    return NextResponse.json({
      success: true,
      seller: publicSellerProfile,
      listings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Hata oluştu." }, { status: 500 });
  }
}
