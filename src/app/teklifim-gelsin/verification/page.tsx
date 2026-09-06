"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  FileCheck,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimVerificationRequest, TeklifimProfile } from "@/types/teklifimGelsin";

export default function VerificationPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeklifimProfile | null>(null);
  const [verification, setVerification] = useState<TeklifimVerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [legalTitle, setLegalTitle] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [tradeRegistryNumber, setTradeRegistryNumber] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Show re-apply form even if rejected
  const [showReapplyForm, setShowReapplyForm] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();

        // 1. Fetch Profile
        const pRes = await fetch("/api/teklifim-gelsin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.profile) {
            setProfile(pData.profile);
            setLegalTitle(pData.profile.legalTitle || pData.profile.companyName || "");
            setTaxNumber(pData.profile.taxNumber || "");
            setTaxOffice(pData.profile.taxOffice || "");
            setTradeRegistryNumber(pData.profile.tradeRegistryNumber || "");
          }
        }

        // 2. Fetch Verification Status
        const vRes = await fetch("/api/teklifim-gelsin/verifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          setVerification(vData.verification || null);
        }
      } catch (err) {
        console.error("Failed to load verification status:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Lütfen bilgilerin doğruluğunu taahhüt eden onay kutusunu işaretleyin.");
      return;
    }

    if (!legalTitle.trim() || !taxNumber.trim() || !taxOffice.trim()) {
      setError("Lütfen resmi şirket unvanı, vergi numarası ve vergi dairesi alanlarını eksiksiz doldurun.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const token = await currentUser?.getIdToken();
      if (!token) throw new Error("Oturum süreniz doldu, lütfen tekrar giriş yapın.");

      const res = await fetch("/api/teklifim-gelsin/verifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          legalTitle: legalTitle.trim(),
          taxNumber: taxNumber.trim(),
          taxOffice: taxOffice.trim(),
          tradeRegistryNumber: tradeRegistryNumber.trim() || undefined,
          documentUrl: documentUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Başvuru gönderilirken bir hata oluştu.");
      }

      setVerification(data.verification);
      setShowReapplyForm(false);
      setSuccessMsg("Doğrulama başvurunuz başarıyla alındı. Yönetici ekibimiz tarafından incelendikten sonra sonuç profilinize yansıtılacaktır.");
    } catch (err: any) {
      setError(err.message || "Başvuru gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = verification?.status === "approved" || profile?.verificationStatus === "verified";
  const isPending = verification?.status === "pending" || profile?.verificationStatus === "pending";
  const isRejected = verification?.status === "rejected" || profile?.verificationStatus === "rejected";

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      <TeklifimHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* TOP BAR */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Firma Güven & Doğrulama Merkezi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Tedarikçi Firma Doğrulama
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Pazaryerinde güvenilir ticaret için toptancı ve tedarikçiler vergi ve sicil bilgileriyle doğrulanır.
            Doğrulanmış firmalar, alıcı işletmelerin tercihlerinde öncelik kazanır ve güven rozeti taşır.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-white/[0.02] border border-neutral-200/80 dark:border-white/10 rounded-3xl">
            <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400 mt-3">Doğrulama durumunuz sorgulanıyor...</p>
          </div>
        ) : !currentUser ? (
          <div className="p-8 text-center bg-white dark:bg-white/[0.02] border border-neutral-200/80 dark:border-white/10 rounded-3xl space-y-3">
            <Shield className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Giriş Yapmanız Gerekiyor</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Firma doğrulama başvurusu yapabilmek için tedarikçi hesabınızla oturum açmalısınız.
            </p>
            <button
              onClick={() => router.push("/teklifim-gelsin/auth")}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Giriş Yap
            </button>
          </div>
        ) : (
          <>
            {/* STATUS CARDS */}
            {isVerified && (
              <div className="p-6 sm:p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-emerald-900 dark:text-emerald-300">
                        Tebrikler! Firmanız Doğrulandı
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                        ✓ Doğrulanmış Firma
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-200/70 leading-relaxed">
                      Resmi vergi ve şirket bilgileriniz KvK Dijital yönetim ekibi tarafından incelenmiş ve onaylanmıştır.
                      Profilinizde, arama sonuçlarında ve tekliflerinizde güven rozeti görüntülenmektedir.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-500/20 text-xs">
                  <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl">
                    <span className="text-[10px] text-emerald-800/60 dark:text-emerald-300/60 block font-bold">Kayıtlı Unvan</span>
                    <span className="font-semibold">{verification?.legalTitle || profile?.companyName}</span>
                  </div>
                  <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl">
                    <span className="text-[10px] text-emerald-800/60 dark:text-emerald-300/60 block font-bold">Vergi Numarası / Dairesi</span>
                    <span className="font-semibold">{verification?.taxNumber || profile?.taxNumber} ({verification?.taxOffice || profile?.taxOffice})</span>
                  </div>
                  <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl">
                    <span className="text-[10px] text-emerald-800/60 dark:text-emerald-300/60 block font-bold">Doğrulama Durumu</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Aktif & Geçerli</span>
                  </div>
                </div>
              </div>
            )}

            {isPending && (
              <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-amber-900 dark:text-amber-300">
                      Başvurunuz İnceleme Aşamasında
                    </h2>
                    <p className="text-xs text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                      Resmi şirket bilgileriniz alındı. KvK Dijital yönetici ekibi vergi levhası ve ticaret sicil kayıtlarınızı inceliyor.
                      Genellikle 24 saat içinde sonuçlandırılır.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
                  <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl">
                    <span className="text-[10px] text-amber-800/60 dark:text-amber-300/60 block font-bold">Başvuru Yapılan Unvan</span>
                    <span className="font-semibold">{verification?.legalTitle}</span>
                  </div>
                  <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl">
                    <span className="text-[10px] text-amber-800/60 dark:text-amber-300/60 block font-bold">Vergi No / Daire</span>
                    <span className="font-semibold">{verification?.taxNumber} ({verification?.taxOffice})</span>
                  </div>
                </div>
              </div>
            )}

            {isRejected && !showReapplyForm && (
              <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-rose-900 dark:text-rose-300">
                      Doğrulama Başvurunuz Onaylanmadı
                    </h2>
                    <p className="text-xs text-rose-800/80 dark:text-rose-200/70 leading-relaxed">
                      İlettiğiniz bilgiler incelenmiş ancak doğrulama kriterlerini karşılamadığı belirlenmiştir.
                    </p>
                  </div>
                </div>

                {verification?.rejectionReason && (
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200">
                    <strong className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-0.5">
                      Yönetici Açıklaması:
                    </strong>
                    <span>{verification.rejectionReason}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setShowReapplyForm(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Bilgileri Düzelterek Yeniden Başvur</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* APPLICATION FORM (Show if unverified, or re-applying after rejection) */}
            {(!verification || showReapplyForm) && (
              <div className="bg-white dark:bg-white/[0.02] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="border-b border-neutral-100 dark:border-white/5 pb-4">
                  <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    <span>Doğrulama Başvuru Formu</span>
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Lütfen vergi levhanızdaki ve resmi kayıtlarınızdaki bilgileri eksiksiz girin.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Resmi Şirket Unvanı *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={legalTitle}
                      onChange={(e) => setLegalTitle(e.target.value)}
                      placeholder="Örn: ABC Gıda Dağıtım ve Ticaret Ltd. Şti."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <span className="text-[10px] text-neutral-400">Vergi levhasında kayıtlı tam unvanınız.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Vergi Numarası (VKN / TCKN) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="10 veya 11 haneli numara"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Bağlı Bulunulan Vergi Dairesi *
                      </label>
                      <input
                        type="text"
                        required
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        placeholder="Örn: Kadıköy Vergi Dairesi"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Ticaret Sicil No (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={tradeRegistryNumber}
                        onChange={(e) => setTradeRegistryNumber(e.target.value)}
                        placeholder="Örn: 123456-5 (İTO)"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Vergi Levhası / Belge Linki (Opsiyonel)
                      </label>
                      <input
                        type="url"
                        value={documentUrl}
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        placeholder="https://drive.google.com/... veya PDF linki"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Yönetici Notu veya Açıklama (Opsiyonel)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Eklemek istediğiniz bilgiler veya özel durumlar..."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-neutral-300 dark:border-neutral-700 cursor-pointer"
                      />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Yukarıda belirttiğim unvan, vergi ve ticari sicil bilgilerinin gerçeğe uygun olduğunu, aksi halde üyeliğimin askıya alınabileceğini kabul ve taahhüt ederim.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    {showReapplyForm && (
                      <button
                        type="button"
                        onClick={() => setShowReapplyForm(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                      >
                        Vazgeç
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="ml-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Gönderiliyor...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Doğrulama Başvurusunu Gönder</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TRUST CRITERIA INFO */}
            <div className="p-6 rounded-3xl bg-neutral-100/60 dark:bg-white/[0.01] border border-neutral-200/60 dark:border-white/5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Doğrulama Süreci ve Kriterleri</span>
              </h3>
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Vergi numarası ve resmi şirket unvanı Gelir İdaresi Başkanlığı sistemleriyle çapraz kontrol edilir.</li>
                <li>Onaylanan firmalara profilinde ve teklif listelerinde yeşil <strong>✓ Doğrulanmış Firma</strong> rozeti atanır.</li>
                <li>İşletmeler, doğrulanmış tedarikçilere doğrudan teklif daveti gönderirken daha yüksek güven duyar.</li>
                <li>Doğrulama işlemi tamamen ücretsizdir; platform güvenliğini artırma amaçlıdır.</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
