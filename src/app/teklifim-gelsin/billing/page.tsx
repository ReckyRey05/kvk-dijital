"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase/auth";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Receipt,
  Sparkles,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  XCircle,
  HelpCircle,
} from "lucide-react";

export default function UserBillingPage() {
  const [data, setData] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [cancelling, setCancelling] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";

      const [subRes, plansRes, historyRes] = await Promise.all([
        fetch("/api/teklifim-gelsin/subscription", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/teklifim-gelsin/subscription/plans"),
        fetch("/api/teklifim-gelsin/subscription/billing-history", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (subRes.ok) {
        const subJson = await subRes.json();
        setData(subJson);
      }
      if (plansRes.ok) {
        const plansJson = await plansRes.json();
        setPlans(plansJson.plans || []);
      }
      if (historyRes.ok) {
        const histJson = await historyRes.json();
        setBillingHistory(histJson.records || []);
      }
    } catch (err) {
      console.error("Billing yukleme hatasi:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleStartTrial(planTier: string) {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/subscription/trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planTier }),
      });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Deneme suresi baslatilamadi.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCancelSubscription() {
    if (!confirm("Aboneliginizi donem sonunda sonlandirmak istediginize emin misiniz?")) return;
    setCancelling(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          immediately: false,
          reason: "Kullanici istegi",
        }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Abonelik ve kullanım bilgileri yükleniyor...
      </div>
    );
  }

  const sub = data?.subscription;
  const usage = data?.usage;
  const currentPlan = data?.plan;

  // Calculate usage percentages
  const reqUsed = usage?.metrics?.requestsUsed || 0;
  const reqLimit = currentPlan?.limits?.requestsPerMonth || 1;
  const reqRatio = Math.min(100, Math.round((reqUsed / reqLimit) * 100));

  const prodUsed = usage?.metrics?.productsActive || 0;
  const prodLimit = currentPlan?.limits?.activeProducts || 1;
  const prodRatio = Math.min(100, Math.round((prodUsed / prodLimit) * 100));

  const teamUsed = usage?.metrics?.teamMembersActive || 1;
  const teamLimit = currentPlan?.limits?.teamMembers || 1;
  const teamRatio = Math.min(100, Math.round((teamUsed / teamLimit) * 100));

  const isSoftLimitWarning = reqRatio >= 80 || prodRatio >= 80;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CreditCard size={26} className="text-primary" />
            Abonelik & Paket Masası
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Mevcut paket haklarınızı, aylık kullanım oranlarınızı ve fatura dökümünüzü inceleyin.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          Yenile
        </button>
      </div>

      {/* Soft Limit Warning Banner */}
      {isSoftLimitWarning && sub?.planTier !== "pro_business" && sub?.planTier !== "pro_supplier" && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-400 flex-shrink-0" size={22} />
            <div>
              <div className="text-sm font-semibold text-amber-300">
                Aylık Kullanım Limitine Yaklaştınız
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Mevcut paketinizin sınırlarına ulaşmak üzeresiniz. Operasyonlarınızın kesintiye uğramaması için planınızı yükseltebilirsiniz.
              </div>
            </div>
          </div>
          <a
            href="#plans-section"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors text-center whitespace-nowrap"
          >
            Planı Yükselt
          </a>
        </div>
      )}

      {/* CURRENT PLAN & USAGE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Plan Summary Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-950 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                Mevcut Paketiniz
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {currentPlan?.name || "Ücretsiz Plan"}
              </h2>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                sub?.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : sub?.status === "trialing"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : sub?.status === "past_due"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {sub?.status === "trialing" ? "Deneme Sürümü" : sub?.status === "active" ? "Aktif" : sub?.status}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {currentPlan?.description}
          </p>

          <div className="border-t border-slate-800/80 pt-4 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fatura Dönemi</span>
              <span className="font-semibold text-white capitalize">{sub?.interval === "yearly" ? "Yıllık" : "Aylık"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dönem Bitişi / Yenileme</span>
              <span className="font-semibold text-white font-mono">
                {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("tr-TR") : "-"}
              </span>
            </div>
            {sub?.paymentMethod && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kayıtlı Ödeme Yöntemi</span>
                <span className="font-mono text-slate-200">
                  {sub.paymentMethod.brand} •••• {sub.paymentMethod.lastFour}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2">
            <a
              href="#plans-section"
              className="w-full text-center px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors shadow-lg shadow-primary/20"
            >
              Planı Değiştir / Yükselt
            </a>
            {sub?.status === "active" && !sub?.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="w-full text-center py-2 text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                Aboneliği Dönem Sonunda İptal Et
              </button>
            )}
            {sub?.cancelAtPeriodEnd && (
              <div className="text-[11px] text-amber-400 text-center bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                Aboneliğiniz dönem sonunda sonlandırılacaktır.
              </div>
            )}
          </div>
        </div>

        {/* Real Usage Meters Card */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="text-sm font-semibold text-white">Mevcut Dönem Kullanım Durumu</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Dönem: {usage?.period || "Bu Ay"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Request usage meter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300">Aylık Alım Talebi</span>
                <span className="font-mono text-slate-400">
                  <strong className="text-white">{reqUsed}</strong> / {reqLimit} talep
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    reqRatio >= 100
                      ? "bg-red-500"
                      : reqRatio >= 80
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${reqRatio}%` }}
                />
              </div>
            </div>

            {/* Product count meter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300">Aktif Katalog Ürünü</span>
                <span className="font-mono text-slate-400">
                  <strong className="text-white">{prodUsed}</strong> / {prodLimit} ürün
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    prodRatio >= 100
                      ? "bg-red-500"
                      : prodRatio >= 80
                      ? "bg-amber-500"
                      : "bg-purple-500"
                  }`}
                  style={{ width: `${prodRatio}%` }}
                />
              </div>
            </div>

            {/* Team members meter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300">Ekip Üyeleri</span>
                <span className="font-mono text-slate-400">
                  <strong className="text-white">{teamUsed}</strong> / {teamLimit} kişi
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${teamRatio}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-medium text-slate-300">Limit Politikası & Haklar</div>
            <div>
              Limit aşımı durumunda mevcut verileriniz korunur. Yalnızca yeni talep veya ürün ekleme kısıtlanır.
            </div>
          </div>
        </div>
      </div>

      {/* PLAN COMPARISON SECTION */}
      <div id="plans-section" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            İşletmenize Uygun Paketi Seçin
          </h2>
          <p className="text-xs text-slate-400">
            Toptan ticaret hacminize göre dilediğiniz zaman yükseltebilir veya dönem sonunda değiştirebilirsiniz.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 mt-3">
            <button
              onClick={() => setInterval("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                interval === "monthly" ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Aylık Ödeme
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                interval === "yearly" ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Yıllık Ödeme</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                %17 İndirim
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {plans.map((p) => {
            const isCurrent = sub?.planTier === p.tier;
            const price = interval === "yearly" ? Math.round(p.yearlyPrice / 12) : p.monthlyPrice;

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "bg-slate-900 border-2 border-primary shadow-xl shadow-primary/10"
                    : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white">{p.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description}</div>

                  <div className="mt-4 pb-4 border-b border-slate-800">
                    <div className="text-2xl font-extrabold text-white">
                      {price > 0 ? `${price} TL` : "Ücretsiz"}
                    </div>
                    {price > 0 && (
                      <div className="text-[10px] text-slate-500">
                        {interval === "yearly" ? `Yıllık ${p.yearlyPrice} TL (KDV hariç)` : "Aylık (KDV hariç)"}
                      </div>
                    )}
                  </div>

                  {/* Limits List */}
                  <div className="py-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>{p.limits.requestsPerMonth} Talep / Ay</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>{p.limits.activeProducts} Katalog Ürünü</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>{p.limits.teamMembers} Ekip Üyesi</span>
                    </div>
                    {p.features.advancedReports && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
                        <span>Gelişmiş Raporlama</span>
                      </div>
                    )}
                    {p.features.apiAccess && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
                        <span>API & Webhook Erişimi</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  {isCurrent ? (
                    <div className="w-full py-2 text-center text-xs font-semibold text-primary bg-primary/10 rounded-xl border border-primary/20">
                      Mevcut Planınız
                    </div>
                  ) : p.tier === "free" ? (
                    <div className="w-full py-2 text-center text-xs text-slate-500">
                      Başlangıç
                    </div>
                  ) : !sub?.hasUsedTrial && p.trialDays > 0 ? (
                    <button
                      onClick={() => handleStartTrial(p.tier)}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md"
                    >
                      14 Gün Ücretsiz Dene
                    </button>
                  ) : (
                    <Link
                      href={`/teklifim-gelsin/billing/checkout/${p.id}?interval=${interval}`}
                      className="block w-full py-2 text-center rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors shadow-md"
                    >
                      Planı Seç
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLING & INVOICE HISTORY */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Receipt size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-white">Abonelik Faturaları & Ödeme Geçmişi</h3>
        </div>

        {billingHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Henüz oluşturulmuş bir platform abonelik faturanız bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Fatura No</th>
                  <th className="px-4 py-2.5">Paket</th>
                  <th className="px-4 py-2.5">Dönem</th>
                  <th className="px-4 py-2.5">Tutar (KDV Dahil)</th>
                  <th className="px-4 py-2.5">Tarih</th>
                  <th className="px-4 py-2.5">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {billingHistory.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono font-semibold text-primary">
                      {b.invoiceNumber || b.id}
                    </td>
                    <td className="px-4 py-3 uppercase font-medium text-white">{b.planTier}</td>
                    <td className="px-4 py-3 capitalize text-slate-400">
                      {b.interval === "yearly" ? "Yıllık" : "Aylık"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white font-mono">
                      {Number(b.totalAmount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                        <CheckCircle2 size={12} />
                        Ödendi
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
