"use client";

import { useState } from "react";
import { DeliveryOrder, DeliveryPlatform } from "@/types/restaurant";
import { useRestaurantStore } from "@/lib/restaurant/store";
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Power,
  Printer,
  Receipt,
  User,
  XCircle,
  AlertCircle,
  TrendingUp,
  Boxes,
} from "lucide-react";

interface DeliveryHubProps {
  orders: DeliveryOrder[];
}

export default function DeliveryHub({ orders }: DeliveryHubProps) {
  const { deliveryPlatforms, toggleDeliveryPlatform, updateDeliveryOrderStatus } = useRestaurantStore();
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "ALL">("ACTIVE");

  const activeOrders = orders.filter((o) => {
    if (filterStatus === "ACTIVE") {
      return o.status === "PENDING" || o.status === "PREPARING" || o.status === "COURIER_ASSIGNED";
    }
    return true;
  });

  const getPlatformBadge = (platform: DeliveryPlatform) => {
    switch (platform) {
      case "GETIR":
        return { name: "Getir Yemek", color: "bg-[#5d3ebc] text-white border-[#7854f7]" };
      case "YEMEKSEPETI":
        return { name: "Yemeksepeti", color: "bg-[#ea004b] text-white border-[#ff2a6d]" };
      case "TRENDYOL":
        return { name: "Trendyol Yemek", color: "bg-[#f27a1a] text-white border-[#ff933b]" };
      case "MIGROS":
        return { name: "Migros Yemek", color: "bg-[#ff6000] text-white border-[#ff8533]" };
      default:
        return { name: platform, color: "bg-white/10 text-white border-white/20" };
    }
  };

  const handlePrintCourierReceipt = (order: DeliveryOrder) => {
    window.print();
  };

  const totalDeliveryRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Platform Channel Status Switchers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {deliveryPlatforms.map((p) => {
          const badge = getPlatformBadge(p.platform);
          return (
            <div
              key={p.platform}
              className={`p-4 rounded-2xl bg-[#0a0f0f] border transition-all ${
                p.isOpen ? "border-white/10 hover:border-white/20" : "border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${badge.color}`}>
                  {p.name}
                </span>

                <button
                  onClick={() => toggleDeliveryPlatform(p.platform)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    p.isOpen
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                  title={p.isOpen ? "Kanal Açık (Sipariş Alınıyor)" : "Kanal Kapalı"}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-foreground/50">Durum:</span>
                <span className={`font-bold ${p.isOpen ? "text-emerald-400" : "text-red-400"}`}>
                  {p.isOpen ? "Sipariş Alıyor" : "Kapalı"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Header & Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === "ACTIVE"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            Aktif Paket Siparişleri ({orders.filter((o) => o.status === "PENDING" || o.status === "PREPARING").length})
          </button>
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === "ALL"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            Tüm Paket Geçmişi ({orders.length})
          </button>
        </div>

        <div className="text-xs font-bold text-foreground/60">
          Toplam Paket Cirosu: <span className="text-white font-extrabold">{totalDeliveryRevenue.toLocaleString("tr-TR")} TL</span>
        </div>
      </div>

      {/* Delivery Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeOrders.map((order) => {
          const badge = getPlatformBadge(order.platform);
          const isPending = order.status === "PENDING";
          const isPreparing = order.status === "PREPARING";

          return (
            <div
              key={order.id}
              className={`p-5 rounded-2xl bg-[#0a0f0f] border transition-all ${
                isPending
                  ? "border-amber-500/50 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/30"
                  : "border-white/10"
              }`}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${badge.color}`}>
                    {badge.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">{order.platformOrderId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-foreground/50 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isPending
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                        : isPreparing
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {isPending ? "Onay Bekliyor" : isPreparing ? "Mutfakta Hazırlanıyor" : "Kurye Teslimatında"}
                  </span>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="py-3 border-b border-white/5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-foreground/70 font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-accent" />
                    <span>{order.customerPhone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-foreground/80 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="leading-snug">{order.deliveryAddress}</span>
                </div>

                {order.courierNotes && (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-semibold">
                    Not: {order.courierNotes}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="py-3 space-y-1.5">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-white/10 text-white font-bold text-[10px] flex items-center justify-center">
                        {it.quantity}x
                      </span>
                      <span className="text-white font-medium">{it.name}</span>
                    </div>
                    <span className="font-bold text-foreground/80">{it.finalPrice * it.quantity} TL</span>
                  </div>
                ))}
              </div>

              {/* Footer Total & Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-foreground/50 block">Ödeme Tipi: {order.paymentType === "ONLINE_PAID" ? "Online Ödendi" : "Kapıda Tahsilat"}</span>
                  <span className="text-base font-black text-emerald-400">{order.totalAmount.toLocaleString("tr-TR")} TL</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintCourierReceipt(order)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
                    title="Kurye Bilgi Fişi Yazdır"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {isPending && (
                    <button
                      onClick={() => updateDeliveryOrderStatus(order.id, "PREPARING")}
                      className="px-4 py-2.5 rounded-xl bg-accent text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Siparişi Onayla & Mutfağa İlet</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => updateDeliveryOrderStatus(order.id, "DELIVERED")}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Kuryeye Teslim Edildi</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
