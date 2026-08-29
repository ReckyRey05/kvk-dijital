"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
  Star,
  Users,
  Smile,
  Activity,
  HeartPulse,
  Microscope,
  Cpu,
  FileCheck2,
  Stethoscope,
  X,
  Menu,
  Check,
  Search,
  ExternalLink
} from "lucide-react";

interface Treatment {
  id: string;
  category: "estetik" | "cerrahi" | "tedavi" | "ortodonti";
  title: string;
  shortDesc: string;
  fullDesc: string;
  duration: string;
  sessions: string;
  benefits: string[];
  imageUrl: string;
  badge: string;
}

const TREATMENTS: Treatment[] = [
  {
    id: "gulus-tasarimi",
    category: "estetik",
    title: "Dijital Gülüş Tasarımı (Hollywood Smile)",
    shortDesc: "Yüz hatlarınıza, dudak yapınıza ve ten renginize tam uyumlu, kişiye özel bilgisayarlı estetik simülasyon ve gülüş estetiği.",
    fullDesc: "Dijital gülüş tasarımı; hastanın yüz proporsiyonu, dudak çizgisi ve diş eti simetrisi 3D dijital ortamda taranarak başlar. Tedaviye başlamadan önce hastaya bitiş halinin mockup simülasyonu gösterilir. Lamine porselen veya E-Max materyalleriyle doğal ve kusursuz bir estetik elde edilir.",
    duration: "4 - 7 Gün",
    sessions: "2 - 3 Seans",
    benefits: [
      "3D Dijital Modelleme ile sonucu önceden görme",
      "Minimal diş aşındırması ile maksimum koruma",
      "Doğal ışık geçirgenliği ve leke tutmayan porselen yüzey",
      "Kişiye özel yüz ve karakter uyumu"
    ],
    imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80",
    badge: "En Çok Tercih Edilen"
  },
  {
    id: "implant-tedavisi",
    category: "cerrahi",
    title: "Dental İmplant & Cerrahi Uygulamalar",
    shortDesc: "Eksik dişlerin yerini alan, titanyum veya zirkonyum köklerle ömür boyu çiğneme fonksiyonu ve estetik sağlayan kalıcı tedavi.",
    fullDesc: "Tek diş eksikliğinden tam dişsizlik vakalarına kadar, çene kemiğine yerleştirilen biyouyumlu titanyum vidalar üzerine sabit protezler yapılır. Kliniğimizde uluslararası sertifikalı ve pasaportlu premium implant markaları kullanılmaktadır. Dikişsiz ve navigasyonlu cerrahi seçenekleri mevcuttur.",
    duration: "15 - 30 Dakika (İmplant Başı)",
    sessions: "Cerrahi + Protez Aşaması",
    benefits: [
      "Komşu sağlıklı dişlere hiçbir zarar verilmez",
      "Doğal diş kökü hissi ve %100 çiğneme konforu",
      "Çene kemiği erimesini engelleyen biyolojik yapı",
      "Ömür boyu üretici garantisi ve resmi implant pasaportu"
    ],
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
    badge: "Ömür Boyu Garanti"
  },
  {
    id: "zirkonyum-kaplama",
    category: "estetik",
    title: "Zirkonyum & E-Max Porselen Kaplama",
    shortDesc: "Metal desteksiz, yüksek biyouyumluluğa ve üstün ışık geçirgenliğine sahip yeni nesil estetik diş kaplamaları.",
    fullDesc: "Zirkonyum oksit altyapı, diş etinde kararma veya alerjik reaksiyon yapmaz. Doğal diş minesiyle birebir aynı optik özelliklere sahip olan zirkonyum ve E-Max kronlar, hem ön diş estetiğinde hem de arka çiğneme bölgelerinde yüksek mukavemet sağlar.",
    duration: "3 - 5 Gün",
    sessions: "2 Seans",
    benefits: [
      "Diş eti kenarlarında gri-mor gölgelenme yapmaz",
      "Yüksek dayanıklılık ve kırılma direnci",
      "Biyouyumlu malzeme ile %0 alerji riski",
      "Sıcak-soğuk hassasiyetine karşı mükemmel yalıtım"
    ],
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
    badge: "Doğal Estetik"
  },
  {
    id: "dis-beyazlatma",
    category: "estetik",
    title: "Lazerli Ofis Tipi Diş Beyazlatma (Bleaching)",
    shortDesc: "Klinik ortamında özel medikal jel ve mavi LED/lazer aktivasyonu ile tek seansta 3-5 tona kadar kalıcı beyazlık.",
    fullDesc: "Kahve, çay, tütün ve yaşa bağlı renklenmeler, diş minesine zarar vermeyen onaylı klinik beyazlatma ajanları ile güvenle açılır. İşlem öncesi diş eti koruyucu bariyer uygulanarak sıfır hassasiyet hedeflenir.",
    duration: "45 - 60 Dakika",
    sessions: "Tek Seans",
    benefits: [
      "Tek seansta gözle görülür 3-5 ton beyazlama",
      "Mine dostu pH dengeli medikal beyazlatma",
      "Diş etlerini koruyan özel bariyer sistemi",
      "Uzun süreli ve ışıltılı beyazlık"
    ],
    imageUrl: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80",
    badge: "Hızlı Sonuç"
  },
  {
    id: "seffaf-plak",
    category: "ortodonti",
    title: "Şeffaf Plak Tedavisi (Telsiz Ortodonti)",
    shortDesc: "Geleneksel metal tellere gerek kalmadan, dışarıdan fark edilmeyen şeffaf plaklarla çapraşık dişlerin düzeltilmesi.",
    fullDesc: "3D ağız içi tarama yapılarak haftalık değişen kişiye özel şeffaf plaklar üretilir. Yemek yerken veya özel günlerde kolayca çıkarılabilir. Sosyal ve profesyonel hayatı etkilemeden estetik bir ortodontik tedavi sunar.",
    duration: "6 - 14 Ay",
    sessions: "Aylık Kontrol",
    benefits: [
      "Tamamen şeffaf ve dışarıdan neredeyse görünmez",
      "Yemek yerken çıkarılabilme özgürlüğü",
      "Yara veya batma yapmayan yumuşak materyal",
      "Dijital simülasyonla ay ay düzelmeyi izleme"
    ],
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
    badge: "Görünmez Konfor"
  },
  {
    id: "kanal-tedavisi",
    category: "tedavi",
    title: "Ağrısız Kanal Tedavisi (Endodonti)",
    shortDesc: "İleri çürük veya travma nedeniyle enfekte olan diş köklerinin mikrocerrahi ve dijital apeks bulucularla kurtarılması.",
    fullDesc: "Kendi doğal dişinizi ağızda tutmak birinci önceliğimizdir. Döner alet sistemleri ve dijital apeks bulucular ile enfekte sinir dokusu temizlenir, dezenfekte edilir ve biyouyumlu kanal dolgusuyla kapatılır. Gelişmiş lokal anestezi sayesinde işlem tamamen ağrısızdır.",
    duration: "45 - 60 Dakika",
    sessions: "1 - 2 Seans",
    benefits: [
      "Kendi doğal dişinizi çekilmekten kurtarır",
      "İleri teknoloji anestezi ile %100 ağrısız süreç",
      "Mikroskopik hassasiyette kanal temizliği",
      "Uzun ömürlü çiğneme sağlığı"
    ],
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    badge: "Diş Kurtarma"
  },
  {
    id: "cocuk-dis-hekimligi",
    category: "tedavi",
    title: "Çocuk Diş Hekimliği (Pedodonti)",
    shortDesc: "0-14 yaş çocuklarda süt ve daimi dişlerin sağlığı, koruyucu flor uygulamaları, fissür örtücüler ve yer tutucular.",
    fullDesc: "Çocuklara diş hekimi korkusu (dental fobi) yaşatmadan, oyun temelli yaklaşımla koruyucu tedaviler uygulanır. Çürük oluşumunu engelleyen florlama ve fissür örtücü uygulamaları ile gelecekteki diş dizilim sorunları önceden engellenir.",
    duration: "30 Dakika",
    sessions: "6 Aylık Rutin",
    benefits: [
      "Pedodontik pedagojik ve şefkatli yaklaşım",
      "Çürüğü %80'e kadar önleyen fissür örtücüler",
      "Erken diş kaybında yer tutucu uygulaması",
      "Gelecek nesillere diş fırçalama sevgisi aşılama"
    ],
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
    badge: "Korkusuz Tedavi"
  },
  {
    id: "dis-eti-tedavisi",
    category: "tedavi",
    title: "Periodontoloji & Pembe Estetik",
    shortDesc: "Diş eti kanamaları, diş eti çekilmeleri ve gülüş sırasında fazla görünen diş etlerinin lazerle estetik şekillendirilmesi.",
    fullDesc: "Sağlıklı dişlerin temeli sağlıklı diş etleridir. Ultrasonik aletler ve lazer teknolojisiyle diş eti iltihapları tedavi edilir. 'Gummy smile' (gülünce diş etinin fazla görünmesi) durumunda lazer ile kanamasız ve dikişsiz estetik şekillendirme yapılır.",
    duration: "30 - 45 Dakika",
    sessions: "1 - 2 Seans",
    benefits: [
      "Kanamasız ve dikişsiz lazerli şekillendirme",
      "Diş eti çekilmesini durdurma ve kök yüzeyi koruma",
      "Ağız kokusunun ana kaynağını yok etme",
      "Simetrik ve estetik pembe gülüş hattı"
    ],
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
    badge: "Lazer Destekli"
  }
];

