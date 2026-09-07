"use client";

import React, { useState } from "react";
import { ItemSepetiPrice } from "@/components/itemsepeti/marketplace/MarketplacePrimitives";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import { ShieldCheck, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
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
      {/* PRIMARY BUY BOX CARD */}
      <div
        className="p-6 rounded-[14px] border space-y-5"
        style={{
          backgroundColor: "rgba(27, 30, 39, 0.8)",
          borderColor: "#282C3A",
        }}
      >
        {/* PRICE SUMMARY */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#9498A6]">
            <span>{quantity > 1 ? "Toplam Tutar" : "Birim Fiyat"}</span>
            <span className="text-[#34D399] font-medium">Komisyon Dahil</span>
          </div>
          <div className="flex items-baseline justify-between">
            <ItemSepetiPrice amount={totalPrice} size="lg" />
            <span className="text-xs text-[#9498A6]">
              Stok: <strong className="text-inherit">{stockQuantity}</strong>
            </span>
          </div>
        </div>

        {/* QUANTITY SELECTOR (IF MULTIPLE STOCK AVAILABLE) */}
        {stockQuantity > 1 && !isOutOfStock && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <label className="text-xs text-[#9498A6] font-medium">Adet</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))}
                disabled={quantity <= minQuantity}
                className="w-8 h-8 rounded-[8px] border border-white/10 flex items-center justify-center text-sm font-bold text-inherit disabled:opacity-30 hover:border-[#E8A33D]"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold text-inherit">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                disabled={quantity >= stockQuantity}
                className="w-8 h-8 rounded-[8px] border border-white/10 flex items-center justify-center text-sm font-bold text-inherit disabled:opacity-30 hover:border-[#E8A33D]"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* ERROR / SUCCESS NOTIFICATIONS */}
        {error && (
          <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {intentSuccess && (
          <div className="p-3 rounded-[8px] bg-[#34D399]/10 border border-[#34D399]/20 text-xs text-[#34D399] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Satın alma niyeti onaylandı!</p>
              <p className="text-[11px] text-[#9498A6] mt-0.5">
                Stok 15 dakika boyunca sizin için rezerve edildi. (Ödeme adımı FAZ 8&apos;de bağlanacaktır)
              </p>
            </div>
          </div>
        )}

        {/* MAIN PURCHASE BUTTON (DESKTOP) */}
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

        {/* ESCROW TRUST BADGE */}
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#9498A6]">
          <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
          <span>Escrow Güvencesi: Teslim almadan para satıcıya aktarılmaz.</span>
        </div>

        {/* SELLER TRUST PANEL */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9498A6] font-medium">Satıcı Bilgileri</span>
            <Link
              href={`/satici/${sellerId}`}
              className="text-[11px] text-[#E8A33D] hover:underline font-medium"
            >
              Profili Gör
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/satici/${sellerId}`}
                  className="text-sm font-bold text-inherit hover:underline"
                >
                  {sellerName}
                </Link>
                {isSellerVerified && (
                  <span className="text-[10px] bg-[#34D399]/15 text-[#34D399] font-bold px-1.5 py-0.2 rounded">
                    Onaylı
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#9498A6]">
                {memberSinceYears} yıldır üye &bull; {completedSalesCount} tamamlanan satış
              </p>
              <p className="text-[11px] text-[#9498A6]">
                Ort. Yanıt Süresi: <strong className="text-inherit">{averageDeliveryMinutes} dk</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-[#E8A33D]">{sellerRating.toFixed(1)} ★</span>
              <span className="text-[10px] text-[#9498A6] block">({sellerRatingCount} oy)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3.5 border-t backdrop-blur-md flex items-center justify-between gap-4"
        style={{
          backgroundColor: "rgba(18, 20, 26, 0.95)",
          borderColor: "#282C3A",
        }}
      >
        <div>
          <span className="text-[10px] text-[#9498A6] block">Toplam Tutar</span>
          <ItemSepetiPrice amount={totalPrice} size="md" />
        </div>
        <button
          type="button"
          onClick={handlePurchaseIntent}
          disabled={isOutOfStock || loading || intentSuccess}
          className="flex-1 max-w-[200px] h-10 rounded-[10px] bg-[#E8A33D] text-[#12141A] font-bold text-xs flex items-center justify-center disabled:opacity-40"
        >
          {isOutOfStock ? "Tükendi" : loading ? "İşleniyor..." : intentSuccess ? "Rezerve Edildi" : "Satın Al"}
        </button>
      </div>
    </div>
  );
}
