"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, ShoppingBag, ShieldAlert, CheckCircle2, DollarSign, Package } from "lucide-react";
import { ItemSepetiNotification } from "@/types/marketplace";

interface NotificationDropdownProps {
  userId: string;
}

export default function ItemSepetiNotificationDropdown({ userId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<ItemSepetiNotification[]>([
    {
      id: "notif_1",
      userId,
      event: "ORDER_CREATED",
      title: "Yeni Sipariş Oluşturuldu",
      message: "SIP-2026-902144 kodlu Metin2 Yang siparişiniz alındı.",
      linkUrl: "/siparislerim",
      isRead: false,
      createdAt: Date.now() - 1000 * 60 * 15,
    },
    {
      id: "notif_2",
      userId,
      event: "PAYMENT_SUCCESS",
      title: "Havuz Ödemesi Tamamlandı",
      message: "Ödemeniz Escrow havuzunda güvence altına alındı.",
      linkUrl: "/siparislerim",
      isRead: false,
      createdAt: Date.now() - 1000 * 60 * 45,
    },
    {
      id: "notif_3",
      userId,
      event: "LISTING_APPROVED",
      title: "İlanınız Onaylandı",
      message: "AK-47 Asiimov ilanınız yönetici tarafından onaylandı ve yayına girdi.",
      linkUrl: "/ilanlarim",
      isRead: true,
      createdAt: Date.now() - 1000 * 3600 * 3,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Bildirimler"
        className="relative p-2 rounded-[8px] border transition-colors cursor-pointer border-[#DCDDE1] dark:border-[#282C3A] bg-white dark:bg-[#161921] text-[#626772] dark:text-[#9498A6] hover:text-[#17191F] dark:hover:text-[#EDEEF2]"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white bg-red-500 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#161921] border border-[#DCDDE1] dark:border-[#282C3A] shadow-xl z-50 overflow-hidden">
          <div className="p-3.5 border-b border-[#DCDDE1] dark:border-[#282C3A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Bildirimler</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                  {unreadCount} yeni
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Tümünü okundu say</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#DCDDE1]/50 dark:divide-[#282C3A]/50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#9498A6]">Henüz bildiriminiz yok.</div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.linkUrl}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                  className={`block p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                    !notif.isRead ? "bg-amber-500/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {notif.event.includes("ORDER") && <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />}
                      {notif.event.includes("PAYMENT") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      {notif.event.includes("DISPUTE") && <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
                      {notif.event.includes("LISTING") && <Package className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold truncate ${
                            !notif.isRead
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#9498A6] mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
