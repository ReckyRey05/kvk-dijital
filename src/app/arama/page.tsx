import { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import ItemSepetiFilterBar from "@/components/itemsepeti/marketplace/ItemSepetiFilterBar";
import { getPublicListings } from "@/lib/itemsepeti/catalogService";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = await searchParams;
  const q = typeof sParams.q === "string" ? sParams.q : "";
  return {
    title: q ? `"${q}" için Arama Sonuçları | İtemSepeti` : "Pazar Yeri Arama | İtemSepeti",
    robots: {
      index: false,
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
          {/* SEARCH META */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-inherit">
              {q ? `"${q}" için İlanlar` : "Tüm İlanlar"}
            </h1>
            <p className="text-xs text-[#9498A6]">
              {listingsToDisplay.length} sonuç bulundu
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

          {/* RESULTS */}
          {listingsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {listingsToDisplay.map((listing) => (
                <ItemSepetiListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#9498A6] space-y-2">
              <p>Aradığınız ürüne ait aktif ilan bulunamadı.</p>
              <Link
                href="/itemsepeti"
                className="inline-block text-[#E8A33D] font-semibold hover:underline"
              >
                Farklı bir arama yap
              </Link>
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
