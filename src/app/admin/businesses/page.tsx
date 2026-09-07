"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  Building2,
  Search,
  RefreshCw,
  Ban,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadBusinesses() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/businesses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setBusinesses(json.businesses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBusinesses();
  }, []);

  const filtered = businesses.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.companyName?.toLowerCase().includes(q) ||
      b.contactName?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 size={24} className="text-primary" />
            İşletme (Alıcı) Masası
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Platformda alım yapan kafe, restoran, otel ve market işletmelerinin yönetimi.
          </p>
        </div>
        <button
          onClick={loadBusinesses}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 max-w-md bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İşletme adı, yetkili, şehir veya e-posta ara..."
            className="bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none flex-1"
          />
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">İşletme Adı</th>
                <th className="px-4 py-3">Yetkili & İletişim</th>
                <th className="px-4 py-3">Konum</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Kayıt Tarihi</th>
                <th className="px-4 py-3 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "İşletmeler getiriliyor..." : "İşletme kaydı bulunamadı."}
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.uid} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{b.companyName || "İsimsiz İşletme"}</div>
                      <div className="text-[11px] text-slate-400">{b.category || "Horeca"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200">{b.contactName || "-"}</div>
                      <div className="text-[11px] text-slate-400">{b.email}</div>
                      <div className="text-[10px] text-slate-500">{b.phone || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{b.city || "-"}</div>
                      <div className="text-[11px] text-slate-400">{b.district || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      {b.status === "suspended" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-500/10 text-red-400 border border-red-500/20">
                          <Ban size={12} />
                          Askıda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} />
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("tr-TR") : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users?search=${encodeURIComponent(b.email)}`}
                        className="px-2.5 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        Yönet
                      </Link>
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
