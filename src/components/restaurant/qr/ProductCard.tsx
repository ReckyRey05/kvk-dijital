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
      className={`group relative rounded-2xl bg-card border border-card-border p-3.5 flex gap-3.5 transition-all duration-300 ${
        isAvailable
          ? "hover:border-accent/40 hover:bg-white/[0.03] cursor-pointer"
          : "opacity-60 cursor-not-allowed bg-black/40"
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white/5 shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isAvailable ? "group-hover:scale-105" : "grayscale"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/30">
            <Sparkles className="w-6 h-6" />
          </div>
        )}

        {/* Stock Status ("Tükendi" overlay) */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center text-center p-1">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
              Tükendi
            </span>
          </div>
        )}
      </div>

      {/* Product Info & Price */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Badges */}
          {item.badges && item.badges.length > 0 && isAvailable && (
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {item.badges.map((b) => {
                const badgeInfo = BADGE_MAP[b];
                if (!badgeInfo) return null;
                return (
                  <span
                    key={b}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${badgeInfo.bg} ${badgeInfo.text}`}
                  >
                    {badgeInfo.label}
                  </span>
                );
              })}
            </div>
          )}

          <h3 className="font-bold text-white text-sm leading-snug line-clamp-1 group-hover:text-accent transition-colors">
            {item.name}
          </h3>

          <p className="text-foreground/60 text-xs line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom Row: Price & Prep Time + Add Button */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-white">
              {item.price.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs text-accent font-semibold">TL</span>

            {item.preparationTimeMinutes && (
              <span className="text-[10px] text-foreground/40 flex items-center gap-1 ml-2">
                <Clock className="w-2.5 h-2.5" />
                {item.preparationTimeMinutes} dk
              </span>
            )}
          </div>

          {/* Plus Add Button */}
          {isAvailable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(item);
              }}
              className="w-8 h-8 rounded-full bg-accent/20 group-hover:bg-accent text-accent group-hover:text-black border border-accent/40 flex items-center justify-center transition-all shadow-md cursor-pointer"
              aria-label="Sepete Ekle"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
