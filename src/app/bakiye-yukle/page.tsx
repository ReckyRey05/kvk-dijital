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
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Wallet,
} from "lucide-react";

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  logoColor: string;
}

const APPROVED_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "ziraat",
    bankName: "Ziraat Bankası",
    accountHolder: "İtemSepeti Bilişim ve Pazaryeri Ltd. Şti.",
    iban: "TR12 0001 0090 1234 5678 9001",
    logoColor: "#E11D48",
  },
  {
    id: "garanti",
    bankName: "Garanti BBVA",
    accountHolder: "İtemSepeti Bilişim ve Pazaryeri Ltd. Şti.",
    iban: "TR62 0006 2000 1234 5678 9002",
    logoColor: "#059669",
  },
  {
    id: "isbank",
    bankName: "Türkiye İş Bankası",
    accountHolder: "İtemSepeti Bilişim ve Pazaryeri Ltd. Şti.",
    iban: "TR45 0006 4000 1234 5678 9003",
    logoColor: "#2563EB",
  },
  {
    id: "enpara",
    bankName: "Enpara.com / QNB",
    accountHolder: "İtemSepeti Bilişim ve Pazaryeri Ltd. Şti.",
    iban: "TR88 0011 1000 1234 5678 9004",
    logoColor: "#7C3AED",
  },
  {
    id: "papara",
    bankName: "Papara",
    accountHolder: "İtemSepeti Bilişim",
    iban: "Papara No: 1982736450",
    logoColor: "#0D9488",
  },
];

export default function DepositPage() {
  const { user } = useItemSepetiAuth();

  const [selectedBankId, setSelectedBankId] = useState(APPROVED_BANK_ACCOUNTS[0].id);
  const [senderFullName, setSenderFullName] = useState(user?.displayName || "");
  const [transferAmount, setTransferAmount] = useState("");
  const [transactionRef, setTransactionRef] = useState("");

  const [copiedIban, setCopiedIban] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedBank = APPROVED_BANK_ACCOUNTS.find((b) => b.id === selectedBankId);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIban(id);
    setTimeout(() => setCopiedIban(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = Number(transferAmount);
    if (!amount || amount <= 0) {
      setErrorMessage("Lütfen geçerli bir tutar giriniz.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(
        `Sayın ${senderFullName}, ${amount.toLocaleString("tr-TR")} TL tutarındaki havale bildiriminiz alındı! Finans ekibimiz dekontunuzu inceledikten sonra bakiyeniz 5-15 dakika içinde hesabınıza yüklenecektir.`
      );
      setTransferAmount("");
      setTransactionRef("");
    }, 1000);
  };

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
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
              <Wallet className="w-6 h-6 text-[#D99532]" />
              <h1 className="text-2xl font-black tracking-tight text-inherit">
                Banka Havalesi & EFT ile Bakiye Yükle
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#9498A6]">
              Aşağıdaki resmi şirket hesaplarımıza FAST / Havale gönderin ve bildirim formunu doldurun.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#9498A6]">
                1. Havale / EFT Yapılacak Hesaplar
              </h2>

              <div className="space-y-3">
                {APPROVED_BANK_ACCOUNTS.map((bank) => {
                  const isSelected = bank.id === selectedBankId;
                  return (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`p-4 rounded-[12px] border transition-all cursor-pointer select-none ${
                        isSelected
                          ? "border-[#D99532] bg-[#D99532]/5 shadow-xs"
                          : "border-[#DCDDE1] dark:border-[#282C3A] bg-white dark:bg-[#161921] hover:border-[#D99532]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: bank.logoColor }}
                          ></span>
                          <span className="font-bold text-sm text-inherit">{bank.bankName}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          7/24 FAST Aktif
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#9498A6] block">Alıcı Adı</span>
                          <strong className="text-inherit">{bank.accountHolder}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(bank.iban, bank.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#D99532] hover:underline cursor-pointer"
                        >
                          <span>{bank.iban}</span>
                          {copiedIban === bank.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-[12px] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <strong>Önemli Bilgilendirme:</strong>
                <p>
                  Havale/EFT yaparken açıklama kısmına kayıtlı <strong>Ad Soyad</strong> veya <strong>E-Posta</strong> bilginizi yazmayı unutmayınız. Farklı kişinin hesabından gönderilen havaleler güvenlik gereği iade edilir.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-6 rounded-[16px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-5 shadow-xs sticky top-24">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-inherit">2. Ödeme Bildirim Formu</h2>
                  <p className="text-xs text-[#9498A6]">
                    Parayı gönderdikten sonra bu formu doldurun.
                  </p>
                </div>

                {successMessage && (
                  <div className="p-3.5 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Bildirim Alındı!</span>
                    </div>
                    <p>{successMessage}</p>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-inherit">Seçilen Banka</label>
                    <div className="w-full h-10 px-3 rounded-[8px] bg-black/5 dark:bg-black/20 border border-[#DCDDE1] dark:border-[#282C3A] text-xs font-bold flex items-center">
                      {selectedBank?.bankName}
                    </div>
                  </div>

                  <ItemSepetiInput
                    label="Gönderen Ad Soyad (Hesap Sahibi)"
                    placeholder="Banka hesabınızdaki ad soyad"
                    value={senderFullName}
                    onChange={(e) => setSenderFullName(e.target.value)}
                    required
                  />

                  <ItemSepetiInput
                    label="Gönderilen Tutar (TL)"
                    type="number"
                    placeholder="Örn: 250"
                    min="10"
                    step="any"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    required
                  />

                  <ItemSepetiInput
                    label="Dekont No / Referans (Opsiyonel)"
                    placeholder="Örn: 102938475"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                  />

                  <div className="pt-2">
                    <ItemSepetiButton
                      variant="primary"
                      size="lg"
                      type="submit"
                      isLoading={loading}
                      className="w-full"
                    >
                      Ödeme Bildirimini Gönder
                    </ItemSepetiButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
