"use client";

import React, { useState } from "react";
import { TeklifimOrder, TeklifimOrderDispute } from "@/types/teklifimGelsin";
import { X, AlertTriangle, ShieldAlert, Check } from "lucide-react";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: TeklifimOrder;
  onSuccess: (updatedOrder: TeklifimOrder) => void;
}

const DISPUTE_REASONS: { value: TeklifimOrderDispute["reason"]; label: string }[] = [
  { value: "missing_items", label: "Eksik Ürün / Adet Uyuşmazlığı" },
  { value: "damaged_items", label: "Hasarlı / Kusurlu Ürün" },
  { value: "wrong_items", label: "Sözleşmeden Farklı / Yanlış Ürün" },
  { value: "delivery_delay", label: "Aşırı Teslimat Gecikmesi" },
  { value: "not_delivered", label: "Ürün Hiç Teslim Edilmedi" },
  { value: "price_discrepancy", label: "Fiyat / Fatura Tutarı Uyuşmazlığı" },
  { value: "other", label: "Diğer Ticari Anlaşmazlık" },
];

export default function DisputeModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: DisputeModalProps) {
  const [reason, setReason] = useState<TeklifimOrderDispute["reason"]>("missing_items");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 15) {
      setErrorMsg("Lütfen anlaşmazlık konusunu en az 15 karakterle detaylıca açıklayınız.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/teklifim-gelsin/orders/${order.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Anlaşmazlık kaydı oluşturulamadı.");
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
            <div className="rounded-xl bg-rose-100 p-2 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Anlaşmazlık / İtiraz Bildir
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
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl bg-amber-50 p-3.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
            Anlaşmazlık bildirildiğinde sipariş dondurulacak ve durum <strong>&ldquo;disputed&rdquo;</strong> olarak güncellenecektir. Konu KvK Dijital yönetim paneline ve karşı tarafa anında iletilecektir.
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              İtiraz / Anlaşmazlık Nedeni <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as TeklifimOrderDispute["reason"])}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Detaylı Açıklama <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Karşılaştığınız uyuşmazlığı, eksik veya hasarlı ürün detaylarını ve beklentinizi açıklayınız..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            />
            <span className="text-[11px] text-zinc-400">En az 15 karakter giriniz.</span>
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
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 disabled:opacity-50"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{loading ? "Bildiriliyor..." : "Anlaşmazlığı Kaydet ve Bildir"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
