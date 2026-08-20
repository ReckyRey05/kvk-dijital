"use client";

import { useState } from "react";
import { X, CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowRight, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/restaurant/currency";
import { MenuCurrency } from "@/types/restaurant";

interface OnlinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  totalAmount: number;
  currency?: MenuCurrency;
  onPaymentSuccess: () => void;
}

export default function OnlinePaymentModal({
  isOpen,
  onClose,
  tableNumber,
  totalAmount,
  currency = "TRY",
  onPaymentSuccess,
}: OnlinePaymentModalProps) {
  const [step, setStep] = useState<"CARD_DETAILS" | "3D_SECURE" | "SUCCESS">("CARD_DETAILS");
  const [cardNumber, setCardNumber] = useState("4543 •••• •••• 8821");
  const [cardHolder, setCardHolder] = useState("ALİ HAYDAR KAVAK");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("842");
  const [otpCode, setOtpCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleProceed3D = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("3D_SECURE");
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("SUCCESS");
      onPaymentSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0c1212] border border-accent/40 rounded-t-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto sleek-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-extrabold border border-accent/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Masada Online Ödeme</h3>
              <p className="text-xs text-foreground/50">{tableNumber} • 256-Bit SSL Güvenli</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Card Details */}
        {step === "CARD_DETAILS" && (
          <form onSubmit={handleProceed3D} className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-blue-500/10 border border-accent/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-accent">Ödenecek Tutar</span>
                <div className="text-2xl font-black text-white">{formatPrice(totalAmount, currency)}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-500/20 px-2.5 py-1 rounded-lg border border-green-500/30">
                <Lock className="w-3.5 h-3.5" />
                <span>3D Secure</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-foreground/70 uppercase">Kart Numarası</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-accent rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none mt-1 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/70 uppercase">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-accent rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none mt-1 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 uppercase">Son Kullanma (AA/YY)</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-accent rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none mt-1 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 uppercase">CVV / CVC</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-accent rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none mt-1 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-accent text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isProcessing ? "İşleniyor..." : `3D Secure ile Öde (${formatPrice(totalAmount, currency)})`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: 3D Secure SMS OTP Verification */}
        {step === "3D_SECURE" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Banka Onay Kodu Gönderildi</h4>
              <p className="text-xs text-foreground/60">
                +90 534 *** ** 05 numaralı telefonunuza gelen 6 haneli güvenlik kodunu giriniz. (Demo Kodu: <strong>123456</strong>)
              </p>
            </div>

            <div>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-black/80 border border-accent rounded-xl py-3 text-center text-xl font-mono tracking-widest text-white focus:outline-none"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-green-500 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? "Onaylanıyor..." : "Ödemeyi Tamamla"}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === "SUCCESS" && (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">Ödemeniz Başarıyla Alındı!</h4>
              <p className="text-xs text-foreground/60">
                {tableNumber} hesabı kapatılmıştır. Bizi tercih ettiğiniz için teşekkür ederiz.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground/70">
              Dekont No: <strong>#TXN-{Date.now().toString().slice(-8)}</strong> • Kart: <strong>{cardNumber.slice(-4)}</strong>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-accent text-black font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Menüye Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
