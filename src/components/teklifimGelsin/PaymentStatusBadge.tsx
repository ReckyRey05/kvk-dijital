"use client";

import React from "react";
import { TeklifimPaymentStatus } from "@/types/teklifimGelsin";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface PaymentStatusBadgeProps {
  status?: TeklifimPaymentStatus;
  size?: "sm" | "md";
}

export default function PaymentStatusBadge({ status = "unpaid", size = "sm" }: PaymentStatusBadgeProps) {
  const isMd = size === "md";
  const baseClasses = isMd
    ? "inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold"
    : "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold";

  switch (status) {
    case "paid":
      return (
        <span
          className={`${baseClasses} bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800`}
        >
          <ShieldCheck className={isMd ? "h-4 w-4 text-emerald-600" : "h-3.5 w-3.5 text-emerald-600"} />
          <span>Ödendi (Güvenli Hesapta)</span>
        </span>
      );

    case "pending":
    case "unpaid":
      return (
        <span
          className={`${baseClasses} bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900`}
        >
          <Clock className={isMd ? "h-4 w-4 text-amber-600" : "h-3.5 w-3.5 text-amber-600"} />
          <span>Ödeme Bekleniyor</span>
        </span>
      );

    case "processing":
      return (
        <span
          className={`${baseClasses} bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900`}
        >
          <Clock className={isMd ? "h-4 w-4 text-blue-600 animate-spin" : "h-3.5 w-3.5 text-blue-600 animate-spin"} />
          <span>İşleniyor (3DS)</span>
        </span>
      );

    case "failed":
      return (
        <span
          className={`${baseClasses} bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900`}
        >
          <AlertCircle className={isMd ? "h-4 w-4 text-rose-600" : "h-3.5 w-3.5 text-rose-600"} />
          <span>Ödeme Başarısız</span>
        </span>
      );

    case "partially_refunded":
      return (
        <span
          className={`${baseClasses} bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-900`}
        >
          <RotateCcw className={isMd ? "h-4 w-4 text-purple-600" : "h-3.5 w-3.5 text-purple-600"} />
          <span>Kısmi İade Edildi</span>
        </span>
      );

    case "refunded":
      return (
        <span
          className={`${baseClasses} bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800`}
        >
          <RotateCcw className={isMd ? "h-4 w-4 text-purple-600" : "h-3.5 w-3.5 text-purple-600"} />
          <span>Tamamen İade Edildi</span>
        </span>
      );

    case "disputed":
      return (
        <span
          className={`${baseClasses} bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800`}
        >
          <AlertTriangle className={isMd ? "h-4 w-4 text-rose-600" : "h-3.5 w-3.5 text-rose-600"} />
          <span>İtirazda / Donduruldu</span>
        </span>
      );

    case "cancelled":
      return (
        <span
          className={`${baseClasses} bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700`}
        >
          <XCircle className={isMd ? "h-4 w-4 text-zinc-500" : "h-3.5 w-3.5 text-zinc-500"} />
          <span>İptal Edildi</span>
        </span>
      );

    default:
      return null;
  }
}
