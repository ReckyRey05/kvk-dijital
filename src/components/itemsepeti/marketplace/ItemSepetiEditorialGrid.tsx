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
        className={`lg:col-span-7 flex flex-col justify-between p-6 sm:p-7 rounded-[14px] border transition-colors group ${
          isDark
            ? "bg-[#161921] border-[#282C3A] text-[#EDEEF2]"
            : "bg-white border-[#DCDDE1] text-[#17191F] shadow-xs"
        }`}
      >
        <div className="space-y-3.5">
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
          className={`mt-6 pt-4 flex items-center justify-between border-t ${
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
            className="inline-flex items-center justify-center h-9 px-4 rounded-[8px] text-xs font-bold text-white transition-transform active:scale-95"
            style={{ backgroundColor: "#D99532" }}
          >
            İlanı İncele
          </Link>
        </div>
      </article>

      {/* STACKED SUPPORTING ITEMS (5 COLS) */}
      <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
        {sideItems.map((item) => (
          <article
            key={item.id}
            className={`flex-1 p-4 rounded-[12px] border transition-colors flex flex-col justify-between group ${
              isDark
                ? "bg-[#161921] border-[#282C3A] text-[#EDEEF2]"
                : "bg-white border-[#DCDDE1] text-[#17191F] shadow-xs"
            }`}
          >
            <div className="space-y-1">
              <div className={`flex items-center justify-between text-[11px] ${
                isDark ? "text-[#9498A6]" : "text-[#626772]"
              }`}>
                <span className="font-semibold truncate">{item.gameName}</span>
                <span className="shrink-0">{item.categoryName}</span>
              </div>

              <h4 className="text-sm font-bold line-clamp-1 group-hover:text-[#D99532] transition-colors">
                <Link href={`/ilan/${item.id}`} className="focus:outline-none focus-visible:underline">
                  {item.title}
                </Link>
              </h4>
            </div>

            <div
              className={`mt-2.5 pt-2 flex items-baseline justify-between border-t ${
                isDark ? "border-white/[0.04]" : "border-[#DCDDE1]"
              }`}
            >
              <ItemSepetiPrice amount={item.unitPrice} size="sm" />
              <Link
                href={`/ilan/${item.id}`}
                className="text-xs text-[#D99532] font-semibold hover:underline"
              >
                Göz At
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
