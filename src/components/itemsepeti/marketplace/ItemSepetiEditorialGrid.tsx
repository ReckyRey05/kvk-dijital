import React from "react";
import Link from "next/link";
import { ItemSepetiPrice } from "./MarketplacePrimitives";
import { ItemSepetiListing } from "@/types/marketplace";

interface EditorialGridProps {
  listings: ItemSepetiListing[];
}

export default function ItemSepetiEditorialGrid({ listings }: EditorialGridProps) {
  if (!listings || listings.length === 0) return null;

  const featured = listings[0];
  const sideItems = listings.slice(1, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* WIDE HERO FEATURED ITEM (7 COLS) */}
      <article
        className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-[16px] transition-colors relative overflow-hidden group"
        style={{
          backgroundColor: "#161921",
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#9498A6]">
            <span className="font-semibold text-[#E8A33D]">{featured.gameName}</span>
            <span>&bull;</span>
            <span>{featured.categoryName}</span>
            {featured.serverName && (
              <>
                <span>&bull;</span>
                <span>{featured.serverName}</span>
              </>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-inherit leading-tight group-hover:text-[#E8A33D] transition-colors">
            <Link href={`/ilan/${featured.id}`} className="focus:outline-none focus-visible:underline">
              {featured.title}
            </Link>
          </h3>

          <p className="text-xs sm:text-sm text-[#9498A6] line-clamp-2 max-w-[65ch] leading-relaxed">
            {featured.description}
          </p>
        </div>

        <div className="mt-8 pt-4 flex items-center justify-between border-t border-white/[0.06]">
          <div>
            <span className="text-[10px] text-[#9498A6] block uppercase tracking-wider font-semibold">
              Birim Fiyat
            </span>
            <ItemSepetiPrice amount={featured.unitPrice} size="lg" />
          </div>

          <Link
            href={`/ilan/${featured.id}`}
            className="inline-flex items-center justify-center h-9 px-4 rounded-[10px] text-xs font-bold text-[#12141A] transition-transform active:scale-95"
            style={{ backgroundColor: "#E8A33D" }}
          >
            İncele
          </Link>
        </div>
      </article>

      {/* STACKED SUPPORTING ITEMS (5 COLS) */}
      <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
        {sideItems.map((item) => (
          <article
            key={item.id}
            className="flex-1 p-4 rounded-[14px] transition-colors flex flex-col justify-between group"
            style={{
              backgroundColor: "#161921",
            }}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#9498A6]">
                <span className="font-semibold text-inherit truncate">{item.gameName}</span>
                <span className="shrink-0">{item.categoryName}</span>
              </div>

              <h4 className="text-sm font-bold text-inherit line-clamp-1 group-hover:text-[#E8A33D] transition-colors">
                <Link href={`/ilan/${item.id}`} className="focus:outline-none focus-visible:underline">
                  {item.title}
                </Link>
              </h4>
            </div>

            <div className="mt-3 pt-2 flex items-baseline justify-between border-t border-white/[0.04]">
              <ItemSepetiPrice amount={item.unitPrice} size="sm" />
              <Link
                href={`/ilan/${item.id}`}
                className="text-xs text-[#E8A33D] font-medium hover:underline"
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
