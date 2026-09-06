"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Truck,
  ShieldCheck,
  Package,
  Clock,
  Heart,
  ArrowRight,
  Send,
  CheckCircle2,
} from "lucide-react";
import { TeklifimProfile } from "@/types/teklifimGelsin";
import TrustSignals from "./TrustSignals";

interface SupplierCardProps {
  supplier: TeklifimProfile;
  isFavorited?: boolean;
  onToggleFavorite?: (supplier: TeklifimProfile) => void;
  onRequestQuote?: (supplier: TeklifimProfile) => void;
}

export default function SupplierCard({
  supplier,
  isFavorited = false,
  onToggleFavorite,
  onRequestQuote,
}: SupplierCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const isVerified = supplier.isVerified || supplier.verificationStatus === "verified";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited(!favorited);
    if (onToggleFavorite) {
      onToggleFavorite(supplier);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 font-sans group">
      {/* TOP BAR: AVATAR, NAME, VERIFIED, FAVORITE */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* INITIALS LOGO */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-800 dark:text-slate-200 font-black text-base shrink-0 shadow-inner">
              {supplier.companyName?.slice(0, 2).toUpperCase() || "TD"}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/teklifim-gelsin/suppliers/${supplier.uid}`}
                  className="font-black text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1"
                >
                  {supplier.companyName}
                </Link>
                {isVerified && (
                  <span title="Doğrulanmış Firma" className="inline-flex">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {supplier.city}
                  {supplier.district ? ` (${supplier.district})` : ""}
                </span>
                {supplier.yearFounded && (
                  <>
                    <span>•</span>
                    <span>Kuruluş {supplier.yearFounded}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* FAVORITE TOGGLE */}
          <button
            onClick={handleFavoriteClick}
            aria-label="Favoriye Ekle"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              favorited
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-200"
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        </div>

        {/* DESCRIPTION */}
        {supplier.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {supplier.description}
          </p>
        )}

        {/* CATEGORIES PILLS */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(supplier.categories || []).slice(0, 3).map((cat, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold"
            >
              {cat}
            </span>
          ))}
          {(supplier.categories || []).length > 3 && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold">
              +{(supplier.categories || []).length - 3}
            </span>
          )}
        </div>

        {/* TRUST SIGNALS */}
        <div className="pt-1">
          <TrustSignals supplier={supplier} compact={true} />
        </div>

        {/* DELIVERY REGIONS */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">
            Dağıtım: {(supplier.deliveryRegions || ["Tüm Türkiye"]).join(", ")}
          </span>
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <Link
          href={`/teklifim-gelsin/suppliers/${supplier.uid}`}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
        >
          <span>Profili Gör</span>
          <ArrowRight className="w-3 h-3" />
        </Link>

        <button
          onClick={() => onRequestQuote && onRequestQuote(supplier)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>Teklif İste</span>
        </button>
      </div>
    </div>
  );
}
