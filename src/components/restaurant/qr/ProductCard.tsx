"use client";

import { MenuItem } from "@/types/restaurant";
import { Plus, Flame, Clock, Sparkles } from "lucide-react";

interface ProductCardProps {
  item: MenuItem;
  onSelectProduct: (item: MenuItem) => void;
}

const BADGE_MAP: Record<string, { label: string; bg: string; text: string }> = {
  BESTSELLER: { label: "Çok Satan", bg: "bg-amber-500/20 border-amber-500/30", text: "text-amber-300" },
  CHEF_SPECIAL: { label: "Şefin İmzası", bg: "bg-accent/20 border-accent/30", text: "text-accent" },
  VEGAN: { label: "Vegan", bg: "bg-green-500/20 border-green-500/30", text: "text-green-300" },
  SPICY: { label: "Acılı", bg: "bg-red-500/20 border-red-500/30", text: "text-red-300" },
};

export default function ProductCard({ item, onSelectProduct }: ProductCardProps) {
  const isAvailable = item.isAvailable;

  return (
    <div
      onClick={() => isAvailable && onSelectProduct(item)}
      className={`group relative rounded-2xl bg-[#0c1212] border border-white/10 p-3.5 flex gap-4 transition-all duration-300 ${
        isAvailable
          ? "hover:border-accent/50 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-accent/5 cursor-pointer"
          : "opacity-60 cursor-not-allowed bg-black/50 border-white/5"
      }`}
    >
      {/* High Quality Food Photo */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white/5 shrink-0 shadow-md">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isAvailable ? "group-hover:scale-110" : "grayscale"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/30">
            <Sparkles className="w-6 h-6" />
          </div>
        )}

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Stock Status ("Tükendi" overlay) */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center text-center p-1">
            <span className="text-[11px] font-black text-red-400 uppercase tracking-widest bg-red-950/80 px-2.5 py-1 rounded-md border border-red-500/30">
              Tükendi
            </span>
          </div>
        )}

        {/* Prep Time Tag directly on Image */}
        {item.preparationTimeMinutes && isAvailable && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-white/90 font-medium flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-accent" />
            <span>{item.preparationTimeMinutes} dk</span>
          </div>
        )}
      </div>

      {/* Product Info & Price */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          {/* Badges (Including Discount Badge) */}
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs animate-pulse">
                %{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)} İndirim
              </span>
            )}

            {item.badges && item.badges.length > 0 && isAvailable && (
              item.badges.map((b) => {
                const badgeInfo = BADGE_MAP[b];
                if (!badgeInfo) return null;
                return (
                  <span
                    key={b}
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${badgeInfo.bg} ${badgeInfo.text} shadow-xs`}
                  >
                    {badgeInfo.label}
                  </span>
                );
              })
            )}
          </div>

          <h3 className="font-extrabold text-white text-sm leading-snug line-clamp-1 group-hover:text-accent transition-colors">
            {item.name}
          </h3>

          <p className="text-foreground/60 text-[11px] line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>

          {/* Calories / Allergens preview if exists */}
          {item.calories && (
            <span className="text-[10px] text-foreground/40 font-medium mt-1 block">
              {item.calories} kcal
            </span>
          )}
        </div>

        {/* Bottom Row: Price + Add Button */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="flex items-baseline gap-1.5">
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs line-through text-foreground/40 font-bold">
                {item.originalPrice.toLocaleString("tr-TR")} TL
              </span>
            )}
            <span className={`text-base font-black ${item.originalPrice && item.originalPrice > item.price ? "text-green-400" : "text-white"}`}>
              {item.price.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs text-accent font-bold">TL</span>
          </div>

          {/* Plus Add Button */}
          {isAvailable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(item);
              }}
              className="w-8 h-8 rounded-xl bg-accent text-black font-extrabold flex items-center justify-center transition-all shadow-md shadow-accent/20 group-hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Sepete Ekle"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
