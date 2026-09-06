"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  Package,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Heart,
  Send,
  Star,
  ShieldAlert,
  Ban,
  Edit3,
  ExternalLink,
  Repeat,
  AlertCircle,
  Globe,
} from "lucide-react";
import {
  TeklifimProfile,
  TeklifimProduct,
  TeklifimRequest,
  TeklifimReview,
} from "@/types/teklifimGelsin";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import SupplierProductModal from "@/components/teklifimGelsin/SupplierProductModal";
import DirectRequestModal from "@/components/teklifimGelsin/DirectRequestModal";
import TrustSignals from "@/components/teklifimGelsin/TrustSignals";
import ProfileCompletionCard from "@/components/teklifimGelsin/ProfileCompletionCard";
import EditProfileModal from "@/components/teklifimGelsin/EditProfileModal";
import ReportModal from "@/components/teklifimGelsin/ReportModal";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

export default function TeklifimSupplierProfilePage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const supplierId = resolvedParams.supplierId;

  const [supplier, setSupplier] = useState<TeklifimProfile | null>(null);
  const [products, setProducts] = useState<TeklifimProduct[]>([]);
  const [reviews, setReviews] = useState<TeklifimReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth & relationship state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [priorCompletedDealsCount, setPriorCompletedDealsCount] = useState(0);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [directQuoteModalOpen, setDirectQuoteModalOpen] = useState(false);
  const [openRequests, setOpenRequests] = useState<TeklifimRequest[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);

  // Load User relationships (favorites, blocks, prior collaboration)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsOwner(user.uid === supplierId);
        try {
          const token = await user.getIdToken();

          // 1. Favorites check
          const fRes = await fetch("/api/teklifim-gelsin/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (fRes.ok) {
            const fData = await fRes.json();
            const exists = (fData.favorites || []).some(
              (f: any) => f.supplierId === supplierId
            );
            setIsFavorited(exists);
          }

          // 2. Block check
          const bRes = await fetch("/api/teklifim-gelsin/blocks", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (bRes.ok) {
            const bData = await bRes.json();
            const blocked = (bData.blocks || []).some(
              (b: any) => b.blockedId === supplierId
            );
            setIsBlocked(blocked);
          }

          // 3. Prior completed deals check
          const rRes = await fetch("/api/teklifim-gelsin/requests?role=business", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            const completedWithThisSupplier = (rData.requests || []).filter(
              (r: TeklifimRequest) =>
                r.status === "completed" && r.selectedSupplierId === supplierId
            );
            setPriorCompletedDealsCount(completedWithThisSupplier.length);
          }
        } catch (err) {
          console.warn("User relationship check notice:", err);
        }
      } else {
        setIsOwner(false);
        setIsFavorited(false);
        setIsBlocked(false);
        setPriorCompletedDealsCount(0);
      }
    });

    return () => unsub();
  }, [supplierId]);

  // Load Supplier Data, Products, Reviews
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Load Profile
        const { db } = await import("@/lib/firebase/firestore");
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "teklifim_profiles", supplierId));

        if (snap.exists()) {
          setSupplier(snap.data() as TeklifimProfile);
        }

        // 2. Load Products
        const prodRes = await fetch(
          `/api/teklifim-gelsin/suppliers/${supplierId}/products`
        );
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }

        // 3. Load Reviews
        const revRes = await fetch(
          `/api/teklifim-gelsin/reviews?supplierId=${supplierId}`
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData.reviews || []);
        }
      } catch (e) {
        console.warn("Supplier profile lookup notice:", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supplierId]);

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      router.push("/teklifim-gelsin/auth?role=business");
      return;
    }
    if (!supplier) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplier }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.favorited);
      }
    } catch (err) {
      console.error("Favorite error:", err);
    }
  };

  const handleToggleBlock = async () => {
    if (!currentUser) {
      router.push("/teklifim-gelsin/auth?role=business");
      return;
    }
    if (!supplier) return;

    try {
      const token = await currentUser.getIdToken();
      if (isBlocked) {
        const res = await fetch(
          `/api/teklifim-gelsin/blocks?blockedId=${supplierId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) setIsBlocked(false);
      } else {
        if (!confirm(`${supplier.companyName} firmasını engellemek istediğinize emin misiniz? Engellendiğinde taleplerinizi göremez ve teklif iletemez.`)) {
          return;
        }
        const res = await fetch("/api/teklifim-gelsin/blocks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            blockedId: supplierId,
            blockedName: supplier.companyName,
          }),
        });
        if (res.ok) setIsBlocked(true);
      }
    } catch (err) {
      console.error("Block toggle error:", err);
    }
  };

  const handleOpenDirectQuote = async () => {
    if (!currentUser) {
      router.push("/teklifim-gelsin/auth?role=business");
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const rRes = await fetch("/api/teklifim-gelsin/requests?role=business", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        const active = (rData.requests || []).filter(
          (r: TeklifimRequest) =>
            r.status !== "supplier_selected" &&
            r.status !== "completed" &&
            r.status !== "cancelled" &&
            r.status !== "expired"
        );
        setOpenRequests(active);
        setDirectQuoteModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  const handleSendDirectInvitation = async (requestId: string) => {
    if (!currentUser) return;
    setSendingInvite(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/requests/${requestId}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplierId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Davet iletilemedi.");
      }
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAddProduct = async (productData: Partial<TeklifimProduct>) => {
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    const res = await fetch(
      `/api/teklifim-gelsin/suppliers/${supplierId}/products`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Ürün eklenemedi.");
    }

    const data = await res.json();
    if (data.product) {
      setProducts((prev) => [data.product, ...prev]);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser || !confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `/api/teklifim-gelsin/suppliers/${supplierId}/products?productId=${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  const isVerified = supplier?.isVerified || supplier?.verificationStatus === "verified";

  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <TeklifimHeader />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* TOP BAR / BACK NAVIGATION */}
          <div className="flex items-center justify-between">
            <Link
              href="/teklifim-gelsin/suppliers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tedarikçi Listesine Dön</span>
            </Link>

            {supplier && !isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isFavorited
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                      : "bg-white dark:bg-[#0E131F] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 hover:border-rose-200"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFavorited ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                  <span>{isFavorited ? "Favorilerimde" : "Favoriye Ekle"}</span>
                </button>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0E131F] text-neutral-500 hover:text-rose-500 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Şikayet Bildir"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Şikayet Et</span>
                </button>

                <button
                  onClick={handleToggleBlock}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    isBlocked
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0E131F] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                  title={isBlocked ? "Engeli Kaldır" : "Engelle"}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isBlocked ? "Engellendi" : "Engelle"}</span>
                </button>
              </div>
            )}
          </div>

          {/* BLOCKED BANNER */}
          {isBlocked && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 shrink-0" />
                <span>Bu toptancıyı engellediniz. Firma sizin taleplerinizi göremez ve yeni teklif veremez.</span>
              </div>
              <button
                onClick={handleToggleBlock}
                className="text-xs underline font-bold hover:text-rose-700 cursor-pointer ml-4 shrink-0"
              >
                Engeli Kaldır
              </button>
            </div>
          )}

          {/* PRIOR COLLABORATION RE-ORDER CTA BANNER */}
          {priorCompletedDealsCount > 0 && !isOwner && (
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200">
                    Daha Önce Birlikte Çalıştınız
                  </h4>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    Bu tedarikçiyle daha önce {priorCompletedDealsCount} sipariş başarıyla tamamlandı.
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenDirectQuote}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Bu Firmadan Tekrar Teklif İste</span>
              </button>
            </div>
          )}

          {/* OWNER PROFILE COMPLETION HELPER */}
          {isOwner && supplier && (
            <div className="space-y-4">
              <ProfileCompletionCard
                profile={supplier}
                onEdit={() => setEditProfileModalOpen(true)}
              />

              {!isVerified && (
                <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      Firmanız henüz doğrulanmadı. Vergi levhanızla doğrulama başvurusu yaparak <strong>✓ Doğrulanmış Firma</strong> rozeti alabilirsiniz.
                    </span>
                  </div>
                  <Link
                    href="/teklifim-gelsin/verification"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 text-center transition-colors"
                  >
                    Hemen Doğrula
                  </Link>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                Tedarikçi Profili Yükleniyor...
              </p>
            </div>
          ) : !supplier ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
              <Building2 className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Firma Profili Bulunamadı
              </h3>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TRUST-FIRST HEADER CARD */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E131F] border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="space-y-2">
                    {/* BADGES */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isVerified && (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>✓ Doğrulanmış Firma</span>
                        </span>
                      )}

                      {supplier.rating && supplier.reviewCount ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{supplier.rating.toFixed(1)}</span>
                          <span className="text-neutral-400 font-normal">({supplier.reviewCount} Değerlendirme)</span>
                        </span>
                      ) : null}

                      {supplier.yearFounded && (
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold">
                          Kuruluş: {supplier.yearFounded}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                        {supplier.companyName}
                      </h1>

                      {isOwner && (
                        <button
                          onClick={() => setEditProfileModalOpen(true)}
                          className="px-3 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Düzenle</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {supplier.city} {supplier.district ? `(${supplier.district})` : ""}
                      </span>
                      {supplier.contactName && (
                        <>
                          <span>•</span>
                          <span>Yetkili: {supplier.contactName}</span>
                        </>
                      )}
                      {supplier.website && (
                        <>
                          <span>•</span>
                          <a
                            href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Web Sitesi</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* DIRECT QUOTE CTA */}
                  {!isOwner && (
                    <button
                      onClick={handleOpenDirectQuote}
                      className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>Bu Firmadan Teklif İste</span>
                    </button>
                  )}
                </div>

                {supplier.description && (
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                    {supplier.description}
                  </p>
                )}

                {/* TRUST SIGNALS STRIP (Omits unverified / zero data signals) */}
                <TrustSignals supplier={supplier} />
              </div>

              {/* SUPPLIER PRODUCT CATALOG SECTION */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E131F] border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                      Tedarik Vitrini
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                      Tedarikçinin Ürün & Hizmet Kataloğu
                    </h2>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => setProductModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Ürün Ekle</span>
                    </button>
                  )}
                </div>

                {products.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-2">
                    <Package className="w-6 h-6 text-neutral-400 mx-auto" />
                    <p className="text-xs text-neutral-500 font-medium">
                      Henüz listelenmiş ürün bulunmuyor. Bu tedarikçiden özel talep açarak teklif isteyebilirsiniz.
                    </p>
                    {isOwner && (
                      <button
                        onClick={() => setProductModalOpen(true)}
                        className="mt-2 text-xs font-bold text-emerald-600 hover:underline inline-block cursor-pointer"
                      >
                        İlk Ürününüzü Ekleyin
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-800 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                              {prod.category}
                            </span>
                            {isOwner && (
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                title="Ürünü Sil"
                                className="text-neutral-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                            {prod.name}
                          </h4>
                          {prod.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                              {prod.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Min. Sipariş</span>
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                              {prod.minOrder || "1"} {prod.unit || "Birim"}
                            </span>
                          </div>

                          {prod.estimatedPrice && (
                            <div className="text-right">
                              <span className="text-[10px] text-neutral-400 block">Tahmini Fiyat</span>
                              <span className="font-black text-neutral-900 dark:text-white">
                                {prod.estimatedPrice.toLocaleString("tr-TR")} ₺
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COMMERCIAL DETAILS: CATEGORIES & DELIVERY REGIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CATEGORIES */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                    Uzmanlık ve Üretim Kategorileri
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(supplier.categories || []).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* DELIVERY REGIONS */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                    Teslimat & Dağıtım Ağları
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(supplier.deliveryRegions || ["Tüm Türkiye"]).map((reg, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3 text-blue-500" />
                        <span>{reg}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CUSTOMER REVIEWS & REPUTATION */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E131F] border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                      Müşteri Memnuniyeti & Güven
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>Tamamlanan Sipariş Değerlendirmeleri</span>
                      {reviews.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
                          {reviews.length}
                        </span>
                      )}
                    </h2>
                  </div>

                  {supplier.rating && supplier.reviewCount ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(supplier.rating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300 dark:text-neutral-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-base font-black text-neutral-900 dark:text-white">
                        {supplier.rating.toFixed(1)}
                      </span>
                    </div>
                  ) : null}
                </div>

                {reviews.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 text-center space-y-2">
                    <p className="text-xs text-neutral-500 font-medium">
                      Bu firma için henüz değerlendirme yapılmamış.
                    </p>
                    <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                      Toptancım Cebimde pazar yerinde değerlendirmeler yalnızca gerçek ve tamamlanmış ticaretler sonrasında işletmeler tarafından yapılabilir.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-neutral-300 dark:text-neutral-700"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(rev.createdAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {rev.comment && (
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                            "{rev.comment}"
                          </p>
                        )}

                        <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800/50 text-[10px] text-neutral-400 flex items-center justify-between">
                          <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                            {rev.isAnonymous ? "Doğrulanmış İşletme (Anonim)" : rev.businessName || "Alıcı İşletme"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Tamamlanan Sipariş</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DIRECT CONTACT CHANNELS */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Kurumsal İletişim Kanalları
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${supplier.phone}`}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Telefon</span>
                        <strong className="text-xs sm:text-sm font-mono text-neutral-900 dark:text-white">
                          {supplier.phone || "Belirtilmedi"}
                        </strong>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Ara →
                    </span>
                  </a>

                  <a
                    href={`https://wa.me/${(supplier.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Merhaba ${supplier.companyName}, Teklifim Gelsin üzerinden profilinizi inceledim. Toptan tedarik ile ilgili görüşmek istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between hover:bg-emerald-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                          Kurumsal WhatsApp
                        </span>
                        <strong className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-100">
                          Sohbet Başlat
                        </strong>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Yaz →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* MODALS */}
        {productModalOpen && (
          <SupplierProductModal
            onClose={() => setProductModalOpen(false)}
            onSubmit={handleAddProduct}
            submitting={false}
          />
        )}

        {editProfileModalOpen && supplier && (
          <EditProfileModal
            profile={supplier}
            onClose={() => setEditProfileModalOpen(false)}
            onSuccess={(updated) => {
              setSupplier(updated);
              setEditProfileModalOpen(false);
            }}
          />
        )}

        {reportModalOpen && supplier && (
          <ReportModal
            targetId={supplier.uid}
            targetName={supplier.companyName}
            targetType="supplier"
            onClose={() => setReportModalOpen(false)}
          />
        )}

        {directQuoteModalOpen && supplier && (
          <DirectRequestModal
            supplier={supplier}
            openRequests={openRequests}
            onClose={() => setDirectQuoteModalOpen(false)}
            onSend={handleSendDirectInvitation}
            sending={sendingInvite}
          />
        )}
      </div>
    </TeklifimThemeProvider>
  );
}
