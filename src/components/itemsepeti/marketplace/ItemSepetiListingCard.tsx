import React from "react";
import Link from "next/link";
import {
  ItemSepetiPrice,
  ItemSepetiRating,
  ItemSepetiStockBadge,
  ItemSepetiDeliveryBadge,
  ItemSepetiSellerBadge,
} from "./MarketplacePrimitives";
import { ItemSepetiDeliveryMethod } from "@/types/marketplace";

export interface ListingCardData {
  id: string;
  slug: string;
  title: string;
  gameName: string;
  categoryName: string;
  serverName?: string;
  price: number;
  stock: number;
  sellerName: string;
  sellerRating: number;
  sellerRatingCount: number;
  isSellerVerified: boolean;
  deliveryMethod: ItemSepetiDeliveryMethod;
  deliverySlaHours?: number;
}

export default function ItemSepetiListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <article
      className="group relative flex flex-col justify-between p-4 rounded-[14px] border transition-all duration-200 hover:-translate-y-0.5 select-none"
      style={{
        backgroundColor: "rgba(27, 30, 39, 0.6)",
        borderColor: "#282C3A",
      }}
    >
      <div className="space-y-3">
        {/* GAME & CATEGORY CONTEXT */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#9498A6]">
          <span className="font-semibold px-2 py-0.5 rounded-[6px] bg-black/20 border border-white/5">
            {listing.gameName} {listing.serverName ? `• ${listing.serverName}` : ""}
          </span>
          <ItemSepetiDeliveryBadge method={listing.deliveryMethod} slaHours={listing.deliverySlaHours} />
        </div>

        {/* LISTING TITLE */}
        <h3 className="text-sm font-bold tracking-tight text-inherit line-clamp-2 leading-snug group-hover:text-[#E8A33D] transition-colors">
          <Link href={`/ilan/${listing.slug}`} className="focus:outline-none focus-visible:underline">
            {listing.title}
          </Link>
        </h3>

        {/* SELLER IDENTITY & RATING */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 truncate max-w-[60%]">
            <span className="text-[#9498A6] truncate">{listing.sellerName}</span>
            <ItemSepetiSellerBadge isVerified={listing.isSellerVerified} />
          </div>
          <ItemSepetiRating score={listing.sellerRating} count={listing.sellerRatingCount} />
        </div>
      </div>

      {/* FOOTER: STOCK, PRICE & ACTION */}
      <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#9498A6] font-medium">Birim Fiyat</span>
          <ItemSepetiPrice amount={listing.price} size="md" />
        </div>

        <Link
          href={`/ilan/${listing.slug}`}
          className="inline-flex items-center justify-center h-8 px-3.5 rounded-[10px] text-xs font-semibold text-[#12141A] transition-transform active:scale-95 cursor-pointer"
          style={{ backgroundColor: "#E8A33D" }}
        >
          Satın Al
        </Link>
      </div>
    </article>
  );
}
