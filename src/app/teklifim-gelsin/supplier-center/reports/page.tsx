"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Package,
  Layers,
  Users,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

function SalesReportsContent() {
  const [user, setUser] = useState<any>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reportData, setReportData] = useState<{
    totalRevenue: number;
    completedCount: number;
    categoryBreakdown: { category: string; orderCount: number; totalVolume: number }[];
    monthlyTrend: { month: string; orderCount: number; totalVolume: number }[];
    topCustomers: { customerId: string; customerName: string; orderCount: number; totalVolume: number }[];
  } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        try {
          const token = await currUser.getIdToken();
          setIdToken(token);
          await loadReport(token);
        } catch (err) {
          setError("Rapor yuklenemedi.");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const loadReport = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teklifim-gelsin/supplier-center/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Rapor alinamadi.");
      }

      setReportData(data);
    } catch (err: any) {
      setError(err.message || "Rapor yukleme hatasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    if (!idToken) return;
    try {
      const res = await fetch("/api/teklifim-gelsin/supplier-center/reports?format=csv", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) throw new Error("CSV indirilemedi.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `satis-raporu-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "CSV indirme basarisiz oldu.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Satis raporlari hesaplaniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/teklifim-gelsin/supplier-center"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Satis Merkezine Don</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Satis & Finansal Raporlar
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerceklesmis siparisler uzerinden ciro dagilimi, aylik trendler ve musteri bazli performans.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm w-fit"
          >
            <Download className="w-4 h-4" />
            <span>CSV Olarak Indir</span>
          </button>
        </div>

        {reportData && (
          <>
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  Toplam Satis Tutari
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {reportData.totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  Tamamlanan Siparis
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {reportData.completedCount} Adet
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  Lider Kategori
                </span>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 truncate">
                  {reportData.categoryBreakdown[0]?.category || "-"}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  En Buyuk Alici
                </span>
                <div className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-1.5 truncate">
                  {reportData.topCustomers[0]?.customerName || "-"}
                </div>
              </div>
            </div>

            {/* Grids: Category and Monthly */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Kategori Bazli Satis Dagilimi
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3">Siparis</th>
                        <th className="py-2 px-3 text-right">Toplam Hacim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportData.categoryBreakdown.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-slate-400">
                            Veri bulunamadi.
                          </td>
                        </tr>
                      ) : (
                        reportData.categoryBreakdown.map((cat) => (
                          <tr key={cat.category} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {cat.category}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{cat.orderCount} Siparis</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                              {cat.totalVolume.toLocaleString("tr-TR")} TL
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Aylik Satis Hacmi Trendi
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Donem</th>
                        <th className="py-2 px-3">Siparis</th>
                        <th className="py-2 px-3 text-right">Toplam Hacim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportData.monthlyTrend.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-slate-400">
                            Veri bulunamadi.
                          </td>
                        </tr>
                      ) : (
                        reportData.monthlyTrend.map((m) => (
                          <tr key={m.month} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {m.month}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{m.orderCount} Siparis</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                              {m.totalVolume.toLocaleString("tr-TR")} TL
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top Customers Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Musteri Bazli Satis Siralamasi
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Musteri (Isletme)</th>
                      <th className="py-2 px-3">Tamamlanan Siparis</th>
                      <th className="py-2 px-3 text-right">Toplam Ticaret Hacmi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reportData.topCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-400">
                          Musteri verisi bulunamadi.
                        </td>
                      </tr>
                    ) : (
                      reportData.topCustomers.map((cust) => (
                        <tr key={cust.customerId} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {cust.customerName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{cust.orderCount} Siparis</td>
                          <td className="py-2.5 px-3 text-right font-bold text-teal-700 dark:text-teal-300">
                            {cust.totalVolume.toLocaleString("tr-TR")} TL
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SalesReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs text-slate-400">Yukleniyor...</p>
        </div>
      }
    >
      <SalesReportsContent />
    </Suspense>
  );
}
