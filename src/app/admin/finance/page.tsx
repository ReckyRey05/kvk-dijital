"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Building2,
  Check,
  X,
  Send,
} from "lucide-react";
import { TeklifimPayment } from "@/types/teklifimGelsin";
import { auth } from "@/lib/firebase/auth";
import PaymentStatusBadge from "@/components/teklifimGelsin/PaymentStatusBadge";

interface FinanceMetrics {
  gmv: number;
  platformRevenue: number;
  totalRefunds: number;
  pendingPayouts: number;
  completedPayouts: number;
  totalTransactions: number;
}

export default function AdminFinancePage() {
  const [payments, setPayments] = useState<TeklifimPayment[]>([]);
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payout transfer modal
  const [selectedPaymentForPayout, setSelectedPaymentForPayout] = useState<TeklifimPayment | null>(null);
  const [payoutRef, setPayoutRef] = useState<string>("");
  const [payoutLoading, setPayoutLoading] = useState<boolean>(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      let url = "/api/teklifim-gelsin/admin/finance";
      if (filterStatus !== "all") {
        url += `?status=${filterStatus}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Finans verileri yüklenemedi.");
      }

      const data = await res.json();
      setPayments(data.payments || []);
      setMetrics(data.metrics || null);
    } catch (err: any) {
      setErrorMsg(err.message || "Finans raporu yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [filterStatus]);

  const handleExportCsv = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/admin/finance?format=csv", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("CSV indirilemedi.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toptancim-admin-finans-raporu-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "CSV indirilemedi.");
    }
  };

  const handleUpdatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForPayout) return;

    setPayoutLoading(true);
    setPayoutError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Giriş yapmanız gerekiyor.");

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/admin/finance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: selectedPaymentForPayout.id,
          payoutStatus: "payout_completed",
          payoutReference: payoutRef.trim() || `EFT-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hakediş güncellenemedi.");

      setSelectedPaymentForPayout(null);
      setPayoutRef("");
      fetchFinanceData();
    } catch (err: any) {
      setPayoutError(err.message || "Hakediş transfer kaydı güncellenemedi.");
    } finally {
      setPayoutLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.paymentNumber && p.paymentNumber.toLowerCase().includes(q)) ||
      (p.orderNumber && p.orderNumber.toLowerCase().includes(q)) ||
      (p.supplierId && p.supplierId.toLowerCase().includes(q)) ||
      (p.businessId && p.businessId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Finans & Komisyon Yönetimi</h1>
          <p className="text-xs text-slate-400 mt-1">
            Platform GMV, komisyon gelirleri, tedarikçi hakedişleri ve mutabakat raporları
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors self-start sm:self-auto cursor-pointer shadow-lg shadow-black/20"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Finans Raporu İndir (CSV)</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <span className="text-xs font-medium text-slate-400">Brüt Hacim (GMV)</span>
            <p className="text-2xl font-bold text-white mt-1 font-mono">
              {metrics.gmv.toLocaleString("tr-TR")} TL
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Toplam tahsil edilen</span>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <span className="text-xs font-medium text-emerald-300">Platform Komisyon Geliri</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
              {metrics.platformRevenue.toLocaleString("tr-TR")} TL
            </p>
            <span className="text-[11px] text-emerald-300/70 mt-1 block">Toptancım Cebimde net ciro</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <span className="text-xs font-medium text-slate-400">Bekleyen Hakedişler</span>
            <p className="text-2xl font-bold text-sky-400 mt-1 font-mono">
              {metrics.pendingPayouts.toLocaleString("tr-TR")} TL
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Havuzda teslimat bekleyen</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <span className="text-xs font-medium text-slate-400">Tamamlanan Transferler</span>
            <p className="text-2xl font-bold text-white mt-1 font-mono">
              {metrics.completedPayouts.toLocaleString("tr-TR")} TL
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Tedarikçiye aktarılan</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <span className="text-xs font-medium text-slate-400">Toplam İade Hacmi</span>
            <p className="text-2xl font-bold text-rose-400 mt-1 font-mono">
              {metrics.totalRefunds.toLocaleString("tr-TR")} TL
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Alıcılara iade edilen</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Ödeme No, Sipariş No veya Kullanıcı ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "paid", "pending", "partially_refunded", "refunded", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st
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

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3" />
          <p className="text-xs text-slate-400">Finans verileri yükleniyor...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">İşlem Bulunamadı</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Filtreleme kriterlerine uyan herhangi bir tahsilat kaydı bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">İşlem / Dekont No</th>
                  <th className="px-5 py-3.5">Sipariş No</th>
                  <th className="px-5 py-3.5">Tarih</th>
                  <th className="px-5 py-3.5">Brüt Tutar</th>
                  <th className="px-5 py-3.5">Komisyon Geliri</th>
                  <th className="px-5 py-3.5">Tedarikçi Hakediş</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5">Hakediş Durumu</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-white">{p.paymentNumber || p.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {p.provider} • {p.providerPaymentId || "N/A"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/teklifim-gelsin/orders/${p.orderId}`}
                        target="_blank"
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

                    <td className="px-5 py-4 font-mono font-bold text-white">
                      {p.amount.toLocaleString("tr-TR")} TL
                      {p.refundedAmount && p.refundedAmount > 0 ? (
                        <div className="text-[10px] text-rose-400 font-normal">
                          -{p.refundedAmount.toLocaleString("tr-TR")} TL İade
                        </div>
                      ) : null}
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                      +{(p.platformFee || 0).toLocaleString("tr-TR")} TL
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-200">
                      {(p.supplierAmount || 0).toLocaleString("tr-TR")} TL
                    </td>

                    <td className="px-5 py-4">
                      <PaymentStatusBadge status={p.status} />
                    </td>

                    <td className="px-5 py-4">
                      {p.payoutStatus === "payout_completed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                          <Check className="h-3 w-3" /> Aktarıldı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                          <Clock className="h-3 w-3" /> Bekliyor
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {p.status === "paid" && p.payoutStatus !== "payout_completed" ? (
                        <button
                          onClick={() => setSelectedPaymentForPayout(p)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                        >
                          <span>Aktar</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout Transfer Modal */}
      {selectedPaymentForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Hakediş Transfer Onayı</h3>
                  <p className="text-xs text-slate-400">{selectedPaymentForPayout.paymentNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaymentForPayout(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {payoutError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400 border border-rose-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{payoutError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePayout} className="space-y-4">
              <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Tedarikçi ID:</span>
                  <span className="font-mono text-slate-200">{selectedPaymentForPayout.supplierId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Aktarılacak Net Tutar:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {(selectedPaymentForPayout.supplierAmount || 0).toLocaleString("tr-TR")} TL
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Banka Transfer / Dekont / EFT Referans No
                </label>
                <input
                  type="text"
                  required
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  placeholder="EFT-2026-000123"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentForPayout(null)}
                  className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading || !payoutRef.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {payoutLoading ? "Kaydediliyor..." : "Aktarımı Tamamlandı İşaretle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
