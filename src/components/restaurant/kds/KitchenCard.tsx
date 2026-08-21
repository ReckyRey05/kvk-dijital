"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/restaurant";
import { Clock, ChefHat, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

interface KitchenCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
}

export default function KitchenCard({ order, onUpdateStatus }: KitchenCardProps) {
  // Elapsed time counter
  const [elapsedMinutes, setElapsedMinutes] = useState(() => {
    const diffMs = Date.now() - new Date(order.createdAt).getTime();
    return Math.floor(diffMs / 60000);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diffMs = Date.now() - new Date(order.createdAt).getTime();
      setElapsedMinutes(Math.floor(diffMs / 60000));
    }, 15000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Color coding by elapsed time
  let timerBadgeColor = "bg-green-500/20 text-green-400 border-green-500/30";
  let cardBorder = "border-white/10";

  if (elapsedMinutes >= 15) {
    timerBadgeColor = "bg-red-500 text-white font-black animate-pulse";
    cardBorder = "border-red-500/60 ring-2 ring-red-500/30";
  } else if (elapsedMinutes >= 8) {
    timerBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
    cardBorder = "border-amber-500/40";
  }

  const isPreparing = order.status === "PREPARING";
  const isReady = order.status === "READY";

  if (isReady) {
    cardBorder = "border-green-500/60 ring-2 ring-green-500/20";
    timerBadgeColor = "bg-green-500 text-black font-black";
  }

  return (
    <div
      className={`rounded-2xl bg-[#0c1212] border ${cardBorder} p-3.5 sm:p-4 flex flex-col justify-between shadow-2xl transition-all min-h-[340px] sm:min-h-[360px] h-auto`}
    >
      {/* Header: Table & Elapsed Timer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white">{order.tableNumber}</span>
              <span className="text-[10px] font-mono text-foreground/50">
                #{order.id.slice(-6)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-foreground/60">
                {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isReady && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-extrabold animate-pulse">
                  Servis Bekliyor
                </span>
              )}
            </div>
          </div>

          {/* Time Badge */}
          <div
            className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${timerBadgeColor}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isReady ? "Hazır" : `${elapsedMinutes} dk`}</span>
          </div>
        </div>

        {/* Ordered Items List (Large & Clear for Kitchen Staff) */}
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {order.items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-accent text-black font-black text-sm flex items-center justify-center shrink-0">
                  {item.quantity}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-white text-sm leading-tight">
                    {item.name}
                  </h4>

                  {/* Options */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="text-xs font-semibold text-accent mt-0.5 space-y-0.5">
                      {item.selectedOptions.flatMap((g) =>
                        g.selectedItems.map((s) => (
                          <div key={s.id}>
                            • {g.groupTitle}: {s.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Removed Ingredients Alert for Cooks */}
                  {item.removedIngredients && item.removedIngredients.length > 0 && (
                    <div className="text-xs font-black text-red-300 bg-red-950/80 p-1.5 rounded-lg mt-1 border border-red-500/50 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400 mt-0.5" />
                      <span>ÇIKARILACAKLAR: {item.removedIngredients.join(", ")}</span>
                    </div>
                  )}

                  {/* Custom item note */}
                  {item.itemNotes && (
                    <p className="text-xs text-amber-300 font-bold bg-amber-500/10 p-1 rounded-md mt-1 border border-amber-500/20">
                      Not: {item.itemNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {order.notes && (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-semibold">
              Masa Notu: {order.notes}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer for Kitchen Chefs */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        {isPreparing ? (
          <div className="space-y-1.5">
            <button
              onClick={() => onUpdateStatus(order.id, "READY")}
              className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Hazır (Garsona Bildir)</span>
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, "SERVED")}
              className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/60 hover:text-white font-semibold text-[11px] transition-colors cursor-pointer"
            >
              Doğrudan Servis Edildi (Tamamla)
            </button>
          </div>
        ) : isReady ? (
          <button
            onClick={() => onUpdateStatus(order.id, "SERVED")}
            className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-accent/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Servis Edildi (Kapat)</span>
          </button>
        ) : (
          <div className="py-2.5 text-center text-xs text-green-400 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Masanın Siparişi Tamamlandı</span>
          </div>
        )}
      </div>
    </div>
  );
}
