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
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Wallet,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function PayoutRequestPage() {
  const { user, updateProfile } = useItemSepetiAuth();

  const [iban, setIban] = useState("");
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [bankName, setBankName] = useState("Ziraat Bankası");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableBalance = user?.balance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount < 100) {
      setErrorMsg("Minimum para çekme tutarı 100 TL'dir.");
      return;
    }

    if (withdrawAmount > availableBalance) {
      setErrorMsg("Çekmek istediğiniz tutar mevcut bakiyenizden fazladır.");
      return;
    }

    if (!iban.trim().startsWith("TR") || iban.replace(/\s/g, "").length < 24) {
      setErrorMsg("Lütfen geçerli bir TR IBAN numarası giriniz.");
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      const newBal = Number((availableBalance - withdrawAmount).toFixed(2));
      await updateProfile({ balance: newBal });
      setSuccessMsg(
        `${withdrawAmount.toLocaleString("tr-TR")} TL tutarındaki para çekme talebiniz alındı! ${bankName} (${iban}) hesabınıza mesai saatleri içinde FAST / EFT ile aktarılacaktır.`
      );
      setAmount("");
    }, 1000);
  };

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex items-center gap-2">
            <Link
              href="/profilim"
              className="inline-flex items-center gap-1 text-xs text-[#9498A6] hover:text-inherit transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Profilime Dön</span>
            </Link>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#D99532]" />
              <h1 className="text-2xl font-black tracking-tight text-inherit">
                Banka Hesabına Para Çek (Payout)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#9498A6]">
              Satışlarınızdan elde ettiğiniz kazancı dilediğiniz banka hesabınıza güvenle çekin.
            </p>
          </div>

          {/* BALANCE CARD */}
          <div className="p-6 rounded-[16px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs font-semibold text-[#9498A6] block">Çekilebilir Net Bakiye</span>
              <span className="text-2xl sm:text-3xl font-black text-inherit">
                {availableBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
              </span>
            </div>
            <span className="text-xs text-[#9498A6] flex items-center gap-1">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Ortalama Transfer: 15-30 Dakika (FAST)</span>
            </span>
          </div>

          {successMsg && (
            <div className="p-4 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Talebiniz Alındı!</span>
              </div>
              <p>{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FORM */}
          <div className="p-6 sm:p-8 rounded-[16px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-5 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ItemSepetiInput
                  label="Hesap Sahibi Adı Soyadı"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  hint="Banka hesabındaki isimle İtemSepeti adınız eşleşmelidir."
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-inherit">Banka Seçimi</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full h-11 px-3 rounded-[8px] text-xs sm:text-sm bg-black/5 dark:bg-black/20 border border-[#DCDDE1] dark:border-[#282C3A] text-inherit focus:ring-1 focus:ring-[#D99532] focus:outline-none"
                  >
                    <option value="Ziraat Bankası">Ziraat Bankası</option>
                    <option value="Garanti BBVA">Garanti BBVA</option>
                    <option value="Türkiye İş Bankası">Türkiye İş Bankası</option>
                    <option value="Yapı Kredi">Yapı Kredi</option>
                    <option value="Akbank">Akbank</option>
                    <option value="Enpara.com / QNB">Enpara.com / QNB</option>
                    <option value="Papara">Papara</option>
                  </select>
                </div>
              </div>

              <ItemSepetiInput
                label="IBAN Numarası"
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase())}
                required
              />

              <ItemSepetiInput
                label="Çekilecek Tutar (TL)"
                type="number"
                placeholder="Örn: 500"
                min="100"
                max={availableBalance}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                hint="Minimum çekim tutarı 100 TL'dir."
              />

              <div className="pt-2">
                <ItemSepetiButton
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={loading}
                  className="w-full"
                  disabled={availableBalance < 100}
                >
                  Para Çekme Talebini Onayla
                </ItemSepetiButton>
              </div>
            </form>
          </div>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
