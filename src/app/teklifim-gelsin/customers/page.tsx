"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Star,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Building2,
  Filter,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import SupplierCustomerCard from "@/components/teklifimGelsin/SupplierCustomerCard";
import { TeklifimSupplierCustomer, TeklifimCustomerSegment } from "@/types/teklifimGelsin";

function CustomersContent() {
  const [user, setUser] = useState<any>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<TeklifimSupplierCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<"all" | "favorite" | TeklifimCustomerSegment>("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        try {
          const token = await currUser.getIdToken();
          setIdToken(token);
          await loadCustomers(token);
        } catch (err: any) {
          setError("Musteri listesi yuklenemedi.");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const loadCustomers = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teklifim-gelsin/supplier-center/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Musteri listesi alinamadi.");
      }

      setCustomers(data.customers || []);
    } catch (err: any) {
      setError(err.message || "Baglanti hatasi olustu.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (customerId: string): Promise<boolean> => {
    if (!idToken) return false;
    const res = await fetch(`/api/teklifim-gelsin/supplier-center/customers/${customerId}/favorite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error("Favori islemi basarisiz.");
    }

    const data = await res.json();
    setCustomers((prev) =>
      prev.map((c) =>
        c.businessId === customerId ? { ...c, isFavorite: data.isFavorite } : c
      )
    );
    return data.isFavorite;
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Segment filter
      if (selectedSegment === "favorite" && !c.isFavorite) return false;
      if (
        selectedSegment !== "all" &&
        selectedSegment !== "favorite" &&
        c.segment !== selectedSegment
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.businessName.toLowerCase().includes(q);
        const matchesCity = (c.city || "").toLowerCase().includes(q);
        const matchesCategory = c.categories.some((cat) => cat.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesCategory) return false;
      }

      return true;
    });
  }, [customers, selectedSegment, searchQuery]);

  const favoritesCount = customers.filter((c) => c.isFavorite).length;
  const regularCount = customers.filter((c) => c.segment === "regular").length;
  const activeCount = customers.filter((c) => c.segment === "active").length;
  const dormantCount = customers.filter((c) => c.segment === "dormant").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Musteriler yukleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/teklifim-gelsin/supplier-center"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Satis Merkezine Don</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Musteriler & Alim Gecmisi
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daha once ticaret yaptiginiz isletmeler, siparis sikliklari ve tekrar satis firsatlari.
                </p>
              </div>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 w-fit">
            Toplam: <strong>{customers.length}</strong> Isletme
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Firma adi, sehir veya kategori ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Segment Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <button
              onClick={() => setSelectedSegment("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedSegment === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Tumu ({customers.length})
            </button>

            <button
              onClick={() => setSelectedSegment("favorite")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedSegment === "favorite"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Oncelikli Musteriler ({favoritesCount})</span>
            </button>

            <button
              onClick={() => setSelectedSegment("regular")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedSegment === "regular"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Duzenli ({regularCount})
            </button>

            <button
              onClick={() => setSelectedSegment("active")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedSegment === "active"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Aktif ({activeCount})
            </button>

            <button
              onClick={() => setSelectedSegment("dormant")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedSegment === "dormant"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Geri Kazanim Bekleyen ({dormantCount})
            </button>
          </div>
        </div>

        {/* Customer Cards Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Musteri bulunamadi.
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Arama kriterlerinizi degistirebilir veya yeni taleplere teklif vererek musteri portfoyunuzu genisleterek baslayabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <SupplierCustomerCard
                key={customer.businessId}
                customer={customer}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs text-slate-400">Yukleniyor...</p>
        </div>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}
