"use client";

import { useState, useEffect } from "react";
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
  Sliders,
  Maximize2,
  Menu,
  X,
  Target,
  Flame,
  Activity,
  Check,
  Building2,
  Box,
  Compass,
  FileSpreadsheet
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
    description: "Ağır sanayi tipi tavlanmış çelik gövde, otomatik hidrolik çift tabla ve mikron düzeyinde taşlanmış helis kramayer sistemi ile yüksek hızlı sac metal levha kesimi.",
    powerRange: "3 kW - 12 kW Fiber Rezonatör",
    workingArea: "1500 x 3000 mm",
    accuracy: "±0.03 mm",
    speed: "120 m/dk Eksenel Hız",
    materials: ["Paslanmaz Çelik", "DKP Sac", "Alüminyum", "Pirinç", "Bakır", "Galvaniz"],
    features: [
      "Otomatik çift tabla hidrolik değişim sistemi (15 sn)",
      "Raytools otomatik odaklamalı akıllı kesim kafası",
      "EtherCAT bus kontrollü endüstriyel CNC yönetim ünitesi",
      "Bölmeli pnömatik duman emme ve partikül filtreleme kanalları"
    ],
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
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
    imageUrl: "https://www.pomaklazer.com/wp-content/uploads/2025/01/fiberkafa.png"
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
    imageUrl: "https://www.pomaklazer.com/wp-content/uploads/2025/01/lazer-tup-2.jpg"
  }
];

const MACHINE_CATEGORIES = [
  {
    id: "kesim",
    code: "01 // KESİM",
    title: "Lazer Kesim Makineleri",
    subtitle: "Sac & Metal Plaka İşleme",
    desc: "1kW'tan 30kW'a kadar yüksek güçlü fiber lazer teknolojisiyle paslanmaz çelik, karbon çeliği ve alüminyum levhalarda çapaksız, mikron toleranslı kesim.",
    specs: ["1500x3000 mm - 2500x6000 mm", "3 kW - 30 kW Güç Seçenekleri", "Otomatik Değişir Tabla"],
    icon: Flame
  },
  {
    id: "markalama",
    code: "02 // MARKALAMA",
    title: "Lazer Markalama Makineleri",
    subtitle: "Yüksek Hızlı Kodlama & Seri No",
    desc: "Fiber, MOPA ve UV dalga boylarında endüstriyel parçalar, kalıplar ve seri üretim hatları için silinmez 2D Datamatrix, barkod ve logo markalama.",
    specs: ["20W - 100W Güç Aralıkları", "9000 mm/sn Galvo Tarama", "MOPA Renkli Markalama"],
    icon: Target
  },
  {
    id: "ozel",
    code: "03 // PROFİL",
    title: "Özel Lazer Çözümleri",
    subtitle: "Boru, Profil & 3D Robotik",
    desc: "Standart dışı üretim hatları için otomatik boru-profil kesim makineleri, 3D 5 eksenli robotik lazer kaynak ve özel üretim hücreleri.",
    specs: ["6m - 12m Boru Yükleme", "0.05 mm Eksenel Hassasiyet", "Pnömatik Ayna Sistemi"],
    icon: Cpu
  },
  {
    id: "yedek-parca",
    code: "04 // OPTİK & SARF",
    title: "Yedek Parçalar & Sarf Malzeme",
    subtitle: "Orijinal Optik & Mekanik Bileşenler",
    desc: "Raytools kesim kafaları, koruyucu camlar, odaklama lensleri, nozullar, seramik halkalar ve lazer güç rezonatörleri stoktan hızlı sevk.",
    specs: ["Orijinal Sarf Malzemeler", "Aynı Gün Kargo Desteği", "Teknik Değişim Rehberi"],
    icon: Wrench
  }
];

