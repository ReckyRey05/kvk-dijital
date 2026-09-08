"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import { useItemSepetiAuth } from "@/context/ItemSepetiAuthContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import { ItemSepetiListing, ItemSepetiListingStatus } from "@/types/marketplace";
import {
  Package,
  PlusCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
} from "lucide-react";

export default function MyListingsPage() {
  const { user } = useItemSepetiAuth();
  const [listings, setListings] = useState<ItemSepetiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const sellerId = user?.uid || "seller_demo_user";
      const res = await fetch(`/api/itemsepeti/seller/listings?sellerId=${sellerId}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleToggleStatus = async (listingId: string, currentStatus: ItemSepetiListingStatus) => {
    const nextStatus: ItemSepetiListingStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await fetch("/api/itemsepeti/seller/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, status: nextStatus }),
      });
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: nextStatus } : l))
      );
      setFeedback(nextStatus === "active" ? "İlan yayına alındı." : "İlan duraklatıldı.");
      setTimeout(() => setFeedback(null), 2500);
    } catch {}
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Bu ilanı tamamen silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/itemsepeti/seller/listings?listingId=${listingId}`, {
        method: "DELETE",
      });
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setFeedback("İlan başarıyla silindi.");
      setTimeout(() => setFeedback(null), 2500);
    } catch {}
  };

  const filteredListings = listings.filter((item) => {
    const matchesText =
      item.title.toLowerCase().includes(filterText.toLowerCase()) ||
      item.gameName.toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && item.status === "active") ||
      (statusFilter === "PAUSED" && item.status === "paused");
    return matchesText && matchesStatus;
  });

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-inherit">İlan Yönetimi</h1>
              <p className="text-xs sm:text-sm text-[#9498A6]">
                Satıştaki tüm ürünlerinizi, stok durumlarını ve fiyatlarınızı anlık olarak yönetin.
              </p>
            </div>

            <Link href="/ilan-ver">
              <ItemSepetiButton variant="primary" size="md">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                <span>Yeni İlan Ekle</span>
              </ItemSepetiButton>
            </Link>
          </div>

          {feedback && (
            <div className="p-3 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-[12px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9498A6]" />
              <input
                type="text"
                placeholder="İlanlarımda ara..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[8px] text-xs bg-black/5 dark:bg-black/20 border border-[#DCDDE1] dark:border-[#282C3A] text-inherit focus:ring-1 focus:ring-[#D99532] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-[#D99532] text-white"
                    : "bg-black/5 dark:bg-black/20 text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                Tümü ({listings.length})
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors ${
                  statusFilter === "ACTIVE"
                    ? "bg-[#D99532] text-white"
                    : "bg-black/5 dark:bg-black/20 text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                Yayında ({listings.filter((l) => l.status === "active").length})
              </button>
              <button
                onClick={() => setStatusFilter("PAUSED")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors ${
                  statusFilter === "PAUSED"
                    ? "bg-[#D99532] text-white"
                    : "bg-black/5 dark:bg-black/20 text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                Duraklatılmış ({listings.filter((l) => l.status === "paused").length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-[#9498A6]">İlanlar yükleniyor...</div>
          ) : filteredListings.length === 0 ? (
            <div className="py-16 text-center rounded-[14px] border border-dashed border-[#DCDDE1] dark:border-[#282C3A] space-y-3">
              <Package className="w-10 h-10 mx-auto text-[#9498A6]" />
              <h3 className="text-sm font-bold text-inherit">Kayıtlı İlan Bulunamadı</h3>
              <p className="text-xs text-[#9498A6]">Filtrelerinizi değiştirin veya yeni bir ilan açın.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-[12px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D99532]/10 text-[#D99532]">
                        {item.gameName}
                      </span>
                      <span className="text-[10px] text-[#9498A6]">{item.categoryName}</span>
                      {item.serverName && (
                        <span className="text-[10px] text-[#9498A6]">&bull; {item.serverName}</span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {item.status === "active" ? "Yayında" : "Duraklatıldı"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-inherit line-clamp-1">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#9498A6]">
                      <span>Stok: <strong className="text-inherit">{item.stockQuantity} Adet</strong></span>
                      <span>Teslimat: <strong className="text-inherit">{item.deliverySlaHours} Saat SLA</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] block font-semibold text-[#9498A6]">Fiyat</span>
                      <span className="text-base font-black text-inherit">
                        {item.unitPrice.toLocaleString("tr-TR")} TL
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        title={item.status === "active" ? "İlanı Duraklat" : "İlanı Yayına Al"}
                        className="p-2 rounded-[8px] border border-[#DCDDE1] dark:border-[#282C3A] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {item.status === "active" ? (
                          <PauseCircle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      </button>

                      <Link
                        href={`/ilan/${item.id}`}
                        target="_blank"
                        title="İlanı Sayfada İncele"
                        className="p-2 rounded-[8px] border border-[#DCDDE1] dark:border-[#282C3A] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-[#9498A6]" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item.id)}
                        title="İlanı Sil"
                        className="p-2 rounded-[8px] border border-[#DCDDE1] dark:border-[#282C3A] hover:bg-red-500/10 hover:border-red-500/30 text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
