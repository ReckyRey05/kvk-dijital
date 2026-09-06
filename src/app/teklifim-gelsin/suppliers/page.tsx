"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  X,
} from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import SupplierCard from "@/components/teklifimGelsin/SupplierCard";
import DirectRequestModal from "@/components/teklifimGelsin/DirectRequestModal";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  TeklifimProfile,
  TeklifimRequest,
  TEKLIFIM_CATEGORIES,
  TURKEY_CITIES,
} from "@/types/teklifimGelsin";

function SuppliersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [suppliers, setSuppliers] = useState<TeklifimProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(
    searchParams.get("verified") === "true"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "relevant");

  // User auth & Direct Request Modal state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("business");
  const [favoriteIds, setFavoriteIds] = useState<Record<string, boolean>>({});
  const [modalSupplier, setModalSupplier] = useState<TeklifimProfile | null>(null);
  const [openRequests, setOpenRequests] = useState<TeklifimRequest[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          // Fetch favorites
          const fRes = await fetch("/api/teklifim-gelsin/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (fRes.ok) {
            const fData = await fRes.json();
            const map: Record<string, boolean> = {};
            (fData.favorites || []).forEach((fav: any) => {
              map[fav.supplierId] = true;
            });
            setFavoriteIds(map);
          }

          // Fetch profile for role
          const pRes = await fetch("/api/teklifim-gelsin/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pRes.ok) {
            const pData = await pRes.json();
            if (pData.profile?.role) {
              setUserRole(pData.profile.role);
            }
          }
        } catch (err) {
          console.error("Auth data load error:", err);
        }
      }
    });

    return () => unsub();
  }, []);

  // Fetch suppliers when filter params change
  useEffect(() => {
    let isMounted = true;
    const loadSuppliers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);
        if (city) params.set("city", city);
        if (verifiedOnly) params.set("verifiedOnly", "true");
        if (sort) params.set("sort", sort);

        const res = await fetch(`/api/teklifim-gelsin/suppliers?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setSuppliers(data.suppliers || []);
          }
        }
      } catch (err) {
        console.error("Failed to load suppliers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadSuppliers, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [search, category, city, verifiedOnly, sort]);

  // Favorite toggle handler
  const handleToggleFavorite = async (supplier: TeklifimProfile) => {
    if (!currentUser) {
      router.push("/teklifim-gelsin/auth?role=business");
      return;
    }
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplier }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds((prev) => ({
          ...prev,
          [supplier.uid]: data.favorited,
        }));
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  // Direct request quote handler
  const handleRequestQuote = async (supplier: TeklifimProfile) => {
    if (!currentUser) {
      router.push("/teklifim-gelsin/auth?role=business");
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const rRes = await fetch("/api/teklifim-gelsin/requests?role=business", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        const activeList = (rData.requests || []).filter(
          (r: TeklifimRequest) =>
            r.status !== "supplier_selected" &&
            r.status !== "completed" &&
            r.status !== "cancelled" &&
            r.status !== "expired"
        );
        setOpenRequests(activeList);
        setModalSupplier(supplier);
      }
    } catch (err) {
      console.error("Failed to load requests for quote modal:", err);
    }
  };

  const handleSendDirectInvitation = async (requestId: string) => {
    if (!modalSupplier || !currentUser) return;
    setSendingInvite(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/requests/${requestId}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplierId: modalSupplier.uid }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Davet iletilemedi.");
      }
    } finally {
      setSendingInvite(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCity("");
    setVerifiedOnly(false);
    setSort("relevant");
  };

  const hasActiveFilters = search || category || city || verifiedOnly || sort !== "relevant";

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <TeklifimHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* HERO TITLE BLOCK */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/80 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Doğrulanmış B2B Üretici & Toptancı Ağı</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Tedarikçi Keşfi
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
            Sektörünüze uygun güvenilir toptancıları inceleyin, doğrudan teklif isteyin ve tedarik süreçlerinizi hızlandırın.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Firma adı, ürün, ambalaj, kahve veya toptan malzeme ara..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* FILTER CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* CATEGORY DROPDOWN */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="">Tüm Kategoriler</option>
              {TEKLIFIM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* CITY DROPDOWN */}
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="">Tüm Şehirler</option>
              {TURKEY_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* SORT SELECTOR */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="relevant">Sıralama: En Alakalı</option>
              <option value="rating">Sıralama: En Yüksek Puan</option>
              <option value="speed">Sıralama: En Hızlı Yanıt</option>
              <option value="deals">Sıralama: En Çok İşlem</option>
              <option value="new">Sıralama: En Yeni Firmalar</option>
            </select>

            {/* VERIFIED ONLY TOGGLE */}
            <label className="flex items-center justify-between sm:justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sadece Onaylı</span>
              </span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-0 accent-emerald-600 cursor-pointer"
              />
            </label>
          </div>

          {/* ACTIVE FILTER PILLS & CLEAR */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Filtreler uygulandı. {suppliers.length} tedarikçi listeleniyor.
              </span>
              <button
                onClick={clearFilters}
                className="font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">
              Tedarikçiler ve onay durumları taranıyor...
            </p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Arama Kriterlerinize Uygun Tedarikçi Bulunamadı
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Filtrelerinizi genişleterek veya farklı anahtar kelimeler kullanarak tekrar arama yapabilirsiniz.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                Tüm Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.uid}
                supplier={supplier}
                isFavorited={!!favoriteIds[supplier.uid]}
                onToggleFavorite={handleToggleFavorite}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        )}
      </main>

      {/* DIRECT REQUEST MODAL */}
      {modalSupplier && (
        <DirectRequestModal
          supplier={modalSupplier}
          openRequests={openRequests}
          onClose={() => setModalSupplier(null)}
          onSend={handleSendDirectInvitation}
          sending={sendingInvite}
        />
      )}
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuppliersContent />
    </Suspense>
  );
}
