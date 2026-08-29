"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import {
  Zap,
  Cpu,
  Layers,
  Wrench,
  ShieldCheck,
  Headphones,
  Truck,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Phone,
  MessageSquare,
  Sparkles,
  Sliders,
  Maximize2,
  Menu,
  X,
  ExternalLink,
  Target,
  Settings,
  Flame,
  FileText,
  Activity,
  Check
} from "lucide-react";

// ==========================================
// DATA STRUCTURES
// ==========================================

interface Machine {
  id: string;
  code: string;
  name: string;
  category: "kesim" | "markalama" | "ozel" | "co2";
  categoryLabel: string;
  description: string;
  powerRange: string;
  workingArea: string;
  accuracy: string;
  speed: string;
  materials: string[];
  features: string[];
  imageUrl: string;
}

const FEATURED_MACHINES: Machine[] = [
  {
    id: "pl-fiber-3015",
    code: "PL-FIBER 3015 PRO",
    name: "Fiber Lazer Sac Kesim Makinesi",
    category: "kesim",
    categoryLabel: "Fiber Sac Kesim",
    description: "Ağır sanayi tipi çelik gövde, otomatik değişir çift tabla ve mikron düzeyinde hassas lineer kızak sistemi ile yüksek hızlı metal levha kesimi.",
    powerRange: "3 kW - 12 kW Fiber Rezonatör",
    workingArea: "1500 x 3000 mm",
    accuracy: "±0.02 mm",
    speed: "120 m/dk Maksimum İvmelenme",
    materials: ["Paslanmaz Çelik", "DKP Sac", "Alüminyum", "Pirinç", "Bakır", "Galvaniz"],
    features: [
      "Otomatik çift tabla hidrolik değişim sistemi (15 sn)",
      "Raytools otomatik odaklamalı akıllı kesim kafası",
      "EtherCAT bus kontrollü CNC yönetim ünitesi",
      "Akıllı duman emme ve partikül filtreleme sistemi"
    ],
    imageUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pl-mark-50",
    code: "PL-MARK 50 MOPA",
    name: "MOPA & Fiber Lazer Markalama",
    category: "markalama",
    categoryLabel: "Lazer Markalama",
    description: "Ayarlanabilir darbe süresi (pulse width) ile paslanmaz çelik üzerinde renkli markalama, siyah eloksal alüminyum ve plastiklerde yüksek kontrastlı kodlama.",
    powerRange: "30W / 50W / 100W MOPA Lazer",
    workingArea: "110x110 mm - 300x300 mm",
    accuracy: "±0.001 mm",
    speed: "9000 mm/sn Galvo Hızı",
    materials: ["Tüm Metaller", "Endüstriyel Plastikler", "Sert Deri", "Seramik", "PCB Kart"],
    features: [
      "Yüksek hızlı dijital Galvo tarayıcı kafa",
      "Kırmızı nokta çift kılavuz ışık hizalama",
      "Otomatik seri numarası, 2D QR ve Datamatrix üretimi",
      "Döner divizör (rotary) opsiyonu ile silindirik markalama"
    ],
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pl-tube-6020",
    code: "PL-TUBE 6020",
    name: "Otomatik Boru & Profil Lazer Kesim",
    category: "ozel",
    categoryLabel: "Boru & Profil Kesim",
    description: "Yuvarlak, kare, dikdörtgen borular ve özel kesitli açık profiller için otomatik pnömatik ayna sıkma ve 3D kurt ağzı kesim kabiliyeti.",
    powerRange: "2 kW - 6 kW Fiber Lazer",
    workingArea: "Boru Boyu: 6000 mm / Çap: 20-220 mm",
    accuracy: "±0.03 mm",
    speed: "90 m/dk Eksenel Hız",
    materials: ["Çelik Boru", "Kutu Profil", "Paslanmaz Boru", "Alüminyum Profil"],
    features: [
      "Otomatik tam stroklu pnömatik ön/arka ayna sistemi",
      "Otomatik boru yükleme ve sehpası (opsiyonel)",
      "Kurt ağzı, kilitli geçme ve açılı kaynak ağzı açma",
      "Sıfır fire boru sonu kesim teknolojisi"
    ],
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pl-co2-1390",
    code: "PL-CO2 1390 ULTRA",
    name: "Non-Metal Lazer Kesim & Kazıma",
    category: "co2",
    categoryLabel: "CO2 Lazer Çözümleri",
    description: "Pleksiglas, ahşap, MDF, deri, kumaş ve reklamcılık malzemelerinde pürüzsüz kenar kalitesi ve detaylı gravür imkanı.",
    powerRange: "100W / 130W / 150W Reci CO2 Tüp",
    workingArea: "1300 x 900 mm",
    accuracy: "±0.05 mm",
    speed: "600 mm/sn Kazıma Hızı",
    materials: ["Akrilik (Pleksi)", "Ahşap & MDF", "Deri & Kumaş", "Karton", "Polikarbon"],
    features: [
      "Bal peteği ve kılıç bıçak hibrit çalışma tablası",
      "Ruida DSP bağımsız kontrol kartı ve USB bağlantı",
      "Otomatik motorlu aşağı/yukarı hareketli Z ekseni",
      "Endüstriyel CW-5200 su soğutucu (chiller) entegrasyonu"
    ],
    imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80"
  }
];

