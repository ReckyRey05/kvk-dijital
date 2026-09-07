"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Package,
  Building2,
  Layers,
  Sparkles,
  ArrowUpDown,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import SearchBar from "@/components/teklifimGelsin/SearchBar";
import ProductCard from "@/components/teklifimGelsin/ProductCard";
import SupplierCard from "@/components/teklifimGelsin/SupplierCard";
import ZeroResultState from "@/components/teklifimGelsin/ZeroResultState";
import PersonalizedRecommendations from "@/components/teklifimGelsin/PersonalizedRecommendations";
import ComparisonDrawer from "@/components/teklifimGelsin/ComparisonDrawer";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import {
  TeklifimProduct,
  TeklifimSupplierProfile,
  TeklifimCategoryMatch,
  TeklifimSearchType,
  TeklifimSearchSort,
  TEKLIFIM_CATEGORIES,
  SUBCATEGORY_MAPPING,
  TURKEY_CITIES,
} from "@/types/teklifimGelsin";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial params
  const initialQ = searchParams.get("q") || searchParams.get("query") || "";
  const initialType = (searchParams.get("type") as TeklifimSearchType) || "all";
  const initialCategory = searchParams.get("category") || "";
  const initialSubCategory = searchParams.get("subCategory") || "";
  const initialCity = searchParams.get("city") || "";
  const initialInStock = searchParams.get("inStockOnly") === "true";
  const initialVerified = searchParams.get("verifiedOnly") === "true";
  const initialSort = (searchParams.get("sort") as TeklifimSearchSort) || "relevance";

  // State
  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<TeklifimSearchType>(initialType);
  const [category, setCategory] = useState(initialCategory);
  const [subCategory, setSubCategory] = useState(initialSubCategory);
  const [city, setCity] = useState(initialCity);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified);
  const [sort, setSort] = useState<TeklifimSearchSort>(initialSort);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [products, setProducts] = useState<TeklifimProduct[]>([]);
  const [suppliers, setSuppliers] = useState<TeklifimSupplierProfile[]>([]);
  const [categories, setCategories] = useState<TeklifimCategoryMatch[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Fetch results
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (activeTab !== "all") params.set("type", activeTab);
      if (category) params.set("category", category);
      if (subCategory) params.set("subCategory", subCategory);
      if (city) params.set("city", city);
      if (inStockOnly) params.set("inStockOnly", "true");
      if (verifiedOnly) params.set("verifiedOnly", "true");
      if (sort !== "relevance") params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const res = await fetch(`/api/teklifim-gelsin/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setSuppliers(data.suppliers || []);
        setCategories(data.categories || []);
        setTotalProducts(data.totalProducts || 0);
        setTotalSuppliers(data.totalSuppliers || 0);
        setTotalCategories(data.totalCategories || 0);
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, activeTab, category, subCategory, city, inStockOnly, verifiedOnly, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Sync URL query params
  const updateUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeTab !== "all") params.set("type", activeTab);
    if (category) params.set("category", category);
    if (subCategory) params.set("subCategory", subCategory);
    if (city) params.set("city", city);
    if (inStockOnly) params.set("inStockOnly", "true");
    if (verifiedOnly) params.set("verifiedOnly", "true");
    if (sort !== "relevance") params.set("sort", sort);

    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });

    router.replace(`/teklifim-gelsin/search?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (newQuery: string) => {
    setQuery(newQuery);
    setIsSaved(false);
    updateUrl({ q: newQuery || undefined });
  };

  const handleTabChange = (type: TeklifimSearchType) => {
    setActiveTab(type);
    updateUrl({ type: type === "all" ? undefined : type });
  };

  const handleClearFilters = () => {
    setCategory("");
    setSubCategory("");
    setCity("");
    setInStockOnly(false);
    setVerifiedOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("relevance");
    router.replace(`/teklifim-gelsin/search?q=${encodeURIComponent(query)}`, { scroll: false });
  };

  const handleSaveSearch = async () => {
    if (!currentUser) {
      router.push("/teklifim-gelsin/auth");
      return;
    }

    setSaveLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/search/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: query ? `"${query}" Araması` : `${category || "Tüm"} Araması`,
          query,
          filters: {
            category: category || undefined,
            subCategory: subCategory || undefined,
            city: city || undefined,
            inStockOnly,
            verifiedOnly,
            sort,
          },
        }),
      });

      if (res.ok) {
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Save search error:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const totalResultsCount = totalProducts + totalSuppliers + totalCategories;
  const isZeroResult = !loading && totalResultsCount === 0;

  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
        <TeklifimHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* TOP SEARCH HEADER */}
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1 max-w-3xl">
                <SearchBar
                  initialQuery={query}
                  initialCategory={category}
                  onSearch={(q) => handleSearchSubmit(q)}
                  autoFocus={!query}
                />
              </div>

              {/* SAVE SEARCH & FILTER TOGGLE */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveSearch}
                  disabled={saveLoading || isSaved || !query}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    isSaved
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                  } ${!query ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  title="Bu aramayı ve filtreleri kaydet"
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      <span>Kaydedildi</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>Aramayı Kaydet</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  className="md:hidden px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtreler</span>
                </button>
              </div>
            </div>

            {/* SEARCH TABS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleTabChange("all")}
                className={`pb-2 px-3 transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === "all"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Tümü ({totalResultsCount})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("products")}
                className={`pb-2 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "products"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Ürünler ({totalProducts})</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("suppliers")}
                className={`pb-2 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "suppliers"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Tedarikçiler ({totalSuppliers})</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("categories")}
                className={`pb-2 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "categories"
                    ? "border-amber-600 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Kategoriler ({totalCategories})</span>
              </button>
            </div>
          </div>

          {/* MAIN LAYOUT: SIDEBAR FILTERS + RESULTS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* FILTERS SIDEBAR */}
            <aside
              className={`md:block md:col-span-1 space-y-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm ${
                showFiltersMobile ? "block" : "hidden"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  Detaylı Filtreler
                </span>
                {(category || subCategory || city || inStockOnly || verifiedOnly || minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Temizle
                  </button>
                )}
              </div>

              {/* CATEGORY SELECT */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    setSubCategory("");
                    updateUrl({ category: newCat || undefined, subCategory: undefined });
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="">Tüm Kategoriler</option>
                  {TEKLIFIM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUBCATEGORY SELECT */}
              {category && SUBCATEGORY_MAPPING[category] && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Alt Kategori
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setSubCategory(newSub);
                      updateUrl({ subCategory: newSub || undefined });
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="">Tüm Alt Kategoriler</option>
                    {SUBCATEGORY_MAPPING[category].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* CITY SELECT */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Lokasyon / Şehir
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    updateUrl({ city: newCity || undefined });
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="">Tüm Türkiye</option>
                  {TURKEY_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* SORT OPTIONS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Sıralama
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    const newSort = e.target.value as TeklifimSearchSort;
                    setSort(newSort);
                    updateUrl({ sort: newSort });
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="relevance">En Alakalı (Önerilen)</option>
                  <option value="price_asc">Fiyat: Artan (En Düşük)</option>
                  <option value="price_desc">Fiyat: Azalan (En Yüksek)</option>
                  <option value="moq_asc">Asgari Sipariş: En Düşük</option>
                  <option value="fastest_delivery">Termin Süresi: En Hızlı</option>
                  <option value="popular">Popülerlik / İlgi</option>
                  <option value="rating">Puan / Değerlendirme</option>
                  <option value="deals">Tamamlanan Anlaşma Sayısı</option>
                  <option value="newest">En Yeni Eklenenler</option>
                </select>
              </div>

              {/* CHECKBOXES */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      updateUrl({ inStockOnly: e.target.checked ? "true" : undefined });
                    }}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Sadece Hemen Teslim Stokta Olanlar
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => {
                      setVerifiedOnly(e.target.checked);
                      updateUrl({ verifiedOnly: e.target.checked ? "true" : undefined });
                    }}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Sadece Doğrulanmış Tedarikçiler
                  </span>
                </label>
              </div>

              {/* PRICE RANGE INPUTS */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Birim Fiyat Aralığı (TL)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </aside>

            {/* RESULTS CONTENT */}
            <div className="md:col-span-3 space-y-6">
              {/* ACTIVE FILTER CHIPS */}
              {(category || subCategory || city || inStockOnly || verifiedOnly || minPrice || maxPrice) && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">Aktif Filtreler:</span>
                  {category && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {category}
                      <button
                        type="button"
                        onClick={() => {
                          setCategory("");
                          setSubCategory("");
                          updateUrl({ category: undefined, subCategory: undefined });
                        }}
                      >
                        <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                      </button>
                    </span>
                  )}
                  {subCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {subCategory}
                      <button
                        type="button"
                        onClick={() => {
                          setSubCategory("");
                          updateUrl({ subCategory: undefined });
                        }}
                      >
                        <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                      </button>
                    </span>
                  )}
                  {city && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {city}
                      <button
                        type="button"
                        onClick={() => {
                          setCity("");
                          updateUrl({ city: undefined });
                        }}
                      >
                        <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                      </button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      Stokta Olanlar
                      <button
                        type="button"
                        onClick={() => {
                          setInStockOnly(false);
                          updateUrl({ inStockOnly: undefined });
                        }}
                      >
                        <X className="w-3 h-3 text-emerald-500 hover:text-emerald-700" />
                      </button>
                    </span>
                  )}
                  {verifiedOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                      Doğrulanmış Tedarikçiler
                      <button
                        type="button"
                        onClick={() => {
                          setVerifiedOnly(false);
                          updateUrl({ verifiedOnly: undefined });
                        }}
                      >
                        <X className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* LOADING STATE */}
              {loading && (
                <div className="p-16 text-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                  <p className="text-sm font-semibold">Toptancılar ve ürünler taranıyor...</p>
                </div>
              )}

              {/* ZERO RESULT STATE */}
              {isZeroResult && (
                <ZeroResultState
                  query={query}
                  category={category}
                  city={city}
                  onClearFilters={handleClearFilters}
                />
              )}

              {/* PRODUCTS SECTION */}
              {!loading && (activeTab === "all" || activeTab === "products") && products.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Ürünler</span>
                      <span className="text-xs font-normal text-slate-400">({totalProducts} sonuç)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* SUPPLIERS SECTION */}
              {!loading && (activeTab === "all" || activeTab === "suppliers") && suppliers.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Tedarikçiler</span>
                      <span className="text-xs font-normal text-slate-400">({totalSuppliers} sonuç)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {suppliers.map((s) => (
                      <SupplierCard
                        key={s.id}
                        supplier={{
                          uid: s.id,
                          email: s.email || "",
                          companyName: s.companyName,
                          role: "supplier",
                          city: s.city || "Türkiye",
                          district: s.district,
                          categories: s.categories || [],
                          isVerified: Boolean(s.verification?.isVerified || s.isVerified),
                          verificationStatus: s.verification?.isVerified ? "verified" : "unverified",
                          createdAt: s.createdAt || 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CATEGORIES SECTION */}
              {!loading && (activeTab === "all" || activeTab === "categories") && categories.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span>Eşleşen Kategoriler</span>
                      <span className="text-xs font-normal text-slate-400">({categories.length} kategori)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((c) => (
                      <div
                        key={c.name}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 hover:shadow-md transition-shadow"
                      >
                        <Link
                          href={`/teklifim-gelsin/categories/${c.slug}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {c.description}
                        </p>
                        <div className="pt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            {c.productsCount || 0} ürün • {c.suppliersCount || 0} toptancı
                          </span>
                          <Link
                            href={`/teklifim-gelsin/categories/${c.slug}`}
                            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            İncele
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PERSONALIZED RECOMMENDATIONS SECTION */}
              {!loading && (
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                  <PersonalizedRecommendations />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* COMPARISON DRAWER */}
        <ComparisonDrawer />
      </div>
    </TeklifimThemeProvider>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
