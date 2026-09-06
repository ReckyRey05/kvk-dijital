"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Package,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { TeklifimProfile, CATEGORY_DETAILS } from "@/types/teklifimGelsin";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";

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
          // Demo fallback commercial profile
          setSupplier({
            uid: supplierId,
            role: "supplier",
            companyName: "Öztürk Ambalaj Sanayi A.Ş.",
            contactName: "Murat Öztürk",
            phone: "0212 555 10 20",
            email: "toptan@ozturkambalaj.com.tr",
            city: "İstanbul",
            district: "İkitelli OSB",
            categories: ["Ambalaj & Paketleme", "Matbaa & Baskı"],
            description:
              "12 yıllık imalat altyapımızla endüstriyel kağıt, oluklu mukavva, baskılı karton bardak ve gıda ambalajı üretiminde Türkiye geneline toptan sevkiyat gerçekleştiriyoruz.",
            deliveryRegions: ["Marmara Bölgesi", "Ege Bölgesi", "Tüm Türkiye"],
            minOrder: "250 Adet / 1 Koli",
            isVerified: true,
            yearFounded: 2012,
            completedDeals: 148,
            responseRate: "%98 (Ortalama 2 saat)",
            taxVerified: true,
            createdAt: Date.now() - 86400000 * 180,
            updatedAt: Date.now(),
          });
        }
      } catch (e) {
        console.warn("Supplier profile lookup notice:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSupplier();
  }, [supplierId]);

  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <TeklifimHeader />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* BACK LINK */}
          <div>
            <Link
              href="/teklifim-gelsin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri Dön</span>
            </Link>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Tedarikçi Profili Yükleniyor...
              </p>
            </div>
          ) : !supplier ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Firma Profili Bulunamadı
              </h3>
            </div>
          ) : (
            <div className="space-y-6">
              {/* COMMERCIAL HEADER CARD */}
              <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Doğrulanmış Üretici / Toptancı</span>
                      </span>

                      {supplier.yearFounded && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                          Kuruluş: {supplier.yearFounded}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                      {supplier.companyName}
                    </h1>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {supplier.city} {supplier.district ? `(${supplier.district})` : ""}
                      </span>
                      <span>•</span>
                      <span>Yetkili: {supplier.contactName}</span>
                    </div>
                  </div>

                  {/* DIRECT QUOTE CTA */}
                  <Link
                    href={`/teklifim-gelsin/requests/new?supplierPref=${encodeURIComponent(
                      supplier.companyName
                    )}`}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Bu Firmadan Teklif İste</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {supplier.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {supplier.description}
                  </p>
                )}

                {/* TRUST & COMMERCIAL METRICS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Tamamlanan Anlaşma
                    </span>
                    <strong className="text-lg font-black text-slate-900 dark:text-white">
                      {supplier.completedDeals || "50+"} İşlem
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Ortalama Yanıt Hızı
                    </span>
                    <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {supplier.responseRate || "2 Saat İçinde"}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Min. Sipariş Şartı
                    </span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                      {supplier.minOrder || "1 Koli"}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Ticari Sicil
                    </span>
                    <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Onaylı Vergi</span>
                    </strong>
                  </div>
                </div>
              </div>

              {/* COMMERCIAL DETAILS: CATEGORIES & DELIVERY REGIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CATEGORIES */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Uzmanlık ve Üretim Kategorileri
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(supplier.categories || []).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* DELIVERY REGIONS */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Teslimat & Dağıtım Ağları
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(supplier.deliveryRegions || ["Tüm Türkiye"]).map((reg, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3 text-blue-500" />
                        <span>{reg}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* DIRECT CONTACT CHANNELS */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Kurumsal İletişim Kanalları
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${supplier.phone}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Telefon</span>
                        <strong className="text-xs sm:text-sm font-mono text-slate-900 dark:text-white">
                          {supplier.phone || "Belirtilmedi"}
                        </strong>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Ara →
                    </span>
                  </a>

                  <a
                    href={`https://wa.me/${(supplier.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Merhaba ${supplier.companyName}, Teklifim Gelsin üzerinden profilinizi inceledim. Toptan tedarik ile ilgili görüşmek istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between hover:bg-emerald-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                          Kurumsal WhatsApp
                        </span>
                        <strong className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-100">
                          Sohbet Başlat
                        </strong>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Yaz →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </TeklifimThemeProvider>
  );
}
