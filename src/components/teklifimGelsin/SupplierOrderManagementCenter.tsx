"use client";

import React, { useState } from "react";
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Calendar,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { TeklifimOrder, TeklifimDeliveryPerformance } from "@/types/teklifimGelsin";
import Link from "next/link";

interface SupplierOrderManagementCenterProps {
  orders: TeklifimOrder[];
  deliveryPerformance: TeklifimDeliveryPerformance;
  onUpdateStatus?: (orderId: string, nextStatus: string) => Promise<void>;
}

export default function SupplierOrderManagementCenter({
  orders,
  deliveryPerformance,
  onUpdateStatus,
}: SupplierOrderManagementCenterProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "preparing" | "shipped" | "delivered">("all");

  const activeOrders = orders.filter((o) => {
    if (filterStatus === "preparing") return o.status === "preparing";
    if (filterStatus === "shipped") return o.status === "shipped";
    if (filterStatus === "delivered") return o.status === "delivered" || o.status === "completed";
    return true;
  });

  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredCount = orders.filter(
    (o) => o.status === "delivered" || o.status === "completed"
  ).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Siparis & Teslimat Performans Merkezi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sevkiyat sureclerini yonetin ve teslimat performansinizi takip edin.
            </p>
          </div>
        </div>

        {/* Delivery KPIs */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Zamaninda Teslim</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {typeof deliveryPerformance.onTimeDeliveryRate === "number"
                ? `%${deliveryPerformance.onTimeDeliveryRate}`
                : "Yetersiz Veri"}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Geciken</span>
            <span
              className={`font-bold ${
                deliveryPerformance.delayedOrdersCount > 0 ? "text-rose-600" : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {deliveryPerformance.delayedOrdersCount} Siparis
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Ort. Teslimat</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {typeof deliveryPerformance.averageDeliveryDays === "number"
                ? `${deliveryPerformance.averageDeliveryDays} Gun`
                : "Yetersiz Veri"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterStatus === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Tumu ({orders.length})
        </button>
        <button
          onClick={() => setFilterStatus("preparing")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterStatus === "preparing"
              ? "bg-amber-500 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Hazirlaniyor ({preparingCount})
        </button>
        <button
          onClick={() => setFilterStatus("shipped")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterStatus === "shipped"
              ? "bg-blue-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Yolda / Sevkiyatta ({shippedCount})
        </button>
        <button
          onClick={() => setFilterStatus("delivered")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterStatus === "delivered"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Tamamlandi ({deliveredCount})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-2.5">
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Secilen durumda siparis bulunmuyor.
          </div>
        ) : (
          activeOrders.slice(0, 6).map((order) => {
            const dueDate = order.deliveryDueDate
              ? new Date(order.deliveryDueDate).toLocaleDateString("tr-TR")
              : "Belirtilmedi";

            return (
              <div
                key={order.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-850/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      #{order.orderNumber || order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {order.buyerBusinessName || order.buyerName || "Isletme"}
                    </span>
                    {order.deliveryCity && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {order.deliveryCity}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {order.items?.length || 1} Kalem Ürün
                    </span>
                    <span>·</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(order.totalAmount || 0).toLocaleString("tr-TR")} TL
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Son Teslim: {dueDate}
                    </span>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      order.status === "completed" || order.status === "delivered"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : order.status === "shipped"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {order.status === "completed" || order.status === "delivered"
                      ? "Teslim Edildi"
                      : order.status === "shipped"
                      ? "Sevkiyatta"
                      : "Hazirlaniyor"}
                  </span>

                  <Link
                    href={`/teklifim-gelsin/siparisler/${order.id}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
