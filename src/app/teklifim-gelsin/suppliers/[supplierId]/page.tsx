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
  Mail,
  ShieldCheck,
  Package,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Heart,
  Send,
} from "lucide-react";
import {
  TeklifimProfile,
  TeklifimProduct,
  TeklifimRequest,
  CATEGORY_DETAILS,
} from "@/types/teklifimGelsin";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import SupplierProductModal from "@/components/teklifimGelsin/SupplierProductModal";
import DirectRequestModal from "@/components/teklifimGelsin/DirectRequestModal";
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
  const [loading, setLoading] = useState(true);

  // Auth & ownership state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [directQuoteModalOpen, setDirectQuoteModalOpen] = useState(false);
  const [openRequests, setOpenRequests] = useState<TeklifimRequest[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsOwner(user.uid === supplierId);
        // Check if favorited
        try {
          const token = await user.getIdToken();
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
        } catch {}
      } else {
        setIsOwner(false);
        setIsFavorited(false);
      }
    });

    return () => unsub();
  }, [supplierId]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Try Client Firestore
        const { db } = await import("@/lib/firebase/firestore");
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "teklifim_profiles", supplierId));

        if (snap.exists()) {
          setSupplier(snap.data() as TeklifimProfile);
        } else {
          // Demo fallback commercial profile
          setSupplier({
            uid: supplierId,
            role: "supplier",
            companyName: "Öztürk Ambalaj Sanayi A.Ş.",
            contactName: "Murat Öztürk",
            phone: "0212 555 10 20",
            email: "toptan@ozturkambalaj.com.tr",
            city: "İstanbul",
            district: "İkitelli OSB",
            categories: ["Ambalaj & Paketleme", "Matbaa & Baskı"],
            description:
              "12 yıllık imalat altyapımızla endüstriyel kağıt, oluklu mukavva, baskılı karton bardak ve gıda ambalajı üretiminde Türkiye geneline toptan sevkiyat gerçekleştiriyoruz.",
            deliveryRegions: ["Marmara Bölgesi", "Ege Bölgesi", "Tüm Türkiye"],
            minOrder: "250 Adet / 1 Koli",
            isVerified: true,
            yearFounded: 2012,
            completedDeals: 148,
            responseRate: "%98 (Ortalama 2 saat)",
            taxVerified: true,
            createdAt: Date.now() - 86400000 * 180,
            updatedAt: Date.now(),
          });
        }

        // 2. Load Products
        const prodRes = await fetch(
          `/api/teklifim-gelsin/suppliers/${supplierId}/products`
        );
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
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
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <TeklifimHeader />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* TOP NAV BAR */}
          <div className="flex items-center justify-between">
            <Link
              href="/teklifim-gelsin/suppliers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tedarikçi Listesine Dön</span>
            </Link>

            {supplier && (
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isFavorited
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                    : "bg-white dark:bg-[#0E131F] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-200"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isFavorited ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
                <span>{isFavorited ? "Favorilerimde" : "Favoriye Ekle"}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Tedarikçi Profili Yükleniyor...
              </p>
            </div>
          ) : !supplier ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Firma Profili Bulunamadı
              </h3>
            </div>
          ) : (
            <div className="space-y-6">
              {/* COMMERCIAL HEADER CARD */}
              <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isVerified && (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Doğrulanmış Üretici / Toptancı</span>
                        </span>
                      )}

                      {supplier.yearFounded && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                          Kuruluş: {supplier.yearFounded}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                      {supplier.companyName}
                    </h1>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {supplier.city} {supplier.district ? `(${supplier.district})` : ""}
                      </span>
                      <span>•</span>
                      <span>Yetkili: {supplier.contactName}</span>
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {supplier.description}
                  </p>
                )}

                {/* TRUST & COMMERCIAL METRICS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Tamamlanan Anlaşma
                    </span>
                    <strong className="text-lg font-black text-slate-900 dark:text-white">
                      {supplier.completedDeals || "50+"} İşlem
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Ortalama Yanıt Hızı
                    </span>
                    <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {supplier.responseRate || "2 Saat İçinde"}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Min. Sipariş Şartı
                    </span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                      {supplier.minOrder || "1 Koli"}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Ticari Sicil
                    </span>
                    <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Onaylı Vergi</span>
                    </strong>
                  </div>
                </div>
              </div>

              {/* SUPPLIER PRODUCT CATALOG SECTION */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                      Tedarik Vitrini
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Tedarikçinin Ürün & Hizmet Kataloğu
                    </h2>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => setProductModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Ürün Ekle</span>
                    </button>
                  )}
                </div>

                {products.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <Package className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">
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
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between space-y-3"
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
                                className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {prod.name}
                          </h4>
                          {prod.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {prod.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Min. Sipariş</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {prod.minOrder || "1"} {prod.unit || "Birim"}
                            </span>
                          </div>

                          {prod.estimatedPrice && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Tahmini Fiyat</span>
                              <span className="font-black text-slate-900 dark:text-white">
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
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Uzmanlık ve Üretim Kategorileri
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(supplier.categories || []).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* DELIVERY REGIONS */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
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

              {/* DIRECT CONTACT CHANNELS */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Kurumsal İletişim Kanalları
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${supplier.phone}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Telefon</span>
                        <strong className="text-xs sm:text-sm font-mono text-slate-900 dark:text-white">
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
