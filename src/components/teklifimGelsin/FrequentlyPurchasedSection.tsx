"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Package,
  TrendingDown,
  TrendingUp,
  Store,
  Calendar,
} from "lucide-react";
import { TeklifimFrequentlyPurchasedItem } from "@/types/teklifimGelsin";
import ReOrderPriceModal from "./ReOrderPriceModal";

interface FrequentlyPurchasedSectionProps {
  items: TeklifimFrequentlyPurchasedItem[];
}

export default function FrequentlyPurchasedSection({
  items,
}: FrequentlyPurchasedSectionProps) {
  const [selectedItem, setSelectedItem] = useState<TeklifimFrequentlyPurchasedItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center">
        <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Sik Alinan Urun Bulunmuyor
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Tamamlanan siparisleriniz arttikca duzenli temin ettiginiz toptan sarf malzemeleri burada listelenecektir.
        </p>
      </div>
    );
  }

  const handleOpenModal = (item: TeklifimFrequentlyPurchasedItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Sik Aldiklarin & Hizli Tekrar Al
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gecmis siparislerinize dayali urunler ve guncel fiyat farki kontrolleri
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {items.length} Kalem
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item, idx) => {
          const deltaAmount = item.priceDeltaAmount;
          const deltaPct = item.priceDeltaPercentage;
          const isCheaper = deltaAmount !== null && deltaAmount !== undefined && deltaAmount < 0;
          const isMoreExpensive = deltaAmount !== null && deltaAmount !== undefined && deltaAmount > 0;

          return (
            <div
              key={`${item.productName}_${idx}`}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className="truncate max-w-[120px]">{item.category}</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {item.totalOrdersCount} siparis
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[40px]">
                  {item.productName}
                </h4>

                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Son Fiyat:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.lastPrice.toLocaleString("tr-TR")} TL
                    </span>
                  </div>

                  {item.currentCatalogPrice && deltaPct !== null && deltaPct !== undefined && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Guncel:</span>
                      {isCheaper ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          {deltaPct}% Tasarruf
                        </span>
                      ) : isMoreExpensive ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          +{deltaPct}%
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Ayni Fiyat</span>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 truncate">
                    <Store className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{item.lastSupplierName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tekrar Al</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <ReOrderPriceModal
          item={selectedItem}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
