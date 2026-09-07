import { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import ItemSepetiFilterBar from "@/components/itemsepeti/marketplace/ItemSepetiFilterBar";
import { getPublicListings } from "@/lib/itemsepeti/catalogService";
import { SearchX, Search } from "lucide-react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = await searchParams;
  const q = typeof sParams.q === "string" ? sParams.q : "";
  return {
    title: q ? `"${q}" için Arama Sonuçları | İtemSepeti` : "Pazar Yeri Arama | İtemSepeti",
    description: `İtemSepeti pazar yerinde "${q}" için en uygun fiyatlı ve güvenli oyun içi ürünleri keşfedin.`,
    robots: {
      index: false, // Search query pages should not dilute SEO index
      follow: true,
    },
  };
}

export default async function SearchResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = await searchParams;
  const q = typeof sParams.q === "string" ? sParams.q.trim() : "";

  // Parse filters from URL
  const minPrice = sParams.min ? Number(sParams.min) : undefined;
  const maxPrice = sParams.max ? Number(sParams.max) : undefined;
  const serverId = typeof sParams.server === "string" ? sParams.server : undefined;
  const inStockOnly = sParams.inStock === "true";
  const sortBy = (typeof sParams.sort === "string" ? sParams.sort : "NEWEST") as any;

  const listings = await getPublicListings({
    searchQuery: q,
    serverId,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
    limit: 50,
  });

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
    sellerName: (l as any).sellerStoreName || "Onaylı Satıcı",
    sellerRating: (l as any).sellerRating || 4.9,
    sellerRatingCount: (l as any).sellerRatingCount || 100,
    isSellerVerified: true,
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
            <span className="text-inherit font-medium">Arama Sonuçları</span>
          </nav>

          {/* PAGE TITLE & SEARCH QUERY DISPLAY */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-inherit flex items-center gap-3">
              <Search className="w-6 h-6 text-[#E8A33D]" />
              <span>{q ? `"${q}" için Arama Sonuçları` : "Tüm İlanlar"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#9498A6]">
              {listingsToDisplay.length} ilan bulundu.
            </p>
          </div>

          {/* FILTER BAR */}
          <ItemSepetiFilterBar
            basePath="/arama"
            currentMinPrice={sParams.min ? String(sParams.min) : ""}
            currentMaxPrice={sParams.max ? String(sParams.max) : ""}
            currentSort={sortBy}
            currentInStockOnly={inStockOnly}
          />

          {/* LISTING GRID */}
          {listingsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listingsToDisplay.map((listing) => (
                <ItemSepetiListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div
              className="p-12 text-center rounded-[14px] border space-y-4 select-none"
              style={{
                backgroundColor: "rgba(27, 30, 39, 0.3)",
                borderColor: "#282C3A",
              }}
            >
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-[#9498A6]">
                <SearchX className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-inherit">Aradığın ürünü bulamadık.</h3>
                <p className="text-xs text-[#9498A6]">
                  Farklı bir oyun veya ürün adı arayabilir veya popüler kategorilere göz atabilirsin.
                </p>
              </div>
              <Link
                href="/itemsepeti"
                className="inline-flex items-center justify-center px-4 py-2 rounded-[10px] text-xs font-semibold bg-[#E8A33D] text-[#12141A] transition-transform active:scale-95"
              >
                Aramayı Değiştir
              </Link>
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
