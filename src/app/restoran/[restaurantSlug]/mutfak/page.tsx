"use client";

import { useState, use } from "react";
import Link from "next/link";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { useRestaurantStore } from "@/lib/restaurant/store";
import KitchenCard from "@/components/restaurant/kds/KitchenCard";
import { playOrderAlertSound } from "@/lib/restaurant/audio";
import { ChefHat, Volume2, Store, Clock, Sparkles, CheckCircle2 } from "lucide-react";

interface MutfakPageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
}

export default function MutfakKdsPage({ params }: MutfakPageProps) {
  const resolvedParams = use(params);
  const { restaurantSlug } = resolvedParams;

  const { orders, updateOrderStatus } = useRestaurantStore();
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "ALL">("ACTIVE");

  // Filter kitchen tickets
  const kitchenOrders = orders.filter((o) => {
    if (filterStatus === "ACTIVE") {
      return o.status === "PREPARING" || o.status === "READY";
    }
    return o.status !== "PENDING_CONFIRMATION" && o.status !== "CANCELLED";
  });

  const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount = orders.filter((o) => o.status === "READY").length;

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col">
      {/* Top KDS Bar */}
      <header className="sticky top-0 z-30 bg-[#080d0d] border-b border-white/10 px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20 shrink-0">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white">Mutfak Ekranı (KDS)</h1>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold shrink-0">
                Canlı KDS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-foreground/50">{DEMO_RESTAURANT.name} - Mutfak İstasyonu</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto sleek-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => playOrderAlertSound()}
            className="px-3 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Ses Testi"
          >
            <Volume2 className="w-3.5 h-3.5 text-accent" />
            <span>Zil Sesi Testi</span>
          </button>

          <Link
            href={`/restoran/${restaurantSlug}/kasa`}
            className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-bold text-accent flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Kasa Terminali</span>
          </Link>
        </div>
      </header>

      {/* Summary KPI Bar */}
      <div className="px-3 sm:px-6 py-2.5 bg-white/[0.01] border-b border-white/5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 overflow-x-auto sleek-scrollbar">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto sleek-scrollbar pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-foreground/70">Hazırlanan:</span>
            <span className="font-extrabold text-white text-xs sm:text-sm">{preparingCount} Sipariş</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-foreground/70">Servis Bekleyen:</span>
            <span className="font-extrabold text-green-400 text-xs sm:text-sm">{readyCount} Sipariş</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap pl-2 sm:pl-3 border-l border-white/10">
            <Clock className="w-3 h-3 text-accent" />
            <span className="text-foreground/70">Ort. Süre:</span>
            <span className="font-extrabold text-accent text-xs sm:text-sm">~9.2 Dk</span>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === "ACTIVE" ? "bg-amber-500 text-black shadow-md" : "text-foreground/60 hover:text-white"
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === "ALL" ? "bg-white/10 text-white" : "text-foreground/60 hover:text-white"
            }`}
          >
            Tümü
          </button>
        </div>
      </div>

      {/* Kitchen Ticket Grid */}
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
        {kitchenOrders.length === 0 ? (
          <div className="h-72 sm:h-96 flex flex-col items-center justify-center text-center text-foreground/40 space-y-3 p-4">
            <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 opacity-40 text-accent" />
            <h3 className="text-sm sm:text-base font-bold text-white">Bekleyen Mutfak Siparişi Yok</h3>
            <p className="text-xs max-w-sm">
              Masalardan yeni bir QR siparişi verildiğinde ve kasadan onaylandığında anında sesli uyarıyla burada belirecektir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {kitchenOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
