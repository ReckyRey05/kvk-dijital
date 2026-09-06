"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { TeklifimReportReason } from "@/types/teklifimGelsin";

interface ReportModalProps {
  targetId: string;
  targetName: string;
  targetType: "supplier" | "business" | "request";
  onClose: () => void;
}

export default function ReportModal({
  targetId,
  targetName,
  targetType,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState<TeklifimReportReason>("fake_company");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Lütfen şikayet gerekçesini kısaca açıklayın.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const { auth } = await import("@/lib/firebase/auth");
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Şikayet bildirmek için lütfen giriş yapın.");

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetId,
          targetName,
          targetType,
          reason,
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Şikayet iletilemedi.");
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans animate-fade-in-up">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                Güvenlik & Şikayet
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate max-w-xs">
                {targetName || "Bildiride Bulun"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Şikayetiniz Yönetime İletildi
            </h4>
            <p className="text-xs text-slate-500">
              Gerekli incelemeler platform denetim ekibimiz tarafından hassasiyetle yapılacaktır.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Şikayet Nedeni *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as TeklifimReportReason)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="fake_company">Sahte veya Var Olmayan Firma</option>
                <option value="misleading_info">Yanıltıcı veya Hatalı Bilgi</option>
                <option value="spam">Spam veya İzinsiz Reklam</option>
                <option value="inappropriate">Uygunsuz veya Saldırgan Davranış</option>
                <option value="other">Diğer Sorunlar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Detaylı Açıklama *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lütfen karşılaştığınız sorunu ve şüpheli durumları detaylandırın..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 resize-none font-medium text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? (
                  "İletiliyor..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Şikayeti Bildir</span>
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
