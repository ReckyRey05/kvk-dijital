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
      <header className="sticky top-0 z-30 bg-[#080d0d] border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">Mutfak Ekranı (KDS)</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                Canlı Aşçı Terminali
              </span>
            </div>
            <p className="text-xs text-foreground/50">{DEMO_RESTAURANT.name} - Mutfak İstasyonu</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => playOrderAlertSound()}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ses Testi"
          >
            <Volume2 className="w-4 h-4 text-accent" />
            <span>Zil Sesi Testi</span>
          </button>

          <Link
            href={`/restoran/${restaurantSlug}/kasa`}
            className="px-3.5 py-2 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-bold text-accent flex items-center gap-2 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Kasa Paneline Geç</span>
          </Link>
        </div>
      </header>

      {/* Summary KPI Bar */}
      <div className="px-6 py-3 bg-white/[0.01] border-b border-white/5 flex items-center justify-between overflow-x-auto sleek-scrollbar">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-xs whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-foreground/70">Hazırlanan:</span>
            <span className="font-extrabold text-white text-sm">{preparingCount} Sipariş</span>
          </div>

          <div className="flex items-center gap-2 text-xs whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-foreground/70">Servis Bekleyen:</span>
            <span className="font-extrabold text-green-400 text-sm">{readyCount} Sipariş</span>
          </div>

          <div className="flex items-center gap-2 text-xs whitespace-nowrap pl-3 border-l border-white/10">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span className="text-foreground/70">Ort. Çıkış Süresi:</span>
            <span className="font-extrabold text-accent text-sm">~9.2 Dk</span>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === "ACTIVE" ? "bg-amber-500 text-black shadow-md" : "text-foreground/60 hover:text-white"
            }`}
          >
            Aktif Siparişler
          </button>
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === "ALL" ? "bg-white/10 text-white" : "text-foreground/60 hover:text-white"
            }`}
          >
            Tüm Geçmiş
          </button>
        </div>
      </div>

      {/* Kitchen Ticket Grid */}
      <main className="flex-1 p-6 overflow-y-auto">
        {kitchenOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-foreground/40 space-y-3">
            <ChefHat className="w-12 h-12 opacity-40 text-accent" />
            <h3 className="text-base font-bold text-white">Bekleyen Mutfak Siparişi Yok</h3>
            <p className="text-xs max-w-sm">
              Masalardan yeni bir QR siparişi verildiğinde ve kasadan onaylandığında anında sesli uyarıyla burada belirecektir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
