"use client";

import React, { useState, useEffect, use } from "react";
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
  MessageSquare,
  ShieldCheck,
  Award,
  Zap,
  Send,
  X,
  ExternalLink,
  Check,
  HelpCircle,
  AlertCircle,
  Share2,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  TeklifimRequest,
  TeklifimOffer,
  TeklifimProfile,
} from "@/types/teklifimGelsin";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import OfferComparisonGrid from "@/components/teklifimGelsin/OfferComparisonGrid";
import SupplierQuoteModal from "@/components/teklifimGelsin/SupplierQuoteModal";
import RecommendedSuppliersList from "@/components/teklifimGelsin/RecommendedSuppliersList";

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

  // Supplier Quote Modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Business Action Modals
  const [contactModalOffer, setContactModalOffer] = useState<TeklifimOffer | null>(null);
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/teklifim-gelsin/auth");
      } else {
        setUser(currentUser);
        const cached = localStorage.getItem(`teklifim_profile_${currentUser.uid}`);
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch {}
        }
        await loadData(currentUser);
      }
    });
    return () => unsub();
  }, [router, requestId]);

  const loadData = async (currentUser: any) => {
    try {
      setLoading(true);
      setError("");
      const token = await currentUser.getIdToken();

      // 1. Fetch Request
      const rRes = await fetch(`/api/teklifim-gelsin/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!rRes.ok) {
        throw new Error("Talep bulunamadı veya erişim yetkiniz yok.");
      }
      const rData = await rRes.json();
      const currentRequest: TeklifimRequest = rData.request;
      setRequest(currentRequest);

      const isOwner = currentRequest.businessId === currentUser.uid;
      setIsBusinessOwner(isOwner);

      // 2. Fetch Offers
      const oRes = await fetch(`/api/teklifim-gelsin/requests/${requestId}/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (oRes.ok) {
        const oData = await oRes.json();
        setOffers(oData.offers || []);
      }
    } catch (err: any) {
      setError(err.message || "Bilgiler alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOffer = async (offerId: string) => {
    if (!user || !request) return;
    setSelectingOfferId(offerId);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/offers/${offerId}/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: request.id }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Teklif seçilemedi.");
      }

      await loadData(user);
    } catch (err: any) {
      alert(err.message || "İşlem başarısız.");
    } finally {
      setSelectingOfferId(null);
    }
  };

  const handleSupplierQuoteSubmit = async (quoteData: any) => {
    if (!user || !request) return;
    setSubmittingQuote(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/requests/${requestId}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quoteData),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Teklif iletilemedi.");
      }

      setShowQuoteModal(false);
      await loadData(user);
    } catch (err: any) {
      alert(err.message || "Hata oluştu.");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleShareLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      alert(window.location.href);
    }
  };

  // Timeline Steps Computation
  const timelineSteps = [
    { label: "Talep Yayınlandı", done: true },
    {
      label: "Toptancılara İletildi",
      done: true,
    },
    {
      label: "Teklifler Toplanıyor",
      done: (request?.offerCount || 0) > 0 || request?.status !== "published",
    },
    {
      label: "Karşılaştırılıyor",
      done: (request?.offerCount || 0) > 0,
    },
    {
      label: "Tedarikçi Seçildi",
      done: request?.status === "supplier_selected" || request?.status === "completed",
    },
  ];

  const getDeadlineInfo = () => {
    if (!request) return null;
    const deadlineMs =
      request.deadlineTimestamp ||
      (request.deadline ? new Date(request.deadline).getTime() : null);
    if (!deadlineMs) return null;

    const diff = deadlineMs - Date.now();
    if (diff <= 0 || request.status === "expired") {
      return { isExpired: true, label: "Süresi Doldu (Teklife Kapalı)" };
    }
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    if (days > 0) {
      return { isExpired: false, label: `Kalan Süre: ${days} Gün ${hours} Saat` };
    }
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { isExpired: false, label: `Kalan Süre: ${totalHours} Saat ${mins} Dk` };
  };

  const deadlineInfo = getDeadlineInfo();
  const isExpired = !!deadlineInfo?.isExpired || request?.status === "expired";

  const mySubmittedOffer = !isBusinessOwner
    ? offers.find((o) => o.supplierId === user?.uid)
    : null;

  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <TeklifimHeader />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* BACK & ACTIONS */}
          <div className="flex items-center justify-between">
            <Link
              href="/teklifim-gelsin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Panele Dön</span>
            </Link>

            <button
              onClick={handleShareLink}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Kopyalandı" : "Bağlantıyı Kopyala"}</span>
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Talep ve Teklifler Yükleniyor...
              </p>
            </div>
          ) : error || !request ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {error || "Talep Bulunamadı"}
              </h3>
              <Link
                href="/teklifim-gelsin/dashboard"
                className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                Kontrol Paneline Dön
              </Link>
            </div>
          ) : (
            <>
              {/* ================= HEADER & TIMELINE ================= */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
                {/* STATUS & META */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      {request.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      Yayın Tarihi:{" "}
                      {new Date(request.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {deadlineInfo && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          deadlineInfo.isExpired
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{deadlineInfo.label}</span>
                      </span>
                    )}

                    {request.status === "supplier_selected" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tedarikçi Seçildi & Anlaşma Sağlandı</span>
                      </span>
                    ) : isExpired ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Teklif Toplama Sona Erdi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Teklifler Toplanıyor ({request.offerCount} Teklif)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* TITLE & DETAILS */}
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                    {request.title}
                  </h1>

                  {/* SPECS BAR */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Talep Miktarı
                      </span>
                      <strong className="font-mono text-base text-slate-900 dark:text-white">
                        {request.quantity} {request.unit}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Teslimat Lokasyonu
                      </span>
                      <strong className="text-sm text-slate-900 dark:text-white truncate block">
                        {request.city} {request.district ? `(${request.district})` : ""}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        İstenen Teslimat
                      </span>
                      <strong className="text-sm text-slate-900 dark:text-white">
                        {request.deliveryDays} Gün İçinde
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Talep Eden İşletme
                      </span>
                      <strong className="text-sm text-slate-900 dark:text-white truncate block">
                        {request.businessName}
                      </strong>
                    </div>
                  </div>

                  {request.description && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="block text-slate-900 dark:text-white text-xs font-bold mb-1">
                        Özel Şartlar ve Açıklama:
                      </strong>
                      {request.description}
                    </div>
                  )}

                  {request.sampleRequired && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Bu talep için toplu sipariş öncesi fiziksel numune talep edilmektedir.</span>
                    </div>
                  )}
                </div>

                {/* VISUAL TIMELINE COMPONENT */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Süreç Zaman Akışı
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {timelineSteps.map((st, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          st.done
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-900 dark:text-emerald-200 font-bold"
                            : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60 font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {st.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 inline-block" />
                          )}
                        </div>
                        <span className="text-[11px] block leading-tight">{st.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SUPPLIER ACTION BANNER (If supplier viewing) */}
                {!isBusinessOwner && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {isExpired
                          ? "Teklif Toplama Süresi Doldu"
                          : mySubmittedOffer
                          ? "Bu Talebe Daha Önce Teklif Verdiniz"
                          : "Bu Talebe Henüz Teklif Vermediniz"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {isExpired
                          ? "Bu talep için son teklif verme süresi dolduğundan yeni teklif girişi kapatılmıştır."
                          : mySubmittedOffer
                          ? `Verdiğiniz Tutar: ${mySubmittedOffer.totalPrice.toLocaleString("tr-TR")} ₺ (${mySubmittedOffer.deliveryDays} Gün)`
                          : "Hemen fiyat ve teslimat sürenizi sunarak teklifinizi işletmeye iletin."}
                      </p>
                    </div>

                    {!isExpired && (
                      <button
                        onClick={() => setShowQuoteModal(true)}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer whitespace-nowrap"
                      >
                        {mySubmittedOffer ? "Teklifimi Güncelle" : "Hemen Teklif Ver"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* RECOMMENDED MATCHING SUPPLIERS (For Business Owner) */}
              {isBusinessOwner && request.status !== "supplier_selected" && (
                <RecommendedSuppliersList
                  requestId={request.id}
                  requestTitle={request.title}
                  invitedSupplierIds={request.invitedSupplierIds || []}
                  onSupplierInvited={(supId) => {
                    setRequest((prev) =>
                      prev
                        ? {
                            ...prev,
                            invitedSupplierIds: [
                              ...(prev.invitedSupplierIds || []),
                              supId,
                            ],
                          }
                        : prev
                    );
                  }}
                />
              )}

              {/* ================= OFFERS SECTION ================= */}
              <div className="space-y-4">
                <OfferComparisonGrid
                  offers={offers}
                  selectedOfferId={request.selectedOfferId}
                  isBusinessOwner={isBusinessOwner}
                  onSelectOffer={handleSelectOffer}
                  onOpenContact={(offer) => setContactModalOffer(offer)}
                  selectingId={selectingOfferId}
                />
              </div>
            </>
          )}
        </main>

        {/* SUPPLIER QUOTE MODAL */}
        {showQuoteModal && request && (
          <SupplierQuoteModal
            request={request}
            existingOffer={mySubmittedOffer}
            onClose={() => setShowQuoteModal(false)}
            onSubmit={handleSupplierQuoteSubmit}
            submitting={submittingQuote}
          />
        )}

        {/* BUSINESS CONTACT MODAL */}
        {contactModalOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans animate-fade-in-up">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Doğrudan İletişim
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {contactModalOffer.supplierName}
                  </h3>
                </div>
                <button
                  onClick={() => setContactModalOffer(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${contactModalOffer.supplierPhone}`}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kurumsal Telefon</span>
                      <strong className="text-sm font-mono text-slate-900 dark:text-white">
                        {contactModalOffer.supplierPhone || "Belirtilmedi"}
                      </strong>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Ara →
                  </span>
                </a>

                <a
                  href={`https://wa.me/${(contactModalOffer.supplierPhone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Merhaba ${contactModalOffer.supplierName}, Teklifim Gelsin üzerinden "${request?.title}" talebimize verdiğiniz teklif ile ilgili iletişime geçiyorum.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between hover:bg-emerald-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                        Doğrudan WhatsApp
                      </span>
                      <strong className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        Sohbet Başlat
                      </strong>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Yaz →
                  </span>
                </a>
              </div>

              <div className="pt-2 text-center text-[11px] text-slate-400">
                Teklifim Gelsin komisyonsuzdur. Sipariş şartlarını doğrudan görüşebilirsiniz.
              </div>
            </div>
          </div>
        )}
      </div>
    </TeklifimThemeProvider>
  );
}
