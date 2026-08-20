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
        className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-t-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto sleek-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Garson & Hizmet Talebi</h3>
            <p className="text-[11px] sm:text-xs text-foreground/60">{tableNumber} için anlık çağrı</p>
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
          <div className="py-6 sm:py-8 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/20 border border-accent/40 text-accent mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white">Talebiniz İletildi</h4>
            <p className="text-xs text-foreground/70">
              Personelimiz en kısa sürede masanıza gelecektir.
            </p>
          </div>
        ) : (
          /* Action Cards Grid */
          <div className="space-y-3 sm:space-y-4">
            {/* Quick Priority Call Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <button
                onClick={() => handleSelect("WAITER", "Masa garson çağırdı.")}
                className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-accent/15 border border-white/10 hover:border-accent/40 text-left space-y-1.5 sm:space-y-2 transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/40 text-left space-y-1.5 sm:space-y-2 transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    Hesap (Kart)
                  </h4>
                  <p className="text-[10px] text-foreground/50">POS cihazı ile gelinir</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect("BILL_CASH", "Hesap Talebi (Nakit Kasa)")}
                className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-green-500/15 border border-white/10 hover:border-green-500/40 text-left space-y-1.5 sm:space-y-2 transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-green-300 transition-colors">
                    Hesap (Nakit)
                  </h4>
                  <p className="text-[10px] text-foreground/50">Nakit tahsilat fişi</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect("CUSTOM", "Masaya Su / İçecek Servisi Talebi")}
                className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-left space-y-1.5 sm:space-y-2 transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Su / İçecek İste
                  </h4>
                  <p className="text-[10px] text-foreground/50">Hızlı içecek servisi</p>
                </div>
              </button>
            </div>

            {/* Service Request Quick Pills */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 block">
                Özel İstekler & Ek Servis
              </span>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleSelect("CUSTOM", "Masa Kül Tablası istedi.")}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Kül Tablası</span>
                </button>

                <button
                  onClick={() => handleSelect("CUSTOM", "Masa Bebek Sandalyesi istedi.")}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Baby className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Bebek Sandalyesi</span>
                </button>

                <button
                  onClick={() => handleSelect("CUSTOM", "Masa Peçete / Islak Mendil istedi.")}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span className="truncate">Peçete / Mendil</span>
                </button>

                <button
                  onClick={() => handleSelect("CUSTOM", "Masa Servis Değişimi istedi.")}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="truncate">Servis Değişimi</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
