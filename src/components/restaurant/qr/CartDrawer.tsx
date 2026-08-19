"use client";

import { useState } from "react";
import { OrderItem, Restaurant } from "@/types/restaurant";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

interface CartDrawerProps {
  restaurant: Restaurant;
  tableNumber: string;
  items: OrderItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onSubmitOrder: (notes: string) => Promise<void>;
  remainingMinutes: number;
}

export default function CartDrawer({
  restaurant,
  tableNumber,
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  remainingMinutes,
}: CartDrawerProps) {
  const [generalNotes, setGeneralNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  const handleOrderSubmit = async () => {
    if (items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmitOrder(generalNotes);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Sipariş Sepetiniz</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                {tableNumber}
              </span>
            </h2>
            <p className="text-[11px] text-foreground/60">
              {items.length} farklı ürün eklendi
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {items.length === 0 ? (
            <div className="py-12 text-center text-foreground/50 space-y-2">
              <p className="text-sm font-medium">Sepetinizde henüz ürün yok.</p>
              <p className="text-xs">Menüden dilediğiniz lezzetleri ekleyebilirsiniz.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xs leading-snug">{item.name}</h4>
                    <p className="text-accent text-xs font-bold mt-0.5">
                      {(item.finalPrice * item.quantity).toLocaleString("tr-TR")} TL
                    </p>

                    {/* Selected Options Summary */}
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-[10px] text-foreground/60 mt-1 space-y-0.5">
                        {item.selectedOptions.flatMap((g) =>
                          g.selectedItems.map((s) => (
                            <div key={s.id}>
                              • {g.groupTitle}: {s.name}{" "}
                              {s.priceDelta > 0 ? `(+${s.priceDelta} TL)` : ""}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Custom note */}
                    {item.itemNotes && (
                      <p className="text-[10px] text-amber-300/80 italic mt-1">
                        Not: {item.itemNotes}
                      </p>
                    )}
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                      <button
                        onClick={() =>
                          item.quantity > 1 ? onUpdateQuantity(idx, item.quantity - 1) : onRemoveItem(idx)
                        }
                        className="w-6 h-6 rounded flex items-center justify-center text-white hover:bg-white/10"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3 h-3 text-red-400" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-white hover:bg-white/10"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* General Table Order Note */}
          {items.length > 0 && (
            <div className="pt-2 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                Masaya Özel Sipariş Notu
              </label>
              <textarea
                placeholder="Örn: Servis aynı anda açılsın, içecekler yemekle gelsin..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-foreground/40 focus:outline-none focus:border-accent resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer: Order Summary & Send Button */}
        {items.length > 0 && (
          <div className="p-4 bg-[#080d0d] border-t border-white/10 space-y-3">
            {/* Info notice */}
            <div className="flex items-center justify-between text-[11px] text-foreground/60 px-1">
              <div className="flex items-center gap-1.5 text-green-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>15 dk Oturum Korumalı</span>
              </div>
              <div className="flex items-center gap-1 text-foreground/80">
                <Clock className="w-3 h-3 text-accent" />
                <span>{remainingMinutes} dk kaldı</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5 px-1">
              <span className="text-xs font-medium text-foreground/70">Toplam Tutar</span>
              <span className="text-lg font-extrabold text-white">
                {totalAmount.toLocaleString("tr-TR")} TL
              </span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleOrderSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-accent text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Sipariş İletiliyor...</span>
              ) : (
                <>
                  <span>
                    {restaurant.settings.orderMode === "WAITER_CONFIRMATION"
                      ? "Siparişi Kasaya Gönder (Onaylı)"
                      : "Siparişi Doğrudan Mutfağa Gönder"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
