"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface PaymentCountdownProps {
  expiresAt?: number;
  initialSeconds?: number;
  onExpire?: () => void;
}

export default function PaymentCountdown({
  expiresAt,
  initialSeconds,
  onExpire,
}: PaymentCountdownProps) {
  const [targetTimestamp] = useState<number>(() => {
    if (expiresAt) return expiresAt;
    if (initialSeconds) return Date.now() + initialSeconds * 1000;
    return Date.now() + 15 * 60 * 1000;
  });

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Ödeme Süresi Doldu</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
      <Clock className="h-3.5 w-3.5 text-amber-600" />
      <span>
        Ödeme için{" "}
        <strong className="font-mono">
          {timeLeft.hours > 0 ? `${timeLeft.hours} sa ` : ""}
          {timeLeft.minutes} dk {timeLeft.seconds} sn
        </strong>{" "}
        kaldı
      </span>
    </div>
  );
}
