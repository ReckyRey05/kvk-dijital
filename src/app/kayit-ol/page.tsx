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

function RegisterForm() {
  const router = useRouter();
  const { signup } = useItemSepetiAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Lütfen kullanıcı ve gizlilik sözleşmesini onaylayın.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        displayName,
        email,
        phone,
        role: isSeller ? "seller" : "buyer",
      });
      if (res) {
        router.push("/profilim");
      } else {
        setError("Kayıt oluşturulamadı. Bilgilerinizi kontrol ediniz.");
      }
    } catch {
      setError("Kayıt işlemi tamamlanamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ItemSepetiHeader />

        <main className="flex-1 max-w-md w-full mx-auto px-4 py-10 sm:py-14 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-inherit">
              Hesap Oluştur
            </h1>
            <p className="text-xs sm:text-sm text-[#9498A6]">
              Dakikalar içinde kaydolun, indirimli fiyatlarla eşya alın ya da hemen ilan açın.
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
                label="Ad Soyad veya Mağaza Adı"
                placeholder="Örn: DragonTrader"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <ItemSepetiInput
                label="E-Posta Adresi"
                type="email"
                placeholder="ornek@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <ItemSepetiInput
                label="Telefon Numarası (SMS Onayı İçin)"
                type="tel"
                placeholder="05XX XXX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                hint="Güvenli teslimat ve SMS bilgilendirmesi için gereklidir."
              />

              <ItemSepetiInput
                label="Şifre"
                type="password"
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <div className="pt-1 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                  <input
                    type="checkbox"
                    checked={isSeller}
                    onChange={(e) => setIsSeller(e.target.checked)}
                    className="rounded border-[#DCDDE1] text-[#D99532] focus:ring-[#D99532]"
                  />
                  <span className="font-semibold text-inherit">
                    Satıcı hesabı açmak ve ilan vermek istiyorum
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none text-xs">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                    className="rounded border-[#DCDDE1] text-[#D99532] focus:ring-[#D99532] mt-0.5"
                  />
                  <span className="text-[#626772] dark:text-[#9498A6]">
                    <Link href="#" className="text-[#D99532] underline">Kullanıcı Sözleşmesi</Link> ve{" "}
                    <Link href="#" className="text-[#D99532] underline">Gizlilik Politikası</Link>&apos;nı okudum, kabul ediyorum.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <ItemSepetiButton
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={loading}
                  className="w-full"
                >
                  Kayıt Ol ve Başla
                </ItemSepetiButton>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-[#626772] dark:text-[#9498A6]">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="text-[#D99532] font-bold hover:underline">
              Giriş Yap
            </Link>
          </p>
        </main>

        <ItemSepetiFooter />
      </div>
  );
}

export default function RegisterPage() {
  return (
    <ItemSepetiThemeProvider>
      <RegisterForm />
    </ItemSepetiThemeProvider>
  );
}
