"use client";

import React, { useState } from "react";
import { TeklifimOrder } from "@/types/teklifimGelsin";
import { X, ShieldCheck, AlertCircle, FileCheck, Check } from "lucide-react";

interface DeliveryProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: TeklifimOrder;
  onSuccess: (updatedOrder: TeklifimOrder) => void;
}

export default function DeliveryProofModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: DeliveryProofModalProps) {
  const [receivedBy, setReceivedBy] = useState<string>("");
  const [proofNote, setProofNote] = useState<string>("");
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedBy.trim()) {
      setErrorMsg("Lütfen teslim alan yetkili adını giriniz.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/teklifim-gelsin/orders/${order.id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receivedBy: receivedBy.trim(),
          proofNote: proofNote.trim() || undefined,
          proofPhotoUrl: proofPhotoUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Teslimat kaydı oluşturulamadı.");
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
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Teslim Alma & Kanıt Kaydı
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
            Teslim aldığınızı onayladığınızda sipariş <strong>&ldquo;Teslim Edildi&rdquo;</strong> durumuna geçecektir.
            Lütfen gelen koli/ürünlerin sağlamlığını, adetlerini ve içeriğini kontrol ettiğinizden emin olunuz.
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Teslim Alan Yetkili Adı Soyadı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz (Depo Sorumlusu)"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Teslimat Kontrol Notu (Opsiyonel)
            </label>
            <textarea
              rows={3}
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="Örn: 20 koli eksiksiz teslim alındı, koliler hasarsız."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Teslim Tutanağı / İrsaliye Görsel Linki (Opsiyonel)
            </label>
            <input
              type="url"
              value={proofPhotoUrl}
              onChange={(e) => setProofPhotoUrl(e.target.value)}
              placeholder="https://... (veya teslim tutanağı belge linki)"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? "Kaydediliyor..." : "Teslim Aldım ve Onayla"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
