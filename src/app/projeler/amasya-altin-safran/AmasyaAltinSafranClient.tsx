"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  FileText,
  ArrowRight,
  ChevronRight,
  Check,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sprout,
  Eye,
  X,
  Menu,
  BookOpen,
  Calendar,
  ExternalLink,
  Truck,
  HeartHandshake,
  Sparkles,
  MapPin,
  Mail
} from "lucide-react";

// ==========================================
// REAL SITE DATA ONLY (amasyaaltinsafran.com)
// ==========================================

interface Product {
  id: string;
  name: string;
  category: "baharat" | "sogan" | "gurme";
  categoryLabel: string;
  packageSize: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
}

const PRODUCTS: Product[] = [
  {
    id: "safran-baharati-1g",
    name: "Amasya Altın Safran - Safran Baharatı",
    category: "baharat",
    categoryLabel: "Saf Safran",
    packageSize: "1 Gram",
    price: 600,
    originalPrice: 1500,
    description: "Anadolu'nun bereketli topraklarında iyi tarım ilkeleriyle yetiştirilen, el ile toplanmış doğal ve %100 saf Amasya safranı.",
    imageUrl: "/images/amasya-altin-safran/products/safran-baharati-1g.jpg"
  },
  {
    id: "safran-sandik-seti-1g",
    name: "Safran Sandık Seti",
    category: "baharat",
    categoryLabel: "Özel Hediye Seti",
    packageSize: "1 Gram",
    price: 1600,
    originalPrice: 1750,
    description: "Özel el işçiliği motifli ahşap sandık muhafazası içerisinde sunulan 1 gram saf safran hediyelik seti.",
    imageUrl: "/images/amasya-altin-safran/products/safran-sandik-seti-1g.jpg"
  },
  {
    id: "safran-sogani-1kg",
    name: "Safran Soğanı",
    category: "sogan",
    categoryLabel: "Tohum & Yetiştiricilik",
    packageSize: "1 Kg",
    price: 4000,
    description: "T.C. Tarım ve Orman Bakanlığı tohum üretici belgesine sahip, yüksek verimli Crocus Sativus anaç safran soğanları.",
    imageUrl: "/images/amasya-altin-safran/products/safran-sogani-1kg.jpeg"
  },
  {
    id: "safran-sogani-adet",
    name: "Safran Soğanı Adet",
    category: "sogan",
    categoryLabel: "Tohum & Yetiştiricilik",
    packageSize: "16-24 gr aralığı",
    price: 75,
    description: "16-24 gram aralığında seçilmiş, doğrudan dikime ve çiçeklenmeye hazır damızlık safran yumrusu.",
    imageUrl: "/images/amasya-altin-safran/products/safran-sogani-adet.jpeg"
  },
  {
    id: "safranli-elma-sirkesi-250ml",
    name: "Safranlı Elma Sirkesi",
    category: "gurme",
    categoryLabel: "Doğal Ürünler",
    packageSize: "250 ml",
    price: 300,
    originalPrice: 350,
    description: "Amasya elmaları ve saf altın safranın geleneksel yöntemlerle fermente edilmesiyle üretilen doğal sirke.",
    imageUrl: "/images/amasya-altin-safran/products/safranli-elma-sirkesi.jpeg"
  },
  {
    id: "safranli-sultan-lokumu-350gr",
    name: "Safranlı Elma Aromalı Sultan Lokumu",
    category: "gurme",
    categoryLabel: "Doğal Ürünler",
    packageSize: "350 gr",
    price: 550,
    description: "Hakiki Amasya safranı ve elma aromasıyla geleneksel kazanlarda pişirilen sultan lokumu.",
    imageUrl: "/images/amasya-altin-safran/products/safranli-sultan-lokumu.jpeg"
  }
];

