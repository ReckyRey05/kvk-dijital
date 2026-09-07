"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Scale,
  Loader2,
} from "lucide-react";
import { TeklifimSupplierProfile } from "@/types/teklifimGelsin";
import { supplierToComparisonItem } from "@/lib/teklifimGelsin/searchUtils";
import { addToComparison } from "./ComparisonDrawer";

interface SimilarSuppliersSectionProps {
  supplierId: string;
  initialSuppliers?: TeklifimSupplierProfile[];
  className?: string;
}

export default function SimilarSuppliersSection({
  supplierId,
  initialSuppliers,
  className = "",
}: SimilarSuppliersSectionProps) {
  const [suppliers, setSuppliers] = useState<TeklifimSupplierProfile[]>(
    initialSuppliers || []
  );
  const [loading, setLoading] = useState(!initialSuppliers);

  useEffect(() => {
    if (initialSuppliers) {
      setSuppliers(initialSuppliers);
      return;
    }

    async function fetchSimilar() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teklifim-gelsin/suppliers/${supplierId}/similar?limit=4`);
        if (res.ok) {
          const data = await res.json();
          setSuppliers(data.suppliers || []);
        }
      } catch (err) {
        console.error("Error fetching similar suppliers:", err);
      } finally {
        setLoading(false);
      }
    }

    if (supplierId) {
      fetchSimilar();
    }
  }, [supplierId, initialSuppliers]);

  if (loading) {
    return (
      <div className={`p-8 text-center text-slate-400 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-xs">Alternatif tedarikçiler yükleniyor...</p>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return null;
  }

  const handleAddToCompare = (s: TeklifimSupplierProfile, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = supplierToComparisonItem(s);
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
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Benzer Tedarikçiler & Toptancılar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aynı sektörde hizmet veren diğer onaylı iş ortakları
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300 shrink-0">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logoUrl}
                      alt={s.companyName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    s.companyName?.slice(0, 2).toUpperCase() || "TD"
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleAddToCompare(s, e)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Karşılaştır"
                >
                  <Scale className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <Link
                  href={`/teklifim-gelsin/suppliers/${s.id}`}
                  className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition-colors flex items-center gap-1"
                >
                  <span>{s.companyName}</span>
                  {s.verification?.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </Link>

                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {s.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {s.city}
                    </span>
                  )}
                  {s.rating ? (
                    <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      {s.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {(s.categories || []).slice(0, 2).map((cat: string) => (
                    <span
                      key={cat}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[120px]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {s.completedDeals ? `${s.completedDeals} Anlaşma` : "Yeni Profil"}
              </span>

              <Link
                href={`/teklifim-gelsin/suppliers/${s.id}`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Profili Gör</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
