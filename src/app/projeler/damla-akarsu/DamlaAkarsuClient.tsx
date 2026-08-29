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
  ExternalLink,
  HelpCircle,
  CheckSquare2
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
    id: "dis-temizligi-ve-beyazlatma",
    category: "estetik",
    title: "Diş Temizliği & Lazerli Diş Beyazlatma",
    shortDesc: "Diş taşı (tartar) temizliği, polisaj ve tek seansta 3-5 tona kadar kalıcı beyazlık sağlayan medikal ofis tipi beyazlatma.",
    fullDesc: "Ultrasonik kavitron cihazları ile diş minesine hiçbir zarar verilmeden diş taşları ve plaklar temizlenir. Ardından klinik tipi lazer/LED aktivasyonlu özel beyazlatma jeli ile kahve, çay ve sigara lekeleri açılarak ışıltılı bir gülüş kazandırılır.",
    duration: "45 - 60 Dakika",
    sessions: "Tek Seans",
    benefits: [
      "Diş minesine zarar vermeden güvenli temizlik",
      "Diş eti çekilmelerini ve kanamayı önler",
      "Tek seansta 3-5 ton anında beyazlama",
      "Ağız kokusunu gideren ferahlık"
    ],
    imageUrl: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80",
    badge: "Instagram'da Popüler"
  },
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
    badge: "Estetik Dönüşüm"
  },
  {
    id: "implant-uygulamalari",
    category: "cerrahi",
    title: "Dental İmplant Uygulamaları",
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
    id: "dis-teli-ortodonti",
    category: "ortodonti",
    title: "Diş Teli & Şeffaf Plak Ortodontik Tedaviler",
    shortDesc: "Çapraşık, aralıklı ve kapanış bozukluğu olan dişlerin şeffaf plaklar (Invisalign) veya estetik braketlerle düzeltilmesi.",
    fullDesc: "3D ağız içi tarama yapılarak hastanın dijital tedavi planı çıkarılır. Telsiz şeffaf plaklar sosyal hayatı kısıtlamadan dişleri milimetrik olarak hizalar. Geleneksel braket tedavileri de her yaş grubuna özel olarak uygulanır.",
    duration: "6 - 14 Ay",
    sessions: "Aylık Kontrol",
    benefits: [
      "Şeffaf plaklarda yemek yerken çıkarabilme özgürlüğü",
      "Dışarıdan neredeyse tamamen görünmez estetik",
      "Yara veya batma yapmayan yumuşak materyal",
      "Doğru kapanış ile çiğneme ve çene eklemi sağlığı"
    ],
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
    badge: "Telsiz & Konforlu"
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
    id: "20lik-dis-cekimi",
    category: "cerrahi",
    title: "20'lik Diş Çekimi & Gömülü Diş Cerrahisi",
    shortDesc: "Çene kemiğinde gömülü, yarı gömülü veya çapraşıklığa yol açan 20 yaş dişlerinin ağrısız ve hızlı cerrahi çekimi.",
    fullDesc: "Panoramik röntgen ile sinir komşuluğu hassas bir şekilde analiz edilen 20'lik dişler, lokal anestezi altında travmasız cerrahi tekniklerle çekilir. Şişlik ve ağrıyı minimize eden ameliyat sonrası bakım protokolü uygulanır.",
    duration: "20 - 40 Dakika",
    sessions: "Tek Seans",
    benefits: [
      "Diğer dişlerin sıkışmasını ve bozulmasını önler",
      "Tekrarlayan diş eti apsesi ve enfeksiyonları bitirir",
      "Lokal anestezi ile işlem esnasında sıfır ağrı",
      "Hızlı iyileşme ve özel dikiş protokolü"
    ],
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
    badge: "Uzman Cerrahi"
  },
  {
    id: "estetik-dolgu",
    category: "tedavi",
    title: "Estetik Kompozit Dolgu & Restoratif İşlemler",
    shortDesc: "Çürük veya kırık dişlerin, dişin kendi doğal rengi ve anatomik formuyla birebir örtüşen kompozit materyallerle onarılması.",
    fullDesc: "Eski amalgam (siyah) dolguların estetik beyaz dolgularla değiştirilmesi, ön diş kırıklarının bonding tekniğiyle kapatılması ve çiğneme yüzeylerinin doğal diş tepeciklerine uygun şekilde restore edilmesidir.",
    duration: "30 - 45 Dakika",
    sessions: "Tek Seans",
    benefits: [
      "Dişin doğal rengiyle %100 renk uyumu",
      "Güçlü kimyasal bağlanma ile uzun ömür",
      "Tek seansta anında estetik sonuç",
      "Cıva içermeyen güvenli kompozit reçine"
    ],
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
    badge: "Doğal Restorasyon"
  }
];

