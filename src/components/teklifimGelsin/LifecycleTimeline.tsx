"use client";

import React from "react";
import {
  FileText,
  Clock,
  Handshake,
  Package,
  CreditCard,
  Receipt,
  Truck,
  CheckCircle2,
} from "lucide-react";

export interface LifecycleTimelineProps {
  currentStage:
    | "request"
    | "offer"
    | "agreement"
    | "order"
    | "payment"
    | "invoice"
    | "delivery"
    | "completed";
  data?: {
    requestId?: string;
    requestDate?: number;
    offerId?: string;
    offerPrice?: number;
    agreementId?: string;
    agreementNumber?: string;
    orderId?: string;
    orderNumber?: string;
    paymentId?: string;
    paymentStatus?: string;
    invoiceNumber?: string;
    deliveredAt?: number;
  };
}

export default function LifecycleTimeline({
  currentStage,
  data,
}: LifecycleTimelineProps) {
  const STAGES = [
    { key: "request", label: "Talep", icon: FileText, desc: data?.requestId ? `#${data.requestId.slice(0, 8)}` : "Olusturuldu" },
    { key: "offer", label: "Teklif", icon: Clock, desc: data?.offerPrice ? `${data.offerPrice.toLocaleString("tr-TR")} TL` : "Teklif alindi" },
    { key: "agreement", label: "Anlasma", icon: Handshake, desc: data?.agreementNumber || "Sartlar onaylandi" },
    { key: "order", label: "Siparis", icon: Package, desc: data?.orderNumber || "Siparis acildi" },
    { key: "payment", label: "Odeme", icon: CreditCard, desc: data?.paymentStatus === "completed" ? "Odendi" : "Bekliyor" },
    { key: "invoice", label: "Fatura", icon: Receipt, desc: data?.invoiceNumber || "E-Fatura" },
    { key: "delivery", label: "Teslimat", icon: Truck, desc: data?.deliveredAt ? "Teslim edildi" : "Kargo / Sevkiyat" },
  ];

  const stageKeys = STAGES.map((s) => s.key);
  const currentIndex = stageKeys.indexOf(currentStage === "completed" ? "delivery" : currentStage);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Satin Alma Yasam Dongusu
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Talepten teslimata uctan uca kurumsal takip
        </p>
      </div>

      {/* HORIZONTAL TIMELINE */}
      <div className="relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex || currentStage === "completed";
            const isCurrent = idx === currentIndex && currentStage !== "completed";
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center text-center space-y-1.5"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100 dark:ring-emerald-950/60"
                      : isCurrent
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-600 ring-4 ring-emerald-500/10 animate-pulse"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {stage.label}
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
