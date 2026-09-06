"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PackageCheck,
  Send,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  TEKLIFIM_CATEGORIES,
  TEKLIFIM_UNITS,
  TURKEY_CITIES,
  TeklifimProfile,
} from "@/types/teklifimGelsin";

export default function NewTeklifimRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeklifimProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Ambalaj & Paketleme");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("500");
  const [unit, setUnit] = useState<string>("Adet");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [city, setCity] = useState("İstanbul");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/teklifim-gelsin/auth");
      } else {
        setUser(currentUser);
        // Load profile
        const cached = localStorage.getItem(`teklifim_profile_${currentUser.uid}`);
        if (cached) {
          const p = JSON.parse(cached);
          setProfile(p);
          if (p.city) setCity(p.city);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);

    try {
      const token = await user.getIdToken();
      const payload = {
        title: title.trim(),
        category,
        productName: productName.trim() || title.trim(),
        quantity: Number(quantity) || 1,
        unit,
        deliveryDays: Number(deliveryDays) || 7,
        city,
        description: description.trim(),
        deadline: deadline || undefined,
        businessName: profile?.companyName || "İşletme",
        phone: profile?.phone || "",
      };

      // 1. Try Server API
      let createdId = "";
      try {
        const res = await fetch("/api/teklifim-gelsin/requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.request?.id) createdId = data.request.id;
        }
      } catch (apiErr) {
        console.warn("Server API notice:", apiErr);
      }

      // 2. Client Firestore fallback
      if (!createdId) {
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { collection, addDoc } = await import("firebase/firestore");
          const docRef = await addDoc(collection(db, "teklifim_requests"), {
            ...payload,
            businessId: user.uid,
            status: "published",
            offerCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          createdId = docRef.id;
        } catch (dbErr) {
          console.warn("Client Firestore notice:", dbErr);
        }
      }

      router.push("/teklifim-gelsin/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Talep yayınlanırken bir sorun oluştu.");
      setSubmitting(false);
    }
  };

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
      <header className="border-b border-white/10 px-6 py-4 bg-[#070B14]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/teklifim-gelsin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Panele Dön</span>
          </Link>

          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Yeni Tedarik Talebi
          </span>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-[#0E1626] rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">İhtiyacınızı Yayınlayın</h1>
            <p className="text-xs text-slate-400">
              Talebinizi oluşturun, uygun toptancılar ve üreticiler size doğrudan fiyat ve teslimat şartlarıyla teklif versin.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-white block mb-1">
                Talep Başlığı *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 500 Adet Karton Bardak"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category & Product */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {TEKLIFIM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Ürün / Hizmet Cinsi
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Örn: 8 oz Sıcak İçecek Bardağı"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quantity & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Miktar *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Birim *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {TEKLIFIM_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Delivery Days & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  İstenen Teslim Süresi (Gün) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  placeholder="7"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Teslimat Şehri *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {TURKEY_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-white block mb-1">
                Açıklama & Özel Şartlar
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: 8 oz, baskısız, çift katlı sızdırmaz kraft bardak. Kolili teslimat tercih edilir."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Talebi Yayınla</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
