"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  Send,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadOffers() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/teklifim-gelsin/admin/offers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setOffers(json.offers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffers();
  }, [statusFilter]);

  const filtered = offers.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.supplierName?.toLowerCase().includes(q) ||
      o.requestTitle?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send size={24} className="text-primary" />
            Verilen Teklifler Masası
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Toptancıların taleplere ilettiği fiyat teklifleri ve kabul/ret durumu.
          </p>
        </div>
        <button
          onClick={loadOffers}
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
            placeholder="Tedarikçi adı, talep, teklif no..."
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
              <option value="pending">Bekliyor</option>
              <option value="accepted">Kabul Edildi</option>
              <option value="rejected">Reddedildi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Teklif No</th>
                <th className="px-4 py-3">Tedarikçi</th>
                <th className="px-4 py-3">Talep</th>
                <th className="px-4 py-3">Teklif Tutarı</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Teklifler getiriliyor..." : "Teklif bulunamadı."}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-primary">{o.id}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {o.supplierName || "Tedarikçi"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200">{o.requestTitle || o.requestId}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">
                      {Number(o.totalPrice || o.price || 0).toLocaleString("tr-TR")} TL
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          o.status === "accepted"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : o.status === "rejected"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {o.status === "accepted"
                          ? "Kabul Edildi"
                          : o.status === "rejected"
                          ? "Reddedildi"
                          : "Değerlendirmede"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("tr-TR") : "-"}
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
