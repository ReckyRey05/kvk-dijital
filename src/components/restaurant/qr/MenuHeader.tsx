"use client";

import { useState } from "react";
import { Restaurant, Table, MenuLanguage, MenuCurrency, TableParticipant } from "@/types/restaurant";
import { Clock, ShieldCheck, Bell, ReceiptText, Sparkles, Gift, Music2, Calculator, Star, Users, Crown, User, Edit3, Check } from "lucide-react";
import { formatPrice } from "@/lib/restaurant/currency";

interface MenuHeaderProps {
  restaurant: Restaurant;
  table: Table;
  remainingMinutes: number;
  onOpenWaiterCall: () => void;
  activeOrderCount: number;
  onOpenOrderTracker?: () => void;
  lang: MenuLanguage;
  onToggleLang: () => void;
  currency: MenuCurrency;
  onSelectCurrency: (c: MenuCurrency) => void;
  onOpenSplitBill?: () => void;
  onOpenFeedback?: () => void;
  onOpenSpinWheel?: () => void;
  onOpenJukebox?: () => void;
  // Multi-User Group & Table Balance
  tableBillTotal?: number;
  currentParticipant?: TableParticipant | null;
  participantCount?: number;
  onUpdateName?: (newName: string) => void;
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
  currency,
  onSelectCurrency,
  onOpenSplitBill,
  onOpenFeedback,
  onOpenSpinWheel,
  onOpenJukebox,
  tableBillTotal = 0,
  currentParticipant,
  participantCount = 1,
  onUpdateName,
}: MenuHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentParticipant?.name || "");

  const percentLeft = Math.max(0, Math.min(100, (remainingMinutes / 15) * 100));
  const currencies: MenuCurrency[] = ["TRY", "USD", "EUR", "GBP"];

  const handleSaveName = () => {
    if (tempName.trim() && onUpdateName) {
      onUpdateName(tempName.trim());
    }
    setIsEditingName(false);
  };

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

        {/* Top Right Action Buttons */}
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
            className="px-3 py-1.5 rounded-full bg-accent text-black hover:bg-accent/90 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-accent/20"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{lang === "TR" ? "Garson" : "Waiter"}</span>
          </button>
        </div>
      </div>

      {/* Live Table Open Bill Total & Multi-User Group Bar */}
      <div className="bg-gradient-to-r from-accent/15 via-emerald-500/10 to-transparent border-t border-white/5 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Table Bill Total */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
              ₺
            </div>
            <div>
              <span className="text-[10px] text-foreground/50 block leading-tight font-medium">Masa Açık Tutarı</span>
              <span className="text-xs font-black text-emerald-400">
                {formatPrice(tableBillTotal || table.activeBillTotal || 0, currency)}
              </span>
            </div>
          </div>

          {/* Group Dining & Participant Badge */}
          <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-xl border border-white/10 text-[10px]">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  placeholder="Adınız"
                  className="w-20 bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px] outline-none border border-accent/40"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded bg-accent text-black font-bold hover:bg-accent/90"
                >
                  <Check className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1 text-[10px] transition-colors hover:text-accent cursor-pointer group"
                title="İsminizi değiştirmek için tıklayın"
              >
                {currentParticipant?.isHost ? (
                  <div className="flex items-center gap-1 text-amber-300 font-extrabold">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Masa Reisi ({currentParticipant.name})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-foreground/80 font-bold">
                    <User className="w-3 h-3 text-accent" />
                    <span>{currentParticipant?.name || "Misafir"}</span>
                  </div>
                )}
                <Edit3 className="w-2.5 h-2.5 text-foreground/40 group-hover:text-accent ml-0.5" />
              </button>
            )}

            <div className="h-3 w-px bg-white/10" />

            <div className="flex items-center gap-1 text-foreground/60 font-medium" title="Masadaki Aktif Kişi Sayısı">
              <Users className="w-3 h-3 text-accent" />
              <span>{participantCount} Kişi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Interactive Features Strip: Currency, SpinWheel, Jukebox, SplitBill */}
      <div className="bg-white/[0.02] border-t border-white/5 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1 overflow-x-auto sleek-scrollbar pb-0.5">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10 shrink-0">
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => onSelectCurrency(c)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  currency === c
                    ? "bg-accent text-black shadow-xs font-extrabold"
                    : "text-foreground/60 hover:text-white"
                }`}
              >
                {c === "TRY" ? "₺ TL" : c === "USD" ? "$ USD" : c === "EUR" ? "€ EUR" : "£ GBP"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Spin-the-wheel */}
            {onOpenSpinWheel && (
              <button
                onClick={onOpenSpinWheel}
                className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                title="İkram Çarkıfeleği"
              >
                <Gift className="w-3 h-3" />
                <span>İkram Çarkı</span>
              </button>
            )}

            {/* Jukebox */}
            {onOpenJukebox && (
              <button
                onClick={onOpenJukebox}
                className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                title="Müzik Kutusu"
              >
                <Music2 className="w-3 h-3" />
                <span>Şarkı İste</span>
              </button>
            )}

            {/* Split Bill */}
            {onOpenSplitBill && (
              <button
                onClick={onOpenSplitBill}
                className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/70 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Hesap Bölüştürücü"
              >
                <Calculator className="w-3 h-3" />
                <span>Hesap Böl</span>
              </button>
            )}

            {/* Feedback */}
            {onOpenFeedback && (
              <button
                onClick={onOpenFeedback}
                className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Geri Bildirim & Google Puanlama"
              >
                <Star className="w-3 h-3" />
                <span>Puan Ver</span>
              </button>
            )}
          </div>
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
