"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Package,
  Plus,
  FileSpreadsheet,
  Download,
  LayoutGrid,
  List as ListIcon,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import ProductCard from "@/components/teklifimGelsin/ProductCard";
import ProductFormModal from "@/components/teklifimGelsin/ProductFormModal";
import ProductCsvImportModal from "@/components/teklifimGelsin/ProductCsvImportModal";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  TeklifimProduct,
  TeklifimStockStatus,
  TEKLIFIM_CATEGORIES,
  SUBCATEGORY_MAPPING,
} from "@/types/teklifimGelsin";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<TeklifimProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "Tümü");
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get("subCategory") || "Tümü");
  const [stockStatus, setStockStatus] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());

  // Load user & profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          const pRes = await fetch("/api/teklifim-gelsin/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pRes.ok) {
            const pData = await pRes.json();
            setProfile(pData.profile);
          }

          // Load user's favorited product IDs
          const fRes = await fetch("/api/teklifim-gelsin/products/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (fRes.ok) {
            const fData = await fRes.json();
            const favIds = new Set<string>((fData.favorites || []).map((f: any) => f.productId));
            setUserFavorites(favIds);
          }
        } catch {}
      }
    });

    return () => unsub();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "Tümü") {
        params.set("category", selectedCategory);
      }
      if (selectedSubCategory && selectedSubCategory !== "Tümü") {
        params.set("subCategory", selectedSubCategory);
      }
      if (searchQuery.trim()) {
        params.set("searchQuery", searchQuery.trim());
      }
      if (stockStatus && stockStatus !== "all") {
        params.set("stockStatus", stockStatus);
      }
      if (inStockOnly) {
        params.set("inStockOnly", "true");
      }
      if (minPrice) {
        params.set("minPrice", minPrice);
      }
      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      }
      if (sort) {
        params.set("sort", sort);
      }

      const res = await fetch(`/api/teklifim-gelsin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Products load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubCategory, stockStatus, inStockOnly, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Tümü");
    setSelectedSubCategory("Tümü");
    setStockStatus("all");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  const handleToggleFavorite = async (product: TeklifimProduct) => {
    if (!currentUser) {
      router.push("/teklifim-gelsin/auth?role=business");
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/products/${product.id}/favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserFavorites((prev) => {
          const next = new Set(prev);
          if (data.isFavorited) {
            next.add(product.id);
          } else {
            next.delete(product.id);
          }
          return next;
        });
      }
    } catch {}
  };

  const handleExportCsv = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/products/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `toptancim-urun-katalogu-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("CSV Export failed:", err);
    }
  };

  const handleAddProductSubmit = async (productData: Partial<TeklifimProduct>) => {
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    const res = await fetch("/api/teklifim-gelsin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Ürün eklenemedi.");
    }

    fetchProducts();
  };

  const subCategoriesList =
    selectedCategory && selectedCategory !== "Tümü"
      ? SUBCATEGORY_MAPPING[selectedCategory] || []
      : [];

  const isSupplier = profile?.role === "supplier";

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <TeklifimHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* TOP HERO / HEADER BANNER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <Package className="w-3.5 h-3.5" />
              <span>B2B Toptan Ticaret Merkezi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ürün Kataloğu & Toptan Fiyatlar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Doğrudan üreticilerden ve toptancılardan ürünleri inceleyin, minimum sipariş adetlerini karşılaştırın ve anında teklif isteyin.
            </p>
          </div>

          {/* SUPPLIER ACTIONS */}
          {isSupplier && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Ürün Ekle</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="CSV ile Toplu Ürün Yükle"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>CSV Yükle</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Kataloğu CSV Olarak İndir"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* SEARCH BAR & QUICK CONTROLS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* SEARCH INPUT */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün adı, stok kodu (SKU), kategori veya marka arayın..."
              className="w-full pl-10 pr-24 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-emerald-600 text-white text-[11px] font-bold transition-colors"
            >
              Ara
            </button>
          </form>

          {/* SORT & VIEW CONTROLS */}
          <div className="flex items-center gap-2 shrink-0">
            {/* SORT SELECT */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
              >
                <option value="newest">En Yeni Ürünler</option>
                <option value="price_asc">Fiyat: Artan (En Düşük)</option>
                <option value="price_desc">Fiyat: Azalan (En Yüksek)</option>
                <option value="popular">En Çok İlgi Görenler</option>
                <option value="min_order">Min. Sipariş Adedi (Düşük)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* MOBILE FILTER BUTTON */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtre</span>
            </button>

            {/* VIEW MODE TOGGLE */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Izgara Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Liste Görünümü"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CATEGORIES HORIZONTAL PILLS */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                setSelectedCategory("Tümü");
                setSelectedSubCategory("Tümü");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === "Tümü"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Tüm Kategoriler
            </button>
            {TEKLIFIM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubCategory("Tümü");
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SUB-CATEGORY PILLS IF CATEGORY SELECTED */}
          {subCategoriesList.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pl-1 scrollbar-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Alt Kategoriler:
              </span>
              <button
                onClick={() => setSelectedSubCategory("Tümü")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
                  selectedSubCategory === "Tümü"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                Tümü
              </button>
              {subCategoriesList.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
                    selectedSubCategory === sub
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN BODY: SIDEBAR FILTERS + PRODUCTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* DESKTOP SIDEBAR FILTER */}
          <div className="hidden lg:block bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Filtreler</span>
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
              >
                Temizle
              </button>
            </div>

            {/* STOCKS FILTER */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Stok Durumu
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { value: "all", label: "Tümü" },
                  { value: "in_stock", label: "Stokta Var" },
                  { value: "low_stock", label: "Kritik Stok" },
                  { value: "made_to_order", label: "Siparişe Göre Üretim" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium hover:text-emerald-600"
                  >
                    <input
                      type="radio"
                      name="stockStatus"
                      value={item.value}
                      checked={stockStatus === item.value}
                      onChange={(e) => setStockStatus(e.target.value)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* IN STOCK ONLY TOGGLE */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Yalnızca Hemen Teslim
                </span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">
                Tükenmiş veya belirsiz ürünleri gizler.
              </p>
            </div>

            {/* PRICE RANGE */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Birim Fiyat Aralığı (TRY)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min TL"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
                />
                <input
                  type="number"
                  placeholder="Max TL"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
                />
              </div>
              <button
                type="button"
                onClick={fetchProducts}
                className="w-full py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-[11px] font-bold transition-colors"
              >
                Fiyata Göre Filtrele
              </button>
            </div>
          </div>

          {/* PRODUCTS LIST / GRID CONTENT */}
          <div className="lg:col-span-3 space-y-4">
            {/* RESULTS HEADER */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>
                Toplam <strong className="text-slate-900 dark:text-white">{products.length}</strong> toptan ürün listeleniyor
              </span>
              {(selectedCategory !== "Tümü" || stockStatus !== "all" || inStockOnly || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-400">Ürün kataloğu taranıyor...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Eşleşen Ürün Bulunamadı
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Arama kriterlerinize veya seçilen filtrelere uygun ürün bulunamadı. Filtreleri sıfırlayarak tekrar arayabilirsiniz.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>Filtreleri Sıfırla</span>
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorited={userFavorites.has(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title || product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                          {product.sku && (
                            <span className="text-[10px] font-mono text-slate-400">
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/teklifim-gelsin/products/${product.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 line-clamp-1"
                        >
                          {product.title || product.name}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {product.supplierName} • Min. Sipariş: {product.minOrder || "1 Adet"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        {product.priceVisibility === "request_quote" || !product.price ? (
                          <span className="text-xs font-bold text-emerald-600">Teklif İsteyiniz</span>
                        ) : (
                          <div>
                            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                              {product.price.toFixed(2)} {product.currency || "TRY"}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ {product.unit || "Adet"}</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/teklifim-gelsin/requests/new?productId=${product.id}&supplierId=${product.supplierId}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      >
                        Teklif İste
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODALS */}
      {showAddModal && (
        <ProductFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProductSubmit}
        />
      )}

      {showImportModal && currentUser && (
        <ProductCsvImportModal
          supplierId={currentUser.uid}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => fetchProducts()}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}

