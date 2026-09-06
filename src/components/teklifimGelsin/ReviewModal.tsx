"use client";

import React, { useState } from "react";
import { X, Star, CheckCircle2, AlertCircle, Send } from "lucide-react";

interface ReviewModalProps {
  requestId: string;
  requestTitle: string;
  supplierName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  requestId,
  requestTitle,
  supplierName,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Lütfen kısa bir değerlendirme açıklaması yazın.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const { auth } = await import("@/lib/firebase/auth");
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Lütfen giriş yapın.");

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
          rating,
          comment: comment.trim(),
          isAnonymous,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Değerlendirme kaydedilemedi.");
      }

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans animate-fade-in-up">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              İşlem Değerlendirmesi
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate max-w-sm">
              {supplierName ? `${supplierName} Firmasını Değerlendir` : "Tedarikçiyi Değerlendir"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Değerlendirmeniz Kaydedildi
            </h4>
            <p className="text-xs text-slate-500">
              Geri bildiriminiz diğer işletmelerin doğru tedarikçi seçmesine yardımcı olacaktır.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">İlgili Talep</span>
              <strong className="text-xs font-bold text-slate-900 dark:text-white">
                {requestTitle}
              </strong>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STAR RATING SELECTOR */}
            <div className="space-y-1.5 text-center py-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Tedarikçiye Puanınız (1–5 Yıldız)
              </label>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          active
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {rating === 5 && "Mükemmel Tedarik Deneyimi"}
                {rating === 4 && "Oldukça Başarılı & Güvenilir"}
                {rating === 3 && "Standart Tedarik Süreci"}
                {rating === 2 && "İyileştirilmesi Gereken Noktalar Var"}
                {rating === 1 && "Memnun Kalınmadı"}
              </span>
            </div>

            {/* COMMENT */}
            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">
                Deneyiminiz ve Değerlendirmeniz *
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ürün kalitesi, zamanında sevkiyat, iletişim hızı ve ambalaj durumu hakkında bilgi verin..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 resize-none font-medium text-xs"
              />
            </div>

            {/* ANONYMOUS TOGGLE */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-0 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Firma adımı gizle (Değerlendirmede “Doğrulanmış İşletme” olarak görün)
              </span>
            </label>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? (
                  "Kaydediliyor..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Değerlendirmeyi Gönder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