const CERTIFICATES = [
  {
    id: "analiz-raporu",
    title: "Muayene ve Analiz Raporu",
    code: "GIDA KONTROL LABORATUVARI",
    desc: "Yetkili laboratuvarlarca yapılan spektrofotometrik testlerde saflık, koku, tat ve renk değerlerinin tescil edildiği resmi analiz raporu.",
    authority: "T.C. Akredite Laboratuvar",
    pdfUrl: "https://www.amasyaaltinsafran.com/muayene-analiz-raporu.pdf"
  },
  {
    id: "orser-sertifikasi",
    title: "Orser Sertifikası",
    code: "TR-OT-011 İYİ TARIM",
    desc: "2021 yılında alınan Türkiye'nin bu alandaki ilk ve tek 'İyi Tarım Uygulamaları Safran Yetiştiriciliği Sertifikası'.",
    authority: "ORSER Kontrol ve Sertifikasyon",
    pdfUrl: "https://www.amasyaaltinsafran.com/orser-sertifikasi.pdf"
  },
  {
    id: "tohum-uretici-belgesi",
    title: "Tohum Üretici Belgesi",
    code: "T.C. TARIM VE ORMAN BAKANLIĞI",
    desc: "T.C. Tarım ve Orman Bakanlığı tarafından onaylı sertifikalı Crocus Sativus tohumluk ve soğan üretici resmi belgesi.",
    authority: "T.C. Tarım ve Orman Bakanlığı",
    pdfUrl: "https://www.amasyaaltinsafran.com/tohum-uretici-belgesi.pdf"
  }
];

const FOUR_PILLARS = [
  {
    title: "İyi Tarım Sertifikalı Üretim",
    desc: "Türkiye’nin ilk 'İyi Tarım Uygulamaları Sertifikalı' safran üreticisidir. Her aşamada doğaya ve insana saygılı üretim yapar.",
    icon: Award
  },
  {
    title: "Üstün Kalite & Saf Safran",
    desc: "El ile toplanan her bir safran çiçeği, yoğun aroma, renk ve koku değerleriyle kalite standartlarının üzerindedir.",
    icon: Sparkles
  },
  {
    title: "Tohum & Yetiştiricilik Desteği",
    desc: "Safran yetiştiriciliğine başlamak isteyen çiftçilere fide tedariki, eğitim ve üretim danışmanlığı desteği sağlıyoruz.",
    icon: Sprout
  },
  {
    title: "Güvenli & Hızlı Teslimat",
    desc: "Tüm Türkiye’ye kısa sürede, güvenli ambalajlarla gönderim yapıyoruz. Ürünleriniz doğallığını koruyarak elinize ulaşır.",
    icon: Truck
  }
];

