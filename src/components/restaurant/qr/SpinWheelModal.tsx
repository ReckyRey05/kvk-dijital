"use client";

import { useState } from "react";
import { X, Sparkles, Gift, Check, ArrowRight, Trophy } from "lucide-react";
import { useRestaurantStore } from "@/lib/restaurant/store";

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
}

const PRIZES = [
  { title: "%10 Hesap İndirimi", type: "PERCENT" as const, value: "10" },
  { title: "Közde Türk Kahvesi İkramı", type: "ITEM" as const, value: "Türk Kahvesi" },
  { title: "Çıtır Trüflü Patates İkramı", type: "ITEM" as const, value: "Trüflü Patates" },
  { title: "Bir Sonraki Gelişe %15 İndirim", type: "PERCENT" as const, value: "15" },
  { title: "Günün Gurme Tatlısı %20 İndirim", type: "PERCENT" as const, value: "20" },
  { title: "Ev Yapımı Limonata İkramı", type: "ITEM" as const, value: "Limonata" },
];

export default function SpinWheelModal({
  isOpen,
  onClose,
  tableNumber,
}: SpinWheelModalProps) {
  const { addVoucher } = useRestaurantStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<{ title: string; code: string } | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  if (!isOpen) return null;

  const handleSpin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const extraRounds = 5 * 360; // 5 full turns
    const segmentAngle = 360 / PRIZES.length;
    const finalAngle = extraRounds + randomIndex * segmentAngle + segmentAngle / 2;

    setRotation(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      const selected = PRIZES[randomIndex];
      const code = `CG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setWonPrize({ title: selected.title, code });

      // Save voucher in store
      addVoucher({
        id: `vouch_${Date.now()}`,
        code,
        title: selected.title,
        discountType: selected.type,
        value: selected.value,
        customerName: name,
        customerPhone: phone,
        createdAt: new Date().toISOString(),
      });
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0c1212] border border-amber-500/40 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-fade-in-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-extrabold border border-amber-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">İkram Çarkıfeleği</h3>
              <p className="text-xs text-foreground/50">{tableNumber} • Şansını Dene!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!hasSpun ? (
          <div className="space-y-6">
            {/* Visual Spin Wheel */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              {/* Pointer */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-md" />

              {/* Wheel Body */}
              <div
                className="w-48 h-48 rounded-full border-4 border-amber-500/60 relative overflow-hidden shadow-2xl transition-transform duration-[3500ms] ease-out flex items-center justify-center bg-gradient-to-tr from-amber-950 via-slate-900 to-[#0e1717]"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="grid grid-cols-2 grid-rows-3 w-full h-full text-[9px] font-black text-amber-200 uppercase p-2">
                  <div className="flex items-center justify-center border-r border-b border-amber-500/30 text-center p-1">%10 İndirim</div>
                  <div className="flex items-center justify-center border-b border-amber-500/30 text-center p-1">Kahve İkram</div>
                  <div className="flex items-center justify-center border-r border-b border-amber-500/30 text-center p-1">Trüf Patates</div>
                  <div className="flex items-center justify-center border-b border-amber-500/30 text-center p-1">%15 İndirim</div>
                  <div className="flex items-center justify-center border-r border-amber-500/30 text-center p-1">Tatlı %20</div>
                  <div className="flex items-center justify-center text-center p-1">Limonata</div>
                </div>
              </div>

              {/* Center Hub */}
              <div className="absolute w-10 h-10 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center shadow-lg text-xs">
                ★
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSpin} className="space-y-3 text-left">
              <div>
                <label className="text-[10px] font-bold text-foreground/60 uppercase">Adınız Soyadınız</label>
                <input
                  type="text"
                  placeholder="Örn: Ayşe Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-foreground/60 uppercase">Telefon Numaranız (Kupon Kodu İçin)</label>
                <input
                  type="tel"
                  placeholder="0534 891 49 05"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none mt-1 font-mono"
                  required
                />
              </div>

              <p className="text-[9px] text-foreground/40 text-center">
                KVKK Aydınlatma Metni uyarınca kupon kodunuz SMS ile de iletilecektir.
              </p>

              <button
                type="submit"
                disabled={isSpinning}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSpinning ? "Çark Dönüyor..." : "Çarkı Çevir & İkram Kazan!"}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Winning Screen */
          <div className="space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto animate-bounce">
              <Trophy className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-amber-300 font-extrabold">Tebrikler!</span>
              <h4 className="text-xl font-black text-white">{wonPrize?.title}</h4>
              <p className="text-xs text-foreground/60">
                Kazandığınız ikramı garsona göstererek hemen kullanabilirsiniz.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-500/40 space-y-1">
              <span className="text-[10px] text-foreground/50 uppercase font-bold">Kupon Kodunuz</span>
              <div className="text-2xl font-mono font-black text-amber-300 tracking-wider">
                {wonPrize?.code}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Kapat & Menüye Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
