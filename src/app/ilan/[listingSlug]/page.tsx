import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiBuyBox from "@/components/itemsepeti/marketplace/ItemSepetiBuyBox";
import {
  ItemSepetiDeliveryBadge,
  ItemSepetiStockBadge,
} from "@/components/itemsepeti/marketplace/MarketplacePrimitives";
import { getListingById, getSellerBySlug } from "@/lib/itemsepeti/catalogService";
import { Clock, CheckCircle2 } from "lucide-react";
import sanitizeHtml from "sanitize-html";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingSlug: string }>;
}): Promise<Metadata> {
  const { listingSlug } = await params;
  const listing = await getListingById(listingSlug);

  if (!listing) {
    return {
      title: "İlan Bulunamadı | İtemSepeti",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${listing.title} Satın Al | İtemSepeti`,
    description: `${listing.gameName} ${listing.title} güvenli escrow emanet koruması ile İtemSepeti'nde.`,
    alternates: {
      canonical: `/ilan/${listing.id}`,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ listingSlug: string }>;
}) {
  const { listingSlug } = await params;
  const listing = await getListingById(listingSlug);

  if (!listing) {
    notFound();
  }

  const seller = await getSellerBySlug(listing.sellerId);
  const sellerName = seller?.storeName || (listing as any).sellerStoreName || "Onaylı Satıcı";
  const sellerRating = seller?.ratingAverage || (listing as any).sellerRating || 4.9;
  const sellerRatingCount = seller?.ratingCount || (listing as any).sellerRatingCount || 100;

  const safeDescription = sanitizeHtml(listing.description, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "li", "span"],
    allowedAttributes: {},
  });

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 lg:pb-8">
          {/* BREADCRUMB */}
          <nav aria-label="Ekmek Kırıntısı" className="flex items-center gap-2 text-xs text-[#9498A6] flex-wrap">
            <Link href="/itemsepeti" className="hover:text-inherit transition-colors">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href={`/kategori/${listing.gameId.replace('game_', '')}`} className="hover:text-inherit transition-colors">
              {listing.gameName}
            </Link>
            <span>/</span>
            <span className="text-[#9498A6]">{listing.categoryName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT 7 COLS: PRODUCT VISUAL, ATTRIBUTES & DESCRIPTION */}
            <div className="lg:col-span-7 space-y-6">
              {/* MAIN PRODUCT HEADER */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-black/30 text-[#E8A33D]">
                    {listing.gameName} {listing.serverName ? `• ${listing.serverName}` : ""}
                  </span>
                  <ItemSepetiDeliveryBadge method={listing.deliveryMethod} slaHours={listing.deliverySlaHours} />
                  <ItemSepetiStockBadge stock={listing.stockQuantity} />
                </div>

                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-inherit leading-tight">
                  {listing.title}
                </h1>
              </div>

              {/* PRODUCT HERO IMAGE SURFACE */}
              <div
                className="w-full h-60 sm:h-72 rounded-[16px] flex flex-col items-center justify-center p-6 text-center space-y-2 select-none"
                style={{
                  backgroundColor: "#161921",
                }}
              >
                <div className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center text-[#E8A33D] font-black text-lg">
                  {listing.gameName.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-inherit">{listing.title}</span>
                <span className="text-xs text-[#9498A6]">
                  {listing.categoryName} &bull; {listing.productType}
                </span>
              </div>

              {/* PRODUCT ATTRIBUTES */}
              {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                <div
                  className="p-5 rounded-[14px] space-y-3"
                  style={{
                    backgroundColor: "#161921",
                  }}
                >
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#9498A6]">
                    Özellikler
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(listing.attributes).map(([key, value]) => (
                      <div key={key} className="p-2 rounded-[6px] bg-black/20 space-y-0.5">
                        <span className="text-[#9498A6] text-[10px] capitalize block">{key}</span>
                        <span className="text-inherit font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LISTING DESCRIPTION */}
              <div
                className="p-5 rounded-[14px] space-y-3"
                style={{
                  backgroundColor: "#161921",
                }}
              >
                <h2 className="text-sm font-bold text-inherit">Açıklama</h2>
                <div
                  className="text-xs sm:text-sm text-[#9498A6] leading-relaxed space-y-2 max-w-[70ch]"
                  dangerouslySetInnerHTML={{ __html: safeDescription }}
                />
              </div>

              {/* DELIVERY SLA */}
              <div className="flex items-center gap-3 text-xs text-[#9498A6] px-1">
                <Clock className="w-4 h-4 text-[#E8A33D] shrink-0" />
                <span>
                  Teslimat Güvencesi: Satıcı <strong>{listing.deliverySlaHours} saat</strong> içinde teslim etmeyi taahhüt eder.
                </span>
              </div>
            </div>

            {/* RIGHT 5 COLS: BUY BOX */}
            <div className="lg:col-span-5 sticky top-24">
              <ItemSepetiBuyBox
                listingId={listing.id}
                unitPrice={listing.unitPrice}
                stockQuantity={listing.stockQuantity}
                minQuantity={listing.minQuantity || 1}
                deliveryMethod={listing.deliveryMethod}
                deliverySlaHours={listing.deliverySlaHours}
                sellerId={listing.sellerId}
                sellerName={sellerName}
                sellerRating={sellerRating}
                sellerRatingCount={sellerRatingCount}
                isSellerVerified={seller?.isVerifiedSeller ?? true}
                memberSinceYears={seller?.memberSinceYears ?? 2}
                completedSalesCount={seller?.completedSalesCount ?? 140}
                averageDeliveryMinutes={seller?.averageDeliveryMinutes ?? 15}
                currentUserId="demo_buyer_user_1"
              />
            </div>
          </div>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
