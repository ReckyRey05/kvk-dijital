"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { TeklifimProduct } from "@/types/teklifimGelsin";
import { applyBulkPriceAdjustment } from "@/lib/teklifimGelsin/supplierCenterUtils";

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: TeklifimProduct[];
  onSuccess: () => void;
  idToken?: string;
}

export default function BulkPriceUpdateModal({
  isOpen,
  onClose,
  products,
  onSuccess,
  idToken,
}: BulkPriceUpdateModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [percentage, setPercentage] = useState<number>(5);
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter products that have valid numeric prices
  const pricedProducts = useMemo(() => {
    return products.filter((p) => typeof p.price === "number" && p.price > 0);
  }, [products]);

  // Select all / none toggle
  const isAllSelected = pricedProducts.length > 0 && selectedIds.length === pricedProducts.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pricedProducts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Preview calculations
  const effectivePercentage = direction === "increase" ? percentage : -percentage;

  const previews = useMemo(() => {
    if (selectedIds.length === 0 || percentage === 0) return [];
    const targets = pricedProducts.filter((p) => selectedIds.includes(p.id));
    return applyBulkPriceAdjustment(targets, effectivePercentage, selectedIds);
  }, [pricedProducts, selectedIds, effectivePercentage]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setErrorMsg("Lutfen en az bir urun secin.");
      return;
    }
    if (percentage <= 0 || percentage > 50) {
      setErrorMsg("Fiyat degisim orani %1 ile %50 arasinda olmalidir.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const res = await fetch("/api/teklifim-gelsin/supplier-center/bulk-price", {
        method: "POST",
        headers,
        body: JSON.stringify({
          productIds: selectedIds,
          percentage: effectivePercentage,
          previewOnly: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Guncelleme basarisiz oldu.");
      }

      setSuccessMsg(data.message || "Fiyatlar basariyla guncellendi.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Islem gerceklestirilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Toplu Fiyat Guncelleme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Katalogunuzdaki secili urunlerin fiyatlarini yuzdesel olarak ayarlayin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Snapshot Integrity Notice */}
          <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Fiyat Snapshot Guvencesi</strong>
              Bu guncelleme yalnizca gelecekte verilecek teklifler ve katalog fiyatlari icin gecerlidir.
              Gecmiste olusturulan teklifler, sozlesmeler ve siparisler degisiklikten etkilenmez.
            </div>
          </div>

          {/* Percentage & Direction Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Islem Yonu
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("increase")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    direction === "increase"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Fiyat Artir (+)
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("decrease")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    direction === "decrease"
                      ? "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-700 dark:text-rose-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  Indirim Yap (-)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Degisim Orani (%) - Maksimum %50
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={percentage}
                  onChange={(e) => setPercentage(Math.min(50, Math.max(1, Number(e.target.value))))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <div className="flex gap-1">
                  {[5, 10, 15, 20].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPercentage(val)}
                      className={`px-2.5 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                        percentage === val
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      %{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Selection List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Urun Secimi ({selectedIds.length}/{pricedProducts.length} Secildi)
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {isAllSelected ? "Secimi Temizle" : "Tumunu Sec"}
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {pricedProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors ${
                      isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {p.title || p.name}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {(p.price || 0).toLocaleString("tr-TR")} TL
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Live Preview Table */}
          {previews.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Fiyat Degisim Onizlemesi ({previews.length} Urun)
              </span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 px-3">Urun</th>
                      <th className="py-2 px-3">Eski Fiyat</th>
                      <th className="py-2 px-3">Yeni Fiyat</th>
                      <th className="py-2 px-3 text-right">Fark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previews.map((adj) => {
                      const prod = pricedProducts.find((p) => p.id === adj.productId);
                      const diff = adj.newPrice - adj.oldPrice;
                      return (
                        <tr key={adj.productId} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                            {prod?.title || prod?.name || adj.productId}
                          </td>
                          <td className="py-2 px-3 text-slate-500 line-through">
                            {adj.oldPrice.toLocaleString("tr-TR")} TL
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {adj.newPrice.toLocaleString("tr-TR")} TL
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-medium ${
                              diff >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} TL
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            Vazgec
          </button>

          <button
            type="button"
            disabled={isSubmitting || selectedIds.length === 0}
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
          >
            {isSubmitting ? "Guncelleniyor..." : `Fiyatlari Guncelle (${selectedIds.length} Urun)`}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
