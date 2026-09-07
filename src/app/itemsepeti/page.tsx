import { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import { ShieldCheck, Zap, Headphones } from "lucide-react";
import { getPublicListings, getGames } from "@/lib/itemsepeti/catalogService";

export const metadata: Metadata = {
  title: "İtemSepeti — Oyun İtem Pazarı",
  description:
    "Türkiye'nin güvenilir oyuncu pazaryeri. CS2 skin, Metin2 yang, Valorant VP ve oyun hesaplarını güvenli escrow korumasıyla hemen satın alın.",
};

const FEATURED_GAMES = [
  { slug: "cs2", name: "CS2 (Counter-Strike 2)", category: "Skin & Bıçak", count: "1.240+ İlan" },
  { slug: "metin2", name: "Metin2", category: "Yang, Won & İtem", count: "890+ İlan" },
  { slug: "valorant", name: "Valorant", category: "VP & Hesap", count: "650+ İlan" },
  { slug: "steam", name: "Steam", category: "Cüzdan Kodu & Oyun", count: "420+ İlan" },
  { slug: "pubg-mobile", name: "PUBG Mobile", category: "UC & Hesap", count: "310+ İlan" },
  { slug: "knight-online", name: "Knight Online", category: "GB & İtem", count: "540+ İlan" },
];

const SAMPLE_LISTINGS: ListingCardData[] = [
  {
    id: "lst_1",
    slug: "cs2-ak47-asiimov-field-tested",
    title: "AK-47 | Asiimov (Field-Tested) 0.18 Float Temiz Görünüm",
    gameName: "CS2",
    categoryName: "Skin",
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
    id: "lst_2",
    slug: "metin2-marmara-100m-yang",
    title: "Marmara Sunucusu 100M Yang (Depocu Yanı Hızlı Teslim)",
    gameName: "Metin2",
    categoryName: "Yang",
    serverName: "Marmara",
    price: 240,
    stock: 15,
    sellerName: "AnadoluPazar",
    sellerRating: 5.0,
    sellerRatingCount: 388,
    isSellerVerified: true,
    deliveryMethod: "CURRENCY_TRADE",
    deliverySlaHours: 1,
  },
  {
    id: "lst_3",
    slug: "valorant-1200-vp-dijital-kod",
    title: "Valorant 1200 VP TR Dijital E-Pin Kodu (Anında Teslim)",
    gameName: "Valorant",
    categoryName: "Dijital Kod",
    price: 310,
    stock: 84,
    sellerName: "PinMerkezi",
    sellerRating: 4.8,
    sellerRatingCount: 920,
    isSellerVerified: true,
    deliveryMethod: "AUTOMATIC_CODE",
  },
  {
    id: "lst_4",
    slug: "steam-cuzdan-kodu-100-tl",
    title: "100 TL Steam Cüzdan Kodu TR Bölge Uyumlu",
    gameName: "Steam",
    categoryName: "Cüzdan Kodu",
    price: 105,
    stock: 50,
    sellerName: "GlobalKeyStore",
    sellerRating: 4.9,
    sellerRatingCount: 512,
    isSellerVerified: true,
    deliveryMethod: "AUTOMATIC_CODE",
  },
];

export default async function ItemSepetiHomePage() {
  const liveGames = await getGames();
  const liveListings = await getPublicListings({ limit: 8 });

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
    : SAMPLE_LISTINGS;

  const gamesToDisplay = liveGames.length > 0 ? liveGames : FEATURED_GAMES;

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
          {/* HERO SECTION — ARADIĞIN İTEM BURADA */}
          <section className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-8">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-inherit leading-[1.15]">
              Aradığın item burada.
            </h1>
            <p className="text-sm sm:text-base text-[#9498A6] max-w-[80ch] mx-auto leading-relaxed">
              Oyun itemleri, oyun parası ve dijital kodları tek yerde bul. Güvenli escrow emanet koruması ile alışveriş yap.
            </p>
          </section>

          {/* SINGLE-LINE TRUST STRIP (NO 3 SEPARATE GIANT CARDS) */}
          <section
            aria-label="Güven ve Hizmet Özeti"
            className="flex flex-wrap items-center justify-around gap-4 py-3 px-6 rounded-[14px] border text-xs text-[#9498A6]"
            style={{
              backgroundColor: "rgba(27, 30, 39, 0.4)",
              borderColor: "#282C3A",
            }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span className="font-semibold text-inherit">Güvenli Escrow Ödeme</span>
            </div>
            <div className="hidden sm:block text-[#282C3A]">&bull;</div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#E8A33D]" />
              <span className="font-semibold text-inherit">Hızlı Teslimat</span>
            </div>
            <div className="hidden sm:block text-[#282C3A]">&bull;</div>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#9498A6]" />
              <span className="font-semibold text-inherit">7/24 Türkçe Destek</span>
            </div>
          </section>

          {/* POPULAR GAME CATEGORIES */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-inherit">
                Popüler Oyunlar
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {gamesToDisplay.map((game: any) => (
                <Link
                  key={game.slug}
                  href={`/kategori/${game.slug}`}
                  className="group flex flex-col justify-between p-3.5 rounded-[12px] border transition-all hover:border-[#E8A33D]/50 cursor-pointer"
                  style={{
                    backgroundColor: "rgba(27, 30, 39, 0.5)",
                    borderColor: "#282C3A",
                  }}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-inherit block group-hover:text-[#E8A33D] transition-colors truncate">
                      {game.name}
                    </span>
                    <span className="text-[11px] text-[#9498A6] block truncate">
                      {game.category || game.supportedProductTypes?.join(", ") || "Oyun Pazar"}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#E8A33D] font-medium pt-2 block">
                    {game.count || "Aktif İlanlar"}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* FEATURED LISTINGS GRID */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-inherit">
                Öne Çıkan İlanlar
              </h2>
              <Link
                href="/kategori/cs2"
                className="text-xs font-semibold text-[#E8A33D] hover:underline"
              >
                Tüm İlanları Gör
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listingsToDisplay.map((listing) => (
                <ItemSepetiListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
