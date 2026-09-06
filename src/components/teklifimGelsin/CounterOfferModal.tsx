"use client";

import React, { useState } from "react";
import { TeklifimOffer, TeklifimRequest, TeklifimOfferVersion, TeklifimMessage } from "@/types/teklifimGelsin";
import { X, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";

interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  offer: TeklifimOffer;
  request: TeklifimRequest;
  currentUserId: string;
  onSuccess: (version: TeklifimOfferVersion, message: TeklifimMessage) => void;
}

export default function CounterOfferModal({
  isOpen,
  onClose,
  conversationId,
  offer,
  request,
  currentUserId,
  onSuccess,
}: CounterOfferModalProps) {
  const [price, setPrice] = useState<number>(offer.totalPrice);
  const [deliveryDays, setDeliveryDays] = useState<number>(offer.deliveryDays);
  const [quantity, setQuantity] = useState<number>(request.quantity || 1);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVersion = offer.version || 1;
  const isBusiness = currentUserId === request.businessId;
  const unitPrice = quantity > 0 ? Math.round((price / quantity) * 100) / 100 : 0;
  const priceDiff = price - offer.totalPrice;
  const pricePercentDiff = offer.totalPrice > 0 ? Math.round((priceDiff / offer.totalPrice) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price <= 0) {
      setErrorMsg("Geçerli bir teklif tutarı belirtiniz.");
      return;
    }
    if (deliveryDays < 1) {
      setErrorMsg("Teslimat süresi en az 1 gün olmalıdır.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/teklifim-gelsin/conversations/${conversationId}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price,
          unitPrice,
          deliveryDays,
          quantity,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Karşı teklif iletilemedi.");
      }

      onSuccess(data.version, data.message);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Pazarlık & Karşı Teklif Sun
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {isBusiness ? "Tedarikçiye yeni şartları önerin" : "Müşteriye revize teklif sunun"} (Revizyon #{currentVersion + 1} / Maks 10)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Current State */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Mevcut Teklif (Rev. #{currentVersion})
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Toplam Tutar:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {offer.totalPrice.toLocaleString("tr-TR")} TL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Birim Fiyat:</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {offer.unitPrice ? `${offer.unitPrice.toLocaleString("tr-TR")} TL` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Teslimat Süresi:</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {offer.deliveryDays} Gün
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Miktar:</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {request.quantity} {request.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Proposed State Inputs */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Önerilen Karşı Şartlar
                </span>
                {priceDiff !== 0 && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                      priceDiff < 0
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400"
                    }`}
                  >
                    {priceDiff > 0 ? `+${priceDiff.toLocaleString("tr-TR")} TL (%${pricePercentDiff})` : `${priceDiff.toLocaleString("tr-TR")} TL (%${pricePercentDiff})`}
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Yeni Toplam Tutar (TL)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Teslimat (Gün)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={deliveryDays || ""}
                      onChange={(e) => setDeliveryDays(Number(e.target.value))}
                      required
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Birim Fiyat
                    </label>
                    <div className="mt-1 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
                      ~{unitPrice.toLocaleString("tr-TR")} TL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Pazarlık Gerekçesi / Not (İsteğe Bağlı)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: 500 adet için peşin ödemede bu fiyatı rica ediyoruz..."
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              Pazarlık adımları resmi olarak kaydedilir. Karşı taraf teklifi doğrudan onaylayabilir veya yeni revizyon iletebilir.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  İletiliyor...
                </>
              ) : (
                <>
                  Karşı Teklifi Gönder
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
