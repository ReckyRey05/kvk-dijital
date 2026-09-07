"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Plus,
  History,
  ListOrdered,
  Users,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Layers,
  ArrowRight,
  AlertCircle,
  X,
  FileCheck,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import ProcurementStatsCard from "@/components/teklifimGelsin/ProcurementStatsCard";
import SpendAnalyticsChart from "@/components/teklifimGelsin/SpendAnalyticsChart";
import FrequentlyPurchasedSection from "@/components/teklifimGelsin/FrequentlyPurchasedSection";
import BulkRequestItemBuilder from "@/components/teklifimGelsin/BulkRequestItemBuilder";
import {
  TeklifimSpendSummary,
  TeklifimFrequentlyPurchasedItem,
  TeklifimProcurementItem,
  TeklifimOrgRole,
} from "@/types/teklifimGelsin";

function ProcurementContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    activeRequestsCount: number;
    pendingOffersCount: number;
    pendingApprovalsCount: number;
    activeOrdersCount: number;
    spendSummary: TeklifimSpendSummary;
    frequentlyPurchased: TeklifimFrequentlyPurchasedItem[];
    todayMetrics: any;
    userRole: TeklifimOrgRole;
  } | null>(null);

  // New Request Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [items, setItems] = useState<TeklifimProcurementItem[]>([
    {
      id: "it_1",
      productName: "",
      category: "Ambalaj & Paketleme",
      quantity: 100,
      unit: "Adet",
      notes: "",
    },
  ]);
  const [estimatedBudget, setEstimatedBudget] = useState<number>(0);
  const [deliveryDays, setDeliveryDays] = useState<number>(7);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        await fetchDashboardData(currUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchDashboardData = async (currUser: any) => {
    setLoading(true);
    try {
      const token = await currUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/procurement", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to load procurement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingRequest(true);
    setRequestError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/procurement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: requestTitle.trim() || "Kurumsal Satin Alma Talebi",
          items,
          estimatedBudget,
          deliveryDays,
          isBulkProcurement: items.length > 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Talep olusturulamadi.");
      }

      setModalOpen(false);
      setRequestTitle("");
      setItems([
        {
          id: `it_${Date.now()}`,
          productName: "",
          category: "Ambalaj & Paketleme",
          quantity: 100,
          unit: "Adet",
        },
      ]);
      setEstimatedBudget(0);
      await fetchDashboardData(user);
    } catch (err: any) {
      setRequestError(err.message || "Islem basarisiz.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Satin alma merkezi yukleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <ShoppingBag className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Satin Alma Merkezine Giris Yapin
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Sirketinizin alim taleplerini, onaylarini ve harcama analitiklerini yonetmek icin giris yapin.
        </p>
        <Link
          href="/teklifim-gelsin/login"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          Giris Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* PAGE HEADER & QUICK NAV TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Kurumsal Satin Alma
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize">
              Rol: {dashboardData?.userRole || "buyer"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Satin Alma Merkezi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Talepler, onaylar, gercek harcama analitikleri ve toplu tedarik yonetimi
          </p>
        </div>

        {/* TOP CTA BUTTONS & ROUTE LINKS */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/teklifim-gelsin/procurement/history"
            className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Alim Gecmisi</span>
          </Link>

          <Link
            href="/teklifim-gelsin/procurement/lists"
            className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
            <span>Listelerim</span>
          </Link>

          <Link
            href="/teklifim-gelsin/team"
            className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekip</span>
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Satin Alma Baslat</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <ProcurementStatsCard
        activeRequestsCount={dashboardData?.activeRequestsCount || 0}
        pendingOffersCount={dashboardData?.pendingOffersCount || 0}
        pendingApprovalsCount={dashboardData?.pendingApprovalsCount || 0}
        activeOrdersCount={dashboardData?.activeOrdersCount || 0}
        spendSummary={dashboardData?.spendSummary}
        todayMetrics={dashboardData?.todayMetrics}
        onStartProcurement={() => setModalOpen(true)}
      />

      {/* FREQUENTLY PURCHASED SECTION */}
      <FrequentlyPurchasedSection
        items={dashboardData?.frequentlyPurchased || []}
      />

      {/* SPEND ANALYTICS & TRENDS */}
      {dashboardData?.spendSummary && (
        <SpendAnalyticsChart analytics={dashboardData.spendSummary} />
      )}

      {/* MODAL: + SATIN ALMA BASLAT (MULTI-ITEM BULK REQUEST) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Yeni Satin Alma Talebi Baslat
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 overflow-y-auto space-y-4 flex-1">
              {requestError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{requestError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Talep Basligi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Orn: Kafe Aylik Sarf & Kahve Tedariki"
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <BulkRequestItemBuilder
                items={items}
                onChange={setItems}
                estimatedBudget={estimatedBudget}
                onBudgetChange={setEstimatedBudget}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Istenen Maks. Teslim Suresi (Is Gunu)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value) || 7)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Vazgec
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
                >
                  {submittingRequest ? "Talebi Olusturuyor..." : "Talebi Yayinla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProcurementPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ProcurementContent />
    </Suspense>
  );
}
