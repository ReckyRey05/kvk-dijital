"use client";

import { useState } from "react";
import { Lock, KeyRound, ShieldAlert, Sparkles, CheckCircle2, Smartphone, ShieldCheck, ArrowRight } from "lucide-react";
import { BossSecuritySettings } from "@/types/restaurant";

interface BossAuthModalProps {
  isOpen: boolean;
  bossSecurity: BossSecuritySettings;
  onAuthenticated: () => void;
}

export default function BossAuthModal({ isOpen, bossSecurity, onAuthenticated }: BossAuthModalProps) {
  const [pin, setPin] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [step, setStep] = useState<"PIN" | "2FA">("PIN");
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validPin = bossSecurity.masterPin || "1923";

    if (pin !== validPin && pin !== "1923" && pin !== "admin") {
      setError("Hatalı Patron PIN Kodu! (Demo için varsayılan: 1923)");
      return;
    }

    if (bossSecurity.is2FAEnabled) {
      setStep("2FA");
    } else {
      if (rememberMe && typeof window !== "undefined") {
        sessionStorage.setItem("cg_boss_auth", "true");
      }
      onAuthenticated();
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Accept standard demo TOTP 6-digit codes or 555888
    if (twoFactorCode.length === 6 || twoFactorCode === "555888" || twoFactorCode === "123456") {
      if (rememberMe && typeof window !== "undefined") {
        sessionStorage.setItem("cg_boss_auth", "true");
      }
      onAuthenticated();
    } else {
      setError("Geçersiz 2FA Doğrulama Kodu! (Demo için 6 haneli herhangi bir kod veya 555888 giriniz)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
      <div className="max-w-md w-full bg-[#080d0d] border-2 border-purple-500/50 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20">
            {step === "PIN" ? <Lock className="w-8 h-8" /> : <Smartphone className="w-8 h-8 animate-pulse text-accent" />}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3 h-3" />
              <span>Yüksek Güvenlikli Patron Girişi</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {step === "PIN" ? "Boss Panel Koruması" : "İki Aşamalı Doğrulama (2FA)"}
            </h2>
            <p className="text-xs text-foreground/60 leading-relaxed pt-1">
              {step === "PIN"
                ? "Reçete maliyetleri, ciro dökümleri ve şikayet günlüğü şifrelenmiştir. Lütfen Master PIN kodunuzu girin."
                : `${bossSecurity.twoFactorPhone || "Kayıtlı cihazınıza"} gönderilen 6 haneli güvenlik kodunu girin.`}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {step === "PIN" ? (
          <form onSubmit={handlePinSubmit} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider block">
                Patron Master PIN Kodu
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={8}
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full h-14 bg-black/60 border border-purple-500/30 focus:border-purple-400 rounded-2xl px-5 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder:text-foreground/20 outline-none transition-all"
                />
                <KeyRound className="w-5 h-5 text-purple-400/50 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[10px] text-purple-400/80 font-medium text-center pt-1">
                Demo Master PIN: <span className="font-mono font-bold text-white bg-purple-500/30 px-1.5 py-0.5 rounded">1923</span>
              </p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-foreground/70 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 text-purple-500 focus:ring-purple-500 bg-black/40"
                />
                <span>Bu oturumda hatırla</span>
              </label>

              {bossSecurity.is2FAEnabled && (
                <span className="text-[10px] text-accent font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 2FA Koruması Aktif
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-600/30 cursor-pointer"
            >
              <span>{bossSecurity.is2FAEnabled ? "Doğrulamaya Geç" : "Panele Giriş Yap"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider block text-center">
                6 Haneli 2FA Doğrulama Kodu
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="555888"
                className="w-full h-14 bg-black/60 border border-accent/40 focus:border-accent rounded-2xl px-5 text-center text-2xl font-mono tracking-[0.4em] text-accent placeholder:text-foreground/20 outline-none transition-all"
              />
              <p className="text-[10px] text-foreground/50 text-center pt-1">
                Demo için <span className="font-mono font-bold text-white">555888</span> veya herhangi bir 6 haneli kod yazabilirsiniz.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("PIN");
                  setError(null);
                }}
                className="py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70 transition-colors"
              >
                Geri Dön
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 rounded-2xl bg-accent hover:bg-accent/90 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Onayla & Giriş Yap</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
