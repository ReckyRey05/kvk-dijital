"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import {
  ShieldCheck,
  Star,
  Clock,
  Package,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { getSellerBySlug, getSellerListings } from "@/lib/itemsepeti/catalogService";
import { getSellerReviews, calculateSellerReputation } from "@/lib/itemsepeti/reviewService";
import { ItemSepetiListing } from "@/types/marketplace";
import { SeedSeller } from "@/lib/itemsepeti/catalogSeedData";
import { useItemSepetiCart } from "@/context/ItemSepetiCartContext";

export default function SellerStoreFrontPage() {
  const params = useParams();
  const storeSlug = (params?.storeSlug as string) || "dragontrader";

  const [seller, setSeller] = useState<SeedSeller | null>(null);
  const [listings, setListings] = useState<ItemSepetiListing[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");
  const [loading, setLoading] = useState(true);
  const { addItem } = useItemSepetiCart();
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadStore() {
      setLoading(true);
      const sellerData = await getSellerBySlug(storeSlug);
      if (sellerData) {
        setSeller(sellerData);
        const sellerItems = await getSellerListings(sellerData.storeName);
        setListings(sellerItems);
      } else {
        // Fallback default seller
        setSeller({
          id: "seller_" + storeSlug,
          storeName: storeSlug,
          storeSlug: storeSlug,
          isVerifiedSeller: true,
          ratingAverage: 4.9,
          ratingCount: 85,
          completedSalesCount: 120,
          averageDeliveryMinutes: 15,
          memberSinceYears: 2,
          bio: "Güvenilir oyuncu pazarı satıcısı. Anında teslimat ve 7/24 canlı destek.",
        });
        const items = await getSellerListings(storeSlug);
        setListings(items);
      }
      setLoading(false);
    }
    loadStore();
  }, [storeSlug]);

  const reviews = seller ? getSellerReviews(seller.storeName) : [];
  const rep = seller ? calculateSellerReputation(seller.storeName) : { averageRating: 4.9, reviewCount: 85, positivePercentage: 98 };

  const handleAddToCart = async (listing: ItemSepetiListing) => {
    const res = await addItem(listing.id, 1);
    if (res.success) {
      setCartSuccess(listing.id);
      setTimeout(() => setCartSuccess(null), 2500);
    }
  };

  if (loading || !seller) {
    return (
      <ItemSepetiThemeProvider>
        <div className="flex flex-col min-h-screen">
          <ItemSepetiHeader />
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-20 text-center">
            <div className="animate-pulse text-sm text-[#9498A6]">Mağaza yükleniyor...</div>
          </main>
          <ItemSepetiFooter />
        </div>
      </ItemSepetiThemeProvider>
    );
  }

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-[#9498A6] hover:text-inherit transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Pazaryerine Dön</span>
            </Link>
          </div>

          {/* STORE HERO HEADER */}
          <div className="p-6 sm:p-8 rounded-[20px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[#D99532]/15 border-2 border-[#D99532] flex items-center justify-center text-2xl font-black text-[#D99532] shrink-0 shadow-inner">
                {seller.storeName.substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-inherit">
                    {seller.storeName}
                  </h1>
                  {seller.isVerifiedSeller && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Doğrulanmış Satıcı</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#9498A6] max-w-xl leading-relaxed">
                  {seller.bio}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#9498A6] pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#D99532]" />
                    <span>{seller.memberSinceYears} yıldır üye</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{seller.completedSalesCount}+ Başarılı Satış</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Ort. Teslimat: ~{seller.averageDeliveryMinutes} dk</span>
                  </span>
                </div>
              </div>
            </div>

            {/* REPUTATION METRICS TILE */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-[#DCDDE1] dark:border-[#282C3A] flex items-center gap-6 self-stretch md:self-auto justify-around">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#9498A6] block">Puanı</span>
                <div className="flex items-center justify-center gap-1 text-xl font-black text-inherit mt-0.5">
                  <Star className="w-5 h-5 fill-[#D99532] text-[#D99532]" />
                  <span>{rep.averageRating || seller.ratingAverage}</span>
                </div>
                <span className="text-[10px] text-[#9498A6] block mt-0.5">({seller.ratingCount} oylama)</span>
              </div>

              <div className="w-[1px] h-10 bg-[#DCDDE1] dark:bg-[#282C3A]" />

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#9498A6] block">Memnuniyet</span>
                <span className="text-xl font-black text-emerald-500 block mt-0.5">
                  %{rep.positivePercentage}
                </span>
                <span className="text-[10px] text-[#9498A6] block mt-0.5">Olumlu Yorum</span>
              </div>
            </div>
          </div>

          {/* TABS SWITCHER */}
          <div className="border-b border-[#DCDDE1] dark:border-[#282C3A] flex items-center gap-8 text-sm font-bold">
            <button
              onClick={() => setActiveTab("listings")}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === "listings"
                  ? "text-[#D99532] border-b-2 border-[#D99532]"
                  : "text-[#9498A6] hover:text-inherit"
              }`}
            >
              <span>Satıştaki İlanlar ({listings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === "reviews"
                  ? "text-[#D99532] border-b-2 border-[#D99532]"
                  : "text-[#9498A6] hover:text-inherit"
              }`}
            >
              <span>Alıcı Değerlendirmeleri ({reviews.length > 0 ? reviews.length : seller.ratingCount})</span>
            </button>
          </div>

          {/* TAB 1: STORE LISTINGS */}
          {activeTab === "listings" && (
            <div>
              {listings.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-[#DCDDE1] dark:border-[#282C3A] text-[#9498A6] space-y-2">
                  <Package className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-sm font-semibold">Bu satıcının şu anda aktif ilanı bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="p-5 rounded-2xl border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-all flex flex-col justify-between space-y-4 shadow-xs group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#9498A6]">
                            {listing.gameName}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>Hızlı Teslimat</span>
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-inherit group-hover:text-[#D99532] transition-colors line-clamp-2">
                          {listing.title}
                        </h3>

                        <p className="text-xs text-[#9498A6]">
                          Stok: <strong className="text-inherit">{listing.stockQuantity} adet</strong> &bull; Teslimat: {listing.deliverySlaHours} saat
                        </p>
                      </div>

                      <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#9498A6] block">Fiyat</span>
                          <span className="text-lg font-black text-inherit">
                            {listing.unitPrice.toLocaleString("tr-TR")} TL
                          </span>
                        </div>

                        <ItemSepetiButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddToCart(listing)}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                          <span>{cartSuccess === listing.id ? "Eklendi!" : "Sepete Ekle"}</span>
                        </ItemSepetiButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STORE REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="p-8 rounded-2xl border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] text-center space-y-2">
                  <Star className="w-6 h-6 text-[#D99532] mx-auto fill-[#D99532]" />
                  <p className="text-sm font-bold text-inherit">Satıcı {seller.ratingAverage} Genel Memnuniyet Puanına Sahip</p>
                  <p className="text-xs text-[#9498A6]">Tüm tamamlanan siparişler alıcılar tarafından %{rep.positivePercentage} oranında olumlu değerlendirildi.</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#D99532]/10 text-[#D99532] flex items-center justify-center font-bold text-xs">
                          {rev.buyerDisplayName.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-inherit block">{rev.buyerDisplayName}</span>
                          <span className="text-[10px] text-[#9498A6]">Doğrulanmış Alıcı</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? "text-[#D99532] fill-[#D99532]"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="text-xs text-inherit leading-relaxed bg-black/5 dark:bg-black/20 p-3 rounded-xl">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
