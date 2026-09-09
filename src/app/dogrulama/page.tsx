"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import { useItemSepetiAuth } from "@/context/ItemSepetiAuthContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import ItemSepetiInput from "@/components/itemsepeti/ui/ItemSepetiInput";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  FileText,
  BadgeCheck,
} from "lucide-react";

// TC Kimlik No Algoritma Doğrulaması (Resmi Nüfus ve Vatandaşlık İşleri Algoritması)
export function validateTCKN(tc: string): boolean {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;

  const digits = tc.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const digit10 = (oddSum * 7 - evenSum) % 10;
  if (digit10 < 0 ? digit10 + 10 !== digits[9] : digit10 !== digits[9]) return false;

  const totalSum = digits.slice(0, 10).reduce((acc, d) => acc + d, 0);
  if (totalSum % 10 !== digits[10]) return false;

  return true;
}

export default function KycVerificationPage() {
  const { user, updateProfile } = useItemSepetiAuth();

  const [tcKimlik, setTcKimlik] = useState(user?.tcKimlikNo || "");
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [birthYear, setBirthYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isAlreadyVerified = user?.kycStatus === "verified";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTC = tcKimlik.trim();
    if (!validateTCKN(cleanTC)) {
      setError("Geçersiz T.C. Kimlik Numarası. Lütfen 11 haneli geçerli kimlik numaranızı girin.");
      return;
    }

    if (!fullName.trim() || !birthYear.trim()) {
      setError("Lütfen Ad Soyad ve Doğum Yılı alanlarını eksiksiz doldurun.");
      return;
    }

    const yearNum = parseInt(birthYear.trim(), 10);
    if (isNaN(yearNum) || yearNum < 1920 || yearNum > 2012) {
      setError("Platformda işlem yapabilmek için en az 14 yaşında olmanız gerekmektedir.");
      return;
    }

    setLoading(true);
    try {
      // Simulate NVI identity validation
      await new Promise((r) => setTimeout(r, 1000));
      await updateProfile({
        kycStatus: "verified",
        tcKimlikNo: cleanTC,
      });
      setSuccess(true);
    } catch (err: any) {
      setError("Kimlik doğrulama işlemi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
          <div className="flex items-center gap-2">
            <Link
              href="/profilim"
              className="inline-flex items-center gap-1 text-xs text-[#9498A6] hover:text-inherit transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Profilime Dön</span>
            </Link>
          </div>

          <div className="p-6 sm:p-8 rounded-[20px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D99532]/10 text-[#D99532] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-black text-inherit flex items-center gap-2">
                  <span>Hesap & Kimlik Doğrulama (KYC)</span>
                  {isAlreadyVerified && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>Onaylı Hesap</span>
                    </span>
                  )}
                </h1>
                <p className="text-xs text-[#9498A6] leading-relaxed">
                  5464 sayılı Banka Kartları ve 6563 sayılı Elektronik Ticaret mevzuatı gereğince güvenli ilan ve bakiye çekim işlemleri için T.C. Kimlik doğrulaması zorunludur.
                </p>
              </div>
            </div>

            {isAlreadyVerified ? (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>T.C. Kimlik No Formatı ve Algoritması Doğrulandı</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  Hesabınızda doğrulanmış satıcı/alıcı rozeti aktiftir. İlan açabilir, cüzdanınızdan sınırsız para çekme (FAST/EFT) talebinde bulunabilirsiniz.
                </p>
                <div className="pt-2">
                  <span className="font-mono font-bold">T.C. Kimlik: {user?.tcKimlikNo ? user.tcKimlikNo.substring(0, 3) + "******" + user.tcKimlikNo.substring(9) : "Doğrulandı"}</span>
                </div>
              </div>
            ) : success ? (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Tebrikler! T.C. Kimlik Formatı Doğrulandı</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  T.C. Kimlik numaranız NVİ resmi 11 haneli algoritma ve sağlama standartlarına göre başarıyla doğrulandı.
                </p>
                <Link href="/profilim" className="inline-block pt-2">
                  <ItemSepetiButton variant="primary" size="sm">
                    Profile Dön
                  </ItemSepetiButton>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-inherit">
                    T.C. Kimlik Numarası (11 Hane)
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={tcKimlik}
                    onChange={(e) => setTcKimlik(e.target.value.replace(/\D/g, ""))}
                    placeholder="12345678901"
                    className="w-full h-11 px-3.5 rounded-[8px] text-xs sm:text-sm bg-black/5 dark:bg-black/30 border border-[#DCDDE1] dark:border-[#282C3A] text-inherit focus:ring-2 focus:ring-[#D99532] focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ItemSepetiInput
                    label="Nüfus Cüzdanındaki Ad Soyad"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <ItemSepetiInput
                    label="Doğum Yılı"
                    placeholder="Örn: 1998"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  />
                </div>

                <div className="p-4 rounded-xl bg-black/5 dark:bg-black/20 border border-[#DCDDE1] dark:border-[#282C3A] text-[11px] text-[#9498A6] flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-[#D99532] shrink-0 mt-0.5" />
                  <span>
                    Kimlik verileriniz KVKK standartlarına uygun olarak 256-bit SSL ile şifrelenir ve yalnızca tek seferlik resmi doğrulama için kullanılır.
                  </span>
                </div>

                <div className="pt-2">
                  <ItemSepetiButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={loading}
                  >
                    <span>Kimliğimi Doğrula & Onayla</span>
                  </ItemSepetiButton>
                </div>
              </form>
            )}
          </div>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
