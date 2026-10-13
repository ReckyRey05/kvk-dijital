"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ItemSepetiPrice } from "@/components/itemsepeti/marketplace/MarketplacePrimitives";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";
import { useItemSepetiCart } from "@/context/ItemSepetiCartContext";

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
  const router = useRouter();
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";
  const { addItem } = useItemSepetiCart();

  const [quantity, setQuantity] = useState(minQuantity);
  const [loading, setLoading] = useState(false);
  const [cartAdding, setCartAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState<boolean>(false);

  const isOutOfStock = stockQuantity <= 0;
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  // "Satın Al" -> Direct checkout flow
  const handleBuyNow = async () => {
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
      // Add to cart and immediately route to checkout
      const addRes = await addItem(listingId, quantity);
      if (!addRes.success && addRes.error) {
        setError(addRes.error);
        return;
      }
      router.push("/checkout");
    } catch {
      setError("İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // "Sepete Ekle" -> Add to cart and show brief confirmation
  const handleAddToCart = async () => {
    setError(null);
    setCartSuccess(false);

    if (quantity > stockQuantity) {
      setError("Talep edilen adet mevcut stoktan fazladır.");
      return;
    }

    setCartAdding(true);
    try {
      const res = await addItem(listingId, quantity);
      if (!res.success && res.error) {
        setError(res.error);
      } else {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3500);
      }
    } catch {
      setError("Sepete eklenirken hata oluştu.");
    } finally {
      setCartAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* TACTILE BUY BOX CARD */}
      <div
        className={`p-6 rounded-[10px] border space-y-5 ${
          isDark
            ? "bg-[#181C22] border-[#2A313C] text-[#EDEEF2]"
            : "bg-white border-[#E5E8EB] text-[#15191E] shadow-xs"
        }`}
      >
        {/* PRICE SUMMARY */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={isDark ? "text-[#8E97A4]" : "text-[#69717D]"}>
              {quantity > 1 ? "Toplam Tutar" : "Fiyat"}
            </span>
            <span className="text-[#0D8259] font-semibold">Komisyon Dahil</span>
          </div>
          <div className="flex items-baseline justify-between">
            <ItemSepetiPrice amount={totalPrice} size="lg" />
            <span className={`text-xs ${isDark ? "text-[#8E97A4]" : "text-[#69717D]"}`}>
              Stok: <strong className="text-inherit">{stockQuantity}</strong>
            </span>
          </div>
        </div>

        {/* DELIVERY INFO */}
        <div className="flex items-center gap-2 text-xs text-[#69717D] dark:text-[#8E97A4] pt-1">
          <Clock className="w-3.5 h-3.5 text-[#0F625C] dark:text-[#168B83]" />
          <span>Ortalama teslimat: <strong>{averageDeliveryMinutes} dakika</strong></span>
        </div>

        {/* QUANTITY SELECTOR */}
        {stockQuantity > 1 && !isOutOfStock && (
          <div className={`space-y-1.5 pt-2 border-t ${isDark ? "border-white/[0.06]" : "border-[#E5E8EB]"}`}>
            <label className={`text-xs font-medium ${isDark ? "text-[#8E97A4]" : "text-[#69717D]"}`}>Adet</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))}
                disabled={quantity <= minQuantity}
                className={`w-8 h-8 rounded-[6px] border flex items-center justify-center text-sm font-bold disabled:opacity-30 cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-black/20 hover:text-[#0F625C]"
                    : "border-[#E5E8EB] bg-[#F0F4F3] hover:text-[#0F625C]"
                }`}
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold text-inherit">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                disabled={quantity >= stockQuantity}
                className={`w-8 h-8 rounded-[6px] border flex items-center justify-center text-sm font-bold disabled:opacity-30 cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-black/20 hover:text-[#0F625C]"
                    : "border-[#E5E8EB] bg-[#F0F4F3] hover:text-[#0F625C]"
                }`}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="p-3 rounded-[8px] bg-red-500/10 text-xs text-red-500 border border-red-500/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* CART SUCCESS NOTIFICATION */}
        {cartSuccess && (
          <div className="p-3 rounded-[8px] bg-[#0D8259]/10 text-xs text-[#0D8259] border border-[#0D8259]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Ürün sepete eklendi.</span>
            </div>
            <Link href="/sepet" className="font-bold underline ml-2">
              Sepete Git
            </Link>
          </div>
        )}

        {/* DUAL ACTION BUTTONS (PRIMARY: SATIN AL, SECONDARY: SEPETE EKLE) */}
        <div className="space-y-2 pt-1">
          <ItemSepetiButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleBuyNow}
            disabled={isOutOfStock || loading}
          >
            {isOutOfStock ? "Tükendi" : loading ? "İşleniyor..." : "Satın Al"}
          </ItemSepetiButton>

          {!isOutOfStock && (
            <ItemSepetiButton
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleAddToCart}
              disabled={cartAdding}
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              <span>{cartAdding ? "Ekleniyor..." : "Sepete Ekle"}</span>
            </ItemSepetiButton>
          )}
        </div>

        {/* ESCROW STATEMENT */}
        <div className={`pt-2 flex items-center justify-center gap-2 text-[11px] ${isDark ? "text-[#8E97A4]" : "text-[#69717D]"}`}>
          <ShieldCheck className="w-4 h-4 text-[#0D8259] shrink-0" />
          <span>Emanet koruması: Teslim almadan para satıcıya aktarılmaz.</span>
        </div>

        {/* SELLER SUMMARY */}
        <div className={`pt-4 border-t space-y-2 ${isDark ? "border-white/[0.06]" : "border-[#E5E8EB]"}`}>
          <div className="flex items-center justify-between">
            <Link
              href={`/satici/${sellerId}`}
              className="text-sm font-semibold text-inherit hover:underline"
            >
              @{sellerName}
            </Link>
            <span className="text-xs font-semibold text-[#D97706]">{sellerRating.toFixed(1)} ★</span>
          </div>
          <p className={`text-[11px] ${isDark ? "text-[#8E97A4]" : "text-[#69717D]"}`}>
            {completedSalesCount} tamamlanan satış &bull; Üye: {memberSinceYears} yıl
          </p>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3.5 border-t backdrop-blur-md flex items-center justify-between gap-3 ${
          isDark ? "bg-[#101317]/95 border-[#2A313C]" : "bg-white/95 border-[#E5E8EB] shadow-md"
        }`}
      >
        <div>
          <span className={`text-[10px] block ${isDark ? "text-[#8E97A4]" : "text-[#69717D]"}`}>Tutar</span>
          <ItemSepetiPrice amount={totalPrice} size="md" />
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={cartAdding}
              aria-label="Sepete Ekle"
              className={`h-10 px-3 rounded-[8px] border text-xs font-semibold flex items-center justify-center cursor-pointer ${
                isDark ? "border-[#2A313C] bg-[#181C22] text-white" : "border-[#E5E8EB] bg-[#F0F4F3] text-[#15191E]"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || loading}
            className="flex-1 h-10 rounded-[8px] bg-[#0F625C] text-white font-semibold text-xs flex items-center justify-center disabled:opacity-40 cursor-pointer hover:bg-[#0C4F4A]"
          >
            {isOutOfStock ? "Tükendi" : loading ? "İşleniyor..." : "Satın Al"}
          </button>
        </div>
      </div>
    </div>
  );
}

