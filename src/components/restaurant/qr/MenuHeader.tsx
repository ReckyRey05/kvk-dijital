"use client";

import { Restaurant, Table } from "@/types/restaurant";
import { Clock, ShieldCheck, Bell, ReceiptText, Sparkles } from "lucide-react";

interface MenuHeaderProps {
  restaurant: Restaurant;
  table: Table;
  remainingMinutes: number;
  onOpenWaiterCall: () => void;
  activeOrderCount: number;
  onOpenOrderTracker?: () => void;
  lang: "TR" | "EN";
  onToggleLang: () => void;
  onOpenSplitBill?: () => void;
  onOpenFeedback?: () => void;
}

export default function MenuHeader({
  restaurant,
  table,
  remainingMinutes,
  onOpenWaiterCall,
  activeOrderCount,
  onOpenOrderTracker,
  lang,
  onToggleLang,
  onOpenSplitBill,
  onOpenFeedback,
}: MenuHeaderProps) {
  // Session progress calculation (15 min window)
  const percentLeft = Math.max(0, Math.min(100, (remainingMinutes / 15) * 100));

  return (
    <header className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 transition-all">
      {/* Top Banner & Fast Actions */}
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Table & Brand Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center font-bold text-accent text-sm shadow-inner shadow-accent/10">
            {table.tableNumber.replace("Masa", "M-")}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-white text-sm tracking-tight">{restaurant.name}</h1>
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-[11px] text-foreground/60 font-medium">
              {table.section ? `${table.section} • ` : ""}{table.tableNumber}
            </p>
          </div>
        </div>

        {/* Action Buttons: Language Switcher, Waiter Call & Active Order Tracker */}
        <div className="flex items-center gap-2">
          {/* TR / EN Language Switcher */}
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors cursor-pointer"
            title="Dili Değiştir / Change Language"
          >
            {lang === "TR" ? "🇬🇧 EN" : "🇹🇷 TR"}
          </button>

          {activeOrderCount > 0 && onOpenOrderTracker && (
            <button
              onClick={onOpenOrderTracker}
              className="px-2.5 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-semibold flex items-center gap-1.5 animate-pulse cursor-pointer"
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span>{lang === "TR" ? `Sipariş (${activeOrderCount})` : `Order (${activeOrderCount})`}</span>
            </button>
          )}

          <button
            onClick={onOpenWaiterCall}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-accent" />
            <span>{lang === "TR" ? "Garson" : "Waiter"}</span>
          </button>
        </div>
      </div>

      {/* 15-Minute Secure Session Bar */}
      <div className="bg-white/[0.03] border-t border-white/5 px-4 py-1.5">
        <div className="max-w-md mx-auto flex items-center justify-between text-[10px] text-foreground/70">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>Masa Oturumu Aktif</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-accent" />
            <span className={remainingMinutes <= 3 ? "text-red-400 font-bold" : "text-foreground/80"}>
              {remainingMinutes} dk geçerli
            </span>
          </div>
        </div>
        {/* Progress indicator */}
        <div className="max-w-md mx-auto w-full h-[2px] bg-white/10 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              remainingMinutes <= 3 ? "bg-red-500" : "bg-accent"
            }`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>
      </div>
    </header>
  );
}
