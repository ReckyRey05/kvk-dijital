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
  image?: string;
  images?: string[];
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

  // Compute primary image: direct image, first element of images array, or game fallback
  const listingImage = listing.image || (listing.images && listing.images.length > 0 ? listing.images[0] : null);

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
      className={`group relative flex flex-col justify-between rounded-[14px] border transition-all duration-200 select-none overflow-hidden hover:shadow-lg ${
        isDark
          ? "bg-[#161921] border-[#282C3A] hover:border-[#D99532]/60 text-[#EDEEF2]"
          : "bg-white border-[#DCDDE1] hover:border-[#D99532]/70 text-[#17191F] shadow-xs"
      }`}
    >
      {/* 1. VISUAL THUMBNAIL HEADER WITH HOVER ZOOM & BADGES */}
      <div className="relative w-full h-40 sm:h-44 overflow-hidden bg-black/40 flex items-center justify-center">
        <Link href={`/ilan/${listing.slug}`} className="w-full h-full block focus:outline-none">
          {listingImage ? (
            <img
              src={listingImage}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-black/60 to-black/90">
              <span className="w-12 h-12 rounded-full bg-[#D99532]/20 border border-[#D99532]/30 flex items-center justify-center text-[#E8A33D] font-black text-sm mb-1.5 shadow-inner">
                {listing.gameName.substring(0, 2).toUpperCase()}
              </span>
              <span className="text-xs font-bold text-white/90 line-clamp-1">{listing.gameName}</span>
              <span className="text-[10px] text-[#9498A6]">{listing.categoryName}</span>
            </div>
          )}
        </Link>

        {/* TOP OVERLAY: GAME BADGE & FAVORITE BUTTON */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="pointer-events-auto text-[10px] font-bold px-2 py-0.5 rounded-[5px] bg-black/70 backdrop-blur-md text-[#E8A33D] border border-white/10 shadow-sm truncate max-w-[70%]">
            {listing.gameName} {listing.serverName ? `• ${listing.serverName}` : ""}
          </span>
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={favLoading}
            aria-label={favorited ? "Favorilerden kaldır" : "Favorilere ekle"}
            className="pointer-events-auto w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-white/80 hover:text-red-500 focus:outline-none"
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>

        {/* BOTTOM OVERLAY: DELIVERY BADGE */}
        <div className="absolute bottom-2 left-2.5 pointer-events-none">
          <span className="pointer-events-auto">
            <ItemSepetiDeliveryBadge method={listing.deliveryMethod} slaHours={listing.deliverySlaHours} />
          </span>
        </div>
      </div>

      {/* 2. CARD CONTENT & METADATA */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* LISTING TITLE */}
          <h3 className="text-sm font-bold tracking-tight line-clamp-2 leading-snug group-hover:text-[#D99532] transition-colors min-h-[2.5rem]">
            <Link href={`/ilan/${listing.slug}`} className="focus:outline-none focus-visible:underline">
              {listing.title}
            </Link>
          </h3>

          {/* SELLER IDENTITY WITH STAR RATING */}
          <div className={`text-xs flex items-center justify-between ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
            {listing.sellerId ? (
              <Link
                href={`/satici/${listing.sellerId}`}
                className="hover:underline font-medium truncate max-w-[65%]"
                onClick={(e) => e.stopPropagation()}
              >
                @{listing.sellerName}
              </Link>
            ) : (
              <span className="truncate max-w-[65%]">@{listing.sellerName}</span>
            )}
            <span className="text-[11px] font-semibold text-[#E8A33D] shrink-0">
              ★ {listing.sellerRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 3. FOOTER: PRICE & BUY ACTION */}
        <div
          className={`pt-3 flex items-center justify-between border-t ${
            isDark ? "border-white/[0.06]" : "border-[#DCDDE1]"
          }`}
        >
          <div>
            <span className={`text-[10px] block font-medium ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
              Fiyat
            </span>
            <ItemSepetiPrice amount={listing.price} size="md" />
          </div>

          <Link
            href={`/ilan/${listing.slug}`}
            className="inline-flex items-center justify-center h-8 px-3.5 rounded-[8px] text-xs font-bold text-white transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow-xs"
            style={{ backgroundColor: "#D99532" }}
          >
            Satın Al
          </Link>
        </div>
      </div>
    </article>
  );
}
