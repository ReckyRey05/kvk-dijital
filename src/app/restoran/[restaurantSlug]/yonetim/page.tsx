"use client";

import { useState, use } from "react";
import Link from "next/link";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { useRestaurantStore } from "@/lib/restaurant/store";
import MenuManager from "@/components/restaurant/admin/MenuManager";
import QrGenerator from "@/components/restaurant/admin/QrGenerator";
import AnalyticsDashboard from "@/components/restaurant/admin/AnalyticsDashboard";
import RecipeManager from "@/components/restaurant/admin/RecipeManager";
import {
  Store,
  ChefHat,
  UtensilsCrossed,
  QrCode,
  Sliders,
  Settings,
  ShieldCheck,
  Zap,
  Globe,
  Save,
  TrendingUp,
  Scale,
} from "lucide-react";

interface YonetimPageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
}

export default function RestaurantYonetimPage({ params }: YonetimPageProps) {
  const resolvedParams = use(params);
  const { restaurantSlug } = resolvedParams;

  const {
    orders,
    menuItems,
    categories,
    tables,
    toggleItemAvailability,
    updateItemPrice,
    setCampaignDiscount,
    cancelCampaignDiscount,
  } = useRestaurantStore();

  const [activeTab, setActiveTab] = useState<"MENU" | "RECIPES" | "QR" | "ANALYTICS" | "SETTINGS">("MENU");

  // Restaurant Settings State
  const [orderMode, setOrderMode] = useState(DEMO_RESTAURANT.settings.orderMode);
  const [paymentMode, setPaymentMode] = useState(DEMO_RESTAURANT.settings.paymentMode);
  const [sessionTimeout, setSessionTimeout] = useState(DEMO_RESTAURANT.settings.sessionTimeoutMinutes);
  const [posType, setPosType] = useState(DEMO_RESTAURANT.settings.posIntegrationType);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#080d0d] border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-extrabold border border-white/10">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">{DEMO_RESTAURANT.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-foreground/70 font-semibold">
                Yönetim & Yapılandırma
              </span>
            </div>
            <p className="text-xs text-foreground/50">Menü, Reçete Maliyeti, Masa QR ve Entegrasyon Paneli</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/restoran/${restaurantSlug}/kasa`}
            className="px-3.5 py-2 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-bold text-accent flex items-center gap-2 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Kasa Paneline Dön</span>
          </Link>

          <Link
            href={`/restoran/${restaurantSlug}/mutfak`}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-2 transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            <span>Mutfak Ekranı</span>
          </Link>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="px-6 py-3 bg-white/[0.01] border-b border-white/5 flex items-center gap-2 overflow-x-auto sleek-scrollbar">
        <button
          onClick={() => setActiveTab("MENU")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "MENU"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Menü & Canlı Stok</span>
        </button>

        <button
          onClick={() => setActiveTab("RECIPES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "RECIPES"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Reçete, Maliyet & Kâr Analizi</span>
        </button>

        <button
          onClick={() => setActiveTab("QR")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "QR"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Masa QR Kodları ({tables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ANALYTICS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ANALYTICS"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ciro & Z Raporu</span>
        </button>

        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "SETTINGS"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Restoran & POS Ayarları</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === "MENU" && (
          <MenuManager
            categories={categories}
            menuItems={menuItems}
            onToggleAvailability={toggleItemAvailability}
            onUpdatePrice={updateItemPrice}
            onSetCampaignDiscount={setCampaignDiscount}
            onCancelCampaignDiscount={cancelCampaignDiscount}
          />
        )}

        {activeTab === "RECIPES" && (
          <RecipeManager menuItems={menuItems} categories={categories} />
        )}

        {activeTab === "QR" && (
          <QrGenerator restaurant={DEMO_RESTAURANT} tables={tables} />
        )}

        {activeTab === "ANALYTICS" && (
          <AnalyticsDashboard
            orders={orders}
            tables={tables}
            restaurantName={DEMO_RESTAURANT.name}
          />
        )}

        {activeTab === "SETTINGS" && (
          <div className="max-w-2xl mx-auto space-y-6 bg-[#0c1212] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
            <div>
              <h3 className="text-lg font-extrabold text-white">Restoran Çalışma Modları & Güvenlik</h3>
              <p className="text-xs text-foreground/60 mt-1">
                İşletme türünüze göre sipariş, ödeme ve güvenlik kurallarını özelleştirin.
              </p>
            </div>

            {/* Order Mode Setting */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-wider text-white block">
                Sipariş İletim Modu
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setOrderMode("WAITER_CONFIRMATION")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    orderMode === "WAITER_CONFIRMATION"
                      ? "bg-accent/15 border-accent text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/60"
                  }`}
                >
                  <h4 className="font-bold text-xs">Garson / Kasa Onaylı (Önerilen)</h4>
                  <p className="text-[10px] opacity-75 mt-1 leading-relaxed">
                    Sipariş önce kasaya düşer. Garson masada müşteri olduğunu onaylayınca mutfağa gider.
                  </p>
                </div>

                <div
                  onClick={() => setOrderMode("DIRECT_KITCHEN")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    orderMode === "DIRECT_KITCHEN"
                      ? "bg-accent/15 border-accent text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/60"
                  }`}
                >
                  <h4 className="font-bold text-xs">Direkt Mutfağa (Fast Food)</h4>
                  <p className="text-[10px] opacity-75 mt-1 leading-relaxed">
                    QR'dan verilen sipariş teyitsiz doğrudan mutfak ekranına ve fiş yazıcısına basılır.
                  </p>
                </div>
              </div>
            </div>

            {/* Session Timeout Setting */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-wider text-white block">
                QR Oturum Zaman Aşımı (Güvenlik Koruması)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  min={5}
                  max={60}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
                <span className="text-xs text-foreground/60 font-medium">
                  dakika sonra işlem yapılmazsa masadaki oturum düşer (Varsayılan: 15 Dk)
                </span>
              </div>
            </div>

            {/* POS Integration Bridge Setting */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-wider text-white block">
                POS Entegrasyon Modu
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div
                  onClick={() => setPosType("STANDALONE")}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    posType === "STANDALONE"
                      ? "bg-accent/15 border-accent text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/60"
                  }`}
                >
                  <h4 className="font-bold text-xs">Dahili POS</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Yerleşik Kasa/KDS</p>
                </div>

                <div
                  onClick={() => setPosType("CLOUD_WEBHOOK")}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    posType === "CLOUD_WEBHOOK"
                      ? "bg-accent/15 border-accent text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/60"
                  }`}
                >
                  <h4 className="font-bold text-xs">Bulut POS Webhook</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Adisyo / Simpra</p>
                </div>

                <div
                  onClick={() => setPosType("LOCAL_BRIDGE")}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    posType === "LOCAL_BRIDGE"
                      ? "bg-accent/15 border-accent text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/60"
                  }`}
                >
                  <h4 className="font-bold text-xs">Yerel Ajan Köprüsü</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">SambaPOS / Windows</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-bold text-green-400">
                  Ayarlar başarıyla kaydedildi.
                </span>
              ) : (
                <span />
              )}

              <button
                onClick={handleSaveSettings}
                className="py-3 px-6 rounded-xl bg-accent text-black font-extrabold text-xs flex items-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Ayarları Kaydet</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
