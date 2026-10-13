import { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiGameShelf from "@/components/itemsepeti/marketplace/ItemSepetiGameShelf";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import ItemSepetiFilterBar from "@/components/itemsepeti/marketplace/ItemSepetiFilterBar";
import { getPublicListings, getGameBySlug, getCategoriesByGame } from "@/lib/itemsepeti/catalogService";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}): Promise<Metadata> {
  const { gameSlug } = await params;
  const game = await getGameBySlug(gameSlug);
  const gameName = game ? game.name : gameSlug.toUpperCase();
  return {
    title: `${gameName} İlanları, Fiyatları & Satın Al | İtemSepeti`,
    description: `${gameName} pazarında en uygun fiyatlı ilanları güvenle inceleyin ve satın alın.`,
    alternates: {
      canonical: `/kategori/${gameSlug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ gameSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { gameSlug } = await params;
  const sParams = await searchParams;

  const game = await getGameBySlug(gameSlug);
  const gameName = game ? game.name : gameSlug.toUpperCase();
  const categories = game ? await getCategoriesByGame(game.id) : [];

  const minPrice = sParams.min ? Number(sParams.min) : undefined;
  const maxPrice = sParams.max ? Number(sParams.max) : undefined;
  const serverId = typeof sParams.server === "string" ? sParams.server : undefined;
  const categoryId = typeof sParams.category === "string" ? sParams.category : undefined;
  const inStockOnly = sParams.inStock === "true";
  const sortBy = (typeof sParams.sort === "string" ? sParams.sort : "NEWEST") as any;

  const liveListings = await getPublicListings({
    gameSlug,
    categoryId,
    serverId,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
    limit: 40,
  });

  const listingsToDisplay: ListingCardData[] = liveListings.map((l) => ({
    id: l.id,
    slug: l.id,
    title: l.title,
    gameName: l.gameName,
    categoryName: l.categoryName,
    serverName: l.serverName,
    price: l.unitPrice,
    stock: l.stockQuantity,
    sellerId: l.sellerId,
    sellerName: (l as any).sellerStoreName || "Onaylı Satıcı",
    sellerRating: (l as any).sellerRating || 4.9,
    sellerRatingCount: (l as any).sellerRatingCount || 100,
    isSellerVerified: true,
    deliveryMethod: l.deliveryMethod,
    deliverySlaHours: l.deliverySlaHours,
    image: l.images && l.images.length > 0 ? l.images[0] : undefined,
    images: l.images,
  }));

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
          {/* BREADCRUMB */}
          <nav aria-label="Ekmek Kırıntısı" className="flex items-center gap-1.5 text-xs text-[#69717D] dark:text-[#8E97A4]">
            <Link href="/itemsepeti" className="hover:text-inherit transition-colors">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href="/oyunlar" className="hover:text-inherit transition-colors">
              Oyunlar
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#15191E] dark:text-[#EDEEF2]">{gameName}</span>
          </nav>

          {/* QUICK GAME SWITCHER SHELF */}
          <ItemSepetiGameShelf activeSlug={gameSlug} />

          {/* PAGE TITLE & META */}
          <div className="flex items-baseline justify-between pt-1 border-t border-[#E5E8EB] dark:border-[#2A313C]">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-inherit">
                {gameName} Pazarı
              </h1>
              <p className="text-xs text-[#69717D] dark:text-[#8E97A4] mt-0.5">
                {listingsToDisplay.length} aktif ilan listeleniyor
              </p>
            </div>
          </div>

          {/* FILTER AND SORT BAR */}
          <ItemSepetiFilterBar
            basePath={`/kategori/${gameSlug}`}
            gameServers={game?.servers}
            categories={categories}
            currentCategory={categoryId}
            currentServer={serverId}
            currentMinPrice={sParams.min ? String(sParams.min) : ""}
            currentMaxPrice={sParams.max ? String(sParams.max) : ""}
            currentSort={sortBy}
            currentInStockOnly={inStockOnly}
          />

          {/* LISTINGS GRID */}
          {listingsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {listingsToDisplay.map((listing) => (
                <ItemSepetiListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-[10px] border border-[#E5E8EB] dark:border-[#2A313C] bg-white dark:bg-[#181C22] text-xs text-[#69717D] dark:text-[#8E97A4] space-y-2">
              <p>Bu kategoride kriterlere uygun ilan bulunamadı.</p>
              <Link
                href={`/kategori/${gameSlug}`}
                className="inline-block text-[#0F625C] dark:text-[#168B83] font-semibold hover:underline"
              >
                Filtreleri Temizle &rarr;
              </Link>
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
