"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PackageCheck,
  Building2,
  Truck,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  Search,
  ExternalLink,
  Layers,
  Send,
  Sparkles,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  TeklifimProfile,
  TeklifimRequest,
  TeklifimOffer,
  TEKLIFIM_CATEGORIES,
  TURKEY_CITIES,
} from "@/types/teklifimGelsin";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import SupplierQuoteModal from "@/components/teklifimGelsin/SupplierQuoteModal";

export default function TeklifimDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeklifimProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Business Specific
  const [businessRequests, setBusinessRequests] = useState<TeklifimRequest[]>([]);
  const [naturalNeedPrompt, setNaturalNeedPrompt] = useState("");

  // Supplier Specific
  const [supplierTab, setSupplierTab] = useState<"feed" | "my_offers">("feed");
  const [openRequests, setOpenRequests] = useState<TeklifimRequest[]>([]);
  const [myOffers, setMyOffers] = useState<TeklifimOffer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [selectedCity, setSelectedCity] = useState<string>("Tümü");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Quote Modal State
  const [selectedReqForQuote, setSelectedReqForQuote] = useState<TeklifimRequest | null>(null);
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/teklifim-gelsin/auth");
      } else {
        setUser(currentUser);
        await loadDashboard(currentUser);
      }
    });
    return () => unsub();
  }, [router]);

  const loadDashboard = async (currentUser: any) => {
    try {
      setLoading(true);
      setError("");
      const token = await currentUser.getIdToken();

      // 1. Load Profile
      let curProfile: TeklifimProfile | null = null;
      try {
        const pRes = await fetch("/api/teklifim-gelsin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          curProfile = pData.profile;
          setProfile(curProfile);
          localStorage.setItem(`teklifim_profile_${currentUser.uid}`, JSON.stringify(curProfile));
        }
      } catch {}

      // Fallback cached profile
      if (!curProfile) {
        const cached = localStorage.getItem(`teklifim_profile_${currentUser.uid}`);
        if (cached) {
          curProfile = JSON.parse(cached);
          setProfile(curProfile);
        }
      }

      // Default role to business if not set
      const userRole = curProfile?.role || "business";

      if (userRole === "business") {
        // Fetch Business Requests
        try {
          const rRes = await fetch("/api/teklifim-gelsin/requests", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            setBusinessRequests(rData.requests || []);
          }
        } catch {}
      } else {
        // Supplier: Fetch open requests & my submitted offers
        try {
          const rRes = await fetch("/api/teklifim-gelsin/requests", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            setOpenRequests(rData.requests || []);
          }
        } catch {}

        try {
          const oRes = await fetch(`/api/teklifim-gelsin/offers`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (oRes.ok) {
            const oData = await oRes.json();
            setMyOffers(oData.offers || []);
          }
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleNaturalNeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalNeedPrompt.trim()) return;
    router.push(
      `/teklifim-gelsin/requests/new?prompt=${encodeURIComponent(naturalNeedPrompt.trim())}`
    );
  };

  const handleQuoteSubmit = async (quoteData: any) => {
    if (!selectedReqForQuote || !user) return;
    setSubmittingQuote(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(
        `/api/teklifim-gelsin/requests/${selectedReqForQuote.id}/offers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(quoteData),
        }
      );

      if (res.ok) {
        setSelectedReqForQuote(null);
        await loadDashboard(user);
      } else {
        const d = await res.json();
        throw new Error(d.error || "Teklif iletilemedi.");
      }
    } catch (err: any) {
      alert(err.message || "Teklif iletilemedi.");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const isBusiness = profile?.role !== "supplier";

  // Decision indicators for Business
  const totalIncomingOffers = businessRequests.reduce((sum, r) => sum + (r.offerCount || 0), 0);
  const activeRequests = businessRequests.filter((r) => r.status === "published" || r.status === "offers_received");
  const selectedRequests = businessRequests.filter((r) => r.status === "supplier_selected" || r.status === "completed");

  // Filtered requests for Supplier feed
  const filteredFeed = openRequests.filter((req) => {
    if (selectedCategory !== "Tümü" && req.category !== selectedCategory) return false;
    if (selectedCity !== "Tümü" && req.city !== selectedCity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchCat = req.category.toLowerCase().includes(q);
      const matchCity = req.city.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchCity) return false;
    }
    return true;
  });

  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <TeklifimHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Pazaryeri Yükleniyor...
              </p>
            </div>
          ) : isBusiness ? (
            /* =========================================================================
               BUSINESS EXPERIENCE (İşletme Kontrol Paneli)
               ========================================================================= */
            <div className="space-y-8">
              {/* TOP INSPIRING HERO PROMPT: "Şu anda neye ihtiyacın var?" */}
              <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Hızlı Talep Başlat</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                    Şu anda neye ihtiyacınız var?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Aklınızdaki ürünü veya toptan ihtiyacı yazın; onaylı toptancı ağına tek tıkla iletin.
                  </p>
                </div>

                <form onSubmit={handleNaturalNeedSubmit} className="pt-2">
                  <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
                    <input
                      type="text"
                      value={naturalNeedPrompt}
                      onChange={(e) => setNaturalNeedPrompt(e.target.value)}
                      placeholder="Örn: 500 adet çift duvarlı kraft karton bardak, İstanbul, 7 gün içinde lazım..."
                      className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-semibold text-sm sm:text-base focus:outline-none focus:border-emerald-600 shadow-inner transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>Talebi Oluştur</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* ACTION-ORIENTED DECISION CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* CARD 1: INCOMING OFFERS */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Gelen Teklifler
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Inbox className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {totalIncomingOffers}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Toplam Teklif</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {totalIncomingOffers > 0
                      ? "Teklifleri yan yana karşılaştırıp kazananı seçebilirsiniz."
                      : "Talepleriniz toptancılara dağıtıldı, teklifler bekleniyor."}
                  </p>
                </div>

                {/* CARD 2: ACTIVE REQUESTS */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Aktif Talepler
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {activeRequests.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Yayında</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pazaryerinde açık olan ve tedarikçilerin teklif sunabildiği talepleriniz.
                  </p>
                </div>

                {/* CARD 3: COMPLETED DEALS */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Anlaşma Sağlanan
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {selectedRequests.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Tedarikçi Seçildi</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tedarikçi seçimi tamamlanmış ve doğrudan iletişime geçilmiş siparişler.
                  </p>
                </div>
              </div>

              {/* REQUESTS LIST */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Talepleriniz ({businessRequests.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Yayınladığınız talepler ve toptancılardan gelen teklif durumları.
                    </p>
                  </div>

                  <Link
                    href="/teklifim-gelsin/requests/new"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Talep Aç</span>
                  </Link>
                </div>

                {businessRequests.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        Henüz Açılmış Bir Talebiniz Yok
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        İşletmenizin ihtiyacı olan ilk ürünü veya hizmeti yayınlayarak toptancılardan fiyat toplayın.
                      </p>
                    </div>
                    <Link
                      href="/teklifim-gelsin/requests/new"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>İlk Talebimi Oluştur</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businessRequests.map((req) => (
                      <Link
                        key={req.id}
                        href={`/teklifim-gelsin/requests/${req.id}`}
                        className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                              {req.category}
                            </span>

                            {/* STATUS BADGE */}
                            {req.status === "supplier_selected" || req.status === "completed" ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                                Tedarikçi Seçildi ✓
                              </span>
                            ) : req.offerCount > 0 ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold animate-pulse">
                                {req.offerCount} Teklif Geldi
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                                Teklif Bekleniyor
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {req.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {req.quantity} {req.unit}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {req.city}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {req.deliveryDays} Gün
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Teklifleri İncele</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* =========================================================================
               SUPPLIER EXPERIENCE (Toptancı / Tedarikçi Kontrol Paneli)
               "Bugün Bana Uygun Hangi İşler Var?"
               ========================================================================= */
            <div className="space-y-8">
              {/* TOP SUPPLIER HERO HEADER */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-800 dark:text-blue-300 text-xs font-bold">
                      <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Toptancı Tedarik Merkezi</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                      Bugün size uygun hangi işler var?
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Kategorinize ve dağıtım bölgenize gelen açık talepleri inceleyin, tek tıkla teklif verin.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSupplierTab("feed")}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        supplierTab === "feed"
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
                      }`}
                    >
                      Açık Talepler ({openRequests.length})
                    </button>
                    <button
                      onClick={() => setSupplierTab("my_offers")}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        supplierTab === "my_offers"
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
                      }`}
                    >
                      Verdiğim Teklifler ({myOffers.length})
                    </button>
                  </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                {supplierTab === "feed" && (
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ürün adı veya anahtar kelime ile ara..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Tümü">Tüm Kategoriler</option>
                      {TEKLIFIM_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Tümü">Tüm Şehirler</option>
                      {TURKEY_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* SUPPLIER TAB: FEED */}
              {supplierTab === "feed" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Sana Uygun Talepler ({filteredFeed.length})
                    </h3>
                  </div>

                  {filteredFeed.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Seçilen Kriterlerde Açık Talep Bulunmuyor
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Kategori veya şehir filtresini genişleterek diğer açık talepleri inceleyebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredFeed.map((req) => (
                        <div
                          key={req.id}
                          className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                                {req.category}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(req.createdAt).toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                              {req.title}
                            </h4>

                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 space-y-1">
                              <div className="flex items-baseline justify-between">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                  İstenen Miktar:
                                </span>
                                <strong className="font-mono text-sm text-slate-900 dark:text-white">
                                  {req.quantity} {req.unit}
                                </strong>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                                <span>Teslimat:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {req.city} • {req.deliveryDays} Gün İçinde
                                </span>
                              </div>
                            </div>

                            {req.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {req.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Link
                              href={`/teklifim-gelsin/requests/${req.id}`}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-colors"
                            >
                              Detay Gör
                            </Link>

                            <button
                              onClick={() => setSelectedReqForQuote(req)}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center shadow-sm transition-colors cursor-pointer"
                            >
                              Teklif Ver
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUPPLIER TAB: MY OFFERS */}
              {supplierTab === "my_offers" && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Verdiğiniz Teklifler ({myOffers.length})
                  </h3>

                  {myOffers.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Henüz Bir Teklif Vermediniz
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Açık talepler sekmesinden firmanıza uygun işleri inceleyip teklif sunabilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myOffers.map((off) => (
                        <div
                          key={off.id}
                          className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              Teklif Tarihi:{" "}
                              {new Date(off.createdAt).toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>

                            {off.status === "selected" ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                Tebrikler, Teklifiniz Seçildi ✓
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                                Değerlendiriliyor
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {off.requestTitle}
                          </h4>

                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                                Verdiğiniz Fiyat:
                              </span>
                              <strong className="text-xl font-black text-slate-900 dark:text-white">
                                {off.totalPrice.toLocaleString("tr-TR")} ₺
                              </strong>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              <span>Birim: {off.unitPrice} ₺</span>
                              <span className="block">{off.deliveryDays} Günde Teslim</span>
                            </div>
                          </div>

                          <Link
                            href={`/teklifim-gelsin/requests/${off.requestId}`}
                            className="block text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                          >
                            Talep Sayfasına Git
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* QUICK QUOTE MODAL */}
        {selectedReqForQuote && (
          <SupplierQuoteModal
            request={selectedReqForQuote}
            existingOffer={myOffers.find((o) => o.requestId === selectedReqForQuote.id)}
            onClose={() => setSelectedReqForQuote(null)}
            onSubmit={handleQuoteSubmit}
            submitting={submittingQuote}
          />
        )}
      </div>
    </TeklifimThemeProvider>
  );
}
