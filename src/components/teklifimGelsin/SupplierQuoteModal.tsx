"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  DollarSign,
  Clock,
  Package,
  AlertCircle,
  Building2,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { TeklifimRequest, TeklifimOffer } from "@/types/teklifimGelsin";

interface SupplierQuoteModalProps {
  request: TeklifimRequest;
  existingOffer?: TeklifimOffer | null;
  onClose: () => void;
  onSubmit: (quoteData: {
    unitPrice: number;
    totalPrice: number;
    deliveryDays: number;
    minOrderQuantity?: string;
    description?: string;
  }) => Promise<void>;
  submitting: boolean;
}

export default function SupplierQuoteModal({
  request,
  existingOffer,
  onClose,
  onSubmit,
  submitting,
}: SupplierQuoteModalProps) {
  const [unitPrice, setUnitPrice] = useState(
    existingOffer ? String(existingOffer.unitPrice) : ""
  );
  const [totalPrice, setTotalPrice] = useState(
    existingOffer ? String(existingOffer.totalPrice) : ""
  );
  const [deliveryDays, setDeliveryDays] = useState(
    existingOffer ? String(existingOffer.deliveryDays) : "5"
  );
  const [minOrder, setMinOrder] = useState(
    existingOffer?.minOrderQuantity || ""
  );
  const [description, setDescription] = useState(
    existingOffer?.description || ""
  );
  const [error, setError] = useState("");

  // Auto compute total price when unit price changes
  const handleUnitPriceChange = (val: string) => {
    setUnitPrice(val);
    const num = parseFloat(val.replace(",", "."));
    if (!isNaN(num) && num > 0 && request.quantity) {
      setTotalPrice(String(Math.round(num * request.quantity)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const uPrice = parseFloat(unitPrice.replace(",", "."));
    const tPrice = parseFloat(totalPrice.replace(",", "."));

    if (isNaN(uPrice) || uPrice <= 0) {
      setError("Lütfen geçerli bir birim fiyat girin.");
      return;
    }

    try {
      await onSubmit({
        unitPrice: uPrice,
        totalPrice: isNaN(tPrice) || tPrice <= 0 ? uPrice * request.quantity : tPrice,
        deliveryDays: Number(deliveryDays) || 5,
        minOrderQuantity: minOrder.trim() || undefined,
        description: description.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Teklif iletilemedi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans animate-fade-in-up">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden space-y-6">
        {/* HEADER */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              {existingOffer ? "Teklifi Güncelle" : "Hemen Teklif Ver"}
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-sm">
              {request.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* REQUEST RECAP */}
        <div className="px-6 py-3 mx-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Talep Edilen:</span>
            <strong className="text-slate-900 dark:text-white text-sm">
              {request.quantity} {request.unit}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Lokasyon & Süre:</span>
            <strong className="text-slate-900 dark:text-white">
              {request.city} • Hedef {request.deliveryDays} Gün
            </strong>
          </div>
        </div>

        {error && (
          <div className="mx-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 text-xs sm:text-sm">
          {/* PRICING INPUTS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Birim Fiyat (TL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={unitPrice}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                placeholder="Örn: 32.50"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Toplam Tutar (TL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="Örn: 16250"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* DELIVERY & MIN ORDER */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Teslim Süresi (Gün) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Min. Sipariş (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="Örn: 250 Adet"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Şartlar & Tedarikçi Notu
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: Stoklarımızda hazırdır. İstanbul içine aynı gün kendi araçlarımızla teslimat yapılır."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 resize-none text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{existingOffer ? "Teklifi Güncelle" : "Teklifi İlet"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
