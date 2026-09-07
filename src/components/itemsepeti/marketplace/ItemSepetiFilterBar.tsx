"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, ArrowUpDown, Check } from "lucide-react";
import { ItemSepetiProductType } from "@/types/marketplace";

interface CategoryFilterBarProps {
  basePath: string;
  gameServers?: { id: string; name: string }[];
  categories?: { id: string; name: string; slug: string; productType: string }[];
  currentProductType?: string;
  currentCategory?: string;
  currentServer?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentSort?: string;
  currentInStockOnly?: boolean;
}

export default function ItemSepetiFilterBar({
  basePath,
  gameServers = [],
  categories = [],
  currentProductType = "",
  currentCategory = "",
  currentServer = "",
  currentMinPrice = "",
  currentMaxPrice = "",
  currentSort = "NEWEST",
  currentInStockOnly = false,
}: CategoryFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Local filter states
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [selectedServer, setSelectedServer] = useState(currentServer);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [inStockOnly, setInStockOnly] = useState(currentInStockOnly);
  const [selectedSort, setSelectedSort] = useState(currentSort);

  const applyFilters = (overrides: Record<string, string | undefined> = {}) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    const newMin = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
    const newMax = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
    const newServer = overrides.server !== undefined ? overrides.server : selectedServer;
    const newCat = overrides.category !== undefined ? overrides.category : selectedCategory;
    const newStock = overrides.inStock !== undefined ? overrides.inStock : (inStockOnly ? "true" : undefined);
    const newSort = overrides.sort !== undefined ? overrides.sort : selectedSort;

    if (newMin) params.set("min", newMin);
    else params.delete("min");

    if (newMax) params.set("max", newMax);
    else params.delete("max");

    if (newServer) params.set("server", newServer);
    else params.delete("server");

    if (newCat) params.set("category", newCat);
    else params.delete("category");

    if (newStock === "true") params.set("inStock", "true");
    else params.delete("inStock");

    if (newSort && newSort !== "NEWEST") params.set("sort", newSort);
    else params.delete("sort");

    setMobileDrawerOpen(false);
    router.push(`${basePath}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedServer("");
    setSelectedCategory("");
    setInStockOnly(false);
    setSelectedSort("NEWEST");
    setMobileDrawerOpen(false);
    router.push(basePath);
  };

  const hasActiveFilters =
    Boolean(minPrice || maxPrice || selectedServer || selectedCategory || inStockOnly || selectedSort !== "NEWEST");

  return (
    <>
      {/* DESKTOP & MOBILE TOP BAR */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[12px] border text-xs text-[#9498A6]"
        style={{
          backgroundColor: "rgba(27, 30, 39, 0.4)",
          borderColor: "#282C3A",
        }}
      >
        {/* LEFT: FILTER BUTTON (MOBILE) + ACTIVE SUMMARY */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#E8A33D] text-[#12141A] font-semibold"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrele</span>
          </button>

          {/* DESKTOP INLINE QUICK FILTERS */}
          <div className="hidden md:flex items-center gap-2">
            {/* Category Dropdown */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  applyFilters({ category: e.target.value || undefined });
                }}
                className="bg-black/20 border border-white/10 rounded-[8px] px-2.5 py-1 text-inherit focus:outline-none focus:border-[#E8A33D]"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            {/* Server Dropdown (if game has servers) */}
            {gameServers.length > 0 && (
              <select
                value={selectedServer}
                onChange={(e) => {
                  setSelectedServer(e.target.value);
                  applyFilters({ server: e.target.value || undefined });
                }}
                className="bg-black/20 border border-white/10 rounded-[8px] px-2.5 py-1 text-inherit focus:outline-none focus:border-[#E8A33D]"
              >
                <option value="">Tüm Sunucular</option>
                {gameServers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {/* In Stock toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none px-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  applyFilters({ inStock: e.target.checked ? "true" : undefined });
                }}
                className="rounded border-white/20 text-[#E8A33D] focus:ring-0"
              />
              <span>Yalnızca Stoktakiler</span>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-[#E8A33D] hover:underline ml-2"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: SORT SELECTOR */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#E8A33D]" />
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              applyFilters({ sort: e.target.value });
            }}
            aria-label="İlanları Sırala"
            className="bg-black/20 border border-white/10 rounded-[8px] px-2.5 py-1 text-inherit focus:outline-none focus:border-[#E8A33D]"
          >
            <option value="NEWEST">En Yeniler</option>
            <option value="PRICE_ASC">Fiyat: Düşükten Yükseğe</option>
            <option value="PRICE_DESC">Fiyat: Yüksekten Düşüğe</option>
            <option value="POPULAR">En Popüler</option>
          </select>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-h-[85vh] rounded-t-[20px] p-5 space-y-4 border-t overflow-y-auto"
            style={{
              backgroundColor: "#161921",
              borderColor: "#282C3A",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-bold text-sm text-inherit">Filtreler</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-[#9498A6] hover:text-inherit"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs text-[#9498A6]">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-[8px] p-2 text-xs text-inherit"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Server */}
            {gameServers.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs text-[#9498A6]">Sunucu (Server)</label>
                <select
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-[8px] p-2 text-xs text-inherit"
                >
                  <option value="">Tüm Sunucular</option>
                  {gameServers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price range */}
            <div className="space-y-1">
              <label className="text-xs text-[#9498A6]">Fiyat Aralığı (TL)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-[8px] p-2 text-xs text-inherit"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-[8px] p-2 text-xs text-inherit"
                />
              </div>
            </div>

            {/* Stock only */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-inherit pt-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#E8A33D]"
              />
              <span>Yalnızca Stoktakiler</span>
            </label>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-[10px] border border-white/10 text-xs font-semibold text-[#9498A6]"
              >
                Temizle
              </button>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="flex-1 py-2.5 rounded-[10px] bg-[#E8A33D] text-[#12141A] text-xs font-bold"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