const CLINIC_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Maksimum Sterilizasyon & Hijyen",
    desc: "Her hasta öncesi otoklavda 134°C'de sterilize edilen el aletleri ve tek kullanımlık medikal sarf malzemeleriyle uluslararası hijyen standardı."
  },
  {
    icon: Cpu,
    title: "3D Dijital Ağız İçi Tarama",
    desc: "Mide bulantısı yaratan geleneksel hamur ölçülere son. Saniyeler içinde mikron hassasiyetinde 3D dijital ölçü ve anında simülasyon."
  },
  {
    icon: HeartPulse,
    title: "Ağrısız & Konforlu Tedavi",
    desc: "Özel lokal anestezi teknikleri ve sakinleştirici klinik ortamıyla diş hekimi kaygısını tamamen ortadan kaldıran hasta odaklı yaklaşım."
  },
  {
    icon: FileCheck2,
    title: "Şeffaf Tedavi & Garanti Belgesi",
    desc: "Sürpriz maliyetler olmadan, tedaviye başlamadan önce net planlama, malzeme kalite sertifikaları ve resmi garanti belgeleri."
  }
];

const BEFORE_AFTER = [
  {
    id: 1,
    title: "E-Max Lamine Gülüş Tasarımı",
    desc: "Renklenme ve aralık (diastema) şikayeti olan hastamıza 6 üye E-Max lamine porselen uygulaması.",
    treatment: "Gülüş Tasarımı",
    timeframe: "5 Gün"
  },
  {
    id: 2,
    title: "Zirkonyum Kaplama & Diş Eti Şekillendirme",
    desc: "Eski metal destekli kaplamaların zirkonyum ile değiştirilmesi ve lazerle pembe estetik uyumu.",
    treatment: "Zirkonyum & Gingivektomi",
    timeframe: "6 Gün"
  },
  {
    id: 3,
    title: "Lazerli Ofis Tipi Diş Beyazlatma",
    desc: "Tek seansta 4 ton renk açılması sağlanan, diş minesi korumalı medikal beyazlatma protokolü.",
    treatment: "Bleaching",
    timeframe: "45 Dakika"
  }
];

