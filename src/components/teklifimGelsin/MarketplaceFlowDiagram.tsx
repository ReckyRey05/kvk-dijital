"use client";

import React, { useState } from "react";
import {
  FileText,
  Building2,
  Truck,
  ArrowRight,
  CheckCircle2,
  Award,
  Zap,
  DollarSign,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  Package,
} from "lucide-react";

export default function MarketplaceFlowDiagram() {
  const [activeStep, setActiveStep] = useState<number>(2); // Default showing offers

  const steps = [
    {
      id: 0,
      title: "1. Talep Yayınla",
      sub: "İhtiyacını belirle",
      badge: "İşletme",
    },
    {
      id: 1,
      title: "2. Tedarikçi Eşleşmesi",
      sub: "Kategoriye göre dağıtım",
      badge: "Otomatik Ağ",
    },
    {
      id: 2,
      title: "3. Teklif Karşılaştırma",
      sub: "Fiyat & hız dengesi",
      badge: "3 Teklif Geldi",
    },
    {
      id: 3,
      title: "4. Doğrudan İletişim",
      sub: "Aracısız sipariş onayı",
      badge: "Anlaşma Sağlandı",
    },
  ];

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-sans transition-colors duration-200">
      {/* FLOW CONTROLLER / STEPS HEADER */}
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-[#121824] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max mx-auto">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 ring-2 ring-emerald-500/20"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                        : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {step.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC STAGE VIEWER */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* STEP 0: TALEP YAYINLA */}
        {activeStep === 0 && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center space-y-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Adım 1: İşletme İhtiyacını Yayınlar
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Formlarla Boğuşmadan, Ne Lazımsa Yaz
              </h3>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Ambalaj & Paketleme
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    500 Adet Çift Duvarlı Kraft Karton Bardak (8 oz)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kafe açılışımız için sıcak içecek servisine uygun sızdırmaz kraft bardak arıyoruz.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold shrink-0">
                  500 Adet
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  İstanbul (Kadıköy)
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  7 Gün İçinde Teslimat
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Mola Artisan Cafe
                </span>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setActiveStep(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer"
              >
                <span>Sonraki Adımı İncele: Tedarikçi Eşleşmesi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: TEDARİKÇİ EŞLEŞMESİ */}
        {activeStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center space-y-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Adım 2: Akıllı Kategori Dağıtımı
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Talebiniz Yalnızca İlgili Toptancılara Ulaşır
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Üretici
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                  Öztürk Ambalaj Sanayi
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  İstanbul • Kağıt ve karton ambalaj fabrikası
                </p>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  Bildirim Gönderildi ✓
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    Toptancı
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                  Marmara Kağıt A.Ş.
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kocaeli • Stoklu hızlı depo dağıtımı
                </p>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  Bildirim Gönderildi ✓
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    Dağıtıcı
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                  Ege Toptan Tedarik
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  İzmir & İstanbul • Toptan sarf merkezi
                </p>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  Bildirim Gönderildi ✓
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer"
              >
                <span>Sonraki Adımı İncele: Teklifleri Karşılaştır</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TEKLİF KARŞILAŞTIRMA (DEFAULT & HERO HIGHLIGHT) */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Adım 3: Akıllı Teklif Karşılaştırma
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Fiyat, Süre ve Şartlar Tek Ekranda Yan Yana
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* OFFER A - EN UYGUN */}
              <div className="relative rounded-2xl bg-white dark:bg-[#121824] border-2 border-emerald-500/80 shadow-lg p-5 space-y-4">
                <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Award className="w-3 h-3" />
                  <span>En Uygun Teklif</span>
                </div>

                <div className="pt-2 flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      Öztürk Ambalaj A.Ş.
                    </h5>
                    <span className="text-[11px] text-slate-400">İstanbul • 8 yıllık üretici</span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    16.250 ₺
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Birim: <strong>32,50 ₺</strong> / Adet (KDV Dahil)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span><strong>4 Günde</strong> Teslim</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>Min. 250 Adet</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStep(3)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Bu Teklifi Seç
                </button>
              </div>

              {/* OFFER B - EN UCUZ */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                  <DollarSign className="w-3 h-3" />
                  <span>En Ucuz</span>
                </div>

                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                    Ege Toptan Tedarik
                  </h5>
                  <span className="text-[11px] text-slate-400">İzmir • Toptan dağıtıcı</span>
                </div>

                <div className="space-y-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    14.900 ₺
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Birim: <strong>29,80 ₺</strong> / Adet
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>6 Günde</strong> Teslim</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>Min. 500 Adet</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStep(3)}
                  className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Teklifi İncele
                </button>
              </div>

              {/* OFFER C - EN HIZLI */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  <Zap className="w-3 h-3" />
                  <span>En Hızlı</span>
                </div>

                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                    Marmara Kağıt A.Ş.
                  </h5>
                  <span className="text-[11px] text-slate-400">Kocaeli • Depodan aynı gün</span>
                </div>

                <div className="space-y-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    17.000 ₺
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Birim: <strong>34,00 ₺</strong> / Adet
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span><strong>2 Günde</strong> Teslim</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>Min. 100 Adet</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStep(3)}
                  className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Teklifi İncele
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DOĞRUDAN İLETİŞİM */}
        {activeStep === 3 && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center space-y-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Adım 4: Anlaşma & Doğrudan İletişim
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Komisyonsuz, Aracısız ve Doğrudan İletişim
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Öztürk Ambalaj A.Ş. ile Anlaşma Sağlandı
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Teklif onaylandı. Tedarikçinin doğrudan kurumsal iletişim kanalları açıldı:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Doğrudan Telefon</span>
                    <strong className="text-xs text-slate-800 dark:text-slate-200">0212 555 10 20</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kurumsal WhatsApp</span>
                    <strong className="text-xs text-emerald-700 dark:text-emerald-400">WhatsApp Başlat</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setActiveStep(0)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                ← Süreci Baştan Canlandır
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
