"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { useRestaurantStore } from "@/lib/restaurant/store";
import MenuManager from "@/components/restaurant/admin/MenuManager";
import QrGenerator from "@/components/restaurant/admin/QrGenerator";
import AnalyticsDashboard from "@/components/restaurant/admin/AnalyticsDashboard";
import RecipeManager from "@/components/restaurant/admin/RecipeManager";
import ComplaintsLog from "@/components/restaurant/admin/ComplaintsLog";
import PlatformManager from "@/components/restaurant/admin/PlatformManager";
import StaffManager from "@/components/restaurant/admin/StaffManager";
import TableManager from "@/components/restaurant/admin/TableManager";
import BossAuthModal from "@/components/restaurant/admin/BossAuthModal";
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
  MessageSquareWarning,
  Layers,
  Users,
  Lock,
  LogOut,
  LayoutGrid,
  Gamepad2,
  Gift,
  Music2,
  Calculator,
  Bell,
  CreditCard,
  Star,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
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
    restaurant,
    orders,
    menuItems,
    categories,
    tables,
    managerAlerts,
    bossSecurity,
    toggleItemAvailability,
    updateItemPrice,
    setCampaignDiscount,
    cancelCampaignDiscount,
    updateRestaurantSettings,
    toggleFeature,
  } = useRestaurantStore();

  // Boss Authentication State
  const [isBossAuthenticated, setIsBossAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("cg_boss_auth");
      if (stored === "true") {
        setIsBossAuthenticated(true);
      }
    }
  }, []);

  const handleLockScreen = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("cg_boss_auth");
    }
    setIsBossAuthenticated(false);
  };

  const [activeTab, setActiveTab] = useState<"MENU" | "TABLES" | "RECIPES" | "STAFF" | "COMPLAINTS" | "PLATFORMS" | "QR" | "ANALYTICS" | "SETTINGS">("MENU");

  // Restaurant Settings State
  const [orderMode, setOrderMode] = useState(restaurant.settings.orderMode);
  const [paymentMode, setPaymentMode] = useState(restaurant.settings.paymentMode);
  const [sessionTimeout, setSessionTimeout] = useState(restaurant.settings.sessionTimeoutMinutes);
  const [posType, setPosType] = useState(restaurant.settings.posIntegrationType);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(restaurant.settings.googleReviewUrl || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync settings when restaurant changes
  useEffect(() => {
    setOrderMode(restaurant.settings.orderMode);
    setPaymentMode(restaurant.settings.paymentMode);
    setSessionTimeout(restaurant.settings.sessionTimeoutMinutes);
    setPosType(restaurant.settings.posIntegrationType);
    setGoogleReviewUrl(restaurant.settings.googleReviewUrl || "");
  }, [restaurant]);

  const handleSaveSettings = () => {
    updateRestaurantSettings({
      orderMode,
      paymentMode,
      sessionTimeoutMinutes: Number(sessionTimeout) || 15,
      posIntegrationType: posType,
      googleReviewUrl: googleReviewUrl.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#080d0d] border-b border-white/10 px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-extrabold border border-white/10 shrink-0">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white">{DEMO_RESTAURANT.name}</h1>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-foreground/70 font-semibold shrink-0">
                Yönetim
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-foreground/50 hidden xs:block">Menü, Reçete Maliyeti, Masa QR ve Entegrasyon Paneli</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto sleek-scrollbar pb-1 sm:pb-0">
          <button
            onClick={handleLockScreen}
            className="px-3 py-1.5 sm:py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Boss Panelini Kilitle"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kilitle</span>
          </button>

          <Link
            href={`/restoran/${restaurantSlug}/kasa`}
            className="px-3 py-1.5 sm:py-2 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-bold text-accent flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Kasa Paneli</span>
          </Link>

          <Link
            href={`/restoran/${restaurantSlug}/mutfak`}
            className="px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Mutfak</span>
          </Link>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="px-3 sm:px-6 py-2.5 bg-white/[0.01] border-b border-white/5 flex items-center gap-2 overflow-x-auto sleek-scrollbar">
        <button
          onClick={() => setActiveTab("MENU")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "MENU"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Menü & Stok</span>
        </button>

        <button
          onClick={() => setActiveTab("TABLES")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "TABLES"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Masa & Bölüm ({tables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("RECIPES")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "RECIPES"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Reçete & Maliyet</span>
        </button>

        <button
          onClick={() => setActiveTab("STAFF")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "STAFF"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Personel & Yetki</span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLAINTS")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "COMPLAINTS"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <MessageSquareWarning className="w-3.5 h-3.5" />
          <span>Şikayet Günlüğü</span>
          {managerAlerts.filter((a) => !a.isResolved).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-black animate-pulse">
              {managerAlerts.filter((a) => !a.isResolved).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("PLATFORMS")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "PLATFORMS"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Platform & E-Fatura</span>
        </button>

        <button
          onClick={() => setActiveTab("QR")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "QR"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Masa QR ({tables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ANALYTICS")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "ANALYTICS"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Ciro & Z Raporu</span>
        </button>

        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "SETTINGS"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Ayarlar</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
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

        {activeTab === "TABLES" && (
          <TableManager
            restaurant={restaurant}
            tables={tables}
            onSelectTableForQr={() => setActiveTab("QR")}
          />
        )}

        {activeTab === "RECIPES" && (
          <RecipeManager menuItems={menuItems} categories={categories} />
        )}

        {activeTab === "STAFF" && (
          <StaffManager />
        )}

        {activeTab === "COMPLAINTS" && (
          <ComplaintsLog alerts={managerAlerts} />
        )}

        {activeTab === "PLATFORMS" && (
          <PlatformManager />
        )}

        {activeTab === "QR" && (
          <QrGenerator restaurant={restaurant} tables={tables} />
        )}

        {activeTab === "ANALYTICS" && (
          <AnalyticsDashboard
            orders={orders}
            tables={tables}
            restaurantName={restaurant.name}
          />
        )}

        {activeTab === "SETTINGS" && (
          <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 bg-[#0c1212] border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">Restoran Çalışma Modları & Güvenlik</h3>
              <p className="text-xs text-foreground/60 mt-1">
                İşletme türünüze göre sipariş, ödeme ve güvenlik kurallarını özelleştirin.
              </p>
            </div>

            {/* Order Mode Setting */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-wider text-white block">
                Sipariş İletim Modu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setOrderMode("WAITER_CONFIRMATION")}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
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
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
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
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  min={5}
                  max={60}
                  className="w-20 sm:w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-accent"
                />
                <span className="text-[11px] sm:text-xs text-foreground/60 font-medium">
                  dakika sonra işlem yapılmazsa masadaki oturum düşer (Varsayılan: 15 Dk)
                </span>
              </div>
            </div>

            {/* QR Menü Özellik Açma / Kapatma (Feature Toggles) */}
            <div className="space-y-3 pt-5 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>QR Menü & Müşteri Özellikleri (Aç / Kapat)</span>
                  </label>
                  <p className="text-[11px] text-foreground/50 mt-0.5">
                    Müşterilerin masada görebileceği modülleri anında açıp kapatabilirsiniz.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Feature 1: Oyun & İddia */}
                <div
                  onClick={() => toggleFeature("enableTableGames")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    restaurant.settings.features?.enableTableGames !== false
                      ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs">Masa Oyunları & İddia</h5>
                      <p className="text-[10px] text-foreground/60">Zar, çark ve refleks yarışması</p>
                    </div>
                  </div>
                  {restaurant.settings.features?.enableTableGames !== false ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">Açık</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-foreground/50 text-[10px] font-bold uppercase">Kapalı</span>
                  )}
                </div>

                {/* Feature 2: İkram Çarkı */}
                <div
                  onClick={() => toggleFeature("enableSpinWheel")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    restaurant.settings.features?.enableSpinWheel !== false
                      ? "bg-amber-500/10 border-amber-500/30 text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs">İkram Çarkıfeleği</h5>
                      <p className="text-[10px] text-foreground/60">Sadakat kuponu ve indirim çarkı</p>
                    </div>
                  </div>
                  {restaurant.settings.features?.enableSpinWheel !== false ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">Açık</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-foreground/50 text-[10px] font-bold uppercase">Kapalı</span>
                  )}
                </div>

                {/* Feature 3: Dijital Jukebox */}
                <div
                  onClick={() => toggleFeature("enableJukebox")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    restaurant.settings.features?.enableJukebox !== false
                      ? "bg-purple-500/10 border-purple-500/30 text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <Music2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs">Dijital Müzik Kutusu</h5>
                      <p className="text-[10px] text-foreground/60">Masadan şarkı oylama/isteme</p>
                    </div>
                  </div>
                  {restaurant.settings.features?.enableJukebox !== false ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase">Açık</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-foreground/50 text-[10px] font-bold uppercase">Kapalı</span>
                  )}
                </div>

                {/* Feature 4: Masada Hesap Bölüştürme */}
                <div
                  onClick={() => toggleFeature("enableSplitBill")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    restaurant.settings.features?.enableSplitBill !== false
                      ? "bg-blue-500/10 border-blue-500/30 text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs">Hesap Bölüştürücü</h5>
                      <p className="text-[10px] text-foreground/60">Kişi başı eşit veya ürün bazlı pay</p>
                    </div>
                  </div>
                  {restaurant.settings.features?.enableSplitBill !== false ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase">Açık</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-foreground/50 text-[10px] font-bold uppercase">Kapalı</span>
                  )}
                </div>

                {/* Feature 5: Garson Çağırma */}
                <div
                  onClick={() => toggleFeature("enableWaiterCall")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    restaurant.settings.features?.enableWaiterCall !== false
                      ? "bg-rose-500/10 border-rose-500/30 text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs">Garson Çağrı Sistemi</h5>
                      <p className="text-[10px] text-foreground/60">Hesap, su, kül tablası talepleri</p>
                    </div>
                  </div>
                  {restaurant.settings.features?.enableWaiterCall !== false ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase">Açık</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-foreground/50 text-[10px] font-bold uppercase">Kapalı</span>
                  )}
                </div>

                {/* Feature 6: Masada Online Ödeme */}
                <div
                  onClick={() => toggleFeature("enableOnlinePayment")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    restaurant.settings.features?.enableOnlinePayment !== false
                      ? "bg-teal-500/10 border-teal-500/30 text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs">Masada Online Ödeme</h5>
                      <p className="text-[10px] text-foreground/60">3D Secure ile anında ödeme</p>
                    </div>
                  </div>
                  {restaurant.settings.features?.enableOnlinePayment !== false ? (
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase">Açık</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-foreground/50 text-[10px] font-bold uppercase">Kapalı</span>
                  )}
                </div>

                {/* Feature 7: Google Review Booster */}
                <div
                  onClick={() => toggleFeature("enableGoogleReview")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    restaurant.settings.features?.enableGoogleReview !== false
                      ? "bg-yellow-500/10 border-yellow-500/30 text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs">Google Puanlama Yönlendirme</h5>
                      <p className="text-[10px] text-foreground/60">5 yıldızda Haritalara yönlendir</p>
                    </div>
                  </div>
                  {restaurant.settings.features?.enableGoogleReview !== false ? (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-black uppercase">Açık</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-foreground/50 text-[10px] font-bold uppercase">Kapalı</span>
                  )}
                </div>

                {/* Feature 8: Müdüre Acil Şikayet */}
                <div
                  onClick={() => toggleFeature("enableManagerAlert")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    restaurant.settings.features?.enableManagerAlert !== false
                      ? "bg-red-500/10 border-red-500/30 text-white"
                      : "bg-white/[0.02] border-white/10 text-foreground/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs">Müdüre Acil Şikayet & Talep</h5>
                      <p className="text-[10px] text-foreground/60">Yönetici paneline anlık kırmızı alarm</p>
                    </div>
                  </div>
                  {restaurant.settings.features?.enableManagerAlert !== false ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black uppercase">Açık</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-foreground/50 text-[10px] font-bold uppercase">Kapalı</span>
                  )}
                </div>
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

      {/* Boss PIN & 2FA Gate Modal */}
      <BossAuthModal
        isOpen={!isBossAuthenticated}
        bossSecurity={bossSecurity}
        onAuthenticated={() => setIsBossAuthenticated(true)}
      />
    </div>
  );
}
