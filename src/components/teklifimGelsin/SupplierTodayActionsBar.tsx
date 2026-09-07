"use client";

import React from "react";
import {
  Sparkles,
  Clock,
  MessageSquare,
  Package,
  TrendingUp,
  Truck,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

interface SupplierTodayActionsBarProps {
  metrics: {
    newOpportunitiesCount: number;
    pendingOffersCount: number;
    negotiatingOffersCount: number;
    activeOrdersCount: number;
    thisMonthSales: number;
    todayDispatchCount: number;
  };
  onOpenBulkPriceModal?: () => void;
}

export default function SupplierTodayActionsBar({
  metrics,
  onOpenBulkPriceModal,
}: SupplierTodayActionsBarProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Metric indicators */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Bugun
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>

          {/* New Opportunities */}
          <Link
            href="#opportunities"
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold text-[11px]">
              {metrics.newOpportunitiesCount}
            </span>
            <span>yeni uygun talep</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">·</span>

          {/* Pending Offers */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <strong className="text-slate-900 dark:text-white">{metrics.pendingOffersCount}</strong>
            <span>bekleyen teklif</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>

          {/* Negotiating Offers */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <strong className="text-slate-900 dark:text-white">{metrics.negotiatingOffersCount}</strong>
            <span>pazarlikta</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>

          {/* Active Orders */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Package className="w-3.5 h-3.5 text-emerald-500" />
            <strong className="text-slate-900 dark:text-white">{metrics.activeOrdersCount}</strong>
            <span>aktif siparis</span>
          </div>

          {/* Today Dispatches */}
          {metrics.todayDispatchCount > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Truck className="w-3.5 h-3.5 text-violet-500" />
                <strong className="text-violet-700 dark:text-violet-300">{metrics.todayDispatchCount}</strong>
                <span>bugun sevkiyat</span>
              </div>
            </>
          )}

          {/* Monthly Sales */}
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
            <span>Bu Ay:</span>
            <strong className="text-teal-700 dark:text-teal-300">
              {metrics.thisMonthSales.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          {onOpenBulkPriceModal && (
            <button
              onClick={onOpenBulkPriceModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              Toplu Fiyat Guncelle
            </button>
          )}

          <Link
            href="/teklifim-gelsin/talep-havuzu"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <span>Talep Havuzu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
