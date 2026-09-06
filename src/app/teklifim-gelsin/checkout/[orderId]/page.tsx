"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimOrder, TeklifimPayment } from "@/types/teklifimGelsin";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import CheckoutSummaryCard from "@/components/teklifimGelsin/CheckoutSummaryCard";
import PaymentCountdown from "@/components/teklifimGelsin/PaymentCountdown";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Building2,
  Info,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [order, setOrder] = useState<TeklifimOrder | null>(null);
  const [paymentSession, setPaymentSession] = useState<TeklifimPayment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paying, setPaying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<TeklifimPayment | null>(null);

  // Card Form State
  const [cardHolder, setCardHolder] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expireDate, setExpireDate] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);

  // Auth & Data fetch
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login?redirect=" + encodeURIComponent(`/teklifim-gelsin/checkout/${orderId}`));
        return;
      }
      setCurrentUser(user);
      fetchOrder(user);
    });
    return () => unsub();
  }, [orderId]);

  const fetchOrder = async (user: any) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const token = await user.getIdToken();

      const res = await fetch(`/api/teklifim-gelsin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Sipariş bilgileri yüklenemedi.");
      }

      const data = await res.json();
      const ord: TeklifimOrder = data.order;
      setOrder(ord);

      if (ord.paymentStatus === "paid") {
        setSuccessResult({
          status: "paid",
          orderId: ord.id,
          orderNumber: ord.orderNumber,
          amount: Number(ord.totalPrice),
        } as any);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill mock cards for testing
  const fillTestCard = (type: "success" | "3ds" | "fail") => {
    if (type === "success") {
      setCardHolder("ALİ HAYDAR DİJİTAL");
      setCardNumber("4543 6000 0000 0001");
      setExpireDate("12/28");
      setCvc("345");
    } else if (type === "3ds") {
      setCardHolder("MEHMET YILMAZ");
      setCardNumber("4543 6000 0000 0002");
      setExpireDate("10/27");
      setCvc("567");
    } else {
      setCardHolder("TEST HATALI KART");
      setCardNumber("4543 6000 0000 0003");
      setExpireDate("05/26");
      setCvc("999");
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !currentUser) return;

    if (!agreedTerms) {
      setErrorMsg("Lütfen ön bilgilendirme ve mesafeli satış şartlarını onaylayınız.");
      return;
    }

    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (cleanCard.length < 15) {
      setErrorMsg("Lütfen geçerli 16 haneli kart numarası giriniz.");
      return;
    }

    setPaying(true);
    setErrorMsg(null);

    try {
      const token = await currentUser.getIdToken();
      // Generate idempotent key per submit attempt
      const idempotencyKey = `chk_${order.id}_${Date.now()}`;

      // Step 1: Create or get Payment Session
      const sessionRes = await fetch("/api/teklifim-gelsin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(sessionData.error || "Ödeme oturumu oluşturulamadı.");
      }

      const payment: TeklifimPayment = sessionData.payment;
      setPaymentSession(payment);

      // Step 2: Complete / verify payment with card details
      const verifyRes = await fetch(`/api/teklifim-gelsin/payments/${payment.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          providerPaymentId: payment.providerPaymentId,
          cardHolder,
          cardNumber: cleanCard,
          expireDate,
          cvc,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Ödeme onaylanamadı.");
      }

      const updatedPayment: TeklifimPayment = verifyData.payment;
      if (updatedPayment.status === "paid") {
        setSuccessResult(updatedPayment);
      } else {
        throw new Error(updatedPayment.failureReason || "Ödeme işlemi banka tarafından onaylanmadı.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ödeme işlemi sırasında bir hata oluştu.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <TeklifimHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-slate-400">Güvenli ödeme oturumu hazırlanıyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <TeklifimHeader />
        <div className="flex-1 max-w-lg mx-auto p-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Ödeme Başlatılamadı</h2>
          <p className="text-sm text-slate-400 mb-6">{errorMsg}</p>
          <Link
            href="/teklifim-gelsin/orders"
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Siparişlerime Dön
          </Link>
        </div>
      </div>
    );
  }

  // Success Celebration View
  if (successResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <TeklifimHeader />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6 animate-pulse">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" /> 3D Secure Doğrulandı
          </span>
          <h1 className="text-3xl font-extrabold text-white mb-2">Ödeme Başarıyla Tamamlandı</h1>
          <p className="text-slate-300 text-sm max-w-md mb-6">
            Ödemeniz lisanslı ödeme altyapısı üzerinden güvenli havuz hesabına aktarıldı. Tedarikçi bilgilendirildi ve sipariş hazırlık sürecine alındı.
          </p>

          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 text-left space-y-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Sipariş Numarası:</span>
              <span className="font-mono text-white font-semibold">{order?.orderNumber}</span>
            </div>
            {successResult.paymentNumber && (
              <div className="flex justify-between text-xs text-slate-400">
                <span>Ödeme Dekont No:</span>
                <span className="font-mono text-emerald-400 font-semibold">{successResult.paymentNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-400">
              <span>Ödenen Tutar:</span>
              <span className="text-base font-bold text-white font-mono">
                {(successResult.amount || Number(order?.totalPrice)).toLocaleString("tr-TR")} TL
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
              <span>İşlem Durumu:</span>
              <span className="text-emerald-400 font-medium">Havuzda Güvende (Emanet)</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href={`/teklifim-gelsin/orders/${order?.id}`}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all"
            >
              Sipariş Takibine Git
            </Link>
            <Link
              href="/teklifim-gelsin/orders"
              className="rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              Tüm Siparişlerim
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TeklifimHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/teklifim-gelsin/orders/${order?.id}`}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Siparişe Geri Dön
          </Link>

          <div className="flex items-center gap-2">
            <PaymentCountdown
              initialSeconds={900}
              onExpire={() => {
                setErrorMsg("Ödeme oturum süreniz doldu. Lütfen sayfayı yenileyiniz.");
              }}
            />
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Lock className="h-3.5 w-3.5" /> 256-Bit SSL Güvenli B2B Tahsilat
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Güvenli Ödeme Ekranı</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sipariş No: <span className="font-mono text-slate-200">{order?.orderNumber}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Kredi / Banka Kartı ile Ödeme</h3>
                    <p className="text-xs text-slate-400">Tüm Visa, Mastercard ve Troy kartlar geçerlidir</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>3D Secure</span>
                </div>
              </div>

              {/* Sandbox Quick Test Buttons */}
              <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Test Kartı Hızlı Doldur:</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Sandbox Modu Aktif</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillTestCard("success")}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    Başarılı Kart
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCard("3ds")}
                    className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-colors"
                  >
                    3D Onaylı Kart
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCard("fail")}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                  >
                    Hatalı Kart
                  </button>
                </div>
              </div>

              {/* Credit Card Form */}
              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kart Üzerindeki İsim Soyisim
                  </label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="ALİ HAYDAR"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none placeholder:text-slate-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kart Numarası
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const parts = v.match(/.{1,4}/g);
                        setCardNumber(parts ? parts.join(" ") : v);
                      }}
                      placeholder="0000 0000 0000 0000"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white font-mono tracking-wider focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">VISA / MC / TROY</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Son Kullanma Tarihi
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={expireDate}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) {
                          v = `${v.slice(0, 2)}/${v.slice(2)}`;
                        }
                        setExpireDate(v);
                      }}
                      placeholder="AA/YY"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white font-mono text-center focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Güvenlik Kodu (CVC)
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white font-mono text-center focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      Ön Bilgilendirme Koşulları&apos;nı ve Mesafeli Satış Sözleşmesi&apos;ni okudum, kabul ediyorum.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {paying ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>3D Secure Doğrulanıyor...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Güvenli 3D Secure ile Öde ({Number(order?.totalPrice || 0).toLocaleString("tr-TR")} TL)</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400 border-t border-slate-800 pt-4">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Banka Seviyesinde Güvenlik
                </span>
                <span>•</span>
                <span>PCI-DSS Uyumlu Altyapı</span>
                <span>•</span>
                <span>Kart Bilgileri Saklanmaz</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order & Financial Summary */}
          <div className="lg:col-span-5 space-y-6">
            {order && <CheckoutSummaryCard order={order} />}
          </div>
        </div>
      </main>
    </div>
  );
}
