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
  Check,
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
    tableParticipants,
    confirmOrder,
    updateOrderStatus,
    resolveWaiterCall,
    resolveManagerAlert,
    closeTableBill,
    transferTable,
    resetSingleTable,
    resetAllTables,
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
        <div className="bg-red-950/90 border-b border-red-500/40 px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in sticky top-0 z-40">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0 mt-1 sm:mt-0" />
            <div className="text-xs">
              <span className="font-extrabold text-red-300 mr-1.5 inline-block">
                ⚠️ MÜDÜR ACİL BİLDİRİMİ ({unhandledAlerts[0].tableNumber}):
              </span>
              <span className="text-white font-medium">{censorProfanity(unhandledAlerts[0].message)}</span>
              {unhandledAlerts[0].rating && (
                <span className="ml-2 px-2 py-0.5 rounded bg-red-900 text-red-200 text-[10px] font-bold inline-block">
                  ★ {unhandledAlerts[0].rating}/5 Puan
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => resolveManagerAlert(unhandledAlerts[0].id)}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-black font-extrabold text-xs transition-colors cursor-pointer shrink-0 text-center"
            title="Alarmı Kapat (Kayıt Patron Paneline İletilir)"
          >
            Müdahale Edildi / Alarmı Kapat
          </button>
        </div>
      )}

      {/* Active Waiter Calls Queue Banner (Concurrent Preservation) */}
      {activeCalls.length > 0 && (
        <div className="bg-purple-950/80 border-b border-purple-500/40 px-3 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fade-in sticky top-0 z-35">
          <div className="flex items-center gap-2 shrink-0">
            <Bell className="w-4 h-4 text-purple-400 animate-bounce shrink-0" />
            <span className="text-xs font-extrabold text-purple-200">
              AKTİF GARSON ÇAĞRILARI ({activeCalls.length}):
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto sleek-scrollbar pb-1 sm:pb-0">
            {activeCalls.map((call) => (
              <div
                key={call.id}
                className="px-2.5 py-1 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center gap-2 text-xs text-white shrink-0 shadow-sm"
              >
                <span className="font-bold text-amber-300">{call.tableNumber}:</span>
                <span className="text-foreground/90">{call.message || call.type}</span>
                <button
                  onClick={() => resolveWaiterCall(call.id)}
                  className="p-1 rounded-lg bg-green-500/20 hover:bg-green-500/40 text-green-300 font-bold ml-1 transition-colors cursor-pointer"
                  title="Talebi Tamamla"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top POS Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#080d0d] border-b border-white/10 px-3 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent text-black flex items-center justify-center font-extrabold shadow-lg shadow-accent/20 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white truncate">{DEMO_RESTAURANT.name}</h1>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold shrink-0">
                  Canlı POS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-foreground/50 hidden xs:block">Masa, Sipariş ve Kasa Takip Terminali</p>
            </div>
          </div>

          {/* Quick Z-Report on mobile right top */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setIsZReportOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-green-500/15 border border-green-500/30 text-[11px] font-bold text-green-300 flex items-center gap-1"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Z-Raporu</span>
            </button>
          </div>
        </div>

        {/* Action Links: Z-Report, KDS, Yönetim, QR Test */}
        <div className="flex items-center gap-2 overflow-x-auto sleek-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setIsZReportOpen(true)}
            className="hidden md:flex px-3 py-1.5 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-xs font-bold text-green-300 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Receipt className="w-4 h-4" />
            <span>Z-Raporu Al</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Tüm masaları boşaltmak, açık adisyonları ve siparişleri sıfırlamak istiyor musunuz?")) {
                resetAllTables();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Tüm masaları ve adisyonları temizle"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tüm Masaları Sıfırla</span>
          </button>

          <Link
            href={`/qr/${restaurantSlug}/m-4`}
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-accent" />
            <span>Masa 4 QR</span>
          </Link>

          <Link
            href={`/restoran/${restaurantSlug}/mutfak`}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Mutfak (KDS)</span>
          </Link>

          <Link
            href={`/restoran/${restaurantSlug}/yonetim`}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground/70 hover:text-white flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Yönetim</span>
          </Link>
        </div>
      </header>

      {/* Main Stats Row */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 bg-white/[0.01] border-b border-white/5">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Dolu Masalar</span>
            <span className="text-base sm:text-xl font-black text-white">
              {occupiedCount} <span className="text-[10px] sm:text-xs text-foreground/40 font-normal">/ {tables.length}</span>
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Onay Bekleyen</span>
            <span className={`text-base sm:text-xl font-black truncate ${pendingOrders.length > 0 ? "text-amber-400 animate-pulse" : "text-white"}`}>
              {pendingOrders.length} Sipariş
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Garson / Hesap</span>
            <span className={`text-base sm:text-xl font-black truncate ${activeCalls.length > 0 ? "text-purple-400 animate-pulse" : "text-white"}`}>
              {activeCalls.length} Çağrı
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Canlı Adisyon</span>
            <span className="text-base sm:text-xl font-black text-green-400 truncate">
              {totalLiveRevenue.toLocaleString("tr-TR")} TL
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* POS Sub-Navigation Mode Switcher */}
      <div className="px-3 sm:px-6 py-2.5 bg-black/40 border-b border-white/5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 overflow-x-auto sleek-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setKasaTab("TABLES")}
            className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              kasaTab === "TABLES"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Masa Salonu ({tables.length})</span>
          </button>

          <button
            onClick={() => setKasaTab("DELIVERY")}
            className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              kasaTab === "DELIVERY"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Paket Servis Hub</span>
            {activeDeliveryCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black animate-pulse">
                {activeDeliveryCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setIsEFaturaOpen(true)}
          className="w-full sm:w-auto px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>E-Fatura / E-Adisyon</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      {kasaTab === "DELIVERY" ? (
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <DeliveryHub orders={deliveryOrders} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Left Side: Table Grid & Section Filters */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
            {/* Section Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto sleek-scrollbar pb-1 px-0.5">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec || "ALL")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
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
              tableParticipants={tableParticipants}
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
              participants={tableParticipants[selectedTable.id] || []}
              onClose={() => setSelectedTableId(null)}
              onCloseBill={closeTableBill}
              onTransferTable={transferTable}
              onResetSingleTable={resetSingleTable}
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
