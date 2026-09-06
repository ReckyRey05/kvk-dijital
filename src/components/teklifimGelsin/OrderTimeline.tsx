"use client";

import React from "react";
import { TeklifimOrder, TeklifimOrderStatus } from "@/types/teklifimGelsin";
import {
  FileCheck,
  Package,
  Clock,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface OrderTimelineProps {
  order: TeklifimOrder;
  deliveryStatusSignal?: {
    label: string;
    isDelayed: boolean;
    remainingDays?: number;
    delayDays?: number;
  };
}

const MILESTONES: { status: TeklifimOrderStatus; label: string; icon: any; description: string }[] = [
  {
    status: "preparing",
    label: "Hazırlanıyor",
    icon: Package,
    description: "Sipariş onaylandı, tedarikçi hazırlıyor",
  },
  {
    status: "ready_for_dispatch",
    label: "Sevke Hazır",
    icon: Clock,
    description: "Ürünler paketlendi, sevkiyat bekliyor",
  },
  {
    status: "shipped",
    label: "Kargoda",
    icon: Truck,
    description: "Kargoya veya araca teslim edildi",
  },
  {
    status: "delivered",
    label: "Teslim Edildi",
    icon: ShieldCheck,
    description: "İşletme ürünleri teslim aldı",
  },
  {
    status: "completed",
    label: "Tamamlandı",
    icon: CheckCircle2,
    description: "İşlem başarıyla tamamlandı",
  },
];

export default function OrderTimeline({ order, deliveryStatusSignal }: OrderTimelineProps) {
  const getStepIndex = (status: TeklifimOrderStatus): number => {
    switch (status) {
      case "preparing":
        return 0;
      case "ready_for_dispatch":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      case "completed":
        return 4;
      default:
        return -1;
    }
  };

  const currentIdx = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const isDisputed = order.status === "disputed";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header with Delivery Status Signal */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Sipariş Süreç Takibi
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tahmini Teslimat:{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {new Date(order.expectedDeliveryDate).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        </div>

        {deliveryStatusSignal && !isCancelled && !isDisputed && order.status !== "completed" && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              deliveryStatusSignal.isDelayed
                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{deliveryStatusSignal.label}</span>
          </div>
        )}

        {isCancelled && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
            <XCircle className="h-3.5 w-3.5 text-zinc-500" />
            <span>Sipariş İptal Edildi</span>
          </div>
        )}

        {isDisputed && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>İtiraz / Anlaşmazlık İnceleniyor</span>
          </div>
        )}
      </div>

      {/* Exceptional State Banners */}
      {isCancelled && (
        <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Sipariş İptal Edilmiştir
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Gerekçe: {order.cancellation?.reason || "Belirtilmedi"} - {order.cancellation?.note || "Açıklama yok"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                İptal Tarihi:{" "}
                {order.cancellation?.cancelledAt
                  ? new Date(order.cancellation.cancelledAt).toLocaleString("tr-TR")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {isDisputed && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Siparişte Anlaşmazlık Bildirildi
              </p>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-1">
                Sebep: {order.dispute?.reason || "Belirtilmedi"} - {order.dispute?.description}
              </p>
              {order.dispute?.resolutionNotes && (
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-2">
                  Çözüm Notu: {order.dispute.resolutionNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="mt-6">
        <div className="grid grid-cols-5 gap-2 relative">
          {MILESTONES.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = !isCancelled && !isDisputed && currentIdx >= idx;
            const isCurrent = !isCancelled && !isDisputed && currentIdx === idx;

            return (
              <div key={step.status} className="flex flex-col items-center text-center relative group">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all ${
                    isCurrent
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-100 dark:ring-blue-950"
                      : isCompleted
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="mt-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate w-full px-1">
                  {step.label}
                </div>
                <div className="hidden sm:block text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-[120px]">
                  {step.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Status History Drawer / Log */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            İşlem Geçmişi Kayıtları
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {order.statusHistory
              .slice()
              .reverse()
              .map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase text-[11px]">
                      {h.status}
                    </span>
                    {h.note && <span className="text-zinc-500 text-[11px]">- {h.note}</span>}
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0">
                    {new Date(h.timestamp).toLocaleString("tr-TR")}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
