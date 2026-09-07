import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import { getSellerBySlug, getSellerListings } from "@/lib/itemsepeti/catalogService";
import { ShieldCheck, Star, Clock, CheckCircle2, ShoppingBag } from "lucide-react";

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
    description: `${seller.storeName} satıcısının onaylı mağaza profili, puanları ve aktif oyun ilanları İtemSepeti güvencesiyle burada.`,
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

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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

          {/* SELLER STORE BANNER / HEADER */}
          <div
            className="p-6 rounded-[14px] border space-y-4"
            style={{
              backgroundColor: "rgba(27, 30, 39, 0.6)",
              borderColor: "#282C3A",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[12px] bg-black/30 border border-white/10 flex items-center justify-center text-xl font-bold text-[#E8A33D]">
                  {seller.storeName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-inherit">{seller.storeName}</h1>
                    {seller.isVerifiedSeller && (
                      <span className="text-xs bg-[#34D399]/15 text-[#34D399] font-bold px-2 py-0.5 rounded-[6px] border border-[#34D399]/30">
                        Onaylı Satıcı
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9498A6] mt-0.5 max-w-md">{seller.bio}</p>
                </div>
              </div>

              {/* STATS STRIP */}
              <div className="flex items-center gap-4 text-xs">
                <div className="text-center sm:text-right">
                  <div className="flex items-center gap-1 font-bold text-sm text-[#E8A33D]">
                    <Star className="w-3.5 h-3.5 fill-[#E8A33D]" />
                    <span>{seller.ratingAverage.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-[#9498A6]">{seller.ratingCount} Değerlendirme</span>
                </div>

                <div className="h-8 w-px bg-white/10" />

                <div className="text-center sm:text-right">
                  <span className="font-bold text-sm text-inherit block">{seller.completedSalesCount}</span>
                  <span className="text-[10px] text-[#9498A6]">Başarılı Satış</span>
                </div>

                <div className="h-8 w-px bg-white/10" />

                <div className="text-center sm:text-right">
                  <span className="font-bold text-sm text-inherit block">{seller.averageDeliveryMinutes} dk</span>
                  <span className="text-[10px] text-[#9498A6]">Ort. Teslimat</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE LISTINGS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-inherit flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#E8A33D]" />
                <span>Satıcının Aktif İlanları ({listingsToDisplay.length})</span>
              </h2>
            </div>

            {listingsToDisplay.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {listingsToDisplay.map((listing) => (
                  <ItemSepetiListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div
                className="p-8 text-center rounded-[14px] border text-xs text-[#9498A6]"
                style={{
                  backgroundColor: "rgba(27, 30, 39, 0.3)",
                  borderColor: "#282C3A",
                }}
              >
                Bu satıcının şu anda yayında olan aktif ilanı bulunmamaktadır.
              </div>
            )}
          </div>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
