"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ShieldCheck,
  Search,
  ExternalLink,
  Filter,
  Check,
} from "lucide-react";
import { TeklifimOrder, TeklifimOrderStatus } from "@/types/teklifimGelsin";
import { auth } from "@/lib/firebase/auth";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<TeklifimOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Dispute resolution modal state
  const [selectedOrder, setSelectedOrder] = useState<TeklifimOrder | null>(null);
  const [resolutionOutcome, setResolutionOutcome] = useState<"completed" | "cancelled" | "preparing">("completed");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const url =
        filterStatus === "all"
          ? "/api/teklifim-gelsin/admin/orders"
          : `/api/teklifim-gelsin/admin/orders?status=${filterStatus}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!resolutionNotes.trim()) {
      setActionError("Lütfen çözüm kararı gerekçesini giriniz.");
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          resolutionOutcome,
          resolutionNotes: resolutionNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Uyuşmazlık çözümlenemedi.");

      setSelectedOrder(null);
      setResolutionNotes("");
      await fetchOrders();
    } catch (err: any) {
      setActionError(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      (o.businessName || "").toLowerCase().includes(q) ||
      (o.supplierName || "").toLowerCase().includes(q) ||
      (o.requestTitle || "").toLowerCase().includes(q)
    );
  });

  const disputedCount = orders.filter((o) => o.status === "disputed").length;
  const activeCount = orders.filter((o) => ["preparing", "ready_for_dispatch", "shipped"].includes(o.status)).length;
  const completedVolume = orders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);

  const getStatusBadge = (status: TeklifimOrderStatus) => {
    switch (status) {
      case "preparing":
        return <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-semibold">Hazırlanıyor</span>;
      case "ready_for_dispatch":
        return <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold">Sevke Hazır</span>;
      case "shipped":
        return <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 font-semibold">Kargoda</span>;
      case "delivered":
        return <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">Teslim Edildi</span>;
      case "completed":
        return <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-bold">Tamamlandı</span>;
      case "cancelled":
        return <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-500/20 text-zinc-400 font-semibold">İptal Edildi</span>;
      case "disputed":
        return <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold animate-pulse">İtiraz / Uyuşmazlık</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="text-accent" />
            <span>Pazaryeri Sipariş & Uyuşmazlık Yönetimi</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            B2B anlaşmalarından doğan tüm siparişleri, sevkiyatları ve itiraz süreçlerini denetleyin.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="text-white/60 text-xs font-semibold uppercase">Toplam Sipariş</div>
          <div className="text-2xl font-black text-white mt-1">{orders.length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="text-rose-400 text-xs font-semibold uppercase">Uyuşmazlıktaki Siparişler</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{disputedCount}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="text-blue-400 text-xs font-semibold uppercase">Aktif Sevkiyatlar</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="text-emerald-400 text-xs font-semibold uppercase">Tamamlanan Ticaret Hacmi</div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            ₺{completedVolume.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === "all" ? "bg-accent text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterStatus("disputed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === "disputed" ? "bg-rose-500 text-white" : "text-rose-400/80 hover:text-rose-300"
            }`}
          >
            İtirazlar ({disputedCount})
          </button>
          <button
            onClick={() => setFilterStatus("preparing")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === "preparing" ? "bg-blue-500 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Hazırlananlar
          </button>
          <button
            onClick={() => setFilterStatus("shipped")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === "shipped" ? "bg-sky-500 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Kargodakiler
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === "completed" ? "bg-emerald-500 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Tamamlananlar
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sipariş no, firma ara..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/40 text-sm">Siparişler yükleniyor...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">Filtrelere uygun sipariş bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/5 border-b border-white/10 text-white/40 uppercase font-semibold">
                <tr>
                  <th className="p-4">Sipariş No</th>
                  <th className="p-4">Alıcı İşletme</th>
                  <th className="p-4">Tedarikçi</th>
                  <th className="p-4">Talep Başlığı</th>
                  <th className="p-4">Tutar</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-white">{o.orderNumber}</td>
                    <td className="p-4 text-white font-medium">{o.businessName}</td>
                    <td className="p-4 text-white font-medium">{o.supplierName}</td>
                    <td className="p-4 text-white/70 max-w-[180px] truncate">{o.requestTitle}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      ₺{Number(o.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">{getStatusBadge(o.status)}</td>
                    <td className="p-4 text-white/50">{new Date(o.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="p-4 text-right space-x-2">
                      {o.status === "disputed" && (
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setResolutionNotes("");
                            setActionError(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition"
                        >
                          Uyuşmazlığı Çöz
                        </button>
                      )}
                      <Link
                        href={`/teklifim-gelsin/orders/${o.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition font-medium"
                      >
                        <span>İncele</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Dispute Resolution Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-zinc-900 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <AlertTriangle className="h-5 w-5" />
                <span>Uyuşmazlık Çözümleme Kararı</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/40 hover:text-white"
              >
                Kapat
              </button>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl text-xs space-y-1">
              <div>
                <strong>Sipariş No:</strong> {selectedOrder.orderNumber}
              </div>
              <div>
                <strong>Alıcı:</strong> {selectedOrder.businessName} | <strong>Satıcı:</strong> {selectedOrder.supplierName}
              </div>
              <div>
                <strong>İtiraz Nedeni:</strong> {selectedOrder.dispute?.reason || "Belirtilmedi"}
              </div>
              <div>
                <strong>İtiraz Detayı:</strong> {selectedOrder.dispute?.description}
              </div>
            </div>

            {actionError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {actionError}
              </div>
            )}

            <form onSubmit={handleResolveDispute} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/80 font-semibold mb-1">
                  Yönetim Kararı / Çözüm Sonucu
                </label>
                <select
                  value={resolutionOutcome}
                  onChange={(e) =>
                    setResolutionOutcome(e.target.value as "completed" | "cancelled" | "preparing")
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white focus:border-accent focus:outline-none"
                >
                  <option value="completed" className="bg-zinc-900">
                    Siparişi Onayla ve Tamamla (completed)
                  </option>
                  <option value="cancelled" className="bg-zinc-900">
                    Siparişi İptal Et (cancelled)
                  </option>
                  <option value="preparing" className="bg-zinc-900">
                    Eksikleri Gidermek Üzere Hazırlığa Döndür (preparing)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 font-semibold mb-1">
                  Resmi Çözüm Gerekçesi / İnceleme Notu <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="KvK Dijital yönetim incelemesi sonucu alınan kararı ve taraflara iletilecek gerekçeyi yazınız..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white font-medium"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-accent text-white font-bold hover:bg-accent/80 disabled:opacity-50 transition"
                >
                  {submitting ? "Kaydediliyor..." : "Kararı Uygula ve Bildir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
