"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackageCheck,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Calendar,
  Truck,
  ArrowRight,
  Edit3,
  X,
  Lock,
} from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimOffer, TeklifimOfferStatus } from "@/types/teklifimGelsin";

export default function SupplierOffersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [offers, setOffers] = useState<TeklifimOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Edit Offer Modal state
  const [editingOffer, setEditingOffer] = useState<TeklifimOffer | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editDeliveryDays, setEditDeliveryDays] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editMinOrder, setEditMinOrder] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch("/api/teklifim-gelsin/offers", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setOffers(data.offers || []);
          }
        } catch (err) {
          console.error("Offers load error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const openEditModal = (offer: TeklifimOffer) => {
    setEditingOffer(offer);
    setEditPrice(String(offer.price ?? offer.totalPrice ?? ""));
    setEditDeliveryDays(String(offer.deliveryDays));
    setEditDescription(offer.description || "");
    setEditMinOrder(offer.minOrderQuantity || "");
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer || !currentUser) return;

    const numPrice = Number(editPrice);
    const numDays = Number(editDeliveryDays);

    if (isNaN(numPrice) || numPrice <= 0) {
      setEditError("Lütfen geçerli bir teklif tutarı girin.");
      return;
    }
    if (isNaN(numDays) || numDays <= 0) {
      setEditError("Lütfen geçerli bir teslimat süresi girin.");
      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/offers/${editingOffer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: numPrice,
          deliveryDays: numDays,
          description: editDescription,
          minOrderQuantity: editMinOrder,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Güncelleme başarısız oldu.");
      }

      const data = await res.json();
      if (data.offer) {
        setOffers((prev) =>
          prev.map((o) => (o.id === editingOffer.id ? data.offer : o))
        );
      }
      setEditingOffer(null);
    } catch (err: any) {
      setEditError(err.message || "Teklif güncellenirken bir hata oluştu.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Status counts
  const tabCounts = {
    all: offers.length,
    pending: offers.filter((o) => o.status === "pending" || o.status === "submitted").length,
    viewed: offers.filter((o) => o.status === "viewed").length,
    selected: offers.filter((o) => o.status === "selected").length,
    rejected: offers.filter((o) => o.status === "rejected").length,
    expired: offers.filter((o) => o.status === "expired").length,
  };

  // Filtered offers
  const filteredOffers = offers.filter((o) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending"
        ? o.status === "pending" || o.status === "submitted"
        : o.status === activeTab);
    const matchesSearch =
      !search.trim() ||
      o.requestTitle?.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: TeklifimOfferStatus) => {
    switch (status) {
      case "selected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Teklifiniz Seçildi</span>
          </span>
        );
      case "viewed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-300 dark:border-blue-800">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>İşletme İnceledi</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Reddedildi</span>
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Süresi Doldu</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Değerlendiriliyor</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <TeklifimHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* TITLE */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Toptancı Satış & Teklif Merkezi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Verdiğim Teklifler
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            İşletmelerin taleplerine verdiğiniz fiyatları, inceleme durumlarını ve sonuçlanan anlaşmaları buradan takip edebilirsiniz.
          </p>
        </div>

        {/* STATUS TABS & SEARCH */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {[
                { id: "all", label: "Tümü", count: tabCounts.all },
                { id: "pending", label: "Değerlendiriliyor", count: tabCounts.pending },
                { id: "viewed", label: "Görüldü", count: tabCounts.viewed },
                { id: "selected", label: "Seçildi", count: tabCounts.selected },
                { id: "rejected", label: "Reddedildi", count: tabCounts.rejected },
                { id: "expired", label: "Süresi Doldu", count: tabCounts.expired },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                        : "bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                        isActive
                          ? "bg-white/20 dark:bg-black/20 text-white dark:text-slate-950"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH */}
            <div className="relative sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tekliflerde ara..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">Teklifleriniz listeleniyor...</p>
          </div>
        ) : !currentUser ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tekliflerinizi Görmek İçin Toptancı Hesabınızla Giriş Yapın
            </h3>
            <Link
              href="/teklifim-gelsin/auth?role=supplier"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Giriş Yap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <PackageCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bu Kriterde Teklif Bulunamadı
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pazardaki açık talepleri inceleyerek işletmelere yeni teklifler sunabilirsiniz.
              </p>
            </div>
            <Link
              href="/teklifim-gelsin/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all"
            >
              <span>Açık Talepleri İncele</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => {
              const isLocked = offer.status === "selected";
              const isExpired = offer.status === "expired";

              return (
                <div
                  key={offer.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 font-sans"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(offer.status)}
                        <span className="text-xs text-slate-400">
                          {new Date(offer.createdAt).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <Link
                        href={`/teklifim-gelsin/requests/${offer.requestId}`}
                        className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block pt-1"
                      >
                        {offer.requestTitle}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/teklifim-gelsin/requests/${offer.requestId}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>Talebi Gör</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      {!isLocked && !isExpired && (
                        <button
                          onClick={() => openEditModal(offer)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Düzenle</span>
                        </button>
                      )}

                      {isLocked && (
                        <span
                          title="İşletme teklifinizi onayladığı için teklif detayları kilitlenmiştir."
                          className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Kilitli</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OFFER DETAILS STRIP */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Verilen Fiyat
                      </span>
                      <strong className="text-base font-black text-slate-900 dark:text-white">
                        {(offer.price ?? offer.totalPrice ?? 0).toLocaleString("tr-TR")} ₺
                      </strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Teslimat Süresi
                      </span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        {offer.deliveryDays} Gün
                      </strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Min. Sipariş Şartı
                      </span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                        {offer.minOrderQuantity || "Belirtilmedi"}
                      </strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Son Güncelleme
                      </span>
                      <strong className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                        {new Date(offer.updatedAt || offer.createdAt).toLocaleDateString("tr-TR")}
                      </strong>
                    </div>
                  </div>

                  {offer.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {offer.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans animate-fade-in-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                  Teklifi Güncelle
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white truncate max-w-sm">
                  {editingOffer.requestTitle}
                </h3>
              </div>
              <button
                onClick={() => setEditingOffer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 dark:text-white">
                    Fiyat (₺ KDV Dahil) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900 dark:text-white">
                    Teslimat Süresi (Gün) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editDeliveryDays}
                    onChange={(e) => setEditDeliveryDays(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-white">
                  Min. Sipariş Miktarı (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: 5 Koli veya 500 Adet"
                  value={editMinOrder}
                  onChange={(e) => setEditMinOrder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-white">
                  Teklif Detayları & Açıklama
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Ödeme şartları, ambalaj detayı, sevkiyat bilgisi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Kaydediliyor..." : "Güncellemeyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
