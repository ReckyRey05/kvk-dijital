"use client";

import React from "react";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  ArrowRight,
} from "lucide-react";
import { TeklifimBulkOfferComparison, TeklifimOffer } from "@/types/teklifimGelsin";

interface BulkOfferComparisonTableProps {
  comparisons: TeklifimBulkOfferComparison[];
  onSelectOffer: (offerId: string) => void;
  selectedOfferId?: string;
  isApprovalRequired?: boolean;
}

export default function BulkOfferComparisonTable({
  comparisons,
  onSelectOffer,
  selectedOfferId,
  isApprovalRequired,
}: BulkOfferComparisonTableProps) {
  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Henuz Teklif Gelmedi
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tedarikcilerden gelen teklifler burada urun kapsami, teslim suresi ve butce uyumu bazinda karsilastirilacaktir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Gelen Teklifler ({comparisons.length} Tedarikci)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fiyat, urun kapsami, teslim suresi ve guven sinyalleri karsilastirmasi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparisons.map((comp) => {
          const isSelected = selectedOfferId === comp.offerId;
          const fullCoverage = comp.coveredItemsCount >= comp.totalItemsCount;

          return (
            <div
              key={comp.offerId}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/30"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <div>
                {/* SUPPLIER HEADER & BADGES */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {comp.supplierName}
                      </h4>
                      {comp.supplierVerified && (
                        <span title="Dogrulanmis Tedarikci">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {comp.supplierCity}
                    </span>
                  </div>

                  {/* PREVIOUS SUPPLIER BADGE */}
                  {comp.isPreviousSupplier && (
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                      <RotateCcw className="w-3 h-3" />
                      Calistigin Tedarikci
                    </span>
                  )}
                </div>

                {/* TOTAL PRICE */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Toplam Teklif Tutari
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {comp.totalPrice.toLocaleString("tr-TR")} {comp.currency}
                  </div>

                  {/* BUDGET WARNING */}
                  {comp.exceedsBudget && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        Bu teklif belirlenen butcenin <strong>{comp.budgetDelta.toLocaleString("tr-TR")} TL</strong> uzerinde.
                      </span>
                    </div>
                  )}
                </div>

                {/* COMPARISON METRICS LIST */}
                <div className="space-y-2 text-xs">
                  {/* Coverage */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">Urun Kapsami:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      {fullCoverage ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tum Kalemler ({comp.coveredItemsCount}/{comp.totalItemsCount})</span>
                        </>
                      ) : (
                        <span className="text-amber-600 font-bold">
                          {comp.coveredItemsCount}/{comp.totalItemsCount} Kalem
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Missing items warning if any */}
                  {comp.missingItems && comp.missingItems.length > 0 && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400">
                      Eksik kalemler: {comp.missingItems.join(", ")}
                    </div>
                  )}

                  {/* Delivery Days */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">Teslim Suresi:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{comp.deliveryDays} Is Gunu</span>
                    </span>
                  </div>

                  {/* Min Order */}
                  {comp.minOrderQuantity && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Min. Siparis:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {comp.minOrderQuantity}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-5 pt-3">
                <button
                  type="button"
                  onClick={() => onSelectOffer(comp.offerId)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                  }`}
                >
                  <span>
                    {isSelected
                      ? "Secildi"
                      : isApprovalRequired
                      ? "Sec & Onaya Gonder"
                      : "Bu Teklifi Sec"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
