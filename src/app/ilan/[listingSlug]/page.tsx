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
import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
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
      description: "Aradığınız ilan bulunamadı veya yayından kaldırılmış olabilir.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${listing.title} Satın Al | İtemSepeti`,
    description: `${listing.gameName} ${listing.title} güvenli escrow emanet koruması ile İtemSepeti'nde. Hemen satın alın ve güvenle teslim alın.`,
    alternates: {
      canonical: `/ilan/${listing.id}`,
    },
    openGraph: {
      title: `${listing.title} | İtemSepeti`,
      description: `${listing.gameName} kategorisinde ${listing.unitPrice} TL fiyatla satılık ilan.`,
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

  // Fetch seller data
  const seller = await getSellerBySlug(listing.sellerId);
  const sellerName = seller?.storeName || (listing as any).sellerStoreName || "Onaylı Satıcı";
  const sellerRating = seller?.ratingAverage || (listing as any).sellerRating || 4.9;
  const sellerRatingCount = seller?.ratingCount || (listing as any).sellerRatingCount || 100;

  // Sanitize seller description to prevent XSS injection
  const safeDescription = sanitizeHtml(listing.description, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "li", "span"],
    allowedAttributes: {},
  });

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 pb-24 lg:pb-10">
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
            <span>/</span>
            <span className="text-inherit font-medium truncate max-w-[200px] sm:max-w-xs">{listing.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT 2 COLS: PRODUCT DETAILS, ATTRIBUTES & DESCRIPTION */}
            <div className="lg:col-span-2 space-y-6">
              {/* MAIN PRODUCT HEADER */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-[6px] bg-black/20 border border-white/5 text-[#9498A6]">
                    {listing.gameName} {listing.serverName ? `• ${listing.serverName}` : ""}
                  </span>
                  <ItemSepetiDeliveryBadge method={listing.deliveryMethod} slaHours={listing.deliverySlaHours} />
                  <ItemSepetiStockBadge stock={listing.stockQuantity} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-inherit leading-tight">
                  {listing.title}
                </h1>
              </div>

              {/* PRODUCT IMAGE DISPLAY */}
              <div
                className="w-full h-64 sm:h-80 rounded-[14px] border flex flex-col items-center justify-center p-6 text-center space-y-2 select-none"
                style={{
                  backgroundColor: "rgba(27, 30, 39, 0.6)",
                  borderColor: "#282C3A",
                }}
              >
                <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center text-[#E8A33D] font-black text-xl">
                  {listing.gameName.substring(0, 3).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-inherit">{listing.title}</span>
                <span className="text-xs text-[#9498A6]">
                  Kategori: {listing.categoryName} &bull; Ürün Tipi: {listing.productType}
                </span>
              </div>

              {/* PRODUCT ATTRIBUTES PANEL (IF ATTRIBUTES EXIST) */}
              {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                <div
                  className="p-5 rounded-[14px] border space-y-3"
                  style={{
                    backgroundColor: "rgba(27, 30, 39, 0.4)",
                    borderColor: "#282C3A",
                  }}
                >
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#9498A6]">
                    Ürün Özellikleri
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {Object.entries(listing.attributes).map(([key, value]) => (
                      <div key={key} className="p-2.5 rounded-[8px] bg-black/20 border border-white/5 space-y-0.5">
                        <span className="text-[#9498A6] capitalize block">{key}</span>
                        <strong className="text-inherit font-semibold">{String(value)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LISTING DESCRIPTION (XSS SAFE) */}
              <div
                className="p-6 rounded-[14px] border space-y-4"
                style={{
                  backgroundColor: "rgba(27, 30, 39, 0.4)",
                  borderColor: "#282C3A",
                }}
              >
                <h2 className="text-base font-bold text-inherit">İlan Açıklaması</h2>
                <div
                  className="text-sm text-[#9498A6] leading-relaxed space-y-2 max-w-[80ch] prose prose-invert"
                  dangerouslySetInnerHTML={{ __html: safeDescription }}
                />
              </div>

              {/* HOW DELIVERY WORKS */}
              <div
                className="p-5 rounded-[14px] border space-y-3"
                style={{
                  backgroundColor: "rgba(27, 30, 39, 0.3)",
                  borderColor: "#282C3A",
                }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9498A6]">
                  Teslimat & Güvenlik
                </h3>
                <ul className="text-xs text-[#9498A6] space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                    <span>Ödemeniz siz ürünü teslim alıp onaylayana kadar İtemSepeti Escrow havuzunda güvendedir.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E8A33D] shrink-0" />
                    <span>
                      Teslimat Süresi Taahhüdü: {listing.deliverySlaHours} saat içinde teslimat güvencesi.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* RIGHT COL: BUY BOX & SELLER PROFILE CARD */}
            <div className="space-y-5">
              <div className="sticky top-24">
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
          </div>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
