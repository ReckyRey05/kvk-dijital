"use client";

import React from "react";
import { Plus, Trash2, Layers, DollarSign, Package } from "lucide-react";
import { TeklifimProcurementItem, TEKLIFIM_CATEGORIES } from "@/types/teklifimGelsin";

interface BulkRequestItemBuilderProps {
  items: TeklifimProcurementItem[];
  onChange: (items: TeklifimProcurementItem[]) => void;
  estimatedBudget?: number;
  onBudgetChange?: (budget: number) => void;
}

const UNITS = [
  "Adet",
  "Koli",
  "Kg",
  "Ton",
  "Litre",
  "Paket",
  "Palet",
  "Metre",
  "Kutu",
  "Cuval",
];

export default function BulkRequestItemBuilder({
  items,
  onChange,
  estimatedBudget,
  onBudgetChange,
}: BulkRequestItemBuilderProps) {
  const handleAddItem = () => {
    const newItem: TeklifimProcurementItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productName: "",
      category: "Ambalaj & Paketleme",
      quantity: 1,
      unit: "Adet",
      estimatedUnitPrice: undefined,
      notes: "",
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof TeklifimProcurementItem,
    value: any
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const totalCalculated = items.reduce(
    (sum, it) => sum + (it.estimatedUnitPrice ? it.estimatedUnitPrice * (it.quantity || 0) : 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Talep Kalemleri ({items.length} Kalem)
          </h4>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Kalem Ekle</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Kalem #{idx + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                  title="Kalemi Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Product Name */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Urun / Malzeme Adi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Orn: 8 oz Karton Bardak"
                  value={item.productName}
                  onChange={(e) => handleUpdateItem(idx, "productName", e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Category */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Kategori
                </label>
                <select
                  value={item.category}
                  onChange={(e) => handleUpdateItem(idx, "category", e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {TEKLIFIM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Miktar *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={item.quantity || ""}
                  onChange={(e) => handleUpdateItem(idx, "quantity", Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Unit */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Birim
                </label>
                <select
                  value={item.unit}
                  onChange={(e) => handleUpdateItem(idx, "unit", e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note & Estimated Unit Price */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  placeholder="Ek teknik detay / ozellik (opsiyonel)"
                  value={item.notes || ""}
                  onChange={(e) => handleUpdateItem(idx, "notes", e.target.value)}
                  className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <span className="text-[11px] text-slate-500 whitespace-nowrap">Tahmini Birim Fiyat:</span>
                <input
                  type="number"
                  placeholder="TL"
                  value={item.estimatedUnitPrice || ""}
                  onChange={(e) => handleUpdateItem(idx, "estimatedUnitPrice", Number(e.target.value) || undefined)}
                  className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ESTIMATED BUDGET & SUMMARY ROW */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Tahmini Toplam Butce (TL)
            </label>
            <span className="text-[10px] text-slate-500">
              {totalCalculated > 0 ? `Kalem hesap toplami: ${totalCalculated.toLocaleString("tr-TR")} TL` : "Butce ustu teklifler uyarilir"}
            </span>
          </div>
        </div>

        <div className="w-full sm:w-48">
          <input
            type="number"
            min={0}
            placeholder={totalCalculated > 0 ? String(totalCalculated) : "Orn: 45000"}
            value={estimatedBudget || ""}
            onChange={(e) => onBudgetChange && onBudgetChange(Number(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
          />
        </div>
      </div>
    </div>
  );
}
