"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Clock } from "lucide-react";
import {
  ItemSepetiPrice,
  ItemSepetiDeliveryBadge,
} from "./MarketplacePrimitives";
import { ItemSepetiDeliveryMethod } from "@/types/marketplace";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";

export interface ListingCardData {
  id: string;
  slug: string;
  title: string;
  gameName: string;
  categoryName: string;
  serverName?: string;
  price: number;
  stock: number;
  sellerId?: string;
  sellerName: string;
  sellerRating: number;
  sellerRatingCount: number;
  isSellerVerified: boolean;
  deliveryMethod: ItemSepetiDeliveryMethod;
  deliverySlaHours?: number;
  isFavorited?: boolean;
}

export default function ItemSepetiListingCard({
  listing,
  currentUserId,
  onToggleFavorite,
}: {
  listing: ListingCardData;
  currentUserId?: string;
  onToggleFavorite?: (listingId: string, newState: boolean) => void;
}) {
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";

  const [favorited, setFavorited] = useState(listing.isFavorited || false);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      alert("Favorilere eklemek için lütfen giriş yapın.");
      return;
    }

    const nextState = !favorited;
    setFavorited(nextState);
    setFavLoading(true);

    try {
      if (nextState) {
        await fetch("/api/itemsepeti/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, listingId: listing.id }),
        });
      } else {
        await fetch(`/api/itemsepeti/favorites/${listing.id}?userId=${currentUserId}`, {
          method: "DELETE",
        });
      }
      onToggleFavorite?.(listing.id, nextState);
    } catch {
      setFavorited(!nextState);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <article
      className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-[12px] border transition-all duration-150 select-none ${
        isDark
          ? "bg-[#161921] border-[#282C3A] hover:border-[#D99532]/50 text-[#EDEEF2]"
          : "bg-white border-[#DCDDE1] hover:border-[#D99532]/60 text-[#17191F] shadow-xs"
      }`}
    >
      <div className="space-y-2.5">
        {/* GAME & DELIVERY TAG */}
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span
            className={`font-semibold px-2 py-0.5 rounded-[4px] truncate max-w-[70%] ${
              isDark ? "bg-black/30 text-[#E8A33D]" : "bg-[#F0F1F3] text-[#D99532]"
            }`}
          >
            {listing.gameName} {listing.serverName ? `• ${listing.serverName}` : ""}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <ItemSepetiDeliveryBadge method={listing.deliveryMethod} slaHours={listing.deliverySlaHours} />
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={favLoading}
              aria-label={favorited ? "Favorilerden kaldır" : "Favorilere ekle"}
              className={`p-1 rounded hover:text-red-500 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D99532] ${
                isDark ? "text-[#9498A6]" : "text-[#626772]"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  favorited ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* LISTING TITLE */}
        <h3 className="text-sm font-bold tracking-tight line-clamp-2 leading-snug group-hover:text-[#D99532] transition-colors">
          <Link href={`/ilan/${listing.slug}`} className="focus:outline-none focus-visible:underline">
            {listing.title}
          </Link>
        </h3>

        {/* SELLER IDENTITY WITH CLEAR VISIBILITY */}
        <div className={`text-xs truncate ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
          {listing.sellerId ? (
            <Link
              href={`/satici/${listing.sellerId}`}
              className="hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              @{listing.sellerName} &bull; {listing.sellerRating.toFixed(1)} ★
            </Link>
          ) : (
            <span>@{listing.sellerName}</span>
          )}
        </div>
      </div>

      {/* FOOTER: HIERARCHY (PRICE IS PRIMARY, ACTION IS QUICK) */}
      <div
        className={`mt-3.5 pt-3 flex items-center justify-between border-t ${
          isDark ? "border-white/[0.06]" : "border-[#DCDDE1]"
        }`}
      >
        <div>
          <span className={`text-[10px] block font-medium ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
            Birim Fiyat
          </span>
          <ItemSepetiPrice amount={listing.price} size="md" />
        </div>

        <Link
          href={`/ilan/${listing.slug}`}
          className="inline-flex items-center justify-center h-8 px-3.5 rounded-[8px] text-xs font-bold text-white transition-transform active:scale-95 cursor-pointer"
          style={{ backgroundColor: "#D99532" }}
        >
          Satın Al
        </Link>
      </div>
    </article>
  );
}
