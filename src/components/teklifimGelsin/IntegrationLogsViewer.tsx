"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ShieldAlert,
} from "lucide-react";

interface IntegrationLog {
  id: string;
  provider: string;
  channel: string;
  eventType: string;
  status: "success" | "failure" | "queued";
  details?: Record<string, any>;
  error?: string;
  createdAt: number;
}

export default function IntegrationLogsViewer() {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teklifim-gelsin/admin/integrations?limit=100");
      if (res.ok) {
        const d = await res.json();
        setLogs(d.logs || []);
      }
    } catch (err) {
      console.error("Fetch integration logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryWebhooks = async () => {
    setRetrying(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/teklifim-gelsin/admin/integrations", {
        method: "POST",
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setFeedback({
          type: "success",
          message: `Retry islemi tamamlandi. Islenen: ${d.result?.processedCount || 0}, Basarili: ${d.result?.succeededCount || 0}, Basarisiz: ${d.result?.failedCount || 0}`,
        });
        fetchLogs();
      } else {
        setFeedback({ type: "error", message: d.error || "Retry islemi basarisiz." });
      }
    } catch {
      setFeedback({ type: "error", message: "Baglanti hatasi olustu." });
    } finally {
      setRetrying(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (filterChannel === "all") return true;
    return l.channel === filterChannel;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">
              <Activity className="w-3.5 h-3.5" />
              Sistem Entegrasyon & Olay Havuzu
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Entegrasyon Olay Loglari ve Webhook Kuyrugu
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              E-posta, SMS, WhatsApp, Push ve Webhook olaylarinin anlik islem durumlarini ve hata kayitlarini izleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRetryWebhooks}
              disabled={retrying}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Yeniden Denneniyor..." : "Bekleyen Webhook'lari Yeniden Dene"}
            </button>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="underline font-semibold text-xs">
              Kapat
            </button>
          </div>
        )}

        {/* Channel Filter */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Kanal Filtresi:</span>
          {["all", "webhook", "email", "sms", "whatsapp", "push", "invoice"].map(ch => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition uppercase ${
                filterChannel === ch
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {ch === "all" ? "Tumu" : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Goruntulenecek entegrasyon log kaydi bulunamadi.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Durum</th>
                  <th className="py-2.5 px-3">Kanal</th>
                  <th className="py-2.5 px-3">Saglayici (Provider)</th>
                  <th className="py-2.5 px-3">Olay Turu</th>
                  <th className="py-2.5 px-3">Detay / Payload</th>
                  <th className="py-2.5 px-3 text-right">Zaman Damgasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      {log.status === "success" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Basarili
                        </span>
                      )}
                      {log.status === "failure" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" />
                          Basarisiz
                        </span>
                      )}
                      {log.status === "queued" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Kuyrukta
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold uppercase">{log.channel}</td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {log.provider}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      {log.eventType}
                    </td>
                    <td className="py-3 px-3">
                      {log.error ? (
                        <span className="text-red-500 font-mono text-[11px]">{log.error}</span>
                      ) : (
                        <pre className="text-[10px] font-mono text-slate-500 max-w-xs truncate">
                          {JSON.stringify(log.details || {})}
                        </pre>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {new Date(log.createdAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
