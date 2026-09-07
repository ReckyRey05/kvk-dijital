"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Star,
  Package,
  Calendar,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { TeklifimSupplierCustomer } from "@/types/teklifimGelsin";
import Link from "next/link";

interface SupplierCustomerCardProps {
  customer: TeklifimSupplierCustomer;
  onToggleFavorite?: (customerId: string) => Promise<boolean>;
  onReorderClick?: (customer: TeklifimSupplierCustomer) => void;
}

export default function SupplierCustomerCard({
  customer,
  onToggleFavorite,
  onReorderClick,
}: SupplierCustomerCardProps) {
  const [isFavorite, setIsFavorite] = useState(customer.isFavorite || false);
  const [isToggling, setIsToggling] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite || isToggling) return;

    setIsToggling(true);
    try {
      const nextState = await onToggleFavorite(customer.businessId);
      setIsFavorite(nextState);
    } catch (err) {
      console.error("Favorite toggle error:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const getSegmentBadge = () => {
    switch (customer.segment) {
      case "regular":
        return {
          label: "Duzenli Musteri",
          className:
            "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        };
      case "active":
        return {
          label: "Aktif Musteri",
          className:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "new":
        return {
          label: "Yeni Musteri",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
      case "dormant":
        return {
          label: "Uzun Suredir Alim Yapmiyor",
          className:
            "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
    }
  };

  const badge = getSegmentBadge();
  const lastDateFormatted = customer.lastOrderDate
    ? new Date(customer.lastOrderDate).toLocaleDateString("tr-TR")
    : "Bilinmiyor";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header: Name, Segment, Favorite button */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {customer.businessName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {customer.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}
            >
              {badge.label}
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={handleFavoriteClick}
                disabled={isToggling}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isFavorite
                    ? "bg-amber-50 text-amber-500 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800"
                    : "text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={isFavorite ? "Oncelikli Musterilerden Cikar" : "Oncelikli Musteri Yap"}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-amber-400" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 dark:bg-slate-850/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block">Tamamlanan Siparis</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {customer.completedOrdersCount} Adet
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Toplam Hacim</span>
            <span className="font-bold text-teal-700 dark:text-teal-300">
              {customer.totalSalesVolume.toLocaleString("tr-TR")} TL
            </span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-200/60 dark:border-slate-750 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Son Siparis: {lastDateFormatted}
            </span>
            {customer.categories.length > 0 && (
              <span className="font-medium text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[120px]">
                {customer.categories.join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Reorder / Dormant Suggestion */}
        {customer.segment === "dormant" && (
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 rounded-xl p-2.5 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Musteri 60 gundur siparis vermedi. Ozel indirimli bir teklif veya hatirlatma gondererek geri kazanabilirsiniz.
            </div>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
              title={customer.phone}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          {customer.email && (
            <a
              href={`mailto:${customer.email}`}
              className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
              title={customer.email}
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {onReorderClick ? (
          <button
            type="button"
            onClick={() => onReorderClick(customer)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Tekrar Teklif Ver</span>
          </button>
        ) : (
          <Link
            href={`/teklifim-gelsin/teklif-ver?buyerId=${customer.businessId}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Teklif Hazirla</span>
          </Link>
        )}
      </div>
    </div>
  );
}
