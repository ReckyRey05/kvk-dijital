"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Target,
  Layers,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { TeklifimOfferConversion } from "@/types/teklifimGelsin";

interface OfferConversionCardProps {
  conversion: TeklifimOfferConversion;
}

export default function OfferConversionCard({ conversion }: OfferConversionCardProps) {
  const [tab, setTab] = useState<"category" | "monthly">("category");

  const acceptedPct =
    typeof conversion.conversionRate === "number" ? conversion.conversionRate : 0;
  const rejectedPct =
    conversion.totalOffers > 0
      ? Math.round((conversion.rejectedOffers / conversion.totalOffers) * 1000) / 10
      : 0;
  const pendingPct =
    conversion.totalOffers > 0
      ? Math.round((conversion.pendingOffers / conversion.totalOffers) * 1000) / 10
      : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Teklif Donusum & Satis Hunisi
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verilen tekliflerin kabul edilme ve siparise donusme analitigi.
          </p>
        </div>

        {/* Average Deal Size */}
        {typeof conversion.averageDealSize === "number" && conversion.averageDealSize > 0 && (
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Ortalama Siparis</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {conversion.averageDealSize.toLocaleString("tr-TR")} TL
            </span>
          </div>
        )}
      </div>

      {/* Main Conversion Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Toplam Teklif</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
            {conversion.totalOffers}
          </span>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300">Kabul Edilen</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200 mt-1 block">
            {conversion.acceptedOffers}
          </span>
        </div>

        <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-blue-800 dark:text-blue-300">Donusum Orani</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-lg font-bold text-blue-900 dark:text-blue-200 mt-1 block">
            {typeof conversion.conversionRate === "number"
              ? `%${conversion.conversionRate}`
              : "Yetersiz Veri"}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Bekleyen / Red</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1 block">
            {conversion.pendingOffers} / {conversion.rejectedOffers}
          </span>
        </div>
      </div>

      {/* Visual Funnel Bar */}
      {conversion.totalOffers > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${acceptedPct}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Kabul Edildi: %${acceptedPct}`}
            />
            <div
              style={{ width: `${pendingPct}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Beklemede: %${pendingPct}`}
            />
            <div
              style={{ width: `${rejectedPct}%` }}
              className="bg-rose-400 h-full transition-all"
              title={`Red / Iptal: %${rejectedPct}`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Kabul (%{acceptedPct})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Beklemede (%{pendingPct})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
              Reddedilen (%{rejectedPct})
            </span>
          </div>
        </div>
      )}

      {/* Breakdown Tabs: Category vs Monthly */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Detayli Donusum Dagilimi
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setTab("category")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                tab === "category"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Kategori
            </button>
            <button
              onClick={() => setTab("monthly")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                tab === "monthly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Aylik Trend
            </button>
          </div>
        </div>

        {tab === "category" ? (
          <div className="space-y-2">
            {conversion.categoryConversions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Henuz kategori bazli teklif verisi olusmadi.
              </p>
            ) : (
              conversion.categoryConversions.slice(0, 5).map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/70 dark:bg-slate-850/40"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {cat.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400">
                      {cat.acceptedOffers}/{cat.totalOffers} Kabul
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white w-14 text-right">
                      {typeof cat.conversionRate === "number" ? `%${cat.conversionRate}` : "-"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {conversion.monthlyConversions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Henuz aylik teklif verisi olusmadi.
              </p>
            ) : (
              conversion.monthlyConversions.slice(0, 6).map((m) => (
                <div
                  key={m.month}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/70 dark:bg-slate-850/40"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {m.month}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400">
                      {m.acceptedOffers}/{m.totalOffers} Kabul
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white w-14 text-right">
                      {typeof m.conversionRate === "number" ? `%${m.conversionRate}` : "-"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
