import React from "react";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import { ItemSepetiAuthProvider } from "@/context/ItemSepetiAuthContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiHeaderSearch from "@/components/itemsepeti/layout/ItemSepetiHeaderSearch";
import ItemSepetiGameShelf from "@/components/itemsepeti/marketplace/ItemSepetiGameShelf";
import ItemSepetiTrustStrip from "@/components/itemsepeti/marketplace/ItemSepetiTrustStrip";
import ItemSepetiEditorialGrid from "@/components/itemsepeti/marketplace/ItemSepetiEditorialGrid";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import ItemSepetiLiveSupportWidget from "@/components/itemsepeti/support/ItemSepetiLiveSupportWidget";
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
    image: l.images && l.images.length > 0 ? l.images[0] : undefined,
    images: l.images,
  }));

  return (
    <ItemSepetiAuthProvider>
      <ItemSepetiThemeProvider>
        <div className="flex flex-col min-h-screen">
          <ItemSepetiHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
          {/* FOCUSED HERO WITH PRIMARY SEARCH & BYNOGAME-STYLE GAMING PILLS */}
          <section className="text-center max-w-3xl mx-auto space-y-5 pt-2 sm:pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#D99532]/10 text-[#D99532] border border-[#D99532]/20">
              <span className="w-2 h-2 rounded-full bg-[#D99532] animate-pulse"></span>
              <span>Türkiye&apos;nin Oyuncu Pazarı &bull; Güvenli Alışveriş</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-inherit leading-tight">
              Oyun İçi İtem, Yang, Skin ve E-Pin Pazarı
            </h1>

            {/* HERO PROMINENT SEARCH BAR */}
            <div className="w-full">
              <ItemSepetiHeaderSearch
                placeholder="Oyun, skin, yang veya kod ara... (Ctrl+K)"
                className="mx-auto shadow-sm"
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
              <div className="flex items-center justify-between pb-1 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D99532]"></span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#9498A6]">
                    Öne Çıkan Pazarlar &bull; Günün Fırsatları
                  </h2>
                </div>
                <Link
                  href="/kategori/cs2"
                  className="text-xs text-[#E8A33D] hover:underline font-semibold"
                >
                  Tümünü Gör &rarr;
                </Link>
              </div>

              <ItemSepetiEditorialGrid listings={editorialItems} />
            </section>
          )}

          {/* REGULAR LISTINGS STREAM (BORDERLESS SURFACE CARDS) */}
          {remainingListings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D99532]"></span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#9498A6]">
                    Son Eklenen Oyuncu İlanları
                  </h2>
                </div>
                <span className="text-xs text-[#9498A6] font-medium">
                  {remainingListings.length} Canlı İlan
                </span>
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
        <ItemSepetiLiveSupportWidget />
      </div>
    </ItemSepetiThemeProvider>
  </ItemSepetiAuthProvider>
  );
}
