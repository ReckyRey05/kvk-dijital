"use client";

import React, { useState } from "react";
import { TeklifimOrder, TeklifimOrderCancellation } from "@/types/teklifimGelsin";
import { X, XCircle, AlertCircle } from "lucide-react";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: TeklifimOrder;
  onSuccess: (updatedOrder: TeklifimOrder) => void;
}

const CANCEL_REASONS: { value: TeklifimOrderCancellation["reason"]; label: string }[] = [
  { value: "customer_request", label: "Müşteri / Alıcı İşletme Talebi" },
  { value: "out_of_stock", label: "Stok Yetersizliği / Tedarik İmkansızlığı" },
  { value: "delivery_problem", label: "Lojistik / Teslimat Engeli" },
  { value: "mutual_agreement", label: "Karşılıklı Fesih / Anlaşma" },
  { value: "other", label: "Diğer İptal Gerekçesi" },
];

export default function CancelOrderModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState<TeklifimOrderCancellation["reason"]>("customer_request");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/teklifim-gelsin/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sipariş iptal edilemedi.");
      }

      onSuccess(data.order);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Siparişi İptal Et
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sipariş No: {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
            Dikkat: İptal edilen siparişler geri alınamaz. Sipariş doğrudan iptal statüsüne geçecek ve her iki tarafa da bildirim gönderilecektir.
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              İptal Gerekçesi <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as TeklifimOrderCancellation["reason"])}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              İptal Açıklaması / Notu (Opsiyonel)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="İptal sebebine ilişkin ek notlarınızı belirtebilirsiniz..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              <span>{loading ? "İptal Ediliyor..." : "Siparişi İptal Et"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
