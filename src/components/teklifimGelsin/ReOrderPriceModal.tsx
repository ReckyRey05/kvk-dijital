"use client";

import React, { useState } from "react";
import {
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  Building,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { TeklifimFrequentlyPurchasedItem } from "@/types/teklifimGelsin";
import { useRouter } from "next/navigation";

interface ReOrderPriceModalProps {
  item: TeklifimFrequentlyPurchasedItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReOrderPriceModal({
  item,
  isOpen,
  onClose,
}: ReOrderPriceModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const prevPrice = item.lastPrice;
  const currentPrice = item.currentCatalogPrice;
  const deltaAmount = item.priceDeltaAmount;
  const deltaPct = item.priceDeltaPercentage;

  const hasCatalogPrice = typeof currentPrice === "number" && currentPrice > 0;
  const isCheaper = deltaAmount !== null && deltaAmount !== undefined && deltaAmount < 0;
  const isMoreExpensive = deltaAmount !== null && deltaAmount !== undefined && deltaAmount > 0;

  const handleRequestQuote = () => {
    // Navigate to request builder prefilling the item details
    const params = new URLSearchParams({
      prefillTitle: item.productName,
      category: item.category,
      quantity: String(item.lastQuantity || 1),
      unit: item.lastUnit || "Adet",
    });
    router.push(`/teklifim-gelsin/requests/new?${params.toString()}`);
  };

  const handleReOrderDirect = () => {
    // If product exists in catalog, go directly to product detail page to request or order
    if (item.productId) {
      router.push(`/teklifim-gelsin/products/${item.productId}`);
    } else {
      handleRequestQuote();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tekrar Satin Al
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guncel fiyat ve tedarik kosullari kontrolu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          {/* PRODUCT INFO HEADER */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              {item.category}
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              {item.productName}
            </h4>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Toplam {item.totalOrdersCount} kez siparis edildi</span>
              <span>·</span>
              <span>Son tedarikci: {item.lastSupplierName}</span>
            </div>
          </div>

          {/* PRICE COMPARISON BOX */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Onceki Birim Fiyat
              </span>
              <div className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                {prevPrice.toLocaleString("tr-TR")} TL
              </div>
              <span className="text-[10px] text-slate-400">
                {item.lastQuantity} {item.lastUnit} siparis edilmisti
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Guncel Katalog Fiyati
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {hasCatalogPrice
                  ? `${currentPrice!.toLocaleString("tr-TR")} TL`
                  : "Fiyat Teklifi Ile"}
              </div>
              <div className="text-[10px] mt-0.5">
                {hasCatalogPrice && deltaPct !== null && deltaPct !== undefined ? (
                  isCheaper ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {Math.abs(deltaAmount!)} TL daha dusuk ({deltaPct}%)
                    </span>
                  ) : isMoreExpensive ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{deltaAmount} TL artis (+%{deltaPct})
                    </span>
                  ) : (
                    <span className="text-slate-500">Ayni fiyat</span>
                  )
                ) : (
                  <span className="text-slate-400">Katalog fiyati girilmemis</span>
                )}
              </div>
            </div>
          </div>

          {/* CURRENT CONDITIONS SPECS */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Package className="w-4 h-4 mx-auto mb-1 text-slate-500" />
              <div className="text-[10px] text-slate-400">Stok Durumu</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                {item.currentStockStatus === "in_stock"
                  ? "Stokta Var"
                  : item.currentStockStatus === "made_to_order"
                  ? "Siparise Ozel"
                  : "Tedarik Edilir"}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Building className="w-4 h-4 mx-auto mb-1 text-slate-500" />
              <div className="text-[10px] text-slate-400">Min. Siparis (MOQ)</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {item.currentMinOrder || item.lastQuantity || 1} {item.lastUnit}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Truck className="w-4 h-4 mx-auto mb-1 text-slate-500" />
              <div className="text-[10px] text-slate-400">Tahmini Teslimat</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {item.currentLeadTimeDays || 3} Is Gunu
              </div>
            </div>
          </div>

          {/* NOTICE */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
            Eski siparis otomatik kopyalanmaz. Guncel toptan fiyati teyit etmek icin teklif isteyebilir veya katalog urunune gidebilirsiniz.
          </p>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Vazgec
          </button>
          <button
            onClick={handleRequestQuote}
            className="px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            Yeni Teklif Iste
          </button>
          <button
            onClick={handleReOrderDirect}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Tekrar Siparis Ver</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
