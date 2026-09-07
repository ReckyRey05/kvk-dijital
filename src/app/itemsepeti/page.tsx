import React from "react";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiHeaderSearch from "@/components/itemsepeti/layout/ItemSepetiHeaderSearch";
import ItemSepetiGameShelf from "@/components/itemsepeti/marketplace/ItemSepetiGameShelf";
import ItemSepetiTrustStrip from "@/components/itemsepeti/marketplace/ItemSepetiTrustStrip";
import ItemSepetiEditorialGrid from "@/components/itemsepeti/marketplace/ItemSepetiEditorialGrid";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import { getPublicListings } from "@/lib/itemsepeti/catalogService";

export default async function ItemSepetiHomePage() {
  const liveListings = await getPublicListings({ limit: 12 });

  const editorialItems = liveListings.slice(0, 4);
  const remainingListings: ListingCardData[] = liveListings.slice(4).map((l) => ({
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
    sellerRatingCount: (l as any).sellerRatingCount || 50,
    isSellerVerified: true,
    deliveryMethod: l.deliveryMethod,
    deliverySlaHours: l.deliverySlaHours,
  }));

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
          {/* FOCUSED HERO WITH PRIMARY SEARCH */}
          <section className="text-center max-w-2xl mx-auto space-y-5 pt-2 sm:pt-6">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-inherit leading-tight">
              Aradığın item burada.
            </h1>

            {/* HERO PROMINENT SEARCH BAR */}
            <div className="w-full">
              <ItemSepetiHeaderSearch
                placeholder="Oyun, skin, yang veya kod ara... (Ctrl+K)"
                className="mx-auto"
              />
            </div>

            {/* INTEGRATED GAME SHELF DIRECTLY UNDER SEARCH */}
            <div className="pt-2">
              <ItemSepetiGameShelf />
            </div>
          </section>

          {/* LIGHTWEIGHT BORDERLESS TRUST STRIP */}
          <ItemSepetiTrustStrip />

          {/* EDITORIAL MARKET GRID (RHYTHM-BREAKING ASYMMETRIC SECTION) */}
          {editorialItems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#9498A6]">
                  Öne Çıkan Pazarlar
                </h2>
                <Link
                  href="/kategori/cs2"
                  className="text-xs text-[#E8A33D] hover:underline font-semibold"
                >
                  Tümünü Gör
                </Link>
              </div>

              <ItemSepetiEditorialGrid listings={editorialItems} />
            </section>
          )}

          {/* REGULAR LISTINGS STREAM (BORDERLESS SURFACE CARDS) */}
          {remainingListings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#9498A6]">
                  Son İlanlar
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {remainingListings.map((listing) => (
                  <ItemSepetiListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
