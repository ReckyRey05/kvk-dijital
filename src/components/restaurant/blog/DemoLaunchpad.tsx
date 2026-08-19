"use client";

import Link from "next/link";
import { QrCode, Store, ChefHat, Settings, ArrowRight, Sparkles, ExternalLink, ShieldCheck, Zap } from "lucide-react";

export default function DemoLaunchpad() {
  return (
    <section className="my-12 p-6 sm:p-8 rounded-3xl bg-[#0a1010] border-2 border-accent/40 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Canlı İnteraktif Simülasyon</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cep Garson Ekosistemini Canlıda Deneyimleyin
        </h3>

        <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
          Aşağıdaki 4 portala tıklayarak masadaki müşterinin, kasadaki personelin, mutfaktaki şefin ve restoran sahibinin ekranlarını gerçek zamanlı olarak anında test edebilirsiniz.
        </p>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-accent font-semibold flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 shrink-0" />
          <span>İpucu: Bir sekmede <strong>Masa 4 Menüsü</strong>&apos;nü, diğer sekmede <strong>Kasa POS</strong>&apos;u açıp sipariş verin; anlık akışı görün!</span>
        </div>
      </div>

      {/* 4 Interactive Portal Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Portal 1: Müşteri QR Menü */}
        <Link
          href="/qr/aura-bistro/m-4"
          target="_blank"
          className="group p-5 rounded-2xl bg-white/[0.02] hover:bg-accent/10 border border-white/10 hover:border-accent/50 transition-all flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-extrabold border border-accent/30 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/70 group-hover:text-accent">
              Müşteri Ekranı
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white group-hover:text-accent transition-colors flex items-center gap-1.5">
              1. Masa 4 QR Menü <ExternalLink className="w-3.5 h-3.5 text-foreground/40 group-hover:text-accent" />
            </h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              15dk oturum korumalı 4K menü, malzeme çıkarma, TR/EN dil seçeneği ve sepetten canlı sipariş verme.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-accent">
            <span>Menüyü Aç & Sipariş Ver</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Portal 2: Kasa & Garson POS */}
        <Link
          href="/restoran/aura-bistro/kasa"
          target="_blank"
          className="group p-5 rounded-2xl bg-white/[0.02] hover:bg-accent/10 border border-white/10 hover:border-accent/50 transition-all flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/70 group-hover:text-emerald-300">
              Kasiyer & Garson
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
              2. Kasa & Garson POS Terminali <ExternalLink className="w-3.5 h-3.5 text-foreground/40 group-hover:text-emerald-300" />
            </h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Masa doluluk haritası, sipariş onaylama, masa transferi, parçalı tahsilat ve anlık Z raporu.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Kasa Terminalini Başlat</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Portal 3: Mutfak Ekranı (KDS) */}
        <Link
          href="/restoran/aura-bistro/mutfak"
          target="_blank"
          className="group p-5 rounded-2xl bg-white/[0.02] hover:bg-accent/10 border border-white/10 hover:border-accent/50 transition-all flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-extrabold border border-amber-500/30 group-hover:scale-110 transition-transform">
              <ChefHat className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/70 group-hover:text-amber-300">
              Şef & Mutfak
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
              3. Mutfak Ekranı (KDS) <ExternalLink className="w-3.5 h-3.5 text-foreground/40 group-hover:text-amber-300" />
            </h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Sesli çan bildirimleri, geçen süre sayaçları, malzeme çıkarma uyarıları ve hazırlık adımları.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Mutfak Ekranını İncele</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Portal 4: Boss Yönetim Paneli */}
        <Link
          href="/restoran/aura-bistro/yonetim"
          target="_blank"
          className="group p-5 rounded-2xl bg-white/[0.02] hover:bg-accent/10 border border-white/10 hover:border-accent/50 transition-all flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-extrabold border border-purple-500/30 group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/70 group-hover:text-purple-300">
              Restoran Sahibi (Boss)
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
              4. Boss Yönetim & Menü / Ciro Paneli <ExternalLink className="w-3.5 h-3.5 text-foreground/40 group-hover:text-purple-300" />
            </h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Tek tıkla fiyat değiştirme, süreli indirim kampanyası başlatma, masa QR çıktıları ve Z raporu.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-purple-300">
            <span>Yönetim Panelini Aç</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Direct Contact CTA */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-foreground/70">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Restoranınız için anahtar teslim kurulum ve 7/24 teknik destek</span>
        </div>

        <Link
          href="https://wa.me/905348914905?text=Merhaba,%20Cep%20Garson%20Restoran%20QR%20ve%20POS%20sistemi%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
          target="_blank"
          className="px-6 py-2.5 rounded-full bg-accent text-black font-extrabold text-xs flex items-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer"
        >
          <span>İşletmeniz İçin Teklif Alın</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
