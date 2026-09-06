"use client";

import { useState, useEffect } from "react";
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
  LogOut,
  Bell,
  Check,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  Send,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  TeklifimProfile,
  TeklifimRequest,
  TeklifimOffer,
  TeklifimNotification,
  TeklifimUserRole,
  TEKLIFIM_CATEGORIES,
  TURKEY_CITIES,
} from "@/types/teklifimGelsin";

export default function TeklifimDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeklifimProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Business state
  const [businessRequests, setBusinessRequests] = useState<TeklifimRequest[]>([]);

  // Supplier state
  const [supplierTab, setSupplierTab] = useState<"feed" | "my_offers">("feed");
  const [openRequests, setOpenRequests] = useState<TeklifimRequest[]>([]);
  const [myOffers, setMyOffers] = useState<TeklifimOffer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [selectedCity, setSelectedCity] = useState<string>("Tümü");

  // Notifications
  const [notifications, setNotifications] = useState<TeklifimNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Quick Quotation Modal (for Supplier on Feed)
  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState<TeklifimRequest | null>(null);
  const [quoteUnitPrice, setQuoteUnitPrice] = useState("");
  const [quoteTotalPrice, setQuoteTotalPrice] = useState("");
  const [quoteDeliveryDays, setQuoteDeliveryDays] = useState("5");
  const [quoteMinOrder, setQuoteMinOrder] = useState("");
  const [quoteDesc, setQuoteDesc] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/teklifim-gelsin/auth");
      } else {
        setUser(currentUser);
        await loadDashboard(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadDashboard = async (currentUser: any) => {
    try {
      setLoading(true);
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
        }
      } catch {}

      if (!curProfile) {
        const cached = localStorage.getItem(`teklifim_profile_${currentUser.uid}`);
        if (cached) {
          curProfile = JSON.parse(cached);
        } else {
          // Default profile
          curProfile = {
            uid: currentUser.uid,
            role: "business",
            companyName: currentUser.displayName || "Firma",
            contactName: "Yetkili",
            phone: "",
            email: currentUser.email || "",
            city: "İstanbul",
            categories: ["Ambalaj & Paketleme"],
            isVerified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }
      }

      setProfile(curProfile);

      // 2. Role-specific data loading
      if (curProfile && curProfile.role === "business") {
        await loadBusinessData(currentUser, token);
      } else if (curProfile) {
        await loadSupplierData(currentUser, token);
      }

      // 3. Load Notifications
      try {
        const nRes = await fetch("/api/teklifim-gelsin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (nRes.ok) {
          const nData = await nRes.json();
          setNotifications(nData.notifications || []);
        }
      } catch {}
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessData = async (currentUser: any, token: string) => {
    try {
      const res = await fetch("/api/teklifim-gelsin/requests?role=business", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBusinessRequests(data.requests || []);
        return;
      }
    } catch {}

    // Fallback: Client Firestore
    try {
      const { db } = await import("@/lib/firebase/firestore");
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const q = query(collection(db, "teklifim_requests"), where("businessId", "==", currentUser.uid));
      const snap = await getDocs(q);
      const list: TeklifimRequest[] = [];
      snap.forEach((d) => list.push(d.data() as TeklifimRequest));
      setBusinessRequests(list.sort((a, b) => b.createdAt - a.createdAt));
    } catch {}
  };

  const loadSupplierData = async (currentUser: any, token: string) => {
    try {
      const res = await fetch("/api/teklifim-gelsin/requests?role=supplier", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOpenRequests(data.requests || []);
      }
    } catch {}

    // Fallback: Client Firestore
    try {
      const { db } = await import("@/lib/firebase/firestore");
      const { collection, getDocs, query, where } = await import("firebase/firestore");

      // Open requests
      const reqSnap = await getDocs(collection(db, "teklifim_requests"));
      const rList: TeklifimRequest[] = [];
      reqSnap.forEach((d) => {
        const data = d.data() as TeklifimRequest;
        if (data.status !== "completed" && data.status !== "cancelled") {
          rList.push(data);
        }
      });
      setOpenRequests(rList.sort((a, b) => b.createdAt - a.createdAt));

      // My submitted offers
      const offSnap = await getDocs(
        query(collection(db, "teklifim_offers"), where("supplierId", "==", currentUser.uid))
      );
      const oList: TeklifimOffer[] = [];
      offSnap.forEach((d) => oList.push(d.data() as TeklifimOffer));
      setMyOffers(oList.sort((a, b) => b.createdAt - a.createdAt));
    } catch {}
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/teklifim-gelsin");
  };

  const handleRoleToggle = async () => {
    if (!profile || !user) return;
    const newRole: TeklifimUserRole = profile.role === "business" ? "supplier" : "business";
    const updatedProfile: TeklifimProfile = { ...profile, role: newRole };
    setProfile(updatedProfile);
    localStorage.setItem(`teklifim_profile_${user.uid}`, JSON.stringify(updatedProfile));

    try {
      const token = await user.getIdToken();
      await fetch("/api/teklifim-gelsin/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      if (newRole === "business") {
        await loadBusinessData(user, token);
      } else {
        await loadSupplierData(user, token);
      }
    } catch {}
  };

  // Submit Offer Modal Handler
  const handleQuickSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForQuote || !user || !profile) return;
    setQuoteError("");
    setSubmittingQuote(true);

    const unitPriceNum = Number(quoteUnitPrice) || 0;
    const totalPriceNum = Number(quoteTotalPrice) || unitPriceNum * selectedRequestForQuote.quantity;

    try {
      const token = await user.getIdToken();
      const offerPayload = {
        requestId: selectedRequestForQuote.id,
        unitPrice: unitPriceNum,
        totalPrice: totalPriceNum,
        deliveryDays: Number(quoteDeliveryDays) || 5,
        minOrderQuantity: quoteMinOrder,
        description: quoteDesc,
      };

      const res = await fetch(`/api/teklifim-gelsin/requests/${selectedRequestForQuote.id}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(offerPayload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Teklif iletilemedi.");
      }

      setQuoteSuccess(true);
      setTimeout(() => {
        setQuoteSuccess(false);
        setSelectedRequestForQuote(null);
        setQuoteUnitPrice("");
        setQuoteTotalPrice("");
        setQuoteDesc("");
        loadSupplierData(user, token);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setQuoteError(err.message || "Teklif gönderilemedi.");
    } finally {
      setSubmittingQuote(false);
    }
  };

  // Filtered requests for supplier
  const filteredOpenRequests = openRequests.filter((r) => {
    if (selectedCategory !== "Tümü" && r.category !== selectedCategory) return false;
    if (selectedCity !== "Tümü" && r.city !== selectedCity) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased pb-20">
      {/* Top Header */}
      <header className="border-b border-white/10 sticky top-0 z-30 bg-[#070B14]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/teklifim-gelsin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block leading-tight">
                  Teklifim<span className="text-emerald-400">Gelsin</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{profile?.companyName}</span>
              </div>
            </Link>

            {/* Role Badge & Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-white/10">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  profile?.role === "business"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-teal-500/10 text-teal-400 border-teal-500/30"
                }`}
              >
                {profile?.role === "business" ? (
                  <Building2 className="w-3.5 h-3.5" />
                ) : (
                  <Truck className="w-3.5 h-3.5" />
                )}
                <span>{profile?.role === "business" ? "İşletme (Alıcı)" : "Toptancı (Satıcı)"}</span>
              </span>

              <button
                type="button"
                onClick={handleRoleToggle}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                title="Rolü değiştirerek diğer tarafın deneyimini görün"
              >
                (Rol Değiştir)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile?.role === "business" && (
              <Link
                href="/teklifim-gelsin/requests/new"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Talep Aç</span>
              </Link>
            )}

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors relative cursor-pointer"
                title="Bildirimler"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0E1626] border border-white/10 shadow-2xl p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-white">Bildirimler</span>
                    <span className="text-[10px] text-slate-400">{notifications.length} adet</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-4">Henüz bildiriminiz yok.</p>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="block p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 transition-colors text-xs space-y-1"
                        >
                          <strong className="text-white block font-semibold">{n.title}</strong>
                          <p className="text-[11px] text-slate-400 leading-snug">{n.message}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ========================================================================= */}
        {/* VIEW 1: İŞLETME DASHBOARD                                                */}
        {/* ========================================================================= */}
        {profile?.role === "business" && (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Toplam Taleplerim</span>
                <div className="text-3xl font-black text-white">{businessRequests.length}</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Gelen Teklifler</span>
                <div className="text-3xl font-black text-emerald-400">
                  {businessRequests.reduce((acc, r) => acc + (r.offerCount || 0), 0)}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Seçilen Tedarikçiler</span>
                <div className="text-3xl font-black text-teal-400">
                  {businessRequests.filter((r) => r.status === "supplier_selected" || r.status === "completed").length}
                </div>
              </div>
            </div>

            {/* Requests Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Yayınladığınız Tedarik Talepleri</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Toptancılardan gelen teklifleri inceleyin, fiyat ve teslimat şartlarını karşılaştırın.
                  </p>
                </div>

                <Link
                  href="/teklifim-gelsin/requests/new"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Talep Ekle</span>
                </Link>
              </div>

              {businessRequests.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="max-w-sm mx-auto space-y-1">
                    <h3 className="text-base font-bold text-white">Henüz bir talep oluşturmadınız</h3>
                    <p className="text-xs text-slate-400">
                      İhtiyacınız olan ürün veya hizmeti yayınlayarak toptancılardan doğrudan fiyat teklifleri toplayın.
                    </p>
                  </div>
                  <Link
                    href="/teklifim-gelsin/requests/new"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>İlk Talebinizi Oluşturun</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {businessRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 sm:p-6 rounded-2xl bg-[#0E1626] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base font-bold text-white">{req.title}</h3>

                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                            {req.category}
                          </span>

                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                              req.status === "supplier_selected"
                                ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                                : req.offerCount > 0
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {req.status === "supplier_selected"
                              ? "Tedarikçi Seçildi"
                              : req.offerCount > 0
                              ? `${req.offerCount} Teklif Geldi`
                              : "Teklif Bekleniyor"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span>
                            Miktar: <strong className="text-white">{req.quantity} {req.unit}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Teslim: <strong className="text-white">{req.deliveryDays} Gün İçinde</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{req.city}</span>
                          </span>
                        </div>

                        {req.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">{req.description}</p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                        <Link
                          href={`/teklifim-gelsin/requests/${req.id}`}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <span>Teklifleri Gör ({req.offerCount || 0})</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: TOPTANCI / TEDARİKÇİ DASHBOARD                                     */}
        {/* ========================================================================= */}
        {profile?.role === "supplier" && (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Sana Uygun Açık Talepler</span>
                <div className="text-3xl font-black text-white">{openRequests.length}</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Verdiğin Teklifler</span>
                <div className="text-3xl font-black text-teal-400">{myOffers.length}</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Seçilen / Onaylanan</span>
                <div className="text-3xl font-black text-emerald-400">
                  {myOffers.filter((o) => o.status === "selected").length}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setSupplierTab("feed")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  supplierTab === "feed"
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Sana Uygun Talepler ({openRequests.length})
              </button>

              <button
                type="button"
                onClick={() => setSupplierTab("my_offers")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  supplierTab === "my_offers"
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Verdiğim Teklifler ({myOffers.length})
              </button>
            </div>

            {/* Tab 1: FEED OF OPEN REQUESTS */}
            {supplierTab === "feed" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                    <Filter className="w-3.5 h-3.5 text-teal-400" />
                    <span>Filtrele:</span>
                  </div>

                  <div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#0E1626] border border-white/10 text-white text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="Tümü">Tüm Kategoriler</option>
                      {TEKLIFIM_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#0E1626] border border-white/10 text-white text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="Tümü">Tüm Şehirler</option>
                      {TURKEY_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-slate-500 text-[11px] ml-auto">
                    {filteredOpenRequests.length} talep listeleniyor
                  </span>
                </div>

                {filteredOpenRequests.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                    <p className="text-sm font-bold text-white">Uygun talep bulunamadı</p>
                    <p className="text-xs text-slate-400">
                      Filtreleri temizleyerek tüm kategorilerdeki talepleri inceleyebilirsiniz.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredOpenRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-5 sm:p-6 rounded-2xl bg-[#0E1626] border border-white/10 hover:border-teal-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-base font-bold text-white">{req.title}</h3>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                              {req.category}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                            <span>
                              İstenen Miktar: <strong className="text-white">{req.quantity} {req.unit}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>Teslim: <strong className="text-white">{req.deliveryDays} Gün İçinde</strong></span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{req.city}</span>
                            </span>
                          </div>

                          {req.description && (
                            <p className="text-xs text-slate-400 line-clamp-2">{req.description}</p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                          <button
                            type="button"
                            onClick={() => setSelectedRequestForQuote(req)}
                            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Teklif Ver</span>
                          </button>

                          <Link
                            href={`/teklifim-gelsin/requests/${req.id}`}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                            title="Detaylı İncele"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: MY SUBMITTED OFFERS */}
            {supplierTab === "my_offers" && (
              <div className="space-y-4">
                {myOffers.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                    <p className="text-sm font-bold text-white">Henüz teklif vermediniz</p>
                    <p className="text-xs text-slate-400">
                      Uygun talepler sekmesinden işletmelerin ihtiyaçlarını inceleyip teklif sunabilirsiniz.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {myOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-5 sm:p-6 rounded-2xl bg-[#0E1626] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-bold text-white">{offer.requestTitle}</h3>
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                                offer.status === "selected"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-teal-500/10 text-teal-400 border-teal-500/30"
                              }`}
                            >
                              {offer.status === "selected" ? "Teklifiniz Seçildi!" : "Teklif Gönderildi"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                            <span>
                              Birim Fiyat: <strong className="text-white">{offer.unitPrice?.toLocaleString("tr-TR")} TL</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Toplam Tutar: <strong className="text-emerald-400 font-bold">{offer.totalPrice?.toLocaleString("tr-TR")} TL</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Teslim Süresi: <strong className="text-white">{offer.deliveryDays} Gün</strong>
                            </span>
                          </div>

                          {offer.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">{offer.description}</p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <Link
                            href={`/teklifim-gelsin/requests/${offer.requestId}`}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <span>Talebi Gör</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Quick Quotation Modal for Supplier */}
      {selectedRequestForQuote && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0E1626] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-mono text-teal-400 font-bold uppercase">Teklif Hazırla</span>
                <h3 className="text-base font-bold text-white">{selectedRequestForQuote.title}</h3>
                <span className="text-[11px] text-slate-400">
                  Talep: {selectedRequestForQuote.quantity} {selectedRequestForQuote.unit} • {selectedRequestForQuote.city}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestForQuote(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSuccess ? (
              <div className="py-8 text-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Teklifiniz İletildi!</h4>
                <p className="text-xs text-slate-400">İşletme teklifinizi inceleyip onayladığında bildirim alacaksınız.</p>
              </div>
            ) : (
              <form onSubmit={handleQuickSubmitQuote} className="space-y-4">
                {quoteError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {quoteError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Birim Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={quoteUnitPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuoteUnitPrice(val);
                        if (val && selectedRequestForQuote) {
                          setQuoteTotalPrice((Number(val) * selectedRequestForQuote.quantity).toFixed(2));
                        }
                      }}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Toplam Tutar (TL) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={quoteTotalPrice}
                      onChange={(e) => setQuoteTotalPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Teslim Süresi (Gün) *
                    </label>
                    <input
                      type="number"
                      required
                      value={quoteDeliveryDays}
                      onChange={(e) => setQuoteDeliveryDays(e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Min Sipariş Miktarı
                    </label>
                    <input
                      type="text"
                      value={quoteMinOrder}
                      onChange={(e) => setQuoteMinOrder(e.target.value)}
                      placeholder="Örn: 500 Adet"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Teklif Notu & Teslimat Detayı
                  </label>
                  <textarea
                    rows={3}
                    value={quoteDesc}
                    onChange={(e) => setQuoteDesc(e.target.value)}
                    placeholder="Kalite standartları, kargo/nakliye şartları, ödeme koşulları..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequestForQuote(null)}
                    disabled={submittingQuote}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingQuote ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Teklifi Gönder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
