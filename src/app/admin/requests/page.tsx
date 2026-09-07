"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Tag,
} from "lucide-react";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadRequests() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/teklifim-gelsin/admin/requests?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setRequests(json.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.businessName?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText size={24} className="text-primary" />
            Toptan Alım Talepleri Masası
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            İşletmelerin açtığı toplu ürün talepleri, teklif sayıları ve durum takibi.
          </p>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full md:w-80 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Talep başlığı, işletme, kategori..."
            className="bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none flex-1"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter size={14} />
            <span>Durum:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Tümü</option>
              <option value="open">Açık (Teklif Alıyor)</option>
              <option value="closed">Kapalı / Anlaşıldı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Talep</th>
                <th className="px-4 py-3">İşletme</th>
                <th className="px-4 py-3">Kategori & Miktar</th>
                <th className="px-4 py-3">Teklif Sayısı</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Oluşturulma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Talepler getiriliyor..." : "Talep bulunamadı."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{r.title}</div>
                      <div className="text-[10px] font-mono text-slate-500">{r.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200">{r.businessName || "İşletme"}</div>
                      <div className="text-[11px] text-slate-400">{r.city || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-300">{r.category}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.quantity} {r.unit || "Adet"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary">
                        {r.offerCount || 0} teklif
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          r.status === "open" || r.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : r.status === "closed"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {r.status === "open" || r.status === "published"
                          ? "Açık"
                          : r.status === "closed"
                          ? "Kapalı"
                          : r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("tr-TR") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
