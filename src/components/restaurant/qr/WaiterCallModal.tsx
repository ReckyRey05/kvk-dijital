"use client";

import { useState } from "react";
import { WaiterCallType } from "@/types/restaurant";
import { X, Bell, CreditCard, Banknote, Droplets, CheckCircle2 } from "lucide-react";

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
            <h3 className="text-base font-bold text-white">Garson & Hesap Talebi</h3>
            <p className="text-xs text-foreground/60">{tableNumber} için anlık bildirim</p>
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
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSelect("WAITER", "Masa garson çağırdı.")}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-accent/15 border border-white/10 hover:border-accent/40 text-left space-y-2.5 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                  Garson Çağır
                </h4>
                <p className="text-[10px] text-foreground/50">Masanıza personel yönlendirilir</p>
              </div>
            </button>

            <button
              onClick={() => handleSelect("BILL_CARD", "Hesap Talebi (Kredi Kartı POS)")}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-accent/15 border border-white/10 hover:border-accent/40 text-left space-y-2.5 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                  Hesap (Kredi Kartı)
                </h4>
                <p className="text-[10px] text-foreground/50">Mobil POS cihazı ile gelinir</p>
              </div>
            </button>

            <button
              onClick={() => handleSelect("BILL_CASH", "Hesap Talebi (Nakit)")}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-accent/15 border border-white/10 hover:border-accent/40 text-left space-y-2.5 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                  Hesap (Nakit)
                </h4>
                <p className="text-[10px] text-foreground/50">Nakit adisyon hazırlanır</p>
              </div>
            </button>

            <button
              onClick={() => handleSelect("WATER_NAPKIN", "Su / Peçete / Servis Talebi")}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-accent/15 border border-white/10 hover:border-accent/40 text-left space-y-2.5 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                  Su & Peçete İste
                </h4>
                <p className="text-[10px] text-foreground/50">Ekstra servis malzemesi</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
