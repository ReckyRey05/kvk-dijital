"use client";

import React from "react";
import {
  TrendingUp,
  Tag,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react";
import { TeklifimSpendSummary } from "@/types/teklifimGelsin";

interface SpendAnalyticsChartProps {
  analytics: TeklifimSpendSummary;
}

export default function SpendAnalyticsChart({ analytics }: SpendAnalyticsChartProps) {
  const {
    thisMonthSpend,
    prevMonthSpend,
    percentageChange,
    topCategory,
    topSupplier,
    monthlyTrends,
    totalSpendAllTime,
    totalOrdersCount,
  } = analytics;

  // Max value in monthly trends for chart scaling
  const maxTrendSpend = Math.max(
    ...monthlyTrends.map((t) => t.totalSpend),
    thisMonthSpend,
    1
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Harcama & Satin Alma Analizi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gercek siparis ve odeme hareketlerine dayali kurumsal alim ozeti
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Toplam Alim Hacmi
          </span>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {totalSpendAllTime.toLocaleString("tr-TR")} TL
          </div>
        </div>
      </div>

      {/* METRIC PILL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Bu Ay */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            Bu Ayki Harcama
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {thisMonthSpend.toLocaleString("tr-TR")} TL
          </div>
          <div className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
            {prevMonthSpend > 0 ? (
              <span>Onceki ay: {prevMonthSpend.toLocaleString("tr-TR")} TL</span>
            ) : (
              <span>Onceki ay verisi bulunmuyor</span>
            )}
          </div>
        </div>

        {/* Metric 2: Gecen Aya Gore Degisim */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Aylik Degisim
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {percentageChange !== null ? (
              <span className={percentageChange >= 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                {percentageChange >= 0 ? `+${percentageChange}%` : `${percentageChange}%`}
              </span>
            ) : (
              <span className="text-slate-400 text-sm font-normal">Yetersiz Veri</span>
            )}
          </div>
          <div className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
            {percentageChange !== null
              ? "Gecen ay ile karsilastirmali"
              : "Karsilastirma icin en az 2 ay veri gerekli"}
          </div>
        </div>

        {/* Metric 3: En Cok Harcanan Kategori */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Tag className="w-3.5 h-3.5 text-purple-500" />
            Lider Kategori
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white truncate">
            {topCategory ? topCategory.category : "-"}
          </div>
          <div className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
            {topCategory ? `${topCategory.spend.toLocaleString("tr-TR")} TL (${topCategory.orderCount} siparis)` : "Henuz veri yok"}
          </div>
        </div>

        {/* Metric 4: En Cok Calisilan Tedarikci */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Building className="w-3.5 h-3.5 text-amber-500" />
            Ana Tedarikci
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white truncate">
            {topSupplier ? topSupplier.supplierName : "-"}
          </div>
          <div className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
            {topSupplier ? `${topSupplier.spend.toLocaleString("tr-TR")} TL (${topSupplier.orderCount} siparis)` : "Henuz veri yok"}
          </div>
        </div>
      </div>

      {/* MONTHLY TREND BARS */}
      {monthlyTrends.length > 0 && (
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Aylik Harcama Trendi ({monthlyTrends.length} Donem)
          </h3>
          <div className="space-y-2.5">
            {monthlyTrends.map((trend) => {
              const barWidth = Math.max(8, Math.round((trend.totalSpend / maxTrendSpend) * 100));
              return (
                <div key={trend.monthYear} className="flex items-center gap-3 text-xs">
                  <div className="w-16 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {trend.monthYear}
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="w-28 text-right font-semibold text-slate-800 dark:text-slate-200">
                    {trend.totalSpend.toLocaleString("tr-TR")} TL
                  </div>
                  <div className="w-16 text-right text-slate-400 text-[11px]">
                    {trend.orderCount} siparis
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
