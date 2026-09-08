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
import { ItemSepetiEnrichedCart, ItemSepetiOrder } from "@/types/marketplace";
import { ShieldCheck, AlertCircle, CheckCircle2, Lock, ArrowLeft, Clock } from "lucide-react";

export function CheckoutView() {
  const router = useRouter();
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";
  const { clearCartItems } = useItemSepetiCart();

  const [cartData, setCartData] = useState<ItemSepetiEnrichedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrders, setCreatedOrders] = useState<ItemSepetiOrder[] | null>(null);

  // Delivery fields per listing
  const [deliveryDetails, setDeliveryDetails] = useState<
    Record<string, { characterName?: string; steamTradeUrl?: string; specialNotes?: string }>
  >({});

  const buyerId = "demo_buyer_user_1";
  const buyerEmail = "buyer@itemsepeti.com";

  // Load cart data for checkout validation
  useEffect(() => {
    let isMounted = true;
    async function loadCart() {
      setLoading(true);
      try {
        const res = await fetch(`/api/itemsepeti/cart?buyerId=${encodeURIComponent(buyerId)}`);
        const data = await res.json();
        if (isMounted && data.success) {
          setCartData(data.cart);
        }
      } catch {
        if (isMounted) setError("Sepet bilgileri alınamadı.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCart();
    return () => {
      isMounted = false;
    };
  }, [buyerId]);

  const handleDeliveryChange = (
    listingId: string,
    field: "characterName" | "steamTradeUrl" | "specialNotes",
    value: string
  ) => {
    setDeliveryDetails((prev) => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        [field]: value,
      },
    }));
  };

  const handleCompleteOrder = async () => {
    if (submitting) return; // Prevent double submit
    setError(null);
    setSubmitting(true);

    try {
      // Deterministic idempotency key per session attempt
      const idempotencyKey = `idem_${buyerId}_${Date.now()}`;

      const res = await fetch("/api/itemsepeti/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId,
          buyerEmail,
          idempotencyKey,
          deliveryDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Sipariş oluşturulamadı.");
      } else {
        setCreatedOrders(data.orders || []);
        await clearCartItems();
      }
    } catch {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-[#9498A6]">
        Sipariş kontrolü yapılıyor...
      </div>
    );
  }

  // SUCCESS CONFIRMATION STATE
  if (createdOrders && createdOrders.length > 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
        <div
          className={`p-8 rounded-[16px] border text-center space-y-4 ${
            isDark ? "bg-[#161921] border-[#282C3A]" : "bg-white border-[#DCDDE1] shadow-sm"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-inherit">
              Siparişiniz Başarıyla Oluşturuldu
            </h1>
            <p className={`text-xs ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
              Sipariş durumunuz: <strong className="text-[#D99532]">PENDING_PAYMENT (Ödeme Bekleniyor)</strong>
            </p>
          </div>

          <div
            className="p-4 rounded-[10px] border text-left divide-y space-y-3"
            style={{
              backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#F0F1F3",
              borderColor: isDark ? "#282C3A" : "#DCDDE1",
            }}
          >
            {createdOrders.map((ord) => (
              <div key={ord.id} className="pt-2 first:pt-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-inherit">{ord.orderNumber}</span>
                  <span className="font-semibold text-[#059669]">
                    {ord.totalAmount.toLocaleString("tr-TR")} TL
                  </span>
                </div>
                <div className={`flex items-center justify-between text-[11px] ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
                  <span>Satıcı: @{ord.sellerStoreName}</span>
                  <span>{ord.items.length} ürün</span>
                </div>
              </div>
            ))}
          </div>

          {/* PAYMENT GATEWAY PLACEHOLDER (FAZ 6 NOTICE) */}
          <div className="p-3.5 rounded-[8px] bg-[#D99532]/10 border border-[#D99532]/20 text-xs text-[#D99532] text-left flex items-start gap-2.5">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ödeme Sağlayıcı Bildirimi</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Ödeme entegrasyonu (3D Secure / Cüzdan) sonraki fazda bağlanacaktır. Stoklarınız 15 dakika boyunca
                güvenle adınıza ayrılmıştır.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-center gap-3">
            <Link href={`/siparis/${createdOrders[0]?.id}`}>
              <ItemSepetiButton variant="primary" size="md">
                Siparişimi Görüntüle & Öde &rarr;
              </ItemSepetiButton>
            </Link>
            <Link href="/siparislerim">
              <ItemSepetiButton variant="secondary" size="md">
                Tüm Siparişlerim
              </ItemSepetiButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cartData || cartData.items.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-bold text-inherit">Ödeme yapılacak ürün yok</h1>
        <p className={`text-xs ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
          Checkout yapabilmek için sepetinize en az 1 ürün eklemelisiniz.
        </p>
        <Link href="/itemsepeti">
          <ItemSepetiButton variant="primary" size="md">
            Ürünleri Keşfet
          </ItemSepetiButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* HEADER & BREADCRUMB */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: isDark ? "#282C3A" : "#DCDDE1" }}>
        <div className="flex items-center gap-3">
          <Link
            href="/sepet"
            className={`p-1.5 rounded-[6px] border ${
              isDark ? "border-[#282C3A] text-[#9498A6]" : "border-[#DCDDE1] text-[#626772]"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-inherit">Siparişi Tamamla</h1>
            <p className={`text-xs ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
              Teslimat bilgileri ve ödeme özeti
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[10px] bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* CHECKOUT 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: DELIVERY REQUIREMENTS PER ITEM */}
        <div className="lg:col-span-8 space-y-6">
          {cartData.sellers.map((sellerGroup) => (
            <div
              key={sellerGroup.sellerId}
              className={`rounded-[12px] border overflow-hidden ${
                isDark ? "bg-[#161921] border-[#282C3A]" : "bg-white border-[#DCDDE1]"
              }`}
            >
              {/* SELLER BANNER */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between text-xs"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#F0F1F3",
                  borderColor: isDark ? "#282C3A" : "#DCDDE1",
                }}
              >
                <span className="font-bold text-inherit">Satıcı: @{sellerGroup.sellerStoreName}</span>
                <span className={`text-[11px] ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
                  {sellerGroup.items.length} ürün &bull; {sellerGroup.sellerSubtotal.toLocaleString("tr-TR")} TL
                </span>
              </div>

              {/* ITEMS & DELIVERY FORM */}
              <div className="p-4 space-y-5 divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#DCDDE1" }}>
                {sellerGroup.items.map((item) => (
                  <div key={item.listingId} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D99532]/10 text-[#D99532]">
                          {item.listing.gameName}
                        </span>
                        <h2 className="text-sm font-bold text-inherit mt-0.5">{item.listing.title}</h2>
                      </div>
                      <div className="text-right">
                        <ItemSepetiPrice amount={item.itemSubtotal} size="sm" />
                        <span className={`text-[11px] block ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
                          {item.quantity} adet
                        </span>
                      </div>
                    </div>

                    {/* PRODUCT-SPECIFIC DELIVERY REQUIREMENTS */}
                    <div className="pt-1">
                      {item.listing.productType === "CURRENCY" || item.listing.productType === "ITEM" ? (
                        <div className="space-y-1">
                          <label className={`text-xs font-medium ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
                            Oyun İçi Karakter / Oyuncu Adı (Zorunlu)
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: DragonSlayer99"
                            value={deliveryDetails[item.listingId]?.characterName || ""}
                            onChange={(e) =>
                              handleDeliveryChange(item.listingId, "characterName", e.target.value)
                            }
                            className={`w-full rounded-[8px] p-2.5 text-xs border focus:outline-none focus:border-[#D99532] ${
                              isDark
                                ? "bg-black/20 border-white/10 text-white"
                                : "bg-[#F0F1F3] border-[#DCDDE1] text-[#17191F]"
                            }`}
                          />
                        </div>
                      ) : item.listing.productType === "DIGITAL_CODE" ? (
                        <div className="p-2.5 rounded-[8px] bg-[#059669]/10 text-xs text-[#059669] flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Dijital Kod teslimatı: Ödeme sonrasında anında ekranda gösterilir.</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className={`text-xs font-medium ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
                            Teslimat Notu (İsteğe Bağlı)
                          </label>
                          <input
                            type="text"
                            placeholder="Satıcıya iletmek istediğiniz özel not"
                            value={deliveryDetails[item.listingId]?.specialNotes || ""}
                            onChange={(e) =>
                              handleDeliveryChange(item.listingId, "specialNotes", e.target.value)
                            }
                            className={`w-full rounded-[8px] p-2.5 text-xs border focus:outline-none focus:border-[#D99532] ${
                              isDark
                                ? "bg-black/20 border-white/10 text-white"
                                : "bg-[#F0F1F3] border-[#DCDDE1] text-[#17191F]"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY & SUBMISSION */}
        <div className="lg:col-span-4 sticky top-24">
          <div
            className={`p-6 rounded-[14px] border space-y-5 ${
              isDark ? "bg-[#161921] border-[#282C3A]" : "bg-white border-[#DCDDE1] shadow-xs"
            }`}
          >
            <h2 className="text-sm font-bold text-inherit border-b pb-3" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#DCDDE1" }}>
              Ödeme ve Sipariş Onayı
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>Alıcı Hesabı</span>
                <span className="font-semibold text-inherit">{buyerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>Toplam Tutar</span>
                <span className="font-bold text-inherit">
                  {cartData.totalAmount.toLocaleString("tr-TR")} TL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-[#9498A6]" : "text-[#626772]"}>Platform Komisyonu</span>
                <span className="font-semibold text-[#059669]">0 TL (Ücretsiz)</span>
              </div>
              <div className="pt-2 border-t flex items-baseline justify-between" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#DCDDE1" }}>
                <span className="font-bold text-inherit">Net Ödenecek</span>
                <ItemSepetiPrice amount={cartData.totalAmount} size="lg" />
              </div>
            </div>

            {/* PAYMENT PLACEHOLDER NOTICE */}
            <div className="p-3 rounded-[8px] bg-black/10 border border-white/5 text-[11px] text-[#9498A6] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-inherit">
                <Lock className="w-3.5 h-3.5 text-[#D99532]" />
                <span>Ödeme Yöntemi</span>
              </div>
              <p>Ödeme adımı sonraki aşamada kart veya cüzdan bakiyesiyle tamamlanacaktır.</p>
            </div>

            <ItemSepetiButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCompleteOrder}
              disabled={submitting || cartData.hasUnavailableItems}
            >
              {submitting ? "Sipariş Oluşturuluyor..." : "Siparişi Onayla"}
            </ItemSepetiButton>

            <div className={`pt-2 flex items-center justify-center gap-2 text-[11px] ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
              <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
              <span>Escrow Emanet Havuzu Koruması</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItemSepetiCheckoutPage() {
  return (
    <ItemSepetiThemeProvider>
      <ItemSepetiCartProvider currentUserId="demo_buyer_user_1">
        <div className="flex flex-col min-h-screen">
          <ItemSepetiHeader />
          <main className="flex-1">
            <CheckoutView />
          </main>
          <ItemSepetiFooter />
        </div>
      </ItemSepetiCartProvider>
    </ItemSepetiThemeProvider>
  );
}