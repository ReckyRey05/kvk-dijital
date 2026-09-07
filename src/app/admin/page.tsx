"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase/auth";
import {
  TrendingUp,
  CreditCard,
  Users,
  Truck,
  Building2,
  FileText,
  AlertCircle,
  ShieldCheck,
  Scale,
  Search,
  ArrowUpRight,
  Package,
  Activity,
  RefreshCw,
  Bell,
} from "lucide-react";

interface DashboardData {
  today: {
    newBusinessesCount: number;
    newSuppliersCount: number;
    pendingVerificationsCount: number;
    openDisputesCount: number;
    openReportsCount: number;
    failedPaymentsCount: number;
    newOrdersCount: number;
  };
  platform: {
    totalGmv: number;
    platformNetCommission: number;
    activeBusinessesCount: number;
    activeSuppliersCount: number;
    openRequestsCount: number;
    completedOrdersCount: number;
    currency: string;
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Dashboard yukleme hatasi:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch(`/api/teklifim-gelsin/admin/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setSearchResults(json.results);
      }
    } catch (err) {
      console.error("Arama hatasi:", err);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Platform Operasyon Merkezi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Toptancım Cebimde B2B Pazaryeri canlı operasyon, finans ve operasyonel denetim masası.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Verileri Yenile</span>
        </button>
      </div>

      {/* Global Omnibar Search */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kullanıcı adı, firma, SIP-xxx, ODE-xxx, ürün veya talep ara..."
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Temizle
            </button>
          )}
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold tracking-wide transition-colors"
          >
            {searching ? "Aranıyor..." : "Ara"}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Orders */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Siparişler ({searchResults.orders?.length || 0})
              </div>
              {searchResults.orders?.length === 0 ? (
                <div className="text-xs text-slate-600">Eşleşen sipariş bulunamadı.</div>
              ) : (
                searchResults.orders.map((o: any) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders?id=${o.id}`}
                    className="block p-2 rounded hover:bg-slate-800/60 text-xs text-slate-300 transition-colors"
                  >
                    <div className="font-mono text-primary">{o.orderNumber || o.id}</div>
                    <div className="text-slate-400">{o.businessName} &rarr; {o.supplierName}</div>
                  </Link>
                ))
              )}
            </div>

            {/* Users / Profiles */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Kullanıcılar ({searchResults.users?.length || 0})
              </div>
              {searchResults.users?.length === 0 ? (
                <div className="text-xs text-slate-600">Eşleşen kullanıcı bulunamadı.</div>
              ) : (
                searchResults.users.map((u: any) => (
                  <Link
                    key={u.uid}
                    href={`/admin/users?id=${u.uid}`}
                    className="block p-2 rounded hover:bg-slate-800/60 text-xs text-slate-300 transition-colors"
                  >
                    <div className="font-semibold text-slate-200">{u.companyName || u.contactName}</div>
                    <div className="text-slate-400">{u.email} ({u.role})</div>
                  </Link>
                ))
              )}
            </div>

            {/* Products */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Ürünler ({searchResults.products?.length || 0})
              </div>
              {searchResults.products?.length === 0 ? (
                <div className="text-xs text-slate-600">Eşleşen ürün bulunamadı.</div>
              ) : (
                searchResults.products.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/admin/products?id=${p.id}`}
                    className="block p-2 rounded hover:bg-slate-800/60 text-xs text-slate-300 transition-colors"
                  >
                    <div className="font-semibold text-slate-200">{p.title || p.name}</div>
                    <div className="text-slate-400">{p.category || "Genel"} - {p.price || 0} TL</div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* TODAY SECTION (ACTIONABLE ALERTS) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-white tracking-tight">Bugün (Son 24 Saat)</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <Link
            href="/admin/businesses"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div className="text-xs text-slate-400 font-medium">Yeni İşletmeler</div>
            <div className="text-2xl font-bold text-white mt-2">
              {data?.today.newBusinessesCount ?? 0}
            </div>
          </Link>

          <Link
            href="/admin/suppliers"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div className="text-xs text-slate-400 font-medium">Yeni Tedarikçiler</div>
            <div className="text-2xl font-bold text-white mt-2">
              {data?.today.newSuppliersCount ?? 0}
            </div>
          </Link>

          <Link
            href="/admin/verifications"
            className={`p-4 rounded-xl border transition-colors flex flex-col justify-between ${
              (data?.today.pendingVerificationsCount ?? 0) > 0
                ? "bg-amber-950/20 border-amber-800/50 hover:border-amber-700"
                : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="text-xs text-amber-400 font-medium">Onay Bekleyen</div>
            <div className="text-2xl font-bold text-amber-300 mt-2">
              {data?.today.pendingVerificationsCount ?? 0}
            </div>
          </Link>

          <Link
            href="/admin/disputes"
            className={`p-4 rounded-xl border transition-colors flex flex-col justify-between ${
              (data?.today.openDisputesCount ?? 0) > 0
                ? "bg-red-950/20 border-red-800/50 hover:border-red-700"
                : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="text-xs text-red-400 font-medium">Açık Uyuşmazlık</div>
            <div className="text-2xl font-bold text-red-300 mt-2">
              {data?.today.openDisputesCount ?? 0}
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div className="text-xs text-slate-400 font-medium">Şikayetler</div>
            <div className="text-2xl font-bold text-white mt-2">
              {data?.today.openReportsCount ?? 0}
            </div>
          </Link>

          <Link
            href="/admin/finance"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div className="text-xs text-rose-400 font-medium">Hatalı Ödemeler</div>
            <div className="text-2xl font-bold text-rose-300 mt-2">
              {data?.today.failedPaymentsCount ?? 0}
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div className="text-xs text-emerald-400 font-medium">Bugün Sipariş</div>
            <div className="text-2xl font-bold text-emerald-300 mt-2">
              {data?.today.newOrdersCount ?? 0}
            </div>
          </Link>
        </div>
      </div>

      {/* PLATFORM METRICS & FINANCIAL KPIS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-emerald-400" />
          <h2 className="text-lg font-semibold text-white tracking-tight">Platform Finans & Hacim</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* GMV */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Toplam Brüt Hacim (GMV)
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-4 tracking-tight">
              {Number(data?.platform.totalGmv || 0).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              <span className="text-sm font-normal text-slate-400">TL</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Başarılı tamamlanan tüm siparişlerin brüt işlem tutarı.
            </p>
          </div>

          {/* Platform Net Commission */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Net Komisyon Geliri
              </span>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-4 tracking-tight">
              {Number(data?.platform.platformNetCommission || 0).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              <span className="text-sm font-normal text-slate-400">TL</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Platform işletim bedeli ve tahsil edilen pazar yeri komisyonları.
            </p>
          </div>

          {/* Activity / Orders */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Tamamlanan İşlemler
              </span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Package size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-4 tracking-tight">
              {data?.platform.completedOrdersCount ?? 0}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-4">
              <span>{data?.platform.activeBusinessesCount ?? 0} İşletme</span>
              <span>•</span>
              <span>{data?.platform.activeSuppliersCount ?? 0} Tedarikçi</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK OPERATIONAL LINKS */}
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight mb-3">Hızlı Operasyon Masaları</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-primary/50 transition-colors group flex items-start justify-between"
          >
            <div>
              <Users className="text-primary mb-3" size={24} />
              <div className="font-semibold text-white group-hover:text-primary transition-colors">
                Kullanıcı & Firma Yönetimi
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Askıya alma, unban, kısıtlama ve profil denetimi.
              </div>
            </div>
            <ArrowUpRight size={16} className="text-slate-500 group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/admin/products"
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-primary/50 transition-colors group flex items-start justify-between"
          >
            <div>
              <Package className="text-purple-400 mb-3" size={24} />
              <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                Ürün Moderasyonu
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Katalog onaylama, kategori eşleme ve ürün durdurma.
              </div>
            </div>
            <ArrowUpRight size={16} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
          </Link>

          <Link
            href="/admin/disputes"
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-primary/50 transition-colors group flex items-start justify-between"
          >
            <div>
              <Scale className="text-amber-400 mb-3" size={24} />
              <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                Uyuşmazlık Çözümü
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Alıcı / Tedarikçi ihtilafları ve tahkim kararları.
              </div>
            </div>
            <ArrowUpRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>

          <Link
            href="/admin/announcements"
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-primary/50 transition-colors group flex items-start justify-between"
          >
            <div>
              <Bell className="text-rose-400 mb-3" size={24} />
              <div className="font-semibold text-white group-hover:text-rose-400 transition-colors">
                Duyuru & Bildirim Masası
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Platform geneli veya role özel canlı duyuru yayınlama.
              </div>
            </div>
            <ArrowUpRight size={16} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
