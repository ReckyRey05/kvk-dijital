"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { TeklifimRequest, TeklifimApprovalRecord } from "@/types/teklifimGelsin";

interface ApprovalActionModalProps {
  request: TeklifimRequest;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApprovalActionModal({
  request,
  isOpen,
  onClose,
  onSuccess,
}: ApprovalActionModalProps) {
  const [action, setAction] = useState<"approved" | "rejected">("approved");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/teklifim-gelsin/procurement/${request.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Onay islemi basarisiz oldu.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Islem gerceklestirilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const history = request.approvalHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Satin Alma Onay Islemi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Talep inceleme ve yetkili karar adimi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* REQUEST DETAILS SUMMARY */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Talep Basligi:</span>
              <strong className="text-slate-900 dark:text-white">{request.title}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Kategori & Kalem:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {request.category} ({request.items?.length || 1} kalem)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tahmini Butce:</span>
              <strong className="text-slate-900 dark:text-white text-sm">
                {(request.estimatedBudget || 0).toLocaleString("tr-TR")} TL
              </strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Sirket Onay Esigi:</span>
              <span>{(request.approvalThreshold || 35000).toLocaleString("tr-TR")} TL</span>
            </div>
          </div>

          {/* APPROVAL HISTORY AUDIT LOG */}
          {history.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Onay Gecmisi (Degistirilemez)
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {history.map((h, i) => (
                  <div
                    key={h.id || i}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/40 text-[11px] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <strong className="text-slate-800 dark:text-slate-200">{h.actorName}</strong>
                      <span className="text-slate-400">({h.actorRole})</span>
                      <span className="text-slate-600 dark:text-slate-300">— {h.note}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION SELECTOR */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Karar
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction("approved")}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  action === "approved"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Onayla</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("rejected")}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  action === "rejected"
                    ? "border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Reddet</span>
              </button>
            </div>
          </div>

          {/* NOTE INPUT */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Onay / Red Gerekcesi (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Orn: Butce sinirlari dahilinde onaylandi veya teklif revizesi istendi."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Vazgec
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-colors ${
                action === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {submitting ? "Isleniyor..." : action === "approved" ? "Onayi Tamamla" : "Talebi Reddet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
