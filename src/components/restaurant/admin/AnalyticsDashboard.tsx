"use client";

import { useState } from "react";
import { Order, Table } from "@/types/restaurant";
import {
  generateZReport,
  SAMPLE_TOP_PRODUCTS,
  SAMPLE_HOURLY_RUSH,
} from "@/lib/restaurant/analyticsData";
import ZReportModal from "./ZReportModal";
import {
  TrendingUp,
  CreditCard,
  Banknote,
  Users,
  Clock,
  Flame,
  Receipt,
  Printer,
  Sparkles,
  ArrowUpRight,
  ChefHat,
} from "lucide-react";

interface AnalyticsDashboardProps {
  orders: Order[];
  tables: Table[];
  restaurantName: string;
}

export default function AnalyticsDashboard({
  orders,
  tables,
  restaurantName,
}: AnalyticsDashboardProps) {
  const [isZReportOpen, setIsZReportOpen] = useState(false);

  const zReport = generateZReport(orders, tables, restaurantName);

  const cardPercent = Math.round((zReport.cardTotal / zReport.grossSales) * 100);
  const cashPercent = 100 - cardPercent;

  // Max hourly revenue for proportional bar heights
  const maxHourlyRevenue = Math.max(...SAMPLE_HOURLY_RUSH.map((h) => h.revenue));

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Finansal Ciro & Restoran Analitiği</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">
              Canlı Veriler
            </span>
          </h2>
          <p className="text-xs text-foreground/50 mt-0.5">
            Günlük satış hasılatı, ürün performansları ve Z raporu dökümü
          </p>
        </div>

        <button
          onClick={() => setIsZReportOpen(true)}
          className="py-3 px-5 rounded-2xl bg-accent text-black font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>Gün Sonu Z Raporu Al</span>
        </button>
      </div>

      {/* 4 Main Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-[#0c1212] border border-white/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/60">Günlük Brüt Ciro</span>
            <div className="w-8 h-8 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {zReport.grossSales.toLocaleString("tr-TR")}{" "}
              <span className="text-xs text-accent font-bold">TL</span>
            </div>
            <span className="text-[11px] text-green-400 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Düne göre +%18 artışta</span>
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#0c1212] border border-white/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/60">Toplam Sipariş / Fiş</span>
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{zReport.totalOrdersCount} Fiş</div>
            <span className="text-[11px] text-foreground/50 mt-1 block">
              {zReport.totalTablesServed} farklı masaya servis
            </span>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="p-5 rounded-2xl bg-[#0c1212] border border-white/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/60">Ortalama Adisyon (Ticket)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {zReport.averageTicketSize.toLocaleString("tr-TR")}{" "}
              <span className="text-xs text-blue-400 font-bold">TL</span>
            </div>
            <span className="text-[11px] text-foreground/50 mt-1 block">Masa başına ortalama harcama</span>
          </div>
        </div>

        {/* Average Table Duration */}
        <div className="p-5 rounded-2xl bg-[#0c1212] border border-white/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/60">Ort. Masa Oturum Süresi</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{zReport.averageTableDurationMinutes} Dk</div>
            <span className="text-[11px] text-foreground/50 mt-1 block">Masa devir hızı: ~1.4 saat</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Best Sellers & Payment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Best Selling Dishes */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0c1212] border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                En Çok Satan & Ciro Getiren Ürünler
              </h3>
            </div>
            <span className="text-xs text-foreground/50 font-medium">Toplam Ciro Payı</span>
          </div>

          <div className="space-y-4">
            {SAMPLE_TOP_PRODUCTS.map((prod) => (
              <div key={prod.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{prod.name}</span>
                    <span className="text-[10px] text-foreground/50 ml-2">({prod.quantitySold} Adet)</span>
                  </div>
                  <span className="font-extrabold text-accent">
                    {prod.totalRevenue.toLocaleString("tr-TR")} TL (%{prod.revenuePercent})
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-blue-500 rounded-full"
                    style={{ width: `${prod.revenuePercent * 2.8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Payment Method Split */}
        <div className="p-6 rounded-3xl bg-[#0c1212] border border-white/10 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Kasa Ödeme Dağılımı
            </h3>
            <p className="text-xs text-foreground/50 mt-0.5">Nakit vs Kredi Kartı/POS oranı</p>
          </div>

          {/* Graphical Split */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Kredi Kartı / POS</span>
                  <span className="text-[10px] text-foreground/50">%{cardPercent} Pay</span>
                </div>
              </div>
              <span className="text-base font-black text-white">
                {zReport.cardTotal.toLocaleString("tr-TR")} TL
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Nakit Kasa</span>
                  <span className="text-[10px] text-foreground/50">%{cashPercent} Pay</span>
                </div>
              </div>
              <span className="text-base font-black text-white">
                {zReport.cashTotal.toLocaleString("tr-TR")} TL
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] text-center text-xs text-foreground/60">
            KDV (%10): <strong>{zReport.taxAmount.toLocaleString("tr-TR")} TL</strong> | Net Hasılat:{" "}
            <strong>{zReport.netSales.toLocaleString("tr-TR")} TL</strong>
          </div>
        </div>
      </div>

      {/* Hourly Rush Bar Chart Section */}
      <div className="p-6 rounded-3xl bg-[#0c1212] border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Saatlik Sipariş & Ciro Yoğunluğu (Rush Hours)
            </h3>
            <p className="text-xs text-foreground/50 mt-0.5">
              Günün en yoğun öğle ve akşam servis saatleri analizi
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-foreground/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span>Öğle Pik (13:00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Akşam Pik (20:00)</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-8 pb-2 flex items-end justify-between gap-2 h-56 overflow-x-auto">
          {SAMPLE_HOURLY_RUSH.map((item) => {
            const heightPercent = Math.max(15, Math.round((item.revenue / maxHourlyRevenue) * 100));
            const isPeak = item.hour === "20:00" || item.hour === "13:00";

            return (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 group min-w-[36px]">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-accent whitespace-nowrap">
                  {item.revenue} TL
                </div>

                {/* Bar */}
                <div className="w-full bg-white/5 rounded-t-xl overflow-hidden flex items-end h-40">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      isPeak
                        ? "bg-gradient-to-t from-accent to-blue-400 shadow-lg shadow-accent/20"
                        : "bg-white/15 group-hover:bg-accent/50"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Hour Label */}
                <span className={`text-[10px] font-medium ${isPeak ? "text-accent font-bold" : "text-foreground/50"}`}>
                  {item.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Z Report Modal */}
      <ZReportModal
        isOpen={isZReportOpen}
        onClose={() => setIsZReportOpen(false)}
        report={zReport}
      />
    </div>
  );
}