const REVIEWS = [
  {
    name: "Selin Yılmaz",
    district: "Kartal, İstanbul",
    treatment: "Gülüş Tasarımı & Zirkonyum",
    rating: 5,
    comment: "Damla Hanım'ın titizliği ve yaklaşımı inanılmaz. Yıllardır gülerken dişlerimi saklardım, şimdi aynaya her baktığımda kendime güvenim yerine geliyor. Tedavi süresince hiçbir ağrı hissetmedim.",
    date: "1 Hafta Önce"
  },
  {
    name: "Murat Demir",
    district: "Pendik, İstanbul",
    treatment: "Dental İmplant & Kaplama",
    rating: 5,
    comment: "İmplant tedavisinden çok korkuyordum ancak Damla Hanım süreci o kadar profesyonel yönetti ki ne cerrahi sırasında ne de sonrasında en ufak bir sorun yaşadım. Kliniğin hijyeni de kusursuz.",
    date: "3 Hafta Önce"
  },
  {
    name: "Büşra Kaya",
    district: "Maltepe, İstanbul",
    treatment: "Lazerli Diş Beyazlatma",
    rating: 5,
    comment: "Kahve lekeleri yüzünden sararan dişlerim tek bir seansta tertemiz ve bembeyaz oldu. Hassasiyet neredeyse hiç olmadı. İlgili ve güler yüzlü ekibe çok teşekkür ederim.",
    date: "1 Ay Önce"
  }
];

