"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Clock,
  User,
  CheckCircle,
  XCircle,
  FilePlus,
  Send,
  CreditCard,
  Receipt,
  UserPlus,
  Lock,
} from "lucide-react";
import { TeklifimAuditLog } from "@/types/teklifimGelsin";

interface AuditLogViewerProps {
  logs: TeklifimAuditLog[];
}

export default function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [filterAction, setFilterAction] = useState<string>("all");

  const getActionBadge = (action: string) => {
    switch (action) {
      case "request_created":
        return { label: "Talep Olusturuldu", icon: FilePlus, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" };
      case "request_submitted_approval":
        return { label: "Onaya Gonderildi", icon: Send, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" };
      case "request_approved":
        return { label: "Onaylandi", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" };
      case "request_rejected":
        return { label: "Reddedildi", icon: XCircle, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50" };
      case "order_created":
        return { label: "Siparis Olustu", icon: CheckCircle, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50" };
      case "payment_completed":
        return { label: "Odeme Yapildi", icon: CreditCard, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50" };
      case "invoice_uploaded":
        return { label: "Fatura Eklendi", icon: Receipt, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" };
      case "team_invited":
        return { label: "Ekip Daveti", icon: UserPlus, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" };
      case "policy_updated":
        return { label: "Politika Degisti", icon: Lock, color: "text-slate-600 bg-slate-100 dark:bg-slate-800" };
      default:
        return { label: action, icon: Clock, color: "text-slate-600 bg-slate-100 dark:bg-slate-800" };
    }
  };

  const filtered = filterAction === "all" ? logs : logs.filter((l) => l.action === filterAction);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Denetim Izi (Audit Trail)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Degistirilemez ve silinemez kurumsal satin alma islem gecmisi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Tum Islemler</option>
            <option value="request_created">Talepler</option>
            <option value="request_approved">Onaylar</option>
            <option value="request_rejected">Redler</option>
            <option value="team_invited">Ekip Islemleri</option>
            <option value="policy_updated">Politika Degisiklikleri</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Kayit bulunamadi.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((log) => {
            const badge = getActionBadge(log.action);
            const Icon = badge.icon;

            return (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${badge.color} mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {log.actorName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {log.actorRole}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {log.entityTitle}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {badge.label}
                      {log.metadata?.note ? ` — "${log.metadata.note}"` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 whitespace-nowrap pl-11 sm:pl-0 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(log.timestamp).toLocaleString("tr-TR")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
