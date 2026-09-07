"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  Scale,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Resolution modal
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [outcome, setOutcome] = useState<string>("buyer_favor");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadDisputes() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/teklifim-gelsin/admin/disputes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setDisputes(json.disputes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  function openResolveModal(disp: any) {
    setSelectedDispute(disp);
    setOutcome("buyer_favor");
    setRefundAmount(0);
    setNotes("");
    setModalOpen(true);
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDispute || !notes.trim()) return;
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch(`/api/teklifim-gelsin/admin/disputes/${selectedDispute.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          outcome,
          notes: notes.trim(),
          refundAmount: Number(refundAmount) || 0,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        loadDisputes();
      } else {
        const err = await res.json();
        alert(err.error || "Uyuşmazlık çözülemedi.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Scale size={24} className="text-amber-400" />
            Uyuşmazlık & Tahkim Masası
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Alıcı işletmeler ve toptancılar arasındaki teslimat, kalite ve ödeme ihtilaflarını sonuçlandırın.
          </p>
        </div>
        <button
          onClick={loadDisputes}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
        <Filter size={14} className="text-slate-500" />
        <span className="text-xs text-slate-400">Durum Filtresi:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">Tümü</option>
          <option value="open">Açık</option>
          <option value="investigating">İnceleniyor</option>
          <option value="resolved">Sonuçlandırıldı</option>
          <option value="rejected">Reddedildi</option>
        </select>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Uyuşmazlık & Sipariş</th>
                <th className="px-4 py-3">Taraflar</th>
                <th className="px-4 py-3">Gerekçe</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Karar</th>
                <th className="px-4 py-3 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {disputes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Uyuşmazlıklar getiriliyor..." : "Aktif uyuşmazlık kaydı bulunamadı."}
                  </td>
                </tr>
              ) : (
                disputes.map((d) => {
                  const isResolved = d.status === "resolved";
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-amber-400 font-semibold">{d.id}</div>
                        <div className="text-[11px] text-slate-400">
                          Sipariş: {d.orderNumber || d.orderId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{d.businessName || "Alıcı"}</div>
                        <div className="text-[11px] text-slate-400">
                          &rarr; {d.supplierName || "Tedarikçi"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{d.reason}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{d.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            isResolved
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {isResolved ? "Çözüldü" : "Açık / İnceleniyor"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.resolution ? (
                          <div>
                            <div className="font-semibold text-emerald-400 text-[11px]">
                              {d.resolution.outcome}
                            </div>
                            {d.resolution.refundAmount > 0 && (
                              <div className="text-[10px] text-slate-400">
                                İade: {d.resolution.refundAmount} TL
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Henüz karar verilmedi</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isResolved && (
                          <button
                            onClick={() => openResolveModal(d)}
                            className="px-3 py-1 rounded text-[11px] bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-colors font-medium"
                          >
                            Karara Bağla
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && selectedDispute && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck size={22} className="text-amber-400" />
              <div>
                <h3 className="font-semibold text-white">Uyuşmazlığı Sonuçlandır</h3>
                <p className="text-xs text-slate-400">{selectedDispute.id}</p>
              </div>
            </div>

            <form onSubmit={handleResolve} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tahkim Kararı *</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="buyer_favor">Alıcı Lehine (Tam İade)</option>
                  <option value="supplier_favor">Tedarikçi Lehine (Ödeme Serbest)</option>
                  <option value="partial_resolution">Kısmi Uzlaşma / Kısmi İade</option>
                  <option value="cancelled">İşlem İptali</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">İade Tutarı (TL)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Resmi Karar Gerekçesi & Notlar *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Taraflara ve sipariş kaydına eklenecek resmi tahkim gerekçesi..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? "Kaydediliyor..." : "Kararı Uygula"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
