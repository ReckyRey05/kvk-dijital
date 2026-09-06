"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimPayment, TeklifimSupplierPayoutSummary } from "@/types/teklifimGelsin";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import PaymentStatusBadge from "@/components/teklifimGelsin/PaymentStatusBadge";
import {
  CreditCard,
  TrendingUp,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";

type ActiveTab = "buyer" | "supplier";

export default function PaymentsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("buyer");
  const [payments, setPayments] = useState<TeklifimPayment[]>([]);
  const [supplierOverview, setSupplierOverview] = useState<TeklifimSupplierPayoutSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/login?redirect=" + encodeURIComponent("/teklifim-gelsin/payments"));
      } else {
        setCurrentUser(user);
        loadPayments(user, activeTab, statusFilter);
      }
    });
    return () => unsub();
  }, [router, activeTab, statusFilter]);

  const loadPayments = async (user: any, role: ActiveTab, status: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = await user.getIdToken();
      let url = `/api/teklifim-gelsin/payments?role=${role}`;
      if (status !== "all") {
        url += `&status=${status}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Ödeme kayıtları yüklenemedi.");
      }

      const data = await res.json();
      setPayments(data.payments || []);
      if (data.supplierOverview) {
        setSupplierOverview(data.supplierOverview);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/payments?role=${activeTab}&format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("CSV indirilemedi.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toptancim-odemeler-${activeTab}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "CSV indirilemedi.");
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.paymentNumber && p.paymentNumber.toLowerCase().includes(q)) ||
      (p.orderNumber && p.orderNumber.toLowerCase().includes(q)) ||
      (p.businessId && p.businessId.toLowerCase().includes(q)) ||
      (p.supplierId && p.supplierId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TeklifimHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="h-4 w-4" /> B2B Finans & Ödeme Portali
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Ödemeler ve Finansal Hesap</h1>
            <p className="text-sm text-slate-400 mt-1">
              Güvenli havuz ödemeleri, hakedişler, komisyon kesintileri ve iade dökümü
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>CSV / Excel Raporu İndir</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Buyer vs Supplier */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab("buyer")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "buyer"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Yaptığım Ödemeler (Alıcı)</span>
          </button>
          <button
            onClick={() => setActiveTab("supplier")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "supplier"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Finans & Hakedişlerim (Tedarikçi)</span>
          </button>
        </div>

        {/* Supplier Metrics Cards */}
        {activeTab === "supplier" && supplierOverview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <span className="text-xs font-medium text-slate-400">Toplam Satış Hacmi</span>
              <p className="text-2xl font-bold text-white mt-1 font-mono">
                {supplierOverview.totalSalesVolume.toLocaleString("tr-TR")} TL
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {supplierOverview.transactionsCount} sipariş işlemi
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <span className="text-xs font-medium text-slate-400">Platform Komisyonu</span>
              <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                {supplierOverview.totalCommissionPaid.toLocaleString("tr-TR")} TL
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Toptancım Cebimde payı</span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <span className="text-xs font-medium text-emerald-300">Net Hakediş Kazancı</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {supplierOverview.netPayoutEarned.toLocaleString("tr-TR")} TL
              </p>
              <span className="text-[11px] text-emerald-300/70 mt-1 block">Komisyon sonrası net kazanç</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <span className="text-xs font-medium text-slate-400">Bekleyen Hakediş (Havuzda)</span>
              <p className="text-2xl font-bold text-sky-400 mt-1 font-mono">
                {supplierOverview.pendingPayout.toLocaleString("tr-TR")} TL
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Teslimat onayı bekleniyor</span>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ödeme No veya Sipariş No ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["all", "paid", "pending", "partially_refunded", "refunded", "failed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {st === "all"
                  ? "Tümü"
                  : st === "paid"
                  ? "Ödendi"
                  : st === "pending"
                  ? "Beklemede"
                  : st === "partially_refunded"
                  ? "Kısmi İade"
                  : st === "refunded"
                  ? "İade Edildi"
                  : "Başarısız"}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Transactions Table / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3" />
            <p className="text-xs text-slate-400">Ödeme kayıtları getiriliyor...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Kayıt Bulunamadı</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Bu filtreye uygun herhangi bir ödeme veya tahsilat işlemi bulunmamaktadır.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Dekont / No</th>
                    <th className="px-5 py-3.5">Sipariş</th>
                    <th className="px-5 py-3.5">Tarih</th>
                    <th className="px-5 py-3.5">Tutar</th>
                    {activeTab === "supplier" && (
                      <>
                        <th className="px-5 py-3.5">Komisyon</th>
                        <th className="px-5 py-3.5">Hakediş Payınız</th>
                      </>
                    )}
                    <th className="px-5 py-3.5">Durum</th>
                    <th className="px-5 py-3.5 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-white">{p.paymentNumber || p.id}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.cardBrand ? `${p.cardBrand} •••• ${p.cardLastFour}` : "Kartlı Tahsilat"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/teklifim-gelsin/orders/${p.orderId}`}
                          className="font-mono text-emerald-400 hover:underline font-medium"
                        >
                          {p.orderNumber || p.orderId}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                        {p.amount.toLocaleString("tr-TR")} TL
                        {p.refundedAmount && p.refundedAmount > 0 ? (
                          <div className="text-[11px] font-normal text-rose-400">
                            -{p.refundedAmount.toLocaleString("tr-TR")} TL İade
                          </div>
                        ) : null}
                      </td>

                      {activeTab === "supplier" && (
                        <>
                          <td className="px-5 py-4 font-mono text-amber-400">
                            -{(p.platformFee || 0).toLocaleString("tr-TR")} TL
                            <span className="text-[10px] text-slate-500 block">
                              (%{(((p.platformFee || 0) / (p.amount || 1)) * 100).toFixed(1)})
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-emerald-400 text-sm">
                            {(p.supplierAmount || 0).toLocaleString("tr-TR")} TL
                            <div className="text-[10px] font-normal text-slate-400">
                              {p.payoutStatus === "payout_completed"
                                ? "Aktarıldı"
                                : "Havuzda (Beklemede)"}
                            </div>
                          </td>
                        </>
                      )}

                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={p.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/teklifim-gelsin/orders/${p.orderId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
                        >
                          <span>Detay</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
