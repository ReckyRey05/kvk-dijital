"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ItemSepetiThemeProvider, useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";
import { ItemSepetiCartProvider, useItemSepetiCart } from "@/context/ItemSepetiCartContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import { ItemSepetiPrice } from "@/components/itemsepeti/marketplace/MarketplacePrimitives";
import { ItemSepetiEnrichedCart } from "@/types/marketplace";
import { ShoppingBag, Trash2, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

export function CartView() {
  const router = useRouter();
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";
  const { items, updateQuantity, removeItem, clearCartItems } = useItemSepetiCart();

  const [cartData, setCartData] = useState<ItemSepetiEnrichedCart | null>(null);
  const [loading, setLoading] = useState(true);

  // Load enriched cart from server based on items
  useEffect(() => {
    let isMounted = true;
    async function loadEnriched() {
      setLoading(true);
      try {
        const res = await fetch("/api/itemsepeti/cart?buyerId=demo_buyer_user_1");
        const data = await res.json();
        if (isMounted && data.success) {
          setCartData(data.cart);
        }
      } catch {
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadEnriched();
    return () => {
      isMounted = false;
    };
  }, [items]);

  const isEmpty = !cartData || cartData.items.length === 0;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-[#9498A6]">
        Sepetiniz yükleniyor...
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div
          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center border ${
            isDark ? "bg-[#161921] border-[#282C3A]" : "bg-white border-[#DCDDE1]"
          }`}
        >
          <ShoppingBag className="w-8 h-8 text-[#D99532]" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-inherit">Sepetin boş</h1>
          <p className={`text-xs ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
            Henüz sepetine herhangi bir ürün eklemedin.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/itemsepeti">
            <ItemSepetiButton variant="primary" size="md">
              Ürünleri Keşfet
            </ItemSepetiButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* HEADER & CLEAR */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: isDark ? "#282C3A" : "#DCDDE1" }}>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-inherit">Sepetim</h1>
          <p className={`text-xs ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
            Toplam {cartData.totalItemCount} adet ürün
          </p>
        </div>
        <button
          type="button"
          onClick={() => clearCartItems()}
          className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Sepeti Boşalt</span>
        </button>
      </div>

      {/* WARNING BANNER FOR UNAVAILABLE ITEMS */}
      {cartData.hasUnavailableItems && (
        <div className="p-4 rounded-[10px] bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Sepetinizde stokta olmayan veya satışa kapatılmış ürünler bulunmaktadır. Lütfen bu ürünleri
            sepetinizden kaldırarak ödemeye devam ediniz.
          </span>
        </div>
      )}

      {/* GRID: LEFT CART ITEMS (BY SELLER) | RIGHT SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: MULTI-SELLER CART ITEM CLUSTERS */}
        <div className="lg:col-span-8 space-y-6">
          {cartData.sellers.map((sellerGroup) => (
            <div
              key={sellerGroup.sellerId}
              className={`rounded-[12px] border overflow-hidden ${
                isDark ? "bg-[#161921] border-[#282C3A]" : "bg-white border-[#DCDDE1]"
              }`}
            >
              {/* SELLER HEADER */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between text-xs"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#F0F1F3",
                  borderColor: isDark ? "#282C3A" : "#DCDDE1",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>Satıcı:</span>
                  <Link
                    href={`/satici/${sellerGroup.sellerId}`}
                    className="font-bold text-inherit hover:underline"
                  >
                    @{sellerGroup.sellerStoreName}
                  </Link>
                </div>
                <span className={`font-semibold ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
                  Ara Toplam: <strong>{sellerGroup.sellerSubtotal.toLocaleString("tr-TR")} TL</strong>
                </span>
              </div>

              {/* SELLER ITEM ROWS */}
              <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#DCDDE1" }}>
                {sellerGroup.items.map((item) => (
                  <div key={item.listingId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* ITEM INFO */}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded bg-[#D99532]/10 text-[#D99532]">
                          {item.listing.gameName}
                        </span>
                        {item.listing.serverName && (
                          <span className={`text-[10px] ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
                            {item.listing.serverName}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/ilan/${item.listingId}`}
                        className="text-sm font-bold text-inherit hover:underline block"
                      >
                        {item.listing.title}
                      </Link>
                      {item.warning && (
                        <p className="text-[11px] text-red-500 font-medium">{item.warning}</p>
                      )}
                    </div>

                    {/* QUANTITY AND PRICE */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      {/* QUANTITY STEPPER */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                          className={`w-7 h-7 rounded-[6px] border flex items-center justify-center text-xs font-bold ${
                            isDark ? "border-white/10 bg-black/20" : "border-[#DCDDE1] bg-[#F0F1F3]"
                          }`}
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-inherit">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                          disabled={item.quantity >= item.listing.stockQuantity}
                          className={`w-7 h-7 rounded-[6px] border flex items-center justify-center text-xs font-bold disabled:opacity-30 ${
                            isDark ? "border-white/10 bg-black/20" : "border-[#DCDDE1] bg-[#F0F1F3]"
                          }`}
                        >
                          +
                        </button>
                      </div>

                      {/* ITEM TOTAL */}
                      <div className="w-24 text-right">
                        <ItemSepetiPrice amount={item.itemSubtotal} size="sm" />
                      </div>

                      {/* REMOVE BUTTON */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.listingId)}
                        aria-label="Ürünü sepetten çıkar"
                        className={`p-1.5 rounded-[6px] hover:text-red-500 transition-colors ${
                          isDark ? "text-[#9498A6]" : "text-[#626772]"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* BACK TO SHOPPING LINK */}
          <Link
            href="/itemsepeti"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#D99532] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Alışverişe Devam Et</span>
          </Link>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY CARD */}
        <div className="lg:col-span-4 sticky top-24">
          <div
            className={`p-6 rounded-[14px] border space-y-5 ${
              isDark ? "bg-[#161921] border-[#282C3A]" : "bg-white border-[#DCDDE1] shadow-xs"
            }`}
          >
            <h2 className="text-sm font-bold text-inherit border-b pb-3" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#DCDDE1" }}>
              Sipariş Özeti
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>Ürün Toplamı</span>
                <span className="font-semibold text-inherit">
                  {cartData.totalAmount.toLocaleString("tr-TR")} TL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>Hizmet Bedeli</span>
                <span className="font-semibold text-[#059669]">0 TL (Ücretsiz)</span>
              </div>
              <div className="pt-2 border-t flex items-baseline justify-between" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#DCDDE1" }}>
                <span className="font-bold text-inherit">Ödenecek Tutar</span>
                <ItemSepetiPrice amount={cartData.totalAmount} size="lg" />
              </div>
            </div>

            <ItemSepetiButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => router.push("/checkout")}
              disabled={cartData.hasUnavailableItems}
            >
              Ödemeye Geç
            </ItemSepetiButton>

            <div className={`pt-2 flex items-center justify-center gap-2 text-[11px] ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
              <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
              <span>Escrow güvencesiyle 256-Bit SSL korumalı</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItemSepetiCartPage() {
  return (
    <ItemSepetiThemeProvider>
      <ItemSepetiCartProvider currentUserId="demo_buyer_user_1">
        <div className="flex flex-col min-h-screen">
          <ItemSepetiHeader />
          <main className="flex-1">
            <CartView />
          </main>
          <ItemSepetiFooter />
        </div>
      </ItemSepetiCartProvider>
    </ItemSepetiThemeProvider>
  );
}