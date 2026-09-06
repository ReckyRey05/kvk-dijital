"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  ExternalLink,
  Search,
} from "lucide-react";
import { TeklifimVerificationRequest } from "@/types/teklifimGelsin";
import { auth } from "@/lib/firebase/auth";

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<TeklifimVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Reject Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(
        `/api/teklifim-gelsin/verifications?mode=admin&status=${filterStatus}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to load verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [filterStatus]);

  const handleProcess = async (
    id: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) => {
    try {
      setProcessingId(id);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/verifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, rejectionReason }),
      });

      if (res.ok) {
        setRejectingId(null);
        setRejectReason("");
        await fetchVerifications();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "İşlem başarısız.");
      }
    } catch (err: any) {
      alert(err.message || "İşlem sırasında hata oluştu.");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.supplierName.toLowerCase().includes(q) ||
      r.legalTitle.toLowerCase().includes(q) ||
      r.taxNumber.toLowerCase().includes(q) ||
      r.supplierCity.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span>Firma Doğrulama Başvuruları</span>
          </h1>
          <p className="text-xs text-foreground/60 pt-1">
            Toptancım Cebimde pazar yeri tedarikçilerinin ticari sicil ve vergi levhası doğrulama talepleri.
          </p>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10">
          {[
            { id: "all", label: "Tümü" },
            { id: "pending", label: "Bekleyenler" },
            { id: "approved", label: "Onaylananlar" },
            { id: "rejected", label: "Reddedilenler" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Firma, unvan veya vergi no ara..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* TABLE / LIST */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-foreground/50">Başvurular taranıyor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-3">
          <Building2 className="w-8 h-8 text-foreground/40 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Başvuru Bulunamadı</h3>
          <p className="text-xs text-foreground/50 max-w-xs mx-auto">
            Bu kriterde incelenecek firma doğrulama talebi bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-foreground">
                      {item.supplierName}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-foreground/70 font-semibold">
                      {item.supplierCategory}
                    </span>
                    <span className="text-[10px] text-foreground/40">
                      {item.supplierCity}
                    </span>

                    {/* STATUS PILL */}
                    {item.status === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Onaylandı (Doğrulanmış)</span>
                      </span>
                    )}
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold">
                        <Clock className="w-3 h-3" />
                        <span>İnceleme Bekliyor</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold">
                        <XCircle className="w-3 h-3" />
                        <span>Reddedildi</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-foreground/80 space-y-0.5">
                    <div>
                      <span className="text-foreground/40">Resmi Unvan: </span>
                      <strong className="font-semibold">{item.legalTitle}</strong>
                    </div>
                    <div className="flex items-center gap-4 text-foreground/60 flex-wrap">
                      <span>Vergi No: <strong className="font-mono text-foreground">{item.taxNumber}</strong></span>
                      <span>•</span>
                      <span>Vergi Dairesi: <strong className="text-foreground">{item.taxOffice}</strong></span>
                      {item.tradeRegistryNumber && (
                        <>
                          <span>•</span>
                          <span>Ticaret Sicil No: <strong className="text-foreground">{item.tradeRegistryNumber}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleProcess(item.id, "approve")}
                        disabled={processingId === item.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Onayla</span>
                      </button>

                      <button
                        onClick={() => setRejectingId(item.id)}
                        disabled={processingId === item.id}
                        className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reddet</span>
                      </button>
                    </>
                  )}

                  {item.status === "approved" && (
                    <button
                      onClick={() => handleProcess(item.id, "reject", "Admin tarafından onay geri çekildi.")}
                      disabled={processingId === item.id}
                      className="px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Onayı Kaldır
                    </button>
                  )}

                  {item.status === "rejected" && (
                    <button
                      onClick={() => handleProcess(item.id, "approve")}
                      disabled={processingId === item.id}
                      className="px-3 py-1.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Yeniden Onayla
                    </button>
                  )}
                </div>
              </div>

              {/* DETAILS & DOCUMENTS */}
              {(item.documentUrl || item.notes || item.rejectionReason) && (
                <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {item.documentUrl && (
                    <a
                      href={item.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-accent hover:underline"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Vergi Levhası / Sicil Belgesini İncele</span>
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {item.notes && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground/70">
                      <span className="text-[10px] text-foreground/40 block font-bold">Tedarikçi Notu:</span>
                      <span>{item.notes}</span>
                    </div>
                  )}

                  {item.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 sm:col-span-2">
                      <span className="text-[10px] text-rose-400 block font-bold">Ret Gerekçesi:</span>
                      <span>{item.rejectionReason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-black text-white">Doğrulama Başvurusunu Reddet</h3>
            <p className="text-xs text-neutral-400">
              Tedarikçiye bildirilecek ret gerekçesini belirtin (Örn: Vergi levhası okunamıyor, unvan uyuşmuyor).
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ret gerekçesini yazın..."
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
              >
                Vazgeç
              </button>
              <button
                onClick={() => handleProcess(rejectingId, "reject", rejectReason)}
                disabled={processingId === rejectingId}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Reddet ve Bildir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
