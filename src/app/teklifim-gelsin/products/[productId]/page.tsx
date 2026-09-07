"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  ShieldCheck,
  MapPin,
  Clock,
  Heart,
  ArrowLeft,
  Send,
  Layers,
  Sparkles,
  Edit3,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Truck,
  ExternalLink,
} from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import ProductFormModal from "@/components/teklifimGelsin/ProductFormModal";
import TrustSignals from "@/components/teklifimGelsin/TrustSignals";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimProduct, TeklifimStockStatus } from "@/types/teklifimGelsin";
import { compareReorderPrice } from "@/lib/teklifimGelsin/productUtils";

function ProductDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<TeklifimProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");

  // Reorder comparison parameter
  const reorderPriceParam = searchParams.get("reorderPrice");
  const previousPrice = reorderPriceParam ? parseFloat(reorderPriceParam) : undefined;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && productId) {
        try {
          const token = await user.getIdToken();
          const fRes = await fetch("/api/teklifim-gelsin/products/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (fRes.ok) {
            const fData = await fRes.json();
            const faved = (fData.favorites || []).some((f: any) => f.productId === productId);
            setIsFavorited(faved);
          }
        } catch {}
      }
    });

    return () => unsub();
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teklifim-gelsin/products/${productId}?view=true`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
        setActiveImage(data.product.imageUrl || (data.product.images && data.product.images[0]) || "");
      }
    } catch (err) {
      console.error("Load product error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      router.push("/teklifim-gelsin/auth?role=business");
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/products/${productId}/favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.isFavorited);
      }
    } catch {}
  };

  const handleUpdateProduct = async (updates: Partial<TeklifimProduct>) => {
    if (!currentUser || !productId) return;
    const token = await currentUser.getIdToken();
    const res = await fetch(`/api/teklifim-gelsin/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Ürün güncellenemedi.");
    }

    loadProduct();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <TeklifimHeader />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Ürün bilgileri yükleniyor...</p>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <TeklifimHeader />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Ürün Bulunamadı
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aradığınız ürün yayından kaldırılmış veya bağlantı hatalı olabilir.
          </p>
          <Link
            href="/teklifim-gelsin/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kataloğa Geri Dön</span>
          </Link>
        </main>
      </div>
    );
  }

  const isOwner = currentUser?.uid === product.supplierId;
  const currentPrice = product.price ?? product.estimatedPrice;

  // Re-order price comparison
  const priceComparison =
    previousPrice !== undefined && currentPrice !== undefined
      ? compareReorderPrice(currentPrice, previousPrice)
      : null;

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <TeklifimHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* BREADCRUMB & TOP ACTIONS */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <Link href="/teklifim-gelsin/products" className="hover:text-emerald-600 font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ürünler</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{product.category}</span>
            {product.subCategory && (
              <>
                <span>/</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{product.subCategory}</span>
              </>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Düzenle</span>
              </button>
            )}
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorited
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-500"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500"
              }`}
              title={isFavorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* REORDER PRICE CHANGE WARNING BANNER */}
        {priceComparison && priceComparison.hasChanged && (
          <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-black text-sm block">Fiyat Güncelleme Uyarısı (Tekrar Sipariş)</strong>
              <p className="leading-relaxed">
                Bu ürünü daha önce birim fiyatı <strong>{priceComparison.originalPrice.toFixed(2)} TRY</strong> üzerinden sipariş vermiştiniz.
                Güncel katalog fiyatı <strong>{priceComparison.currentPrice.toFixed(2)} TRY</strong> olarak güncellenmiştir (Fark: {priceComparison.priceDifference > 0 ? `+${priceComparison.priceDifference.toFixed(2)}` : priceComparison.priceDifference.toFixed(2)} TRY, %{priceComparison.percentChange}).
              </p>
            </div>
          </div>
        )}

        {/* PRODUCT MAIN CONTAINER: GALLERY + SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* LEFT: IMAGE DISPLAY */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative border border-slate-200/80 dark:border-slate-800">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Package className="w-16 h-16 stroke-[1.2] mb-2" />
                  <span className="text-xs font-semibold">Görsel Bulunmuyor</span>
                </div>
              )}

              {/* STOCK STATUS BADGE */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700">
                  {product.stockStatus === "in_stock" && "Stokta Mevcut"}
                  {product.stockStatus === "low_stock" && "Kritik Stok"}
                  {product.stockStatus === "out_of_stock" && "Tükendi"}
                  {product.stockStatus === "made_to_order" && "Siparişe Göre Üretim"}
                  {product.stockStatus === "unspecified" && "Stok Sorunuz"}
                </span>
              </div>
            </div>

            {/* THUMBNAILS IF IMAGES ARRAY */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img ? "border-emerald-500 scale-95" : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS & ACTIONS */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* CATEGORY & SKU */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                {product.subCategory && (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {product.subCategory}
                  </span>
                )}
                {product.sku && (
                  <span className="text-xs font-mono text-slate-400 ml-auto">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* TITLE */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {product.title || product.name}
              </h1>

              {/* PRICE BLOCK */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Toptan Birim Fiyatı
                </span>
                {product.priceVisibility === "hidden" ? (
                  <p className="text-sm font-semibold text-slate-500">
                    Fiyat bilgisi sadece kurumsal giriş yapan kullanıcılara açıktır.
                  </p>
                ) : product.priceVisibility === "request_quote" || !product.price ? (
                  <p className="text-lg font-black text-emerald-600">
                    Teklif İsteyiniz
                  </p>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                      {product.price.toFixed(2)} {product.currency || "TRY"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      / {product.unit || "Birim"}
                    </span>
                  </div>
                )}
              </div>

              {/* B2B METRICS GRID */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Asgari Sipariş (MOQ)</span>
                  </span>
                  <span className="font-black text-slate-900 dark:text-white text-sm block">
                    {product.minOrder || `${product.minimumOrder || 1} ${product.unit || "Adet"}`}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Termin Süresi</span>
                  </span>
                  <span className="font-black text-slate-900 dark:text-white text-sm block">
                    {product.leadTimeDays ? `${product.leadTimeDays} İş Günü` : "Hemen Sevk"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Teslimat Alanı</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">
                    {product.deliveryRegions && product.deliveryRegions.length > 0
                      ? product.deliveryRegions.join(", ")
                      : "Tüm Türkiye"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Package className="w-3.5 h-3.5" />
                    <span>Stok Durumu</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block">
                    {product.stockQuantity !== undefined
                      ? `${product.stockQuantity} ${product.unit || "Adet"} Mevcut`
                      : product.stockStatus === "in_stock"
                      ? "Stokta Var"
                      : "Siparişe Göre"}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}
              {product.description && (
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ürün Açıklaması & Özellikler
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* CTA BUTTON */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                href={`/teklifim-gelsin/requests/new?productId=${product.id}&supplierId=${product.supplierId}`}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Bu Ürün İçin Doğrudan Teklif İste</span>
              </Link>
              <p className="text-[11px] text-center text-slate-400">
                Talebiniz doğrudan toptancıya iletilir; özel miktar ve vade şartlarını mesajlaşarak görüşebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* SUPPLIER CARD / TRUST SECTION */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-black text-lg shrink-0">
              {product.supplierName ? product.supplierName.slice(0, 2).toUpperCase() : "TD"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {product.supplierName || "Onaylı Tedarikçi"}
                </h3>
                {product.supplierVerified && (
                  <span title="Doğrulanmış Kurumsal Tedarikçi">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                {product.supplierCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {product.supplierCity}
                  </span>
                )}
                <span>•</span>
                <span>Toptancı / İmalatçı</span>
              </p>
            </div>
          </div>

          <Link
            href={`/teklifim-gelsin/suppliers/${product.supplierId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-colors shrink-0"
          >
            <span>Tedarikçi Profilini & Tüm Ürünlerini Gör</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* EDIT MODAL */}
      {showEditModal && (
        <ProductFormModal
          initialData={product}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateProduct}
        />
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductDetailPageContent />
    </Suspense>
  );
}

