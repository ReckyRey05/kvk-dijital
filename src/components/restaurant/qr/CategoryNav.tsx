"use client";

import { Category } from "@/types/restaurant";
import {
  Flame,
  Utensils,
  Pizza,
  Beef,
  Soup,
  GlassWater,
  Cake,
  Fish,
  Coffee,
  Salad,
  Wine,
  Sparkles,
  Sandwich,
  LucideIcon,
} from "lucide-react";

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Utensils,
  Pizza,
  Beef,
  Soup,
  GlassWater,
  Cake,
  Fish,
  Coffee,
  Salad,
  Wine,
  Sparkles,
  Sandwich,
};

export default function CategoryNav({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <div className="sticky top-[86px] z-20 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 py-2.5 px-4 overflow-x-auto no-scrollbar">
      <div className="max-w-md mx-auto flex items-center gap-2">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          const IconComponent = cat.icon && ICON_MAP[cat.icon] ? ICON_MAP[cat.icon] : Utensils;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-accent text-black shadow-lg shadow-accent/25 scale-[1.02]"
                  : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-accent"}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
