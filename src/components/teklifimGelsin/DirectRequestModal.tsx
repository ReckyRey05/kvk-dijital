"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Send,
  Building2,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { TeklifimProfile, TeklifimRequest } from "@/types/teklifimGelsin";

interface DirectRequestModalProps {
  supplier: TeklifimProfile;
  openRequests: TeklifimRequest[];
  onClose: () => void;
  onSend: (requestId: string) => Promise<void>;
  sending: boolean;
}

export default function DirectRequestModal({
  supplier,
  openRequests,
  onClose,
  onSend,
  sending,
}: DirectRequestModalProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    openRequests[0]?.id || ""
  );
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) {
      setError("Lütfen bir talep seçin.");
      return;
    }
    setError("");

    try {
      await onSend(selectedRequestId);
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Davet gönderilemedi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans animate-fade-in-up">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Doğrudan Teklif İste
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate max-w-sm">
              {supplier.companyName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Talebiniz Tedarikçiye İletildi!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {supplier.companyName} yetkililerine bildirim gönderildi. Teklif geldiğinde anında haberiniz olacak.
            </p>
          </div>
        ) : openRequests.length === 0 ? (
          /* NO OPEN REQUESTS */
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Aktif Bir Talebiniz Bulunmuyor
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Bu tedarikçiden fiyat alabilmek için önce bir tedarik talebi oluşturmanız gerekmektedir.
              </p>
            </div>
            <Link
              href="/teklifim-gelsin/requests/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Talep Oluştur</span>
            </Link>
          </div>
        ) : (
          /* SELECT REQUEST FORM */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Bu tedarikçiye hangi talebinizi göndermek istiyorsunuz?
              </label>
              <p className="text-[11px] text-slate-500">
                Seçtiğiniz talebin bilgileri doğrudan tedarikçiye iletilecek ve özel teklif istenecek.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {openRequests.map((req) => {
                const isSelected = selectedRequestId === req.id;
                return (
                  <label
                    key={req.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-600 shadow-sm ring-1 ring-emerald-500/20"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="request_choice"
                      checked={isSelected}
                      onChange={() => setSelectedRequestId(req.id)}
                      className="mt-1 text-emerald-600 focus:ring-0 accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          {req.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {req.quantity} {req.unit}
                        </span>
                      </div>
                      <strong className="text-xs font-bold text-slate-900 dark:text-white block leading-snug">
                        {req.title}
                      </strong>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{req.city}</span>
                        <span>•</span>
                        <span>{req.deliveryDays} Gün İçinde</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

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
                disabled={sending}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Talebi Gönder</span>
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
