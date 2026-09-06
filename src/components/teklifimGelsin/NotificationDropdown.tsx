"use client";

import React from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, X } from "lucide-react";
import { TeklifimNotification } from "@/types/teklifimGelsin";

interface NotificationDropdownProps {
  notifications: TeklifimNotification[];
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  onMarkRead,
  onClose,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Bildirimler
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              {unreadCount} yeni
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Henüz yeni bir bildiriminiz yok.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 transition-colors ${
                notif.isRead
                  ? "bg-transparent opacity-75"
                  : "bg-emerald-50/40 dark:bg-emerald-950/20"
              } hover:bg-slate-50 dark:hover:bg-slate-800/40`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {new Date(notif.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/40">
                <Link
                  href={notif.link}
                  onClick={() => {
                    onMarkRead(notif.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>Görüntüle</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                {!notif.isRead && (
                  <button
                    onClick={() => onMarkRead(notif.id)}
                    className="text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Okundu</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
