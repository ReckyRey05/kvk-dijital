import Link from "next/link";
import {
  QrCode,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Package,
  Wrench,
  Building,
  Store,
  Printer,
  Smartphone,
  Layers,
  ChevronRight,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Etiketle | QR Kod ile Kolay Varlık Takibi",
  description:
    "Ürünlerini, kutularını ve ekipmanlarını QR kodlarla kolayca takip et. Etiketle ile fiziksel varlıklarını dijital bilgiye dönüştür.",
  openGraph: {
    title: "Etiketle | QR Kod ile Kolay Varlık Takibi",
    description:
      "Ürünlerini, kutularını ve ekipmanlarını QR kodlarla kolayca takip et. Etiketle ile fiziksel varlıklarını dijital bilgiye dönüştür.",
    type: "website",
  },
};

export default function EtiketleLandingPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-amber-500 selection:text-black font-sans antialiased">
      {/* Top Navigation */}
      <header className="border-b border-white/10 sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/etiketle" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-tight">
                Etiket<span className="text-amber-400">le</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 font-mono">
                QR Varlık Takibi
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/etiketle/auth"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Giriş Yap
            </Link>

            <Link
              href="/etiketle/auth?mode=register"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-amber-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fiziksel Nesneleri Dijital Bilgiye Bağlayın</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Her şeyini tek{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              okutmayla bul.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ürünlerini, kutularını ve ekipmanlarını QR kodlarla dijital olarak takip et. “Bu kutunun içinde ne var?”, “Kaç tane kaldı?” sorularına saniyeler içinde cevap al.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/etiketle/auth?mode=register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ücretsiz Başla</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#nasil-calisir"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Nasıl Çalışır?</span>
            </a>
          </div>
        </div>

        {/* Visual Hero Mockup: Box -> QR -> Mobile Scan Info */}
        <div className="max-w-4xl mx-auto mt-16 relative z-10">
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#111622] to-[#0A0D15] border border-white/10 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                Gerçek Kullanım Akışı
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Fiziksel Nesne → QR Kod → Telefon Taraması → Anlık Bilgi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
              {/* Step A: Physical Object with QR */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-white block">Fiziksel Kutu / Ekipman</strong>
                  <span className="text-[11px] text-slate-400">Üzerine QR etiket yapıştırıldı</span>
                </div>
                <div className="inline-block p-2 rounded-xl bg-white text-black text-[10px] font-mono font-black">
                  [ QR ETİKET ]
                </div>
              </div>

              {/* Step B: Phone Scanning Arrow */}
              <div className="text-center space-y-2 py-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-400 block">Kamerayı Yaklaştır</span>
                <span className="text-[10px] text-slate-400 block">Uygulama yüklemeden taratılır</span>
              </div>

              {/* Step C: Mobile Screen Result */}
              <div className="p-5 rounded-2xl bg-[#07090E] border border-amber-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">etiketle.app/e/X8K29F</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ekipman</span>
                  <h4 className="text-base font-black text-white">Kamera Tripodu</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 block">Miktar</span>
                    <strong className="text-amber-400 text-sm font-black">12 Adet</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 block">Konum</span>
                    <strong className="text-white text-sm font-black">Raf B-04</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">Siyah profesyonel tripod seti.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section id="nasil-calisir" className="py-20 px-6 border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              3 Basit Adım
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white">Nasıl Çalışır?</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Karmaşık ERP veya zor stok programları yok. 1 dakikada ilk etiketinizi oluşturun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-3">
              <span className="text-3xl font-black text-amber-400 font-mono">01</span>
              <h3 className="text-base font-bold text-white">Etiketini Oluştur</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nesne adını, adedini, bulunduğu rafı/odayı ve kısa açıklamayı panele girin.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-3">
              <span className="text-3xl font-black text-amber-400 font-mono">02</span>
              <h3 className="text-base font-bold text-white">QR Kodunu Yazdır</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Otomatik üretilen etiketi tek tıkla yazdırın veya PNG olarak indirip nesneye yapıştırın.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-3">
              <span className="text-3xl font-black text-amber-400 font-mono">03</span>
              <h3 className="text-base font-bold text-white">Okut ve Bilgiyi Gör</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Herhangi bir telefon kamerasıyla QR'ı okutun; anında kutunun içeriğini ve adedini görün.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Kullanım Alanları
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Hangi Amaçla Kullanabilirsiniz?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Depo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kutuları açıp içine bakmadan raftaki kolilerin içeriğini ve adetlerini tek okutmayla bulun.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Atölye & Servis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pahalı el aletleri, takım çantaları ve yedek parçaların konumunu ve zimmetini takip edin.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Ofis & Kurum</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Laptoplar, monitörler, ofis demirbaşları ve arşiv evrak kutularını kolayca dijitalleştirin.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Mağaza</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raf arkası stokları, reyon ürünlerini ve askıdaki beden adetlerini pratik biçimde yönetin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 bg-[#05060A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-white">Etiketle</span> — QR Kod ile Kolay Varlık Takibi
          </div>
          <div>
            KvK Dijital Çözümler altyapısıyla geliştirilmiştir.
          </div>
        </div>
      </footer>
    </div>
  );
}
