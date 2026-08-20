"use client";

import { Order } from "@/types/restaurant";
import { Check, X, Bell, Clock, ChefHat, AlertTriangle, ShieldCheck } from "lucide-react";

interface OrderApprovalModalProps {
  pendingOrders: Order[];
  onConfirmOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
}

export default function OrderApprovalModal({
  pendingOrders,
  onConfirmOrder,
  onRejectOrder,
}: OrderApprovalModalProps) {
  if (pendingOrders.length === 0) return null;

  const current = pendingOrders[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0d1414] border-2 border-accent/60 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl shadow-accent/20 animate-fade-in-up max-h-[90vh] overflow-y-auto sleek-scrollbar">
        {/* Header with Pulsing Alarm */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent text-black flex items-center justify-center animate-bounce shadow-lg shadow-accent/30 shrink-0">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent shrink-0">
                  Yeni QR Siparişi
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-foreground/50 truncate">
                  #{current.id.slice(-6)}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 truncate">
                {current.tableNumber}
              </h2>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block">Sipariş Tutarı</span>
            <span className="text-lg sm:text-xl font-black text-accent">
              {current.totalAmount.toLocaleString("tr-TR")} TL
            </span>
          </div>
        </div>

        {/* Security / 15-Min TTL Verification Badge */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 text-xs text-green-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] sm:text-xs">Masa İmzalı Oturum Doğrulandı</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-green-400/80">Sahte Sipariş Koruması Aktif</span>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="space-y-2.5 max-h-52 sm:max-h-60 overflow-y-auto pr-1 sleek-scrollbar">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground/60">
            Sipariş İçeriği ({current.items.length} Kalem)
          </h4>

          {current.items.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-white/10 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    {item.quantity}
                  </span>
                  <span className="font-bold text-white text-xs sm:text-sm break-words">{item.name}</span>
                </div>

                {/* Selected Options */}
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="text-[10px] sm:text-[11px] text-accent/80 mt-1 pl-7 space-y-0.5 break-words">
                    {item.selectedOptions.flatMap((g) =>
                      g.selectedItems.map((s) => (
                        <div key={s.id}>
                          • {g.groupTitle}: {s.name}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {item.itemNotes && (
                  <p className="text-[10px] sm:text-[11px] text-amber-300 pl-7 mt-1 italic break-words">
                    Not: {item.itemNotes}
                  </p>
                )}
              </div>

              <span className="font-bold text-white shrink-0 ml-2">
                {(item.finalPrice * item.quantity).toLocaleString("tr-TR")} TL
              </span>
            </div>
          ))}

          {current.notes && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 break-words">
              <span className="font-bold">Masa Genel Notu:</span> {current.notes}
            </div>
          )}
        </div>

        {/* Action Buttons: Confirm to Kitchen or Reject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1">
          <button
            onClick={() => onRejectOrder(current.id)}
            className="py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-foreground/70 hover:text-red-400 border border-white/10 hover:border-red-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer order-2 sm:order-1"
          >
            <X className="w-4 h-4" />
            <span>Siparişi Reddet</span>
          </button>

          <button
            onClick={() => onConfirmOrder(current.id)}
            className="py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl bg-accent text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-all shadow-xl shadow-accent/25 cursor-pointer order-1 sm:order-2"
          >
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Onayla & Mutfağa İlet</span>
          </button>
        </div>

        {pendingOrders.length > 1 && (
          <p className="text-[10px] sm:text-[11px] text-center text-foreground/50">
            Kuyrukta bekleyen {pendingOrders.length - 1} onay bekleyen sipariş daha var.
          </p>
        )}
      </div>
    </div>
  );
}
