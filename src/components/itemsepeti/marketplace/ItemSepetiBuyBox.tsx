"use client";

import React, { useState } from "react";
import { ItemSepetiPrice } from "@/components/itemsepeti/marketplace/MarketplacePrimitives";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface BuyBoxProps {
  listingId: string;
  unitPrice: number;
  stockQuantity: number;
  minQuantity?: number;
  deliveryMethod: string;
  deliverySlaHours: number;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerRatingCount: number;
  isSellerVerified: boolean;
  memberSinceYears?: number;
  completedSalesCount?: number;
  averageDeliveryMinutes?: number;
  currentUserId?: string;
}

export default function ItemSepetiBuyBox({
  listingId,
  unitPrice,
  stockQuantity,
  minQuantity = 1,
  deliveryMethod,
  deliverySlaHours,
  sellerId,
  sellerName,
  sellerRating,
  sellerRatingCount,
  isSellerVerified,
  memberSinceYears = 2,
  completedSalesCount = 120,
  averageDeliveryMinutes = 15,
  currentUserId,
}: BuyBoxProps) {
  const [quantity, setQuantity] = useState(minQuantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentSuccess, setIntentSuccess] = useState<boolean>(false);

  const isOutOfStock = stockQuantity <= 0;
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const handlePurchaseIntent = async () => {
    setError(null);
    if (!currentUserId) {
      setError("Satın alma işlemine devam etmek için lütfen giriş yapın.");
      return;
    }

    if (quantity > stockQuantity) {
      setError("Talep edilen adet mevcut stoktan fazladır.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/itemsepeti/purchase-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: currentUserId,
          listingId,
          quantity,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Satın alma niyeti oluşturulamadı.");
      } else {
        setIntentSuccess(true);
      }
    } catch {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* CLEAN BUY BOX WITHOUT REDUNDANT BORDERS */}
      <div
        className="p-6 rounded-[16px] space-y-5"
        style={{
          backgroundColor: "#161921",
        }}
      >
        {/* PRICE SUMMARY */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#9498A6]">
            <span>{quantity > 1 ? "Toplam Tutar" : "Fiyat"}</span>
            <span className="text-[#34D399] font-medium">Komisyon Dahil</span>
          </div>
          <div className="flex items-baseline justify-between">
            <ItemSepetiPrice amount={totalPrice} size="lg" />
            <span className="text-xs text-[#9498A6]">
              Stok: <strong className="text-inherit">{stockQuantity}</strong>
            </span>
          </div>
        </div>

        {/* QUANTITY SELECTOR */}
        {stockQuantity > 1 && !isOutOfStock && (
          <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
            <label className="text-xs text-[#9498A6] font-medium">Adet</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))}
                disabled={quantity <= minQuantity}
                className="w-8 h-8 rounded-[6px] bg-black/20 flex items-center justify-center text-sm font-bold text-inherit disabled:opacity-30 hover:text-[#E8A33D]"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold text-inherit">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                disabled={quantity >= stockQuantity}
                className="w-8 h-8 rounded-[6px] bg-black/20 flex items-center justify-center text-sm font-bold text-inherit disabled:opacity-30 hover:text-[#E8A33D]"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* ERROR / SUCCESS NOTIFICATIONS */}
        {error && (
          <div className="p-3 rounded-[8px] bg-red-500/10 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {intentSuccess && (
          <div className="p-3 rounded-[8px] bg-[#34D399]/10 text-xs text-[#34D399] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Satın alma niyeti oluşturuldu</p>
              <p className="text-[11px] text-[#9498A6] mt-0.5">
                Stok 15 dakika boyunca sizin için kilitlendi.
              </p>
            </div>
          </div>
        )}

        {/* MAIN PURCHASE BUTTON */}
        {!intentSuccess && (
          <ItemSepetiButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handlePurchaseIntent}
            disabled={isOutOfStock || loading}
          >
            {isOutOfStock ? "Tükendi" : loading ? "İşleniyor..." : "Satın Al"}
          </ItemSepetiButton>
        )}

        {/* ESCROW STATEMENT */}
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#9498A6]">
          <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
          <span>Escrow koruması: Teslim almadan para aktarılmaz.</span>
        </div>

        {/* SELLER SUMMARY */}
        <div className="pt-4 border-t border-white/[0.04] space-y-2">
          <div className="flex items-center justify-between">
            <Link
              href={`/satici/${sellerId}`}
              className="text-sm font-bold text-inherit hover:underline"
            >
              {sellerName}
            </Link>
            <span className="text-xs font-semibold text-[#E8A33D]">{sellerRating.toFixed(1)} ★</span>
          </div>
          <p className="text-[11px] text-[#9498A6]">
            {completedSalesCount} tamamlanan satış &bull; Ort. {averageDeliveryMinutes} dk teslim
          </p>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3.5 border-t backdrop-blur-md flex items-center justify-between gap-4"
        style={{
          backgroundColor: "rgba(18, 20, 26, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.05)",
        }}
      >
        <div>
          <span className="text-[10px] text-[#9498A6] block">Tutar</span>
          <ItemSepetiPrice amount={totalPrice} size="md" />
        </div>
        <button
          type="button"
          onClick={handlePurchaseIntent}
          disabled={isOutOfStock || loading || intentSuccess}
          className="flex-1 max-w-[200px] h-10 rounded-[8px] bg-[#E8A33D] text-[#12141A] font-bold text-xs flex items-center justify-center disabled:opacity-40"
        >
          {isOutOfStock ? "Tükendi" : loading ? "İşleniyor..." : intentSuccess ? "Rezerve Edildi" : "Satın Al"}
        </button>
      </div>
    </div>
  );
}
