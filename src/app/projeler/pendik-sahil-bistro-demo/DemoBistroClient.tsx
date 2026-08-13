"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Utensils, 
  Coffee, 
  Clock, 
  MapPin, 
  Phone, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Info,
  Calendar
} from "lucide-react";

type MenuCategory = "all" | "kahvalti" | "burger" | "makarna" | "tatli" | "icecek";

interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: string;
  description: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Serpme Ege Kahvaltısı",
    category: "kahvalti",
    price: "450 ₺",
    description: "Ezine peyniri, Ayvalık kırma zeytin, ev yapımı reçeller, sıcak pişiler ve sınırsız çay ile.",
    badge: "Popüler"
  },
  {
    id: "2",
    name: "Avokado & Poşe Yumurta",
    category: "kahvalti",
    price: "240 ₺",
    description: "Ekşi maya ekmek üzerinde taze avokado püresi, poşe yumurta ve çöreotu süslemesi.",
    badge: "Şefin Seçimi"
  },
  {
    id: "3",
    name: "Gurme Kasap Burger",
    category: "burger",
    price: "320 ₺",
    description: "180gr özel kıyma köfte, karamelize soğan, cheddar peynir, trüflü mayonez ve baharatlı patates.",
    badge: "Çok Satan"
  },
  {
    id: "4",
    name: "Çıtır Tavuk Sandviç",
    category: "burger",
    price: "260 ₺",
    description: "Özel sosla marine edilmiş çıtır tavuk filfile, marul, turşu ve özel bistro sos.",
  },
  {
    id: "5",
    name: "Kremalı Trüflü Penne",
    category: "makarna",
    price: "290 ₺",
    description: "Taze kültür mantarı, trüf mantarı esansı, krema sosu ve parmesan rendesi.",
    badge: "Özel Reçete"
  },
  {
    id: "6",
    name: "Izgara Somon & Roka",
    category: "makarna",
    price: "420 ₺",
    description: "Taze ızgara somon fileto, kiraz domatesli roka salatası ve limonlu zeytinyağı sosu.",
  },
  {
    id: "7",
    name: "San Sebastian Cheesecake",
    category: "tatli",
    price: "180 ₺",
    description: "Akışkan kıvamlı karamelize İspanyol cheesecake'i, sıcak çikolata sosu ile.",
    badge: "Favori"
  },
  {
    id: "8",
    name: "Ev Yapımı Tiramisu",
    category: "tatli",
    price: "160 ₺",
    description: "Gerçek mascarpone peyniri ve espresso ile demlenmiş İtalyan kedi dili bisküvisi.",
  },
  {
    id: "9",
    name: "Özel Blend Filtre Kahve",
    category: "icecek",
    price: "90 ₺",
    description: "%100 Arabica Etiyopya & Kolombiya harmanı taze çekilmiş kahve.",
  },
  {
    id: "10",
    name: "Ev Yapımı Nane Limonata",
    category: "icecek",
    price: "95 ₺",
    description: "Taze sıkılmış taze limon suyu ve taze nane yaprakları ile serinletici lezzet.",
    badge: "Serinletici"
  }
];

