"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ArrowRight, ShieldCheck, Scale, Loader2 } from "lucide-react";
import { TeklifimProduct } from "@/types/teklifimGelsin";
import { productToComparisonItem } from "@/lib/teklifimGelsin/searchUtils";
import { addToComparison } from "./ComparisonDrawer";

interface SimilarProductsSectionProps {
  productId: string;
  initialProducts?: TeklifimProduct[];
  className?: string;
}

export default function SimilarProductsSection({
  productId,
  initialProducts,
  className = "",
}: SimilarProductsSectionProps) {
  const [products, setProducts] = useState<TeklifimProduct[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      return;
    }

    async function fetchSimilar() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teklifim-gelsin/products/${productId}/similar?limit=4`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Error fetching similar products:", err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchSimilar();
    }
  }, [productId, initialProducts]);

  if (loading) {
    return (
      <div className={`p-8 text-center text-slate-400 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-xs">Alternatif ürünler aranıyor...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const handleAddToCompare = (p: TeklifimProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = productToComparisonItem(p);
    const result = addToComparison(item);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  return (
    <section className={`space-y-4 font-sans ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Benzer ve Alternatif Ürünler
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aynı kategorideki diğer tedarikçi alternatiflerini inceleyin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const price = p.price ?? p.estimatedPrice;
          const displayPrice =
            p.priceVisibility === "hidden"
              ? "Teklif İsteyin"
              : price !== undefined
              ? `${price.toLocaleString("tr-TR")} TL`
              : "Fiyat Belirtilmedi";

          return (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                <div className="h-28 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden relative">
                  {p.imageUrl || (p.images && p.images[0]) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl || (p.images && p.images[0])}
                      alt={p.name || p.title || "Ürün"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleAddToCompare(p, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-colors"
                    title="Karşılaştır"
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5 truncate">
                    <span>{p.category}</span>
                    {p.subCategory && <span>• {p.subCategory}</span>}
                  </div>

                  <Link
                    href={`/teklifim-gelsin/products/${p.id}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 line-clamp-1 transition-colors"
                  >
                    {p.name || p.title}
                  </Link>

                  {p.supplierName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                      {p.supplierName}
                      {p.supplierVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Birim Fiyat</span>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {displayPrice}
                  </span>
                </div>

                <Link
                  href={`/teklifim-gelsin/products/${p.id}`}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors"
                  title="İncele"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
