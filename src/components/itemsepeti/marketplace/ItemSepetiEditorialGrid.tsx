"use client";

import React from "react";
import Link from "next/link";
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
        className={`lg:col-span-7 flex flex-col justify-between rounded-[16px] border transition-all duration-200 group overflow-hidden ${
          isDark
            ? "bg-[#161921] border-[#282C3A] hover:border-[#D99532]/60 text-[#EDEEF2]"
            : "bg-white border-[#DCDDE1] hover:border-[#D99532]/70 text-[#17191F] shadow-xs"
        }`}
      >
        {/* Featured Image Surface */}
        {featured.images && featured.images.length > 0 && (
          <div className="relative w-full h-48 sm:h-60 overflow-hidden bg-black/40">
            <img
              src={featured.images[0]}
              alt={featured.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-[6px] text-xs font-bold bg-[#D99532] text-white shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Günün Fırsatı
              </span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-7 space-y-3.5 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`font-bold px-2 py-0.5 rounded-[4px] ${
                  isDark ? "bg-[#D99532]/20 text-[#E8A33D]" : "bg-[#F0F1F3] text-[#D99532]"
                }`}
              >
                {featured.gameName}
              </span>
              <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>&bull;</span>
              <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>{featured.categoryName}</span>
              {featured.serverName && (
                <>
                  <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>&bull;</span>
                  <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>{featured.serverName}</span>
                </>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight group-hover:text-[#D99532] transition-colors">
              <Link href={`/ilan/${featured.id}`} className="focus:outline-none focus-visible:underline">
                {featured.title}
              </Link>
            </h3>

            <p className={`text-xs sm:text-sm line-clamp-2 max-w-[65ch] leading-relaxed ${
              isDark ? "text-[#9498A6]" : "text-[#626772]"
            }`}>
              {featured.description}
            </p>
          </div>

          <div
            className={`mt-4 pt-4 flex items-center justify-between border-t ${
              isDark ? "border-white/[0.06]" : "border-[#DCDDE1]"
            }`}
          >
            <div>
              <span className={`text-[10px] block font-semibold uppercase tracking-wider ${
                isDark ? "text-[#9498A6]" : "text-[#626772]"
              }`}>
                Birim Fiyat
              </span>
              <ItemSepetiPrice amount={featured.unitPrice} size="lg" />
            </div>

            <Link
              href={`/ilan/${featured.id}`}
              className="inline-flex items-center justify-center h-9 px-4 rounded-[8px] text-xs font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-xs"
              style={{ backgroundColor: "#D99532" }}
            >
              İlanı İncele
            </Link>
          </div>
        </div>
      </article>

      {/* STACKED SUPPORTING ITEMS (5 COLS) */}
      <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
        {sideItems.map((item) => (
          <article
            key={item.id}
            className={`flex-1 p-3.5 sm:p-4 rounded-[14px] border transition-all duration-200 flex items-center gap-3.5 group overflow-hidden ${
              isDark
                ? "bg-[#161921] border-[#282C3A] hover:border-[#D99532]/60 text-[#EDEEF2]"
                : "bg-white border-[#DCDDE1] hover:border-[#D99532]/70 text-[#17191F] shadow-xs"
            }`}
          >
            {/* Small Side Image Thumbnail */}
            {item.images && item.images.length > 0 ? (
              <div className="w-20 h-20 rounded-[10px] overflow-hidden bg-black/40 shrink-0 border border-black/5 dark:border-white/5">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-[10px] bg-[#D99532]/15 border border-[#D99532]/25 shrink-0 flex items-center justify-center text-[#E8A33D] font-black text-base">
                {item.gameName.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
              <div className="space-y-1">
                <div className={`flex items-center justify-between text-[11px] ${
                  isDark ? "text-[#9498A6]" : "text-[#626772]"
                }`}>
                  <span className="font-semibold truncate max-w-[65%]">{item.gameName}</span>
                  <span className="shrink-0 text-[10px]">{item.categoryName}</span>
                </div>

                <h4 className="text-sm font-bold line-clamp-1 group-hover:text-[#D99532] transition-colors">
                  <Link href={`/ilan/${item.id}`} className="focus:outline-none focus-visible:underline">
                    {item.title}
                  </Link>
                </h4>
              </div>

              <div className="mt-2 flex items-baseline justify-between pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                <ItemSepetiPrice amount={item.unitPrice} size="sm" />
                <Link
                  href={`/ilan/${item.id}`}
                  className="text-xs text-[#D99532] font-semibold hover:underline"
                >
                  Göz At &rarr;
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
