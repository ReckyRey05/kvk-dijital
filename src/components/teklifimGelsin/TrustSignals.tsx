"use client";

import React from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  Star,
  Building2,
  AlertCircle,
} from "lucide-react";
import { TeklifimProfile } from "@/types/teklifimGelsin";

interface TrustSignalsProps {
  supplier: TeklifimProfile;
  stats?: {
    completedDeals?: number;
    responseMinutes?: number | null;
    responseFormatted?: string | null;
    averageRating?: number | null;
    reviewCount?: number;
  };
  compact?: boolean;
}

export default function TrustSignals({
  supplier,
  stats,
  compact = false,
}: TrustSignalsProps) {
  const isVerified = supplier.isVerified || supplier.verificationStatus === "verified";
  const isPending = supplier.verificationStatus === "pending";

  const completedDeals = stats?.completedDeals ?? supplier.completedDeals ?? 0;
  const rating = stats?.averageRating ?? supplier.rating;
  const reviewCount = stats?.reviewCount ?? supplier.reviewCount ?? 0;
  const responseTime = stats?.responseFormatted ?? supplier.responseRate;
  const minOrder = supplier.minOrder;
  const deliveryRegions = supplier.deliveryRegions || [];

  const hasAnySignals =
    isVerified ||
    isPending ||
    completedDeals > 0 ||
    (rating && reviewCount > 0) ||
    responseTime ||
    minOrder ||
    deliveryRegions.length > 0;

  if (!hasAnySignals) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
        {isVerified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/80 dark:border-emerald-900/80 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Doğrulanmış</span>
          </span>
        )}

        {isPending && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200/80 dark:border-amber-900/80 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>İnceleniyor</span>
          </span>
        )}

        {rating && reviewCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-black text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({reviewCount})</span>
          </span>
        )}

        {completedDeals > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>{completedDeals} İşlem</span>
          </span>
        )}

        {responseTime && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{responseTime}</span>
          </span>
        )}
      </div>
    );
  }

  // Full Trust Strip
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
      {/* 1. VERIFICATION STATUS */}
      {isVerified ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold block">
              Kurumsal Durum
            </span>
            <strong className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">
              Doğrulanmış Firma
            </strong>
          </div>
        </div>
      ) : isPending ? (
        <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold block">
              Doğrulama
            </span>
            <strong className="text-xs font-bold text-amber-900 dark:text-amber-200">
              İnceleme Aşamasında
            </strong>
          </div>
        </div>
      ) : null}

      {/* 2. RATING & REVIEWS (Only if at least 1 review) */}
      {rating && reviewCount > 0 ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Müşteri Puanı
            </span>
            <strong className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {rating.toFixed(1)} / 5{" "}
              <span className="text-[11px] font-normal text-slate-400">({reviewCount} Yorum)</span>
            </strong>
          </div>
        </div>
      ) : null}

      {/* 3. COMPLETED DEALS (Only if > 0) */}
      {completedDeals > 0 ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Tamamlanan İşlem
            </span>
            <strong className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {completedDeals} Başarılı Sipariş
            </strong>
          </div>
        </div>
      ) : null}

      {/* 4. RESPONSE SPEED (Only if calculated) */}
      {responseTime ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Ortalama Yanıt
            </span>
            <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {responseTime}
            </strong>
          </div>
        </div>
      ) : null}

      {/* 5. MIN ORDER (Only if provided) */}
      {minOrder ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-slate-500" />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Min. Sipariş
            </span>
            <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
              {minOrder}
            </strong>
          </div>
        </div>
      ) : null}

      {/* 6. DELIVERY REGIONS */}
      {deliveryRegions.length > 0 ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Dağıtım Ağı
            </span>
            <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
              {deliveryRegions.slice(0, 2).join(", ")}
              {deliveryRegions.length > 2 ? ` +${deliveryRegions.length - 2}` : ""}
            </strong>
          </div>
        </div>
      ) : null}
    </div>
  );
}
