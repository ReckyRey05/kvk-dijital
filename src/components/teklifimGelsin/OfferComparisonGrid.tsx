"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Zap,
  DollarSign,
  Clock,
  Package,
  MapPin,
  ShieldCheck,
  Phone,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { TeklifimOffer } from "@/types/teklifimGelsin";

interface OfferComparisonGridProps {
  offers: TeklifimOffer[];
  selectedOfferId?: string;
  isBusinessOwner: boolean;
  onSelectOffer: (offerId: string) => Promise<void>;
  onOpenContact: (offer: TeklifimOffer) => void;
  selectingId: string | null;
}

export default function OfferComparisonGrid({
  offers,
  selectedOfferId,
  isBusinessOwner,
  onSelectOffer,
  onOpenContact,
  selectingId,
}: OfferComparisonGridProps) {
  const [filterMode, setFilterMode] = useState<"all" | "best" | "cheapest" | "fastest">("all");

  const filteredOffers = [...offers].sort((a, b) => {
    if (filterMode === "cheapest") return a.totalPrice - b.totalPrice;
    if (filterMode === "fastest") return a.deliveryDays - b.deliveryDays;
    if (filterMode === "best") {
      if (a.isBestValue && !b.isBestValue) return -1;
      if (!a.isBestValue && b.isBestValue) return 1;
    }
    // Default: selected first, then best value, then cheapest
    if (a.id === selectedOfferId) return -1;
    if (b.id === selectedOfferId) return 1;
    if (a.isBestValue) return -1;
    if (b.isBestValue) return 1;
    return a.totalPrice - b.totalPrice;
  });

  if (offers.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-center space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Henüz Teklif Gelmedi
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Talebiniz ilgili kategorideki onaylı toptancılara iletildi. Teklifler geldikçe bu ekranda anlık olarak karşılaştırabileceksiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* FILTER & SORT BAR */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Gelen Teklifler ({offers.length})
          </span>
          <span className="text-[10px] text-slate-400">• Karşılaştırma Modu</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterMode("best")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === "best"
                ? "bg-emerald-600 text-white shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            En Uygun
          </button>
          <button
            onClick={() => setFilterMode("cheapest")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === "cheapest"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            En Ucuz
          </button>
          <button
            onClick={() => setFilterMode("fastest")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === "fastest"
                ? "bg-amber-500 text-white shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            En Hızlı
          </button>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffers.map((offer) => {
          const isSelected = offer.id === selectedOfferId || offer.status === "selected";
          const isBest = Boolean(offer.isBestValue);
          const isCheapest = Boolean(offer.isCheapest);
          const isFastest = Boolean(offer.isFastest);

          return (
            <div
              key={offer.id}
              className={`relative rounded-3xl p-6 transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-2 border-emerald-600 shadow-xl ring-2 ring-emerald-600/20"
                  : isBest
                  ? "bg-white dark:bg-[#121824] border-2 border-emerald-500/80 shadow-lg"
                  : "bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md"
              }`}
            >
              {/* TOP BADGES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Seçilen Teklif</span>
                      </span>
                    )}

                    {!isSelected && isBest && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        <Award className="w-3 h-3" />
                        <span>En Uygun</span>
                      </span>
                    )}

                    {!isSelected && isCheapest && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                        <DollarSign className="w-3 h-3" />
                        <span>En Ucuz</span>
                      </span>
                    )}

                    {!isSelected && isFastest && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                        <Zap className="w-3 h-3" />
                        <span>En Hızlı</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {new Date(offer.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                {/* SUPPLIER INFO */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/teklifim-gelsin/suppliers/${offer.supplierId}`}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                    >
                      <span className="truncate">{offer.supplierName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                    </Link>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {offer.supplierCity}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Doğrulanmış Tedarikçi
                    </span>
                  </div>
                </div>

                {/* PRICE BOX */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Toplam Tutar
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {offer.totalPrice.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span>Birim Fiyat:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      {offer.unitPrice.toLocaleString("tr-TR")} ₺ / Adet
                    </strong>
                  </div>
                </div>

                {/* SPECS LIST */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Teslimat Süresi:</span>
                    </span>
                    <strong className="text-slate-900 dark:text-white">
                      {offer.deliveryDays} Gün İçinde
                    </strong>
                  </div>

                  {offer.minOrderQuantity && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>Min. Sipariş Şartı:</span>
                      </span>
                      <strong className="text-slate-900 dark:text-white">
                        {offer.minOrderQuantity}
                      </strong>
                    </div>
                  )}
                </div>

                {/* DESCRIPTION / NOTES */}
                {offer.description && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {offer.description}
                  </div>
                )}
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-4 space-y-2">
                {isBusinessOwner ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOpenContact(offer)}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>İletişim</span>
                      </button>

                      <button
                        onClick={() => onOpenContact(offer)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    {!isSelected && (
                      <button
                        onClick={() => onSelectOffer(offer.id)}
                        disabled={selectingId === offer.id}
                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {selectingId === offer.id ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>Bu Teklifi Seç ve Anlaş</span>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center text-[11px] text-slate-400 font-medium py-1">
                    Bu sizin verdiğiniz tekliftir.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
