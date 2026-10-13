import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiHeaderSearch from "@/components/itemsepeti/layout/ItemSepetiHeaderSearch";
import ItemSepetiGameShelf from "@/components/itemsepeti/marketplace/ItemSepetiGameShelf";
import ItemSepetiTrustStrip from "@/components/itemsepeti/marketplace/ItemSepetiTrustStrip";
import ItemSepetiEditorialGrid from "@/components/itemsepeti/marketplace/ItemSepetiEditorialGrid";
import ItemSepetiListingCard, { ListingCardData } from "@/components/itemsepeti/marketplace/ItemSepetiListingCard";
import ItemSepetiLiveSupportWidget from "@/components/itemsepeti/support/ItemSepetiLiveSupportWidget";
import { getPublicListings } from "@/lib/itemsepeti/catalogService";

export const metadata: Metadata = {
  title: "İtemSepeti | Türkiye'nin En Güvenilir Oyuncu Pazarı & E-Pin Platformu",
  description: "CS2 skin, Metin2 yang & item, Valorant VP, Knight Online GB, Steam ve dijital kodları %100 Escrow güvencesiyle 7/24 güvenle alın veya satın.",
  keywords: [
    "itemsepeti",
    "oyuncu pazarı",
    "cs2 skin al",
    "metin2 yang al",
    "knight online gb",
    "valorant vp",
    "e-pin satın al",
    "güvenli oyuncu pazarı",
    "escrow oyun pazarı"
  ],
  openGraph: {
    title: "İtemSepeti — Türkiye'nin Oyuncu Pazarı",
    description: "CS2, Metin2, Knight Online, Valorant ve popüler tüm oyunlarda güvenli alışveriş ve anında teslimat.",
    url: "https://kvkdijitalcozumler.com/itemsepeti",
    siteName: "İtemSepeti",
    locale: "tr_TR",
    type: "website",
  },
};

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
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
          <ItemSepetiHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-8 sm:space-y-10">
          {/* COMPACT WELCOME & PRIMARY SEARCH AREA */}
          <section className="text-center max-w-2xl mx-auto space-y-4 pt-1 sm:pt-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-inherit leading-snug">
              Aradığın oyun ürününü kolayca bul.
            </h1>
            <p className="text-xs sm:text-sm text-[#69717D] dark:text-[#8E97A4]">
              Oyun içi eşyalar, oyun paraları ve dijital kodlar tek bir pazarda.
            </p>

            {/* SINGLE PROMINENT SEARCH */}
            <div className="w-full pt-1">
              <ItemSepetiHeaderSearch
                placeholder="Oyun, item, e-pin veya satıcı ara... (Ctrl+K)"
                className="mx-auto shadow-xs"
              />
            </div>

            {/* POPULAR GAME PILLS COMPACT */}
            <div className="pt-1">
              <ItemSepetiGameShelf />
            </div>
          </section>

          {/* VERIFIED TRUST STRIP */}
          <ItemSepetiTrustStrip />

          {/* FEATURED MARKET LISTINGS */}
          {editorialItems.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E8EB] dark:border-[#2A313C]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0F625C] dark:bg-[#168B83]"></span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#15191E] dark:text-[#EDEEF2]">
                    Öne Çıkan Ürünler
                  </h2>
                </div>
                <Link
                  href="/oyunlar"
                  className="text-xs text-[#0F625C] dark:text-[#168B83] hover:underline font-semibold"
                >
                  Tüm Pazarlar &rarr;
                </Link>
              </div>

              <ItemSepetiEditorialGrid listings={editorialItems} />
            </section>
          )}

          {/* NEWLY ADDED PLAYER LISTINGS */}
          {remainingListings.length > 0 ? (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E8EB] dark:border-[#2A313C]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0F625C] dark:bg-[#168B83]"></span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#15191E] dark:text-[#EDEEF2]">
                    Yeni Eklenen İlanlar
                  </h2>
                </div>
                <span className="text-xs text-[#69717D] dark:text-[#8E97A4] font-medium">
                  {remainingListings.length} Güncel İlan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {remainingListings.map((listing) => (
                  <ItemSepetiListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          ) : (
            <section className="p-8 text-center rounded-[10px] border border-[#E5E8EB] dark:border-[#2A313C] bg-white dark:bg-[#181C22]">
              <p className="text-sm text-[#69717D] dark:text-[#8E97A4]">Henüz yeni ilan bulunmuyor.</p>
              <Link
                href="/ilan-ver"
                className="mt-3 inline-flex items-center text-xs font-semibold text-[#0F625C] dark:text-[#168B83] hover:underline"
              >
                İlk ilanı sen oluştur &rarr;
              </Link>
            </section>
          )}
        </main>

        <ItemSepetiFooter />
        <ItemSepetiLiveSupportWidget />
      </div>
    </ItemSepetiThemeProvider>
  );
}
