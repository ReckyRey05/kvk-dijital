"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PackageCheck,
  Building2,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  Award,
  Sparkles,
  Zap,
  Send,
  X,
  ExternalLink,
  Check,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  TeklifimRequest,
  TeklifimOffer,
  TeklifimProfile,
} from "@/types/teklifimGelsin";

export default function TeklifimRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.requestId;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeklifimProfile | null>(null);
  const [request, setRequest] = useState<TeklifimRequest | null>(null);
  const [offers, setOffers] = useState<TeklifimOffer[]>([]);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Supplier Offer Form State
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("5");
  const [minOrder, setMinOrder] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);

  // Business Modals
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<TeklifimOffer | null>(null);
  const [contactModalOffer, setContactModalOffer] = useState<TeklifimOffer | null>(null);
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/teklifim-gelsin/auth");
      } else {
        setUser(currentUser);
        const cached = localStorage.getItem(`teklifim_profile_${currentUser.uid}`);
        if (cached) setProfile(JSON.parse(cached));
        await loadData(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router, requestId]);

  const loadData = async (currentUser: any) => {
    try {
      setLoading(true);
      setError("");
      const token = await currentUser.getIdToken();

      // 1. Fetch Request Details
      let currentRequest: TeklifimRequest | null = null;
      try {
        const rRes = await fetch(`/api/teklifim-gelsin/requests/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (rRes.ok) {
          const rData = await rRes.json();
          currentRequest = rData.request;
        }
      } catch {}

      // Fallback: Client Firestore
      if (!currentRequest) {
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { doc, getDoc } = await import("firebase/firestore");
          const snap = await getDoc(doc(db, "teklifim_requests", requestId));
          if (snap.exists()) {
            currentRequest = { id: snap.id, ...(snap.data() as any) };
          }
        } catch {}
      }

      if (!currentRequest) {
        throw new Error("Talep bulunamadı.");
      }

      setRequest(currentRequest);
      const isOwner = currentRequest.businessId === currentUser.uid;
      setIsBusinessOwner(isOwner);

      // 2. Fetch Offers
      let currentOffers: TeklifimOffer[] = [];
      try {
        const oRes = await fetch(`/api/teklifim-gelsin/requests/${requestId}/offers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (oRes.ok) {
          const oData = await oRes.json();
          currentOffers = oData.offers || [];
        }
      } catch {}

      // Fallback: Client Firestore
      if (currentOffers.length === 0) {
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { collection, query, where, getDocs } = await import("firebase/firestore");

          if (isOwner) {
            const snap = await getDocs(
              query(collection(db, "teklifim_offers"), where("requestId", "==", requestId))
            );
            snap.forEach((d) => currentOffers.push(d.data() as TeklifimOffer));
            // Client-side badge calculation
            if (currentOffers.length > 0) {
              const minP = Math.min(...currentOffers.map((o) => o.totalPrice || Infinity));
              const minD = Math.min(...currentOffers.map((o) => o.deliveryDays || Infinity));
              currentOffers = currentOffers.map((o) => ({
                ...o,
                isCheapest: o.totalPrice === minP,
                isFastest: o.deliveryDays === minD,
              }));
            }
          } else {
            // Supplier only sees own offer
            const snap = await getDocs(
              query(
                collection(db, "teklifim_offers"),
                where("requestId", "==", requestId),
                where("supplierId", "==", currentUser.uid)
              )
            );
            snap.forEach((d) => currentOffers.push(d.data() as TeklifimOffer));
          }
        } catch {}
      }

      setOffers(currentOffers);

      // If supplier already submitted an offer, populate form
      if (!isOwner && currentOffers.length > 0) {
        const myOff = currentOffers[0];
        setUnitPrice(String(myOff.unitPrice || ""));
        setTotalPrice(String(myOff.totalPrice || ""));
        setDeliveryDays(String(myOff.deliveryDays || "5"));
        setMinOrder(myOff.minOrderQuantity || "");
        setOfferDesc(myOff.description || "");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Veriler alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Supplier Submit Offer
  const handleSupplierOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !request) return;
    setError("");
    setSubmittingOffer(true);

    const unitPriceNum = Number(unitPrice) || 0;
    const totalPriceNum = Number(totalPrice) || unitPriceNum * request.quantity;

    try {
      const token = await user.getIdToken();
      const payload = {
        requestId,
        unitPrice: unitPriceNum,
        totalPrice: totalPriceNum,
        deliveryDays: Number(deliveryDays) || 5,
        minOrderQuantity: minOrder,
        description: offerDesc,
        supplierName: profile?.companyName || "Tedarikçi Firma",
        supplierCity: profile?.city || "İstanbul",
        supplierPhone: profile?.phone || "",
        supplierEmail: user.email || "",
      };

      const res = await fetch(`/api/teklifim-gelsin/requests/${requestId}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Teklif iletilemedi.");
      }

      setOfferSuccess(true);
      await loadData(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Teklif iletilirken bir hata oluştu.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Business Select Winning Offer
  const handleSelectOffer = async (offer: TeklifimOffer) => {
    if (!user || !request) return;
    setSelectingOfferId(offer.id);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/offers/${offer.id}/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (!res.ok) {
        throw new Error("Seçim kaydedilemedi.");
      }

      // Update state
      setRequest({
        ...request,
        selectedOfferId: offer.id,
        selectedSupplierId: offer.supplierId,
        status: "supplier_selected",
      });

      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, status: "selected" } : o))
      );

      // Automatically open contact modal for the selected supplier
      setContactModalOffer(offer);
    } catch (err: any) {
      console.error(err);
      setError("Tedarikçi seçilirken bir hata oluştu.");
    } finally {
      setSelectingOfferId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-white p-6 space-y-4">
        <h2 className="text-xl font-bold">Talep Bulunamadı</h2>
        <Link
          href="/teklifim-gelsin/dashboard"
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          Panele Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased pb-24">
      {/* Top Header */}
      <header className="border-b border-white/10 px-6 py-4 bg-[#070B14]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/teklifim-gelsin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Panele Dön</span>
          </Link>

          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            {isBusinessOwner ? "Gelen Teklifler & Karşılaştırma" : "Tedarik Teklifi Ver"}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Request Summary Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1626] border border-white/10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  {request.category}
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                    request.status === "supplier_selected"
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                      : request.offerCount > 0
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {request.status === "supplier_selected"
                    ? "Tedarikçi Seçildi"
                    : request.offerCount > 0
                    ? `${request.offerCount} Teklif Geldi`
                    : "Teklif Bekleniyor"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white">{request.title}</h1>
              <p className="text-xs text-slate-400">
                Talep Eden: <strong className="text-slate-200">{request.businessName}</strong> ({request.city})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 block font-medium">İstenen Miktar</span>
                <strong className="text-base font-black text-white">{request.quantity} {request.unit}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 block font-medium">Teslim Süresi</span>
                <strong className="text-base font-black text-white">{request.deliveryDays} Gün</strong>
              </div>
            </div>
          </div>

          {request.description && (
            <div className="pt-3 border-t border-white/10 text-xs text-slate-300 leading-relaxed bg-white/[0.01] p-4 rounded-2xl">
              <strong className="text-white block mb-1">Açıklama & Detaylar:</strong>
              {request.description}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: BUSINESS OWNER — OFFERS COMPARISON VIEW                           */}
        {/* ========================================================================= */}
        {isBusinessOwner ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Toptancı Teklifleri Karşılaştırma</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fiyat, teslimat süresi ve güven puanlarını inceleyerek en uygun tedarikçiyi belirleyin.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {offers.length} Teklif
              </span>
            </div>

            {offers.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                <Clock className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                <h3 className="text-base font-bold text-white">Henüz teklif gelmedi</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Talebiniz toptancı ağına iletildi. İlgili tedarikçiler fiyat teklifi verdikçe burada anında listelenecektir.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {offers.map((offer) => {
                  const isSelected = offer.status === "selected" || request.selectedOfferId === offer.id;

                  return (
                    <div
                      key={offer.id}
                      className={`p-6 rounded-3xl border transition-all space-y-4 ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-950/40 to-[#0E1626] border-emerald-500 shadow-xl shadow-emerald-500/10"
                          : "bg-[#0E1626] border-white/10 hover:border-white/20"
                      }`}
                    >
                      {/* Card Top: Supplier Name + Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold">
                            <Truck className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/teklifim-gelsin/suppliers/${offer.supplierId}`}
                                className="text-base font-bold text-white hover:text-emerald-400 transition-colors"
                              >
                                {offer.supplierName}
                              </Link>
                              <span className="text-[10px] text-slate-400 font-mono">({offer.supplierCity})</span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Teklif Tarihi: {new Date(offer.createdAt).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                        </div>

                        {/* Comparison Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isSelected && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Seçilen Tedarikçi</span>
                            </span>
                          )}

                          {offer.isCheapest && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>En Ucuz</span>
                            </span>
                          )}

                          {offer.isFastest && (
                            <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>En Hızlı</span>
                            </span>
                          )}

                          {offer.isBestValue && !offer.isCheapest && !offer.isFastest && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>En Uygun</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Middle: Price, Delivery, Min Order */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Birim Fiyat</span>
                          <strong className="text-sm font-bold text-white">
                            {offer.unitPrice ? `${offer.unitPrice.toLocaleString("tr-TR")} TL` : "—"}
                          </strong>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Toplam Tutar</span>
                          <strong className="text-base font-black text-emerald-400">
                            {offer.totalPrice?.toLocaleString("tr-TR")} TL
                          </strong>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Teslim Süresi</span>
                          <strong className="text-sm font-bold text-white">{offer.deliveryDays} Gün</strong>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Min Sipariş</span>
                          <strong className="text-sm font-bold text-slate-300">
                            {offer.minOrderQuantity || `${request.quantity} ${request.unit}`}
                          </strong>
                        </div>
                      </div>

                      {offer.description && (
                        <p className="text-xs text-slate-300 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                          <strong className="text-slate-400">Tedarikçi Notu:</strong> {offer.description}
                        </p>
                      )}

                      {/* Card Bottom: Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <Link
                          href={`/teklifim-gelsin/suppliers/${offer.supplierId}`}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                        >
                          <span>Firma Profilini İncele</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setContactModalOffer(offer)}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tedarikçiyle İletişime Geç</span>
                          </button>

                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() => handleSelectOffer(offer)}
                              disabled={selectingOfferId === offer.id}
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {selectingOfferId === offer.id ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Tedarikçiyi Seç</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: SUPPLIER QUOTATION VIEW                                          */
          /* ========================================================================= */
          <div className="max-w-2xl mx-auto bg-[#0E1626] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
                Fiyat Teklifi Sunumu
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Bu Talebe Teklif Verin</h2>
              <p className="text-xs text-slate-400 mt-1">
                İşletme şartlarınızı inceleyecek. Ticari gizliliğiniz korunur, teklifiniz diğer toptancılar tarafından görülemez.
              </p>
            </div>

            {offerSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Teklifiniz başarıyla kaydedildi ve işletmeye iletildi. İstediğiniz zaman güncelleyebilirsiniz.</span>
              </div>
            )}

            <form onSubmit={handleSupplierOfferSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Birim Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUnitPrice(val);
                      if (val && request) {
                        setTotalPrice((Number(val) * request.quantity).toFixed(2));
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Toplam Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Teslim Süresi (Gün) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Minimum Sipariş Şartı
                  </label>
                  <input
                    type="text"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="Örn: 500 Adet veya 1 Koli"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Açıklama & Teslimat Koşulları
                </label>
                <textarea
                  rows={4}
                  value={offerDesc}
                  onChange={(e) => setOfferDesc(e.target.value)}
                  placeholder="Kargo/nakliye durumu, kalite sertifikaları, faturalandırma şartları..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingOffer ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{offers.length > 0 ? "Teklifi Güncelle" : "Teklifi Gönder"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Supplier Contact Modal (Business Action) */}
      {contactModalOffer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0E1626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Tedarikçi İletişim</span>
                <h3 className="text-base font-bold text-white">{contactModalOffer.supplierName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOffer(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Telefon: <strong className="text-white">{contactModalOffer.supplierPhone || "Belirtilmedi"}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>E-posta: <strong className="text-white">{contactModalOffer.supplierEmail || "Belirtilmedi"}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Şehir: <strong className="text-white">{contactModalOffer.supplierCity}</strong></span>
                </div>
              </div>

              {contactModalOffer.supplierPhone && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={`tel:${contactModalOffer.supplierPhone}`}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Hemen Ara</span>
                  </a>

                  <a
                    href={`https://wa.me/90${contactModalOffer.supplierPhone.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(
                      `Merhaba ${contactModalOffer.supplierName}, Teklifim Gelsin üzerinden "${request.title}" talebimize verdiğiniz teklif ile ilgili iletişime geçmek istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setContactModalOffer(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
