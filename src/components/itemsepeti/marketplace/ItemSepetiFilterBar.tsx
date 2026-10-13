"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, ArrowUpDown, Check } from "lucide-react";
import { ItemSepetiProductType } from "@/types/marketplace";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";

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
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";
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
        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[8px] border text-xs"
        style={{
          backgroundColor: isDark ? "rgba(24, 28, 34, 0.6)" : "#FFFFFF",
          borderColor: isDark ? "#2A313C" : "#E5E8EB",
          color: isDark ? "#8E97A4" : "#69717D",
        }}
      >
        {/* LEFT: FILTER BUTTON (MOBILE) + ACTIVE SUMMARY */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0F625C] text-white font-semibold cursor-pointer"
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
                className="rounded-[6px] px-2.5 py-1 text-inherit focus:outline-none focus:border-[#0F625C]"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#F0F4F3",
                  borderColor: isDark ? "#2A313C" : "#E5E8EB",
                  borderWidth: "1px",
                  color: isDark ? "#EDEEF2" : "#15191E",
                }}
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
                className="rounded-[6px] px-2.5 py-1 text-inherit focus:outline-none focus:border-[#0F625C]"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#F0F4F3",
                  borderColor: isDark ? "#2A313C" : "#E5E8EB",
                  borderWidth: "1px",
                  color: isDark ? "#EDEEF2" : "#15191E",
                }}
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
                className="rounded text-[#0F625C] focus:ring-0"
                style={{ borderColor: isDark ? "#2A313C" : "#E5E8EB" }}
              />
              <span style={{ color: isDark ? "#8E97A4" : "#69717D" }}>Yalnızca Stoktakiler</span>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-semibold hover:underline ml-2"
                style={{ color: "#0F625C" }}
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: SORT SELECTOR */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#0F625C] dark:text-[#168B83]" />
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              applyFilters({ sort: e.target.value });
            }}
            aria-label="İlanları Sırala"
            className="rounded-[6px] px-2.5 py-1 text-inherit focus:outline-none focus:border-[#0F625C]"
            style={{
              backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#F0F4F3",
              borderColor: isDark ? "#2A313C" : "#E5E8EB",
              borderWidth: "1px",
              color: isDark ? "#EDEEF2" : "#15191E",
            }}
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
            className="w-full max-h-[85vh] rounded-t-[16px] p-5 space-y-4 border-t overflow-y-auto"
            style={{
              backgroundColor: isDark ? "#161921" : "#FFFFFF",
              borderColor: isDark ? "#282C3A" : "#DCDDE1",
              color: isDark ? "#EDEEF2" : "#17191F",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#DCDDE1" }}>
              <span className="font-bold text-sm">Filtreler</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1"
                style={{ color: isDark ? "#9498A6" : "#626772" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs" style={{ color: isDark ? "#9498A6" : "#626772" }}>Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-[8px] p-2 text-xs"
                  style={{
                    backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#F0F1F3",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#DCDDE1",
                    borderWidth: "1px",
                    color: isDark ? "#EDEEF2" : "#17191F",
                  }}
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
                <label className="text-xs" style={{ color: isDark ? "#9498A6" : "#626772" }}>Sunucu (Server)</label>
                <select
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  className="w-full rounded-[8px] p-2 text-xs"
                  style={{
                    backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#F0F1F3",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#DCDDE1",
                    borderWidth: "1px",
                    color: isDark ? "#EDEEF2" : "#17191F",
                  }}
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
              <label className="text-xs" style={{ color: isDark ? "#9498A6" : "#626772" }}>Fiyat Aralığı (TL)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-[8px] p-2 text-xs"
                  style={{
                    backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#F0F1F3",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#DCDDE1",
                    borderWidth: "1px",
                    color: isDark ? "#EDEEF2" : "#17191F",
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-[8px] p-2 text-xs"
                  style={{
                    backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#F0F1F3",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#DCDDE1",
                    borderWidth: "1px",
                    color: isDark ? "#EDEEF2" : "#17191F",
                  }}
                />
              </div>
            </div>

            {/* Stock only */}
            <label className="flex items-center gap-2 cursor-pointer text-xs pt-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#D99532]"
              />
              <span>Yalnızca Stoktakiler</span>
            </label>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-[8px] border text-xs font-semibold"
                style={{
                  borderColor: isDark ? "#282C3A" : "#DCDDE1",
                  color: isDark ? "#9498A6" : "#626772",
                }}
              >
                Temizle
              </button>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="flex-1 py-2.5 rounded-[8px] bg-[#D99532] text-white text-xs font-bold shadow-sm"
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
