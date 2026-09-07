"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  History,
  Download,
  Filter,
  ArrowLeft,
  Calendar,
  Building,
  Tag,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Package,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TEKLIFIM_CATEGORIES } from "@/types/teklifimGelsin";

function ProcurementHistoryContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<any[]>([]);

  // Filters
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        await fetchPurchases(currUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [category, status]);

  const fetchPurchases = async (currUser: any) => {
    setLoading(true);
    try {
      const token = await currUser.getIdToken();
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (status) params.set("status", status);

      const res = await fetch(`/api/teklifim-gelsin/procurement/history?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPurchases(data.purchases || []);
      }
    } catch (err) {
      console.error("Failed to load purchase history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      params.set("format", "csv");

      window.open(`/api/teklifim-gelsin/procurement/history?${params.toString()}`, "_blank");
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.productName || "").toLowerCase().includes(q) ||
      (p.supplierName || "").toLowerCase().includes(q) ||
      (p.orderNumber || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Link
            href="/teklifim-gelsin/procurement"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Satin Alma Merkezine Don</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Satin Alma Gecmisi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gecmis siparisler, odeme ve teslimat durumlari ile CSV disa aktarim
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>CSV / Excel Indir</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6">
          <input
            type="text"
            placeholder="Urun adi, tedarikci veya siparis no ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Category */}
        <div className="sm:col-span-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Tum Kategoriler</option>
            {TEKLIFIM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="sm:col-span-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Tum Durumlar</option>
            <option value="preparing">Hazirlaniyor</option>
            <option value="shipped">Kargoya Verildi</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="completed">Tamamlandi</option>
            <option value="cancelled">Iptal Edildi</option>
          </select>
        </div>
      </div>

      {/* PURCHASES TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Satin alma gecmisi yukleniyor...
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Filtrelere uygun satin alma kaydi bulunamadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Urun & Kategori</th>
                  <th className="py-3 px-4 font-semibold">Tedarikci</th>
                  <th className="py-3 px-4 font-semibold text-right">Miktar</th>
                  <th className="py-3 px-4 font-semibold text-right">Birim / Toplam Fiyat</th>
                  <th className="py-3 px-4 font-semibold">Tarih & Siparis No</th>
                  <th className="py-3 px-4 font-semibold">Odeme</th>
                  <th className="py-3 px-4 font-semibold">Teslimat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPurchases.map((item, idx) => (
                  <tr
                    key={`${item.orderId}_${idx}`}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.productName}
                      </div>
                      <span className="text-[11px] text-slate-400">{item.category}</span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.supplierName}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                      {item.quantity} {item.unit}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {(item.totalPrice || 0).toLocaleString("tr-TR")} {item.currency}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {(item.unitPrice || 0).toLocaleString("tr-TR")} TL / {item.unit}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 dark:text-slate-300">
                        {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {item.orderNumber || item.orderId}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.paymentStatus === "completed"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>{item.paymentStatus === "completed" ? "Odendi" : "Bekliyor"}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "delivered" || item.status === "completed"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : item.status === "shipped"
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Truck className="w-3 h-3" />
                        <span className="capitalize">{item.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProcurementHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ProcurementHistoryContent />
    </Suspense>
  );
}
