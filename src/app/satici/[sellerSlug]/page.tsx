import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import { getSellerBySlug, getSellerListings } from "@/lib/itemsepeti/catalogService";
import { Star } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sellerSlug: string }>;
}): Promise<Metadata> {
  const { sellerSlug } = await params;
  const seller = await getSellerBySlug(sellerSlug);

  if (!seller) {
    return {
      title: "Satıcı Bulunamadı | İtemSepeti",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${seller.storeName} Mağazası & İlanları | İtemSepeti`,
    description: `${seller.storeName} satıcısının onaylı mağaza profili ve ilanları İtemSepeti'nde.`,
    alternates: {
      canonical: `/satici/${seller.storeSlug}`,
    },
  };
}

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ sellerSlug: string }>;
}) {
  const { sellerSlug } = await params;
  const seller = await getSellerBySlug(sellerSlug);

  if (!seller) {
    notFound();
  }

  const listings = await getSellerListings(seller.id);

  const listingsToDisplay: ListingCardData[] = listings.map((l) => ({
    id: l.id,
    slug: l.id,
    title: l.title,
    gameName: l.gameName,
    categoryName: l.categoryName,
    serverName: l.serverName,
    price: l.unitPrice,
    stock: l.stockQuantity,
    sellerId: l.sellerId,
    sellerName: seller.storeName,
    sellerRating: seller.ratingAverage,
    sellerRatingCount: seller.ratingCount,
    isSellerVerified: seller.isVerifiedSeller,
    deliveryMethod: l.deliveryMethod,
    deliverySlaHours: l.deliverySlaHours,
  }));

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
          {/* BREADCRUMB */}
          <nav aria-label="Ekmek Kırıntısı" className="flex items-center gap-2 text-xs text-[#9498A6]">
            <Link href="/itemsepeti" className="hover:text-inherit transition-colors">
              Ana Sayfa
            </Link>
            <span>/</span>
            <span className="text-[#9498A6]">Satıcılar</span>
            <span>/</span>
            <span className="text-inherit font-medium">{seller.storeName}</span>
          </nav>

          {/* CLEAN STORE BANNER */}
          <div
            className="p-6 rounded-[16px] space-y-4"
            style={{
              backgroundColor: "#161921",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-[10px] bg-black/40 flex items-center justify-center text-lg font-black text-[#E8A33D]">
                  {seller.storeName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-inherit">{seller.storeName}</h1>
                    {seller.isVerifiedSeller && (
                      <span className="text-[10px] bg-[#34D399]/15 text-[#34D399] font-bold px-1.5 py-0.5 rounded-[4px]">
                        Onaylı
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9498A6] mt-0.5">{seller.bio}</p>
                </div>
              </div>

              {/* STATS STRIP */}
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <div className="flex items-center gap-1 font-bold text-inherit">
                    <Star className="w-3.5 h-3.5 fill-[#E8A33D] text-[#E8A33D]" />
                    <span>{seller.ratingAverage.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-[#9498A6]">{seller.ratingCount} değerlendirme</span>
                </div>

                <div className="h-6 w-px bg-white/[0.06]" />

                <div>
                  <span className="font-bold text-inherit block">{seller.completedSalesCount}</span>
                  <span className="text-[10px] text-[#9498A6]">tamamlanan</span>
                </div>

                <div className="h-6 w-px bg-white/[0.06]" />

                <div>
                  <span className="font-bold text-inherit block">{seller.averageDeliveryMinutes} dk</span>
                  <span className="text-[10px] text-[#9498A6]">teslimat</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE LISTINGS */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9498A6]">
              Satıcının İlanları ({listingsToDisplay.length})
            </h2>

            {listingsToDisplay.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {listingsToDisplay.map((listing) => (
                  <ItemSepetiListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#9498A6]">
                Bu satıcının şu anda aktif ilanı bulunmamaktadır.
              </div>
            )}
          </div>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
