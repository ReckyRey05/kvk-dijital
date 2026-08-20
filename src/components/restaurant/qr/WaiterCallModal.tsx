"use client";

import { useState } from "react";
import { WaiterCallType } from "@/types/restaurant";
import { X, Bell, CreditCard, Banknote, Droplets, CheckCircle2, Flame, Baby, Sparkles } from "lucide-react";

interface WaiterCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  onSendCall: (type: WaiterCallType, message?: string) => void;
}

export default function WaiterCallModal({
  isOpen,
  onClose,
  tableNumber,
  onSendCall,
}: WaiterCallModalProps) {
  const [sentType, setSentType] = useState<WaiterCallType | null>(null);

  if (!isOpen) return null;

  const handleSelect = (type: WaiterCallType, message?: string) => {
    onSendCall(type, message);
    setSentType(type);
    setTimeout(() => {
      setSentType(null);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-6 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Garson & Hizmet Talebi</h3>
            <p className="text-xs text-foreground/60">{tableNumber} için anlık çağrı</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State */}
        {sentType ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/40 text-accent mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Talebiniz İletildi</h4>
            <p className="text-xs text-foreground/70">
              Personelimiz en kısa sürede masanıza gelecektir.
            </p>
          </div>
        ) : (
          /* Action Cards Grid */
          <div className="space-y-4">
            {/* Quick Priority Call Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSelect("WAITER", "Masa garson çağırdı.")}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-accent/15 border border-white/10 hover:border-accent/40 text-left space-y-2 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                    Garson Çağır
                  </h4>
                  <p className="text-[10px] text-foreground/50">Genel sipariş / soru</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect("BILL_CARD", "Hesap Talebi (Kredi Kartı POS)")}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/40 text-left space-y-2 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    Hesap (Kredi Kartı)
                  </h4>
                  <p className="text-[10px] text-foreground/50">POS cihazı ile gelinir</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect("BILL_CASH", "Hesap Talebi (Nakit)")}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-green-500/15 border border-white/10 hover:border-green-500/40 text-left space-y-2 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-green-300 transition-colors">
                    Hesap (Nakit)
                  </h4>
                  <p className="text-[10px] text-foreground/50">Nakit adisyon</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect("WATER_NAPKIN", "Su & Buz İste")}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/40 text-left space-y-2 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Su & Buz İste
                  </h4>
                  <p className="text-[10px] text-foreground/50">Masaya servis</p>
                </div>
              </button>
            </div>

            {/* Specific Service Requests */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">
                Özel İhtiyaç Butonları (Tek Tıkla Garsona İlet)
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSelect("ASHTRAY", "Kül Tablası İsteği")}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/10 border border-white/5 text-center text-xs font-bold text-foreground/80 hover:text-white transition-all cursor-pointer"
                >
                  🚬 Kül Tablası
                </button>

                <button
                  onClick={() => handleSelect("WIPES", "Islak Mendil / Peçete")}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/10 border border-white/5 text-center text-xs font-bold text-foreground/80 hover:text-white transition-all cursor-pointer"
                >
                  ✨ Islak Mendil
                </button>

                <button
                  onClick={() => handleSelect("BABY_CHAIR", "Bebek Sandalyesi İsteği")}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/10 border border-white/5 text-center text-xs font-bold text-foreground/80 hover:text-white transition-all cursor-pointer"
                >
                  👶 Mama Sandalyesi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
