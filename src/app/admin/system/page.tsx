"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  Activity,
  Server,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export default function AdminSystemPage() {
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadHealth() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/system", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setHealth(json.health);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity size={24} className="text-emerald-400" />
            Sistem Durumu & Servis Sağlığı
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Veritabanı erişim gecikmesi, webhook sıraları ve altyapı bileşenlerinin canlı izlemesi.
          </p>
        </div>
        <button
          onClick={loadHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Tanılama Yenile
        </button>
      </div>

      {/* Global Status Banner */}
      <div
        className={`p-6 rounded-2xl border flex items-center justify-between shadow-xl ${
          health?.status === "healthy"
            ? "bg-emerald-950/20 border-emerald-800/50"
            : "bg-amber-950/20 border-amber-800/50"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${
              health?.status === "healthy"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-amber-500/10 text-amber-400"
            }`}
          >
            {health?.status === "healthy" ? (
              <CheckCircle2 size={32} />
            ) : (
              <AlertTriangle size={32} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {health?.status === "healthy"
                ? "Tüm Sistemler Normal Çalışıyor"
                : "Bazı Servislerde Uyarı Mevcut"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ortam: <span className="font-mono text-slate-300">{health?.environment || "production"}</span> • Sürüm:{" "}
              <span className="font-mono text-slate-300">v{health?.version || "12.0.0"}</span>
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-slate-500">Son Kontrol</div>
          <div className="text-xs text-slate-300 font-mono mt-0.5">
            {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString("tr-TR") : "-"}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(health?.services || []).map((srv: any, i: number) => {
          const isHealthy = srv.status === "healthy";
          return (
            <div
              key={i}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-md flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="font-semibold text-white text-sm">{srv.name}</div>
                {srv.latencyMs !== undefined && (
                  <div className="text-xs text-slate-400">
                    Gecikme Süresi: <span className="font-mono text-slate-200">{srv.latencyMs} ms</span>
                  </div>
                )}
                {srv.recentFailures !== undefined && (
                  <div className="text-xs text-slate-400">
                    Son 24 Saat Hatalı İstek:{" "}
                    <span className="font-mono text-slate-200">{srv.recentFailures}</span>
                  </div>
                )}
                {srv.mode && (
                  <div className="text-xs text-slate-400">
                    Çalışma Modu: <span className="font-mono text-slate-200">{srv.mode}</span>
                  </div>
                )}
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                  isHealthy
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isHealthy ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                {isHealthy ? "Aktif" : "Uyarı"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
