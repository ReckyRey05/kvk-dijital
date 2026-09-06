"use client";

import React from "react";
import {
  Package,
  Utensils,
  Sparkles,
  Shirt,
  Printer,
  Wrench,
  Briefcase,
  Cpu,
  Flame,
  Layers,
} from "lucide-react";
import { TEKLIFIM_CATEGORIES, CATEGORY_DETAILS } from "@/types/teklifimGelsin";

const CATEGORY_ICONS: Record<string, any> = {
  "Ambalaj & Paketleme": Package,
  "Gıda & İçecek": Utensils,
  "Temizlik & Hijyen": Sparkles,
  "Tekstil & İş Kıyafeti": Shirt,
  "Matbaa & Baskı": Printer,
  "İnşaat & Hırdavat": Wrench,
  "Ofis & Kırtasiye": Briefcase,
  "Elektronik & Donanım": Cpu,
  "Endüstriyel Mutfak": Flame,
  "Diğer": Layers,
};

interface CategorySelectorProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  showDetails?: boolean;
}

export default function CategorySelector({
  selectedCategory,
  onSelectCategory,
  showDetails = true,
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 font-sans">
      {TEKLIFIM_CATEGORIES.map((catName) => {
        const IconComponent = CATEGORY_ICONS[catName] || Layers;
        const details = CATEGORY_DETAILS[catName];
        const isSelected = selectedCategory === catName;

        return (
          <button
            key={catName}
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(catName)}
            className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                : "bg-white dark:bg-[#121824] hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
            }`}
          >
            <div className="space-y-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              <div>
                <h4
                  className={`font-bold text-xs sm:text-sm leading-snug ${
                    isSelected
                      ? "text-emerald-900 dark:text-emerald-200"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {catName}
                </h4>

                {showDetails && details && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {details.description}
                  </p>
                )}
              </div>
            </div>

            {showDetails && details && (
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1">
                {details.popularItems.slice(0, 2).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate"
                  >
                    • {item}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
