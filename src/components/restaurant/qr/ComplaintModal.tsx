"use client";

import { useState } from "react";
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  UtensilsCrossed,
  Clock,
  UserX,
  Sparkles,
  Receipt,
  MessageSquareWarning,
} from "lucide-react";
import { useRestaurantStore } from "@/lib/restaurant/store";

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  tableId: string;
}

const COMPLAINT_CATEGORIES = [
  { id: "FOOD_QUALITY", label: "Yemek / Lezzet (Soğuk, Eksik vb.)", icon: UtensilsCrossed },
  { id: "SERVICE_DELAY", label: "Geciken Sipariş / Yavaş Servis", icon: Clock },
  { id: "STAFF_BEHAVIOR", label: "Personel / Garson İlgisizliği", icon: UserX },
  { id: "HYGIENE", label: "Masa & Hijyen Durumu", icon: Sparkles },
  { id: "BILL_ISSUE", label: "Hesap / Fiyat Uyuşmazlığı", icon: Receipt },
  { id: "OTHER", label: "Diğer Şikayet / Özel Talep", icon: MessageSquareWarning },
];

export default function ComplaintModal({
  isOpen,
  onClose,
  tableNumber,
  tableId,
}: ComplaintModalProps) {
  const { addManagerAlert, callWaiter } = useRestaurantStore();

  const [selectedCategory, setSelectedCategory] = useState(COMPLAINT_CATEGORIES[0].id);
  const [details, setDetails] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [requestVisit, setRequestVisit] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    const categoryObj = COMPLAINT_CATEGORIES.find((c) => c.id === selectedCategory);
    const categoryLabel = categoryObj ? categoryObj.label : "Şikayet";

    // 1. Dispatch Urgent Manager Alert to Cashier POS & Boss Panel
    addManagerAlert({
      id: `complaint_${Date.now()}`,
      tableId,
      tableNumber,
      type: "COMPLAINT",
      category: categoryLabel,
      message: `${categoryLabel}: ${details.trim()}`,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      createdAt: new Date().toISOString(),
      isResolved: false,
    });

    // 2. If customer requested a manager visit, also trigger a waiter call
    if (requestVisit) {
      callWaiter({
        id: `call_complaint_${Date.now()}`,
        restaurantId: "rest_aura_bistro",
        tableId,
        tableNumber,
        type: "COMPLAINT",
        message: `Müdür Görüşmesi Talebi (${categoryLabel})`,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      });
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDetails("");
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0a0f0f] border border-red-500/30 rounded-t-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl shadow-red-950/40 animate-fade-in-up max-h-[92vh] overflow-y-auto sleek-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 font-bold">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Müdüre Şikayet & Talep İlet</h3>
              <p className="text-[11px] text-foreground/60">{tableNumber} • Doğrudan Restoran Yönetimi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Şikayetiniz Müdüre İletildi</h4>
            <p className="text-xs text-foreground/70 max-w-xs mx-auto leading-relaxed">
              Görüşünüz restoran müdürümüzün ekranına kırmızı acil kodla düştü.
              {requestVisit && " Yetkili personelimiz en kısa sürede masanıza gelecektir."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector Pills */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                Şikayet Konusu Seçin
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMPLAINT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-red-500/20 border-red-500/50 text-red-300 shadow-md shadow-red-500/10"
                          : "bg-white/[0.03] border-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span className="text-[11px] font-semibold leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complaint Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                Açıklama (Müdüre İletilecek) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Örn: Siparişim 30 dakikadır gelmedi, çorba soğuk servis edildi..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-foreground/40 focus:outline-none focus:border-red-500/60 transition-all resize-none"
              />
            </div>

            {/* Optional Customer Contact */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="İsminiz (Opsiyonel)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-foreground/40 focus:outline-none focus:border-red-500/60"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Telefon (Opsiyonel)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-foreground/40 focus:outline-none focus:border-red-500/60"
                />
              </div>
            </div>

            {/* Manager Visit Checkbox */}
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.05]">
              <input
                type="checkbox"
                checked={requestVisit}
                onChange={(e) => setRequestVisit(e.target.checked)}
                className="w-4 h-4 rounded text-red-500 accent-red-500"
              />
              <div className="text-[11px]">
                <span className="font-bold text-white block">Yetkili / Müdür Masamıza Gelsin</span>
                <span className="text-foreground/50">Restoran sorumlusu masanıza yönlendirilir.</span>
              </div>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!details.trim()}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Şikayeti Müdüre Gönder</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
