"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import { useItemSepetiAuth } from "@/context/ItemSepetiAuthContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import ItemSepetiInput from "@/components/itemsepeti/ui/ItemSepetiInput";
import { UserCheck, ShoppingBag, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useItemSepetiAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }
    setLoading(true);
    try {
      await login(email, "buyer");
      router.push("/profilim");
    } catch {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "buyer" | "seller" | "admin") => {
    setLoading(true);
    try {
      const demoEmail =
        role === "seller"
          ? "satici@itemsepeti.com"
          : role === "admin"
          ? "admin@itemsepeti.com"
          : "alici@itemsepeti.com";
      const demoName =
        role === "seller" ? "DragonTrader" : role === "admin" ? "Sistem Yöneticisi" : "OyuncuAli";
      await login(demoEmail, role, demoName);
      router.push("/profilim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-md w-full mx-auto px-4 py-10 sm:py-14 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-inherit">
              Giriş Yap
            </h1>
            <p className="text-xs sm:text-sm text-[#9498A6]">
              İtemSepeti hesabınıza giriş yaparak hemen alışverişe başlayın veya ilanlarınızı yönetin.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
              {error}
            </div>
          )}

          <div
            className="p-6 sm:p-8 rounded-[16px] border space-y-5 bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] shadow-xs"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <ItemSepetiInput
                label="E-Posta Adresi"
                type="email"
                placeholder="ornek@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <ItemSepetiInput
                label="Şifre"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#DCDDE1] text-[#D99532] focus:ring-[#D99532]"
                  />
                  <span className="text-[#626772] dark:text-[#9498A6]">Beni Hatırla</span>
                </label>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Şifre sıfırlama linki e-postanıza iletilecektir.");
                  }}
                  className="text-[#D99532] hover:underline font-semibold"
                >
                  Şifremi Unuttum?
                </Link>
              </div>

              <div className="pt-2">
                <ItemSepetiButton
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={loading}
                  className="w-full"
                >
                  Giriş Yap
                </ItemSepetiButton>
              </div>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#DCDDE1] dark:border-[#282C3A]"></div>
              <span className="flex-shrink mx-4 text-[11px] text-[#9498A6] font-semibold uppercase tracking-wider">
                veya Hızlı Demo Girişi
              </span>
              <div className="flex-grow border-t border-[#DCDDE1] dark:border-[#282C3A]"></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("buyer")}
                className="flex flex-col items-center justify-center p-2 rounded-[8px] border border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-colors text-center text-xs font-semibold cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 mb-1 text-[#D99532]" />
                <span>Alıcı</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("seller")}
                className="flex flex-col items-center justify-center p-2 rounded-[8px] border border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-colors text-center text-xs font-semibold cursor-pointer"
              >
                <UserCheck className="w-4 h-4 mb-1 text-emerald-500" />
                <span>Satıcı</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="flex flex-col items-center justify-center p-2 rounded-[8px] border border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-colors text-center text-xs font-semibold cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 mb-1 text-blue-500" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#626772] dark:text-[#9498A6]">
            Henüz hesabınız yok mu?{" "}
            <Link href="/kayit-ol" className="text-[#D99532] font-bold hover:underline">
              Hemen Kayıt Ol
            </Link>
          </p>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
