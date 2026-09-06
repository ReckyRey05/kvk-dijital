"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { TeklifimReport, TeklifimReportStatus } from "@/types/teklifimGelsin";
import { auth } from "@/lib/firebase/auth";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<TeklifimReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Update Status Modal State
  const [editingReport, setEditingReport] = useState<TeklifimReport | null>(null);
  const [statusToSet, setStatusToSet] = useState<TeklifimReportStatus>("reviewed");
  const [adminNotes, setAdminNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(
        `/api/teklifim-gelsin/reports?status=${filterStatus}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const handleUpdateStatus = async (
    id: string,
    status: TeklifimReportStatus,
    notes?: string
  ) => {
    try {
      setProcessingId(id);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes: notes }),
      });

      if (res.ok) {
        setEditingReport(null);
        setAdminNotes("");
        await fetchReports();
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

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "fake_company":
        return "Sahte veya Var Olmayan Firma";
      case "misleading_info":
        return "Yanıltıcı veya Hatalı Bilgi";
      case "spam":
        return "Spam veya Reklam";
      case "inappropriate":
        return "Uygunsuz Davranış";
      default:
        return "Diğer";
    }
  };

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.targetName && r.targetName.toLowerCase().includes(q)) ||
      r.targetId.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      getReasonLabel(r.reason).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>Pazaryeri Şikayetleri & Bildirimler</span>
          </h1>
          <p className="text-xs text-foreground/60 pt-1">
            İşletmeler ve tedarikçiler tarafından iletilen şikayet, sahte firma ve kural ihlali bildirimleri.
          </p>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 flex-wrap">
          {[
            { id: "all", label: "Tümü" },
            { id: "pending", label: "Bekleyenler" },
            { id: "reviewed", label: "İncelendi" },
            { id: "action_taken", label: "İşlem Yapıldı" },
            { id: "dismissed", label: "Reddedildi" },
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
          placeholder="Şikayet edilen firma, talep veya detay ara..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* TABLE / LIST */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-foreground/50">Şikayetler yükleniyor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-3">
          <AlertTriangle className="w-8 h-8 text-foreground/40 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Şikayet Bulunamadı</h3>
          <p className="text-xs text-foreground/50 max-w-xs mx-auto">
            Bu kriterde incelenecek şikayet veya bildirim bulunmuyor.
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                      {getReasonLabel(item.reason)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-foreground/70 font-semibold uppercase">
                      Hedef: {item.targetType}
                    </span>
                    <span className="text-[10px] text-foreground/40">
                      {new Date(item.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {/* STATUS PILL */}
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold">
                        <Clock className="w-3 h-3" />
                        <span>Bekliyor</span>
                      </span>
                    )}
                    {item.status === "reviewed" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold">
                        <UserCheck className="w-3 h-3" />
                        <span>İncelendi</span>
                      </span>
                    )}
                    {item.status === "action_taken" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>İşlem Yapıldı</span>
                      </span>
                    )}
                    {item.status === "dismissed" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/10 text-foreground/40 text-xs font-bold">
                        <XCircle className="w-3 h-3" />
                        <span>Reddedildi / Kapatıldı</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Hedef: {item.targetName || item.targetId}
                    </h3>
                    <p className="text-xs text-foreground/80 mt-1 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
                      {item.description}
                    </p>
                  </div>

                  {item.adminNotes && (
                    <div className="text-xs text-foreground/60 bg-accent/5 border border-accent/10 p-2.5 rounded-xl">
                      <span className="text-[10px] text-accent font-bold block">Yönetici Notu:</span>
                      <span>{item.adminNotes}</span>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingReport(item);
                      setStatusToSet(item.status);
                      setAdminNotes(item.adminNotes || "");
                    }}
                    className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Durum Güncelle</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-black text-white">Şikayet Durumunu Güncelle</h3>
            <p className="text-xs text-neutral-400">
              Hedef: {editingReport.targetName || editingReport.targetId}
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-300">Yeni Durum:</label>
              <select
                value={statusToSet}
                onChange={(e) => setStatusToSet(e.target.value as TeklifimReportStatus)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="pending" className="bg-neutral-900">Bekliyor</option>
                <option value="reviewed" className="bg-neutral-900">İncelendi</option>
                <option value="action_taken" className="bg-neutral-900">İşlem Yapıldı</option>
                <option value="dismissed" className="bg-neutral-900">Reddedildi / Geçersiz</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-300">Yönetici Notu (Opsiyonel):</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Alınan aksiyon veya inceleme notu..."
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
              >
                Vazgeç
              </button>
              <button
                onClick={() => handleUpdateStatus(editingReport.id, statusToSet, adminNotes)}
                disabled={processingId === editingReport.id}
                className="px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
