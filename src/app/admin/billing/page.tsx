"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  CreditCard,
  TrendingUp,
  Users,
  Repeat,
  DollarSign,
  PieChart,
  Tag,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Scale,
  Calendar,
} from "lucide-react";

export default function AdminBillingPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "coupons">("overview");

  // Coupon Creation Modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  async function loadBillingData() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/billing", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBillingData();
  }, []);

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setSubmittingCoupon(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/billing/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          discountType,
          discountValue: Number(discountValue),
          maxUses: Number(maxUses),
        }),
      });

      if (res.ok) {
        setCouponModalOpen(false);
        setCouponCode("");
        loadBillingData();
      } else {
        const err = await res.json();
        alert(err.error || "Kupon olusturulamadi.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingCoupon(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Abonelik ve finansal analitik yükleniyor...
      </div>
    );
  }

  const kpis = data?.kpis;
  const recentSubs = data?.recentSubscriptions || [];
  const plans = data?.plans || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CreditCard size={26} className="text-primary" />
            Abonelik & Gelir Yönetim Merkezi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            MRR, ARR, paket dağılımları ve SaaS abonelik gelirlerinin canlı operasyonel paneli.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCouponModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors shadow-sm"
          >
            <Plus size={14} />
            Yeni Kupon
          </button>
          <button
            onClick={loadBillingData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* REVENUE SEPARATION HIGHLIGHT: Commission vs. Subscription (Requirement #29) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Scale size={16} className="text-primary" />
            <span>Platform Gelir Ayrıştırma Modeli (Gerçek Gelir Kaynakları)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            * GMV brüt işlem hacmidir, platform geliri değildir.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">SaaS Abonelik Geliri (Fiili Tahsilat)</div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {Number(kpis?.subscriptionRevenue || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </div>
            <p className="text-[11px] text-slate-500">
              Paket satışlarından platform hesabına giren net nakit akışı.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400">Pazaryeri Komisyon Geliri</div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {Number(kpis?.marketplaceCommissionRevenue || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </div>
            <p className="text-[11px] text-slate-500">
              Tamamlanan toptan siparişlerden kesilen işlem hizmet bedeli.
            </p>
          </div>

          <div className="space-y-1 border-l border-slate-800/80 pl-6">
            <div className="text-xs text-primary font-semibold">Toplam Platform Geliri</div>
            <div className="text-2xl font-extrabold text-primary font-mono">
              {Number(kpis?.totalPlatformRevenue || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </div>
            <p className="text-[11px] text-slate-500">
              Abonelik + Komisyon toplam konsolide gelir.
            </p>
          </div>
        </div>
      </div>

      {/* TOP METRICS / KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* MRR */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>MRR (Aylık Gelir)</span>
            <TrendingUp size={15} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {Number(kpis?.mrr || 0).toLocaleString("tr-TR")} TL
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Aylık tekrarlayan sözleşme geliri</div>
        </div>

        {/* ARR */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ARR (Yıllık Hacim)</span>
            <Repeat size={15} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {Number(kpis?.arr || 0).toLocaleString("tr-TR")} TL
          </div>
          <div className="text-[10px] text-slate-500 mt-1">MRR x 12 projeksiyonu</div>
        </div>

        {/* ARPU */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ARPU (Kullanıcı Başı)</span>
            <DollarSign size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {Number(kpis?.arpu || 0).toLocaleString("tr-TR")} TL
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Aktif abone başı ortalama gelir</div>
        </div>

        {/* Churn Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Churn Oranı</span>
            <AlertTriangle size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            %{kpis?.churnRate || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{kpis?.cancelledCount || 0} iptal edilen abonelik</div>
        </div>

        {/* Trial Conversion */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Deneme Dönüşümü</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            %{kpis?.trialConversionRate || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{kpis?.trialingCount || 0} aktif deneme kullanıcısı</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2 transition-colors ${
            activeTab === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Abonelikler & Dağılım
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-2 transition-colors ${
            activeTab === "plans"
              ? "text-primary border-b-2 border-primary"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Paket & Fiyatlandırma Yönetimi ({plans.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ACTIVE SUBSCRIPTIONS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Plan Distribution Bar */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Paket Dağılımı</span>
              <span className="text-slate-400">{kpis?.activeSubscriptionsCount || 0} Aktif Ücretli Abone</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {Object.entries(kpis?.planDistribution || {}).map(([tier, count]: [string, any]) => (
                <div key={tier} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 uppercase text-[10px] font-semibold">{tier}</div>
                  <div className="text-lg font-bold text-white mt-1">{count} abone</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 text-xs font-bold text-white">
              Son Abonelik Hareketleri
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Kullanıcı</th>
                    <th className="px-4 py-3">Paket & Versiyon</th>
                    <th className="px-4 py-3">Ödeme Aralığı</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3">Yenileme Tarihi</th>
                    <th className="px-4 py-3">Ödeme Yöntemi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentSubs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Kayıtlı abonelik bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    recentSubs.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{s.userEmail || s.userId}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{s.userId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-white uppercase">{s.planTier}</span>
                          <span className="text-[10px] text-slate-500 ml-1">v{s.planVersion || 1}</span>
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-400">
                          {s.interval === "yearly" ? "Yıllık" : "Aylık"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              s.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : s.status === "trialing"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : s.status === "past_due"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("tr-TR") : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {s.paymentMethod ? `${s.paymentMethod.brand} •••• ${s.paymentMethod.lastFour}` : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANS MANAGEMENT */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p: any) => (
              <div
                key={p.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-primary font-bold">
                      {p.id} (v{p.version || 1})
                    </span>
                    <h3 className="font-bold text-white text-base mt-0.5">{p.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {p.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>

                <div className="text-xs text-slate-400">{p.description}</div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400">Aylık: </span>
                    <strong className="text-white">{p.monthlyPrice} TL</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Yıllık: </span>
                    <strong className="text-white">{p.yearlyPrice} TL</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
                  <div>Talep Limiti: {p.limits?.requestsPerMonth || 0} / ay</div>
                  <div>Ürün Limiti: {p.limits?.activeProducts || 0} adet</div>
                  <div>Ekip Limiti: {p.limits?.teamMembers || 0} kişi</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-white text-sm">Yeni İndirim Kuponu Oluştur</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Kupon Kodu *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: BAHAR2026 veya HOSGELDIN20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">İndirim Türü</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none"
                  >
                    <option value="percent">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (TL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">İndirim Değeri *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Toplam Kullanım Limiti</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submittingCoupon}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
                >
                  {submittingCoupon ? "Oluşturuluyor..." : "Kuponu Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
