"use client";

import { useState } from "react";
import { MenuItem, OrderItem, SelectedOptionPayload } from "@/types/restaurant";
import { X, Plus, Minus, Check, Flame, AlertCircle } from "lucide-react";

interface ProductModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (orderItem: OrderItem) => void;
}

export default function ProductModal({ item, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState("");
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);

  const handleToggleIngredient = (ingredient: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingredient) ? prev.filter((i) => i !== ingredient) : [...prev, ingredient]
    );
  };

  // Initialize selected options with defaults
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    if (item.optionGroups) {
      for (const group of item.optionGroups) {
        if (group.type === "SINGLE") {
          const defaultOpt = group.options.find((o) => o.isDefault) || group.options[0];
          if (defaultOpt) {
            initial[group.id] = [defaultOpt.id];
          }
        } else {
          initial[group.id] = [];
        }
      }
    }
    return initial;
  });

  const handleOptionToggle = (groupId: string, optionId: string, type: "SINGLE" | "MULTIPLE") => {
    setSelectedOptions((prev) => {
      if (type === "SINGLE") {
        return { ...prev, [groupId]: [optionId] };
      } else {
        const current = prev[groupId] || [];
        const exists = current.includes(optionId);
        const updated = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
        return { ...prev, [groupId]: updated };
      }
    });
  };

  // Calculate final unit price including options
  let calculatedUnitPrice = item.price;
  const structuredSelectedOptions: SelectedOptionPayload[] = [];

  if (item.optionGroups) {
    for (const group of item.optionGroups) {
      const selectedIds = selectedOptions[group.id] || [];
      const selectedItemsList: { id: string; name: string; priceDelta: number }[] = [];

      for (const optId of selectedIds) {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) {
          calculatedUnitPrice += opt.priceDelta;
          selectedItemsList.push({
            id: opt.id,
            name: opt.name,
            priceDelta: opt.priceDelta,
          });
        }
      }

      if (selectedItemsList.length > 0) {
        structuredSelectedOptions.push({
          groupId: group.id,
          groupTitle: group.title,
          selectedItems: selectedItemsList,
        });
      }
    }
  }

  const totalPrice = calculatedUnitPrice * quantity;

  const handleSubmit = () => {
    const orderItem: OrderItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      finalPrice: calculatedUnitPrice,
      quantity,
      selectedOptions: structuredSelectedOptions,
      removedIngredients: removedIngredients.length > 0 ? removedIngredients : undefined,
      itemNotes: itemNotes.trim() || undefined,
    };

    onAddToCart(orderItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0c1212] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image / Close button */}
        <div className="relative h-48 sm:h-52 w-full bg-white/5 shrink-0 overflow-hidden">
          {item.image && (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1212] via-[#0c1212]/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-bold text-white leading-snug">{item.name}</h2>
            <div className="flex items-center gap-2 text-xs text-foreground/70 mt-1 flex-wrap">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="line-through text-foreground/40 font-bold text-sm">
                  {item.originalPrice} TL
                </span>
              )}
              <span className={`font-extrabold text-base ${item.originalPrice && item.originalPrice > item.price ? "text-green-400" : "text-accent"}`}>
                {item.price} TL
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                  %{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)} İndirim
                </span>
              )}
              {item.calories && <span>• {item.calories} kcal</span>}
              {item.preparationTimeMinutes && <span>• ~{item.preparationTimeMinutes} dk</span>}
            </div>
          </div>
        </div>

        {/* Scrollable Content: Description, Ingredients, & Option Groups */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
            {item.description}
          </p>

          {/* Allergens Warning */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Alerjenler: {item.allergens.join(", ")}</span>
            </div>
          )}

          {/* Interactive Ingredients & Removal Customizer */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  İçindekiler & Çıkarılacak Malzemeler
                </h4>
                <span className="text-[10px] text-foreground/50">
                  İstemediğinize dokunarak çıkarın
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ing) => {
                  const isRemoved = removedIngredients.includes(ing);
                  return (
                    <button
                      key={ing}
                      type="button"
                      onClick={() => handleToggleIngredient(ing)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isRemoved
                          ? "bg-red-500/20 text-red-300 border border-red-500/40 line-through"
                          : "bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {isRemoved ? (
                        <X className="w-3.5 h-3.5 text-red-400 no-underline shrink-0" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      )}
                      <span>{ing}</span>
                      {isRemoved && <span className="text-[9px] text-red-400 font-bold ml-1">(Çıkarılsın)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Option Groups */}
          {item.optionGroups &&
            item.optionGroups.map((group) => (
              <div key={group.id} className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {group.title}
                  </h4>
                  {group.required && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold">
                      Zorunlu
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {group.options.map((opt) => {
                    const isSelected = (selectedOptions[group.id] || []).includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleOptionToggle(group.id, opt.id, group.type)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-accent/15 border-accent text-white"
                            : "bg-white/[0.03] border-white/5 text-foreground/70 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-${group.type === "SINGLE" ? "full" : "md"} border flex items-center justify-center transition-colors ${
                              isSelected ? "border-accent bg-accent text-black" : "border-white/30"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium">{opt.name}</span>
                        </div>

                        {opt.priceDelta > 0 && (
                          <span className="text-xs font-bold text-accent">
                            +{opt.priceDelta} TL
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* Special Order Note */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-bold uppercase tracking-wider text-white">
              Sipariş Notu
            </label>
            <input
              type="text"
              placeholder="Örn: Az tuzlu olsun, sosu yanına koyun..."
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-foreground/40 focus:outline-none focus:border-accent"
              maxLength={150}
            />
          </div>
        </div>

        {/* Footer: Quantity Counter & Add Button */}
        <div className="p-4 bg-[#0a0f0f] border-t border-white/10 flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Submit Button */}
          <button
            onClick={handleSubmit}
            className="flex-1 py-3.5 px-4 rounded-xl bg-accent text-black font-bold text-xs sm:text-sm flex items-center justify-between hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer"
          >
            <span>Sepete Ekle</span>
            <span>{totalPrice.toLocaleString("tr-TR")} TL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
