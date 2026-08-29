"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Award,
  FileText,
  ArrowRight,
  ChevronRight,
  Check,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShoppingBag,
  Heart,
  Sprout,
  Eye,
  Sun,
  X,
  Menu,
  Maximize2,
  BookOpen,
  Calendar,
  ExternalLink,
  Layers,
  Clock,
  Compass
} from "lucide-react";

// ==========================================
// DATA STRUCTURES
// ==========================================

interface Product {
  id: string;
  name: string;
  category: "safran" | "sogan" | "gurme";
  categoryLabel: string;
  packageSize: string;
  price: number;
  originalPrice?: number;
  description: string;
  highlights: string[];
  imageUrl: string;
  isPopular?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "safran-baharati-1g",
    name: "Amasya Altın Safran - Saf Safran Baharatı",
    category: "safran",
    categoryLabel: "Saf Safran",
    packageSize: "1 Gram Cam Şişe",
    price: 600,
    originalPrice: 1500,
    description: "Anadolu'nun bereketli topraklarında iyi tarım sertifikasıyla yetiştirilmiş, elle toplanmış ve gölgede kurutulmuş %100 saf 1. sınıf Amasya safranı.",
    highlights: [
      "I. Sınıf Kırmızı Stigma İplikçikleri",
      "Laboratuvar Analiz Onaylı Yüksek Krosetin Değeri",
      "Işık Geçirmez Cam Şişe Muhafazası",
      "Pilav, Tatlı ve Çaylar İçin Yoğun Aroma"
    ],
    imageUrl: "/images/amasya-altin-safran/products/safran-baharati-1g.jpg",
    isPopular: true
  },
  {
    id: "safran-sandik-seti-1g",
    name: "Özel Ahşap Sandık Hediyelik Safran Seti",
    category: "safran",
    categoryLabel: "Özel Hediye Seti",
    packageSize: "1 Gram + Ahşap Sandık",
    price: 1600,
    originalPrice: 1750,
    description: "Geleneksel el işçiliği motifli kadife kaplamalı ahşap sandık içerisinde, mantar tıpalı özel cam şişede sunulan prestijli safran seti.",
    highlights: [
      "El İşçiliği Özel Ahşap Koleksiyon Sandığı",
      "1 Gram %100 Saf Sertifikalı Amasya Safranı",
      "Prestijli Kurumsal ve Bireysel Hediye Formatı",
      "Orijinallik ve Analiz Belgesiyle Birlikte"
    ],
    imageUrl: "/images/amasya-altin-safran/products/safran-sandik-seti-1g.jpg",
    isPopular: true
  },
  {
    id: "safran-sogani-1kg",
    name: "Safran Soğanı (Damızlık / Toptan Dikim)",
    category: "sogan",
    categoryLabel: "Tohum & Yetiştiricilik",
    packageSize: "1 Kilogram (Toptan)",
    price: 4000,
    description: "T.C. Tarım Bakanlığı tohum üretici belgesine sahip, yüksek adaptasyon ve çiçeklenme kabiliyetli Crocus Sativus anaç safran soğanları.",
    highlights: [
      "T.C. Bakanlık Onaylı Tohum Üretici Belgesi",
      "Yüksek Çimlenme ve Çiçeklenme Verimi",
      "Sözleşmeli Alım Garantisi Kapsamında",
      "Ücretsiz Yetiştiricilik ve Bakım Danışmanlığı"
    ],
    imageUrl: "/images/amasya-altin-safran/products/safran-sogani-1kg.jpeg",
    isPopular: true
  },
  {
    id: "safran-sogani-adet",
    name: "Safran Soğanı (Adet Bazlı / 16-24 gr)",
    category: "sogan",
    categoryLabel: "Tohum & Yetiştiricilik",
    packageSize: "16-24 gr / Adet",
    price: 75,
    description: "Hobi bahçeleri, saksı dikimi veya butik parseller için seçilmiş iri kalibreli, ilk sezonda çiçek açmaya hazır damızlık safran yumrusu.",
    highlights: [
      "16-24 Gram İdeal Çiçeklenme Kalibresi",
      "Doğrudan Dikime Hazır Sağlıklı Yumru",
      "Hobi Bahçesi ve Balkon Dikimine Uygun",
      "Amasya İklimine Tam Uyumlu Anaç"
    ],
    imageUrl: "/images/amasya-altin-safran/products/safran-sogani-adet.jpeg"
  },
  {
    id: "safranli-elma-sirkesi-250ml",
    name: "Doğal Fermente Safranlı Elma Sirkesi",
    category: "gurme",
    categoryLabel: "Gurme Lezzetler",
    packageSize: "250 ml Cam Şişe",
    price: 300,
    originalPrice: 350,
    description: "Meşhur Amasya elmaları ve saf altın safranın geleneksel yöntemlerle meşe fıçılarda fermente edilmesiyle üretilen şifa kaynağı gurme sirke.",
    highlights: [
      "Coğrafi İşaretli Amasya Elmaları",
      "Saf Amasya Safranı Özütü",
      "Doğal Sirke Anası ile Katkısız Fermantasyon",
      "Salata, Sos ve Sağlık Kürleri İçin İdeal"
    ],
    imageUrl: "/images/amasya-altin-safran/products/safranli-elma-sirkesi.jpeg"
  },
  {
    id: "safranli-sultan-lokumu-350gr",
    name: "Safranlı Elma Aromalı Sultan Lokumu",
    category: "gurme",
    categoryLabel: "Gurme Lezzetler",
    packageSize: "350 Gram Kutu",
    price: 550,
    description: "Hakiki Amasya safranı ve doğal elma aromasıyla kazanlarda geleneksel reçeteyle kaynatılan, saray mutfağına layık sultan lokumu.",
    highlights: [
      "Gerçek Safran İplikçikleriyle Yoğrulmuş",
      "Glukoz Şurubu İçermez, Doğal Pancar Şekeri",
      "Yumuşak Doku ve İpeksi Damak Hissi",
      "Kahve Yanı ve Özel İkramlar İçin Mükemmel"
    ],
    imageUrl: "/images/amasya-altin-safran/products/safranli-sultan-lokumu.jpeg"
  }
];