const SECTORS = [
  {
    name: "Metal & Makine Sanayi",
    desc: "Otomotiv yan sanayi parçaları, makine şaseleri, elektrik panoları ve havalandırma ekipmanlarında yüksek mukavemetli mikron kesim.",
    tags: ["Sac Metal", "Boru & Profil", "Paslanmaz", "Alüminyum"],
    metric: "±0.03 mm Tolerans"
  },
  {
    name: "Ahşap & Mobilya İmalatı",
    desc: "Dekoratif panel işlemeleri, mimari mobilya parçaları, ahşap kakma ve özel tasarım ahşap bileşenlerde hassas CO2 kazıma.",
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
    specs: "Çap: 1.0mm - 4.5mm | Orijinal Krom Kaplama",
    imageUrl: "https://www.pomaklazer.com/wp-content/uploads/2025/01/fiberkafa.png"
  },
  {
    title: "Koruyucu Camlar & Odak Lensleri",
    desc: "Yüksek saflıkta eritilmiş silika ve kuvars koruyucu camlar, ZnSe CO2 odaklama mercekleri ve kolimatör lens grupları.",
    specs: "Dalga Boyu: 1064nm / 10.6μm | AR Kaplama",
    imageUrl: "https://www.pomaklazer.com/wp-content/uploads/2025/01/fiber-f-theta-lens-lazer.png"
  },
  {
    title: "Lazer Güç Kaynakları & Rezonatörler",
    desc: "Raycus ve Maxphotonics fiber lazer güç modülleri, Q-switch ve MOPA lazer kaynakları, Reci CO2 lazer cam tüpleri.",
    specs: "30W MOPA'dan 30kW Fiber Rezonatöre Kadar",
    imageUrl: "https://www.pomaklazer.com/wp-content/uploads/2025/01/60w-80w-lazer-guc-kaynagi.png"
  },
  {
    title: "Endüstriyel Chiller & Soğutma",
    desc: "Çift devreli akıllı su soğutma üniteleri (S&A CWFL serisi), kapasitif yükseklik takip sensörleri ve kablo setleri.",
    specs: "PID Sıcaklık Kontrolü | 380V / 220V Uyumlu",
    imageUrl: "https://www.pomaklazer.com/wp-content/uploads/2025/01/cw5200-lazer-su-sogutucu.png"
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
    setFormData((prev) => ({ ...prev, machineInterest: subject }));
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

  const whatsappUrl =
    "https://wa.me/905348914905?text=" +
    encodeURIComponent(
      "Merhaba Pomak Lazer ekibi, web siteniz üzerinden lazer makineleri ve teknik teklif hakkında bilgi almak istiyorum."
    );

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1A1D21] font-sans antialiased selection:bg-[#C6371F] selection:text-white">
      
      {/* 0. KVK DIJITAL CONCEPT BADGE TOP STRIP */}
      <div className="bg-[#1E232A] text-slate-300 border-b border-slate-700/60 py-2 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="font-semibold text-slate-100">KvK Dijital Çözümler</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline font-sans">
              Pomak Lazer Endüstriyel Kurumsal Web Tasarım Demosu
            </span>
          </div>
          <Link
            href="/projeler"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-sans transition-colors"
          >
            <span>Tüm Projeler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. STANDALONE POMAK LAZER HEADER (LIGHT CORPORATE) */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-sm py-3.5"
            : "bg-white border-b border-slate-200 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="#hero" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded bg-[#1A1D21] text-white flex items-center justify-center border border-slate-700">
              <Zap className="w-4 h-4 text-[#C6371F]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black tracking-tight text-[#1A1D21] font-mono">POMAK</span>
                <span className="text-lg font-bold tracking-tight text-[#C6371F] font-mono">LAZER</span>
              </div>
              <span className="block text-[9px] tracking-[0.18em] uppercase text-slate-500 font-semibold font-mono">
                Endüstriyel Lazer Sistemleri
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            <a href="#hero" className="text-xs font-semibold text-slate-700 hover:text-[#C6371F] uppercase tracking-wider transition-colors">Ana Sayfa</a>
            <a href="#makineler" className="text-xs font-semibold text-slate-700 hover:text-[#C6371F] uppercase tracking-wider transition-colors">Makineler</a>
            <a href="#cozumler" className="text-xs font-semibold text-slate-700 hover:text-[#C6371F] uppercase tracking-wider transition-colors">Çözümler</a>
            <a href="#makine-bulucu" className="text-xs font-semibold text-slate-700 hover:text-[#C6371F] uppercase tracking-wider transition-colors">Lazer Bulucu</a>
            <a href="#uygulamalar" className="text-xs font-semibold text-slate-700 hover:text-[#C6371F] uppercase tracking-wider transition-colors">Uygulamalar</a>
            <a href="#yedek-parca" className="text-xs font-semibold text-slate-700 hover:text-[#C6371F] uppercase tracking-wider transition-colors">Yedek Parçalar</a>
            <a href="#neden-pomak" className="text-xs font-semibold text-slate-700 hover:text-[#C6371F] uppercase tracking-wider transition-colors">Hakkımızda</a>
            <a href="#iletisim" className="text-xs font-semibold text-slate-700 hover:text-[#C6371F] uppercase tracking-wider transition-colors">İletişim</a>
          </nav>

          {/* Header Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              title="WhatsApp İletişim"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => openQuoteFor("Header Teklif")}
              className="px-4 py-2 rounded bg-[#C6371F] hover:bg-[#A82D19] text-white text-xs font-bold uppercase tracking-wider border border-[#B0301B] transition-colors cursor-pointer"
            >
              Teklif Al
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded bg-slate-100 border border-slate-300 text-slate-700"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-2.5">
              <a onClick={() => setMobileMenuOpen(false)} href="#hero" className="text-sm font-semibold text-slate-800 hover:text-[#C6371F] py-1">Ana Sayfa</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#makineler" className="text-sm font-semibold text-slate-800 hover:text-[#C6371F] py-1">Makineler</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#cozumler" className="text-sm font-semibold text-slate-800 hover:text-[#C6371F] py-1">Çözümler</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#makine-bulucu" className="text-sm font-semibold text-slate-800 hover:text-[#C6371F] py-1">Lazer Bulucu</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#uygulamalar" className="text-sm font-semibold text-slate-800 hover:text-[#C6371F] py-1">Uygulamalar</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#yedek-parca" className="text-sm font-semibold text-slate-800 hover:text-[#C6371F] py-1">Yedek Parçalar</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#neden-pomak" className="text-sm font-semibold text-slate-800 hover:text-[#C6371F] py-1">Hakkımızda</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#iletisim" className="text-sm font-semibold text-slate-800 hover:text-[#C6371F] py-1">İletişim</a>
            </nav>
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openQuoteFor("Mobil Menü Teklifi");
                }}
                className="w-full py-2.5 rounded bg-[#C6371F] text-white font-bold text-center text-xs uppercase tracking-wider"
              >
                Teklif Al
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-center text-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Destek Hattı</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (SOLID INDUSTRIAL GRAPHITE CONTRAST) */}
      <section id="hero" className="relative bg-[#161A22] text-white py-16 lg:py-24 border-b border-slate-800">
        
        {/* Subtle CAD Blueprint Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Editorial Area */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Engineering Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 border border-white/15 text-slate-200 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6371F]" />
                <span className="font-semibold tracking-wider uppercase text-[11px]">
                  Endüstriyel CNC Lazer İmalat Teknolojileri
                </span>
              </div>

              {/* Headline - Solid Typography without Gradient Gimmicks */}
              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                ÜRETİMİN GÜCÜ, <br />
                <span className="text-slate-100">LAZERİN HASSASİYETİ.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Pomak Lazer; sac metal, ahşap, akrilik ve endüstriyel üretim hatları için mikron düzeyinde hassasiyete sahip fiber lazer kesim, CO2 kazıma ve lazer markalama makineleri sunar. Yüksek hız, sıfır tolerans ve kesintisiz teknik servis gücü.
              </p>

              {/* Flat Engineering CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href="#makineler"
                  className="w-full sm:w-auto px-7 py-3.5 rounded bg-[#C6371F] hover:bg-[#A82D19] text-white font-bold text-xs uppercase tracking-wider border border-[#B0301B] flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Makineleri İncele</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => openQuoteFor("Hero Uzman Görüşmesi")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-semibold text-xs border border-white/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-300" />
                  <span>Uzmanla Görüş</span>
                </button>
              </div>

              {/* Realistic Engineering Telemetry Strip */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="border-l-2 border-[#C6371F] pl-3">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">±0.03 mm</div>
                  <div className="text-[11px] text-slate-400 font-mono">Konumlandırma</div>
                </div>
                <div className="border-l-2 border-slate-600 pl-3">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">1 - 30 kW</div>
                  <div className="text-[11px] text-slate-400 font-mono">Fiber Rezonatör</div>
                </div>
                <div className="border-l-2 border-slate-600 pl-3">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">120 m/dk</div>
                  <div className="text-[11px] text-slate-400 font-mono">Eksenel Hız</div>
                </div>
              </div>

            </div>

            {/* Right Machine Technical Card with CAD Corner Marks */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-[#0F131A] rounded-lg border border-slate-700 p-3 shadow-xl">
                
                {/* CAD Blueprint Corner Marks */}
                <div className="absolute top-1 left-1 text-[10px] font-mono text-slate-500 select-none">⌜</div>
                <div className="absolute top-1 right-1 text-[10px] font-mono text-slate-500 select-none">⌝</div>
                <div className="absolute bottom-1 left-1 text-[10px] font-mono text-slate-500 select-none">⌞</div>
                <div className="absolute bottom-1 right-1 text-[10px] font-mono text-slate-500 select-none">⌟</div>

                <div className="relative aspect-[16/11] rounded bg-slate-900 overflow-hidden border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80"
                    alt="Endüstriyel Fiber Lazer Sac Kesim Makinesi Gövdesi"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-[#0F131A]/95 border-t border-slate-800 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#C6371F] font-bold block">MODEL: PL-FIBER 3015 PRO</span>
                      <span className="text-xs font-semibold text-slate-200">1500 x 3000 mm Çift Tabla / 6kW - 12kW</span>
                    </div>
                    <button
                      onClick={() => setSelectedMachine(FEATURED_MACHINES[0])}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      title="Teknik Şema"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-[#C6371F]" />
                    <span>Raytools Kesim Kafası</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-[#C6371F]" />
                    <span>EtherCAT CNC Kontrol</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TRUST / VALUE STRIP (LIGHT INDUSTRIAL) */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="flex items-start gap-3.5 p-3 rounded-lg border border-slate-200 bg-[#FAFBFD]">
              <div className="p-2 rounded bg-slate-100 border border-slate-300 text-[#C6371F] shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Endüstriyel Çözümler</h2>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  Ağır sanayiden seri imalat atölyelerine kadar yüksek verimli fiber ve CO2 lazer makineleri.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-lg border border-slate-200 bg-[#FAFBFD]">
              <div className="p-2 rounded bg-slate-100 border border-slate-300 text-[#C6371F] shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Teknik Destek</h2>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  Yerinde kurulum, operatör eğitimleri ve tecrübeli servis mühendislerimizle kesintisiz destek.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-lg border border-slate-200 bg-[#FAFBFD]">
              <div className="p-2 rounded bg-slate-100 border border-slate-300 text-[#C6371F] shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Yedek Parça</h2>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  Orijinal optik lensler, nozullar, seramik halkalar ve rezonatör parçaları doğrudan stoktan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-lg border border-slate-200 bg-[#FAFBFD]">
              <div className="p-2 rounded bg-slate-100 border border-slate-300 text-[#C6371F] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Türkiye Geneli Hizmet</h2>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  Tüm organize sanayi bölgelerine hızlı teknik servis, yedek parça sevkiyatı ve danışmanlık.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MACHINE SOLUTIONS (CLEAN LIGHT CARDS) */}
      <section id="cozumler" className="py-20 bg-[#F4F5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-mono uppercase font-semibold">
              Katalog & Çözümler
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Üretiminize Uygun Lazer Çözümü
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Farklı malzeme türleri, sac kalınlıkları ve üretim hızları için optimize edilmiş yüksek mühendislik ürünü lazer sistemleri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MACHINE_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-lg border border-slate-200 p-7 hover:border-slate-400 transition-colors shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded bg-slate-100 text-[#C6371F] border border-slate-200">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">{cat.code}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {cat.desc}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      {cat.specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C6371F]" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href="#makineler"
                      className="text-xs font-bold uppercase tracking-wider text-[#C6371F] hover:text-[#A82D19] inline-flex items-center gap-1"
                    >
                      <span>Makineleri İncele</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => openQuoteFor(cat.title)}
                      className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-300 transition-colors"
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

      {/* 5. INTERACTIVE MACHINE FINDER (LIGHT TECHNICAL PANEL) */}
      <section id="makine-bulucu" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-2.5 mb-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-mono font-semibold uppercase">
              <Sliders className="w-3 h-3 text-[#C6371F]" />
              <span>İhtiyaç Analizi & Lazer Bulucu</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Hangi Lazer Çözümü Size Uygun?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              3 adımda üretim hedeflerinizi ve malzemenizi seçin, işletmeniz için en uygun rezonatör gücü ve makine modelini bulun.
            </p>
          </div>

          {/* Finder Card */}
          <div className="bg-[#FAFBFD] rounded-lg border border-slate-300 p-6 sm:p-8 shadow-sm">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-5">
              {[
                { step: 1, label: "1. İşlem Türü" },
                { step: 2, label: "2. Malzeme" },
                { step: 3, label: "3. Üretim Ölçeği" },
                { step: 4, label: "4. Öneri" }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      finderStep === s.step
                        ? "bg-[#C6371F] text-white"
                        : finderStep > s.step
                        ? "bg-slate-800 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {finderStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {finderStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Ne yapmak istiyorsunuz?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
                      className={`p-4 rounded border text-left transition-colors cursor-pointer ${
                        finderAction === opt.id
                          ? "bg-white border-[#C6371F] shadow-sm text-slate-900"
                          : "bg-white border-slate-200 hover:border-slate-400 text-slate-700"
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900">{opt.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {finderStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Hangi malzemeyle çalışıyorsunuz?</h3>
                  <button onClick={() => setFinderStep(1)} className="text-xs text-[#C6371F] hover:underline font-medium">Geri Dön</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      className={`p-3.5 rounded border text-left transition-colors cursor-pointer ${
                        finderMaterial === mat.id
                          ? "bg-white border-[#C6371F] shadow-sm text-slate-900"
                          : "bg-white border-slate-200 hover:border-slate-400 text-slate-700"
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{mat.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{mat.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {finderStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Üretim ölçeğiniz nedir?</h3>
                  <button onClick={() => setFinderStep(2)} className="text-xs text-[#C6371F] hover:underline font-medium">Geri Dön</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
                      className={`p-4 rounded border text-left transition-colors cursor-pointer ${
                        finderScale === sc.id
                          ? "bg-white border-[#C6371F] shadow-sm text-slate-900"
                          : "bg-white border-slate-200 hover:border-slate-400 text-slate-700"
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900">{sc.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{sc.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Result */}
            {finderStep === 4 && (
              <div className="space-y-5">
                {(() => {
                  const rec = getFinderRecommendation();
                  return (
                    <div className="p-6 rounded border border-slate-300 bg-white space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#C6371F] font-bold">Önerilen Sistem</span>
                          <h4 className="text-lg sm:text-xl font-bold text-slate-900">{rec.title}</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold border border-slate-200 self-start sm:self-auto">
                          {rec.category}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {rec.reason}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Önerilen Güç</span>
                          <span className="text-xs font-bold text-slate-900">{rec.recomPower}</span>
                        </div>
                        <div className="p-3 rounded bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Çalışma Alanı</span>
                          <span className="text-xs font-bold text-slate-900">{rec.recomArea}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                        <button
                          onClick={() => openQuoteFor(`Bulucu: ${rec.title}`)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded bg-[#C6371F] hover:bg-[#A82D19] text-white font-bold text-xs uppercase tracking-wider"
                        >
                          Fiyat Teklifi Al
                        </button>
                        <button
                          onClick={() => {
                            setFinderStep(1);
                            setFinderAction("");
                            setFinderMaterial("");
                            setFinderScale("");
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300"
                        >
                          Seçimleri Sıfırla
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

      {/* 6. FEATURED MACHINES (LIGHT SHOWCASE) */}
      <section id="makineler" className="py-20 bg-[#F4F5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-mono uppercase font-semibold">
                Mühendislik Portföyü
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Öne Çıkan Makineler
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Yüksek rezonatör verimliliği, sağlam mekanik gövde yapısı ve kullanıcı dostu CNC kontrol arayüzü ile donatılmış lazer sistemlerimiz.
              </p>
            </div>
            <div>
              <button
                onClick={() => openQuoteFor("Katalog Talebi")}
                className="px-4 py-2 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Katalog & Teklif İste
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURED_MACHINES.map((machine) => (
              <div
                key={machine.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-400 transition-colors"
              >
                <div>
                  {/* Photo with technical tags */}
                  <div className="relative aspect-[16/9] bg-slate-100 border-b border-slate-200 overflow-hidden">
                    <img
                      src={machine.imageUrl}
                      alt={machine.name}
                      className="w-full h-full object-contain p-4 bg-white"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded bg-[#1A1D21] text-white text-[11px] font-mono font-bold">
                        {machine.code}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-800 text-[10px] font-mono uppercase font-semibold border border-slate-300">
                        {machine.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{machine.name}</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {machine.description}
                      </p>
                    </div>

                    {/* Spec Grid */}
                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded bg-[#FAFBFD] border border-slate-200 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">Güç Aralığı</span>
                        <span className="text-slate-900 font-bold">{machine.powerRange}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">Çalışma Alanı</span>
                        <span className="text-slate-900 font-bold">{machine.workingArea}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">Hassasiyet</span>
                        <span className="text-slate-900 font-bold">{machine.accuracy}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">Maks Hız</span>
                        <span className="text-slate-900 font-bold">{machine.speed}</span>
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-slate-500">Uyumlu Malzemeler:</span>
                      <div className="flex flex-wrap gap-1">
                        {machine.materials.map((mat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700 border border-slate-200">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 gap-3">
                  <button
                    onClick={() => setSelectedMachine(machine)}
                    className="px-3.5 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300"
                  >
                    Detaylı İncele
                  </button>
                  <button
                    onClick={() => openQuoteFor(machine.name)}
                    className="px-4 py-2 rounded bg-[#C6371F] hover:bg-[#A82D19] text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Teklif İste
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. APPLICATIONS / INDUSTRIES (LIGHT CARDS) */}
      <section id="uygulamalar" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-mono uppercase font-semibold">
              Endüstriyel Alanlar
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Sektörel Uygulama Alanları
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Pomak Lazer makineleri, otomotivden mobilyaya, reklamcılıktan tekstil kalıplarına kadar onlarca sanayi kolunda yüksek verimle çalışır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SECTORS.map((sec, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-[#FAFBFD] border border-slate-200 hover:border-slate-300 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">0{idx + 1} // SEKTÖR</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">
                      {sec.metric}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{sec.name}</h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap gap-1.5">
                  {sec.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white text-[10px] font-mono text-slate-600 border border-slate-200">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. WHY POMAK (LIGHT CORPORATE INTEGRITY) */}
      <section id="neden-pomak" className="py-20 bg-[#F4F5F7] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-mono font-semibold uppercase">
                Mühendislik & Güvenilirlik
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Neden Pomak Lazer?
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Lazer kesim ve markalama makinelerimiz, yalnızca bir ekipman değil; işletmenizin üretim hızını, tolerans kalitesini ve kârlılığını artıran komple bir endüstriyel çözümdür.
              </p>

              <div className="space-y-3 pt-1">
                {[
                  { title: "Hassas Üretim Mimarisi", desc: "Mikron düzeyinde işleme için taşlanmış helis dişli kramayer ve Japon servo motor altyapısı." },
                  { title: "Teknik Uzmanlık & Kurulum", desc: "Uzman mühendis kadromuzla yerinde kurulum, kalibrasyon ve detaylı operatör eğitimleri." },
                  { title: "İhtiyaca Özel Makine Çözümleri", desc: "Farklı tabla ölçüleri, rezonatör kapasiteleri ve boru kesim ataşman opsiyonları." },
                  { title: "Yedek Parça Stok Güvencesi", desc: "Orijinal optik lensler, nozullar ve rezonatör sarflarında anında stoktan sevkiyat." },
                  { title: "Satış Sonrası Kesintisiz Destek", desc: "Uzaktan arıza teşhisi, periyodik bakım ve teknik danışmanlık hizmeti." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-slate-200 border border-slate-300 text-[#C6371F] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white rounded-lg border border-slate-300 p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Activity className="w-4 h-4 text-[#C6371F]" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono">Kalite & Test Standardı</h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Tüm makinelerimiz montaj sonrası 72 saatlik sürekli stres ve rezonans testlerinden geçirilerek sevk edilir. Lazer ışın kalitesi, odak kararlılığı ve eksenel paralellik toleransları lazer interferometre cihazlarıyla belgelenir.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded bg-[#FAFBFD] border border-slate-200">
                    <div className="text-xl font-bold font-mono text-slate-900">100%</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Orijinal Parça</div>
                  </div>
                  <div className="p-3 rounded bg-[#FAFBFD] border border-slate-200">
                    <div className="text-xl font-bold font-mono text-slate-900">Yerinde</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Servis & Eğitim</div>
                  </div>
                </div>

                <button
                  onClick={() => openQuoteFor("Şirket Bilgi Talebi")}
                  className="w-full py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Kurumsal Bilgi & Danışmanlık Al
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. SPARE PARTS SECTION (REAL POMAK LAZER PARTS) */}
      <section id="yedek-parca" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-mono uppercase font-semibold">
                Orijinal Sarf Malzemeler
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Makineniz İçin Doğru Parça
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Tüm lazer kesim ve markalama kafalarıyla uyumlu orijinal optik lensler, nozullar, seramik gövdeler ve güç rezonatörleri.
              </p>
            </div>
            <div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Parça Kodu Sorgula</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SPARE_PARTS_ITEMS.map((part, i) => (
              <div
                key={i}
                className="bg-[#FAFBFD] rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="aspect-[4/3] bg-white border-b border-slate-200 p-3 flex items-center justify-center">
                    <img
                      src={part.imageUrl}
                      alt={part.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-xs font-bold text-slate-900">{part.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-normal">{part.desc}</p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">{part.specs}</div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => openQuoteFor(`Yedek Parça: ${part.title}`)}
                    className="w-full py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    Stok & Fiyat Sor
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. FINAL CTA (CLEAN CORPORATE SECTION) */}
      <section id="iletisim" className="py-20 bg-[#161A22] text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#0F131A] rounded-lg border border-slate-700 p-8 sm:p-12 space-y-8 shadow-xl">
            
            <div className="text-center max-w-xl mx-auto space-y-2.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/10 text-slate-200 text-[10px] font-mono uppercase font-bold">
                Doğrudan İletişim & Teklif
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Üretiminiz İçin Doğru Lazer Çözümünü Birlikte Bulalım.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                İşletmenizin malzeme türü, kalınlık hedefleri ve bütçesine en uygun lazer makinesi için uzmanlarımızla hemen iletişime geçin.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded bg-emerald-950/40 border border-emerald-600/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Talebiniz Alındı</h3>
                <p className="text-xs text-slate-300">
                  Pomak Lazer uzman mühendislerimiz belirttiğiniz iletişim bilgilerinden en kısa sürede sizinle iletişime geçecektir.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-3 px-3 py-1.5 rounded bg-white/10 text-xs font-semibold text-white"
                >
                  Yeni Mesaj
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3.5 max-w-xl mx-auto text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pomak-fullname" className="block text-slate-300 font-medium mb-1">Ad Soyad *</label>
                    <input
                      id="pomak-fullname"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Ahmet Yılmaz"
                      className="w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C6371F]"
                    />
                  </div>
                  <div>
                    <label htmlFor="pomak-phone" className="block text-slate-300 font-medium mb-1">Telefon / WhatsApp *</label>
                    <input
                      id="pomak-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0532 000 00 00"
                      className="w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C6371F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pomak-company" className="block text-slate-300 font-medium mb-1">Firma / Atölye Adı</label>
                    <input
                      id="pomak-company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Yılmaz Makine Sanayi"
                      className="w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C6371F]"
                    />
                  </div>
                  <div>
                    <label htmlFor="pomak-interest" className="block text-slate-300 font-medium mb-1">İlgilendiğiniz Model</label>
                    <select
                      id="pomak-interest"
                      value={formData.machineInterest}
                      onChange={(e) => setFormData({ ...formData, machineInterest: e.target.value })}
                      className="w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#C6371F]"
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
                  <label htmlFor="pomak-message" className="block text-slate-300 font-medium mb-1">Mesajınız / Malzeme ve Kalınlık Detayı</label>
                  <textarea
                    id="pomak-message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Örn: 5mm paslanmaz ve 10mm DKP sac kesimi için 6kW lazer teklifi almak istiyorum."
                    className="w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C6371F] resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3 rounded bg-[#C6371F] hover:bg-[#A82D19] text-white font-bold text-xs uppercase tracking-wider border border-[#B0301B] transition-colors cursor-pointer"
                  >
                    Teklif Al
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
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

      {/* 11. STANDALONE POMAK LAZER FOOTER (DARK CORPORATE) */}
      <footer className="bg-[#0D1016] text-slate-400 text-xs pt-14 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
            
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#1A1D21] text-white flex items-center justify-center border border-slate-700">
                  <Zap className="w-3.5 h-3.5 text-[#C6371F]" />
                </div>
                <span className="text-base font-black text-white font-mono">POMAK LAZER</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Endüstriyel fiber lazer kesim, lazer markalama, boru lazer sistemleri ve orijinal optik yedek parça çözümleri. Türkiye geneli teknik servis ve kurulum güvencesi.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Tüm hakları saklıdır © {new Date().getFullYear()} Pomak Lazer Sistemleri
              </div>
            </div>

            {/* Links: Makineler */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Makineler</div>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#makineler" className="hover:text-white transition-colors">Fiber Sac Kesim</a></li>
                <li><a href="#makineler" className="hover:text-white transition-colors">Lazer Markalama</a></li>
                <li><a href="#makineler" className="hover:text-white transition-colors">Boru & Profil Kesim</a></li>
                <li><a href="#makineler" className="hover:text-white transition-colors">CO2 Lazer Sistemleri</a></li>
                <li><a href="#yedek-parca" className="hover:text-white transition-colors">Optik & Nozullar</a></li>
              </ul>
            </div>

            {/* Links: Uygulamalar */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Uygulamalar</div>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#uygulamalar" className="hover:text-white transition-colors">Metal & Sac Sanayi</a></li>
                <li><a href="#uygulamalar" className="hover:text-white transition-colors">Ahşap & Mobilya</a></li>
                <li><a href="#uygulamalar" className="hover:text-white transition-colors">Akrilik & Reklam</a></li>
                <li><a href="#uygulamalar" className="hover:text-white transition-colors">Tekstil & Deri</a></li>
                <li><a href="#uygulamalar" className="hover:text-white transition-colors">Endüstriyel Kodlama</a></li>
              </ul>
            </div>

            {/* Links: İletişim */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">İletişim</div>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#neden-pomak" className="hover:text-white transition-colors">Neden Pomak?</a></li>
                <li><a href="#yedek-parca" className="hover:text-white transition-colors">Yedek Parça Talebi</a></li>
                <li><a href="#iletisim" className="hover:text-white transition-colors">Teklif & Fiyat İste</a></li>
                <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">WhatsApp Destek Hattı</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              Web Tasarım & Dijital Çözüm Konsepti: <Link href="/" className="text-slate-400 hover:text-white font-medium">KvK Dijital Çözümler</Link>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/gizlilik-politikasi" className="hover:text-slate-400">Gizlilik Politikası</Link>
              <Link href="/kullanim-kosullari" className="hover:text-slate-400">Kullanım Koşulları</Link>
              <Link href="/projeler" className="hover:text-slate-400">Örnek Projeler</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* MACHINE DETAIL MODAL (LIGHT TECHNICAL) */}
      {selectedMachine && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-lg p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#C6371F] uppercase">{selectedMachine.code}</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedMachine.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMachine(null)}
                className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedMachine.description}
            </p>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded bg-slate-50 border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Lazer Güç Seçenekleri</span>
                <span className="text-slate-900 font-bold">{selectedMachine.powerRange}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Çalışma Alanı</span>
                <span className="text-slate-900 font-bold">{selectedMachine.workingArea}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Konumlandırma Hassasiyeti</span>
                <span className="text-slate-900 font-bold">{selectedMachine.accuracy}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Maksimum Eksen Hızı</span>
                <span className="text-slate-900 font-bold">{selectedMachine.speed}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Teknik Donanım & Özellikler:</span>
              <ul className="space-y-1">
                {selectedMachine.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-[#C6371F] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedMachine(null)}
                className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  const machineName = selectedMachine.name;
                  setSelectedMachine(null);
                  openQuoteFor(machineName);
                }}
                className="px-5 py-2 rounded bg-[#C6371F] hover:bg-[#A82D19] text-white text-xs font-bold uppercase tracking-wider"
              >
                Bu Model İçin Teklif Al
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QUICK QUOTE MODAL (LIGHT) */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C6371F] uppercase">Fiyat & Teknik Teklif</span>
                <h3 className="text-lg font-bold text-slate-900">{quoteSubject || "Teklif İste"}</h3>
              </div>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="text-center py-5 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Talebiniz İletildi</h4>
                <p className="text-xs text-slate-600">
                  En kısa sürede fiyat ve teknik detaylarla dönüş sağlanacaktır.
                </p>
                <button
                  onClick={() => {
                    setQuoteModalOpen(false);
                    setFormSubmitted(false);
                  }}
                  className="px-4 py-2 rounded bg-[#C6371F] text-white text-xs font-bold"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="modal-fullname" className="block text-slate-700 font-medium mb-1">Ad Soyad *</label>
                  <input
                    id="modal-fullname"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    className="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C6371F]"
                  />
                </div>
                <div>
                  <label htmlFor="modal-phone" className="block text-slate-700 font-medium mb-1">Telefon / WhatsApp *</label>
                  <input
                    id="modal-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C6371F]"
                  />
                </div>
                <div>
                  <label htmlFor="modal-notes" className="block text-slate-700 font-medium mb-1">İlave Not veya Malzeme Bilgisi</label>
                  <textarea
                    id="modal-notes"
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="İhtiyaç duyduğunuz sac kalınlığı veya parça tipi..."
                    className="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C6371F] resize-none"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(false)}
                    className="px-3.5 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#C6371F] hover:bg-[#A82D19] text-white font-bold uppercase tracking-wider"
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
