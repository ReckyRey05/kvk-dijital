"use client";

import React, { useState } from "react";
import { TeklifimOrder } from "@/types/teklifimGelsin";
import { X, Truck, AlertCircle, Check } from "lucide-react";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: TeklifimOrder;
  onSuccess: (updatedOrder: TeklifimOrder) => void;
}

const COMMON_CARRIERS = [
  "Yurtiçi Kargo",
  "Aras Kargo",
  "MNG Kargo",
  "Sürat Kargo",
  "PTT Kargo",
  "Horoz Lojistik",
  "Ceva Lojistik",
  "Kendi Dağıtım Aracımız / Kurye",
  "Diğer Taşımacılık",
];

export default function TrackingModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: TrackingModalProps) {
  const [carrier, setCarrier] = useState<string>("Yurtiçi Kargo");
  const [customCarrier, setCustomCarrier] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [trackingUrl, setTrackingUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCarrier = carrier === "Diğer Taşımacılık" ? customCarrier.trim() : carrier;

    if (!finalCarrier) {
      setErrorMsg("Lütfen kargo/taşıyıcı firmasını belirtiniz.");
      return;
    }

    if (!trackingNumber.trim()) {
      setErrorMsg("Lütfen takip numarasını veya irsaliye numarasını giriniz.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/teklifim-gelsin/orders/${order.id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: finalCarrier,
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kargo bilgisi kaydedilemedi.");
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
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Kargo & Sevkiyat Bilgisi Gir
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
          <div className="rounded-xl bg-zinc-50 p-3.5 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
            Kargo takip bilgilerini girdiğinizde sipariş durumu otomatik olarak <strong>&ldquo;Kargoda&rdquo;</strong> statüsüne geçecek ve alıcı işletmeye canlı bildirim iletilecektir.
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Kargo Firması / Taşıyıcı <span className="text-rose-500">*</span>
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {COMMON_CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {carrier === "Diğer Taşımacılık" && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Firma / Kurye Adı <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customCarrier}
                onChange={(e) => setCustomCarrier(e.target.value)}
                placeholder="Örn: Özel Ambar Taşımacılık"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Takip No / İrsaliye No <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Örn: 123456789012 veya IRS-99882"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Kargo Takip Bağlantısı (Opsiyonel)
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://gonderitakip..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? "Kaydediliyor..." : "Kargoya Verildi Olarak Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
