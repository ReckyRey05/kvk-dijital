"use client";

import React, { useState } from "react";
import { X, Plus, Package, DollarSign, AlertCircle } from "lucide-react";
import { TEKLIFIM_CATEGORIES, TEKLIFIM_UNITS, TeklifimProduct } from "@/types/teklifimGelsin";

interface SupplierProductModalProps {
  onClose: () => void;
  onSubmit: (productData: Partial<TeklifimProduct>) => Promise<void>;
  submitting: boolean;
}

export default function SupplierProductModal({
  onClose,
  onSubmit,
  submitting,
}: SupplierProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Ambalaj & Paketleme");
  const [description, setDescription] = useState("");
  const [minOrder, setMinOrder] = useState("1 Koli");
  const [unit, setUnit] = useState<string>("Adet");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Lütfen ürün adını girin.");
      return;
    }
    setError("");

    try {
      await onSubmit({
        name: name.trim(),
        category,
        description: description.trim(),
        minOrder: minOrder.trim() || "1 Koli",
        unit,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Ürün kaydedilemedi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans animate-fade-in-up">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Katalog Yönetimi
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Yeni Ürün / Hizmet Ekle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
              Ürün Adı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: 8 oz Çift Duvarlı Sıcak İçecek Bardağı"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
              >
                {TEKLIFIM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Birim
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
              >
                {TEKLIFIM_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Min. Sipariş Şartı
              </label>
              <input
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="Örn: 1.000 Adet"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Tahmini Birim Fiyat (Opsiyonel)
              </label>
              <input
                type="number"
                step="0.01"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="Örn: 24.50"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
              Ürün Açıklaması & Teknik Özellikler
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: %100 selüloz, PE kaplamalı, sızdırmaz taban, özel logo baskısı uygulanabilir."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ürünü Ekle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
