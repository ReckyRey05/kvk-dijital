"use client";

import React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { TeklifimSpendSummary } from "@/types/teklifimGelsin";

interface ProcurementStatsCardProps {
  activeRequestsCount: number;
  pendingOffersCount: number;
  pendingApprovalsCount: number;
  activeOrdersCount: number;
  spendSummary?: TeklifimSpendSummary;
  todayMetrics?: {
    pendingRequests: number;
    offersReceived: number;
    pendingApprovals: number;
    activeOrders: number;
  };
  onStartProcurement?: () => void;
}

export default function ProcurementStatsCard({
  activeRequestsCount,
  pendingOffersCount,
  pendingApprovalsCount,
  activeOrdersCount,
  spendSummary,
  todayMetrics,
  onStartProcurement,
}: ProcurementStatsCardProps) {
  const thisMonthSpend = spendSummary?.thisMonthSpend || 0;
  const pctChange = spendSummary?.percentageChange;

  return (
    <div className="space-y-4">
      {/* TODAY QUICK BAR */}
      {todayMetrics && (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
              Bugun
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">{todayMetrics.pendingRequests}</strong> talep bekliyor
            </span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">{todayMetrics.offersReceived}</strong> teklif geldi
            </span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">{todayMetrics.pendingApprovals}</strong> onay bekliyor
            </span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">{todayMetrics.activeOrders}</strong> aktif siparis
            </span>
          </div>

          {onStartProcurement && (
            <button
              onClick={onStartProcurement}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              + Satin Alma Baslat
            </button>
          )}
        </div>
      )}

      {/* 5 KPI CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Card 1: Aktif Talepler */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Aktif Talepler
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeRequestsCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Fiyat teklifi toplanan
          </p>
        </div>

        {/* Card 2: Bekleyen Teklifler */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Bekleyen Teklifler
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {pendingOffersCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Inceleme bekleyen
          </p>
        </div>

        {/* Card 3: Onay Bekleyenler */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Onay Bekleyenler
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {pendingApprovalsCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Yonetici onayi gereken
          </p>
        </div>

        {/* Card 4: Aktif Siparisler */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Aktif Siparisler
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeOrdersCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Hazirlanan ve yolda
          </p>
        </div>

        {/* Card 5: Bu Ayki Alimlar */}
        <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Bu Ayki Alimlar
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {thisMonthSpend.toLocaleString("tr-TR")} TL
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {pctChange !== null && pctChange !== undefined ? (
              <span className={pctChange >= 0 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-emerald-600 dark:text-emerald-400 font-medium"}>
                {pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`} gecen aya gore
              </span>
            ) : (
              "Karsilastirma verisi yok"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
