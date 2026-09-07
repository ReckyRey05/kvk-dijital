"use client";

import React from "react";
import {
  Calendar,
  Truck,
  Clock,
  Package,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { TeklifimCommercialCalendarEvent } from "@/types/teklifimGelsin";
import Link from "next/link";

interface CommercialCalendarWidgetProps {
  events: TeklifimCommercialCalendarEvent[];
}

export default function CommercialCalendarWidget({ events }: CommercialCalendarWidgetProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Ticari Satis Takvimi
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Yaklasan siparis teslimleri ve teklif son gecerlilik tarihleri.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
          {events.length} Olay
        </span>
      </div>

      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Yaklasan teslimat veya teklif bitis tarihi bulunmuyor.
          </p>
        ) : (
          events.slice(0, 6).map((ev) => {
            const eventDate = new Date(ev.date).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
            });

            const isDelivery = ev.type === "delivery_due";
            const isExpiry = ev.type === "offer_expiry";

            return (
              <div
                key={ev.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/40 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isDelivery
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {isDelivery ? <Truck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {ev.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {ev.entityNumber ? `#${ev.entityNumber}` : ""} {ev.amount ? `· ${ev.amount.toLocaleString("tr-TR")} TL` : ""}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {eventDate}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {isDelivery ? "Son Teslim" : "Gecerlilik"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
