"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  ShieldCheck,
  MapPin,
  Clock,
  Heart,
  ArrowRight,
  Send,
  Layers,
  Sparkles,
} from "lucide-react";
import { TeklifimProduct, TeklifimStockStatus } from "@/types/teklifimGelsin";

interface ProductCardProps {
  product: TeklifimProduct;
  isFavorited?: boolean;
  onToggleFavorite?: (product: TeklifimProduct) => void;
  onRequestQuote?: (product: TeklifimProduct) => void;
}

export default function ProductCard({
  product,
  isFavorited = false,
  onToggleFavorite,
  onRequestQuote,
}: ProductCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited(!favorited);
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  const getStockBadge = (status?: TeklifimStockStatus, qty?: number) => {
    switch (status) {
      case "in_stock":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Stokta {typeof qty === "number" && qty > 0 ? `(${qty} Adet)` : ""}
          </span>
        );
      case "low_stock":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Kritik Stok {typeof qty === "number" ? `(${qty} Adet)` : ""}
          </span>
        );
      case "out_of_stock":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Tükendi
          </span>
        );
      case "made_to_order":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Siparişe Göre Üretim
          </span>
        );
      case "unspecified":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Stok Sorunuz
          </span>
        );
    }
  };

  const renderPrice = () => {
    const visibility = product.priceVisibility || "public";
    const priceVal = product.price ?? product.estimatedPrice;

    if (visibility === "hidden") {
      return (
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Fiyat için giriş yapın
          </span>
        </div>
      );
    }

    if (visibility === "request_quote" || priceVal === undefined || priceVal === null || priceVal === 0) {
      return (
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Teklif İsteyiniz
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-baseline gap-1">
        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(priceVal)}
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {product.currency || "TRY"} / {product.unit || "Birim"}
        </span>
      </div>
    );
  };

  const displayName = product.title || product.name || "Ürün";

  return (
    <div className="group rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden font-sans">
      {/* PRODUCT IMAGE & BADGES */}
      <div className="relative aspect-video sm:aspect-square w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-4">
            <Package className="w-10 h-10 stroke-[1.5] mb-1" />
            <span className="text-[11px] font-medium">Görsel Yok</span>
          </div>
        )}

        {/* TOP OVERLAYS: STOCK BADGE & FAVORITE */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">
            {getStockBadge(product.stockStatus, product.stockQuantity)}
          </div>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="pointer-events-auto p-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-rose-500"
            title={favorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
          >
            <Heart
              className={`w-4 h-4 ${
                favorited ? "text-rose-500 fill-rose-500" : ""
              }`}
            />
          </button>
        </div>

        {/* BOTTOM OVERLAY: MINIMUM ORDER */}
        <div className="absolute bottom-2 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm shadow-sm">
            <Layers className="w-3 h-3" />
            Min. Sipariş: {product.minOrder || `${product.minimumOrder || 1} ${product.unit || "Adet"}`}
          </span>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* CATEGORY & SUB-CATEGORY */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            {product.subCategory && (
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {product.subCategory}
              </span>
            )}
            {product.sku && (
              <span className="text-[10px] font-mono text-slate-400 ml-auto">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* TITLE */}
          <Link
            href={`/teklifim-gelsin/products/${product.id}`}
            className="block font-black text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2"
          >
            {displayName}
          </Link>

          {/* DESCRIPTION */}
          {product.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* SUPPLIER INFO & LEAD TIME */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          {product.supplierName && (
            <div className="flex items-center justify-between text-xs">
              <Link
                href={`/teklifim-gelsin/suppliers/${product.supplierId}`}
                className="font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors flex items-center gap-1 truncate"
              >
                <span className="truncate">{product.supplierName}</span>
                {product.supplierVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
              </Link>
              {product.supplierCity && (
                <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {product.supplierCity}
                </span>
              )}
            </div>
          )}

          {typeof product.leadTimeDays === "number" && product.leadTimeDays > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Hazırlık: {product.leadTimeDays} iş günü</span>
            </div>
          )}
        </div>

        {/* PRICE & ACTION BUTTONS */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {renderPrice()}

          <div className="flex items-center gap-1.5">
            <Link
              href={`/teklifim-gelsin/requests/new?productId=${product.id}&supplierId=${product.supplierId}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
              title="Bu ürün için doğrudan teklif iste"
            >
              <Send className="w-3 h-3" />
              <span>Teklif İste</span>
            </Link>

            <Link
              href={`/teklifim-gelsin/products/${product.id}`}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ürünü İncele"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
