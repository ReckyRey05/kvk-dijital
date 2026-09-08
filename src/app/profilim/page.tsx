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
  Wallet,
  Package,
  ShoppingBag,
  Settings,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useItemSepetiAuth();

  const [tradeUrl, setTradeUrl] = useState(user?.steamTradeUrl || "");
  const [cs2Nick, setCs2Nick] = useState(user?.gameNicknames?.cs2 || "");
  const [metin2Nick, setMetin2Nick] = useState(user?.gameNicknames?.metin2 || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      steamTradeUrl: tradeUrl,
      gameNicknames: {
        cs2: cs2Nick,
        metin2: metin2Nick,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!user) {
    return (
      <ItemSepetiThemeProvider>
        <div className="flex flex-col min-h-screen">
          <ItemSepetiHeader />
          <main className="flex-1 max-w-md w-full mx-auto px-4 py-20 text-center space-y-4">
            <h1 className="text-xl font-bold">Lütfen Giriş Yapın</h1>
            <p className="text-xs text-[#9498A6]">Profilinizi görüntülemek için giriş yapmanız gerekmektedir.</p>
            <Link href="/giris">
              <ItemSepetiButton variant="primary">Giriş Yap</ItemSepetiButton>
            </Link>
          </main>
          <ItemSepetiFooter />
        </div>
      </ItemSepetiThemeProvider>
    );
  }

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div className="p-6 sm:p-8 rounded-[16px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#D99532]/15 border-2 border-[#D99532] flex items-center justify-center text-xl font-black text-[#D99532]">
                {user.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-inherit">
                    {user.displayName}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Onaylı Üye</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#D99532]/15 text-[#D99532]">
                    {user.role === "seller" ? "Satıcı Mağazası" : user.role === "admin" ? "Yönetici" : "Alıcı"}
                  </span>
                </div>
                <p className="text-xs text-[#9498A6]">{user.email} &bull; Tel: {user.phone || "Kayıtlı değil"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-black/5 dark:border-white/5">
              <div className="text-right">
                <span className="text-[11px] block font-semibold text-[#9498A6]">Cüzdan Bakiyesi</span>
                <span className="text-lg sm:text-xl font-black text-inherit">
                  {user.balance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                </span>
              </div>
              <Link href="/bakiye-yukle">
                <ItemSepetiButton variant="primary" size="sm">
                  + Bakiye Yükle
                </ItemSepetiButton>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/ilanlarim"
              className="p-4 rounded-[12px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-colors group flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-inherit">İlanlarım</span>
                <Package className="w-4 h-4 text-[#D99532]" />
              </div>
              <span className="text-[11px] text-[#9498A6]">Satıştaki ürünleri yönet &rarr;</span>
            </Link>

            <Link
              href="/ilan-ver"
              className="p-4 rounded-[12px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-colors group flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D99532]">+ Yeni İlan Ver</span>
                <PlusCircle className="w-4 h-4 text-[#D99532]" />
              </div>
              <span className="text-[11px] text-[#9498A6]">Hemen ilan oluştur &rarr;</span>
            </Link>

            <Link
              href="/sepet"
              className="p-4 rounded-[12px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-colors group flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-inherit">Siparişlerim</span>
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-[11px] text-[#9498A6]">Satın aldıklarım &rarr;</span>
            </Link>

            <Link
              href="/bakiye-yukle"
              className="p-4 rounded-[12px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-colors group flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-inherit">Havale Bildirimi</span>
                <Wallet className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[11px] text-[#9498A6]">Banka dekontu bildir &rarr;</span>
            </Link>
          </div>

          <div className="p-6 sm:p-8 rounded-[16px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-4 border-black/5 dark:border-white/5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-inherit flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#D99532]" />
                  <span>Oyun İçi Teslimat Ayarları</span>
                </h2>
                <p className="text-xs text-[#9498A6]">
                  Satın aldığınız veya sattığınız skin/itemlerin anında teslim edilebilmesi için takas linkinizi kaydedin.
                </p>
              </div>

              {savedSuccess && (
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kaydedildi!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wide text-inherit">
                    Steam Trade Offer URL (CS2 İlanları İçin)
                  </label>
                  <a
                    href="https://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#D99532] hover:underline flex items-center gap-1"
                  >
                    <span>Steam&apos;den Bul</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="url"
                  placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
                  value={tradeUrl}
                  onChange={(e) => setTradeUrl(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[8px] text-xs sm:text-sm bg-black/5 dark:bg-black/30 border border-[#DCDDE1] dark:border-[#282C3A] text-inherit focus:ring-2 focus:ring-[#D99532] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ItemSepetiInput
                  label="Metin2 Karakter Adı & Köy"
                  placeholder="Örn: DragonKnight - Mavi Bayrak"
                  value={metin2Nick}
                  onChange={(e) => setMetin2Nick(e.target.value)}
                />
                <ItemSepetiInput
                  label="CS2 / Valorant Oyuncu Adı"
                  placeholder="Örn: Dragon#TR1"
                  value={cs2Nick}
                  onChange={(e) => setCs2Nick(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Oturumu Kapat
                </button>

                <ItemSepetiButton variant="primary" type="submit" size="md">
                  Ayarları Kaydet
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
