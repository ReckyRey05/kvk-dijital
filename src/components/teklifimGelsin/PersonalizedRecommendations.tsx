"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Package, Building2, ArrowRight } from "lucide-react";
import { TeklifimPersonalizedRecommendations } from "@/types/teklifimGelsin";
import ProductCard from "./ProductCard";
import SupplierCard from "./SupplierCard";

interface PersonalizedRecommendationsProps {
  className?: string;
}

export default function PersonalizedRecommendations({
  className = "",
}: PersonalizedRecommendationsProps) {
  const [data, setData] = useState<TeklifimPersonalizedRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "suppliers">("products");

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const res = await fetch("/api/teklifim-gelsin/search/recommendations");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.recommendations) {
            setData(json.recommendations);
          }
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  if (loading) return null;
  if (!data || (data.recommendedProducts.length === 0 && data.recommendedSuppliers.length === 0)) {
    return null;
  }

  return (
    <section className={`space-y-4 font-sans ${className}`}>
      {/* HEADER WITH BADGE AND REASON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sana Uygun</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            İlgi Alanlarına Göre Tavsiyeler
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {data.reason}
          </p>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shrink-0 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "products"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Ürünler ({data.recommendedProducts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suppliers")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "suppliers"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Tedarikçiler ({data.recommendedSuppliers.length})</span>
          </button>
        </div>
      </div>

      {/* CONTENT GRID */}
      {activeTab === "products" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.recommendedProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.recommendedSuppliers.slice(0, 6).map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={{
                uid: supplier.id,
                email: supplier.email || "",
                companyName: supplier.companyName,
                role: "supplier",
                city: supplier.city || "Türkiye",
                district: supplier.district,
                categories: supplier.categories || [],
                isVerified: Boolean(supplier.verification?.isVerified || supplier.isVerified),
                verificationStatus: supplier.verification?.isVerified ? "verified" : "unverified",
                createdAt: supplier.createdAt || 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