const MACHINE_CATEGORIES = [
  {
    id: "kesim",
    title: "Lazer Kesim Makineleri",
    subtitle: "Sac & Metal Plaka İşleme",
    desc: "1kW'tan 30kW'a kadar yüksek güçlü fiber lazer teknolojisiyle paslanmaz çelik, karbon çeliği ve alüminyum levhalarda çapaksız, mikron toleranslı kesim.",
    specs: ["1500x3000 mm - 2500x6000 mm", "3 kW - 30 kW Güç Seçenekleri", "Otomatik Değişir Tabla"],
    icon: Flame,
    color: "from-rose-500 to-red-600"
  },
  {
    id: "markalama",
    title: "Lazer Markalama Makineleri",
    subtitle: "Yüksek Hızlı Kodlama & Seri No",
    desc: "Fiber, MOPA ve UV dalga boylarında endüstriyel parçalar, kalıplar ve seri üretim hatları için silinmez 2D Datamatrix, barkod ve logo markalama.",
    specs: ["20W - 100W Güç Aralıkları", "9000 mm/sn Galvo Tarama", "MOPA Renkli Markalama"],
    icon: Target,
    color: "from-red-500 to-rose-600"
  },
  {
    id: "ozel",
    title: "Özel Lazer Çözümleri",
    subtitle: "Boru, Profil & 3D Robotik",
    desc: "Standart dışı üretim hatları için otomatik boru-profil kesim makineleri, 3D 5 eksenli robotik lazer kaynak ve özel üretim hücreleri.",
    specs: ["6m - 12m Boru Yükleme", "0.05 mm Eksenel Hassasiyet", "Pnömatik Ayna Sistemi"],
    icon: Cpu,
    color: "from-amber-500 to-rose-500"
  },
  {
    id: "yedek-parca",
    title: "Yedek Parçalar & Sarf Malzeme",
    subtitle: "Orijinal Optik & Mekanik Bileşenler",
    desc: "Raytools kesim kafaları, koruyucu camlar, odaklama lensleri, nozullar, seramik halkalar ve lazer güç rezonatörleri stoktan hızlı sevk.",
    specs: ["Orijinal Sarf Malzemeler", "Aynı Gün Kargo Desteği", "Teknik Değişim Rehberi"],
    icon: Wrench,
    color: "from-slate-700 to-slate-900"
  }
];

const SECTORS = [
  {
    name: "Metal & Makine Sanayi",
    desc: "Otomotiv yan sanayi parçaları, makine şaseleri, elektrik panoları ve havalandırma ekipmanlarında yüksek mukavemetli mikron kesim.",
    tags: ["Sac Metal", "Boru & Profil", "Paslanmaz", "Alüminyum"],
    metric: "0.02 mm Hassasiyet"
  },
  {
    name: "Ahşap & Mobilya İmalatı",
    desc: "Dekoratif panel işlemeleri, mimari mobilya parçaları, ahşap kakma ve özel tasarım hediyelik ürün üretiminde hassas CO2 kazıma.",
    tags: ["MDF", "Masif Ahşap", "Kontrplak", "Kaplama"],
    metric: "Yüksek Detay"
  },
  {
    name: "Akrilik & Reklamcılık",
    desc: "Işıklı reklam tabelaları, pleksi stantlar, mimari maketler ve 3D kutu harf üretiminde pürüzsüz, parlatılmış kenar bitişi.",
    tags: ["Pleksiglas", "Dekota", "Polikarbon", "Gravür"],
    metric: "Parlak Kenar"
  },
  {
    name: "Tekstil & Deri Sektörü",
    desc: "Ayakkabı saya kesimleri, konfeksiyon şablonları, deri çanta ve kemer gravürlerinde seri üretim hızı ve hatasız kalıp çıkarma.",
    tags: ["Hakiki Deri", "Suni Deri", "Tekstil", "Keçe"],
    metric: "Sıfır Deformasyon"
  },
  {
    name: "Promosyon & Endüstriyel Kodlama",
    desc: "Metal kartvizitler, anahtarlıklar, valfler, otomotiv komponentleri ve seri numaralı cihaz gövdelerinde silinmez kalıcı markalama.",
    tags: ["QR Kod", "Datamatrix", "Seri Numarası", "Logo"],
    metric: "9000 mm/sn Hız"
  }
];

const SPARE_PARTS_ITEMS = [
  {
    title: "Kesim Kafaları & Nozullar",
    desc: "Raytools, Precitec ve WSX uyumlu tekli/çiftli krom nozullar, nozul tutucu gövdeler ve seramik izolasyon halkaları.",
    specs: "Çap: 1.0mm - 4.5mm | Orijinal Krom Kaplama"
  },
  {
    title: "Koruyucu Camlar & Odak Lensleri",
    desc: "Yüksek saflıkta eritilmiş silika ve kuvars koruyucu camlar, ZnSe CO2 odaklama mercekleri ve kolimatör lens grupları.",
    specs: "Dalga Boyu: 1064nm / 10.6μm | AR Kaplama"
  },
  {
    title: "Lazer Güç Kaynakları & Rezonatörler",
    desc: "Raycus ve Maxphotonics fiber lazer güç modülleri, Q-switch ve MOPA lazer kaynakları, Reci CO2 lazer cam tüpleri.",
    specs: "30W MOPA'dan 30kW Fiber Rezonatöre Kadar"
  },
  {
    title: "Endüstriyel Chiller & Sensörler",
    desc: "Çift devreli akıllı su soğutma üniteleri (S&A CWFL serisi), kapasitif yükseklik takip sensörleri ve kablo setleri.",
    specs: "PID Sıcaklık Kontrolü | 380V / 220V Uyumlu"
  }
];

