"use client";

import { Order } from "@/types/restaurant";
import { X, CheckCircle2, Clock, ChefHat, Sparkles, AlertCircle } from "lucide-react";

interface OrderTrackerProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
}

const STATUS_STEPS = [
  { key: "PENDING_CONFIRMATION", label: "Onay Bekliyor", icon: Clock },
  { key: "PREPARING", label: "Mutfakta Hazırlanıyor", icon: ChefHat },
  { key: "READY", label: "Servise Hazır", icon: Sparkles },
  { key: "SERVED", label: "Masanıza İletildi", icon: CheckCircle2 },
];

export default function OrderTracker({ orders, isOpen, onClose, tableNumber }: OrderTrackerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-t-[1.5rem] sm:rounded-[2rem] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
              <span>Canlı Sipariş Takibi</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold shrink-0">
                {tableNumber}
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-foreground/60 truncate">
              {orders.length} adet aktif siparişiniz bulunuyor
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 sm:space-y-4 sleek-scrollbar">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-foreground/50 space-y-2">
              <p className="text-sm font-medium">Aktif siparişiniz bulunmuyor.</p>
            </div>
          ) : (
            orders.map((ord) => {
              const currentStepIndex =
                ord.status === "PENDING_CONFIRMATION"
                  ? 0
                  : ord.status === "PREPARING"
                  ? 1
                  : ord.status === "READY"
                  ? 2
                  : ord.status === "SERVED"
                  ? 3
                  : 3;

              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4"
                >
                  {/* Top: Order ID & Total */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-foreground/60">
                      Sipariş #{ord.id.slice(-6)}
                    </span>
                    <span className="font-extrabold text-accent">
                      {ord.totalAmount.toLocaleString("tr-TR")} TL
                    </span>
                  </div>

                  {/* Status Stepper */}
                  <div className="relative flex items-center justify-between py-2 px-1">
                    {/* Connecting Bar */}
                    <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[2px] bg-white/10 z-0" />
                    <div
                      className="absolute top-1/2 left-4 -translate-y-1/2 h-[2px] bg-accent transition-all duration-700 z-0"
                      style={{
                        width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 85}%`,
                      }}
                    />

                    {STATUS_STEPS.map((st, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const Icon = st.icon;

                      return (
                        <div
                          key={st.key}
                          className="relative z-10 flex flex-col items-center gap-1.5"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? "bg-accent text-black ring-4 ring-accent/20 scale-110 shadow-lg shadow-accent/30"
                                : isCompleted
                                ? "bg-accent/30 text-accent border border-accent/40"
                                : "bg-white/5 text-foreground/30 border border-white/10"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[9px] font-semibold text-center max-w-[70px] leading-tight ${
                              isCurrent
                                ? "text-accent font-bold"
                                : isCompleted
                                ? "text-white"
                                : "text-foreground/40"
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Items Summary */}
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    {ord.items.map((it, itIdx) => (
                      <div
                        key={`${it.id}-${itIdx}`}
                        className="flex items-center justify-between text-xs text-foreground/80"
                      >
                        <span>
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-semibold text-white">
                          {(it.finalPrice * it.quantity).toLocaleString("tr-TR")} TL
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
