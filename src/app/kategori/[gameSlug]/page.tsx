import { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import { Filter, ArrowUpDown } from "lucide-react";
import { getPublicListings, getGameBySlug } from "@/lib/itemsepeti/catalogService";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}): Promise<Metadata> {
  const { gameSlug } = await params;
  const gameName = gameSlug === "cs2" ? "Counter-Strike 2 (CS2)" : gameSlug === "metin2" ? "Metin2" : gameSlug.toUpperCase();
  return {
    title: `${gameName} İlanları, Fiyatları & Satın Al | İtemSepeti`,
    description: `${gameName} için en ucuz item, yang, skin ve hesap ilanlarını karşılaştırın, güvenli escrow güvencesiyle anında satın alın.`,
  };
}

const SAMPLE_GAME_LISTINGS: ListingCardData[] = [
  {
    id: "cs_1",
    slug: "ak47-asiimov-ft",
    title: "AK-47 | Asiimov (Field-Tested) 0.18 Float Temiz Görünüm",
    gameName: "CS2",
    categoryName: "Tüfek",
    price: 1850,
    stock: 1,
    sellerName: "DragonTrader",
    sellerRating: 4.9,
    sellerRatingCount: 142,
    isSellerVerified: true,
    deliveryMethod: "MANUAL_ITEM",
    deliverySlaHours: 1,
  },
  {
    id: "cs_2",
    slug: "karambit-doppler-fn",
    title: "★ Karambit | Doppler (Factory New) Phase 2 Pembe Galaxy",
    gameName: "CS2",
    categoryName: "Bıçak",
    price: 24500,
    stock: 1,
    sellerName: "KnifeEmpire",
    sellerRating: 5.0,
    sellerRatingCount: 68,
    isSellerVerified: true,
    deliveryMethod: "MANUAL_ITEM",
    deliverySlaHours: 2,
  },
  {
    id: "cs_3",
    slug: "awp-hyper-beast-mw",
    title: "AWP | Hyper Beast (Minimal Wear) Canlı Renkler",
    gameName: "CS2",
    categoryName: "Keskin Nişancı",
    price: 1200,
    stock: 2,
    sellerName: "SkinStoreTR",
    sellerRating: 4.7,
    sellerRatingCount: 95,
    isSellerVerified: false,
    deliveryMethod: "MANUAL_ITEM",
    deliverySlaHours: 1,
  },
  {
    id: "cs_4",
    slug: "m4a1s-printstream-ft",
    title: "M4A1-S | Printstream (Field-Tested) İncili Beyaz Görünüm",
    gameName: "CS2",
    categoryName: "Tüfek",
    price: 3250,
    stock: 1,
    sellerName: "DragonTrader",
    sellerRating: 4.9,
    sellerRatingCount: 142,
    isSellerVerified: true,
    deliveryMethod: "MANUAL_ITEM",
    deliverySlaHours: 1,
  },
];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  const game = await getGameBySlug(gameSlug);
  const gameName = game ? game.name : gameSlug.toUpperCase();

  // Fetch real listings from database or fallback to demo sample
  const liveListings = await getPublicListings({ gameSlug, limit: 20 });
  const listingsToDisplay: ListingCardData[] = liveListings.length > 0
    ? liveListings.map((l) => ({
        id: l.id,
        slug: l.id,
        title: l.title,
        gameName: l.gameName,
        categoryName: l.categoryName,
        serverName: l.serverName,
        price: l.unitPrice,
        stock: l.stockQuantity,
        sellerName: "Satıcı",
        sellerRating: 4.9,
        sellerRatingCount: 50,
        isSellerVerified: true,
        deliveryMethod: l.deliveryMethod,
        deliverySlaHours: l.deliverySlaHours,
      }))
    : SAMPLE_GAME_LISTINGS;

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
            <span className="text-inherit font-medium">{gameName}</span>
          </nav>

          {/* PAGE HEADER */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-inherit">
              {gameName} İlanları
            </h1>
            <p className="text-xs sm:text-sm text-[#9498A6]">
              {listingsToDisplay.length} aktif ilan listeleniyor. Güvenli escrow güvencesiyle hemen satın alın.
            </p>
          </div>

          {/* SKELETON FILTERS & SORT STRIP */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[10px] border text-xs text-[#9498A6]"
            style={{
              backgroundColor: "rgba(27, 30, 39, 0.4)",
              borderColor: "#282C3A",
            }}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span className="font-semibold text-inherit">Filtrele:</span>
              <span className="px-2 py-1 rounded-[6px] bg-black/20 border border-white/5 text-inherit">Tüm Ürün Tipleri</span>
              <span className="px-2 py-1 rounded-[6px] bg-black/20 border border-white/5 text-inherit">Stokta Olanlar</span>
              <span className="px-2 py-1 rounded-[6px] bg-black/20 border border-white/5 text-inherit">Onaylı Satıcılar</span>
            </div>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sırala:</span>
              <span className="font-semibold text-inherit">Fiyat: Düşükten Yükseğe</span>
            </div>
          </div>

          {/* LISTING GRID & EMPTY STATE */}
          {listingsToDisplay.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-[14px] border border-[#282C3A] space-y-3">
              <h3 className="text-lg font-bold text-inherit">Bu kategoride henüz aktif ilan bulunmuyor.</h3>
              <p className="text-xs text-[#9498A6]">İlk ilanı siz vererek satış yapmaya başlayabilirsiniz.</p>
              <div className="pt-2">
                <Link
                  href="/ilan-ver"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-[10px] text-xs font-semibold text-[#12141A] bg-[#E8A33D]"
                >
                  İlan Ver
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listingsToDisplay.map((listing) => (
                <ItemSepetiListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
