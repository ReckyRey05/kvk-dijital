"use client";

import { useState } from "react";
import { MenuItem, Category } from "@/types/restaurant";
import { Plus, Edit2, Check, X, AlertCircle, Sparkles, Image as ImageIcon, Flame } from "lucide-react";

interface MenuManagerProps {
  categories: Category[];
  menuItems: MenuItem[];
  onToggleAvailability: (itemId: string) => void;
}

export default function MenuManager({
  categories,
  menuItems,
  onToggleAvailability,
}: MenuManagerProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>("ALL");

  const filteredItems =
    selectedCatId === "ALL"
      ? menuItems
      : menuItems.filter((i) => i.categoryId === selectedCatId);

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCatId("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCatId === "ALL"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            Tüm Ürünler ({menuItems.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCatId === cat.id
                  ? "bg-accent text-black shadow-md shadow-accent/20"
                  : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Item Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const categoryName = categories.find((c) => c.id === item.categoryId)?.name || "";

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                item.isAvailable
                  ? "bg-[#0d1414] border-white/10 hover:border-accent/30"
                  : "bg-black/60 border-red-500/20 opacity-75"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover ${!item.isAvailable ? "grayscale" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/30">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-[9px] font-black text-red-300 uppercase">
                      Tükendi
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-accent font-semibold block">{categoryName}</span>
                  <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-foreground/50 line-clamp-2 mt-0.5">{item.description}</p>
                </div>
              </div>

              {/* Bottom Actions & Live Stock Toggle */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-white">{item.price} TL</span>
                </div>

                {/* Stock Toggle Button with Dynamic Hover State */}
                <button
                  onClick={() => onToggleAvailability(item.id)}
                  className={`group/btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    item.isAvailable
                      ? "bg-green-500/15 hover:bg-red-500/20 text-green-400 hover:text-red-300 border border-green-500/30 hover:border-red-500/40"
                      : "bg-red-500/20 hover:bg-green-500/20 text-red-300 hover:text-green-300 border border-red-500/40 hover:border-green-500/40"
                  }`}
                  title={item.isAvailable ? "Tükendi olarak işaretlemek için tıklayın" : "Tekrar satışa açmak için tıklayın"}
                >
                  {item.isAvailable ? (
                    <>
                      <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                      <X className="w-3.5 h-3.5 hidden group-hover/btn:inline-block text-red-400" />
                      <span className="group-hover/btn:hidden">Satışta</span>
                      <span className="hidden group-hover/btn:inline text-red-300">Tükendi Olarak İşaretle</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 group-hover/btn:hidden" />
                      <Check className="w-3.5 h-3.5 hidden group-hover/btn:inline-block text-green-400" />
                      <span className="group-hover/btn:hidden">Tükendi</span>
                      <span className="hidden group-hover/btn:inline text-green-300">Satışa Aç</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
