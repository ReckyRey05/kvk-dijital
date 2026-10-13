"use client";

import React from "react";
import Link from "next/link";
import ItemSepetiFallbackImage from "./ItemSepetiFallbackImage";
import { ItemSepetiPrice } from "./MarketplacePrimitives";
import { ItemSepetiListing } from "@/types/marketplace";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";

interface EditorialGridProps {
  listings: ItemSepetiListing[];
}

export default function ItemSepetiEditorialGrid({ listings }: EditorialGridProps) {
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";

  if (!listings || listings.length === 0) return null;

  const featured = listings[0];
  const sideItems = listings.slice(1, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* WIDE HERO FEATURED ITEM (7 COLS) */}
      <article
        className={`lg:col-span-7 flex flex-col justify-between rounded-[10px] border transition-all duration-150 group overflow-hidden ${
          isDark
            ? "bg-[#181C22] border-[#2A313C] hover:border-[#0F625C]/50 text-[#EDEEF2]"
            : "bg-white border-[#E5E8EB] hover:border-[#0F625C]/50 text-[#15191E] shadow-xs"
        }`}
      >
        {/* Featured Image Surface */}
        <div className="relative w-full h-48 sm:h-60 overflow-hidden bg-black/5 dark:bg-black/30">
          <ItemSepetiFallbackImage
            src={featured.images && featured.images.length > 0 ? featured.images[0] : null}
            alt={featured.title}
            gameName={featured.gameName}
            categoryName={featured.categoryName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 rounded-[5px] text-xs font-semibold bg-[#0F625C] text-white shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Günün Fırsatı
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-3.5 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`font-semibold px-2 py-0.5 rounded-[4px] ${
                  isDark ? "bg-[#0F625C]/20 text-[#168B83]" : "bg-[#F0F4F3] text-[#0F625C]"
                }`}
              >
                {featured.gameName}
              </span>
              <span className={isDark ? "text-[#8E97A4]" : "text-[#69717D]"}>&bull;</span>
              <span className={isDark ? "text-[#8E97A4]" : "text-[#69717D]"}>{featured.categoryName}</span>
              {featured.serverName && (
                <>
                  <span className={isDark ? "text-[#8E97A4]" : "text-[#69717D]"}>&bull;</span>
                  <span className={isDark ? "text-[#8E97A4]" : "text-[#69717D]"}>{featured.serverName}</span>
                </>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-tight group-hover:text-[#0F625C] dark:group-hover:text-[#168B83] transition-colors">
              <Link href={`/ilan/${featured.id}`} className="focus:outline-none focus-visible:underline">
                {featured.title}
              </Link>
            </h3>

            <p className={`text-xs sm:text-sm line-clamp-2 max-w-[65ch] leading-relaxed ${
              isDark ? "text-[#8E97A4]" : "text-[#69717D]"
            }`}>
              {featured.description}
            </p>
          </div>

          <div
            className={`mt-3 pt-3 flex items-center justify-between border-t ${
              isDark ? "border-white/[0.06]" : "border-[#E5E8EB]"
            }`}
          >
            <div>
              <span className={`text-[10px] block font-semibold uppercase tracking-wider ${
                isDark ? "text-[#8E97A4]" : "text-[#69717D]"
              }`}>
                Birim Fiyat
              </span>
              <ItemSepetiPrice amount={featured.unitPrice} size="lg" />
            </div>

            <Link
              href={`/ilan/${featured.id}`}
              className="inline-flex items-center justify-center h-9 px-4 rounded-[8px] text-xs font-semibold text-white transition-all hover:bg-[#0C4F4A] active:scale-95 shadow-xs"
              style={{ backgroundColor: "#0F625C" }}
            >
              Satın Al
            </Link>
          </div>
        </div>
      </article>

      {/* STACKED SUPPORTING ITEMS (5 COLS) */}
      <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
        {sideItems.map((item) => (
          <article
            key={item.id}
            className={`flex-1 p-3.5 sm:p-4 rounded-[10px] border transition-all duration-150 flex items-center gap-3.5 group overflow-hidden ${
              isDark
                ? "bg-[#181C22] border-[#2A313C] hover:border-[#0F625C]/50 text-[#EDEEF2]"
                : "bg-white border-[#E5E8EB] hover:border-[#0F625C]/50 text-[#15191E] shadow-xs"
            }`}
          >
            {/* Small Side Image Thumbnail */}
            <div className="w-20 h-20 rounded-[8px] overflow-hidden bg-black/5 dark:bg-black/30 shrink-0 border border-black/5 dark:border-white/5">
              <ItemSepetiFallbackImage
                src={item.images && item.images.length > 0 ? item.images[0] : null}
                alt={item.title}
                gameName={item.gameName}
                categoryName={item.categoryName}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
              <div className="space-y-1">
                <div className={`flex items-center justify-between text-[11px] ${
                  isDark ? "text-[#8E97A4]" : "text-[#69717D]"
                }`}>
                  <span className="font-semibold truncate max-w-[65%]">{item.gameName}</span>
                  <span className="shrink-0 text-[10px]">{item.categoryName}</span>
                </div>

                <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-[#0F625C] dark:group-hover:text-[#168B83] transition-colors">
                  <Link href={`/ilan/${item.id}`} className="focus:outline-none focus-visible:underline">
                    {item.title}
                  </Link>
                </h4>
              </div>

              <div className="mt-2 flex items-baseline justify-between pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                <ItemSepetiPrice amount={item.unitPrice} size="sm" />
                <Link
                  href={`/ilan/${item.id}`}
                  className="text-xs text-[#0F625C] dark:text-[#168B83] font-semibold hover:underline"
                >
                  İncele &rarr;
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
