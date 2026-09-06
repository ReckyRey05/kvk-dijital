"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimOrder, TeklifimOrderStatus } from "@/types/teklifimGelsin";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import {
  Package,
  Clock,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ArrowRight,
  Building2,
  Calendar,
  Filter,
  FileText,
  ShoppingBag,
} from "lucide-react";

type TabType = "all" | "active" | "completed" | "issues";

export default function TeklifimOrdersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<TeklifimOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/teklifim-gelsin/auth");
      } else {
        setCurrentUser(user);
        loadOrders(user);
      }
    });
    return () => unsub();
  }, [router]);

  const loadOrders = async (user: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Siparişler yüklenemedi.");
      setOrders(data.orders || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Sipariş verileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: TeklifimOrderStatus) => {
    switch (status) {
      case "preparing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Package className="h-3.5 w-3.5" />
            <span>Hazırlanıyor</span>
          </span>
        );
      case "ready_for_dispatch":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
            <Clock className="h-3.5 w-3.5" />
            <span>Sevke Hazır</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
            <Truck className="h-3.5 w-3.5" />
            <span>Kargoda</span>
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Teslim Edildi</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Tamamlandı</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <XCircle className="h-3.5 w-3.5" />
            <span>İptal Edildi</span>
          </span>
        );
      case "disputed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>İtiraz / İnceleme</span>
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab === "active") {
      if (!["preparing", "ready_for_dispatch", "shipped"].includes(order.status)) return false;
    } else if (activeTab === "completed") {
      if (!["delivered", "completed"].includes(order.status)) return false;
    } else if (activeTab === "issues") {
      if (!["cancelled", "disputed"].includes(order.status)) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchTitle = (order.requestTitle || "").toLowerCase().includes(q);
      const matchBiz = (order.businessName || "").toLowerCase().includes(q);
      const matchSup = (order.supplierName || "").toLowerCase().includes(q);
      return matchNum || matchTitle || matchBiz || matchSup;
    }

    return true;
  });

  const activeCount = orders.filter((o) =>
    ["preparing", "ready_for_dispatch", "shipped"].includes(o.status)
  ).length;
  const completedCount = orders.filter((o) => ["delivered", "completed"].includes(o.status)).length;
  const issuesCount = orders.filter((o) => ["cancelled", "disputed"].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 dark:bg-[#090D14] dark:text-zinc-100 font-sans">
      <TeklifimHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
              <ShoppingBag className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span>Sipariş & Sevkiyat Yönetimi</span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Onaylanan B2B sözleşmelerinizden doğan siparişlerinizi, kargo takibini ve teslimat kanıtlarını yönetin.
            </p>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Tümü ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === "active"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Aktif Siparişler ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Teslim & Tamamlanan ({completedCount})
            </button>
            <button
              onClick={() => setActiveTab("issues")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === "issues"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              İptal & İtiraz ({issuesCount})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sipariş no, talep adı veya firma..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="mt-8 grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-zinc-200/80 bg-white p-5 animate-pulse dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
              Henüz Sipariş Bulunmuyor
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Bir talep için gelen teklif kabul edildiğinde ve resmi B2B anlaşması sağlandığında sipariş otomatik olarak bu ekranda listelenir.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/teklifim-gelsin/dashboard"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
              >
                Taleplerimi Gör
              </Link>
            </div>
          </div>
        ) : (
          /* Order List Cards */
          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => {
              const isBuyer = currentUser?.uid === order.businessId;
              const counterpartyName = isBuyer ? order.supplierName : order.businessName;
              const formattedDate = new Date(order.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="group relative rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {formattedDate}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {order.requestTitle || "B2B Tedarik Siparişi"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                          <span>
                            {isBuyer ? "Tedarikçi: " : "Alıcı İşletme: "}
                            <strong className="text-zinc-800 dark:text-zinc-200">
                              {counterpartyName}
                            </strong>
                          </span>
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-zinc-400" />
                          <span>
                            {order.quantity} {order.unit}
                          </span>
                        </span>

                        {order.trackingInfo && (
                          <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
                            <Truck className="h-3.5 w-3.5" />
                            <span>
                              {order.trackingInfo.carrier}: {order.trackingInfo.trackingNumber}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-800 shrink-0">
                      <div className="text-left md:text-right">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Sipariş Tutarı</div>
                        <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                          ₺{Number(order.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <Link
                        href={`/teklifim-gelsin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-emerald-600 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-emerald-600 transition"
                      >
                        <span>Siparişi İncele</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
