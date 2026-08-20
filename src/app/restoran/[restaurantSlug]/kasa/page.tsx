"use client";

import { useState, use } from "react";
import Link from "next/link";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { useRestaurantStore } from "@/lib/restaurant/store";
import TableGrid from "@/components/restaurant/pos/TableGrid";
import OrderApprovalModal from "@/components/restaurant/pos/OrderApprovalModal";
import BillManager from "@/components/restaurant/pos/BillManager";
import ZReportModal from "@/components/restaurant/admin/ZReportModal";
import DeliveryHub from "@/components/restaurant/pos/DeliveryHub";
import EFaturaModal from "@/components/restaurant/pos/EFaturaModal";
import { generateZReport } from "@/lib/restaurant/analyticsData";
import {
  Store,
  ChefHat,
  Settings,
  Bell,
  Receipt,
  Users,
  TrendingUp,
  Sparkles,
  RefreshCw,
  QrCode,
  Bike,
  FileCheck2,
  LayoutGrid,
} from "lucide-react";

import { censorProfanity } from "@/lib/restaurant/profanityFilter";

interface KasaPageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
}

export default function KasaPosPage({ params }: KasaPageProps) {
  const resolvedParams = use(params);
  const { restaurantSlug } = resolvedParams;

  const {
    orders,
    tables,
    waiterCalls,
    managerAlerts,
    vouchers,
    deliveryOrders,
    confirmOrder,
    updateOrderStatus,
    resolveWaiterCall,
    resolveManagerAlert,
    closeTableBill,
    transferTable,
  } = useRestaurantStore();

  const [kasaTab, setKasaTab] = useState<"TABLES" | "DELIVERY">("TABLES");
  const [selectedTableId, setSelectedTableId] = useState<string | null>("m-4");
  const [activeSection, setActiveSection] = useState<string>("ALL");
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [isEFaturaOpen, setIsEFaturaOpen] = useState(false);

  // Stats calculation
  const occupiedCount = tables.filter((t) => t.status !== "EMPTY" || t.activeBillTotal > 0).length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING_CONFIRMATION");
  const activeCalls = waiterCalls.filter((c) => c.status === "ACTIVE");
  const unhandledAlerts = managerAlerts.filter((a) => !a.isResolved);
  const activeDeliveryCount = deliveryOrders.filter((o) => o.status === "PENDING" || o.status === "PREPARING").length;
  const totalLiveRevenue = tables.reduce((sum, t) => sum + (t.activeBillTotal || 0), 0);

  const zReportData = generateZReport(orders, tables, DEMO_RESTAURANT.name);

  // Sections
  const sections = ["ALL", ...Array.from(new Set(tables.map((t) => t.section).filter(Boolean)))];

  const filteredTables =
    activeSection === "ALL" ? tables : tables.filter((t) => t.section === activeSection);

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;
  const selectedTableOrders = orders.filter(
    (o) =>
      o.tableId === selectedTableId &&
      o.status !== "COMPLETED" &&
      o.status !== "CANCELLED"
  );

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col">
      {/* Urgent Manager Alerts Banner (Bad Review Shield & VIP) */}
      {unhandledAlerts.length > 0 && (
        <div className="bg-red-950/90 border-b border-red-500/40 px-6 py-2.5 flex items-center justify-between gap-4 animate-fade-in sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-red-300 mr-2">
                ⚠️ MÜDÜR ACİL BİLDİRİMİ ({unhandledAlerts[0].tableNumber}):
              </span>
              <span className="text-white font-medium">{censorProfanity(unhandledAlerts[0].message)}</span>
              {unhandledAlerts[0].rating && (
                <span className="ml-2 px-2 py-0.5 rounded bg-red-900 text-red-200 text-[10px] font-bold">
                  ★ {unhandledAlerts[0].rating}/5 Puan
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => resolveManagerAlert(unhandledAlerts[0].id)}
            className="px-3 py-1 rounded-xl bg-red-500 hover:bg-red-400 text-black font-extrabold text-[11px] transition-colors cursor-pointer shrink-0"
            title="Alarmı Kapat (Kayıt Patron Paneline İletilir)"
          >
            Müdahale Edildi / Alarmı Kapat
          </button>
        </div>
      )}

      {/* Top POS Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#080d0d] border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent text-black flex items-center justify-center font-extrabold shadow-lg shadow-accent/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">{DEMO_RESTAURANT.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">
                Canlı POS Paneli
              </span>
            </div>
            <p className="text-xs text-foreground/50">Masa, Sipariş ve Kasa Takip Terminali</p>
          </div>
        </div>

        {/* Action Links: Z-Report, KDS, Yönetim, QR Test */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsZReportOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-xs font-bold text-green-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Z-Raporu Al</span>
          </button>

          <Link
            href={`/qr/${restaurantSlug}/m-4`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4 text-accent" />
            <span>Masa 4 QR</span>
          </Link>

          <Link
            href={`/restoran/${restaurantSlug}/mutfak`}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-2 transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            <span>Mutfak (KDS)</span>
          </Link>

          <Link
            href={`/restoran/${restaurantSlug}/yonetim`}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground/70 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Yönetim</span>
          </Link>
        </div>
      </header>

      {/* Main Stats Row */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.01] border-b border-white/5">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-foreground/50 block font-medium">Dolu Masalar</span>
            <span className="text-xl font-black text-white">
              {occupiedCount} <span className="text-xs text-foreground/40 font-normal">/ {tables.length}</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-foreground/50 block font-medium">Onay Bekleyen</span>
            <span className={`text-xl font-black ${pendingOrders.length > 0 ? "text-amber-400 animate-pulse" : "text-white"}`}>
              {pendingOrders.length} Sipariş
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-foreground/50 block font-medium">Garson / Hesap</span>
            <span className={`text-xl font-black ${activeCalls.length > 0 ? "text-purple-400 animate-pulse" : "text-white"}`}>
              {activeCalls.length} Çağrı
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-foreground/50 block font-medium">Canlı Açık Adisyon</span>
            <span className="text-xl font-black text-green-400">
              {totalLiveRevenue.toLocaleString("tr-TR")} TL
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* POS Sub-Navigation Mode Switcher */}
      <div className="px-6 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKasaTab("TABLES")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              kasaTab === "TABLES"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Masa Salonu Planı ({tables.length} Masa)</span>
          </button>

          <button
            onClick={() => setKasaTab("DELIVERY")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              kasaTab === "DELIVERY"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Paket Servis & Platform Hub (Getir, Yemeksepeti, Trendyol)</span>
            {activeDeliveryCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black animate-pulse">
                {activeDeliveryCount} Yeni
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setIsEFaturaOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>Hızlı E-Fatura / E-Adisyon</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      {kasaTab === "DELIVERY" ? (
        <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <DeliveryHub orders={deliveryOrders} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side: Table Grid & Section Filters */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {/* Section Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto sleek-scrollbar pb-1">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec || "ALL")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeSection === sec
                      ? "bg-accent text-black shadow-lg shadow-accent/20"
                      : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {sec === "ALL" ? "Tüm Masalar" : sec}
                </button>
              ))}
            </div>

            {/* Table Grid */}
            <TableGrid
              tables={filteredTables}
              waiterCalls={waiterCalls}
              selectedTableId={selectedTableId}
              onSelectTable={(id) => setSelectedTableId(id)}
              onResolveCall={resolveWaiterCall}
            />
          </div>

          {/* Right Side: Selected Table Bill Manager */}
          {selectedTable && (
            <BillManager
              table={selectedTable}
              tableOrders={selectedTableOrders}
              allTables={tables}
              onClose={() => setSelectedTableId(null)}
              onCloseBill={closeTableBill}
              onTransferTable={transferTable}
              onOpenEFatura={() => setIsEFaturaOpen(true)}
            />
          )}
        </div>
      )}

      {/* Order Approval Modal for Incoming QR Orders */}
      <OrderApprovalModal
        pendingOrders={pendingOrders}
        onConfirmOrder={confirmOrder}
        onRejectOrder={(id) => updateOrderStatus(id, "CANCELLED")}
      />

      {/* Daily Z Report Modal */}
      <ZReportModal
        isOpen={isZReportOpen}
        onClose={() => setIsZReportOpen(false)}
        report={zReportData}
      />

      {/* E-Fatura & E-Adisyon Modal */}
      <EFaturaModal
        isOpen={isEFaturaOpen}
        onClose={() => setIsEFaturaOpen(false)}
        tableNumber={selectedTable ? selectedTable.tableNumber : "Hızlı Fatura"}
        totalAmount={selectedTable && selectedTable.activeBillTotal > 0 ? selectedTable.activeBillTotal : 1540}
      />
    </div>
  );
}