export default function DemoBistroClient() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredMenu = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const showDemoToast = () => {
    setToastMessage("Bu bir konsept demo çalışmadır. Gerçek işletmeniz için benzer bir rezervasyon & sipariş sistemi kolayca entegre edilebilir.");
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* 1. ÜST KONSEPT DEMO BİLGİ BARI */}
      <div className="w-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border-b border-amber-500/30 py-2.5 px-4 text-center text-xs sm:text-sm text-amber-200 flex flex-wrap items-center justify-center gap-2 relative z-50">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Bu sayfa <strong>KvK Dijital Çözümler</strong> tarafından restoran & kafeler için hazırlanmış <strong>Konsept Demo</strong> projedir.</span>
        <Link 
          href="/#contact" 
          className="ml-2 font-bold underline hover:text-white transition-colors inline-flex items-center gap-1 text-white bg-amber-500/30 px-2.5 py-0.5 rounded-full"
        >
          İşletmeniz İçin Teklif Alın <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">Pendik Sahil Bistro</span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold block">Kahve & Mutfak</span>
            </div>
          </div>

          <nav aria-label="Demo Restoran Navigasyonu" className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#hero" className="hover:text-amber-400 transition-colors">Ana Sayfa</a>
            <a href="#menu" className="hover:text-amber-400 transition-colors">Menü</a>
            <a href="#features" className="hover:text-amber-400 transition-colors">Ayrıcalıklar</a>
            <a href="#hours" className="hover:text-amber-400 transition-colors">Saatler & Konum</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={showDemoToast}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Rezervasyon (Demo)</span>
            </button>
            <Link 
              href="/#contact"
              className="px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              Proje Teklifi Al
            </Link>
          </div>
        </div>
      </header>

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs leading-relaxed shadow-2xl backdrop-blur-xl animate-fade-in-up flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300 mb-1">Demo Bilgilendirmesi</p>
            <p>{toastMessage}</p>
          </div>
        </div>
      )}

      {/* 3. HERO SECTION */}
      <section id="hero" className="relative py-24 md:py-32 overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-[#07090e] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Pendik Sahil Konsept Mekan Çalışması
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
              Lezzetin ve Sohbetin <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Buluştuğu Yer.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Deniz manzarası eşliğinde taze demlenmiş nitelikli kahveler, şeflerimizin özel reçeteli lezzetleri ve huzurlu bistro atmosferi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href="#menu"
                className="px-8 py-4 rounded-full bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all flex items-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
              >
                <Utensils className="w-4 h-4" /> Menüyü İncele
              </a>
              <button 
                type="button"
                onClick={showDemoToast}
                className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer"
              >
                Masa Rezerve Et
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEMO MENÜ BÖLÜMÜ */}
      <section id="menu" className="py-20 bg-slate-950/50 border-y border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-2">Özel Lezzetlerimiz</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Örnek Bistro Menümüz</h2>
            <p className="text-slate-400 text-sm">Katkısız, taze ve yerel malzemelerle hazırlanan güncel menü çeşitlerimiz.</p>
          </div>

          {/* Menü Kategori Filtre Butonları */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12" role="group" aria-label="Menü Kategorileri">
            {[
              { id: "all", label: "Tümü" },
              { id: "kahvalti", label: "Kahvaltı" },
              { id: "burger", label: "Burger & Sandviç" },
              { id: "makarna", label: "Ana Yemek & Makarna" },
              { id: "tatli", label: "Tatlılar" },
              { id: "icecek", label: "İçecekler" },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as MenuCategory)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-lg shadow-amber-500/20"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menü Liste Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMenu.map(item => (
              <div 
                key={item.id}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">{item.name}</h3>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-amber-400 font-bold text-lg whitespace-nowrap">{item.price}</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SEKTÖREL AYRICALIKLAR */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Deniz Manzaralı Teras", desc: "Pendik sahil hattında ferah ve açık hava oturma alanı." },
              { title: "Nitelikli Çekirdekler", desc: "Dünyanın seçkin çiftliklerinden özenle kavrulmuş taze kahveler." },
              { title: "Taze & Günlük Üretim", desc: "Soslarımız, hamur işlerimiz ve tatlılarımız günlük hazırlanır." },
              { title: "Sıcak & Samimi Ortam", desc: "İş toplantıları ve keyifli sohbetler için ideal konfor." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  0{i + 1}
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ÇALIŞMA SAATLERİ & KONUM */}
      <section id="hours" className="py-20 bg-slate-950/60 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block">Ziyaret Edin</span>
              <h2 className="text-3xl font-bold text-white">Çalışma Saatlerimiz & Konum</h2>
              
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="block font-semibold text-white">Haftanın Her Günü</span>
                    <span className="text-xs text-slate-400">08:30 — 00:00 saatleri arası açık</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="block font-semibold text-white">Pendik Sahil Yolu</span>
                    <span className="text-xs text-slate-400">Pendik Marina Yanı, İstanbul (Örnek Konum)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 text-center space-y-6">
              <h3 className="text-2xl font-bold text-white">İşletmeniz İçin Özel Web Sitesi</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Restoran veya kafeniz için dijital menülü, hızlı ve mobil uyumlu böyle bir web sitesine sahip olmak ister misiniz?
              </p>
              <Link 
                href="/#contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
              >
                KvK Dijital'den Teklif Alın <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DEMO FOOTER */}
      <footer className="py-12 border-t border-white/10 bg-[#05060a]">
        <div className="container mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
            <span>Pendik Sahil Bistro & Kafe</span>
            <span>•</span>
            <span className="text-amber-400">Konsept Demo Çalışma</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            Bu sayfa <strong>KvK Dijital Çözümler</strong> tarafından restoran, kafe ve gastronomi sektöründeki işletmelere özel tasarım konseptini sergilemek amacıyla hazırlanmıştır. Gerçek müşteri verisi içermez.
          </p>
          <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">KvK Dijital Ana Sayfa</Link>
            <Link href="/projeler" className="hover:text-amber-400 transition-colors">Tüm Örnek Projeler</Link>
            <Link href="/#contact" className="hover:text-amber-400 transition-colors">İletişim & Teklif</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