const CERTIFICATES = [
  {
    id: "analiz-raporu",
    title: "Muayene ve Analiz Raporu",
    code: "LAB-ANALİZ / SAFLIK %100",
    desc: "Yetkili gıda laboratuvarları tarafından yapılan spektrofotometrik testlerde; renk gücü (krosetin), koku (safranal) ve tat (pikrokrosin) değerlerinin uluslararası 1. kalite standartlarında olduğu kanıtlanmıştır.",
    authority: "T.C. Akredite Gıda Kontrol Laboratuvarı",
    pdfUrl: "https://www.amasyaaltinsafran.com/muayene-analiz-raporu.pdf"
  },
  {
    id: "orser-sertifikasi",
    title: "Orser İyi Tarım Sertifikası",
    code: "TR-OT-011 / İYİ TARIM UYGULAMALARI",
    desc: "Kimyasal gübre ve zararlı pestisit kullanılmadan, toprağın biyolojik dengesine saygılı üretim yapıldığı ORSER denetim kurumu tarafından tescillenmiştir.",
    authority: "ORSER Kontrol ve Sertifikasyon Kuruluşu",
    pdfUrl: "https://www.amasyaaltinsafran.com/orser-sertifikasi.pdf"
  },
  {
    id: "tohum-uretici-belgesi",
    title: "Tohum Üretici Belgesi",
    code: "T.C. TARIM BAKANLIĞI TESCİLLİ",
    desc: "T.C. Tarım ve Orman Bakanlığı Bitkisel Üretim Genel Müdürlüğü onaylı sertifikalı Crocus Sativus tohumluk ve yumru üreticisi resmi sicil kaydı.",
    authority: "T.C. Tarım ve Orman Bakanlığı",
    pdfUrl: "https://www.amasyaaltinsafran.com/tohum-uretici-belgesi.pdf"
  }
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Ağustos Dikimi",
    subtitle: "Amasya'nın Verimli Toprakları",
    desc: "Safran soğanları Ağustos ayında drenajı yüksek, kireçli ve güneş alan özel Amasya topraklarına özenle dikilir."
  },
  {
    step: "02",
    title: "Şafak Vakti Hasat",
    subtitle: "Güneş Doğmadan Önce",
    desc: "Ekim-Kasım aylarında mor çiçekler açtığında, güneş ışığı aromayı uçurmadan önce sabah şafak vaktinde tek tek elle toplanır."
  },
  {
    step: "03",
    title: "Hassas Ayıklama",
    subtitle: "Yalnızca Kırmızı Stigmalar",
    desc: "Toplanan çiçeklerin içindeki 3 adet değerli kırmızı tepecik (stigma) kadın emeğiyle sarı kısımlardan ayrıştırılır."
  },
  {
    step: "04",
    title: "Gölgede Kurutma",
    subtitle: "Işık Geçirmez Muhafaza",
    desc: "Aroma ve etken maddelerini koruması için gölgede dinlendirilir; özel mühürlü cam tüplere ve ahşap sandıklara doldurulur."
  }
];

const BLOG_POSTS = [
  {
    id: "safranin-tarihi",
    title: "Dünyanın En Değerli Baharatı: Safranın Tarihi ve Amasya'daki Yeri",
    date: "14 Ocak 2025",
    desc: "Antik Mısır'dan Osmanlı saray mutfağına kadar binlerce yıldır kralların ve hekimlerin vazgeçilmezi olan safranın Anadolu'daki köklü yolculuğu.",
    category: "Tarih & Kültür",
    imageUrl: "/images/amasya-altin-safran/blog/safran-hasat-blog.jpg"
  },
  {
    id: "gercek-sahte-safran",
    title: "Gerçek Safran ile Sahte Safran Nasıl Ayırt Edilir? 4 Pratik Test",
    date: "08 Ocak 2025",
    desc: "Piyasada mısır püskülü veya boyalı liflerle karıştırılan sahtelere karşı ılık su testi, karbonat testi ve koku analizi ile saflık doğrulama rehberi.",
    category: "Tüketici Rehberi",
    imageUrl: "/images/amasya-altin-safran/products/safran-baharati-1g.jpg"
  },
  {
    id: "safran-yetistiriciligi",
    title: "1 Dönümde Safran Yetiştiriciliği: Karlılık, Bakım ve Hasat Dinamikleri",
    date: "22 Aralık 2024",
    desc: "Tohum tedariğinden toprak hazırlığına, sözleşmeli alım garantisi avantajlarından yıllık ürün getirisine kadar çiftçiler için eksiksiz rehber.",
    category: "Tohum & Tarım",
    imageUrl: "/images/amasya-altin-safran/products/safran-sogani-1kg.jpeg"
  }
];