export default function AmasyaAltinSafranClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "baharat" | "sogan" | "gurme">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCert, setSelectedCert] = useState<typeof CERTIFICATES[0] | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSubject, setQuoteSubject] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    intent: "Perakende Safran Siparişi",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const openQuoteFor = (subject: string) => {
    setQuoteSubject(subject);
    setFormData((prev) => ({ ...prev, intent: subject }));
    setQuoteModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const filteredProducts =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const whatsappUrl =
    "https://api.whatsapp.com/send?phone=905303019194&text=" +
    encodeURIComponent(
      "Merhaba Amasya Altın Safran, web siteniz üzerinden ürünleriniz ve tohum alım garantisi hakkında bilgi almak istiyorum."
    );

  return (
    <div className="min-h-screen bg-[#F5F6F7] text-[#39404A] font-sans antialiased selection:bg-[#7B2CBF] selection:text-white">
      
      {/* 0. KVK DIJITAL CONCEPT TOP BAR */}
      <div className="bg-[#1F242B] text-[#D1D5DB] border-b border-[#374151] py-2 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFB703] inline-block shrink-0" />
            <span className="font-bold text-white">KvK Dijital Çözümler</span>
            <span className="text-[#6B7280] hidden sm:inline">|</span>
            <span className="text-[#9CA3AF] hidden sm:inline font-sans">
              Amasya Altın Safran Kurumsal Web Tasarım Demosu
            </span>
          </div>
          <Link
            href="/projeler"
            className="inline-flex items-center gap-1 text-white hover:text-[#FFB703] font-sans font-semibold transition-colors shrink-0"
          >
            <span>Tüm Projeler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. ORIGINAL WELCOME TOP BAR */}
      <div className="bg-[#7B2CBF] text-white py-2 px-4 text-xs sm:text-sm font-medium text-center border-b border-[#6A1B9A]">
        <p>Amasya Altın Safran’a Hoş Geldiniz — Safranın Gerçek Lezzetiyle Tanışın!</p>
      </div>

      {/* 2. MAIN HEADER (FIXED NAVBAR OVERFLOW & CLEAN ALIGNMENT) */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E8E8E8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Real Logo from Site */}
            <Link href="#hero" className="flex items-center shrink-0">
              <img
                src="/images/amasya-altin-safran/logo.png"
                alt="Amasya Altın Safran Logo"
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              <a
                href="#hero"
                className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] transition-colors whitespace-nowrap"
              >
                Anasayfa
              </a>
              <a
                href="#hakkimizda"
                className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] transition-colors whitespace-nowrap"
              >
                Hakkımızda
              </a>
              <a
                href="#urunler"
                className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] transition-colors whitespace-nowrap"
              >
                Ürünlerimiz
              </a>
              <a
                href="#tohum-yetistiricilik"
                className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] transition-colors whitespace-nowrap"
              >
                Tohum & Yetiştiricilik
              </a>
              <a
                href="#belgeler"
                className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] transition-colors whitespace-nowrap"
              >
                Belgelerimiz
              </a>
              <a
                href="#blog"
                className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] transition-colors whitespace-nowrap"
              >
                Blog
              </a>
              <a
                href="#iletisim"
                className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] transition-colors whitespace-nowrap"
              >
                İletişim
              </a>
            </nav>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5 shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#E8F8F0] hover:bg-[#D1F2E2] text-[#11B76B] border border-[#B8ECD3] text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                title="WhatsApp İletişim Hattı"
              >
                <MessageSquare className="w-4 h-4 text-[#11B76B]" />
                <span>WhatsApp</span>
              </a>
              <button
                onClick={() => openQuoteFor("Sipariş & Bilgi Talebi")}
                className="px-4 py-2 rounded-lg bg-[#7B2CBF] hover:bg-[#6A1B9A] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              >
                Sipariş / Teklif Al
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-[#F5F6F7] text-[#39404A] border border-[#E8E8E8]"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E8E8E8] px-6 py-5 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-2.5">
              <a onClick={() => setMobileMenuOpen(false)} href="#hero" className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] py-1 border-b border-[#F5F6F7]">Anasayfa</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#hakkimizda" className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] py-1 border-b border-[#F5F6F7]">Hakkımızda</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#urunler" className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] py-1 border-b border-[#F5F6F7]">Ürünlerimiz</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#tohum-yetistiricilik" className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] py-1 border-b border-[#F5F6F7]">Tohum & Yetiştiricilik</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#belgeler" className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] py-1 border-b border-[#F5F6F7]">Belgelerimiz</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#blog" className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] py-1 border-b border-[#F5F6F7]">Blog</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#iletisim" className="text-sm font-bold text-[#39404A] hover:text-[#7B2CBF] py-1 border-b border-[#F5F6F7]">İletişim</a>
            </nav>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openQuoteFor("Mobil Menüden Sipariş");
                }}
                className="w-full py-2.5 rounded-lg bg-[#7B2CBF] text-white font-bold text-xs text-center"
              >
                Sipariş / Teklif Al
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-lg bg-[#E8F8F0] border border-[#B8ECD3] text-[#11B76B] font-bold text-xs text-center flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp İletişim Hattı</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO BANNER (SITE ORIGINAL COLOR GRADIENT: MOR -> ALTIN SARISI) */}
      <section id="hero" className="relative py-14 sm:py-20 bg-gradient-to-r from-[#7B2CBF]/15 via-[#FFFFFF] to-[#FFB703]/20 border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7B2CBF]/10 border border-[#7B2CBF]/30 text-[#7B2CBF] text-xs font-bold">
                <Award className="w-4 h-4 text-[#7B2CBF]" />
                <span>Türkiye'nin İlk İyi Tarım Sertifikalı Safran Üreticisi</span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#1E293B] tracking-tight leading-tight">
                Tohumdan Sofranıza – <br />
                <span className="text-[#7B2CBF]">Güven Bizimle Başlar</span>
              </h1>

              <p className="text-sm sm:text-base text-[#555555] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Amasya Altın Safran olarak, safran yolculuğunuzda en büyük destekçiniziz. Yüksek kalitedeki tohumlarımız ve tecrübemiz ile yüksek verimli hasat elde etmenizi hedefleriz. En büyük kaygı olan <strong>pazar bulma endişenizi gidermek</strong> için, tohumlarımızı bizden alan üreticilerimize ürün alımı konusunda destek sağlıyoruz.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#urunler"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#7B2CBF] hover:bg-[#6A1B9A] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Ürünleri İncele</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <a
                  href="#tohum-yetistiricilik"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white hover:bg-[#F5F6F7] text-[#39404A] font-bold text-sm border border-[#D1D5DB] flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Sprout className="w-4 h-4 text-[#11B76B]" />
                  <span>Tohum & Alım Garantisi</span>
                </a>
              </div>

              {/* Badges Bar */}
              <div className="pt-6 border-t border-[#E8E8E8] grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="border-l-2 border-[#7B2CBF] pl-3">
                  <div className="text-xl sm:text-2xl font-black text-[#7B2CBF]">%100 Saf</div>
                  <div className="text-xs text-[#777777] font-medium">Doğal Safran</div>
                </div>
                <div className="border-l-2 border-[#11B76B] pl-3">
                  <div className="text-xl sm:text-2xl font-black text-[#11B76B]">2021 Tescilli</div>
                  <div className="text-xs text-[#777777] font-medium">İyi Tarım Sertifikası</div>
                </div>
                <div className="border-l-2 border-[#FFB703] pl-3">
                  <div className="text-xl sm:text-2xl font-black text-[#D97706]">Sözleşmeli</div>
                  <div className="text-xs text-[#777777] font-medium">Alım Garantisi</div>
                </div>
              </div>

            </div>

            {/* Hero Right Banner Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white p-4 rounded-2xl border border-[#E8E8E8] shadow-md max-w-md w-full">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F6F7] flex items-center justify-center p-3">
                  <img
                    src="/images/amasya-altin-safran/products/safran-sandik-seti-1g.jpg"
                    alt="Amasya Altın Safran Sandık Seti"
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-[#7B2CBF] text-white px-2.5 py-1 rounded text-xs font-bold shadow">
                    %100 Doğal ve Saf
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-bold text-[#39404A]">Amasya Altın Safran - Özel Sandık Seti</h3>
                  <p className="text-xs text-[#777777] mt-0.5">El İşçiliği Sandık Muhafazasında 1 Gram Saf Safran</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. 4 PILLARS SECTION (EXACT TEXT FROM HAKKIMIZDA) */}
      <section id="hakkimizda" className="py-14 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
              Kalitemizi Doğadan, Gücümüzü Sürdürülebilir Tarımdan Alıyoruz
            </h2>
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
              Amasya Altın Safran, Anadolu’nun bereketli topraklarında iyi tarım ilkeleriyle yetiştirilen doğal ve saf safranı sizlerle buluşturan bir üretici markadır. 2021 yılında “İyi Tarım Uygulamaları Safran Yetiştiriciliği Sertifikası” alarak Türkiye’nin bu alandaki ilk ve tek sertifikalı üreticisi olmanın gururunu yaşıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FOUR_PILLARS.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#F8F9FA] border border-[#E8E8E8] hover:border-[#7B2CBF] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E8E8E8] text-[#7B2CBF] flex items-center justify-center shadow-sm">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#1E293B]">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. CERTIFICATES & RAPORLAR (REAL 3 PDF DOCUMENTS ON SITE) */}
      <section id="belgeler" className="py-14 bg-[#F5F6F7] border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-10 space-y-2">
            <span className="text-xs font-bold font-mono text-[#7B2CBF] uppercase tracking-wider">
              Tescil ve Raporlarımız
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
              Belge ve Sertifikalarımız
            </h2>
            <p className="text-xs sm:text-sm text-[#555555]">
              Üretimimizin her aşaması yetkili kurumlarca denetlenmekte ve belgelenmektedir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CERTIFICATES.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-xl bg-white border border-[#E8E8E8] hover:border-[#7B2CBF] transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F5F6F7]">
                    <div className="p-2 rounded-lg bg-[#7B2CBF]/10 text-[#7B2CBF]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#7B2CBF] font-mono">
                      {cert.code}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B]">{cert.title}</h3>
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                    {cert.desc}
                  </p>
                  <div className="text-xs text-[#777777] pt-1">
                    Onay: <span className="font-semibold text-[#39404A]">{cert.authority}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F5F6F7]">
                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-lg bg-[#F5F6F7] hover:bg-[#7B2CBF] hover:text-white text-[#39404A] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Resmi Belgeyi Görüntüle (PDF)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. PRODUCTS (ACCURATE REAL SITE PRODUCTS & PRICES) */}
      <section id="urunler" className="py-16 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold font-mono text-[#7B2CBF] uppercase tracking-wider">
                Doğal Safran Çözümleri
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B] mt-1">
                Ürünlerimiz
              </h2>
              <p className="text-xs sm:text-sm text-[#555555] mt-1">
                Tarladan sofraya fide, yumru ve baharat olarak üç temel ürün grubunda doğal safran çözümleri.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#F5F6F7] border border-[#E8E8E8]">
              {[
                { id: "all", label: "Tüm Ürünler" },
                { id: "baharat", label: "Safran Baharatı" },
                { id: "sogan", label: "Safran Soğanı" },
                { id: "gurme", label: "Doğal Ürünler" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    activeCategory === tab.id
                      ? "bg-[#7B2CBF] text-white"
                      : "text-[#555555] hover:text-[#39404A]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-[#E8E8E8] hover:border-[#7B2CBF] transition-all flex flex-col justify-between overflow-hidden shadow-sm group"
              >
                <div>
                  {/* Image Frame */}
                  <div className="relative aspect-[4/3] bg-[#F8F9FA] border-b border-[#E8E8E8] p-4 flex items-center justify-center">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#39404A] text-white text-[11px] font-bold">
                        {p.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-xs font-mono text-[#7B2CBF] font-bold block">{p.packageSize}</span>
                    <h3 className="text-base font-bold text-[#1E293B] leading-snug">{p.name}</h3>
                    <p className="text-xs text-[#555555] leading-relaxed">
                      {p.description}
                    </p>

                    {/* Exact Price */}
                    <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E8E8E8] flex items-baseline gap-2.5">
                      <span className="text-xl font-black text-[#1E293B]">
                        ₺ {p.price.toLocaleString("tr-TR")},00
                      </span>
                      {p.originalPrice && (
                        <del className="text-xs font-semibold text-[#888888]">
                          ₺ {p.originalPrice.toLocaleString("tr-TR")},00
                        </del>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-[#F5F6F7] gap-2">
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="px-3 py-2 rounded-lg bg-[#F5F6F7] hover:bg-[#E8E8E8] text-[#39404A] text-xs font-bold"
                  >
                    Detay
                  </button>
                  <button
                    onClick={() => openQuoteFor(p.name)}
                    className="px-4 py-2 rounded-lg bg-[#7B2CBF] hover:bg-[#6A1B9A] text-white text-xs font-bold transition-colors"
                  >
                    Sipariş Ver
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. TOHUM & YETİŞTİRİCİLİK & ALIM GARANTİSİ (EXACT REAL TEXT) */}
      <section id="tohum-yetistiricilik" className="py-16 bg-[#F5F6F7] border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11B76B]/10 text-[#11B76B] text-xs font-bold">
                  <Sprout className="w-4 h-4" />
                  <span>Üreticiye Alım Desteği</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
                  Tohum & Yetiştiricilik — Pazar Bulma Endişenize Son
                </h2>

                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                  Amasya Altın Safran olarak, safran yolculuğunuzda en büyük destekçiniziz. Yüksek kalitedeki tohumlarımız ve tecrübemiz ile yüksek verimli hasat elde etmenizi hedefleriz.
                </p>

                <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E8E8E8] text-xs sm:text-sm text-[#39404A] space-y-2">
                  <p>
                    <strong>Alım Taahhüdümüz:</strong> Tohumları Amasya Altın Safran'dan alan çiftçilerimizin hasat ettiği safran iplikçiklerini, şirketimiz güncel piyasa koşullarında ve kalite kontrolümüz sonrasında <strong>değerlendirip almayı taahhüt eder.</strong>
                  </p>
                  <p className="text-[#555555]">
                    Böylece, siz sadece en iyi ürünü yetiştirmeye odaklanırsınız, satış ve pazarlama sürecinde arkanızda güçlü bir destek olur.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => openQuoteFor("Tohum ve Alım Garantisi Danışmanlığı")}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#7B2CBF] hover:bg-[#6A1B9A] text-white text-xs font-bold"
                  >
                    Yetiştiricilik Programına Katıl
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#E8F8F0] border border-[#B8ECD3] text-[#11B76B] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Danışma Hattı</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="p-6 rounded-xl bg-[#F8F9FA] border border-[#E8E8E8] space-y-3 text-xs sm:text-sm">
                  <h3 className="font-bold text-[#1E293B] border-b border-[#E8E8E8] pb-2">
                    Safran Soğanları (Crocus Sativus) Avantajları
                  </h3>
                  <ul className="space-y-2 text-[#555555]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#11B76B] shrink-0" />
                      <span>Bakanlık onaylı tescilli tohum üretici garantisi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#11B76B] shrink-0" />
                      <span>16-24 gr çiçeklenme kabiliyeti yüksek damızlık kalibre</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#11B76B] shrink-0" />
                      <span>Eğitim, dikim ve bakım süreçlerinde teknik danışmanlık</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#11B76B] shrink-0" />
                      <span>Sözleşmeli mahsul alım güvencesi</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 8. BLOG (REAL BLOG CONTENT FROM SITE) */}
      <section id="blog" className="py-14 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-10 space-y-2">
            <span className="text-xs font-bold font-mono text-[#7B2CBF] uppercase tracking-wider">
              Bilgi ve Rehber
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
              Safran Hakkında Bilgiler
            </h2>
            <p className="text-xs sm:text-sm text-[#555555]">
              Safranın tarihi, kullanım alanları ve yetiştiricilik detayları.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-[#F8F9FA] rounded-xl border border-[#E8E8E8] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-full sm:w-48 h-36 bg-white rounded-lg overflow-hidden shrink-0 border border-[#E8E8E8]">
              <img
                src="/images/amasya-altin-safran/blog/safran-hasat-blog.jpg"
                alt="Safranın Tarihi"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#7B2CBF] font-mono">SAFRAN REHBERİ</span>
              <h3 className="text-base font-bold text-[#1E293B]">Dünyanın En Değerli Baharatı: Safran</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                Safran, dünyanın en pahalı baharatı olarak bilinir ve tarihi binlerce yıl öncesine dayanır. Antik medeniyetlerden günümüze uzanan yolculuğunda, sadece bir lezzet verici değil, aynı zamanda boya ve şifa kaynağı olarak da kullanılmıştır.
              </p>
              <button
                onClick={() => openQuoteFor("Safran Bilgi Talebi")}
                className="text-xs font-bold text-[#7B2CBF] hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Detaylı Bilgi Al</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 9. CONTACT & REAL ADDRESS INFO */}
      <section id="iletisim" className="py-16 bg-[#F5F6F7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 sm:p-10 shadow-sm space-y-6">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-bold font-mono text-[#7B2CBF] uppercase">Doğrudan İletişim</span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
                Bize Ulaşın
              </h2>
              <p className="text-xs sm:text-sm text-[#555555]">
                Siparişleriniz, toptan talepleriniz veya yetiştiricilik sorularınız için uzman ekibimiz daima yanınızda.
              </p>
            </div>

            {/* Direct Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E8E8E8]">
                <Phone className="w-5 h-5 text-[#7B2CBF] mx-auto mb-1.5" />
                <div className="text-xs font-bold text-[#39404A]">Bizi Arayın</div>
                <a href="tel:+905303019194" className="text-xs text-[#555555] hover:text-[#7B2CBF] font-semibold mt-1 block">
                  (+90) 530 301 91 94
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E8E8E8]">
                <Mail className="w-5 h-5 text-[#7B2CBF] mx-auto mb-1.5" />
                <div className="text-xs font-bold text-[#39404A]">E-posta</div>
                <a href="mailto:info@amasyaaltinsafran.com" className="text-xs text-[#555555] hover:text-[#7B2CBF] font-semibold mt-1 block">
                  info@amasyaaltinsafran.com
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E8E8E8]">
                <MapPin className="w-5 h-5 text-[#7B2CBF] mx-auto mb-1.5" />
                <div className="text-xs font-bold text-[#39404A]">Adres</div>
                <div className="text-xs text-[#555555] font-semibold mt-1">
                  Dere Mah. Özkan Yalçın Cad. No:11/D Merkez Amasya
                </div>
              </div>
            </div>

            {/* Simple Contact Form */}
            {formSubmitted ? (
              <div className="p-6 rounded-xl bg-[#E8F8F0] border border-[#B8ECD3] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#11B76B] mx-auto" />
                <h3 className="text-base font-bold text-[#1E293B]">Talebiniz Alındı</h3>
                <p className="text-xs text-[#555555]">
                  En kısa sürede belirttiğiniz iletişim kanalı üzerinden tarafınıza dönüş yapılacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3 pt-2 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="safran-fullname" className="block text-[#39404A] font-bold mb-1">Ad Soyad *</label>
                    <input
                      id="safran-fullname"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Adınız Soyadınız"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FA] border border-[#E8E8E8] text-[#39404A] focus:outline-none focus:border-[#7B2CBF]"
                    />
                  </div>
                  <div>
                    <label htmlFor="safran-phone" className="block text-[#39404A] font-bold mb-1">Telefon Numarası *</label>
                    <input
                      id="safran-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0530 000 00 00"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FA] border border-[#E8E8E8] text-[#39404A] focus:outline-none focus:border-[#7B2CBF]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="safran-intent" className="block text-[#39404A] font-bold mb-1">Talep Türü</label>
                  <select
                    id="safran-intent"
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FA] border border-[#E8E8E8] text-[#39404A] focus:outline-none focus:border-[#7B2CBF]"
                  >
                    <option value="Perakende Safran Siparişi">Perakende Safran Siparişi</option>
                    <option value="Toptan Safran Baharatı Alımı">Toptan Safran Baharatı Alımı</option>
                    <option value="Safran Soğanı & Alım Garantisi">Safran Soğanı & Alım Garantisi</option>
                    <option value="Genel Bilgi Talebi">Genel Bilgi Talebi</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="safran-message" className="block text-[#39404A] font-bold mb-1">Mesajınız / Notunuz</label>
                  <textarea
                    id="safran-message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Sipariş vermek istediğiniz miktar veya sorularınız..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FA] border border-[#E8E8E8] text-[#39404A] focus:outline-none focus:border-[#7B2CBF] resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3 rounded-lg bg-[#7B2CBF] hover:bg-[#6A1B9A] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    Mesajı Gönder
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#11B76B] hover:bg-[#0EA25E] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp'tan Yazın</span>
                  </a>
                </div>
              </form>
            )}

          </div>

        </div>
      </section>

      {/* 10. FOOTER (SITE REAL FOOTER INFO) */}
      <footer className="bg-[#1E242B] text-[#9CA3AF] text-xs pt-12 pb-8 border-t border-[#374151]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-[#374151]">
            
            <div className="space-y-3">
              <img
                src="/images/amasya-altin-safran/logo.png"
                alt="Amasya Altın Safran"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Amasya Altın Safran, doğallığın ve kalitenin birleştiği noktadır. Her tel safran, özenle seçilip sofralarınıza ulaştırılır.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Kurumsal</div>
              <ul className="space-y-1.5 text-[#D1D5DB]">
                <li><a href="#hakkimizda" className="hover:text-white">Hakkımızda</a></li>
                <li><a href="#urunler" className="hover:text-white">Ürünlerimiz</a></li>
                <li><a href="#tohum-yetistiricilik" className="hover:text-white">Tohum & Yetiştiricilik</a></li>
                <li><a href="#iletisim" className="hover:text-white">İletişim</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Belgelerimiz</div>
              <ul className="space-y-1.5 text-[#D1D5DB]">
                <li><a href="https://www.amasyaaltinsafran.com/muayene-analiz-raporu.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">Muayene ve Analiz Raporu</a></li>
                <li><a href="https://www.amasyaaltinsafran.com/orser-sertifikasi.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">Orser Sertifikası</a></li>
                <li><a href="https://www.amasyaaltinsafran.com/tohum-uretici-belgesi.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">Tohum Üretici Belgesi</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-xs">İletişim Bilgileri</div>
              <ul className="space-y-1.5 text-[#D1D5DB]">
                <li>Dere Mah. Özkan Yalçın Cad. No:11/D Merkez Amasya</li>
                <li>(+90) 530 301 91 94</li>
                <li>info@amasyaaltinsafran.com</li>
                <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#11B76B] hover:underline font-bold">WhatsApp İletişim</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
            <div>
              © {new Date().getFullYear()} Amasya Altın Safran — Tüm hakları saklıdır.
            </div>
            <div>
              Web Konsept: <Link href="/" className="text-[#D1D5DB] hover:text-white font-bold">KvK Dijital Çözümler</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <div>
                <span className="text-xs font-mono text-[#7B2CBF] font-bold">{selectedProduct.packageSize}</span>
                <h3 className="text-lg font-bold text-[#1E293B]">{selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg bg-[#F5F6F7] text-[#39404A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
              {selectedProduct.description}
            </p>

            <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E8E8E8] flex items-center justify-between">
              <span className="text-xs text-[#777777]">Fiyat</span>
              <span className="text-lg font-bold text-[#1E293B]">₺ {selectedProduct.price.toLocaleString("tr-TR")},00</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-lg bg-[#F5F6F7] text-[#39404A] text-xs font-bold"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  const pName = selectedProduct.name;
                  setSelectedProduct(null);
                  openQuoteFor(pName);
                }}
                className="px-4 py-2 rounded-lg bg-[#7B2CBF] text-white text-xs font-bold"
              >
                Sipariş Ver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK QUOTE MODAL */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">{quoteSubject || "Sipariş & Bilgi Talebi"}</h3>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#F5F6F7] text-[#39404A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#11B76B] mx-auto" />
                <h4 className="text-sm font-bold text-[#1E293B]">Talebiniz Alındı</h4>
                <p className="text-xs text-[#555555]">En kısa sürede dönüş yapılacaktır.</p>
                <button
                  onClick={() => {
                    setQuoteModalOpen(false);
                    setFormSubmitted(false);
                  }}
                  className="mt-2 px-4 py-1.5 rounded bg-[#7B2CBF] text-white text-xs font-bold"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="modal-safran-name" className="block font-bold text-[#39404A] mb-1">Ad Soyad *</label>
                  <input
                    id="modal-safran-name"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    className="w-full px-3 py-2 rounded bg-[#F8F9FA] border border-[#E8E8E8] text-[#39404A] focus:outline-none focus:border-[#7B2CBF]"
                  />
                </div>
                <div>
                  <label htmlFor="modal-safran-phone" className="block font-bold text-[#39404A] mb-1">Telefon / WhatsApp *</label>
                  <input
                    id="modal-safran-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0530 000 00 00"
                    className="w-full px-3 py-2 rounded bg-[#F8F9FA] border border-[#E8E8E8] text-[#39404A] focus:outline-none focus:border-[#7B2CBF]"
                  />
                </div>
                <div>
                  <label htmlFor="modal-safran-note" className="block font-bold text-[#39404A] mb-1">Not veya Adet</label>
                  <textarea
                    id="modal-safran-note"
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Sipariş adedi veya notunuz..."
                    className="w-full px-3 py-2 rounded bg-[#F8F9FA] border border-[#E8E8E8] text-[#39404A] focus:outline-none focus:border-[#7B2CBF] resize-none"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(false)}
                    className="px-3 py-2 rounded bg-[#F5F6F7] text-[#39404A] font-bold"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#7B2CBF] text-white font-bold"
                  >
                    Gönder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
