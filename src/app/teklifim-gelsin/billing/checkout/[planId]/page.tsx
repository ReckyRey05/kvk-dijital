"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/auth";
import {
  CreditCard,
  ShieldCheck,
  Tag,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Lock,
} from "lucide-react";

export default function SubscriptionCheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const resolvedParams = use(params);
  const planId = resolvedParams.planId;

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInterval = (searchParams.get("interval") as "monthly" | "yearly") || "monthly";

  const [interval, setInterval] = useState<"monthly" | "yearly">(initialInterval);
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await fetch("/api/teklifim-gelsin/subscription/plans");
        if (res.ok) {
          const json = await res.json();
          const found = (json.plans || []).find((p: any) => p.id === planId || p.tier === planId);
          setPlan(found || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [planId]);

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim() || !plan) return;
    setCheckingCoupon(true);
    setCouponError(null);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/subscription/coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          planTier: plan.tier,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setDiscount(json.discount || 0);
        setAppliedCoupon(couponCode.toUpperCase().trim());
      } else {
        setCouponError(json.error || "Kupon uygulanamadi.");
        setDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (e: any) {
      setCouponError(e.message || "Kupon kontrolu basarisiz.");
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function handleCheckout() {
    if (!plan) return;
    setProcessing(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          interval,
          couponCode: appliedCoupon || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.checkoutUrl) {
        // Redirect to provider checkout URL (or simulated success callback in sandbox)
        window.location.href = json.checkoutUrl;
      } else {
        alert(json.error || "Odeme oturumu olusturulamadi.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
        Paket bilgileri yükleniyor...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Paket Bulunamadı</h2>
        <Link
          href="/teklifim-gelsin/billing"
          className="inline-block px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
        >
          Paket Listesine Dön
        </Link>
      </div>
    );
  }

  const basePrice = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const netAmount = Math.max(0, basePrice - discount);
  const vatAmount = Math.round(netAmount * 0.2 * 100) / 100;
  const totalAmount = Math.round((netAmount + vatAmount) * 100) / 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Link
        href="/teklifim-gelsin/billing"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Paketlere Geri Dön
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Plan Summary */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              Abonelik Satın Alma
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">{plan.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
          </div>

          {/* Billing Interval Toggle */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="text-xs font-medium text-slate-300">Fatura Dönemi</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setInterval("monthly");
                  setDiscount(0);
                  setAppliedCoupon(null);
                }}
                className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                  interval === "monthly"
                    ? "border-primary bg-primary/10 text-white font-semibold"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-semibold text-sm">{plan.monthlyPrice} TL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Aylık Ödeme</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInterval("yearly");
                  setDiscount(0);
                  setAppliedCoupon(null);
                }}
                className={`p-3 rounded-lg border text-left text-xs transition-colors relative ${
                  interval === "yearly"
                    ? "border-primary bg-primary/10 text-white font-semibold"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                  %17 İndirim
                </span>
                <div className="font-semibold text-sm">{plan.yearlyPrice} TL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Yıllık Peşin</div>
              </button>
            </div>
          </div>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <div className="text-xs font-medium text-slate-300">İndirim Kuponu</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="PROMO KODU"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-primary font-mono"
              />
              <button
                type="submit"
                disabled={checkingCoupon}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {checkingCoupon ? "..." : "Uygula"}
              </button>
            </div>
            {couponError && <div className="text-[11px] text-red-400">{couponError}</div>}
            {appliedCoupon && (
              <div className="text-[11px] text-emerald-400 font-medium">
                {appliedCoupon} kodu uygulandı: -{discount} TL indirim
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Order Summary & Checkout */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <div className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Ödeme Özeti
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{plan.name} ({interval === "yearly" ? "Yıllık" : "Aylık"})</span>
                <span className="font-mono text-slate-200">{basePrice} TL</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Kupon İndirimi</span>
                  <span className="font-mono">-{discount} TL</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Ara Toplam</span>
                <span className="font-mono text-slate-200">{netAmount} TL</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>KDV (%20)</span>
                <span className="font-mono text-slate-200">{vatAmount} TL</span>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline text-white">
                <span className="font-semibold text-sm">Toplam Tutar</span>
                <div className="text-right">
                  <div className="text-xl font-extrabold font-mono text-primary">
                    {totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                  </div>
                  <div className="text-[10px] text-slate-500">Tüm vergiler dahil</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              <span>{processing ? "İşleniyor..." : "Güvenli Ödeme ile Tamamla"}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>256-bit SSL şifreleme ve 3D Secure ile korunur.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
