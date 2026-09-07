import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Layers,
  Package,
  Building2,
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import ProductCard from "@/components/teklifimGelsin/ProductCard";
import SupplierCard from "@/components/teklifimGelsin/SupplierCard";
import ComparisonDrawer from "@/components/teklifimGelsin/ComparisonDrawer";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import {
  CATEGORY_DETAILS,
  SUBCATEGORY_MAPPING,
} from "@/types/teklifimGelsin";
import { slugToCategory } from "@/lib/teklifimGelsin/searchUtils";
import { performUnifiedSearch } from "@/lib/teklifimGelsin/searchService";

interface CategoryDetailPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = slugToCategory(categorySlug);

  if (!category) {
    return {
      title: "Kategori Bulunamadı | Toptancım Cebimde",
    };
  }

  const meta = CATEGORY_DETAILS[category];
  const popular = meta?.popularItems?.join(", ") || "";

  return {
    title: `Toptan ${category} Fiyatları ve Tedarikçileri | Toptancım Cebimde`,
    description: `${category} sektöründe en uygun toptan fiyatlar ve doğrulanmış üreticiler. ${meta?.description || ""} Popüler ürünler: ${popular}.`,
    keywords: [
      `toptan ${category.toLowerCase()}`,
      `${category.toLowerCase()} üreticileri`,
      `${category.toLowerCase()} toptan fiyatları`,
      "b2b tedarik",
      "toptan sipariş",
    ],
  };
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { categorySlug } = await params;
  const category = slugToCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const meta = CATEGORY_DETAILS[category] || {
    name: category,
    description: "",
    popularItems: [],
  };
  const subCategories = SUBCATEGORY_MAPPING[category] || [];

  // Fetch initial category products and suppliers
  const searchResult = await performUnifiedSearch({
    category,
    limit: 12,
  });

  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
        <TeklifimHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
          {/* BREADCRUMB & BACK */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/teklifim-gelsin/categories" className="hover:underline">
              Kategoriler
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {category}
            </span>
          </div>

          {/* CATEGORY HERO */}
          <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Layers className="w-3.5 h-3.5" />
                <span>Sektör Vitrini</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {category} Toptan Tedarikçileri
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {meta.description}
              </p>

              {/* SUBCATEGORY PILLS */}
              {subCategories.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {subCategories.map((sub) => (
                    <Link
                      key={sub}
                      href={`/teklifim-gelsin/search?type=products&category=${encodeURIComponent(
                        category
                      )}&subCategory=${encodeURIComponent(sub)}`}
                      className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* DIRECT REQUEST ACTION */}
            <div className="shrink-0 w-full md:w-auto">
              <Link
                href={`/teklifim-gelsin/requests/new?category=${encodeURIComponent(
                  category
                )}`}
                className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Bu Kategoride Talep Oluştur</span>
              </Link>
            </div>
          </div>

          {/* PRODUCTS SECTION */}
          {searchResult.products.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Öne Çıkan {category} Ürünleri</span>
                </h2>

                <Link
                  href={`/teklifim-gelsin/search?type=products&category=${encodeURIComponent(
                    category
                  )}`}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Tümünü Gör ({searchResult.totalProducts})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResult.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* SUPPLIERS SECTION */}
          {searchResult.suppliers.length > 0 && (
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>{category} Toptancı & Üretici Firmaları</span>
                </h2>

                <Link
                  href={`/teklifim-gelsin/search?type=suppliers&category=${encodeURIComponent(
                    category
                  )}`}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Tüm Tedarikçileri Gör ({searchResult.totalSuppliers})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResult.suppliers.map((s) => (
                  <SupplierCard
                    key={s.id}
                    supplier={{
                      uid: s.id,
                      email: s.email || "",
                      companyName: s.companyName,
                      role: "supplier",
                      city: s.city || "Türkiye",
                      district: s.district,
                      categories: s.categories || [],
                      isVerified: Boolean(s.verification?.isVerified || s.isVerified),
                      verificationStatus: s.verification?.isVerified ? "verified" : "unverified",
                      createdAt: s.createdAt || 0,
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </main>

        <ComparisonDrawer />
      </div>
    </TeklifimThemeProvider>
  );
}
