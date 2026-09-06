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
} from "lucide-react";
import { TEKLIFIM_CATEGORIES } from "@/types/teklifimGelsin";

export const metadata = {
  title: "Teklifim Gelsin — B2B Tedarik ve Teklif Marketplace",
  description:
    "İşletmeler ihtiyaçlarını paylaşır, uygun toptancılar teklif verir. Fiyatları ve şartları tek yerde karşılaştırın.",
};

export default function TeklifimGelsinLanding() {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Top Bar */}
      <header className="border-b border-white/10 sticky top-0 z-40 bg-[#070B14]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/teklifim-gelsin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-tight">
                Teklifim<span className="text-emerald-400">Gelsin</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 font-mono">
                B2B Tedarik Ağı
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/teklifim-gelsin/auth"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Giriş Yap
            </Link>

            <Link
              href="/teklifim-gelsin/auth?role=business"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              Teklif İstemeye Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-32 right-10 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Türkiye'nin Yeni Nesil B2B Tedarik Pazaryeri</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            İhtiyacını yayınla,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              teklifin gelsin.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            İşletmeler ihtiyaçlarını paylaşır, uygun toptancılar doğrudan teklif verir. Birim fiyatları, teslim sürelerini ve şartları tek ekranda karşılaştırın.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/teklifim-gelsin/auth?role=business"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Teklif İstemeye Başla</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/teklifim-gelsin/auth?role=supplier"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Toptancı Olarak Katıl</span>
            </Link>
          </div>
        </div>

        {/* Visual Role Split Cards */}
        <div className="max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Card 1: İşletmeler */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border border-white/10 hover:border-emerald-500/30 transition-all space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Alıcılar İçin
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">İşletmeler</h3>
              <p className="text-xs text-slate-400 mt-1">“Aradığın ürünü ve hizmeti en uygun fiyatla bul.”</p>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Restoran, market, kafe, otel veya mağazanız için anında talep açın.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Onlarca toptancıyı tek tek aramak yerine tekliflerin ayağınıza gelmesini sağlayın.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>“En Ucuz”, “En Hızlı” ve “En Uygun” teklifleri şeffafça karşılaştırın.</span>
              </li>
            </ul>

            <Link
              href="/teklifim-gelsin/auth?role=business"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>İşletme Olarak Başla</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Toptancılar */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border border-white/10 hover:border-teal-500/30 transition-all space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                Tedarikçiler İçin
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Toptancılar & Üreticiler</h3>
              <p className="text-xs text-slate-400 mt-1">“Sıfır pazarlama maliyetiyle yeni kurumsal müşterilere ulaş.”</p>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Kategorinize ve dağıtım bölgenize uygun sıcak talepleri anlık görün.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Birim fiyat ve teslimat sürenizle saniyeler içinde doğrudan teklif verin.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Teklifiniz seçildiğinde doğrudan işletmeyle iletişime geçip satışı bağlayın.</span>
              </li>
            </ul>

            <Link
              href="/teklifim-gelsin/auth?role=supplier"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              <span>Toptancı Olarak Kaydol</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-16 px-6 border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Geniş Kategori Ağı
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Hangi Sektörde İhtiyacınız Varsa</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Türkiye genelindeki toptancı ve üretici ağımızla tüm ticari ihtiyaçlarınıza yanıt verin.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TEKLIFIM_CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all text-center space-y-1"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mt-2">{cat}</h4>
                <span className="text-[10px] text-slate-500">Tedarik Talepleri</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              3 Basit Adım
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Nasıl Çalışır?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-3xl font-black text-emerald-400 font-mono">01</span>
              <h3 className="text-base font-bold text-white">İhtiyacını Yayınla</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                İşletme olarak ürün adını, miktarını ve teslim süresini belirterek 1 dakikada talebini aç.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-3xl font-black text-teal-400 font-mono">02</span>
              <h3 className="text-base font-bold text-white">Toptancılar Teklif Versin</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kategorideki uygun tedarikçiler birim fiyat ve teslimat şartlarıyla tekliflerini iletsin.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-3xl font-black text-emerald-400 font-mono">03</span>
              <h3 className="text-base font-bold text-white">Karşılaştır ve Seç</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                En ucuz ve en hızlı teklifi gör, tedarikçini seç ve doğrudan iletişim başlat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 bg-[#05080F]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-white">Teklifim Gelsin</span> — B2B Tedarik ve Teklif Platformu
          </div>
          <div>
            KvK Dijital Çözümler altyapısıyla geliştirilmiştir.
          </div>
        </div>
      </footer>
    </div>
  );
}
