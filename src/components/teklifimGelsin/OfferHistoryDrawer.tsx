"use client";

import React, { useEffect, useState } from "react";
import { TeklifimOfferVersion } from "@/types/teklifimGelsin";
import { X, History, ArrowUpRight, CheckCircle2, RefreshCw } from "lucide-react";

interface OfferHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  offerId: string;
}

export default function OfferHistoryDrawer({
  isOpen,
  onClose,
  conversationId,
}: OfferHistoryDrawerProps) {
  const [versions, setVersions] = useState<TeklifimOfferVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/teklifim-gelsin/conversations/${conversationId}/history`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.versions) {
          setVersions(data.versions);
        } else {
          setError(data.error || "Geçmiş verileri alınamadı.");
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Bağlantı hatası.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, conversationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Teklif Revizyon Geçmişi</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pazarlık süreci ve teklif değişimleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-zinc-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Geçmiş yükleniyor...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center text-sm text-zinc-500 py-10">
              Henüz pazarlık revizyonu bulunmuyor.
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:bottom-0 before:left-3.5 before:top-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {versions.map((v, idx) => {
                const isLatest = idx === versions.length - 1;
                const dateStr = new Date(v.createdAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={v.id || idx} className="relative flex items-start gap-4">
                    {/* Dot */}
                    <div
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isLatest
                          ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {v.version}
                    </div>

                    {/* Card */}
                    <div
                      className={`flex-1 rounded-xl border p-4 ${
                        isLatest
                          ? "border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
                          : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          {dateStr}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wider ${
                            v.proposedBy === "business"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                          }`}
                        >
                          {v.proposedBy === "business" ? "İşletme Önerisi" : "Tedarikçi Teklifi"}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {v.totalPrice.toLocaleString("tr-TR")} TL
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {v.deliveryDays} Gün Teslimat
                        </div>
                      </div>

                      {v.unitPrice && (
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          Birim: ~{v.unitPrice.toLocaleString("tr-TR")} TL / {v.quantity} Adet
                        </div>
                      )}

                      {v.description && (
                        <div className="mt-2.5 rounded-lg border border-zinc-200/80 bg-white/70 p-2 text-xs italic text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-300">
                          "{v.description}"
                        </div>
                      )}

                      {isLatest && (
                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Güncel Aktif Revizyon</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-zinc-300 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