const INSTAGRAM_QA = [
  {
    question: "Diş taşı temizliği yaptırmak diş minesine zarar verir mi?",
    answer: "Hayır, diş taşı temizliği diş minesine kesinlikle zarar vermez. Aksine, diş taşları zamanla diş etlerine baskı yaparak iltihaplanmaya, kanamaya ve diş eti çekilmelerine yol açar. Düzenli olarak 6 ayda bir yapılan profesyonel diş temizliği, diş eti hastalıklarını önlemenin en temel ve etkili yoludur.",
    tag: "Ağız Hijyeni"
  },
  {
    question: "20'lik dişler her durumda çekilmek zorunda mıdır?",
    answer: "Hayır. Çene kavsinde yeterli yer olan, düzgün çıkan ve çiğnemeye katılan 20'lik dişlerin çekilmesine gerek yoktur. Ancak gömülü kalan, komşu dişi çürüten veya sürekli apse yapan dişler panoramik röntgen kontrolü sonrasında çekilmelidir.",
    tag: "Cerrahi"
  },
  {
    question: "İmplant tedavisi sırasında ağrı hissedilir mi?",
    answer: "İmplant cerrahisi gelişmiş lokal anestezi altında gerçekleştirilir, bu nedenle işlem esnasında hasta hiçbir ağrı veya acı hissetmez. Operasyon sonrası için reçete edilen hafif ağrı kesicilerle iyileşme süreci son derece konforlu geçer.",
    tag: "İmplant"
  },
  {
    question: "Diş beyazlatma (bleaching) dişleri ne kadar süre beyaz tutar?",
    answer: "Klinik tipi profesyonel beyazlatma sonuçları ortalama 1 - 2 yıl kalıcılığını korur. Çay, kahve ve sigara tüketim alışkanlığı ile düzenli diş fırçalama beyazlığın kalıcılık süresini doğrudan etkiler.",
    tag: "Estetik"
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
  const [selectedServiceForAppointment, setSelectedServiceForAppointment] = useState("Genel Diş Muayenesi & Check-Up");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    service: "Genel Diş Muayenesi & Check-Up",
    preferredDate: "",
    preferredTime: "Öğleden Önce (10:00 - 13:00)",
    notes: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Exact Verified Phone from Instagram: 0544 577 58 56
  const primaryPhone = "0544 577 58 56";
  const whatsappPhone = "905445775856";
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#0284C7] selection:text-white">
      
      {/* 0. KVK DIJITAL CONCEPT TOP BAR */}
      <div className="bg-[#0F172A] text-[#94A3B8] border-b border-[#1E293B] py-2 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0284C7] inline-block shrink-0 animate-pulse" />
            <span className="font-bold text-white">KvK Dijital Çözümler</span>
            <span className="text-[#475569] hidden sm:inline">|</span>
            <span className="text-[#CBD5E1] hidden sm:inline font-sans">
              Dt. Damla Akarsu Diş Muayenehanesi Web Tasarım Konsepti
            </span>
          </div>
          <Link
            href="/projeler"
            className="inline-flex items-center gap-1 text-white hover:text-[#0284C7] font-sans font-semibold transition-colors shrink-0"
          >
            <span>Tüm Projeler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. CLINIC TOP INFO BAR */}
      <div className="bg-[#0369A1] text-white py-2.5 px-4 text-xs font-medium border-b border-[#0284C7]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#BAE6FD]" />
              <span>Pzt - Cmt: 09:30 - 19:30</span>
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#BAE6FD]" />
              <span>Pendik & Kartal / İstanbul</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href={`tel:+905445775856`} className="hover:underline flex items-center gap-1.5 font-bold text-white">
              <Phone className="w-3.5 h-3.5 text-[#BAE6FD]" />
              <span>Randevu: {primaryPhone}</span>
            </a>
            <span className="text-white/30">|</span>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-[#6EE7B7] font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Randevu</span>
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
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] text-white flex items-center justify-center shadow-md shadow-[#0284C7]/20 group-hover:scale-105 transition-transform">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-1">
                  <span>Dt. Damla Akarsu</span>
                </div>
                <div className="text-[11px] font-bold text-[#0369A1] tracking-wider uppercase">
                  Diş Muayenehanesi & Dental Klinik
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <a href="#hero" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] transition-colors">
                Anasayfa
              </a>
              <a href="#hizmetler-ozet" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] transition-colors">
                Hizmetlerimiz
              </a>
              <a href="#tedaviler" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] transition-colors">
                Tedaviler
              </a>
              <a href="#soru-cevap" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] transition-colors">
                Soru & Cevap
              </a>
              <a href="#hakkimizda" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] transition-colors">
                Hakkımızda
              </a>
              <a href="#yorumlar" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] transition-colors">
                Yorumlar
              </a>
              <a href="#iletisim" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] transition-colors">
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
                onClick={() => openAppointmentFor("Genel Diş Muayenesi")}
                className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-md shadow-[#0284C7]/20 hover:shadow-lg cursor-pointer"
              >
                Randevu Al
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#0284C7]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E2E8F0] px-6 py-5 space-y-3 shadow-xl">
            <nav className="flex flex-col space-y-2.5">
              <a onClick={() => setMobileMenuOpen(false)} href="#hero" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] py-1 border-b border-[#F8FAFC]">Anasayfa</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#hizmetler-ozet" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] py-1 border-b border-[#F8FAFC]">Kliniğimizdeki Hizmetler</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#tedaviler" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] py-1 border-b border-[#F8FAFC]">Tedavi Kataloğu</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#soru-cevap" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] py-1 border-b border-[#F8FAFC]">Soru & Cevap Rehberi</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#hakkimizda" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] py-1 border-b border-[#F8FAFC]">Hakkımızda</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#yorumlar" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] py-1 border-b border-[#F8FAFC]">Hasta Yorumları</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#iletisim" className="text-sm font-bold text-[#334155] hover:text-[#0284C7] py-1 border-b border-[#F8FAFC]">İletişim & Konum</a>
            </nav>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAppointmentFor("Mobil Randevu Talebi");
                }}
                className="w-full py-3 rounded-xl bg-[#0284C7] text-white font-bold text-xs text-center shadow-md"
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
                <span>WhatsApp ({primaryPhone})</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (WITH INSTAGRAM MOTTO & VISUAL IDENTITY) */}
      <section id="hero" className="relative py-16 sm:py-24 bg-gradient-to-br from-[#F0F9FF] via-[#FFFFFF] to-[#E0F2FE] border-b border-[#E2E8F0] overflow-hidden">
        
        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#0284C7]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#10B981]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#0284C7]/30 text-[#0369A1] text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-[#0284C7]" />
                <span>Profosyonel DENTAL KLİNİK — Ağız ve Diş Sağlığınız Bizim İçin Önemlidir</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
                Sağlıklı Gülüşler İçin <br />
                <span className="bg-gradient-to-r from-[#0369A1] to-[#0284C7] bg-clip-text text-transparent">
                  Düzenli Diş Muayenesi
                </span>{" "}
                Olmalısınız
              </h1>

              <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Dt. Damla Akarsu Diş Muayenehanesi’nde; diş temizliğinden implant uygulamalarına, şeffaf plak ortodontiden estetik dolgu ve gülüş tasarımına kadar tüm tedavilerinizi yüksek sterilizasyon ve ağrısız anestezi konforuyla gerçekleştiriyoruz.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => openAppointmentFor("İlk Muayene Randevusu")}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0284C7]/25 hover:shadow-xl cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Randevu Al: {primaryPhone}</span>
                </button>

                <a
                  href="#soru-cevap"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#334155] font-bold text-sm border border-[#CBD5E1] flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <HelpCircle className="w-4 h-4 text-[#0284C7]" />
                  <span>Sıkça Sorulan Sorular</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0 text-left">
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="text-lg font-black text-[#0284C7]">0544 577 58 56</div>
                  <div className="text-[11px] text-[#64748B] font-medium">Hızlı Randevu Hattı</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="text-lg font-black text-[#059669]">A+ Otoklav</div>
                  <div className="text-[11px] text-[#64748B] font-medium">%100 Steril Ortam</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="text-lg font-black text-[#0284C7]">Ağrısız</div>
                  <div className="text-[11px] text-[#64748B] font-medium">Konforlu Anestezi</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="text-lg font-black text-[#7C3AED]">5.0 ★★★★★</div>
                  <div className="text-[11px] text-[#64748B] font-medium">Hasta Memnuniyeti</div>
                </div>
              </div>

            </div>

            {/* Right Card: Instagram Reel Format / Treatment Checklist Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-2xl space-y-5">
                
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
                    <span className="text-xs font-bold text-[#0F172A]">Kliniğimizdeki Hizmetler</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] block font-mono">Randevu Al</span>
                    <span className="text-xs font-black text-[#0284C7]">{primaryPhone}</span>
                  </div>
                </div>

                {/* Checklist from Instagram Reel */}
                <div className="space-y-2.5">
                  {[
                    "Diş Temizliği ve Diş Beyazlatma",
                    "Diş Teli & Ortodontik Tedaviler",
                    "İmplant Uygulamaları",
                    "Ağrısız Kanal Tedavisi",
                    "20'lik Diş Çekimi & Cerrahi",
                    "Estetik Dolgu İşlemleri"
                  ].map((service, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between hover:bg-[#F0F9FF] hover:border-[#BAE6FD] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare2 className="w-4 h-4 text-[#10B981] shrink-0" />
                        <span className="text-xs font-bold text-[#1E293B]">{service}</span>
                      </div>
                      <button
                        onClick={() => openAppointmentFor(service)}
                        className="text-[11px] font-bold text-[#0284C7] hover:underline"
                      >
                        Seç
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openAppointmentFor("Hızlı Randevu Talebi")}
                  className="w-full py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-md shadow-[#0284C7]/20 text-center cursor-pointer"
                >
                  Muayene Randevusu Oluştur
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. INSTAGRAM Q&A & DOCTOR RECOMMENDATIONS SECTION */}
      <section id="soru-cevap" className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0284C7] text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Dt. Damla Akarsu ile Diş Sağlığı Rehberi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A]">
              Sıkça Sorulan Sorular & Yanıtlar
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Sosyal medyada ve klinikte hastalarımızın en çok merak ettiği konuları hekimimiz yanıtlıyor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {INSTAGRAM_QA.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm space-y-4 hover:border-[#0284C7] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#B45309] text-xs font-bold">
                      Soru
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">{item.tag}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                    {item.question}
                  </h3>

                  <div className="pt-2 border-t border-[#E2E8F0]/70">
                    <div className="inline-block px-2.5 py-0.5 rounded bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold mb-2">
                      Cevap
                    </div>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Sorunuz mu var?</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#0284C7] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Hekime WhatsApp'tan Sorun</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. TREATMENTS & SERVICES (DETAILED CATALOG) */}
      <section id="tedaviler" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold font-mono text-[#0284C7] uppercase tracking-wider">
                Kapsamlı Tedavi Kataloğu
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] mt-1">
                Klinik Tedavi Hizmetlerimiz
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-xl">
                Modern cihazlar, dijital görüntüleme ve steril klinik ortamında uygulanan tüm diş sağlığı prosedürleri.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white border border-[#E2E8F0]">
              {[
                { id: "all", label: "Tüm Hizmetler" },
                { id: "estetik", label: "Estetik & Beyazlatma" },
                { id: "cerrahi", label: "İmplant & 20'lik Çekim" },
                { id: "tedavi", label: "Kanal & Dolgu" },
                { id: "ortodonti", label: "Şeffaf Plak & Tel" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === tab.id
                      ? "bg-[#0284C7] text-white shadow-sm"
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
                className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#0284C7] transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl group"
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
                    <div className="flex items-center gap-2 text-xs text-[#0284C7] font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.duration}</span>
                      <span className="text-[#CBD5E1]">•</span>
                      <span>{t.sessions}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#0284C7] transition-colors leading-snug">
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
                    className="flex-1 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm"
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

      {/* 6. ABOUT DT. DAMLA AKARSU & CLINIC QUALITY PILLARS */}
      <section id="hakkimizda" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            
            {/* Left Doctor Photo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E2E8F0] bg-white aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80"
                    alt="Dt. Damla Akarsu - Diş Hekimi"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                    <span className="text-xs uppercase font-bold text-[#BAE6FD] tracking-wider">Kurucu Diş Hekimi</span>
                    <h3 className="text-2xl font-black">Dt. Damla Akarsu</h3>
                    <p className="text-xs text-white/80 mt-0.5">İstanbul Yeni Yüzyıl Üniversitesi Mezunu</p>
                  </div>
                </div>

                <div className="absolute -bottom-5 -right-5 bg-white p-4 rounded-2xl shadow-xl border border-[#E2E8F0] flex items-center gap-3 max-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-[#0284C7]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#0F172A]">Tescilli</div>
                    <div className="text-[11px] text-[#64748B]">Modern Muayenehane</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Bio & Vision */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] text-[#0284C7] text-xs font-bold">
                <Stethoscope className="w-4 h-4" />
                <span>Hasta Odaklı, Bilimsel ve Şeffaf Tedavi Anlayışı</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] leading-tight">
                Her Hastamıza Kendi Ailemizden Biri Gibi Özen Gösteriyoruz
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-[#475569] leading-relaxed">
                <p>
                  Dt. Damla Akarsu Diş Muayenehanesi; diş hekimliği alanındaki en güncel medikal standartları, hijyen protokollerini ve hasta konforunu bir araya getirmek amacıyla kurulmuştur.
                </p>
                <p>
                  İstanbul Yeni Yüzyıl Üniversitesi Diş Hekimliği Fakültesi mezunu olan Dt. Damla Akarsu; estetik diş hekimliği, implantoloji, diş taşı temizliği ve koruyucu hekimlik alanlarında her hastasına özel, ağrısız ve şeffaf bir tedavi süreci sunmaktadır.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span className="text-xs font-bold text-[#1E293B]">Sürekli Sterilizasyon & Hijyen</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span className="text-xs font-bold text-[#1E293B]">Detaylı Bilgilendirme & Şeffaflık</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span className="text-xs font-bold text-[#1E293B]">Korkusuz & Sakin Klinik Ortamı</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span className="text-xs font-bold text-[#1E293B]">Tedavi Sonrası Düzenli Takip</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openAppointmentFor("Dt. Damla Akarsu ile Ön Görüşme")}
                  className="px-6 py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-md"
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
                  className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0284C7] transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center">
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

      {/* 7. PATIENT REVIEWS */}
      <section id="yorumlar" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <span className="text-xs font-bold font-mono text-[#0284C7] uppercase tracking-wider">
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
                className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#0284C7] transition-all"
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
                  <span className="text-[11px] font-bold text-[#0284C7] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                    {r.treatment}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. ONLINE APPOINTMENT & CONTACT FORM */}
      <section id="randevu" className="py-16 sm:py-24 bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF] border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-10 shadow-xl space-y-8">
            
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold font-mono text-[#0284C7] uppercase tracking-wider">
                Hızlı & Kolay Randevu
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                Online Randevu & Ön Muayene Formu
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Formu doldurun veya doğrudan <strong>{primaryPhone}</strong> numarasını arayarak anında randevu oluşturun.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto" />
                <h3 className="text-lg font-bold text-[#0F172A]">Randevu Talebiniz Alındı!</h3>
                <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto">
                  Sayın <strong>{formData.fullName || "Hastamız"}</strong>, talebiniz klinik sistemimize iletildi. En kısa sürede telefon ile onay için sizinle iletişime geçilecektir.
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({
                      fullName: "",
                      phone: "",
                      service: "Genel Diş Muayenesi & Check-Up",
                      preferredDate: "",
                      preferredTime: "Öğleden Önce (10:00 - 13:00)",
                      notes: ""
                    });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#0284C7] text-white text-xs font-bold"
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
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors"
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
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">İlgilendiğiniz Tedavi / Hizmet</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors"
                    >
                      <option value="Genel Diş Muayenesi & Check-Up">Genel Diş Muayenesi & Check-Up</option>
                      <option value="Diş Temizliği ve Diş Beyazlatma">Diş Temizliği ve Diş Beyazlatma</option>
                      <option value="Diş Teli & Şeffaf Plak Ortodonti">Diş Teli & Şeffaf Plak Ortodonti</option>
                      <option value="İmplant Uygulamaları">İmplant Uygulamaları</option>
                      <option value="Ağrısız Kanal Tedavisi">Ağrısız Kanal Tedavisi</option>
                      <option value="20'lik Diş Çekimi & Cerrahi">20'lik Diş Çekimi & Cerrahi</option>
                      <option value="Estetik Dolgu İşlemleri">Estetik Dolgu İşlemleri</option>
                      <option value="Dijital Gülüş Tasarımı (Hollywood Smile)">Dijital Gülüş Tasarımı (Hollywood Smile)</option>
                      <option value="Zirkonyum / E-Max Kaplama">Zirkonyum / E-Max Kaplama</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#334155] font-bold mb-1">Tercih Edilen Zaman Aralığı</label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors"
                    >
                      <option value="Öğleden Önce (10:00 - 13:00)">Öğleden Önce (10:00 - 13:00)</option>
                      <option value="Öğleden Sonra (13:00 - 16:30)">Öğleden Sonra (13:00 - 16:30)</option>
                      <option value="Akşam Saatleri (16:30 - 19:30)">Akşam Saatleri (16:30 - 19:30)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#334155] font-bold mb-1">Şikayetiniz veya Notunuz (Opsiyonel)</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Mevcut diş şikayetiniz veya belirtmek istediğiniz detaylar..."
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-4 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0284C7]/20 cursor-pointer"
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
                    <span>WhatsApp'tan Yazın ({primaryPhone})</span>
                  </a>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* 9. CONTACT & MAP LOCATION */}
      <section id="iletisim" className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold font-mono text-[#0284C7] uppercase tracking-wider">
                  Ulaşım & İletişim
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1">
                  Kliniğimize Kolayca Ulaşın
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                  Merkezi lokasyon, modern muayenehane ortamı ve hasta konforu ile hizmetinizdeyiz.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Klinik Adresi</h3>
                    <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5">
                      Esenler Mah. Nebi Sok. No: 6/B, Pendik / İstanbul<br />
                      (veya Atalar Caddesi No: 6A, Kartal / İstanbul)
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Randevu & Danışma Hattı</h3>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <a href={`tel:+905445775856`} className="text-xs sm:text-sm font-bold text-[#0284C7] hover:underline">
                        (+90) 544 577 58 56
                      </a>
                      <a href="tel:+905441105856" className="text-xs text-[#64748B] hover:underline">
                        (+90) 544 110 58 56
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center shrink-0">
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
                    href="https://maps.google.com/?q=Pendik+Istanbul"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#0284C7] text-white text-xs font-bold inline-flex items-center gap-1 hover:bg-[#0369A1] transition-colors"
                  >
                    <span>Yol Tarifi Al</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative w-full h-80 sm:h-96 bg-[#E2E8F0]">
                  <iframe
                    title="Dt. Damla Akarsu Klinik Haritası"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=29.2200%2C40.8750%2C29.2600%2C40.8950&layer=mapnik&marker=40.8845%2C29.2410"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />

                  {/* Floating Pin Card */}
                  <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E2E8F0] shadow-lg max-w-xs hidden sm:block">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                      <span>Dt. Damla Akarsu Kliniği</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Esenler Mah. Nebi Sk. No:6/B, Pendik / İstanbul
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 10. FLOATING WHATSAPP BUTTON (DEDICATED) */}
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
        <span className="hidden sm:inline font-bold">WhatsApp ({primaryPhone})</span>
      </a>

      {/* 11. CLINIC FOOTER */}
      <footer className="bg-[#0F172A] text-[#94A3B8] text-xs pt-16 pb-8 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#1E293B]">
            
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] text-white flex items-center justify-center font-bold">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">Dt. Damla Akarsu</div>
                  <div className="text-[10px] text-[#BAE6FD] uppercase tracking-wider font-bold">Diş Muayenehanesi</div>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Profosyonel DENTAL KLİNİK — Ağız ve diş sağlığınız bizim için önemlidir. Sağlıklı ve doğal gülüşler için düzenli diş muayenesi olmalısınız.
              </p>
              <div className="pt-1 flex items-center gap-2 text-white font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Hasta Kabulü Açık</span>
              </div>
            </div>

            {/* Column 2: Treatments */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Kliniğimizdeki Hizmetler</div>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li><a href="#tedaviler" className="hover:text-[#BAE6FD] transition-colors">Diş Temizliği & Beyazlatma</a></li>
                <li><a href="#tedaviler" className="hover:text-[#BAE6FD] transition-colors">Diş Teli & Şeffaf Plak</a></li>
                <li><a href="#tedaviler" className="hover:text-[#BAE6FD] transition-colors">Dental İmplant Uygulamaları</a></li>
                <li><a href="#tedaviler" className="hover:text-[#BAE6FD] transition-colors">Ağrısız Kanal Tedavisi</a></li>
                <li><a href="#tedaviler" className="hover:text-[#BAE6FD] transition-colors">20'lik Diş Çekimi Cerrahisi</a></li>
                <li><a href="#tedaviler" className="hover:text-[#BAE6FD] transition-colors">Estetik Dolgu İşlemleri</a></li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Kurumsal & Rehber</div>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li><a href="#soru-cevap" className="hover:text-[#BAE6FD] transition-colors">Sıkça Sorulan Sorular</a></li>
                <li><a href="#hakkimizda" className="hover:text-[#BAE6FD] transition-colors">Dt. Damla Akarsu Hakkında</a></li>
                <li><a href="#yorumlar" className="hover:text-[#BAE6FD] transition-colors">Hasta Yorumları</a></li>
                <li><a href="#randevu" className="hover:text-[#BAE6FD] transition-colors">Online Randevu Al</a></li>
                <li><a href="#iletisim" className="hover:text-[#BAE6FD] transition-colors">Ulaşım & Harita</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">İletişim & Randevu</div>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li>Esenler Mah. Nebi Sok. No: 6/B, Pendik / İstanbul</li>
                <li>Atalar Cd. No: 6A, Kartal / İstanbul</li>
                <li>
                  <a href={`tel:+905445775856`} className="text-white font-bold hover:underline">
                    Tel: (+90) 544 577 58 56
                  </a>
                </li>
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
                <span className="text-xs font-mono font-bold text-[#0284C7] uppercase">{selectedTreatment.badge}</span>
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
                className="px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold"
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
                <span className="text-[11px] font-bold text-[#0284C7] uppercase font-mono">Hızlı Randevu</span>
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
                  className="mt-2 px-5 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">Tercih Edilen Zaman</label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#0284C7] resize-none"
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
                    className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold"
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
