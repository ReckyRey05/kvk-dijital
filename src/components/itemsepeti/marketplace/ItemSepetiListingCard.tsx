"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import {
  ItemSepetiPrice,
  ItemSepetiDeliveryBadge,
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
      className="group relative flex flex-col justify-between p-4 rounded-[12px] transition-colors select-none"
      style={{
        backgroundColor: "#161921",
      }}
    >
      <div className="space-y-2">
        {/* GAME & DELIVERY TAG */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#9498A6]">
          <span className="font-medium truncate max-w-[70%]">
            {listing.gameName} {listing.serverName ? `• ${listing.serverName}` : ""}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <ItemSepetiDeliveryBadge method={listing.deliveryMethod} slaHours={listing.deliverySlaHours} />
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={favLoading}
              aria-label={favorited ? "Favorilerden kaldır" : "Favorilere ekle"}
              className="p-1 rounded text-[#9498A6] hover:text-red-400 transition-colors focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
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
        <h3 className="text-sm font-bold tracking-tight text-inherit line-clamp-2 leading-snug group-hover:text-[#E8A33D] transition-colors">
          <Link href={`/ilan/${listing.slug}`} className="focus:outline-none focus-visible:underline">
            {listing.title}
          </Link>
        </h3>

        {/* SELLER IDENTITY */}
        <div className="text-xs text-[#9498A6] truncate">
          {listing.sellerId ? (
            <Link
              href={`/satici/${listing.sellerId}`}
              className="hover:text-inherit transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {listing.sellerName} &bull; {listing.sellerRating.toFixed(1)} ★
            </Link>
          ) : (
            <span>{listing.sellerName}</span>
          )}
        </div>
      </div>

      {/* FOOTER: CLEAN PRICE & ACTION */}
      <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/[0.04]">
        <ItemSepetiPrice amount={listing.price} size="md" />

        <Link
          href={`/ilan/${listing.slug}`}
          className="inline-flex items-center justify-center h-8 px-3.5 rounded-[8px] text-xs font-bold text-[#12141A] transition-transform active:scale-95 cursor-pointer"
          style={{ backgroundColor: "#E8A33D" }}
        >
          Satın Al
        </Link>
      </div>
    </article>
  );
}
