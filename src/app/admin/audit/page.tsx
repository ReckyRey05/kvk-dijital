"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Shield,
  FileCode,
} from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  async function loadLogs() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const params = new URLSearchParams();
      if (adminEmail.trim()) params.set("adminEmail", adminEmail.trim());
      if (actionFilter.trim()) params.set("action", actionFilter.trim());

      const res = await fetch(`/api/teklifim-gelsin/admin/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History size={24} className="text-primary" />
            Değiştirilemez Denetim Günlüğü (Audit Log)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Yöneticiler tarafından gerçekleştirilen tüm askıya alma, onaylama ve ayar değişikliklerinin yasal kayıtları.
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadLogs();
          }}
          className="flex items-center gap-2 w-full md:w-80 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2"
        >
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Yönetici e-posta filtrele..."
            className="bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none flex-1"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto text-xs text-slate-400">
          <Filter size={14} />
          <span>Aksiyon:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">Tüm Eylemler</option>
            <option value="user.suspend">user.suspend</option>
            <option value="user.unsuspend">user.unsuspend</option>
            <option value="product.moderate">product.moderate</option>
            <option value="dispute.resolve">dispute.resolve</option>
            <option value="category.create">category.create</option>
            <option value="category.update">category.update</option>
            <option value="feature_flag.update">feature_flag.update</option>
            <option value="platform_settings.update">platform_settings.update</option>
            <option value="announcement.create">announcement.create</option>
          </select>
          <button
            onClick={loadLogs}
            className="px-3 py-1.5 rounded bg-primary hover:bg-primary/90 text-white font-medium ml-2"
          >
            Uygula
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Tarih / Saat</th>
                <th className="px-4 py-3">Yönetici</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Eylem</th>
                <th className="px-4 py-3">Hedef</th>
                <th className="px-4 py-3">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Kayıtlar getiriliyor..." : "Denetim kaydı bulunamadı."}
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {new Date(l.timestamp).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{l.adminEmail}</div>
                      <div className="text-[10px] text-slate-500">IP: {l.ipAddress || "127.0.0.1"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-mono">
                        {l.adminRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary font-semibold">{l.action}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200 uppercase text-[10px] font-semibold tracking-wider">
                        {l.targetType}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{l.targetId}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-mono text-[11px] text-slate-400">
                      {JSON.stringify(l.details || {})}
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
