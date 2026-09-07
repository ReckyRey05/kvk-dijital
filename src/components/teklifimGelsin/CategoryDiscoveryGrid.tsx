"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  Package,
  Coffee,
  Sparkles,
  Shirt,
  Printer,
  Hammer,
  FileText,
  Cpu,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";
import {
  TEKLIFIM_CATEGORIES,
  CATEGORY_DETAILS,
  SUBCATEGORY_MAPPING,
} from "@/types/teklifimGelsin";
import { categoryToSlug } from "@/lib/teklifimGelsin/searchUtils";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Ambalaj & Paketleme": <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
  "Gıda & İçecek": <Coffee className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
  "Temizlik & Hijyen": <Sparkles className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
  "Tekstil & İş Kıyafeti": <Shirt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
  "Matbaa & Baskı": <Printer className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
  "İnşaat & Hırdavat": <Hammer className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
  "Ofis & Kırtasiye": <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
  "Elektronik & Donanım": <Cpu className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
  "Endüstriyel Mutfak": <UtensilsCrossed className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
  "Diğer": <Layers className="w-6 h-6 text-slate-600 dark:text-slate-400" />,
};

interface CategoryDiscoveryGridProps {
  className?: string;
  showSubCategories?: boolean;
}

export default function CategoryDiscoveryGrid({
  className = "",
  showSubCategories = true,
}: CategoryDiscoveryGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 font-sans ${className}`}>
      {TEKLIFIM_CATEGORIES.map((cat) => {
        const meta = CATEGORY_DETAILS[cat] || {
          name: cat,
          description: "",
          popularItems: [],
        };
        const subCats = SUBCATEGORY_MAPPING[cat] || [];
        const slug = categoryToSlug(cat);
        const icon = CATEGORY_ICONS[cat] || <Layers className="w-6 h-6 text-slate-500" />;

        return (
          <div
            key={cat}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  {icon}
                </div>

                <Link
                  href={`/teklifim-gelsin/categories/${slug}`}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title="Kategori Sayfası"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div>
                <Link
                  href={`/teklifim-gelsin/categories/${slug}`}
                  className="font-black text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1"
                >
                  {cat}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {meta.description}
                </p>
              </div>

              {showSubCategories && subCats.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5">
                    {subCats.slice(0, 4).map((sub) => (
                      <Link
                        key={sub}
                        href={`/teklifim-gelsin/search?type=products&category=${encodeURIComponent(
                          cat
                        )}&subCategory=${encodeURIComponent(sub)}`}
                        className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                    {subCats.length > 4 && (
                      <Link
                        href={`/teklifim-gelsin/categories/${slug}`}
                        className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 font-medium"
                      >
                        +{subCats.length - 4} diğer
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <Link
                href={`/teklifim-gelsin/search?type=products&category=${encodeURIComponent(cat)}`}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Ürünleri Gör
              </Link>
              <Link
                href={`/teklifim-gelsin/search?type=suppliers&category=${encodeURIComponent(cat)}`}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Toptancıları Gör
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
