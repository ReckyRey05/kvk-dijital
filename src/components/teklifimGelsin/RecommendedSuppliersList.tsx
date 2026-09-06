"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { TeklifimSupplierMatch } from "@/types/teklifimGelsin";

interface RecommendedSuppliersListProps {
  requestId: string;
  requestTitle: string;
  invitedSupplierIds?: string[];
  onSupplierInvited?: (supplierId: string) => void;
}

export default function RecommendedSuppliersList({
  requestId,
  requestTitle,
  invitedSupplierIds = [],
  onSupplierInvited,
}: RecommendedSuppliersListProps) {
  const [matches, setMatches] = useState<TeklifimSupplierMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    invitedSupplierIds.forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitingAll, setInvitingAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/teklifim-gelsin/requests/${requestId}/match`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setMatches(data.matches || []);
          }
        }
      } catch (err) {
        console.error("Failed to load matching suppliers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (requestId) {
      fetchMatches();
    }

    return () => {
      isMounted = false;
    };
  }, [requestId]);

  const handleInvite = async (supplierId: string) => {
    try {
      setInvitingId(supplierId);
      const res = await fetch(`/api/teklifim-gelsin/requests/${requestId}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId }),
      });

      if (res.ok) {
        setInvitedMap((prev) => ({ ...prev, [supplierId]: true }));
        if (onSupplierInvited) {
          onSupplierInvited(supplierId);
        }
        setStatusMessage("Tedarikçiye teklif daveti başarıyla iletildi.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error("Davet gönderme hatası:", err);
    } finally {
      setInvitingId(null);
    }
  };

  const handleInviteAll = async () => {
    const uninvited = matches.filter((m) => !invitedMap[m.supplier.uid]);
    if (uninvited.length === 0) return;

    try {
      setInvitingAll(true);
      for (const match of uninvited) {
        await fetch(`/api/teklifim-gelsin/requests/${requestId}/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supplierId: match.supplier.uid }),
        });
        setInvitedMap((prev) => ({ ...prev, [match.supplier.uid]: true }));
        if (onSupplierInvited) {
          onSupplierInvited(match.supplier.uid);
        }
      }
      setStatusMessage(`${uninvited.length} tedarikçiye davet başarıyla gönderildi.`);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error("Toplu davet gönderme hatası:", err);
    } finally {
      setInvitingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Uygun toptancılar taranıyor ve eşleşme skorları hesaplanıyor...</span>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  const uninvitedCount = matches.filter((m) => !invitedMap[m.supplier.uid]).length;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white to-slate-50/70 dark:from-[#0E131F] dark:to-[#090D17] border border-emerald-500/20 dark:border-emerald-500/10 shadow-sm space-y-6 font-sans">
      {/* HEADER WITH SUMMARY AND BULK ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Akıllı Eşleşme
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Talebinize En Uygun {matches.length} Tedarikçi Tespit Edildi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kategori, şehir, teslimat bölgesi ve ürün uygunluğuna göre özel olarak sıralanmıştır.
          </p>
        </div>

        {uninvitedCount > 0 && (
          <button
            onClick={handleInviteAll}
            disabled={invitingAll}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {invitingAll ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Hepsine Teklif Daveti Gönder ({uninvitedCount})</span>
              </>
            )}
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* MATCH CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map(({ supplier, matchScore, matchReasons }) => {
          const isInvited = !!invitedMap[supplier.uid];
          const isInvitingThis = invitingId === supplier.uid;
          const isVerified = supplier.isVerified || supplier.verificationStatus === "verified";

          return (
            <div
              key={supplier.uid}
              className="p-5 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200/80 dark:border-slate-800/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
            >
              <div className="space-y-3">
                {/* TOP ROW: NAME & MATCH SCORE */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/teklifim-gelsin/suppliers/${supplier.uid}`}
                        className="font-black text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1"
                      >
                        {supplier.companyName}
                      </Link>
                      {isVerified && (
                        <span title="Doğrulanmış Tedarikçi">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{supplier.city}</span>
                      {supplier.minOrder && (
                        <>
                          <span>•</span>
                          <span>Min: {supplier.minOrder}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SCORE BADGE */}
                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                      matchScore >= 75
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                    }`}
                  >
                    %{matchScore} Uyum
                  </div>
                </div>

                {/* MATCH REASONS */}
                <div className="flex flex-wrap gap-1.5">
                  {matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/teklifim-gelsin/suppliers/${supplier.uid}`}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                >
                  <span>Profili İncele</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {isInvited ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Davet Edildi</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleInvite(supplier.uid)}
                    disabled={isInvitingThis}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isInvitingThis ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Teklif İste</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
