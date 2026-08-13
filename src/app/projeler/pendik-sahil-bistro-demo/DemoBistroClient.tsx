"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Utensils, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Info,
  Calendar,
  Sparkles
} from "lucide-react";

type MenuCategory = "all" | "kahvalti" | "burger" | "makarna" | "tatli" | "icecek";

interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: string;
  description: string;
  chefNote?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "m1",
    name: "Serpme Ege Kahvaltısı",
    category: "kahvalti",
    price: "450 ₺",
    description: "Ezine peyniri, Ayvalık kırma zeytin, ev yapımı reçeller, sıcak pişiler ve sınırsız çay ile.",
    chefNote: "Şefin Seçimi"
  },
  {
    id: "m2",
    name: "Avokado & Poşe Yumurta",
    category: "kahvalti",
    price: "240 ₺",
    description: "Ekşi maya ekmek üzerinde taze avokado püresi, poşe yumurta ve çöreotu süslemesi."
  },
  {
    id: "m3",
    name: "Gurme Kasap Burger",
    category: "burger",
    price: "320 ₺",
    description: "180gr özel kıyma köfte, karamelize soğan, cheddar peynir, trüflü mayonez ve baharatlı patates.",
    chefNote: "Özel Reçete"
  },
  {
    id: "m4",
    name: "Çıtır Tavuk Sandviç",
    category: "burger",
    price: "260 ₺",
    description: "Özel sosla marine edilmiş çıtır tavuk fileto, marul, turşu ve özel bistro sos."
  },
  {
    id: "m5",
    name: "Kremalı Trüflü Penne",
    category: "makarna",
    price: "290 ₺",
    description: "Taze kültür mantarı, trüf mantarı esansı, krema sosu ve parmesan rendesi."
  },
  {
    id: "m6",
    name: "Izgara Somon & Roka",
    category: "makarna",
    price: "420 ₺",
    description: "Taze ızgara somon fileto, kiraz domatesli roka salatası ve limonlu zeytinyağı sosu."
  },
  {
    id: "m7",
    name: "San Sebastian Cheesecake",
    category: "tatli",
    price: "180 ₺",
    description: "Akışkan kıvamlı karamelize İspanyol cheesecake'i, sıcak çikolata sosu ile.",
    chefNote: "Tatlı İmza"
  },
  {
    id: "m8",
    name: "Özel Blend Filtre Kahve",
    category: "icecek",
    price: "90 ₺",
    description: "%100 Arabica Etiyopya & Kolombiya harmanı taze çekilmiş kahve."
  }
];

