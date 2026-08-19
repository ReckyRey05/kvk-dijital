"use client";

import { useState } from "react";
import { X, Users, Calculator, ArrowRight } from "lucide-react";
import { MenuLanguage } from "@/types/restaurant";
import { DICTIONARY } from "@/lib/restaurant/i18n";

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  lang: MenuLanguage;
}

export default function SplitBillModal({
  isOpen,
  onClose,
  totalAmount,
  lang,
}: SplitBillModalProps) {
  const [personCount, setPersonCount] = useState(2);
  const t = DICTIONARY[lang];

  if (!isOpen) return null;

  const perPersonAmount = Math.ceil(totalAmount / personCount);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-6 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.splitBill}</h3>
              <p className="text-xs text-foreground/60">{t.splitEqually}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total & Person Count Selector */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/70">{t.totalAmount}</span>
            <span className="text-xl font-black text-white">{totalAmount.toLocaleString("tr-TR")} TL</span>
          </div>

          {/* People Counter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 block">
              Kaç Kişi Paylaşacak?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setPersonCount(cnt)}
                  className={`py-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    personCount === cnt
                      ? "bg-accent text-black shadow-lg shadow-accent/25 scale-[1.02]"
                      : "bg-white/5 text-foreground/70 hover:bg-white/10"
                  }`}
                >
                  {cnt} {t.person}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="p-5 rounded-2xl bg-accent/10 border border-accent/30 text-center space-y-1">
            <span className="text-xs font-semibold text-accent block">{t.perPerson}</span>
            <span className="text-3xl font-black text-white">
              {perPersonAmount.toLocaleString("tr-TR")}{" "}
              <span className="text-sm font-bold text-accent">TL</span>
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