export default function PomakLazerClient() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSubject, setQuoteSubject] = useState("");

  // Machine Finder State Machine
  const [finderStep, setFinderStep] = useState<1 | 2 | 3 | 4>(1);
  const [finderAction, setFinderAction] = useState<"kesim" | "markalama" | "kazima" | "">("");
  const [finderMaterial, setFinderMaterial] = useState<"metal" | "ahsap" | "akrilik" | "tekstil" | "plastik" | "deri" | "">("");
  const [finderScale, setFinderScale] = useState<"atolye" | "kobi" | "endustriyel" | "">("");

  // Quick Quote Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    company: "",
    machineInterest: "Genel Danışmanlık",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
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
    setFormData(prev => ({ ...prev, machineInterest: subject }));
    setQuoteModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const getFinderRecommendation = () => {
    if (finderAction === "markalama") {
      return {
        title: "PL-MARK 50 MOPA Fiber Lazer Markalama Sistemi",
        category: "Lazer Markalama & Kodlama",
        recomPower: "50W MOPA Lazer Kaynağı",
        recomArea: "200 x 200 mm Çalışma Alanı",
        reason: "Seçtiğiniz markalama operasyonu ve malzeme türü için yüksek kontrastlı galvo optik teknolojisi en verimli çözümdür."
      };
    }
    if (finderMaterial === "metal") {
      if (finderScale === "endustriyel") {
        return {
          title: "PL-FIBER 3015 PRO (12kW Çift Tabla)",
          category: "Ağır Sanayi Fiber Sac Kesim",
          recomPower: "6 kW - 12 kW Fiber Rezonatör",
          recomArea: "1500 x 3000 mm / 2000 x 4000 mm",
          reason: "Yoğun vardiyalı metal kesim ve yüksek kalınlıktaki sac levhalar için otomatik çift tablalı fiber sistem önerilir."
        };
      }
      return {
        title: "PL-FIBER 3015 BASIC / PRO (3kW - 6kW)",
        category: "Endüstriyel Fiber Sac Kesim",
        recomPower: "3 kW - 6 kW Fiber Rezonatör",
        recomArea: "1500 x 3000 mm",
        reason: "Atölye ve KOBİ ölçeğindeki sac metal, paslanmaz ve alüminyum kesimleri için optimum maliyet ve hız sunar."
      };
    }
    return {
      title: "PL-CO2 1390 ULTRA (130W Reci)",
      category: "Non-Metal Lazer Kesim & Kazıma",
      recomPower: "100W - 150W CO2 Cam Tüp",
      recomArea: "1300 x 900 mm",
      reason: "Ahşap, pleksi, akrilik, deri ve tekstil gibi ametal malzemelerde pürüzsüz kenar ve hassas kazıma sağlar."
    };
  };

  const whatsappUrl = "https://wa.me/905348914905?text=" + encodeURIComponent("Merhaba Pomak Lazer ekibi, web siteniz üzerinden lazer makineleri ve teklif hakkında bilgi almak istiyorum.");

  return (
    <div className="min-h-screen bg-[#08090B] text-slate-100 font-sans selection:bg-rose-600/30 selection:text-white antialiased">
      
      {/* 0. KVK DIJITAL CONCEPT BADGE TOP STRIP */}
      <div className="bg-[#0D0F12] border-b border-white/5 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-300">KvK Dijital Çözümler</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">Pomak Lazer İçin Özel Tasarlanmış Konsept Web Sitesi Demosu</span>
          </div>
          <Link
            href="/projeler"
            className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            <span>Tüm Projeler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. STANDALONE POMAK LAZER HEADER */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#08090B]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80 py-3"
            : "bg-transparent border-b border-white/5 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="#hero" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center border border-rose-500/40 shadow-lg shadow-rose-900/30 group-hover:border-rose-400 transition-all duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-wider text-white font-mono">POMAK</span>
                <span className="text-xl font-bold tracking-wider text-rose-500 font-mono">LAZER</span>
              </div>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-slate-400 font-medium">
                Endüstriyel Lazer Sistemleri
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#hero" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Ana Sayfa</a>
            <a href="#makineler" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Makineler</a>
            <a href="#cozumler" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Çözümler</a>
            <a href="#makine-bulucu" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Lazer Bulucu</a>
            <a href="#uygulamalar" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Uygulamalar</a>
            <a href="#yedek-parca" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Yedek Parçalar</a>
            <a href="#neden-pomak" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Hakkımızda</a>
            <a href="#iletisim" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">İletişim</a>
          </nav>

          {/* Header Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 hover:border-emerald-500 transition-all duration-200"
              title="WhatsApp İletişim"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
            <button
              onClick={() => openQuoteFor("Genel Makine Teklifi")}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-900/40 border border-rose-400/40 hover:border-rose-300 transition-all duration-200 cursor-pointer"
            >
              Teklif Al
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0D0F12] border-b border-white/10 px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-3">
              <a onClick={() => setMobileMenuOpen(false)} href="#hero" className="text-base font-medium text-slate-200 hover:text-rose-400 py-1">Ana Sayfa</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#makineler" className="text-base font-medium text-slate-200 hover:text-rose-400 py-1">Makineler</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#cozumler" className="text-base font-medium text-slate-200 hover:text-rose-400 py-1">Çözümler</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#makine-bulucu" className="text-base font-medium text-slate-200 hover:text-rose-400 py-1">Lazer Bulucu</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#uygulamalar" className="text-base font-medium text-slate-200 hover:text-rose-400 py-1">Uygulamalar</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#yedek-parca" className="text-base font-medium text-slate-200 hover:text-rose-400 py-1">Yedek Parçalar</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#neden-pomak" className="text-base font-medium text-slate-200 hover:text-rose-400 py-1">Hakkımızda</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#iletisim" className="text-base font-medium text-slate-200 hover:text-rose-400 py-1">İletişim</a>
            </nav>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); openQuoteFor("Mobil Menü Teklifi"); }}
                className="w-full py-3 rounded-lg bg-rose-600 text-white font-bold text-center text-sm uppercase tracking-wider"
              >
                Teklif Al
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-center text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp İle İletişime Geç</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Background Laser Grid & Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(225,29,72,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Copy */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Technical Eyebrow Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-300">
                  Yeni Nesil Endüstriyel Lazer Teknolojisi
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-white">
                ÜRETİMİN GÜCÜ, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-rose-400">
                  LAZERİN HASSASİYETİ.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Pomak Lazer; sac metal, ahşap, akrilik ve endüstriyel üretim hatları için mikron düzeyinde hassasiyete sahip fiber lazer kesim, CO2 kazıma ve lazer markalama makineleri sunar. Yüksek hız, sıfır tolerans ve kesintisiz teknik servis gücü.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#makineler"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm uppercase tracking-wider shadow-2xl shadow-rose-900/50 border border-rose-400/40 flex items-center justify-center gap-2.5 transition-all duration-300 group"
                >
                  <span>Makineleri İncele</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  onClick={() => openQuoteFor("Hero Uzman Görüşmesi")}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white font-semibold text-sm border border-white/10 hover:border-white/20 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-rose-400" />
                  <span>Uzmanla Görüş</span>
                </button>
              </div>

              {/* Hero Real-Time Micro Telemetry */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white">±0.02<span className="text-rose-500 text-sm font-sans ml-1">mm</span></div>
                  <div className="text-xs text-slate-400 mt-1">Konumlandırma</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white">30<span className="text-rose-500 text-sm font-sans ml-1">kW</span></div>
                  <div className="text-xs text-slate-400 mt-1">Max Lazer Gücü</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white">120<span className="text-rose-500 text-sm font-sans ml-1">m/dk</span></div>
                  <div className="text-xs text-slate-400 mt-1">Eksenel Hız</div>
                </div>
              </div>

            </div>

            {/* Right Column: High-End Industrial Laser Visual Card */}
            <div className="lg:col-span-5 relative">
              
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#181D26] to-[#0D1016] border border-white/15 p-2 shadow-2xl shadow-black">
                
                {/* Visual Frame */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-black/60">
                  <img
                    src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1000&auto=format&fit=crop&q=85"
                    alt="Endüstriyel Fiber Lazer Kesim Makinesi ve Kıvılcım Hassasiyeti"
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-black/30" />

                  {/* Laser Beam Visual Emitter Overlay */}
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-rose-500/40 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[11px] font-mono font-bold text-rose-400 uppercase">Fiber Rezonatör: Aktif</span>
                  </div>

                  {/* Bottom Technical Spec Pill */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">PL-FIBER 3015 PRO</div>
                      <div className="text-[11px] text-slate-400">1500x3000mm Çift Tabla / 6kW - 12kW</div>
                    </div>
                    <button
                      onClick={() => setSelectedMachine(FEATURED_MACHINES[0])}
                      className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                      title="Detayları İncele"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Machine Status Bar */}
                <div className="p-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Raytools Akıllı Kesim Kafası</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>EtherCAT CNC Kontrol</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. TRUST / VALUE STRIP */}
      <section className="bg-[#0D0F12] border-y border-white/10 py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-rose-400 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Endüstriyel Çözümler</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ağır sanayiden seri imalat atölyelerine kadar yüksek verimli fiber ve CO2 lazer makineleri.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-rose-400 shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Teknik Destek</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Yerinde kurulum, operatör eğitimleri ve tecrübeli servis mühendislerimizle kesintisiz destek.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-rose-400 shrink-0">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Yedek Parça</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Orijinal optik lensler, nozullar, seramik halkalar ve rezonatör parçaları doğrudan stoktan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-rose-400 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Türkiye Geneli Hizmet</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tüm organize sanayi bölgelerine hızlı teknik servis, yedek parça sevkiyatı ve danışmanlık.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MACHINE SOLUTIONS */}
      <section id="cozumler" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider">
              Ürün Kategorileri & Teknolojiler
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Üretiminize Uygun Lazer Çözümü
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Farklı malzeme türleri, sac kalınlıkları ve üretim hızları için optimize edilmiş yüksek mühendislik ürünü lazer sistemleri.
            </p>
          </div>

          {/* Solution Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MACHINE_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="group relative rounded-2xl bg-[#0F1217] border border-white/10 hover:border-rose-500/50 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-3.5 rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                        {cat.subtitle}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-rose-400 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>

                    {/* Spec Bullets */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      {cat.specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                    <a
                      href="#makineler"
                      className="text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                    >
                      <span>Makineleri Görüntüle</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => openQuoteFor(cat.title)}
                      className="px-3.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 transition-colors"
                    >
                      Teklif İste
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE MACHINE FINDER */}
      <section id="makine-bulucu" className="py-20 bg-[#0B0D11] border-y border-white/10 relative overflow-hidden">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              <span>Akıllı İhtiyaç Analizi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Hangi Lazer Çözümü Size Uygun?
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              3 adımda üretim hedeflerinizi ve malzemenizi seçin, işletmeniz için en uygun rezonatör gücü ve makine modelini anında bulun.
            </p>
          </div>

          {/* Interactive Wizard Card */}
          <div className="rounded-2xl bg-[#12161E] border border-white/15 p-6 sm:p-10 shadow-2xl shadow-black">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
              {[
                { step: 1, label: "1. İşlem Türü" },
                { step: 2, label: "2. Malzeme" },
                { step: 3, label: "3. Üretim Ölçeği" },
                { step: 4, label: "4. Öneri" }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      finderStep === s.step
                        ? "bg-rose-600 text-white ring-4 ring-rose-900/40"
                        : finderStep > s.step
                        ? "bg-emerald-600 text-white"
                        : "bg-white/10 text-slate-500"
                    }`}
                  >
                    {finderStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-300">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Operation */}
            {finderStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">Ne yapmak istiyorsunuz?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "kesim", label: "Lazer Kesim", desc: "Sac metal, levha, boru ve plaka boyutlandırma" },
                    { id: "markalama", label: "Lazer Markalama", desc: "Seri no, logo, barkod, 2D datamatrix kodlama" },
                    { id: "kazima", label: "Kazıma & Gravür", desc: "Ahşap, pleksi, deri derin yüzey işleme" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setFinderAction(opt.id as any);
                        setFinderStep(2);
                      }}
                      className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                        finderAction === opt.id
                          ? "bg-rose-950/40 border-rose-500 text-white shadow-lg shadow-rose-950/30"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-base">{opt.label}</div>
                      <div className="text-xs text-slate-400 mt-1.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Material */}
            {finderStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Hangi malzemeyle çalışıyorsunuz?</h3>
                  <button onClick={() => setFinderStep(1)} className="text-xs text-rose-400 hover:underline">Geri Dön</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { id: "metal", label: "Metal / Sac", sub: "Paslanmaz, DKP, Alüminyum, Pirinç" },
                    { id: "ahsap", label: "Ahşap & MDF", sub: "Masif, Kontrplak, Kaplama" },
                    { id: "akrilik", label: "Akrilik / Pleksi", sub: "Pleksiglas, Polikarbon" },
                    { id: "tekstil", label: "Tekstil & Kumaş", sub: "Kumaş, Keçe, Tela" },
                    { id: "plastik", label: "Endüstriyel Plastik", sub: "ABS, PVC, Polimer" },
                    { id: "deri", label: "Deri", sub: "Hakiki & Suni Deri" }
                  ].map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => {
                        setFinderMaterial(mat.id as any);
                        setFinderStep(3);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        finderMaterial === mat.id
                          ? "bg-rose-950/40 border-rose-500 text-white"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-sm">{mat.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{mat.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Scale */}
            {finderStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Üretim ölçeğiniz nedir?</h3>
                  <button onClick={() => setFinderStep(2)} className="text-xs text-rose-400 hover:underline">Geri Dön</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "atolye", label: "Başlangıç / Atölye", desc: "Butik veya düşük adetli imalat (Tekil vardiya)" },
                    { id: "kobi", label: "Profesyonel KOBİ", desc: "Sürekli parça üretimi ve fason işleme kapasitesi" },
                    { id: "endustriyel", label: "Ağır Endüstriyel", desc: "7/24 kesintisiz yüksek tonajlı fabrika hattı" }
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setFinderScale(sc.id as any);
                        setFinderStep(4);
                      }}
                      className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                        finderScale === sc.id
                          ? "bg-rose-950/40 border-rose-500 text-white"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-base">{sc.label}</div>
                      <div className="text-xs text-slate-400 mt-1.5">{sc.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Recommendation Result */}
            {finderStep === 4 && (
              <div className="space-y-6 animate-fade-in-up">
                {(() => {
                  const rec = getFinderRecommendation();
                  return (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-rose-950/30 to-[#181D26] border border-rose-500/30 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">Önerilen Lazer Modeli</span>
                          <h4 className="text-xl sm:text-2xl font-black text-white mt-1">{rec.title}</h4>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-rose-600/20 text-rose-300 text-xs font-mono font-bold border border-rose-500/30">
                          {rec.category}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {rec.reason}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-3.5 rounded-lg bg-black/40 border border-white/10">
                          <div className="text-xs text-slate-400 font-mono">Önerilen Güç</div>
                          <div className="text-sm font-bold text-white mt-0.5">{rec.recomPower}</div>
                        </div>
                        <div className="p-3.5 rounded-lg bg-black/40 border border-white/10">
                          <div className="text-xs text-slate-400 font-mono">Çalışma Alanı</div>
                          <div className="text-sm font-bold text-white mt-0.5">{rec.recomArea}</div>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                        <button
                          onClick={() => openQuoteFor(`Bulucu Önerisi: ${rec.title}`)}
                          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-900/40"
                        >
                          Bu Model İçin Fiyat Teklifi Al
                        </button>
                        <button
                          onClick={() => {
                            setFinderStep(1);
                            setFinderAction("");
                            setFinderMaterial("");
                            setFinderScale("");
                          }}
                          className="w-full sm:w-auto px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                        >
                          Farklı Seçim Yap
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 6. FEATURED MACHINES SHOWCASE */}
      <section id="makineler" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider">
                Endüstriyel Makine Portföyü
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Öne Çıkan Makineler
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Yüksek rezonatör verimliliği, sağlam mekanik gövde yapısı ve kullanıcı dostu CNC kontrol arayüzü ile donatılmış lazer sistemlerimiz.
              </p>
            </div>
            <div>
              <button
                onClick={() => openQuoteFor("Katalog Talebi")}
                className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Katalog İndir / Teklif Al
              </button>
            </div>
          </div>

          {/* Machine Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURED_MACHINES.map((machine) => (
              <div
                key={machine.id}
                className="rounded-2xl bg-[#0E1116] border border-white/10 hover:border-white/25 overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-xl"
              >
                <div>
                  {/* Visual Header */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-black/80">
                    <img
                      src={machine.imageUrl}
                      alt={machine.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-transparent to-black/40" />
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-mono font-bold border border-white/20">
                        {machine.code}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 rounded-md bg-rose-600/80 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider">
                        {machine.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-rose-400 transition-colors">
                        {machine.name}
                      </h3>
                      <p className="text-slate-300 text-xs sm:text-sm mt-2.5 leading-relaxed">
                        {machine.description}
                      </p>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Güç Aralığı</span>
                        <span className="text-slate-200 font-bold">{machine.powerRange}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Çalışma Alanı</span>
                        <span className="text-slate-200 font-bold">{machine.workingArea}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Hassasiyet</span>
                        <span className="text-slate-200 font-bold">{machine.accuracy}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Maks Hız</span>
                        <span className="text-slate-200 font-bold">{machine.speed}</span>
                      </div>
                    </div>

                    {/* Compatible Materials Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Uyumlu Malzemeler:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {machine.materials.map((mat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-slate-300 border border-white/5">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-6 sm:p-8 pt-0 flex items-center justify-between gap-4">
                  <button
                    onClick={() => setSelectedMachine(machine)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <span>Detaylı İncele</span>
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => openQuoteFor(machine.name)}
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-900/30 transition-colors"
                  >
                    Teklif İste
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. APPLICATIONS / INDUSTRIES */}
      <section id="uygulamalar" className="py-24 bg-[#0A0C0F] border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono uppercase tracking-wider">
              Sektörel Çözümler
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Geniş Endüstriyel Uygulama Alanları
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Pomak Lazer makineleri, otomotivden mobilyaya, reklamcılıktan tekstil kalıplarına kadar onlarca farklı sanayi kolunda yüksek katma değer üretir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTORS.map((sec, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#10141B] border border-white/10 hover:border-rose-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 font-bold">0{idx + 1} // SEKTÖR</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
                      {sec.metric}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {sec.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex flex-wrap gap-1.5">
                  {sec.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. WHY POMAK (HAKKIMIZDA & GÜVEN) */}
      <section id="neden-pomak" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider">
                Mühendislik & Kalite
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Neden Pomak Lazer?
              </h2>

              <p className="text-slate-300 text-base leading-relaxed">
                Lazer kesim ve markalama makinelerimiz, yalnızca bir ekipman değil; işletmenizin üretim hızını, tolerans kalitesini ve kârlılığını artıran komple bir endüstriyel çözümdür.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { title: "Hassas Üretim Mimarisi", desc: "Mikron düzeyinde işleme için taşlanmış helis dişli kramayer ve Japon servo motor altyapısı." },
                  { title: "Teknik Uzmanlık & Kurulum", desc: "Uzman mühendis kadromuzla yerinde kurulum, kalibrasyon ve detaylı operatör eğitimleri." },
                  { title: "İhtiyaca Özel Makine Çözümleri", desc: "Farklı tabla ölçüleri, rezonatör kapasiteleri ve boru kesim ataşman opsiyonları." },
                  { title: "Yedek Parça Stok Güvencesi", desc: "Orijinal optik lensler, nozullar ve rezonatör sarflarında anında stoktan sevkiyat." },
                  { title: "Satış Sonrası Kesintisiz Destek", desc: "Uzaktan arıza teşhisi, periyodik bakım ve 7/24 teknik danışmanlık hizmeti." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl bg-gradient-to-br from-[#181D26] to-[#0D1016] border border-white/10 p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <Activity className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-white">Pomak Lazer Kalite Taahhüdü</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Tüm makinelerimiz montaj sonrası 72 saatlik sürekli stres ve rezonans testlerinden geçirilerek sevk edilir. Lazer ışın kalitesi, odak kararlılığı ve eksenel paralellik toleransları lazer interferometre cihazlarıyla belgelenir.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-2xl font-black font-mono text-white">100%</div>
                    <div className="text-[11px] text-slate-400 mt-1">Orijinal Parça Garantisi</div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-2xl font-black font-mono text-white">Yerinde</div>
                    <div className="text-[11px] text-slate-400 mt-1">Teknik Servis & Eğitim</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => openQuoteFor("Hakkımızda & Şirket Bilgi Talebi")}
                    className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors"
                  >
                    Şirket Profili & Bilgi Al
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. SPARE PARTS SECTION */}
      <section id="yedek-parca" className="py-24 bg-[#0A0C0E] border-y border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider">
                Sarf Malzeme & Bileşenler
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Makineniz İçin Doğru Parça
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Tüm lazer kesim ve markalama kafalarıyla uyumlu orijinal optik lensler, nozullar, seramik gövdeler ve güç rezonatörleri.
              </p>
            </div>
            <div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Parça Kodu Sorgula</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPARE_PARTS_ITEMS.map((part, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-[#11151D] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-rose-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{part.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{part.desc}</p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] font-mono text-slate-400">{part.specs}</div>
                  <button
                    onClick={() => openQuoteFor(`Yedek Parça: ${part.title}`)}
                    className="w-full mt-3 py-2 rounded bg-white/5 hover:bg-white/10 text-xs font-semibold text-rose-400 hover:text-white transition-colors"
                  >
                    Fiyat & Stok Sor
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. FINAL CTA & CONVERSION SECTION */}
      <section id="iletisim" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(225,29,72,0.12),transparent)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="rounded-3xl bg-gradient-to-b from-[#151922] to-[#0D1015] border border-white/15 p-8 sm:p-14 shadow-2xl shadow-black space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/20 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider border border-rose-500/30">
                Doğrudan İletişim & Teklif
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Üretiminiz İçin Doğru Lazer Çözümünü Birlikte Bulalım.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                İşletmenizin malzeme türü, kalınlık hedefleri ve bütçesine en uygun lazer makinesi için uzmanlarımızla hemen iletişime geçin.
              </p>
            </div>

            {/* Quick Contact Form */}
            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Talebiniz Alındı!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Pomak Lazer uzman mühendislerimiz belirttiğiniz iletişim bilgilerinden en kısa sürede sizinle iletişime geçecektir.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pomak-fullname" className="block text-xs font-medium text-slate-300 mb-1.5">Ad Soyad *</label>
                    <input
                      id="pomak-fullname"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="pomak-phone" className="block text-xs font-medium text-slate-300 mb-1.5">Telefon / WhatsApp *</label>
                    <input
                      id="pomak-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Örn: 0532 000 00 00"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pomak-company" className="block text-xs font-medium text-slate-300 mb-1.5">Firma / Atölye Adı</label>
                    <input
                      id="pomak-company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Örn: Yılmaz Makine Sanayi"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="pomak-interest" className="block text-xs font-medium text-slate-300 mb-1.5">İlgilendiğiniz Makine / Hizmet</label>
                    <select
                      id="pomak-interest"
                      value={formData.machineInterest}
                      onChange={(e) => setFormData({ ...formData, machineInterest: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      <option value="Genel Danışmanlık">Genel Danışmanlık & Fiyat Talebi</option>
                      <option value="PL-FIBER 3015 PRO">PL-FIBER 3015 PRO (Sac Kesim)</option>
                      <option value="PL-MARK 50 MOPA">PL-MARK 50 MOPA (Markalama)</option>
                      <option value="PL-TUBE 6020">PL-TUBE 6020 (Boru & Profil)</option>
                      <option value="PL-CO2 1390 ULTRA">PL-CO2 1390 ULTRA (Non-Metal)</option>
                      <option value="Yedek Parça & Optik">Yedek Parça & Optik Sarf</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pomak-message" className="block text-xs font-medium text-slate-300 mb-1.5">Mesajınız / Malzeme ve Kalınlık Detayı</label>
                  <textarea
                    id="pomak-message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Örn: 5mm paslanmaz ve 10mm DKP sac kesimi için 6kW lazer teklifi almak istiyorum."
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-900/50 border border-rose-400/40 transition-all cursor-pointer"
                  >
                    Teklif Al
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
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

      {/* 11. STANDALONE POMAK LAZER FOOTER */}
      <footer className="bg-[#060709] border-t border-white/10 pt-16 pb-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-white font-mono">POMAK</span>
                  <span className="text-lg font-bold text-rose-500 font-mono">LAZER</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Endüstriyel fiber lazer kesim, lazer markalama, boru lazer sistemleri ve orijinal optik yedek parça çözümleri. Türkiye geneli teknik servis ve kurulum güvencesi.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Tüm hakları saklıdır © {new Date().getFullYear()} Pomak Lazer Sistemleri
              </div>
            </div>

            {/* Links: Makineler */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white font-mono">Makineler</div>
              <ul className="space-y-2">
                <li><a href="#makineler" className="hover:text-rose-400 transition-colors">Fiber Sac Kesim</a></li>
                <li><a href="#makineler" className="hover:text-rose-400 transition-colors">Lazer Markalama</a></li>
                <li><a href="#makineler" className="hover:text-rose-400 transition-colors">Boru & Profil Kesim</a></li>
                <li><a href="#makineler" className="hover:text-rose-400 transition-colors">CO2 Lazer Sistemleri</a></li>
                <li><a href="#yedek-parca" className="hover:text-rose-400 transition-colors">Optik & Nozullar</a></li>
              </ul>
            </div>

            {/* Links: Çözümler */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white font-mono">Uygulamalar</div>
              <ul className="space-y-2">
                <li><a href="#uygulamalar" className="hover:text-rose-400 transition-colors">Metal & Sac Sanayi</a></li>
                <li><a href="#uygulamalar" className="hover:text-rose-400 transition-colors">Ahşap & Mobilya</a></li>
                <li><a href="#uygulamalar" className="hover:text-rose-400 transition-colors">Akrilik & Reklam</a></li>
                <li><a href="#uygulamalar" className="hover:text-rose-400 transition-colors">Tekstil & Deri</a></li>
                <li><a href="#uygulamalar" className="hover:text-rose-400 transition-colors">Endüstriyel Kodlama</a></li>
              </ul>
            </div>

            {/* Links: Kurumsal */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white font-mono">İletişim & Destek</div>
              <ul className="space-y-2">
                <li><a href="#neden-pomak" className="hover:text-rose-400 transition-colors">Neden Pomak?</a></li>
                <li><a href="#yedek-parca" className="hover:text-rose-400 transition-colors">Yedek Parça Talebi</a></li>
                <li><a href="#iletisim" className="hover:text-rose-400 transition-colors">Teklif & Fiyat İste</a></li>
                <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">WhatsApp Destek Hattı</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Attribution */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              Web Tasarım & Dijital Çözüm Konsepti: <Link href="/" className="text-slate-400 hover:text-white font-medium">KvK Dijital Çözümler</Link>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/gizlilik-politikasi" className="hover:text-slate-400">Gizlilik Politikası</Link>
              <Link href="/kullanim-kosullari" className="hover:text-slate-400">Kullanım Koşulları</Link>
              <Link href="/projeler" className="hover:text-slate-400">Örnek Projeler</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* MACHINE DETAIL MODAL */}
      {selectedMachine && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#11151D] border border-white/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-rose-400 uppercase">{selectedMachine.code}</span>
                <h3 className="text-2xl font-bold text-white mt-1">{selectedMachine.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMachine(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedMachine.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Lazer Güç Seçenekleri</span>
                <span className="text-slate-200 font-bold">{selectedMachine.powerRange}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Çalışma Alanı</span>
                <span className="text-slate-200 font-bold">{selectedMachine.workingArea}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Konumlandırma Hassasiyeti</span>
                <span className="text-slate-200 font-bold">{selectedMachine.accuracy}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Maksimum Eksen Hızı</span>
                <span className="text-slate-200 font-bold">{selectedMachine.speed}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Temel Donanım & Özellikler:</span>
              <ul className="space-y-1.5">
                {selectedMachine.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedMachine(null)}
                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  const machineName = selectedMachine.name;
                  setSelectedMachine(null);
                  openQuoteFor(machineName);
                }}
                className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-900/40"
              >
                Bu Makine İçin Teklif Al
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QUICK QUOTE MODAL */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#11151D] border border-white/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-rose-400 uppercase">Hızlı Teklif Formu</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{quoteSubject || "Teklif İste"}</h3>
              </div>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Talebiniz İletildi</h4>
                <p className="text-xs text-slate-300">
                  En kısa sürede fiyat ve teknik detaylarla dönüş sağlanacaktır.
                </p>
                <button
                  onClick={() => {
                    setQuoteModalOpen(false);
                    setFormSubmitted(false);
                  }}
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="modal-fullname" className="block text-slate-300 mb-1">Ad Soyad *</label>
                  <input
                    id="modal-fullname"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label htmlFor="modal-phone" className="block text-slate-300 mb-1">Telefon / WhatsApp *</label>
                  <input
                    id="modal-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label htmlFor="modal-notes" className="block text-slate-300 mb-1">İlave Not veya Malzeme Bilgisi</label>
                  <textarea
                    id="modal-notes"
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="İhtiyaç duyduğunuz sac kalınlığı veya parça tipi..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider"
                  >
                    Teklif Gönder
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
