"use client";

import React, { useState } from "react";
import { TeklifimOrder, TeklifimPayment } from "@/types/teklifimGelsin";
import { X, RotateCcw, AlertCircle, Check, DollarSign } from "lucide-react";
import { auth } from "@/lib/firebase/auth";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: TeklifimOrder;
  payment?: TeklifimPayment | null;
  onSuccess: () => void;
}

export default function RefundModal({
  isOpen,
  onClose,
  order,
  payment,
  onSuccess,
}: RefundModalProps) {
  const paidAmount = payment?.amount ?? Number(order.totalPrice) ?? 0;
  const alreadyRefunded = payment?.refundedAmount ?? 0;
  const maxRefundable = Math.max(0, Math.round((paidAmount - alreadyRefunded) * 100) / 100);

  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [customAmount, setCustomAmount] = useState<number>(maxRefundable);
  const [reasonCategory, setReasonCategory] = useState<string>("Müşteri ile karşılıklı anlaşma ile iptal");
  const [detailedReason, setDetailedReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetAmount = refundType === "full" ? maxRefundable : customAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payment?.id) {
      setErrorMsg("İlişkili ödeme kaydı bulunamadı.");
      return;
    }

    if (targetAmount <= 0) {
      setErrorMsg("Geçerli bir iade tutarı giriniz.");
      return;
    }

    if (targetAmount > maxRefundable) {
      setErrorMsg(`İade edilebilecek azami tutar ${maxRefundable.toLocaleString("tr-TR")} TL'dir.`);
      return;
    }

    const finalReason = detailedReason.trim()
      ? `${reasonCategory}: ${detailedReason.trim()}`
      : reasonCategory;

    setLoading(true);
    setErrorMsg(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Lütfen giriş yapınız.");

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/payments/${payment.id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: targetAmount,
          reason: finalReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İade işlemi başlatılamadı.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "İade işlemi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">İade Talebi ve İşlemi</h3>
              <p className="text-xs text-slate-400">Sipariş No: {order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Toplam Tahsil Edilen:</span>
              <span className="font-semibold text-slate-200">{paidAmount.toLocaleString("tr-TR")} TL</span>
            </div>
            {alreadyRefunded > 0 && (
              <div className="flex justify-between text-xs text-amber-400">
                <span>Daha Önce İade Edilen:</span>
                <span className="font-semibold">-{alreadyRefunded.toLocaleString("tr-TR")} TL</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-emerald-400 border-t border-slate-700/60 pt-2">
              <span>İade Edilebilir Bakiye:</span>
              <span>{maxRefundable.toLocaleString("tr-TR")} TL</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">İade Türü</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRefundType("full");
                  setCustomAmount(maxRefundable);
                }}
                className={`rounded-xl border p-3 text-sm font-medium transition-all ${
                  refundType === "full"
                    ? "border-rose-500 bg-rose-500/10 text-white"
                    : "border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800"
                }`}
              >
                Tam İade ({maxRefundable.toLocaleString("tr-TR")} TL)
              </button>
              <button
                type="button"
                onClick={() => setRefundType("partial")}
                className={`rounded-xl border p-3 text-sm font-medium transition-all ${
                  refundType === "partial"
                    ? "border-rose-500 bg-rose-500/10 text-white"
                    : "border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800"
                }`}
              >
                Kısmi İade
              </button>
            </div>
          </div>

          {refundType === "partial" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                İade Tutarı (TL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={maxRefundable}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">TL</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Azami iade edilebilecek tutar: {maxRefundable.toLocaleString("tr-TR")} TL
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              İade Gerekçesi
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
            >
              <option value="Müşteri ile karşılıklı anlaşma ile iptal">Müşteri ile karşılıklı anlaşma ile iptal</option>
              <option value="Ürün veya hizmet teslim edilmedi">Ürün veya hizmet teslim edilmedi</option>
              <option value="Hatalı veya eksik ürün teslimatı">Hatalı veya eksik ürün teslimatı</option>
              <option value="Kalite şartnamesine uygun olmama">Kalite şartnamesine uygun olmama</option>
              <option value="Fatura veya fiyat mutabakatsızlığı">Fatura veya fiyat mutabakatsızlığı</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Detaylı Açıklama (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={detailedReason}
              onChange={(e) => setDetailedReason(e.target.value)}
              placeholder="İade işlemine ilişkin detayları belirtebilirsiniz..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:border-rose-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
            İade tutarı, lisanslı ödeme kuruluşu altyapısı üzerinden alıcının ödeme yaptığı karta/hesaba geri aktarılır. Komisyon ve hakediş hesaplamaları otomatik güncellenir.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading || maxRefundable <= 0}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                "İşleniyor..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  İadeyi Tamamla ({targetAmount.toLocaleString("tr-TR")} TL)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
