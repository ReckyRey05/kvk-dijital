"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Users,
  BarChart3,
  SlidersHorizontal,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  CheckCircle2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import SupplierTodayActionsBar from "@/components/teklifimGelsin/SupplierTodayActionsBar";
import SupplierOpportunitiesSection from "@/components/teklifimGelsin/SupplierOpportunitiesSection";
import SupplierKpiGrid from "@/components/teklifimGelsin/SupplierKpiGrid";
import OfferConversionCard from "@/components/teklifimGelsin/OfferConversionCard";
import BulkPriceUpdateModal from "@/components/teklifimGelsin/BulkPriceUpdateModal";
import QuoteTemplateDrawer from "@/components/teklifimGelsin/QuoteTemplateDrawer";
import SupplierOrderManagementCenter from "@/components/teklifimGelsin/SupplierOrderManagementCenter";
import CommercialCalendarWidget from "@/components/teklifimGelsin/CommercialCalendarWidget";
import SupplierAvailabilityBanner from "@/components/teklifimGelsin/SupplierAvailabilityBanner";
import {
  TeklifimOpportunityItem,
  TeklifimSupplierKpis,
  TeklifimOfferConversion,
  TeklifimProductPerformance,
  TeklifimDeliveryPerformance,
  TeklifimCommercialCalendarEvent,
  TeklifimSupplierAvailability,
  TeklifimQuoteTemplate,
  TeklifimProduct,
} from "@/types/teklifimGelsin";

function SupplierCenterContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Main Dashboard Data
  const [dashboardData, setDashboardData] = useState<{
    supplier: any;
    todayActions: {
      newOpportunitiesCount: number;
      pendingOffersCount: number;
      negotiatingOffersCount: number;
      activeOrdersCount: number;
      thisMonthSales: number;
      todayDispatchCount: number;
    };
    kpis: TeklifimSupplierKpis;
    conversion: TeklifimOfferConversion;
    opportunities: TeklifimOpportunityItem[];
    topProducts: TeklifimProductPerformance[];
    stockAlerts: TeklifimProduct[];
    delivery: TeklifimDeliveryPerformance;
    calendarEvents: TeklifimCommercialCalendarEvent[];
    availability: TeklifimSupplierAvailability;
  } | null>(null);

  // Extra state for modals & actions
  const [templates, setTemplates] = useState<TeklifimQuoteTemplate[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<TeklifimProduct[]>([]);
  const [bulkPriceModalOpen, setBulkPriceModalOpen] = useState(false);
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        try {
          const token = await currUser.getIdToken();
          setIdToken(token);
          await loadDashboard(token);
          await loadTemplates(token);
        } catch (err: any) {
          console.error("Error loading supplier center:", err);
          setError("Veriler yuklenirken bir hata olustu.");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const loadDashboard = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teklifim-gelsin/supplier-center", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setError("Bu sayfaya yalnizca tedarikci hesaplari erisebilir.");
        } else {
          setError(data.error || "Veriler alinamadi.");
        }
        return;
      }

      setDashboardData(data);
      if (data.topProducts) {
        // Map products for modals
        setSupplierProducts(
          data.topProducts.map((p: any) => ({
            id: p.productId,
            name: p.productName,
            title: p.productName,
            category: p.category,
            price: p.price,
            stockStatus: p.stockStatus,
            supplierId: currSupplierId(data),
          }))
        );
      }
    } catch (err: any) {
      setError(err.message || "Baglanti hatasi olustu.");
    } finally {
      setLoading(false);
    }
  };

  const currSupplierId = (data: any) => data?.supplier?.id || "";

  const loadTemplates = async (token: string) => {
    try {
      const res = await fetch("/api/teklifim-gelsin/supplier-center/templates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.warn("Templates load error:", err);
    }
  };

  const handleUpdateAvailability = async (next: Partial<TeklifimSupplierAvailability>) => {
    if (!idToken) return;
    try {
      const res = await fetch("/api/teklifim-gelsin/supplier-center/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(next),
      });

      if (res.ok && dashboardData) {
        setDashboardData({
          ...dashboardData,
          availability: { ...dashboardData.availability, ...next },
        });
      }
    } catch (err) {
      console.error("Availability update error:", err);
    }
  };

  const handleSaveNewTemplate = async (templateData: Partial<TeklifimQuoteTemplate>) => {
    if (!idToken) return;
    const res = await fetch("/api/teklifim-gelsin/supplier-center/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(templateData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Sablon olusturulamadi.");
    }

    const data = await res.json();
    setTemplates([data.template, ...templates]);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!idToken) return;
    const res = await fetch(`/api/teklifim-gelsin/supplier-center/templates/${templateId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (res.ok) {
      setTemplates(templates.filter((t) => t.id !== templateId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">
          Toptanci Satis Merkezi yukleniyor...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md text-center space-y-4">
          <Store className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Toptanci Satis Merkezi
          </h2>
          <p className="text-xs text-slate-500">
            Satis operasyonlarinizi yonetmek icin lutfen tedarikci hesabinizla giris yapin.
          </p>
          <Link
            href="/teklifim-gelsin/auth/login?redirect=/teklifim-gelsin/supplier-center"
            className="inline-block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Giris Yap
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-rose-200 dark:border-rose-900 max-w-md text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Erisim Engellendi</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link
            href="/teklifim-gelsin/dashboard"
            className="inline-block w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
          >
            Ana Panele Don
          </Link>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Toptanci Satis Merkezi
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {dashboardData.supplier?.companyName || "Tedarikci Paneli"} · Gunluk satis ve operasyon merkezi
                </p>
              </div>
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/teklifim-gelsin/customers"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Musteriler</span>
            </Link>

            <Link
              href="/teklifim-gelsin/supplier-center/reports"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Satis Raporlari</span>
            </Link>

            <button
              onClick={() => setTemplateDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Hizli Sablonlar ({templates.length})</span>
            </button>

            <button
              onClick={() => setBulkPriceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Toplu Fiyat Guncelle</span>
            </button>
          </div>
        </div>

        {/* Availability Banner */}
        <SupplierAvailabilityBanner
          availability={dashboardData.availability}
          onUpdateAvailability={handleUpdateAvailability}
        />

        {/* Today Actions Bar */}
        <SupplierTodayActionsBar
          metrics={dashboardData.todayActions}
          onOpenBulkPriceModal={() => setBulkPriceModalOpen(true)}
        />

        {/* Real KPI Grid */}
        <SupplierKpiGrid kpis={dashboardData.kpis} />

        {/* Stock Alerts (If low or out of stock) */}
        {dashboardData.stockAlerts && dashboardData.stockAlerts.length > 0 && (
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Stok Uyari Alarmlari ({dashboardData.stockAlerts.length} Urun)
                </h3>
              </div>
              <Link
                href="/teklifim-gelsin/products"
                className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline"
              >
                Katalogu Duzenle
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {dashboardData.stockAlerts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block line-clamp-1">
                      {prod.title || prod.name}
                    </span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      {prod.stockStatus === "out_of_stock"
                        ? "Tukendi"
                        : `Kritik Stok (${prod.stockCount ?? 0} Adet)`}
                    </span>
                  </div>
                  <Link
                    href={`/teklifim-gelsin/products?edit=${prod.id}`}
                    className="p-1 text-slate-400 hover:text-blue-600"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities Section ("Bugun Sana Uygun") */}
        <SupplierOpportunitiesSection
          opportunities={dashboardData.opportunities}
        />

        {/* Conversion Funnel & Commercial Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OfferConversionCard conversion={dashboardData.conversion} />
          <CommercialCalendarWidget events={dashboardData.calendarEvents} />
        </div>

        {/* Order & Delivery Performance Center */}
        <SupplierOrderManagementCenter
          orders={[]}
          deliveryPerformance={dashboardData.delivery}
        />

        {/* Top Products Performance Table */}
        {dashboardData.topProducts && dashboardData.topProducts.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Urun Performansi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Goruntulenme, talep alma ve satis donusum oranlari.
                </p>
              </div>
              <Link
                href="/teklifim-gelsin/products"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Tum Urunler
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Urun</th>
                    <th className="py-2 px-3">Kategori</th>
                    <th className="py-2 px-3">Fiyat</th>
                    <th className="py-2 px-3">Satis</th>
                    <th className="py-2 px-3">Toplam Ciro</th>
                    <th className="py-2 px-3 text-right">Donusum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dashboardData.topProducts.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {p.productName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{p.category}</td>
                      <td className="py-2.5 px-3 font-mono">
                        {p.price ? `${p.price.toLocaleString("tr-TR")} TL` : "-"}
                      </td>
                      <td className="py-2.5 px-3">{p.salesCount} Adet</td>
                      <td className="py-2.5 px-3 font-bold text-teal-700 dark:text-teal-300">
                        {p.totalRevenue.toLocaleString("tr-TR")} TL
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-blue-600">
                        {typeof p.conversionRate === "number" ? `%${p.conversionRate}` : "Yetersiz Veri"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <BulkPriceUpdateModal
        isOpen={bulkPriceModalOpen}
        onClose={() => setBulkPriceModalOpen(false)}
        products={supplierProducts}
        idToken={idToken}
        onSuccess={() => loadDashboard(idToken)}
      />

      <QuoteTemplateDrawer
        isOpen={templateDrawerOpen}
        onClose={() => setTemplateDrawerOpen(false)}
        templates={templates}
        catalogProducts={supplierProducts}
        onSaveNewTemplate={handleSaveNewTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
    </div>
  );
}

export default function SupplierCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs text-slate-400">Yukleniyor...</p>
        </div>
      }
    >
      <SupplierCenterContent />
    </Suspense>
  );
}
