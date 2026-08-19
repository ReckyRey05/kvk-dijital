"use client";

import { useState } from "react";
import { MenuItem } from "@/types/restaurant";
import { X, Tag, Calendar, Clock, Sparkles, Check, ArrowDownRight, ShieldAlert } from "lucide-react";

interface DiscountCampaignModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  proposedPrice: number;
  onClose: () => void;
  onConfirmPermanentPrice: (itemId: string, newPrice: number) => void;
  onConfirmCampaignDiscount: (itemId: string, discountedPrice: number, discountUntil: string) => void;
}

export default function DiscountCampaignModal({
  isOpen,
  item,
  proposedPrice,
  onClose,
  onConfirmPermanentPrice,
  onConfirmCampaignDiscount,
}: DiscountCampaignModalProps) {
  // Preset or custom datetime
  const [selectedDuration, setSelectedDuration] = useState<"TODAY" | "TOMORROW" | "WEEKEND" | "CUSTOM">("TODAY");
  const [customDateTime, setCustomDateTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 16);
  });

  if (!isOpen || !item) return null;

  const oldPrice = item.price;
  const priceDifference = oldPrice - proposedPrice;
  const discountPercent = Math.round((priceDifference / oldPrice) * 100);

  const calculateExpiryDate = (): string => {
    const now = new Date();
    if (selectedDuration === "TODAY") {
      now.setHours(23, 59, 59, 999);
      return now.toISOString();
    } else if (selectedDuration === "TOMORROW") {
      now.setDate(now.getDate() + 1);
      now.setHours(23, 59, 59, 999);
      return now.toISOString();
    } else if (selectedDuration === "WEEKEND") {
      now.setDate(now.getDate() + 3);
      now.setHours(23, 59, 59, 999);
      return now.toISOString();
    } else {
      return new Date(customDateTime).toISOString();
    }
  };

  const handleStartCampaign = () => {
    const expiryIso = calculateExpiryDate();
    onConfirmCampaignDiscount(item.id, proposedPrice, expiryIso);
    onClose();
  };

  const handleSetPermanent = () => {
    onConfirmPermanentPrice(item.id, proposedPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0c1212] border border-accent/40 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-extrabold border border-accent/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Fiyat İndirimi Algılandı</h3>
              <p className="text-xs text-foreground/50">{item.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Discount Comparison Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/15 via-blue-500/10 to-transparent border border-accent/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-accent block">
              Fiyat Değişimi
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm line-through text-foreground/40 font-bold">{oldPrice} TL</span>
              <span className="text-2xl font-black text-white">{proposedPrice} TL</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-green-400 bg-green-500/20 px-2.5 py-1 rounded-lg border border-green-500/30 inline-block">
              %{discountPercent} İndirim (-{priceDifference} TL)
            </span>
          </div>
        </div>

        {/* Campaign Duration Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-white block">
            İndirim Ne Zamana Kadar Geçerli Olsun?
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedDuration("TODAY")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedDuration === "TODAY"
                  ? "bg-accent/20 border-accent text-white"
                  : "bg-white/[0.02] border-white/10 text-foreground/70 hover:bg-white/5"
              }`}
            >
              <span className="text-xs font-bold block">Bugün 23:59&apos;a Kadar</span>
              <span className="text-[10px] text-foreground/50">Günün fırsatı</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDuration("TOMORROW")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedDuration === "TOMORROW"
                  ? "bg-accent/20 border-accent text-white"
                  : "bg-white/[0.02] border-white/10 text-foreground/70 hover:bg-white/5"
              }`}
            >
              <span className="text-xs font-bold block">Yarın Geceye Kadar</span>
              <span className="text-[10px] text-foreground/50">24 saatlik indirim</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDuration("WEEKEND")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedDuration === "WEEKEND"
                  ? "bg-accent/20 border-accent text-white"
                  : "bg-white/[0.02] border-white/10 text-foreground/70 hover:bg-white/5"
              }`}
            >
              <span className="text-xs font-bold block">3 Gün Boyunca</span>
              <span className="text-[10px] text-foreground/50">Hafta sonu kampanyası</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDuration("CUSTOM")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedDuration === "CUSTOM"
                  ? "bg-accent/20 border-accent text-white"
                  : "bg-white/[0.02] border-white/10 text-foreground/70 hover:bg-white/5"
              }`}
            >
              <span className="text-xs font-bold block">Özel Tarih & Saat</span>
              <span className="text-[10px] text-foreground/50">Takvimden belirle</span>
            </button>
          </div>

          {selectedDuration === "CUSTOM" && (
            <div className="pt-2 animate-fade-in">
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                className="w-full bg-black/60 border border-accent/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Auto-Revert Informational Alert */}
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            Süre dolduğunda sistem fiyatı otomatik olarak eski tutarı olan <strong>{oldPrice} TL</strong>&apos;ye geri döndürecek ve indirim etiketini kaldıracaktır.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Option A: Süreli Kampanya Başlat */}
          <button
            onClick={handleStartCampaign}
            className="py-3.5 px-3 rounded-xl bg-accent text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Süreli Kampanya Başlat</span>
          </button>

          {/* Option B: Kalıcı Yeni Fiyat Yap */}
          <button
            onClick={handleSetPermanent}
            className="py-3.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
          >
            <span>Kalıcı Yeni Fiyat Yap</span>
          </button>
        </div>
      </div>
    </div>
  );
}
