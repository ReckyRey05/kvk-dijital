"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  FileCheck2,
  Percent,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";
import { TeklifimSupplierKpis } from "@/types/teklifimGelsin";

interface SupplierKpiGridProps {
  kpis: TeklifimSupplierKpis;
}

export default function SupplierKpiGrid({ kpis }: SupplierKpiGridProps) {
  const isPositiveSalesChange =
    typeof kpis.salesChangePercentage === "number" && kpis.salesChangePercentage >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. This Month Sales */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Bu Ayki Satis Hacmi
          </span>
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {kpis.thisMonthSales.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {typeof kpis.salesChangePercentage === "number" ? (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  isPositiveSalesChange ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isPositiveSalesChange ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                %{Math.abs(kpis.salesChangePercentage)}
                <span className="text-slate-400 font-normal ml-1">onceki aya gore</span>
              </span>
            ) : (
              <span className="text-slate-400">Onceki ay verisi yok</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Offers & Acceptance Rate */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Teklif Kabul Orani
          </span>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {typeof kpis.acceptanceRate === "number" ? `%${kpis.acceptanceRate}` : "Yetersiz Veri"}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
            <span>
              Bu ay <strong>{kpis.thisMonthOffersCount}</strong> teklif verildi
            </span>
          </div>
        </div>
      </div>

      {/* 3. Completed Orders */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tamamlanan Siparisler
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {kpis.completedOrdersCount} Siparis
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <Package className="w-3.5 h-3.5 text-amber-500" />
            <span>
              <strong>{kpis.activeOrdersCount}</strong> aktif teslimat surecinde
            </span>
          </div>
        </div>
      </div>

      {/* 4. Average Response Time */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Ortalama Yanit Suresi
          </span>
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {typeof kpis.averageResponseMinutes === "number"
              ? `${kpis.averageResponseMinutes} dk`
              : "Yetersiz Veri"}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-violet-500" />
            <span>Talebe ilk teklif verme hizi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