export default function AmasyaAltinSafranClient() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "safran" | "sogan" | "gurme">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSubject, setQuoteSubject] = useState("");
  const [selectedCert, setSelectedCert] = useState<typeof CERTIFICATES[0] | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    intent: "Perakende Sipariş & Bilgi",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openQuoteFor = (subject: string) => {
    setQuoteSubject(subject);
    setFormData((prev) => ({ ...prev, intent: subject }));
    setQuoteModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const filteredProducts = activeCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  const whatsappUrl =
    "https://api.whatsapp.com/send?phone=905303019194&text=" +
    encodeURIComponent(
      "Merhaba Amasya Altın Safran, web siteniz üzerinden saf safran ürünleriniz ve tohum alım garantisi hakkında bilgi almak istiyorum."
    );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E1C] font-sans antialiased selection:bg-[#C2871A] selection:text-white">
      
      {/* 0. KVK DIJITAL CONCEPT BADGE TOP STRIP */}
      <div className="bg-[#1C1614] text-[#E8DCC9] border-b border-[#362A26] py-2.5 px-4 text-xs sm:text-sm font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C2871A] inline-block shrink-0 shadow-sm" />
            <span className="font-bold text-white">KvK Dijital Çözümler</span>
            <span className="text-[#6E574F] hidden md:inline">|</span>
            <span className="text-[#D8C7B0] hidden md:inline font-sans font-medium">
              Amasya Altın Safran Lüks Marka & E-Ticaret Web Tasarım Demosu
            </span>
          </div>
          <Link
            href="/projeler"
            className="inline-flex items-center gap-1.5 text-[#E8DCC9] hover:text-white font-sans font-semibold transition-colors shrink-0"
          >
            <span>Tüm Projeler</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 1. STANDALONE LUXURY HEADER */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "bg-[#FAF7F2]/98 backdrop-blur-md border-b border-[#E3D7C5] shadow-md py-3"
            : "bg-[#FAF7F2] border-b border-[#EDE3D3] py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="#hero" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-[#241E1C] text-[#C2871A] flex items-center justify-center border border-[#C2871A]/40 shadow-sm">
              <Sparkles className="w-5 h-5 text-[#C2871A]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#241E1C] font-serif">AMASYA</span>
                <span className="text-xl font-bold tracking-tight text-[#C2871A] font-serif">ALTIN SAFRAN</span>
              </div>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-[#7A6458] font-bold">
                T.C. Sertifikalı Doğal Safran
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6 2xl:gap-8">
            <a href="#hero" className="text-sm font-bold text-[#3B312E] hover:text-[#C2871A] uppercase tracking-wide transition-colors whitespace-nowrap">Ana Sayfa</a>
            <a href="#urunler" className="text-sm font-bold text-[#3B312E] hover:text-[#C2871A] uppercase tracking-wide transition-colors whitespace-nowrap">Ürünlerimiz</a>
            <a href="#sertifikalar" className="text-sm font-bold text-[#3B312E] hover:text-[#C2871A] uppercase tracking-wide transition-colors whitespace-nowrap">Sertifikalar</a>
            <a href="#tohum-yetistiricilik" className="text-sm font-bold text-[#3B312E] hover:text-[#C2871A] uppercase tracking-wide transition-colors whitespace-nowrap">Tohum & Alım Garantisi</a>
            <a href="#hikaye" className="text-sm font-bold text-[#3B312E] hover:text-[#C2871A] uppercase tracking-wide transition-colors whitespace-nowrap">Tarladan Sofraya</a>
            <a href="#blog" className="text-sm font-bold text-[#3B312E] hover:text-[#C2871A] uppercase tracking-wide transition-colors whitespace-nowrap">Bilgi & Blog</a>
            <a href="#iletisim" className="text-sm font-bold text-[#3B312E] hover:text-[#C2871A] uppercase tracking-wide transition-colors whitespace-nowrap">İletişim</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
              title="WhatsApp İletişim Hattı"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => openQuoteFor("Header Sipariş & Teklif")}
              className="px-5 py-2.5 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white text-xs sm:text-sm font-bold uppercase tracking-wider border border-[#B37812] transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              Sipariş & Teklif Al
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-lg bg-[#EFE6D8] border border-[#D9CBB7] text-[#241E1C]"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#FAF7F2] border-b border-[#E3D7C5] px-6 py-6 space-y-4 shadow-xl">
            <nav className="flex flex-col space-y-3">
              <a onClick={() => setMobileMenuOpen(false)} href="#hero" className="text-base font-bold text-[#241E1C] hover:text-[#C2871A] py-1 border-b border-[#EFE8DB]">Ana Sayfa</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#urunler" className="text-base font-bold text-[#241E1C] hover:text-[#C2871A] py-1 border-b border-[#EFE8DB]">Ürünlerimiz</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#sertifikalar" className="text-base font-bold text-[#241E1C] hover:text-[#C2871A] py-1 border-b border-[#EFE8DB]">Sertifikalar</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#tohum-yetistiricilik" className="text-base font-bold text-[#241E1C] hover:text-[#C2871A] py-1 border-b border-[#EFE8DB]">Tohum & Alım Garantisi</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#hikaye" className="text-base font-bold text-[#241E1C] hover:text-[#C2871A] py-1 border-b border-[#EFE8DB]">Tarladan Sofraya</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#blog" className="text-base font-bold text-[#241E1C] hover:text-[#C2871A] py-1 border-b border-[#EFE8DB]">Bilgi & Blog</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#iletisim" className="text-base font-bold text-[#241E1C] hover:text-[#C2871A] py-1 border-b border-[#EFE8DB]">İletişim</a>
            </nav>
            <div className="pt-3 border-t border-[#E3D7C5] flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openQuoteFor("Mobil Menü Siparişi");
                }}
                className="w-full py-3.5 rounded-lg bg-[#C2871A] text-white font-bold text-center text-sm uppercase tracking-wider shadow-sm"
              >
                Sipariş & Teklif Al
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-center text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <span>WhatsApp İletişim Hattı</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (HERITAGE LUXURY) */}
      <section id="hero" className="relative bg-[#201917] text-white py-16 lg:py-24 border-b border-[#3D302C] overflow-hidden">
        
        {/* Subtle Gold Filigree Radial Light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C2871A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#801824]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Luxury Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#C2871A]/15 border border-[#C2871A]/40 text-[#E5C98E] text-xs sm:text-sm font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-[#C2871A]" />
                <span>T.C. İyi Tarım Sertifikalı Saf Amasya Safranı</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white font-serif leading-[1.18]">
                Tohumdan Sofranıza <br />
                <span className="text-[#E5C98E]">Güven Bizimle Başlar.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-[#DCD1C0] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Amasya Altın Safran; Anadolu'nun kadim topraklarında iyi tarım ilkeleriyle saf safran yetiştirir, çiftçisine sertifikalı tohum ve <strong>alım garantisi</strong> sağlar, sofralara dünyanın en kıymetli baharatının en saf halini ulaştırır.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#urunler"
                  className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white font-extrabold text-sm uppercase tracking-wider border border-[#B37812] flex items-center justify-center gap-2.5 transition-colors shadow-lg"
                >
                  <span>Ürünleri İncele</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <a
                  href="#tohum-yetistiricilik"
                  className="w-full sm:w-auto px-7 py-4 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/25 flex items-center justify-center gap-2.5 transition-colors"
                >
                  <Sprout className="w-4 h-4 text-[#E5C98E]" />
                  <span>Tohum & Alım Garantisi</span>
                </a>
              </div>

              {/* Telemetry Strip */}
              <div className="pt-8 border-t border-white/15 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="border-l-2 border-[#C2871A] pl-3 sm:pl-4">
                  <div className="text-2xl sm:text-3xl font-black font-serif text-[#E5C98E]">%100 Saf</div>
                  <div className="text-xs sm:text-sm text-[#B3A495] mt-0.5 font-medium">Katkısız Stigma</div>
                </div>
                <div className="border-l-2 border-[#801824] pl-3 sm:pl-4">
                  <div className="text-2xl sm:text-3xl font-black font-serif text-white">İyi Tarım</div>
                  <div className="text-xs sm:text-sm text-[#B3A495] mt-0.5 font-medium">Resmi Sertifikalı</div>
                </div>
                <div className="border-l-2 border-[#C2871A] pl-3 sm:pl-4">
                  <div className="text-2xl sm:text-3xl font-black font-serif text-white">Sözleşmeli</div>
                  <div className="text-xs sm:text-sm text-[#B3A495] mt-0.5 font-medium">Alım Garantili</div>
                </div>
              </div>

            </div>

            {/* Right Luxury Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-[#2A211E] rounded-2xl border border-[#4A3B35] p-4 sm:p-5 shadow-2xl">
                
                <div className="relative aspect-[4/3] rounded-xl bg-[#FAF7F2] overflow-hidden border border-[#59463F] p-4 flex items-center justify-center">
                  <img
                    src="/images/amasya-altin-safran/products/safran-sandik-seti-1g.jpg"
                    alt="Amasya Altın Safran Özel Ahşap Sandık Hediyelik Safran Seti"
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-[#801824] text-white px-3 py-1 rounded-full text-xs font-bold font-serif shadow-md">
                    1. Kalite Saf Safran
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-[#1C1614]/95 border-t border-[#3D302C] p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#E5C98E] font-bold font-serif uppercase block">ÖZEL SANDIK HEDİYE SETİ</span>
                      <span className="text-sm font-bold text-white">1 Gram Saf Safran + El İşçiliği Sandık</span>
                    </div>
                    <button
                      onClick={() => openQuoteFor("Safran Sandık Seti (Hero)")}
                      className="px-3.5 py-1.5 rounded bg-[#C2871A] hover:bg-[#A87212] text-white font-bold text-xs"
                    >
                      İncele
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm text-[#DCD1C0]">
                  <div className="p-3 rounded-lg bg-[#201917] border border-[#3D302C] flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#C2871A] shrink-0" />
                    <span>Laboratuvar Onaylı</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#201917] border border-[#3D302C] flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#C2871A] shrink-0" />
                    <span>Ücretsiz Kargo</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TRUST & CERTIFICATION STRIP (THE BIGGEST CREDIBILITY UPGRADE) */}
      <section id="sertifikalar" className="bg-[#FFFFFF] border-b border-[#EAE0D0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7EEDB] border border-[#E5C98E] text-[#8C6010] text-xs font-bold font-mono uppercase">
              <Award className="w-4 h-4 text-[#C2871A]" />
              <span>Resmi Belge & Tescilli Kalite</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#241E1C] font-serif tracking-tight">
              Belgeli ve Tescilli %100 Saflık Güvencesi
            </h2>
            <p className="text-sm sm:text-base text-[#6E574F] leading-relaxed font-medium">
              Amasya Altın Safran; tarladan laboratuvara kadar her aşaması devlet kurumları ve bağımsız sertifikasyon kuruluşlarınca denetlenen Türkiye'nin tescilli üreticisidir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CERTIFICATES.map((cert) => (
              <div
                key={cert.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#FAF7F2] border border-[#E3D7C5] hover:border-[#C2871A] transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE0D0] pb-3">
                    <div className="p-2.5 rounded-xl bg-[#F7EEDB] text-[#C2871A] border border-[#E5C98E]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#801824] bg-[#F9EBEB] px-2.5 py-1 rounded border border-[#D98A94]">
                      RESMİ RAPOR
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#241E1C] font-serif">{cert.title}</h3>
                    <span className="text-xs font-mono text-[#8C6010] font-semibold block mt-0.5">{cert.code}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5C4A42] leading-relaxed font-medium">
                    {cert.desc}
                  </p>

                  <div className="text-[11px] text-[#7A6458] font-semibold border-t border-[#EAE0D0] pt-2">
                    Onaylayan Makam: <span className="text-[#241E1C]">{cert.authority}</span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[#EAE0D0]">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="w-full py-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7EEDB] text-[#8C6010] hover:text-[#241E1C] font-bold text-xs sm:text-sm border border-[#D9CBB7] flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4 text-[#C2871A]" />
                    <span>Belge Detayını Görüntüle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. PRODUCT CATEGORIES (TOPTAN & PERAKENDE) */}
      <section className="py-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Wholesale Category Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#FFFFFF] border border-[#E3D7C5] flex flex-col justify-between shadow-sm hover:border-[#C2871A] transition-all">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9EBEB] text-[#801824] text-xs font-bold font-mono uppercase">
                  <span>Kurumsal & B2B Çözümler</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#241E1C] font-serif">
                  Toptan Safran & Soğan Temini
                </h3>
                <p className="text-sm sm:text-base text-[#5C4A42] leading-relaxed font-medium">
                  Gıda üreticileri, restoran zincirleri, gurme şefler, aktarlar ve ihracatçılar için kilogram bazlı toptan safran baharatı; çiftçiler ve yatırımcılar için tonluk sertifikalı tohum soğanları.
                </p>
                <ul className="space-y-2 pt-2 text-xs sm:text-sm text-[#3B312E] font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C2871A]" />
                    <span>Kilogramlık mühürlü ambalajlarda toptan safran baharatı</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C2871A]" />
                    <span>Dönüm hesabı anaç tohum temini ve ekim danışmanlığı</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C2871A]" />
                    <span>Sözleşmeli mahsul alım garantisi modeli</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#EDE3D3] flex items-center justify-between">
                <button
                  onClick={() => openQuoteFor("Toptan Safran & Soğan Talebi")}
                  className="px-6 py-3 rounded-lg bg-[#241E1C] hover:bg-[#3D302C] text-white font-bold text-xs sm:text-sm uppercase tracking-wider"
                >
                  Toptan Fiyat & Teklif İste
                </button>
                <span className="text-xs font-mono text-[#8C6010] font-bold">Minimum 1 Kg Soğan / 50g Safran</span>
              </div>
            </div>

            {/* Retail Category Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#FFFFFF] border border-[#E3D7C5] flex flex-col justify-between shadow-sm hover:border-[#C2871A] transition-all">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7EEDB] text-[#8C6010] text-xs font-bold font-mono uppercase">
                  <span>Perakende & Gurme Hediyelik</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#241E1C] font-serif">
                  Perakende Safran Ürünleri
                </h3>
                <p className="text-sm sm:text-base text-[#5C4A42] leading-relaxed font-medium">
                  Sofranıza eşsiz lezzet katacak 1 gramlık safran cam tüpleri, el işçiliği ahşap sandık setleri, fermente elma sirkesi ve geleneksel safranlı sultan lokumu çeşitlerimiz.
                </p>
                <ul className="space-y-2 pt-2 text-xs sm:text-sm text-[#3B312E] font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C2871A]" />
                    <span>1 Gramlık ışık geçirmez cam korumalı ambalajlar</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C2871A]" />
                    <span>Özel ahşap sandıklı prestij hediye setleri</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C2871A]" />
                    <span>Doğal fermente safranlı sirke ve lokum lezzetleri</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#EDE3D3] flex items-center justify-between">
                <a
                  href="#urunler"
                  className="px-6 py-3 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white font-bold text-xs sm:text-sm uppercase tracking-wider"
                >
                  Ürünleri Sipariş Et
                </a>
                <span className="text-xs font-mono text-emerald-800 font-bold">Aynı Gün Hızlı Kargo</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. FEATURED PRODUCTS (ACCURATE PRICES & FILTER TABS) */}
      <section id="urunler" className="py-20 bg-[#FFFFFF] border-y border-[#EAE0D0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7EEDB] border border-[#E5C98E] text-[#8C6010] text-xs font-bold font-mono uppercase">
                Özel Koleksiyon
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#241E1C] font-serif tracking-tight">
                Öne Çıkan Safran Ürünlerimiz
              </h2>
              <p className="text-sm sm:text-base text-[#6E574F] leading-relaxed font-medium">
                Doğrudan Amasya tarlalarımızdan toplanan saf safran baharatı, tohumluk damızlık soğanlar ve doğal safranlı gurme lezzetler.
              </p>
            </div>

            {/* Category Filter Tabs with Proper Working Logic */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[#FAF7F2] border border-[#E3D7C5]">
              {[
                { id: "all", label: "Tüm Ürünler" },
                { id: "safran", label: "Saf Safran" },
                { id: "sogan", label: "Tohum & Soğan" },
                { id: "gurme", label: "Gurme Lezzetler" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? "bg-[#C2871A] text-white shadow-sm"
                      : "text-[#5C4A42] hover:text-[#241E1C] hover:bg-[#EDE3D3]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-[#FAF7F2] rounded-2xl border border-[#E3D7C5] overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C2871A] transition-all group"
              >
                <div>
                  {/* Photo Frame */}
                  <div className="relative aspect-[4/3] bg-white border-b border-[#EAE0D0] p-6 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#241E1C] text-white text-[11px] font-bold font-mono">
                        {p.categoryLabel}
                      </span>
                    </div>
                    {p.originalPrice && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#801824] text-white text-[11px] font-bold font-mono">
                          Avantajlı Fiyat
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-7 space-y-4">
                    <div>
                      <span className="text-xs font-mono text-[#8C6010] font-bold block">{p.packageSize}</span>
                      <h3 className="text-lg sm:text-xl font-bold text-[#241E1C] font-serif mt-1 leading-snug">{p.name}</h3>
                      <p className="text-xs sm:text-sm text-[#5C4A42] mt-2 leading-relaxed font-medium">
                        {p.description}
                      </p>
                    </div>

                    {/* Verified Accurate Pricing */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#EAE0D0] flex items-baseline gap-3">
                      <span className="text-2xl font-black text-[#241E1C] font-serif">
                        ₺ {p.price.toLocaleString("tr-TR")},00
                      </span>
                      {p.originalPrice && (
                        <del className="text-sm font-semibold text-[#A89689]">
                          ₺ {p.originalPrice.toLocaleString("tr-TR")},00
                        </del>
                      )}
                    </div>

                    {/* Highlights */}
                    <ul className="space-y-1.5 text-xs text-[#3B312E] font-medium">
                      {p.highlights.slice(0, 3).map((h, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#C2871A] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 sm:p-7 pt-0 flex items-center justify-between border-t border-[#EAE0D0] gap-3">
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-[#F7EEDB] text-[#241E1C] text-xs sm:text-sm font-bold border border-[#D9CBB7]"
                  >
                    Detaylı İncele
                  </button>
                  <button
                    onClick={() => openQuoteFor(p.name)}
                    className="px-5 py-2.5 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm"
                  >
                    Sipariş Ver
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. TOHUM & YETİŞTİRİCİLİK (SEED & BUYBACK GUARANTEE PARTNERSHIP) */}
      <section id="tohum-yetistiricilik" className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#241E1C] text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#4A3B35] shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#C2871A]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C2871A]/20 border border-[#C2871A]/40 text-[#E5C98E] text-xs sm:text-sm font-mono font-bold uppercase">
                  <Sprout className="w-4 h-4 text-[#C2871A]" />
                  <span>Sözleşmeli Tarım Modeli</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black font-serif text-white tracking-tight leading-tight">
                  Tohum Bizden, Emeğiniz Sizden: <br />
                  <span className="text-[#E5C98E]">Mahsul Alım Garantisi</span>
                </h2>

                <p className="text-base sm:text-lg text-[#DCD1C0] leading-relaxed font-normal">
                  Safran yetiştiriciliğine adım atmak isteyen çiftçilerimizin en büyük kaygısı olan <strong>"Ürünümü kime satacağım?"</strong> endişesini ortadan kaldırıyoruz. Tohumunu bizden alan tüm üreticilerimizin hasat ettiği safranı sözleşmeli olarak güncel piyasa değerinde satın almayı taahhüt ediyoruz.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#1C1614] border border-[#3D302C]">
                    <div className="text-base font-bold text-[#E5C98E] font-serif">1. Kalite Anaç Soğan</div>
                    <p className="text-xs sm:text-sm text-[#B3A495] mt-1 leading-normal">
                      Bakanlık tescilli, hastalıktan ari ve ilk sezonda çiçeklenme garantili 16-24 gr kalibre yumrular.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1C1614] border border-[#3D302C]">
                    <div className="text-base font-bold text-[#E5C98E] font-serif">Kesin Alım Taahhüdü</div>
                    <p className="text-xs sm:text-sm text-[#B3A495] mt-1 leading-normal">
                      Kalite kontrolümüz sonrasında hasat ettiğiniz tüm kuru stigmaları nakit olarak alıyoruz.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1C1614] border border-[#3D302C]">
                    <div className="text-base font-bold text-[#E5C98E] font-serif">Teknik Danışmanlık</div>
                    <p className="text-xs sm:text-sm text-[#B3A495] mt-1 leading-normal">
                      Toprak analizi, dikim derinliği, sulama ve ayıklama sürecinde ziraat mühendislerimiz yanınızda.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1C1614] border border-[#3D302C]">
                    <div className="text-base font-bold text-[#E5C98E] font-serif">Yüksek Hektar Getirisi</div>
                    <p className="text-xs sm:text-sm text-[#B3A495] mt-1 leading-normal">
                      Geleneksel tarım ürünlerine kıyasla metrekare başına katbekat yüksek katma değerli gelir.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => openQuoteFor("Tohum Yetiştiricilik & Alım Garantisi Başvurusu")}
                    className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg"
                  >
                    Yetiştiricilik Programına Katıl
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-4 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Ziraat Danışmanıyla Konuş</span>
                  </a>
                </div>

              </div>

              <div className="lg:col-span-5">
                <div className="bg-[#1C1614] rounded-2xl border border-[#3D302C] p-6 sm:p-8 space-y-6">
                  <h3 className="text-xl font-bold font-serif text-white border-b border-[#3D302C] pb-4">
                    1 Dönüm İçin Örnek Projeksiyon
                  </h3>
                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="flex items-center justify-between border-b border-[#2D2320] pb-2">
                      <span className="text-[#B3A495]">Gerekli Soğan Miktarı</span>
                      <span className="font-bold text-white font-mono">250 - 300 Kg</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#2D2320] pb-2">
                      <span className="text-[#B3A495]">Dikim Dönemi</span>
                      <span className="font-bold text-[#E5C98E]">Ağustos - Eylül</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#2D2320] pb-2">
                      <span className="text-[#B3A495]">İlk Hasat Zamanı</span>
                      <span className="font-bold text-[#E5C98E]">Ekim - Kasım (Dikimden 2 ay sonra)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#2D2320] pb-2">
                      <span className="text-[#B3A495]">Soğan Çoğalma Oranı</span>
                      <span className="font-bold text-white font-mono">Yılda 1'e 3 Kat Çoğalma</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#2D2320] pb-2">
                      <span className="text-[#B3A495]">Alım Güvencesi</span>
                      <span className="font-bold text-emerald-400">%100 Sözleşmeli Taahhüt</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#A89689] leading-relaxed">
                    * Safran soğanları toprakta kaldığı her yıl çoğalarak 3. yılın sonunda anaç soğan sayınızı üçe katlar. Hem baharat hem de soğan satışından çift taraflı kazanç sağlanır.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. THE SAFFRON STORY / PROCESS (TARLADAN SOFRAYA) */}
      <section id="hikaye" className="py-20 bg-[#FFFFFF] border-b border-[#EAE0D0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7EEDB] border border-[#E5C98E] text-[#8C6010] text-xs font-bold font-mono uppercase">
              Emek ve Zarafet
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#241E1C] font-serif tracking-tight">
              Tarladan Sofraya: Kırmızı Altının Yolculuğu
            </h2>
            <p className="text-sm sm:text-base text-[#6E574F] leading-relaxed font-medium">
              1 kilogram kuru safran elde etmek için yaklaşık 150.000 çiçek şafak vaktinde tek tek elle toplanır. Safranı dünyanın en değerli baharatı kılan bu eşsiz emektir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-[#FAF7F2] border border-[#E3D7C5] relative shadow-sm hover:border-[#C2871A] transition-all"
              >
                <span className="text-4xl font-black font-serif text-[#C2871A]/30 block mb-3">
                  {step.step}
                </span>
                <h3 className="text-xl font-bold text-[#241E1C] font-serif">{step.title}</h3>
                <span className="text-xs font-mono text-[#8C6010] font-bold block mt-0.5 mb-2">{step.subtitle}</span>
                <p className="text-xs sm:text-sm text-[#5C4A42] leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. BLOG / BİLGİ HIGHLIGHTS */}
      <section id="blog" className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7EEDB] border border-[#E5C98E] text-[#8C6010] text-xs font-bold font-mono uppercase">
                Uzman Rehberleri
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#241E1C] font-serif tracking-tight">
                Safran Hakkında Bilmeniz Gerekenler
              </h2>
              <p className="text-sm sm:text-base text-[#6E574F] leading-relaxed font-medium">
                Safranın şifalı özellikleri, yetiştiricilik püf noktaları ve mutfaktaki doğru kullanım teknikleri.
              </p>
            </div>
            <div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-lg bg-white hover:bg-[#F7EEDB] text-[#241E1C] border border-[#D9CBB7] text-xs sm:text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-[#C2871A]" />
                <span>Tüm Makaleler</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BLOG_POSTS.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-[#E3D7C5] overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C2871A] transition-all"
              >
                <div>
                  <div className="aspect-[16/10] bg-[#FAF7F2] border-b border-[#EAE0D0] overflow-hidden">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 sm:p-7 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#7A6458]">
                      <span className="font-mono font-bold text-[#801824] bg-[#F9EBEB] px-2.5 py-0.5 rounded-full">{b.category}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#241E1C] font-serif leading-snug">{b.title}</h3>
                    <p className="text-xs sm:text-sm text-[#5C4A42] leading-relaxed font-medium">
                      {b.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-7 pt-0 border-t border-[#EAE0D0]">
                  <button
                    onClick={() => openQuoteFor(`Blog Danışma: ${b.title}`)}
                    className="text-xs sm:text-sm font-bold text-[#8C6010] hover:text-[#241E1C] inline-flex items-center gap-1.5"
                  >
                    <span>Yazının Tamamını Oku & Bilgi Al</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. FINAL CTA (CONVERSION SECTION) */}
      <section id="iletisim" className="py-20 bg-[#201917] text-white border-t border-[#3D302C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#2A211E] rounded-3xl border border-[#4A3B35] p-8 sm:p-12 space-y-8 shadow-2xl">
            
            <div className="text-center max-w-xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2871A]/20 text-[#E5C98E] text-xs font-mono uppercase font-bold">
                Doğrudan Üreticiden Temin
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
                Safranın Gerçek Lezzeti ve Şifasıyla Tanışın.
              </h2>
              <p className="text-sm sm:text-base text-[#DCD1C0] leading-relaxed font-medium">
                Gerek perakende mutfak ihtiyaçlarınız, gerek toptan siparişleriniz veya tohum yetiştiriciliği danışmanlığı için bize anında ulaşın.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">Talebiniz Alındı</h3>
                <p className="text-sm text-[#DCD1C0] leading-relaxed">
                  Amasya Altın Safran uzman ekibimiz belirttiğiniz telefon numarası üzerinden en kısa sürede sizinle iletişime geçecektir.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-4 px-5 py-2 rounded-lg bg-white/10 text-xs sm:text-sm font-bold text-white hover:bg-white/20"
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 max-w-xl mx-auto text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="safran-fullname" className="block text-[#E5C98E] font-bold mb-1.5">Ad Soyad *</label>
                    <input
                      id="safran-fullname"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Ahmet Yılmaz"
                      className="w-full px-4 py-3 rounded-lg bg-[#1C1614] border border-[#4A3B35] text-white placeholder:text-[#7A6458] focus:outline-none focus:border-[#C2871A] text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="safran-phone" className="block text-[#E5C98E] font-bold mb-1.5">Telefon / WhatsApp *</label>
                    <input
                      id="safran-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0530 000 00 00"
                      className="w-full px-4 py-3 rounded-lg bg-[#1C1614] border border-[#4A3B35] text-white placeholder:text-[#7A6458] focus:outline-none focus:border-[#C2871A] text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="safran-intent" className="block text-[#E5C98E] font-bold mb-1.5">İlgi Alanınız / Talep Türü</label>
                  <select
                    id="safran-intent"
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#1C1614] border border-[#4A3B35] text-white focus:outline-none focus:border-[#C2871A] text-sm sm:text-base"
                  >
                    <option value="Perakende Sipariş & Bilgi">Perakende Safran Siparişi (1g Şişe / Sandık Seti)</option>
                    <option value="Toptan Safran Baharatı Talebi">Toptan Safran Baharatı Alımı (Gram / Kg)</option>
                    <option value="Tohumluk Safran Soğanı & Alım Garantisi">Tohumluk Safran Soğanı & Sözleşmeli Alım Garantisi</option>
                    <option value="Gurme Ürünler (Sirke / Lokum)">Gurme Ürünler (Safranlı Sirke / Lokum)</option>
                    <option value="Genel Bilgi ve Danışmanlık">Genel Bilgi ve Danışmanlık</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="safran-message" className="block text-[#E5C98E] font-bold mb-1.5">Notunuz veya Sipariş Detayınız</label>
                  <textarea
                    id="safran-message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Örn: 2 adet 1 gram safran sandık seti siparişi vermek veya 1 dönüm ekim için tohum fiyatı almak istiyorum."
                    className="w-full px-4 py-3 rounded-lg bg-[#1C1614] border border-[#4A3B35] text-white placeholder:text-[#7A6458] focus:outline-none focus:border-[#C2871A] resize-none text-sm sm:text-base leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-4 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white font-black text-sm uppercase tracking-wider border border-[#B37812] transition-colors cursor-pointer shadow-lg"
                  >
                    Talebi İlet
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp'tan Ulaş</span>
                  </a>
                </div>
              </form>
            )}

          </div>

        </div>
      </section>

      {/* 10. STANDALONE LUXURY FOOTER */}
      <footer className="bg-[#15100E] text-[#B3A495] text-xs sm:text-sm pt-16 pb-12 border-t border-[#2D2320]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2D2320]">
            
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#241E1C] text-[#C2871A] flex items-center justify-center border border-[#C2871A]/40">
                  <Sparkles className="w-4 h-4 text-[#C2871A]" />
                </div>
                <span className="text-xl font-black text-white font-serif tracking-tight">AMASYA ALTIN SAFRAN</span>
              </div>
              <p className="text-xs sm:text-sm text-[#B3A495] leading-relaxed max-w-sm font-medium">
                Anadolu'nun iyi tarım sertifikalı saf Amasya safranı üreticisi. Tarladan sofranıza laboratuvar onaylı saflık, çiftçilerimize sözleşmeli tohum ve alım garantisi.
              </p>
              <div className="text-xs text-[#7A6458] font-mono font-semibold">
                Tüm hakları saklıdır © {new Date().getFullYear()} Amasya Altın Safran
              </div>
            </div>

            {/* Links: Ürünlerimiz */}
            <div className="space-y-3">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E5C98E] font-serif">Ürünlerimiz</div>
              <ul className="space-y-2 text-[#DCD1C0] font-medium">
                <li><a href="#urunler" className="hover:text-white transition-colors">Saf Safran (1 Gram)</a></li>
                <li><a href="#urunler" className="hover:text-white transition-colors">Safran Sandık Seti</a></li>
                <li><a href="#urunler" className="hover:text-white transition-colors">Safran Soğanı (Kg/Adet)</a></li>
                <li><a href="#urunler" className="hover:text-white transition-colors">Safranlı Elma Sirkesi</a></li>
                <li><a href="#urunler" className="hover:text-white transition-colors">Safranlı Sultan Lokumu</a></li>
              </ul>
            </div>

            {/* Links: Kurumsal & Sertifikalar */}
            <div className="space-y-3">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E5C98E] font-serif">Belgelerimiz</div>
              <ul className="space-y-2 text-[#DCD1C0] font-medium">
                <li><a href="https://www.amasyaaltinsafran.com/muayene-analiz-raporu.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Muayene ve Analiz Raporu</a></li>
                <li><a href="https://www.amasyaaltinsafran.com/orser-sertifikasi.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Orser İyi Tarım Belgesi</a></li>
                <li><a href="https://www.amasyaaltinsafran.com/tohum-uretici-belgesi.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Tohum Üretici Belgesi</a></li>
                <li><a href="#tohum-yetistiricilik" className="hover:text-white transition-colors">Alım Garantisi Modeli</a></li>
              </ul>
            </div>

            {/* Links: İletişim */}
            <div className="space-y-3">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E5C98E] font-serif">İletişim & Adres</div>
              <ul className="space-y-2 text-[#DCD1C0] font-medium">
                <li>Dere Mah. Özkan Yalçın Cad. No:11/D Merkez / Amasya</li>
                <li><a href="tel:+905303019194" className="hover:text-white transition-colors">+90 (530) 301 91 94</a></li>
                <li><a href="mailto:info@amasyaaltinsafran.com" className="hover:text-white transition-colors">info@amasyaaltinsafran.com</a></li>
                <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">WhatsApp İletişim Hattı</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#7A6458]">
            <div>
              Web Tasarım & Dijital Çözüm Konsepti: <Link href="/" className="text-[#DCD1C0] hover:text-white font-bold">KvK Dijital Çözümler</Link>
            </div>
            <div className="flex items-center gap-6 font-medium">
              <Link href="/gizlilik-politikasi" className="hover:text-[#DCD1C0]">Gizlilik Politikası</Link>
              <Link href="/kullanim-kosullari" className="hover:text-[#DCD1C0]">Kullanım Koşulları</Link>
              <Link href="/projeler" className="hover:text-[#DCD1C0]">Örnek Projeler</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E3D7C5] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#EAE0D0] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#801824] uppercase">{selectedProduct.categoryLabel}</span>
                <h3 className="text-2xl font-black text-[#241E1C] font-serif mt-0.5">{selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-lg bg-white hover:bg-[#F7EEDB] text-[#241E1C] border border-[#D9CBB7]"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm sm:text-base text-[#5C4A42] leading-relaxed font-medium">
              {selectedProduct.description}
            </p>

            <div className="p-4 rounded-xl bg-white border border-[#EAE0D0] flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#7A6458] font-mono block">Gramaj / Paket</span>
                <span className="text-base font-bold text-[#241E1C]">{selectedProduct.packageSize}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#7A6458] font-mono block">Satış Fiyatı</span>
                <span className="text-2xl font-black text-[#241E1C] font-serif">₺ {selectedProduct.price.toLocaleString("tr-TR")},00</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs sm:text-sm font-bold text-[#241E1C] uppercase tracking-wider font-serif">Ürün Öne Çıkan Nitelikleri:</span>
              <ul className="space-y-1.5">
                {selectedProduct.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#3B312E] font-medium">
                    <Check className="w-4 h-4 text-[#C2871A] shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-[#EAE0D0] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-[#F7EEDB] text-[#241E1C] text-xs sm:text-sm font-bold border border-[#D9CBB7]"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  const pName = selectedProduct.name;
                  setSelectedProduct(null);
                  openQuoteFor(pName);
                }}
                className="px-6 py-2.5 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm"
              >
                Bu Ürünü Sipariş Et
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white border border-[#E3D7C5] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#EAE0D0] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#C2871A] uppercase">{selectedCert.code}</span>
                <h3 className="text-xl font-bold font-serif text-[#241E1C] mt-0.5">{selectedCert.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F7EEDB] text-[#241E1C]"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#5C4A42] leading-relaxed font-medium">
              {selectedCert.desc}
            </p>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E3D7C5] text-xs text-[#3B312E] space-y-1">
              <div><strong className="text-[#241E1C]">Onaylayan Makam:</strong> {selectedCert.authority}</div>
              <div><strong className="text-[#241E1C]">Tescil Durumu:</strong> Güncel ve Yürürlükte</div>
              <div><strong className="text-[#241E1C]">Kapsam:</strong> Doğal Safran Üretimi & Sertifikalı Tohumculuk</div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2.5 rounded-lg bg-[#FAF7F2] text-[#241E1C] text-xs sm:text-sm font-bold"
              >
                Kapat
              </button>
              <a
                href={selectedCert.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white text-xs sm:text-sm font-bold flex items-center gap-2"
              >
                <span>Resmi PDF Belgeyi Aç</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* QUICK QUOTE / ORDER MODAL */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#E3D7C5] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#EAE0D0] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#C2871A] uppercase">Sipariş & Bilgi Talebi</span>
                <h3 className="text-xl font-bold font-serif text-[#241E1C] mt-0.5">{quoteSubject || "Teklif İste"}</h3>
              </div>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="p-2 rounded-lg bg-white hover:bg-[#F7EEDB] text-[#241E1C] border border-[#D9CBB7]"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold font-serif text-[#241E1C]">Talebiniz İletildi</h4>
                <p className="text-sm text-[#5C4A42] leading-relaxed font-medium">
                  Uzman ekibimiz en kısa sürede fiyat ve ürün detaylarıyla dönüş yapacaktır.
                </p>
                <button
                  onClick={() => {
                    setQuoteModalOpen(false);
                    setFormSubmitted(false);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#C2871A] text-white text-xs sm:text-sm font-bold"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label htmlFor="modal-safran-fullname" className="block text-[#241E1C] font-bold mb-1.5">Ad Soyad *</label>
                  <input
                    id="modal-safran-fullname"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#D9CBB7] text-[#241E1C] placeholder:text-[#A89689] focus:outline-none focus:border-[#C2871A] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="modal-safran-phone" className="block text-[#241E1C] font-bold mb-1.5">Telefon / WhatsApp *</label>
                  <input
                    id="modal-safran-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#D9CBB7] text-[#241E1C] placeholder:text-[#A89689] focus:outline-none focus:border-[#C2871A] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="modal-safran-notes" className="block text-[#241E1C] font-bold mb-1.5">İlave Not veya Talep Detayı</label>
                  <textarea
                    id="modal-safran-notes"
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Adet, tohum miktarı veya teslimat şehri..."
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#D9CBB7] text-[#241E1C] placeholder:text-[#A89689] focus:outline-none focus:border-[#C2871A] resize-none text-sm"
                  />
                </div>
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-white text-[#241E1C] hover:bg-[#F7EEDB] font-bold border border-[#D9CBB7]"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#C2871A] hover:bg-[#A87212] text-white font-extrabold uppercase tracking-wider shadow-sm"
                  >
                    Talebi Gönder
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
