"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  Package,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { TeklifimComparisonItem } from "@/types/teklifimGelsin";
import { enforceComparisonLimit } from "@/lib/teklifimGelsin/searchUtils";

const STORAGE_KEY = "teklifim_comparison_items";

export function addToComparison(item: TeklifimComparisonItem): { success: boolean; error?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items: TeklifimComparisonItem[] = raw ? JSON.parse(raw) : [];

    const ids = items.map((i) => i.id);
    const check = enforceComparisonLimit(ids, item.id, 3);

    if (!check.allowed) {
      return { success: false, error: check.error };
    }

    if (ids.includes(item.id)) {
      // Toggle remove
      const updated = items.filter((i) => i.id !== item.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("teklifim-compare-update"));
      return { success: true };
    } else {
      // Add
      const updated = [...items, item];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("teklifim-compare-update"));
      return { success: true };
    }
  } catch (err: any) {
    return { success: false, error: "Karşılaştırma listesi güncellenemedi." };
  }
}

export function getComparisonItems(): TeklifimComparisonItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function ComparisonDrawer() {
  const [items, setItems] = useState<TeklifimComparisonItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadItems = () => {
    setItems(getComparisonItems());
  };

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener("teklifim-compare-update", handleUpdate);
    return () => window.removeEventListener("teklifim-compare-update", handleUpdate);
  }, []);

  const handleRemove = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setItems(updated);
    window.dispatchEvent(new CustomEvent("teklifim-compare-update"));
  };

  const handleClearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    setIsModalOpen(false);
    window.dispatchEvent(new CustomEvent("teklifim-compare-update"));
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* FLOATING BOTTOM DOCK */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border border-slate-700/70 rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100">Karşılaştırma</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                {items.length}/3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {items.map((i) => i.title).join(", ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClearAll}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Tümünü Temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Karşılaştır</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* COMPARISON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* MODAL HEADER */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Yan Yana Karşılaştırma
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Seçilen {items.length} öğenin teknik ve ticari detayları
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  Tümünü Temizle
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MODAL BODY TABLE */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-4"
                  >
                    {/* TOP INFO & IMAGE */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.type === "product" ? "Ürün" : "Tedarikçi"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Kaldır"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="h-32 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : item.type === "product" ? (
                          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        ) : (
                          <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                          {item.title}
                        </h4>
                        {item.supplierName && item.type === "product" && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.supplierName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* COMPARISON ATTRIBUTES */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                      {/* Price (Product only) */}
                      {item.type === "product" && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Birim Fiyat:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.priceVisibility === "hidden"
                              ? "Teklif İsteyin"
                              : item.price !== undefined
                              ? `${item.price.toLocaleString("tr-TR")} TL`
                              : "Belirtilmedi"}
                          </span>
                        </div>
                      )}

                      {/* MOQ (Product only) */}
                      {item.type === "product" && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Asgari Sipariş:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {item.minimumOrder
                              ? `${item.minimumOrder} ${item.unit || "Adet"}`
                              : "Belirtilmedi"}
                          </span>
                        </div>
                      )}

                      {/* Stock (Product only) */}
                      {item.type === "product" && item.stockStatus && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Stok:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.stockStatus === "in_stock"
                              ? "Stokta Var"
                              : item.stockStatus === "low_stock"
                              ? "Kritik Stok"
                              : "Sipariş Üzerine"}
                          </span>
                        </div>
                      )}

                      {/* Category */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Kategori:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                          {item.category}
                        </span>
                      </div>

                      {/* Location / City */}
                      {item.city && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Lokasyon:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.city}
                          </span>
                        </div>
                      )}

                      {/* Rating (Supplier only) */}
                      {item.type === "supplier" && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Puan:</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {item.rating ? `${item.rating.toFixed(1)} / 5` : "Yeni Tedarikçi"}
                          </span>
                        </div>
                      )}

                      {/* Completed Deals (Supplier only) */}
                      {item.type === "supplier" && item.completedDeals !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Tamamlanan Anlaşma:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.completedDeals} adet
                          </span>
                        </div>
                      )}

                      {/* Verified Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Doğrulama:</span>
                        <span className="font-semibold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                          {item.isVerified ? (
                            <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Doğrulandı
                            </span>
                          ) : (
                            <span className="text-slate-400">Standart</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="pt-2">
                      <Link
                        href={item.url}
                        onClick={() => setIsModalOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Detayı Gör</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
