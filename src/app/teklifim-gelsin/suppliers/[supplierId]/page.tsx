"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Package,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { TeklifimProfile } from "@/types/teklifimGelsin";

export default function TeklifimSupplierProfilePage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const resolvedParams = use(params);
  const supplierId = resolvedParams.supplierId;

  const [supplier, setSupplier] = useState<TeklifimProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupplier() {
      try {
        setLoading(true);
        // Try Client Firestore
        const { db } = await import("@/lib/firebase/firestore");
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "teklifim_profiles", supplierId));

        if (snap.exists()) {
          setSupplier(snap.data() as TeklifimProfile);
        } else {
          // Fallback mock profile for demo
          setSupplier({
            uid: supplierId,
            role: "supplier",
            companyName: "Mega Ambalaj Sanayi ve Ticaret",
            contactName: "Mehmet Kaya",
            phone: "0542 999 88 77",
            email: "iletisim@megaambalaj.com",
            city: "İstanbul",
            categories: ["Ambalaj & Paketleme", "Matbaa & Baskı"],
            description:
              "15 yıllık üretim tecrübemizle otel, restoran ve cafelere özel logolu/baskısız karton bardak, ambalaj kağıtları ve koli tedariği sağlıyoruz.",
            deliveryRegions: ["İstanbul", "Kocaeli", "Bursa", "Tüm Türkiye"],
            minOrder: "1 Koli (1.000 Adet)",
            isVerified: false,
            createdAt: Date.now() - 86400000 * 30,
            updatedAt: Date.now(),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSupplier();
  }, [supplierId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-white p-6 space-y-4">
        <h2 className="text-xl font-bold">Tedarikçi Bulunamadı</h2>
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
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased pb-20">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 bg-[#070B14]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/teklifim-gelsin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </Link>

          <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
            Tedarikçi Profili
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1626] border border-white/10 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">{supplier.companyName}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{supplier.city}</span>
                  <span>•</span>
                  <span>Yetkili: {supplier.contactName}</span>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div>
              {supplier.isVerified ? (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Doğrulanmış Tedarikçi</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 text-xs font-medium flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Doğrulanmamış Firma</span>
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {supplier.description && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed">
              <strong className="text-white block mb-1">Firma Hakkında:</strong>
              {supplier.description}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">Faaliyet Alanları</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {supplier.categories.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">Teslimat Bölgeleri</span>
              <div className="text-xs font-bold text-white mt-1">
                {supplier.deliveryRegions?.join(", ") || "Türkiye Geneli"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">Minimum Sipariş</span>
              <div className="text-xs font-bold text-white mt-1">
                {supplier.minOrder || "Görüşmeye Bağlı"}
              </div>
            </div>
          </div>

          {/* Contact Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block">
                Doğrudan İletişim
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                {supplier.phone && <span>Tel: <strong className="text-white">{supplier.phone}</strong></span>}
                {supplier.email && <span>E-posta: <strong className="text-white">{supplier.email}</strong></span>}
              </div>
            </div>

            {supplier.phone && (
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${supplier.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ara</span>
                </a>

                <a
                  href={`https://wa.me/90${supplier.phone.replace(/[^0-9]/g, "").slice(-10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
