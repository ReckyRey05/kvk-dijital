"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
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
    setFavorited(nextState); // Optimistic UI update
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
      // Rollback on failure
      setFavorited(!nextState);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <article
      className="group relative flex flex-col justify-between p-4 rounded-[14px] border transition-all duration-200 hover:-translate-y-0.5 select-none"
      style={{
        backgroundColor: "rgba(27, 30, 39, 0.6)",
        borderColor: "#282C3A",
      }}
    >
      <div className="space-y-3">
        {/* GAME & CATEGORY CONTEXT + FAVORITE BUTTON */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#9498A6]">
          <span className="font-semibold px-2 py-0.5 rounded-[6px] bg-black/20 border border-white/5 truncate max-w-[70%]">
            {listing.gameName} {listing.serverName ? `• ${listing.serverName}` : ""}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <ItemSepetiDeliveryBadge method={listing.deliveryMethod} slaHours={listing.deliverySlaHours} />
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={favLoading}
              aria-label={favorited ? "Favorilerden kaldır" : "Favorilere ekle"}
              className="p-1 rounded-[6px] hover:bg-white/10 transition-colors text-[#9498A6] hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
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

        {/* SELLER IDENTITY & RATING */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 truncate max-w-[60%]">
            {listing.sellerId ? (
              <Link
                href={`/satici/${listing.sellerId}`}
                className="text-[#9498A6] hover:text-inherit truncate transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {listing.sellerName}
              </Link>
            ) : (
              <span className="text-[#9498A6] truncate">{listing.sellerName}</span>
            )}
            <ItemSepetiSellerBadge isVerified={listing.isSellerVerified} />
          </div>
          <ItemSepetiRating score={listing.sellerRating} count={listing.sellerRatingCount} />
        </div>
      </div>

      {/* FOOTER: STOCK, PRICE & ACTION */}
      <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#9498A6] font-medium">Birim Fiyat</span>
            {listing.stock > 0 && <ItemSepetiStockBadge stock={listing.stock} />}
          </div>
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