export default function DemoBistroClient() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredMenu = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const showDemoToast = () => {
    setToastMessage("Bu bir konsept demo çalışmadır. Gerçek işletmeniz için benzer bir rezervasyon & sipariş sistemi entegre edilir.");
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1f1c19] flex flex-col font-sans selection:bg-[#b89562]/20 selection:text-[#1f1c19]">
      
      {/* 1. KONSEPT DEMO BARI */}
      <div className="w-full bg-[#1c1815] border-b border-[#36302a] py-2.5 px-4 text-center text-xs text-[#e8ded1] flex flex-wrap items-center justify-center gap-2 relative z-50">
        <Info className="w-4 h-4 text-[#c8a97e] shrink-0" />
        <span>Bu sayfa <strong>KvK Dijital Çözümler</strong> tarafından restoran & kafeler için hazırlanmış <strong>Konsept Demo Çalışma</strong>dır.</span>
        <Link 
          href="/#contact" 
          className="ml-2 font-semibold underline hover:text-white transition-colors inline-flex items-center gap-1 text-white bg-[#c8a97e]/20 px-2.5 py-0.5 rounded"
        >
          İşletmeniz İçin Teklif Alın <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e8e2d8]">
        <div className="container mx-auto px-6 h-22 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1f1c19]">Pendik Sahil</span>
            <span className="text-xs uppercase tracking-widest text-[#5a6b5c] font-semibold">Bistro & Mutfak</span>
          </div>

          <nav aria-label="Bistro Navigasyon" className="hidden lg:flex items-center gap-10 text-xs tracking-widest uppercase text-[#635d55]">
            <a href="#story" className="hover:text-[#1f1c19] transition-colors">Hikâyemiz</a>
            <a href="#menu" className="hover:text-[#1f1c19] transition-colors">Menüyü İncele</a>
            <a href="#signature" className="hover:text-[#1f1c19] transition-colors">Öne Çıkan Lezzetler</a>
            <a href="#atmosphere" className="hover:text-[#1f1c19] transition-colors">Mekan Atmosferi</a>
            <a href="#location" className="hover:text-[#1f1c19] transition-colors">Çalışma Saatleri</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={showDemoToast}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-[#d6cbba] text-[#1f1c19] text-xs hover:border-[#1f1c19] transition-all cursor-pointer font-serif italic"
            >
              <Calendar className="w-3.5 h-3.5 text-[#5a6b5c]" />
              <span>Masa Rezerve Et</span>
            </button>
            <Link 
              href="/#contact"
              className="px-5 py-2.5 rounded bg-[#1f1c19] text-[#faf8f5] font-semibold text-xs tracking-widest uppercase hover:bg-[#38332d] transition-all"
            >
              Teklif Al
            </Link>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded bg-[#1c1815] border border-[#c8a97e]/40 text-[#f4efe6] text-xs leading-relaxed shadow-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-[#c8a97e] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#c8a97e] mb-1">Demo Bilgilendirmesi</p>
            <p>{toastMessage}</p>
          </div>
        </div>
      )}

      {/* 3. ASİMETRİK SPIT HERO (EDITORIAL RESTAURANT LAYOUT) */}
      <section className="py-16 md:py-24 border-b border-[#e8e2d8] bg-[#f4efe6]/50 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Editorial Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#5a6b5c]/10 border border-[#5a6b5c]/30 text-[#4e5e50] text-xs tracking-widest uppercase font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Pendik Sahil Gastronomi Konsepti
              </div>
              
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#1f1c19] leading-[1.1]">
                Lezzetin, Deniz Manzarasıyla Buluştuğu <em className="italic font-serif text-[#b89562] font-normal">Rafine Nokta.</em>
              </h1>
              
              <p className="text-base sm:text-lg text-[#524d45] font-normal leading-relaxed max-w-2xl">
                Pendik sahil hattında taze demlenmiş nitelikli kahveler, şeflerimizin özel imza tarifleri ve zamansız bistro atmosferi.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-6">
                <a 
                  href="#menu"
                  className="px-8 py-4 rounded bg-[#1f1c19] text-[#faf8f5] font-bold text-xs tracking-widest uppercase hover:bg-[#38332d] transition-all inline-flex items-center gap-3 shadow-lg"
                >
                  <Utensils className="w-4 h-4 text-[#c8a97e]" /> Menüyü Keşfet
                </a>
                <div className="flex items-center gap-2 text-xs text-[#6e685f]">
                  <Clock className="w-4 h-4 text-[#5a6b5c]" />
                  <span>Haftanın Her Günü: 08:30 — 00:00</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Photography Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded border border-[#d6cbba] shadow-2xl bg-[#e8e2d8] h-[480px] overflow-hidden">
                <img 
                  src="/images/demos/pendik-bistro/hero.jpg" 
                  alt="Pendik Sahil Bistro sıcak akşam atmosferi ve ahşap masa düzeni"
                  className="w-full h-full object-cover"
                  loading="eager"
                  width={1000}
                  height={800}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c19]/90 via-transparent to-transparent p-8 flex flex-col justify-end">
                  <span className="font-serif italic text-[#f4efe6] text-xl">"Taze malzemeler, uzun sohbetler."</span>
                  <span className="text-xs text-[#c8a97e] tracking-widest uppercase mt-1">Pendik Sahil Yolu No: 42</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. STORY / PHILOSOPHY SECTION */}
      <section id="story" className="py-24 border-b border-[#e8e2d8] bg-[#faf8f5]">
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-6">
          <span className="text-[#5a6b5c] text-xs font-semibold tracking-widest uppercase block">Hikâyemiz</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1f1c19] leading-tight">
            Her Tabakta Doğallık, Her Yudumda Nitelikli Tat.
          </h2>
          <div className="w-16 h-0.5 bg-[#b89562]/60 mx-auto my-6" />
          <p className="text-base text-[#524d45] leading-relaxed max-w-2xl mx-auto">
            Hafta içi sabahlarında sakin bir filtre kahve molası, hafta sonlarında sevdiklerinizle uzayıp giden uzun kahvaltılar... Pendik Sahil Bistro; yerel malzemeleri modern sunumlarla buluşturan bağımsız bir gastronomi durağıdır.
          </p>
        </div>
      </section>

      {/* 5. GASTRONOMY MENU (AUTHENTIC RESTAURANT MENU LIST - NO CARDS) */}
      <section id="menu" className="py-24 border-b border-[#e8e2d8] bg-[#f4efe6]/30">
        <div className="container mx-auto px-6 max-w-5xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[#5a6b5c] text-xs font-semibold tracking-widest uppercase block mb-2">Güncel Seçenekler</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1f1c19] font-normal">Bistro Menümüz</h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Tüm Menü" },
                { id: "kahvalti", label: "Kahvaltı" },
                { id: "burger", label: "Burgerler" },
                { id: "makarna", label: "Makarna & Ana Yemek" },
                { id: "tatli", label: "Tatlılar" },
                { id: "icecek", label: "Kahve & İçecek" },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as MenuCategory)}
                  className={`px-4 py-2 text-xs font-medium tracking-wider uppercase border transition-all cursor-pointer rounded ${
                    activeCategory === cat.id
                      ? "bg-[#1f1c19] text-[#faf8f5] border-[#1f1c19] font-bold"
                      : "bg-[#faf8f5] border-[#d6cbba] text-[#524d45] hover:text-[#1f1c19]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Typography List Format */}
          <div className="space-y-8">
            {filteredMenu.map(item => (
              <div 
                key={item.id}
                className="pb-6 border-b border-[#d6cbba]/60 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 group"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-xl font-medium text-[#1f1c19] group-hover:text-[#b89562] transition-colors">
                      {item.name}
                    </h3>
                    {item.chefNote && (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#4e5e50] bg-[#5a6b5c]/10 px-2 py-0.5 rounded border border-[#5a6b5c]/20">
                        {item.chefNote}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6e685f] leading-relaxed">{item.description}</p>
                </div>
                <span className="font-serif text-xl font-bold text-[#b89562] whitespace-nowrap">{item.price}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. CHEF'S SIGNATURE FEATURE (SPLIT PHOTOGRAPHY + TEXT) */}
      <section id="signature" className="py-24 border-b border-[#e8e2d8] bg-[#faf8f5]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="h-[400px] rounded overflow-hidden border border-[#d6cbba] relative bg-[#e8e2d8]">
              <img 
                src="/images/demos/pendik-bistro/food-signature.jpg" 
                alt="Odun ateşinde pişirilmiş özel reçeteli taş fırın gurme lezzeti"
                className="w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>

            <div className="space-y-6">
              <span className="text-[#5a6b5c] text-xs font-semibold tracking-widest uppercase block">İmza Sunum</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1f1c19] font-normal">
                Taş Fırından Çıkan Taze Odun Ateşi Kokusu.
              </h2>
              <p className="text-sm text-[#524d45] leading-relaxed">
                Mayalanma süresi 48 saat olan özel ekşi mayalı hamurlarımız, İtalyan domates sosu ve yerel şarküteri lezzetleri ile odun ateşinde pişirilir.
              </p>
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={showDemoToast}
                  className="px-6 py-3 border border-[#1f1c19] text-[#1f1c19] text-xs uppercase tracking-widest font-semibold hover:bg-[#1f1c19] hover:text-[#faf8f5] transition-all cursor-pointer"
                >
                  Masa Rezerve Et (Demo)
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. ATMOSPHERE GALLERY */}
      <section id="atmosphere" className="py-24 border-b border-[#e8e2d8] bg-[#f4efe6]/40">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#5a6b5c] text-xs font-semibold tracking-widest uppercase block mb-2">Görsel Atmosfer</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1f1c19] font-normal">Mekan & Sunumlarımız</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="h-72 rounded overflow-hidden border border-[#d6cbba] relative group">
              <img 
                src="/images/demos/pendik-bistro/coffee.jpg" 
                alt="Nitelikli taze demlenmiş espresso ve filtre kahve sunumu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c19]/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="font-serif text-base text-[#faf8f5]">Nitelikli Kahve Terapisi</span>
              </div>
            </div>

            <div className="h-72 rounded overflow-hidden border border-[#d6cbba] relative group">
              <img 
                src="/images/demos/pendik-bistro/atmosphere.jpg" 
                alt="Bistro iç mekanında sıcak aydınlatma ve restoran masa düzeni"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c19]/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="font-serif text-base text-[#faf8f5]">Sıcak & Editorial Mekan</span>
              </div>
            </div>

            <div className="h-72 rounded overflow-hidden border border-[#d6cbba] relative group sm:col-span-2 lg:col-span-1">
              <img 
                src="/images/demos/pendik-bistro/food-signature.jpg" 
                alt="Taze malzemelerle hazırlanan günün lezzet tabağı"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c19]/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="font-serif text-base text-[#faf8f5]">Günlük Taze Gurme Lezzetler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. LOCATION & VISIT INFO */}
      <section id="location" className="py-24 border-b border-[#e8e2d8] bg-[#faf8f5]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-4">
              <span className="text-[#5a6b5c] text-xs font-semibold tracking-widest uppercase block">Ziyaret Saatleri</span>
              <h3 className="font-serif text-2xl text-[#1f1c19] font-normal">Açılış & Kapanış</h3>
              <p className="text-xs text-[#6e685f] leading-relaxed">
                Pazartesi — Pazar: 08:30 — 00:00 <br />
                Mutfak Son Sipariş: 23:00
              </p>
            </div>
            <div className="space-y-4">
              <span className="text-[#5a6b5c] text-xs font-semibold tracking-widest uppercase block">Konum & Ulaşım</span>
              <h3 className="font-serif text-2xl text-[#1f1c19] font-normal">Pendik Sahil Yolu</h3>
              <p className="text-xs text-[#6e685f] leading-relaxed">
                Pendik Marina Yanı, Sahil Kordonu No: 42 <br />
                Pendik / İstanbul (Konsept Örnek Adres)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. LEAD CONVERSION FOOTER */}
      <footer className="py-16 bg-[#1c1815] text-center space-y-6 text-[#f4efe6]">
        <div className="container mx-auto px-6 max-w-3xl space-y-6">
          <h2 className="font-serif text-3xl font-normal text-[#f4efe6]">
            Restoran veya Kafeniz İçin Böyle Bir Web Sitesi İster Misiniz?
          </h2>
          <p className="text-xs text-[#b5a999] max-w-xl mx-auto leading-relaxed">
            Bu sayfa <strong>KvK Dijital Çözümler</strong> ajansı tarafından restoran ve gastronomi işletmeleri için özel olarak tasarlanmış konsept çalışmadır. Gerçek işletme verisi içermez.
          </p>
          <div>
            <Link 
              href="/#contact"
              className="px-8 py-3.5 rounded bg-[#c8a97e] text-[#1c1815] font-bold text-xs tracking-widest uppercase hover:bg-[#d8b98e] transition-all inline-flex items-center gap-2"
            >
              KvK Dijital'den Teklif Alın <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="pt-8 border-t border-[#36302a] flex items-center justify-center gap-6 text-xs text-[#998d7e]">
            <Link href="/" className="hover:text-white transition-colors">KvK Ana Sayfa</Link>
            <Link href="/projeler" className="hover:text-white transition-colors">Tüm Örnek Projeler</Link>
            <Link href="/#contact" className="hover:text-white transition-colors">İletişim & Teklif</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
