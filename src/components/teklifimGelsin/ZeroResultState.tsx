"use client";

import React from "react";
import Link from "next/link";
import { SearchX, PlusCircle, ArrowRight, HelpCircle } from "lucide-react";
import { buildZeroResultPrefillParams } from "@/lib/teklifimGelsin/searchUtils";
import { TEKLIFIM_CATEGORIES } from "@/types/teklifimGelsin";

interface ZeroResultStateProps {
  query?: string;
  category?: string;
  city?: string;
  onClearFilters?: () => void;
  className?: string;
}

export default function ZeroResultState({
  query = "",
  category,
  city,
  onClearFilters,
  className = "",
}: ZeroResultStateProps) {
  const prefill = buildZeroResultPrefillParams(query, category, city);

  const requestUrl = `/teklifim-gelsin/requests/new?prompt=${encodeURIComponent(
    prefill.prompt
  )}&title=${encodeURIComponent(prefill.title)}${
    category ? `&category=${encodeURIComponent(category)}` : ""
  }${city ? `&city=${encodeURIComponent(city)}` : ""}`;

  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm font-sans space-y-6 max-w-2xl mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Bunu Bulamadık
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {query ? (
            <>
              <strong>&quot;{query}&quot;</strong> terimine uygun ürün veya tedarikçi şu anda kayıtlı değil.
            </>
          ) : (
            "Seçtiğiniz filtrelere uygun ürün veya tedarikçi bulunamadı."
          )}
        </p>
      </div>

      {/* ZERO RESULT CALL TO ACTION */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-left space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Aradığınız ürünü bulamadınız mı?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Hemen ücretsiz alım talebi oluşturun; sistemimize kayıtlı toptancılar ve üreticiler size en iyi fiyat tekliflerini göndersin.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={requestUrl}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Bu Arama İçin Talep Oluştur</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-700"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* POPULAR CATEGORIES FALLBACK */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          Popüler Kategorileri İnceleyebilirsiniz:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TEKLIFIM_CATEGORIES.slice(0, 6).map((cat) => (
            <Link
              key={cat}
              href={`/teklifim-gelsin/search?type=products&category=${encodeURIComponent(cat)}`}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
