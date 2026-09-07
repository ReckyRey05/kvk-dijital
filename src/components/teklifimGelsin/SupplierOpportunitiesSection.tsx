"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  MapPin,
  Package,
  Calendar,
  Wallet,
  ArrowUpRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { TeklifimOpportunityItem } from "@/types/teklifimGelsin";

interface SupplierOpportunitiesSectionProps {
  opportunities: TeklifimOpportunityItem[];
  onOpenQuoteModal?: (opportunity: TeklifimOpportunityItem) => void;
}

export default function SupplierOpportunitiesSection({
  opportunities,
  onOpenQuoteModal,
}: SupplierOpportunitiesSectionProps) {
  const [filterMode, setFilterMode] = useState<"all" | "high_score" | "city" | "catalog">("all");

  const filteredOpportunities = useMemo(() => {
    switch (filterMode) {
      case "high_score":
        return opportunities.filter((o) => o.matchScore >= 70);
      case "city":
        return opportunities.filter((o) => o.matchSignals.includes("Sehrinde"));
      case "catalog":
        return opportunities.filter((o) => o.matchSignals.includes("Katalog Urunun Var"));
      default:
        return opportunities;
    }
  }, [opportunities, filterMode]);

  return (
    <div id="opportunities" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Bugun Sana Uygun Firsatlar
            </h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {opportunities.length} Firsat
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Katalogun, teslimat bolgen ve kategorilerinle eslesen acik toptan alim talepleri.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterMode === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Tumu ({opportunities.length})
          </button>
          <button
            onClick={() => setFilterMode("high_score")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterMode === "high_score"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Yuksek Uyum (%70+)
          </button>
          <button
            onClick={() => setFilterMode("city")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterMode === "city"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Ayni Sehir
          </button>
          <button
            onClick={() => setFilterMode("catalog")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterMode === "catalog"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Katalogda Var
          </button>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Secilen filtreye uygun aktif firsat bulunamadi.
          </p>
          <p className="text-xs mt-1">
            Katalogunuza yeni urunler ekleyerek ve teslimat bolgelerinizi genisleterek daha fazla firsat yakalayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredOpportunities.map((item) => (
            <div
              key={item.requestId}
              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all bg-slate-50/50 dark:bg-slate-850/40 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Score & Category Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.matchScore >= 80
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                          : item.matchScore >= 60
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                      }`}
                    >
                      %{item.matchScore} Uyum
                    </div>
                  </div>
                </div>

                {/* Title & Product */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.productName}
                  </p>
                </div>

                {/* Signals Badges */}
                <div className="flex flex-wrap gap-1">
                  {item.matchSignals.map((signal, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {signal}
                    </span>
                  ))}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.city}</span>
                  </div>

                  {item.deliveryDays && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.deliveryDays} gun icinde</span>
                    </div>
                  )}

                  {typeof item.estimatedBudget === "number" && (
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.estimatedBudget.toLocaleString("tr-TR")} TL Butce</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                {item.matchingCatalogPrice ? (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Katalog Fiyatiniz:{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {item.matchingCatalogPrice.toLocaleString("tr-TR")} TL
                    </strong>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">Ozel Teklif Gerekli</div>
                )}

                {onOpenQuoteModal ? (
                  <button
                    onClick={() => onOpenQuoteModal(item)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <span>Teklif Ver</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    href={`/teklifim-gelsin/talepler/${item.requestId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <span>Teklif Ver</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
