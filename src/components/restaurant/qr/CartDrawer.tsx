"use client";

import { useState } from "react";
import { OrderItem, Restaurant, MenuCurrency, TableParticipant } from "@/types/restaurant";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  CreditCard,
  Crown,
  Users,
  User,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/restaurant/currency";

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
  currency?: MenuCurrency;
  onOpenOnlinePayment?: () => void;
  // Multi-user & Host Approval
  currentParticipant?: TableParticipant | null;
  participants?: TableParticipant[];
  onTransferHost?: (targetId: string) => void;
  onPayMyShare?: (myItems: OrderItem[], myTotal: number) => void;
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
  currency = "TRY",
  onOpenOnlinePayment,
  currentParticipant,
  participants = [],
  onTransferHost,
  onPayMyShare,
}: CartDrawerProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "MINE">("ALL");
  const [generalNotes, setGeneralNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransferDropdown, setShowTransferDropdown] = useState(false);

  if (!isOpen) return null;

  const isHost = currentParticipant?.isHost ?? true;
  const hostParticipant = participants.find((p) => p.isHost);

  // Filter items by current user
  const myItems = items.filter(
    (it) =>
      it.addedById === currentParticipant?.id ||
      (currentParticipant?.name && it.addedBy === currentParticipant.name)
  );

  const displayedItems = activeTab === "MINE" ? myItems : items;
  const totalAmount = items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const myTotalAmount = myItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

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
        className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-t-[1.5rem] sm:rounded-[2rem] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Ortak Masa Sepeti</h2>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold shrink-0">
                {tableNumber}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-foreground/60 flex items-center gap-1 mt-0.5 truncate">
              <Users className="w-3 h-3 text-accent shrink-0" />
              <span>Masada {participants.length || 1} Kişi Sipariş Ekliyor</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Tüm Masa vs Benim Seçtiklerim */}
        <div className="p-2 bg-white/[0.02] border-b border-white/5 flex gap-1">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "ALL"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tüm Masa ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("MINE")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "MINE"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Benim Payım ({myItems.length})</span>
          </button>
        </div>

        {/* Host Status & Transfer Banner */}
        {isHost && participants.length > 1 && onTransferHost && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-amber-300 font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Sipariş onay yetkisi sizde</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowTransferDropdown(!showTransferDropdown)}
                className="text-[10px] text-accent hover:underline font-bold"
              >
                Reisliği Devret
              </button>

              {showTransferDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-[#121818] border border-white/10 rounded-xl p-2 shadow-2xl z-20 w-44 space-y-1">
                  <span className="text-[9px] text-foreground/50 block font-semibold px-1">
                    Yetkiyi devredeceğiniz kişi:
                  </span>
                  {participants
                    .filter((p) => p.id !== currentParticipant?.id)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onTransferHost(p.id);
                          setShowTransferDropdown(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 text-xs font-semibold text-white flex items-center justify-between"
                      >
                        <span>{p.name}</span>
                        <ArrowRight className="w-3 h-3 text-accent" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 sleek-scrollbar">
          {displayedItems.length === 0 ? (
            <div className="py-12 text-center text-foreground/50 space-y-2">
              <p className="text-sm font-medium">
                {activeTab === "MINE"
                  ? "Henüz kendinize ait bir ürün eklemediniz."
                  : "Ortak sepette henüz ürün yok."}
              </p>
              <p className="text-xs">Menüden dilediğiniz lezzetleri sepete ekleyebilirsiniz.</p>
            </div>
          ) : (
            displayedItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-xs leading-snug">{item.name}</h4>
                      {item.addedBy && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-accent/15 text-accent font-bold">
                          {item.addedBy === currentParticipant?.name ? "Siz" : item.addedBy}
                        </span>
                      )}
                    </div>
                    <p className="text-accent text-xs font-bold mt-0.5">
                      {formatPrice(item.finalPrice * item.quantity, currency)}
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

                    {/* Removed ingredients */}
                    {item.removedIngredients && item.removedIngredients.length > 0 && (
                      <div className="text-[10px] text-red-400 font-semibold mt-1 flex flex-wrap gap-1">
                        <span className="text-red-400">Çıkarılanlar:</span>
                        {item.removedIngredients.map((ing) => (
                          <span key={ing} className="line-through bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                            {ing}
                          </span>
                        ))}
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
                        className="w-6 h-6 rounded flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
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
                        className="w-6 h-6 rounded flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
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
          {items.length > 0 && isHost && (
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
              <span className="text-xs font-medium text-foreground/70">
                {activeTab === "MINE" ? "Benim Seçtiklerimin Tutarı" : "Tüm Masanın Sepet Toplamı"}
              </span>
              <span className="text-lg font-extrabold text-white">
                {formatPrice(activeTab === "MINE" ? myTotalAmount : totalAmount, currency)}
              </span>
            </div>

            {/* Host Actions vs Guest Pending Info */}
            <div className="space-y-2">
              {isHost ? (
                <>
                  <button
                    onClick={handleOrderSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-accent text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sipariş İletiliyor...</span>
                    ) : (
                      <>
                        <span>Tüm Masanın Siparişini Kasaya Gönder</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {onOpenOnlinePayment && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOnlinePayment();
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Masada Online Öde (3D Secure)</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs space-y-1">
                    <p className="text-amber-300 font-bold flex items-center justify-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Masa Reisi Onayı Bekleniyor</span>
                    </p>
                    <p className="text-[11px] text-foreground/60">
                      Ürünleriniz ortak sepete eklendi. Siparişi mutfağa gönderme yetkisi Masa Reisi (
                      {hostParticipant?.name || "Masa Sahibi"})&apos;ndedir.
                    </p>
                  </div>

                  {myItems.length > 0 && onPayMyShare && (
                    <button
                      type="button"
                      onClick={() => onPayMyShare(myItems, myTotalAmount)}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Sadece Kendi Payımı Öde ({formatPrice(myTotalAmount, currency)})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