export default function DamlaAkarsuClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "estetik" | "cerrahi" | "tedavi" | "ortodonti">("all");
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedServiceForAppointment, setSelectedServiceForAppointment] = useState("Genel Muayene & Check-Up");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    service: "Genel Muayene & Check-Up",
    preferredDate: "",
    preferredTime: "Öğleden Önce (10:00 - 13:00)",
    notes: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const whatsappPhone = "905441105856";
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    "Merhaba Dt. Damla Akarsu Diş Muayenehanesi, randevu ve tedavi hakkında bilgi almak istiyorum."
  )}`;

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const openAppointmentFor = (serviceName: string) => {
    setSelectedServiceForAppointment(serviceName);
    setFormData((prev) => ({ ...prev, service: serviceName }));
    setAppointmentModalOpen(true);
  };

  const filteredTreatments =
    activeFilter === "all"
      ? TREATMENTS
      : TREATMENTS.filter((t) => t.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#0E7490] selection:text-white">
      
      {/* 0. KVK DIJITAL CONCEPT TOP BAR */}
      <div className="bg-[#0F172A] text-[#94A3B8] border-b border-[#1E293B] py-2 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4] inline-block shrink-0 animate-pulse" />
            <span className="font-bold text-white">KvK Dijital Çözümler</span>
            <span className="text-[#475569] hidden sm:inline">|</span>
            <span className="text-[#CBD5E1] hidden sm:inline font-sans">
              Dt. Damla Akarsu Diş Muayenehanesi Web Tasarım Konsepti
            </span>
          </div>
          <Link
            href="/projeler"
            className="inline-flex items-center gap-1 text-white hover:text-[#06B6D4] font-sans font-semibold transition-colors shrink-0"
          >
            <span>Tüm Projeler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. CLINIC TOP INFO BAR */}
      <div className="bg-[#0E7490] text-white py-2 px-4 text-xs font-medium border-b border-[#0891B2]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#67E8F9]" />
              <span>Pzt - Cmt: 09:30 - 19:30</span>
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#67E8F9]" />
              <span>Kartal & Pendik / İstanbul</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="tel:+905441105856" className="hover:underline flex items-center gap-1 font-bold">
              <Phone className="w-3.5 h-3.5 text-[#67E8F9]" />
              <span>(+90) 544 110 58 56</span>
            </a>
            <span className="text-white/30">|</span>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-[#6EE7B7] font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Danışma</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. CLINIC HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo */}
            <Link href="#hero" className="flex items-center gap-3 shrink-0 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0E7490] to-[#06B6D4] text-white flex items-center justify-center shadow-md shadow-[#0E7490]/20 group-hover:scale-105 transition-transform">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-1">
                  <span>Dt. Damla Akarsu</span>
                </div>
                <div className="text-[11px] font-bold text-[#0E7490] tracking-wider uppercase">
                  Diş Muayenehanesi & Estetik Gülüş
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <a href="#hero" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] transition-colors">
                Anasayfa
              </a>
              <a href="#tedaviler" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] transition-colors">
                Tedavilerimiz
              </a>
              <a href="#hakkimizda" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] transition-colors">
                Hakkımızda
              </a>
              <a href="#teknoloji" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] transition-colors">
                Klinik & Teknoloji
              </a>
              <a href="#donusumler" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] transition-colors">
                Gülüş Galerisi
              </a>
              <a href="#yorumlar" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] transition-colors">
                Yorumlar
              </a>
              <a href="#iletisim" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] transition-colors">
                İletişim
              </a>
            </nav>

            {/* Actions */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                title="WhatsApp Randevu"
              >
                <MessageSquare className="w-4 h-4 text-[#059669]" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => openAppointmentFor("Genel Muayene & Randevu")}
                className="px-5 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0891B2] text-white text-xs font-bold transition-all shadow-md shadow-[#0E7490]/20 hover:shadow-lg cursor-pointer"
              >
                Online Randevu Al
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#0E7490]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E2E8F0] px-6 py-5 space-y-3 shadow-xl">
            <nav className="flex flex-col space-y-2.5">
              <a onClick={() => setMobileMenuOpen(false)} href="#hero" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] py-1 border-b border-[#F8FAFC]">Anasayfa</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#tedaviler" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] py-1 border-b border-[#F8FAFC]">Tedavilerimiz</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#hakkimizda" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] py-1 border-b border-[#F8FAFC]">Hakkımızda</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#teknoloji" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] py-1 border-b border-[#F8FAFC]">Klinik & Teknoloji</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#donusumler" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] py-1 border-b border-[#F8FAFC]">Gülüş Galerisi</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#yorumlar" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] py-1 border-b border-[#F8FAFC]">Hasta Yorumları</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#iletisim" className="text-sm font-bold text-[#334155] hover:text-[#0E7490] py-1 border-b border-[#F8FAFC]">İletişim & Konum</a>
            </nav>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAppointmentFor("Mobil Randevu Talebi");
                }}
                className="w-full py-3 rounded-xl bg-[#0E7490] text-white font-bold text-xs text-center shadow-md"
              >
                Online Randevu Oluştur
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] font-bold text-xs text-center flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp'tan Yazın</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section id="hero" className="relative py-16 sm:py-24 bg-gradient-to-br from-[#ECFEFF] via-[#F8FAFC] to-[#EFF6FF] border-b border-[#E2E8F0] overflow-hidden">
        
        {/* Decorative Background Circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#06B6D4]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#10B981]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#0E7490]/20 text-[#0E7490] text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                <span>Modern Diş Hekimliği & Estetik Gülüş Tasarımı</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
                Sağlıklı, Doğal ve <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#0E7490] to-[#06B6D4] bg-clip-text text-transparent">
                  Kusursuz Gülüşler İçin
                </span>{" "}
                Uzman Dokunuş
              </h1>

              <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Dt. Damla Akarsu Diş Muayenehanesi’nde; estetik diş hekimliği, implant cerrahisi, zirkonyum kaplama ve şeffaf plak tedavilerini ileri teknoloji, steril ortam ve ağrısız tedavi prensibiyle sunuyoruz.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => openAppointmentFor("Ücretsiz Ön Muayene & Tanışma")}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0E7490] hover:bg-[#0891B2] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0E7490]/25 hover:shadow-xl cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Ücretsiz Ön Muayene Randevusu</span>
                </button>

                <a
                  href="#tedaviler"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#334155] font-bold text-sm border border-[#CBD5E1] flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Tedavileri İncele</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0 text-left">
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="text-lg font-black text-[#0E7490]">10+ Yıl</div>
                  <div className="text-[11px] text-[#64748B] font-medium">Klinik Tecrübe</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="text-lg font-black text-[#059669]">3D Dijital</div>
                  <div className="text-[11px] text-[#64748B] font-medium">Ağız İçi Tarama</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="text-lg font-black text-[#0284C7]">%100 Ağrısız</div>
                  <div className="text-[11px] text-[#64748B] font-medium">Konforlu Anestezi</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="text-lg font-black text-[#7C3AED]">5.0 ★★★★★</div>
                  <div className="text-[11px] text-[#64748B] font-medium">Hasta Memnuniyeti</div>
                </div>
              </div>

            </div>

            {/* Right Clinic Hero Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-2xl space-y-4">
                
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F1F5F9]">
                  <img
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80"
                    alt="Dt. Damla Akarsu Diş Muayenehanesi Modern Klinik Ortamı"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#0F172A]/85 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>A+ Otoklav Sterilizasyon</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A]">Kişiye Özel Gülüş Simülasyonu</h3>
                      <p className="text-xs text-[#64748B]">Dijital mockup ile tedavi sonucunu önceden görün.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#ECFEFF] text-[#0E7490] text-xs font-bold">
                      3D CAD/CAM
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">İlk Muayene & Röntgen Değerlendirmesi</span>
                    <span className="font-bold text-[#059669]">Ücretsiz Ön Görüşme</span>
                  </div>

                  <button
                    onClick={() => openAppointmentFor("İlk Muayene & Gülüş Analizi")}
                    className="w-full py-3 rounded-xl bg-[#0E7490] hover:bg-[#0891B2] text-white text-xs font-bold transition-colors text-center cursor-pointer shadow-sm"
                  >
                    Randevu Saatini Seçin
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. TREATMENTS & SERVICES (INTERACTIVE CATALOG) */}
      <section id="tedaviler" className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold font-mono text-[#0E7490] uppercase tracking-wider">
                Kapsamlı Diş Sağlığı Çözümleri
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] mt-1">
                Uyguladığımız Tedaviler
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-xl">
                En güncel medikal protokoller ve ileri teknoloji ekipmanlarla estetik, cerrahi ve koruyucu diş hekimliği hizmetleri.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
              {[
                { id: "all", label: "Tüm Tedaviler" },
                { id: "estetik", label: "Estetik Diş Hekimliği" },
                { id: "cerrahi", label: "İmplant & Cerrahi" },
                { id: "tedavi", label: "Kanal & Diş Eti" },
                { id: "ortodonti", label: "Şeffaf Plak" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === tab.id
                      ? "bg-[#0E7490] text-white shadow-sm"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Treatments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTreatments.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#0E7490] transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl group"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-[#F1F5F9] overflow-hidden">
                    <img
                      src={t.imageUrl}
                      alt={t.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0F172A]/85 text-white text-[11px] font-bold backdrop-blur-sm">
                        {t.badge}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#0E7490] font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.duration}</span>
                      <span className="text-[#CBD5E1]">•</span>
                      <span>{t.sessions}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#0E7490] transition-colors leading-snug">
                      {t.title}
                    </h3>

                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                      {t.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-[#F8FAFC] flex items-center justify-between gap-2 mt-4">
                  <button
                    onClick={() => setSelectedTreatment(t)}
                    className="px-3.5 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Detayları Oku
                  </button>
                  <button
                    onClick={() => openAppointmentFor(t.title)}
                    className="flex-1 py-2 rounded-lg bg-[#0E7490] hover:bg-[#0891B2] text-white text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm"
                  >
                    <span>Randevu Al</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. ABOUT DT. DAMLA AKARSU & CLINIC QUALITY PILLARS */}
      <section id="hakkimizda" className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            
            {/* Left Doctor Photo / Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E2E8F0] bg-white aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80"
                    alt="Dt. Damla Akarsu - Diş Hekimi"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                    <span className="text-xs uppercase font-bold text-[#67E8F9] tracking-wider">Kurucu Hekim</span>
                    <h3 className="text-2xl font-black">Dt. Damla Akarsu</h3>
                    <p className="text-xs text-white/80 mt-0.5">Estetik Diş Hekimliği & İmplantoloji</p>
                  </div>
                </div>

                {/* Floating Experience Badge */}
                <div className="absolute -bottom-5 -right-5 bg-white p-4 rounded-2xl shadow-xl border border-[#E2E8F0] flex items-center gap-3 max-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-[#0E7490]/10 text-[#0E7490] flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-[#0E7490]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#0F172A]">Tescilli</div>
                    <div className="text-[11px] text-[#64748B]">Modern Klinik Standartları</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Bio & Vision */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFEFF] text-[#0E7490] text-xs font-bold">
                <Stethoscope className="w-4 h-4" />
                <span>Hasta Odaklı, Bilimsel ve Şeffaf Tedavi Anlayışı</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] leading-tight">
                Her Hastamıza Kendi Ailemizden Biri Gibi Özen Gösteriyoruz
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-[#475569] leading-relaxed">
                <p>
                  Dt. Damla Akarsu Diş Muayenehanesi; diş hekimliği alanındaki en güncel akademik gelişmeleri, dijital teknolojileri ve sanatsal estetik bakış açısını bir araya getirmek amacıyla kurulmuştur.
                </p>
                <p>
                  Bizim için her gülüş benzersiz bir kimliktir. Hastalarımızın beklentilerini derinlemesine dinliyor, 3D dijital analizlerle yüz proporsiyonuna en uygun tedavi planını hazırlıyor ve süreci tamamen ağrısız ve konforlu bir deneyime dönüştürüyoruz.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span className="text-xs font-bold text-[#1E293B]">Sürekli Eğitim & Güncel Teknikler</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span className="text-xs font-bold text-[#1E293B]">Detaylı Bilgilendirme & Şeffaflık</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span className="text-xs font-bold text-[#1E293B]">Korkusuz & Dinlendirici Klinik Ortamı</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span className="text-xs font-bold text-[#1E293B]">Tedavi Sonrası Düzenli Takip</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openAppointmentFor("Dt. Damla Akarsu ile Konsültasyon")}
                  className="px-6 py-3.5 rounded-xl bg-[#0E7490] hover:bg-[#0891B2] text-white text-xs font-bold transition-all shadow-md"
                >
                  Dt. Damla Akarsu ile Görüşün
                </button>
              </div>

            </div>

          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {CLINIC_PILLARS.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0E7490] transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#ECFEFF] text-[#0E7490] flex items-center justify-center">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">{pillar.title}</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. SMILE MAKEOVER / BEFORE-AFTER GALLERY */}
      <section id="donusumler" className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <span className="text-xs font-bold font-mono text-[#0E7490] uppercase tracking-wider">
              Estetik Vaka Sonuçları
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A]">
              Gülüş Dönüşümü Başarı Hikayeleri
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Kliniğimizde tamamlanan estetik gülüş tasarımı, lamine ve kaplama tedavilerimizden örnekler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BEFORE_AFTER.map((item) => (
              <div
                key={item.id}
                className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4 hover:border-[#0E7490] transition-all"
              >
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-white border border-[#E2E8F0] flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80"
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#0F172A]/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Tamamlanan Vaka
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#0E7490] mb-1">
                    <span>{item.treatment}</span>
                    <span className="text-[#64748B]">{item.timeframe}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A]">{item.title}</h3>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <button
                  onClick={() => openAppointmentFor(`${item.title} Hakkında Bilgi`)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-[#0E7490] hover:text-white text-[#0E7490] border border-[#0E7490]/30 text-xs font-bold transition-colors text-center"
                >
                  Benzer Gülüş İçin Randevu Al
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. DIGITAL CLINIC TECHNOLOGY */}
      <section id="teknoloji" className="py-16 sm:py-20 bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold font-mono text-[#67E8F9] uppercase tracking-wider">
                Yüksek Medikal Teknoloji
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                Geleneksel Yöntemleri Geride Bırakan Dijital Diş Hekimliği
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Kliniğimizde uygulanan her adım, hata payını sıfıra indiren ve hasta konforunu en üst düzeye çıkaran dijital cihazlarla desteklenmektedir.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/20 text-[#67E8F9] flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">3D Ağız İçi Tarayıcı (CAD/CAM)</h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Bulantı hissi yaratan kaşık ölçüler yerine dakikalar içinde yüksek çözünürlüklü dijital 3D modelleme.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 text-[#6EE7B7] flex items-center justify-center shrink-0">
                    <Microscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Düşük Radyasyonlu Dijital Panoramik Röntgen</h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Minimum radyasyon dozu ile çene kemiği, gömülü dişler ve kök yapısının anında yüksek netlikte analizi.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 text-[#FCD34D] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Lazerli Yumuşak Doku Şekillendirme</h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Kanamasız, dikişsiz ve hızlı iyileşen diş eti tedavileri ve gülüş çizgisi düzenlemeleri.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl border border-white/15 backdrop-blur-md shadow-2xl space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80"
                  alt="Dijital Diş Hekimliği Cihazları"
                  className="w-full h-64 object-cover rounded-2xl border border-white/10"
                />
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                    <span className="text-xs font-bold text-white">CE & FDA Onaylı Biyouyumlu Materyaller</span>
                  </div>
                  <span className="text-xs text-[#67E8F9] font-mono font-bold">100% Orijinal</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. PATIENT REVIEWS */}
      <section id="yorumlar" className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <span className="text-xs font-bold font-mono text-[#0E7490] uppercase tracking-wider">
              Gerçek Hasta Deneyimleri
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A]">
              Hastalarımız Ne Diyor?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Tedavi süreçlerimizde sağladığımız konfor, ilgi ve sonuç odaklı yaklaşımımızın yansımaları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#0E7490] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#94A3B8] font-mono">{r.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#334155] leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">{r.name}</div>
                    <div className="text-[11px] text-[#64748B]">{r.district}</div>
                  </div>
                  <span className="text-[11px] font-bold text-[#0E7490] bg-[#ECFEFF] px-2 py-0.5 rounded border border-[#A5F3FC]">
                    {r.treatment}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. ONLINE APPOINTMENT & CONTACT FORM */}
      <section id="randevu" className="py-16 sm:py-24 bg-gradient-to-b from-[#F8FAFC] to-[#ECFEFF] border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-10 shadow-xl space-y-8">
            
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold font-mono text-[#0E7490] uppercase tracking-wider">
                Hızlı & Kolay Randevu
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                Online Randevu & Ön Muayene Formu
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Formu doldurun, klinik asistanımız size en uygun gün ve saat için anında dönüş sağlasın.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto" />
                <h3 className="text-lg font-bold text-[#0F172A]">Randevu Talebiniz Alındı!</h3>
                <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto">
                  Sayın <strong>{formData.fullName || "Hastamız"}</strong>, talebiniz klinik sistemimize başarıyla iletildi. En kısa sürede telefon ile onay için sizinle iletişime geçilecektir.
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({
                      fullName: "",
                      phone: "",
                      service: "Genel Muayene & Check-Up",
                      preferredDate: "",
                      preferredTime: "Öğleden Önce (10:00 - 13:00)",
                      notes: ""
                    });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-bold"
                >
                  Yeni Randevu Oluştur
                </button>
              </div>
            ) : (
              <form onSubmit={handleAppointmentSubmit} className="space-y-4 text-xs sm:text-sm">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">Adınız Soyadınız *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Adınız Soyadınız"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">Telefon Numaranız *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">İlgilendiğiniz Tedavi / Hizmet</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490] focus:bg-white transition-colors"
                    >
                      <option value="Genel Muayene & Check-Up">Genel Muayene & Check-Up</option>
                      <option value="Gülüş Tasarımı (Hollywood Smile)">Gülüş Tasarımı (Hollywood Smile)</option>
                      <option value="Dental İmplant & Cerrahi">Dental İmplant & Cerrahi</option>
                      <option value="Zirkonyum / E-Max Kaplama">Zirkonyum / E-Max Kaplama</option>
                      <option value="Lazerli Diş Beyazlatma">Lazerli Diş Beyazlatma</option>
                      <option value="Şeffaf Plak (Invisalign)">Şeffaf Plak (Invisalign)</option>
                      <option value="Ağrısız Kanal Tedavisi">Ağrısız Kanal Tedavisi</option>
                      <option value="Çocuk Diş Hekimliği (Pedodonti)">Çocuk Diş Hekimliği (Pedodonti)</option>
                      <option value="Diş Eti Tedavisi & Pembe Estetik">Diş Eti Tedavisi & Pembe Estetik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#334155] font-bold mb-1">Tercih Edilen Zaman Aralığı</label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490] focus:bg-white transition-colors"
                    >
                      <option value="Öğleden Önce (10:00 - 13:00)">Öğleden Önce (10:00 - 13:00)</option>
                      <option value="Öğleden Sonra (13:00 - 16:30)">Öğleden Sonra (13:00 - 16:30)</option>
                      <option value="Akşam Saatleri (16:30 - 19:30)">Akşam Saatleri (16:30 - 19:30)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#334155] font-bold mb-1">Şikayetiniz veya Eklemek İstedikleriniz (Opsiyonel)</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Mevcut diş şikayetiniz veya belirtmek istediğiniz detaylar..."
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490] focus:bg-white transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-4 rounded-xl bg-[#0E7490] hover:bg-[#0891B2] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0E7490]/20 cursor-pointer"
                  >
                    Randevu Talebini Gönder
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp'tan Anında Yazın</span>
                  </a>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* 10. CONTACT & MAP LOCATION */}
      <section id="iletisim" className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold font-mono text-[#0E7490] uppercase tracking-wider">
                  Ulaşım & İletişim
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1">
                  Kliniğimize Kolayca Ulaşın
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                  Merkezi lokasyon, ferah muayenehane ortamı ve otopark imkanı ile hizmetinizdeyiz.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ECFEFF] text-[#0E7490] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Klinik Adresi</h3>
                    <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5">
                      Atalar Caddesi No: 6A, Kartal / İstanbul (veya Esenler Mah. Nebi Sok. No: 6B, Pendik / İstanbul)
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ECFEFF] text-[#0E7490] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Telefon & WhatsApp</h3>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <a href="tel:+905441105856" className="text-xs sm:text-sm font-bold text-[#0E7490] hover:underline">
                        (+90) 544 110 58 56
                      </a>
                      <a href="tel:+905547991384" className="text-xs text-[#64748B] hover:underline">
                        (+90) 554 799 13 84
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ECFEFF] text-[#0E7490] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Çalışma Saatleri</h3>
                    <p className="text-xs text-[#475569] mt-0.5">
                      Pazartesi - Cumartesi: <strong>09:30 - 19:30</strong><br />
                      Pazar: Kapalı (Acil vakalar için telefonla randevu)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive OpenStreetMap Embed */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] bg-white shadow-xl relative">
                
                <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-xs font-bold text-[#0F172A]">Dt. Damla Akarsu Diş Muayenehanesi Konumu</span>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Kartal+Istanbul"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#0E7490] text-white text-xs font-bold inline-flex items-center gap-1 hover:bg-[#0891B2] transition-colors"
                  >
                    <span>Yol Tarifi Al</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative w-full h-80 sm:h-96 bg-[#E2E8F0]">
                  <iframe
                    title="Dt. Damla Akarsu Klinik Haritası"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=29.1750%2C40.8850%2C29.2150%2C40.9050&layer=mapnik&marker=40.8938%2C29.1915"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />

                  {/* Floating Pin Card */}
                  <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E2E8F0] shadow-lg max-w-xs hidden sm:block">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0E7490]" />
                      <span>Dt. Damla Akarsu Kliniği</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Atalar Cd. No:6A, Kartal / İstanbul
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 11. FLOATING WHATSAPP BUTTON (DEDICATED) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Dt. Damla Akarsu WhatsApp İletişim Hattı"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm tracking-wide shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 group cursor-pointer"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5 fill-white/20 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white" />
        </div>
        <span className="hidden sm:inline font-bold">WhatsApp Randevu</span>
      </a>

      {/* 12. CLINIC FOOTER */}
      <footer className="bg-[#0F172A] text-[#94A3B8] text-xs pt-16 pb-8 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#1E293B]">
            
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#0E7490] to-[#06B6D4] text-white flex items-center justify-center font-bold">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">Dt. Damla Akarsu</div>
                  <div className="text-[10px] text-[#67E8F9] uppercase tracking-wider font-bold">Diş Muayenehanesi</div>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                İstanbul'da estetik gülüş tasarımı, implantoloji, zirkonyum kaplama ve genel diş tedavilerinde modern, güvenilir ve hasta odaklı sağlık hizmeti.
              </p>
              <div className="pt-1 flex items-center gap-2 text-white font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Hasta Kabulü Açık</span>
              </div>
            </div>

            {/* Column 2: Treatments */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Öne Çıkan Tedaviler</div>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li><a href="#tedaviler" className="hover:text-[#67E8F9] transition-colors">Dijital Gülüş Tasarımı</a></li>
                <li><a href="#tedaviler" className="hover:text-[#67E8F9] transition-colors">Dental İmplant Cerrahisi</a></li>
                <li><a href="#tedaviler" className="hover:text-[#67E8F9] transition-colors">Zirkonyum & E-Max Kaplama</a></li>
                <li><a href="#tedaviler" className="hover:text-[#67E8F9] transition-colors">Lazerli Diş Beyazlatma</a></li>
                <li><a href="#tedaviler" className="hover:text-[#67E8F9] transition-colors">Şeffaf Plak (Invisalign)</a></li>
                <li><a href="#tedaviler" className="hover:text-[#67E8F9] transition-colors">Ağrısız Kanal Tedavisi</a></li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Kurumsal & Klinik</div>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li><a href="#hakkimizda" className="hover:text-[#67E8F9] transition-colors">Dt. Damla Akarsu Hakkında</a></li>
                <li><a href="#teknoloji" className="hover:text-[#67E8F9] transition-colors">Klinik Teknolojimiz</a></li>
                <li><a href="#donusumler" className="hover:text-[#67E8F9] transition-colors">Gülüş Dönüşümleri</a></li>
                <li><a href="#yorumlar" className="hover:text-[#67E8F9] transition-colors">Hasta Yorumları</a></li>
                <li><a href="#randevu" className="hover:text-[#67E8F9] transition-colors">Online Randevu</a></li>
                <li><a href="#iletisim" className="hover:text-[#67E8F9] transition-colors">Ulaşım ve Harita</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">İletişim & Randevu</div>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li>Atalar Cd. No: 6A, Kartal / İstanbul</li>
                <li>Esenler Mah. Nebi Sok. No: 6B, Pendik / İstanbul</li>
                <li>Tel: (+90) 544 110 58 56</li>
                <li>Mobil: (+90) 554 799 13 84</li>
                <li>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#6EE7B7] hover:underline font-bold">
                    WhatsApp Randevu Hattı
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div>
              © {new Date().getFullYear()} Dt. Damla Akarsu Diş Muayenehanesi — Tüm hakları saklıdır.
            </div>
            <div>
              Web Konsept & Tasarım: <Link href="/" className="text-[#CBD5E1] hover:text-white font-bold">KvK Dijital Çözümler</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* TREATMENT DETAIL MODAL */}
      {selectedTreatment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#0E7490] uppercase">{selectedTreatment.badge}</span>
                <h3 className="text-lg sm:text-xl font-bold text-[#0F172A]">{selectedTreatment.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="p-2 rounded-xl bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#F1F5F9]">
              <img
                src={selectedTreatment.imageUrl}
                alt={selectedTreatment.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-[#64748B] block">İşlem Süresi:</span>
                <strong className="text-[#0F172A]">{selectedTreatment.duration}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Seans Sayısı:</span>
                <strong className="text-[#0F172A]">{selectedTreatment.sessions}</strong>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              {selectedTreatment.fullDesc}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase">Tedavi Avantajları</h4>
              <ul className="space-y-1.5 text-xs text-[#334155]">
                {selectedTreatment.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTreatment(null)}
                className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] text-[#334155] text-xs font-bold"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  const sTitle = selectedTreatment.title;
                  setSelectedTreatment(null);
                  openAppointmentFor(sTitle);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0891B2] text-white text-xs font-bold"
              >
                Bu Tedavi İçin Randevu Al
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QUICK APPOINTMENT MODAL */}
      {appointmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E2E8F0]">
            
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#0E7490] uppercase font-mono">Hızlı Randevu</span>
                <h3 className="text-base font-bold text-[#0F172A]">{selectedServiceForAppointment}</h3>
              </div>
              <button
                onClick={() => setAppointmentModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#F1F5F9] text-[#334155]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="py-6 text-center space-y-2 bg-[#ECFDF5] p-6 rounded-2xl border border-[#A7F3D0]">
                <CheckCircle2 className="w-10 h-10 text-[#059669] mx-auto" />
                <h4 className="text-sm font-bold text-[#0F172A]">Randevu Talebiniz Alındı</h4>
                <p className="text-xs text-[#475569]">Klinik asistanımız randevu onayı için sizi arayacaktır.</p>
                <button
                  onClick={() => {
                    setAppointmentModalOpen(false);
                    setFormSubmitted(false);
                  }}
                  className="mt-2 px-5 py-2 rounded-xl bg-[#0E7490] text-white text-xs font-bold"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleAppointmentSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#334155] mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">Tercih Edilen Zaman</label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490]"
                  >
                    <option value="Öğleden Önce (10:00 - 13:00)">Öğleden Önce (10:00 - 13:00)</option>
                    <option value="Öğleden Sonra (13:00 - 16:30)">Öğleden Sonra (13:00 - 16:30)</option>
                    <option value="Akşam Saatleri (16:30 - 19:30)">Akşam Saatleri (16:30 - 19:30)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">Notunuz (Opsiyonel)</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Varsa özel notunuz..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0E7490] resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] text-[#334155] font-bold"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0891B2] text-white font-bold"
                  >
                    Randevu Al
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
