import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  TrendingUp,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  Award,
  Zap,
  DollarSign,
  Lock,
  PhoneCall,
  Search,
} from "lucide-react";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import MarketplaceFlowDiagram from "@/components/teklifimGelsin/MarketplaceFlowDiagram";
import CategorySelector from "@/components/teklifimGelsin/CategorySelector";

export const metadata: Metadata = {
  title: "Teklifim Gelsin — B2B Alışverişin Teklif Merkezi",
  description:
    "Aradığını yaz, teklifin gelsin. İşletmeler ihtiyaçlarını yayınlar, uygun toptancılar doğrudan teklif verir. En doğru seçeneği tek ekranda bulun.",
};

export default function TeklifimGelsinLandingPage() {
  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200 antialiased">
        <TeklifimHeader />

        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
          {/* Subtle architectural background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[140px]" />
          </div>

          <div className="max-w-5xl mx-auto space-y-10 relative z-10">
            {/* TAGLINE & HERO TEXT */}
            <div className="text-center space-y-5 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>B2B Alışverişin Teklif Merkezi</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.15]">
                Aradığını yaz.{" "}
                <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-300 dark:decoration-emerald-700 decoration-wavy decoration-2">
                  Teklifin gelsin.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                İhtiyacını yayınla, uygun tedarikçilerden teklifleri topla ve en doğru seçeneği bul. Telefon telefon toptancı arama devrini geride bırakın.
              </p>

              {/* CTAS */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/teklifim-gelsin/auth?role=business"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Teklif İstemeye Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/teklifim-gelsin/auth?role=supplier"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-[#121824] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Tedarikçi Olarak Katıl</span>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Komisyonsuz
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Doğrulanmış Toptancılar
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Hızlı Teklif Karşılaştırma
                </span>
              </div>
            </div>

            {/* REAL-WORLD MARKETPLACE FLOW DIAGRAM */}
            <div id="akisi-gor" className="pt-4 scroll-mt-24">
              <div className="text-center mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Canlı Pazar Akış Simülasyonu
                </span>
              </div>
              <MarketplaceFlowDiagram />
            </div>
          </div>
        </section>

        {/* ================= STORY / 4-PILLAR FLOW ================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-100/50 dark:bg-[#0B0F19] border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Nasıl Çalışır?
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Tedarik sürecini 4 adımda tek ekrana topluyoruz
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Karmaşık satın alma tabloları, onlarca cevapsız e-posta ve WhatsApp grupları yerine şeffaf bir pazar ağı.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* PILLAR 1 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-lg">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  İhtiyacını Yayınla
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ürünün adını, istediğin miktarı ve şehri gir. Kademeli sihirbaz ile saniyeler içinde talebin hazır.
                </p>
              </div>

              {/* PILLAR 2 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100/70 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-lg">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Toptancılar Teklif Versin
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Talebin yalnızca o kategoride üretim ve dağıtım yapan onaylı tedarikçilere iletilir.
                </p>
              </div>

              {/* PILLAR 3 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-lg">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Fiyat & Süre Karşılaştır
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Birim fiyat, teslimat günü ve minimum sipariş şartlarını yan yana gör. En Ucuz ve En Hızlı rozetleriyle karar ver.
                </p>
              </div>

              {/* PILLAR 4 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100/70 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-lg">
                  4
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Doğrudan İletişime Geç
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Kazanan teklifi seç; tedarikçinin doğrudan telefon ve WhatsApp kanalları açılsın. Komisyonsuz anlaş.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CATEGORIES SECTION ================= */}
        <section id="kategoriler" className="py-16 sm:py-24 px-4 sm:px-6 scroll-mt-24">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Pazaryeri Kategorileri
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Her sektör için uzman tedarik ağı
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Kafe sarflarından fabrika ambalajına, endüstriyel hijyenden iş kıyafetlerine kadar tek merkez.
              </p>
            </div>

            <CategorySelector />
          </div>
        </section>

        {/* ================= TRUST ARCHITECTURE ================= */}
        <section className="py-16 px-4 sm:px-6 bg-slate-50 dark:bg-[#0C101B] border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Güven ve Ticari Gizlilik
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                B2B standartlarında tam veri izolasyonu
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 space-y-3">
                <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Fiyat Mahremiyeti
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Toptancılar birbirlerinin tekliflerini ve fiyatlarını kesinlikle göremez. Her tedarikçi sadece kendi teklifini yönetir.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 space-y-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Doğrulanmış Firmalar
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Platformdaki işletme ve üreticilerin ticari unvanları ve faaliyet alanları incelenerek onay rozeti verilir.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 space-y-3">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sıfır Komisyon
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Anlaşma işletme ve toptancı arasındadır. Sipariş tutarından herhangi bir aracı komisyonu kesilmez.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 dark:bg-[#121824] border border-slate-800 p-8 sm:p-14 text-center text-white space-y-6 shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Tedarik maliyetlerinizi düşürmeye bugün başlayın
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              İster 10 şubeli bir restoran olun, ister üretim atölyesi. İhtiyacınızı yazın, teklifler masanıza gelsin.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/teklifim-gelsin/auth?role=business"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                Hemen Ücretsiz Talep Aç
              </Link>
              <Link
                href="/teklifim-gelsin/auth?role=supplier"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Tedarikçi Girişi
              </Link>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Teklifim Gelsin</span>
              <span className="text-[10px] text-slate-400 font-normal">
                • B2B Alışverişin Teklif Merkezi
              </span>
            </div>

            <p className="text-[11px]">
              Bir <strong className="text-slate-700 dark:text-slate-300 font-semibold">KvK Dijital Çözümler</strong> altyapı ürünüdür.
            </p>
          </div>
        </footer>
      </div>
    </TeklifimThemeProvider>
  );
}
