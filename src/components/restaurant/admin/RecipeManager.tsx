"use client";

import { useState } from "react";
import {
  MenuItem,
  Category,
  Ingredient,
  RecipeItem,
  WasteLog,
  HappyHourRule,
  IngredientUnit,
} from "@/types/restaurant";
import { useRestaurantStore } from "@/lib/restaurant/store";
import {
  TrendingUp,
  Percent,
  AlertTriangle,
  Boxes,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Clock,
  DollarSign,
  ChefHat,
  Scale,
  Search,
  CheckCircle2,
} from "lucide-react";

interface RecipeManagerProps {
  menuItems: MenuItem[];
  categories: Category[];
}

export default function RecipeManager({ menuItems, categories }: RecipeManagerProps) {
  const {
    ingredients,
    wasteLogs,
    happyHourRules,
    saveRecipe,
    updateIngredientStock,
    updateIngredientCost,
    updateIngredient,
    deleteIngredient,
    addIngredient,
    logWaste,
    toggleHappyHourRule,
    saveHappyHourRule,
  } = useRestaurantStore();

  const [activeSubTab, setActiveSubTab] = useState<"RECIPES" | "INGREDIENTS" | "WASTE" | "HAPPY_HOUR">("RECIPES");
  const [searchQuery, setSearchQuery] = useState("");

  // Recipe editing modal
  const [editingRecipeItem, setEditingRecipeItem] = useState<MenuItem | null>(null);
  const [tempRecipe, setTempRecipe] = useState<RecipeItem[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("");
  const [quickCostInput, setQuickCostInput] = useState<string>("");
  const [costUpdatedMsg, setCostUpdatedMsg] = useState<string | null>(null);

  // Edit ingredient modal
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editIngName, setEditIngName] = useState("");
  const [editIngCost, setEditIngCost] = useState("");
  const [editIngStock, setEditIngStock] = useState("");
  const [editIngCritical, setEditIngCritical] = useState("");
  const [editIngUnit, setEditIngUnit] = useState<IngredientUnit>("kg");
  const [editIngCategory, setEditIngCategory] = useState<Ingredient["category"]>("ET");

  // Add ingredient modal
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [newIngName, setNewIngName] = useState("");
  const [newIngUnit, setNewIngUnit] = useState<IngredientUnit>("kg");
  const [newIngCost, setNewIngCost] = useState("");
  const [newIngStock, setNewIngStock] = useState("");
  const [newIngCritical, setNewIngCritical] = useState("");
  const [newIngCategory, setNewIngCategory] = useState<Ingredient["category"]>("ET");

  // Waste log modal
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [wasteIngId, setWasteIngId] = useState("");
  const [wasteQty, setWasteQty] = useState("");
  const [wasteReason, setWasteReason] = useState<WasteLog["reason"]>("PREPARATION_ERROR");
  const [wasteBy, setWasteBy] = useState("Mutfak Şefi");

  // Summary Metrics
  const totalRawCost = menuItems.reduce((sum, item) => sum + (item.costPrice || 0), 0);
  const totalSelling = menuItems.reduce((sum, item) => sum + item.price, 0);
  const avgMargin = totalSelling > 0 ? Math.round(((totalSelling - totalRawCost) / totalSelling) * 100) : 0;
  const criticalCount = ingredients.filter((ing) => ing.currentStock <= ing.criticalStock).length;
  const totalWasteToday = wasteLogs.reduce((sum, w) => sum + w.cost, 0);

  // Selected ingredient object for recipe modal
  const selectedIng = ingredients.find((i) => i.id === selectedIngredientId) || ingredients[0];

  const handleOpenRecipeModal = (item: MenuItem) => {
    setEditingRecipeItem(item);
    setTempRecipe(item.recipe ? [...item.recipe] : []);
    const initialIng = ingredients[0];
    setSelectedIngredientId(initialIng?.id || "");
    setQuickCostInput(initialIng ? String(initialIng.unitCost) : "");
    setSelectedQuantity("");
    setCostUpdatedMsg(null);
  };

  const handleSelectIngredientChange = (ingId: string) => {
    setSelectedIngredientId(ingId);
    const ing = ingredients.find((i) => i.id === ingId);
    if (ing) {
      setQuickCostInput(String(ing.unitCost));
    }
  };

  const handleQuickUpdateCost = () => {
    if (!selectedIng) return;
    const cost = parseFloat(quickCostInput);
    if (isNaN(cost) || cost < 0) return;

    updateIngredientCost(selectedIng.id, cost);
    setCostUpdatedMsg(`${selectedIng.name} alış fiyatı ${cost} TL/${selectedIng.unit} olarak güncellendi!`);
    setTimeout(() => setCostUpdatedMsg(null), 2500);
  };

  const handleOpenEditIngredient = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setEditIngName(ing.name);
    setEditIngCost(String(ing.unitCost));
    setEditIngStock(String(ing.currentStock));
    setEditIngCritical(String(ing.criticalStock));
    setEditIngUnit(ing.unit);
    setEditIngCategory(ing.category);
  };

  const handleSaveEditIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIngredient) return;

    const cost = parseFloat(editIngCost);
    const stock = parseFloat(editIngStock);
    const crit = parseFloat(editIngCritical);

    if (isNaN(cost) || isNaN(stock)) return;

    updateIngredient(editingIngredient.id, {
      name: editIngName.trim(),
      unitCost: Math.max(0, cost),
      currentStock: Math.max(0, stock),
      criticalStock: isNaN(crit) ? 5 : crit,
      unit: editIngUnit,
      category: editIngCategory,
    });

    setEditingIngredient(null);
  };

  const handleAddRecipeIngredient = () => {
    const qty = parseFloat(selectedQuantity);
    if (!selectedIngredientId || isNaN(qty) || qty <= 0) return;

    const existingIdx = tempRecipe.findIndex((r) => r.ingredientId === selectedIngredientId);
    if (existingIdx >= 0) {
      setTempRecipe(
        tempRecipe.map((r, i) => (i === existingIdx ? { ...r, quantity: qty } : r))
      );
    } else {
      setTempRecipe([...tempRecipe, { ingredientId: selectedIngredientId, quantity: qty }]);
    }
    setSelectedQuantity("");
  };

  const handleRemoveRecipeIngredient = (ingredientId: string) => {
    setTempRecipe(tempRecipe.filter((r) => r.ingredientId !== ingredientId));
  };

  const handleSaveRecipeModal = () => {
    if (!editingRecipeItem) return;
    saveRecipe(editingRecipeItem.id, tempRecipe);
    setEditingRecipeItem(null);
  };

  // Add ingredient submit
  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(newIngCost);
    const stock = parseFloat(newIngStock);
    const crit = parseFloat(newIngCritical);
    if (!newIngName || isNaN(cost) || isNaN(stock)) return;

    addIngredient({
      id: `ing_${Date.now()}`,
      name: newIngName.trim(),
      unit: newIngUnit,
      unitCost: cost,
      currentStock: stock,
      criticalStock: isNaN(crit) ? 5 : crit,
      category: newIngCategory,
      lastRestockedAt: new Date().toISOString().split("T")[0],
    });

    setNewIngName("");
    setNewIngCost("");
    setNewIngStock("");
    setNewIngCritical("");
    setIsAddIngredientOpen(false);
  };

  // Waste log submit
  const handleCreateWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const ing = ingredients.find((i) => i.id === wasteIngId);
    const qty = parseFloat(wasteQty);
    if (!ing || isNaN(qty) || qty <= 0) return;

    const cost = Math.round(qty * ing.unitCost);
    logWaste({
      id: `waste_${Date.now()}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: qty,
      unit: ing.unit,
      cost,
      reason: wasteReason,
      loggedAt: new Date().toISOString(),
      loggedBy: wasteBy || "Mutfak",
    });

    setWasteQty("");
    setIsWasteModalOpen(false);
  };

  // Temp recipe live cost calculation
  const tempRecipeCost = tempRecipe.reduce((sum, r) => {
    const ing = ingredients.find((i) => i.id === r.ingredientId);
    return sum + (ing ? ing.unitCost * r.quantity : 0);
  }, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top High-Value Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Ortalama Kâr</span>
            <span className="text-base sm:text-xl font-black text-emerald-400">%{avgMargin}</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Hammadde Deposu</span>
            <span className="text-base sm:text-xl font-black text-white">{ingredients.length} Kalem</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Kritik Stok</span>
            <span className={`text-base sm:text-xl font-black truncate ${criticalCount > 0 ? "text-amber-400 animate-pulse" : "text-white"}`}>
              {criticalCount} Kalem
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Fire & Zayi</span>
            <span className="text-base sm:text-xl font-black text-red-400 truncate">{totalWasteToday.toLocaleString("tr-TR")} TL</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto sleek-scrollbar">
        <button
          onClick={() => setActiveSubTab("RECIPES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === "RECIPES"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Ürün Reçeteleri & Kâr Matrisi</span>
        </button>

        <button
          onClick={() => setActiveSubTab("INGREDIENTS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === "INGREDIENTS"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Hammadde & Depo Stoğu ({ingredients.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("WASTE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === "WASTE"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Fire & Zayi Kayıtları ({wasteLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("HAPPY_HOUR")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === "HAPPY_HOUR"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Happy Hour & Otomatik Kampanyalar</span>
        </button>
      </div>

      {/* TAB 1: RECIPES & PROFIT MARGIN TABLE */}
      {activeSubTab === "RECIPES" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-foreground/60">
              Her ürünün hammadde porsiyon maliyetini ve brüt kâr oranını canlı takip edin.
            </p>
          </div>

          <div className="overflow-x-auto sleek-scrollbar rounded-2xl border border-white/10 bg-[#0a0f0f]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-foreground/50 uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-3.5 font-bold">Ürün Adı</th>
                  <th className="p-3.5 font-bold">Satış Fiyatı</th>
                  <th className="p-3.5 font-bold">Hammadde Maliyeti</th>
                  <th className="p-3.5 font-bold">Brüt Kâr (Porsiyon)</th>
                  <th className="p-3.5 font-bold">Kâr Marjı (%)</th>
                  <th className="p-3.5 font-bold text-right">Reçete İşlemi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {menuItems.map((item) => {
                  const cost = item.costPrice || 0;
                  const grossProfit = item.price - cost;
                  const margin = item.price > 0 ? Math.round((grossProfit / item.price) * 100) : 0;
                  const hasRecipe = item.recipe && item.recipe.length > 0;

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-bold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {hasRecipe && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-accent/15 text-accent font-bold">
                            {item.recipe?.length} Malzeme
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-extrabold text-white">{item.price.toLocaleString("tr-TR")} TL</td>
                      <td className="p-3.5 font-bold text-foreground/70">
                        {cost > 0 ? `${cost.toLocaleString("tr-TR")} TL` : <span className="text-foreground/40 italic">Tanımsız</span>}
                      </td>
                      <td className="p-3.5 font-extrabold text-emerald-400">
                        {cost > 0 ? `+${grossProfit.toLocaleString("tr-TR")} TL` : "-"}
                      </td>
                      <td className="p-3.5">
                        {cost > 0 ? (
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-black ${
                              margin >= 65
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : margin >= 50
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-red-500/15 text-red-400 border border-red-500/30"
                            }`}
                          >
                            %{margin}
                          </span>
                        ) : (
                          <span className="text-foreground/40">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenRecipeModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-accent hover:text-black border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 ml-auto transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{hasRecipe ? "Reçeteyi Düzenle" : "Reçete Tanımla"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RAW INGREDIENT INVENTORY */}
      {activeSubTab === "INGREDIENTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-foreground/60">
              Restoranınızın depo stoklarını, birim maliyetlerini ve kritik seviyelerini yönetin.
            </p>
            <button
              onClick={() => setIsAddIngredientOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-accent text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 hover:bg-accent/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Hammadde Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.map((ing) => {
              const isCritical = ing.currentStock <= ing.criticalStock;
              return (
                <div
                  key={ing.id}
                  className={`p-4 rounded-2xl bg-[#0a0f0f] border transition-all ${
                    isCritical
                      ? "border-amber-500/40 shadow-lg shadow-amber-950/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-white/5 text-foreground/60 uppercase tracking-wider">
                        {ing.category}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{ing.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isCritical && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Kritik</span>
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenEditIngredient(ing)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-foreground/60 hover:text-white transition-colors cursor-pointer"
                        title="Hammaddeyi ve Fiyatı Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`${ing.name} hammaddesini silmek istediğinize emin misiniz?`)) {
                            deleteIngredient(ing.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-foreground/40 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Hammaddeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-foreground/50 block">Birim Alış Fiyatı</span>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-accent text-sm">
                          {ing.unitCost.toLocaleString("tr-TR")} TL
                        </span>
                        <span className="text-[10px] text-foreground/40">/{ing.unit}</span>
                      </div>
                      <button
                        onClick={() => {
                          const newCost = prompt(`${ing.name} yeni birim alış fiyatı (TL/${ing.unit}):`, String(ing.unitCost));
                          if (newCost !== null) {
                            const val = parseFloat(newCost);
                            if (!isNaN(val) && val >= 0) updateIngredientCost(ing.id, val);
                          }
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold block hover:underline"
                      >
                        Fiyatı Değiştir
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-foreground/50 block">Mevcut Stok</span>
                      <span className={`font-black text-sm block ${isCritical ? "text-amber-400" : "text-emerald-400"}`}>
                        {ing.currentStock} {ing.unit}
                      </span>
                      <span className="text-[10px] text-foreground/40 block">Kritik: {ing.criticalStock} {ing.unit}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-foreground/40">
                      Son Güncelleme: {ing.lastRestockedAt || "Bugün"}
                    </span>
                    <button
                      onClick={() => {
                        const add = prompt(`${ing.name} için eklenecek stok miktarı (${ing.unit}):`, "5");
                        if (add) {
                          const num = parseFloat(add);
                          if (!isNaN(num)) updateIngredientStock(ing.id, ing.currentStock + num);
                        }
                      }}
                      className="text-accent hover:underline font-bold"
                    >
                      + Stok Girişi Yap
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WASTE LOGS */}
      {activeSubTab === "WASTE" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-foreground/60">
              Mutfakta hazırlık hatası, bozulma veya hasar gören hammadde firelerini kaydedin.
            </p>
            <button
              onClick={() => {
                setWasteIngId(ingredients[0]?.id || "");
                setIsWasteModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Fire / Zayi Kaydı Ekle</span>
            </button>
          </div>

          <div className="overflow-x-auto sleek-scrollbar rounded-2xl border border-white/10 bg-[#0a0f0f]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-foreground/50 uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-3.5 font-bold">Hammadde</th>
                  <th className="p-3.5 font-bold">Zayi Miktarı</th>
                  <th className="p-3.5 font-bold">Maddi Zarar (TL)</th>
                  <th className="p-3.5 font-bold">Neden</th>
                  <th className="p-3.5 font-bold">Kaydeden</th>
                  <th className="p-3.5 font-bold text-right">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {wasteLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-bold text-white">{log.ingredientName}</td>
                    <td className="p-3.5 font-semibold text-foreground/80">{log.quantity} {log.unit}</td>
                    <td className="p-3.5 font-extrabold text-red-400">-{log.cost.toLocaleString("tr-TR")} TL</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-foreground/70">
                        {log.reason === "PREPARATION_ERROR"
                          ? "Hazırlık Hatası"
                          : log.reason === "DAMAGED"
                          ? "Fiziksel Hasar"
                          : log.reason === "EXPIRED"
                          ? "Tarihi Geçti"
                          : "Personel Yemeği"}
                      </span>
                    </td>
                    <td className="p-3.5 text-foreground/60">{log.loggedBy}</td>
                    <td className="p-3.5 text-right text-foreground/50 text-[10px]">
                      {new Date(log.loggedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HAPPY HOUR & CAMPAIGN ENGINE */}
      {activeSubTab === "HAPPY_HOUR" && (
        <div className="space-y-4">
          <p className="text-xs text-foreground/60">
            Belirli saat aralıklarında otomatik devreye giren dinamik indirim kuralları oluşturun.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {happyHourRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl bg-[#0a0f0f] border transition-all ${
                  rule.isActive ? "border-accent/40 shadow-lg shadow-accent/10" : "border-white/10 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{rule.title}</h4>
                    <p className="text-xs text-accent font-bold mt-0.5">
                      %{rule.discountPercent} Otomatik İndirim
                    </p>
                  </div>
                  <button
                    onClick={() => toggleHappyHourRule(rule.id)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      rule.isActive
                        ? "bg-accent text-black shadow-md shadow-accent/20"
                        : "bg-white/10 text-foreground/50 hover:bg-white/20"
                    }`}
                  >
                    {rule.isActive ? "Aktif" : "Pasif"}
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-foreground/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>Geçerli Saat: {rule.startHour}:00 - {rule.endHour}:00</span>
                  </div>
                  <span>Hedef: {rule.targetCategoryId ? categories.find(c => c.id === rule.targetCategoryId)?.name || "Kategori" : "Tüm Menü"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECIPE BUILDER MODAL */}
      {editingRecipeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-[#0a0f0f] border border-white/10 rounded-[2rem] p-6 space-y-5 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Reçete & Porsiyon Maliyeti</h3>
                <p className="text-xs text-accent font-bold">{editingRecipeItem.name}</p>
              </div>
              <button
                onClick={() => setEditingRecipeItem(null)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Calculation Strip */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-foreground/50 block">Satış Fiyatı</span>
                <span className="font-black text-white">{editingRecipeItem.price} TL</span>
              </div>
              <div>
                <span className="text-[10px] text-foreground/50 block">Toplam Maliyet</span>
                <span className="font-black text-amber-400">{Math.round(tempRecipeCost * 100) / 100} TL</span>
              </div>
              <div>
                <span className="text-[10px] text-foreground/50 block">Kâr Marjı</span>
                <span className="font-black text-emerald-400">
                  %{editingRecipeItem.price > 0 ? Math.round(((editingRecipeItem.price - tempRecipeCost) / editingRecipeItem.price) * 100) : 0}
                </span>
              </div>
            </div>

            {/* Current Recipe Item List */}
            <div className="space-y-2 max-h-56 overflow-y-auto sleek-scrollbar pr-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                Reçetedeki Hammaddeler
              </label>

              {tempRecipe.length === 0 ? (
                <p className="text-xs text-foreground/40 py-4 text-center">Henüz hammadde eklenmedi.</p>
              ) : (
                tempRecipe.map((item) => {
                  const ing = ingredients.find((i) => i.id === item.ingredientId);
                  const cost = ing ? ing.unitCost * item.quantity : 0;
                  return (
                    <div
                      key={item.ingredientId}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{ing?.name || "Hammadde"}</span>
                        <span className="text-foreground/50 text-[10px] ml-2">
                          ({item.quantity} {ing?.unit} • {Math.round(cost * 100) / 100} TL)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveRecipeIngredient(item.ingredientId)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Ingredient into Recipe Form */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                  + Malzeme & Porsiyon Ekle
                </span>
                <span className="text-[10px] text-accent font-semibold">
                  Alış maliyeti doğrudan güncellenebilir
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7">
                  <select
                    value={selectedIngredientId}
                    onChange={(e) => handleSelectIngredientChange(e.target.value)}
                    className="w-full bg-[#121818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-accent"
                  >
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unitCost} TL/{ing.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Miktar"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    className="w-full bg-[#121818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-accent"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    onClick={handleAddRecipeIngredient}
                    type="button"
                    className="w-full h-full rounded-xl bg-white/10 hover:bg-accent hover:text-black text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Unit Cost Modifier for Selected Ingredient */}
              {selectedIng && (
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-purple-300 font-bold block">{selectedIng.name} Alış Fiyatı</span>
                    <span className="text-[10px] text-foreground/50">Dükkanınız bu hammaddeyi kaça alıyor? (Birim maliyet)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={quickCostInput}
                        onChange={(e) => setQuickCostInput(e.target.value)}
                        className="w-20 h-8 bg-black/70 border border-purple-500/40 focus:border-accent rounded-lg px-2 text-right font-mono font-bold text-xs text-white outline-none"
                      />
                      <span className="text-[10px] text-foreground/50 font-semibold">TL/{selectedIng.unit}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickUpdateCost}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-purple-600/20"
                    >
                      Fiyatı Güncelle
                    </button>
                  </div>
                </div>
              )}

              {costUpdatedMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{costUpdatedMsg}</span>
                </div>
              )}
            </div>

            {/* Save Recipe */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSaveRecipeModal}
                className="py-3 rounded-xl bg-accent text-black font-extrabold text-xs uppercase tracking-wider hover:bg-accent/90 transition-all cursor-pointer"
              >
                Reçeteyi Kaydet
              </button>
              <button
                onClick={() => setEditingRecipeItem(null)}
                className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD INGREDIENT MODAL */}
      {isAddIngredientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateIngredient}
            className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Yeni Hammadde Tanımla</h3>
              <button
                type="button"
                onClick={() => setIsAddIngredientOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">Hammadde Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Dana Antrikot, Manda Mozzarella..."
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">Birim *</label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value as IngredientUnit)}
                    className="w-full bg-[#121818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="l">Litre (l)</option>
                    <option value="ml">Mililitre (ml)</option>
                    <option value="adet">Adet</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">Birim Alış Fiyatı (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Örn: 480"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">Mevcut Stok Miktarı *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Örn: 25"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">Kritik Stok Uyarısı</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Örn: 5"
                    value={newIngCritical}
                    onChange={(e) => setNewIngCritical(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">Kategori</label>
                <select
                  value={newIngCategory}
                  onChange={(e) => setNewIngCategory(e.target.value as Ingredient["category"])}
                  className="w-full bg-[#121818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="ET">Et & Şarküteri</option>
                  <option value="SUT_URUNU">Süt & Peynir</option>
                  <option value="UNLU_MAMUL">Unlu Mamul & Ekmek</option>
                  <option value="SEBZE">Sebze & Meyve</option>
                  <option value="SOS">Sos & Yağ</option>
                  <option value="ICECEK">İçecek & Kahve</option>
                  <option value="BAHARAT">Baharat & Kuru Gıda</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="submit"
                className="py-3 rounded-xl bg-accent text-black font-extrabold text-xs uppercase tracking-wider hover:bg-accent/90 transition-all cursor-pointer"
              >
                Hammaddeyi Kaydet
              </button>
              <button
                type="button"
                onClick={() => setIsAddIngredientOpen(false)}
                className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD WASTE MODAL */}
      {isWasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateWaste}
            className="w-full max-w-md bg-[#0a0f0f] border border-red-500/30 rounded-[2rem] p-6 space-y-4 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Fire / Zayi Kaydı Oluştur</h3>
              <button
                type="button"
                onClick={() => setIsWasteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">Zayi Olan Hammadde *</label>
                <select
                  value={wasteIngId}
                  onChange={(e) => setWasteIngId(e.target.value)}
                  className="w-full bg-[#121818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Mevcut: {ing.currentStock} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">Zayi Miktarı *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Örn: 2"
                  value={wasteQty}
                  onChange={(e) => setWasteQty(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">Fire Sebebi *</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value as WasteLog["reason"])}
                  className="w-full bg-[#121818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="PREPARATION_ERROR">Hazırlık / Mutfak Hatası</option>
                  <option value="EXPIRED">Tarihi Geçti / Bozuldu</option>
                  <option value="DAMAGED">Kırılma / Dökülme / Fiziksel Hasar</option>
                  <option value="STAFF_MEAL">Personel Yemeği / İkram</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">Kaydeden Personel</label>
                <input
                  type="text"
                  value={wasteBy}
                  onChange={(e) => setWasteBy(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="submit"
                className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Fireyi Kaydet
              </button>
              <button
                type="button"
                onClick={() => setIsWasteModalOpen(false)}
                className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT INGREDIENT MODAL */}
      {editingIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveEditIngredient}
            className="w-full max-w-md bg-[#0a0f0f] border border-accent/40 rounded-[2rem] p-6 space-y-4 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Hammadde & Alış Fiyatını Güncelle</h3>
                <p className="text-xs text-accent font-semibold">{editingIngredient.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingIngredient(null)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">Hammadde Adı</label>
                <input
                  type="text"
                  required
                  value={editIngName}
                  onChange={(e) => setEditIngName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">Birim Alış Fiyatı (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editIngCost}
                    onChange={(e) => setEditIngCost(e.target.value)}
                    className="w-full bg-white/5 border border-accent/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-accent outline-none focus:border-accent"
                  />
                  <span className="text-[9px] text-foreground/40 mt-0.5 block">Tedarik maliyetiniz</span>
                </div>

                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">Ölçü Birimi</label>
                  <select
                    value={editIngUnit}
                    onChange={(e) => setEditIngUnit(e.target.value as IngredientUnit)}
                    className="w-full bg-[#121818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="l">Litre (l)</option>
                    <option value="ml">Mililitre (ml)</option>
                    <option value="adet">Adet</option>
                    <option value="porsiyon">Porsiyon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">Mevcut Depo Stoğu</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editIngStock}
                    onChange={(e) => setEditIngStock(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">Kritik Stok Uyarısı</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editIngCritical}
                    onChange={(e) => setEditIngCritical(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">Kategori</label>
                <select
                  value={editIngCategory}
                  onChange={(e) => setEditIngCategory(e.target.value as Ingredient["category"])}
                  className="w-full bg-[#121818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="ET">Et & Şarküteri</option>
                  <option value="SUT_URUNU">Süt & Peynir</option>
                  <option value="UNLU_MAMUL">Unlu Mamul & Ekmek</option>
                  <option value="SEBZE">Sebze & Meyve</option>
                  <option value="SOS">Sos & Yağ</option>
                  <option value="ICECEK">İçecek & Kahve</option>
                  <option value="BAHARAT">Baharat & Kuru Gıda</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="submit"
                className="py-3 rounded-xl bg-accent text-black font-extrabold text-xs uppercase tracking-wider hover:bg-accent/90 transition-all cursor-pointer shadow-lg shadow-accent/20"
              >
                Fiyatı & Bilgileri Kaydet
              </button>
              <button
                type="button"
                onClick={() => setEditingIngredient(null)}
                className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
