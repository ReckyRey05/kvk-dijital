"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  FileText, 
  Building2, 
  Scale, 
  Briefcase, 
  ArrowRight, 
  ChevronDown, 
  Info,
  CheckCircle2,
  Calendar
} from "lucide-react";

interface PracticeArea {
  id: string;
  code: string;
  title: string;
  description: string;
  scope: string[];
}

const practiceAreas: PracticeArea[] = [
  {
    id: "pa-1",
    code: "01",
    title: "Ticaret Hukuku & Şirketler Danışmanlığı",
    description: "Şirket kuruluşları, birleşme ve devralmalar, genel kurul süreçleri ve kurumsal yönetim esaslarında hukuki danışmanlık.",
    scope: ["Şirket Birleşmeleri", "Ticari Sözleşmeler", "Kurumsal Yönetim Riskleri"]
  },
  {
    id: "pa-2",
    code: "02",
    title: "İş Hukuku & İnsan Kaynakları Uyum",
    description: "İş sözleşmelerinin düzenlenmesi, iç yönetmelikler, iş sağlığı ve güvenliği uyum süreçleri ve uyuşmazlık yönetimi.",
    scope: ["İş Sözleşmeleri", "İç Yönetmelik Hazırlığı", "Arabuluculuk Süreçleri"]
  },
  {
    id: "pa-3",
    code: "03",
    title: "Gayrimenkul & İnşaat Hukuku",
    description: "Gayrimenkul alım-satım sözleşmeleri, kira hukuku, mimari projelendirme ve mülkiyet uyuşmazlıklarında hukuki rehberlik.",
    scope: ["Kira Sözleşmeleri", "Mülkiyet Devri", "Proje Uyum Danışmanlığı"]
  },
  {
    id: "pa-4",
    code: "04",
    title: "Ticari Sözleşmeler Hukuku",
    description: "Uluslararası ve yerel ticari sözleşmelerin hazırlanması, revizyonu, risk analizleri ve fesih süreçlerinin takibi.",
    scope: ["Gizlilik Sözleşmeleri", "Tedarik & Bayilik", "Fesih Danışmanlığı"]
  },
  {
    id: "pa-5",
    code: "05",
    title: "Uyuşmazlık Çözümü & Müzakere",
    description: "Ticari uyuşmazlıklarda mahkeme öncesi müzakere, sulh süreçleri ve arabuluculuk danışmanlık hizmetleri.",
    scope: ["Müzakere Stratejisi", "Sulh Görüşmeleri", "Arabuluculuk Takibi"]
  }
];

const guideArticles = [
  {
    title: "Ticari Sözleşmelerde Risk Analizinin Önemi",
    category: "Sözleşmeler Hukuku",
    readTime: "4 dk okuma",
    desc: "Sözleşme taslaklarında yer alan cezai şart, fesih ve yetki maddelerinin kurumsal işletmeler için oluşturduğu finansal riskler."
  },
  {
    title: "Şirket Kuruluşlarında Ana Sözleşme Hazırlık Rehberi",
    category: "Şirketler Hukuku",
    readTime: "5 dk okuma",
    desc: "Ortaklar arası hak dengesi, pay devri kısıtlamaları ve yönetim kurulunun yetki sınırlarının doğru yapılandırılması."
  },
  {
    title: "İş Yerlerinde KVKK ve İş Hukuku Uyum Adımları",
    category: "Kurumsal Uyum",
    readTime: "3 dk okuma",
    desc: "Çalışan kişisel verilerinin korunması, aydınlatma metinleri ve açık rıza onaylarının mevzuata uygun şekilde arşivlenmesi."
  }
];

const faqs = [
  {
    q: "Hukuki danışmanlık süreci nasıl başlar?",
    a: "Öncelikle işletmenizin veya bireysel konunuzun hukuki durum analizi yapılarak ön danışmanlık çerçevesi ve çalışma modeli belirlenir."
  },
  {
    q: "Kurumsal şirketlere düzenli danışmanlık sunuluyor mu?",
    a: "Evet, web sitemizdeki bu konsept modelde olduğu gibi kurumsal firmalara aylık hukuki danışmanlık ve sözleşme denetim hizmetleri entegre edilebilir."
  },
  {
    q: "Web sitemize Hukuki Rehber / Blog alanı eklenebilir mi?",
    a: "Kesinlikle! Müvekkillerinizi ve okuyucularınızı bilgilendirmek amacıyla dinamik Türkçe içerik yönetim paneli eklenebilir."
  }
];

export default function DemoHukukClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>("pa-1");

  const triggerToast = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg("Bu bir konsept demo çalışmadır. Gerçek hukuk büronuz veya danışmanlık firmanız için benzer bir iletişim & randevu modülü kurulur.");
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0a1226] text-[#f7f5f0] flex flex-col font-sans selection:bg-[#c59b63]/30 selection:text-white">
      
      {/* 1. KONSEPT DEMO BARI & ANA SİTEYE DÖNÜŞ */}
      <div className="w-full bg-[#060b17] border-b border-[#1c2a4a] py-2.5 px-4 text-center text-xs text-[#c59b63] flex flex-wrap items-center justify-center gap-3 relative z-50">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#c59b63] shrink-0" />
          <span>Bu sayfa <strong>KvK Dijital Çözümler</strong> tarafından hazırlanmış <strong>Konsept Demo Çalışma</strong>dır.</span>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded transition-colors inline-flex items-center gap-1 text-[11px]"
          >
            ← Ana Sayfaya Dön
          </Link>
          <Link 
            href="/#iletisim" 
            className="font-bold text-[#0a1226] bg-[#c59b63] hover:bg-[#d6ac74] px-3 py-1 rounded transition-colors inline-flex items-center gap-1 text-[11px] uppercase tracking-wider"
          >
            KvK'den Teklif Al <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Fixed Floating Back to Main Site Button (Sol Alt Kilitli) */}
      <div className="fixed bottom-6 left-6 z-50 hidden sm:block">
        <Link
          href="/"
          className="px-4 py-2.5 rounded-full bg-[#060b17]/95 text-[#f7f5f0] border border-[#c59b63]/60 text-xs font-bold shadow-2xl flex items-center gap-2 hover:bg-[#121c36] hover:scale-105 transition-all backdrop-blur-md"
        >
          <span className="text-[#c59b63]">←</span> Ana KvK Sitesine Dön
        </Link>
      </div>

      {/* 2. INSTITUTIONAL CORPORATE DOUBLE BAR HEADER */}
      <header className="sticky top-0 z-40 bg-[#0a1226]/95 backdrop-blur-md border-b border-[#1a2745]">
        
        {/* Top Corporate Utility Bar */}
        <div className="hidden md:block bg-[#060c1c] border-b border-[#152342] py-1.5 px-6 text-[11px] text-[#8c9bbd]">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span>📍 Maslak Plaza Kat:14, Sarıyer / İstanbul</span>
              <span>📞 0216 450 00 00</span>
              <span>✉️ kurumsal@prestijhukuk.com</span>
            </div>
            <span className="font-mono text-[#c59b63]">Çalışma Saatleri: Pzt - Cum 09:00 - 18:00</span>
          </div>
        </div>

        {/* Main Institutional Header Bar */}
        <div className="container mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="text-xs font-semibold text-[#8c9bbd] hover:text-[#c59b63] transition-colors inline-flex items-center gap-1">
              ← Ana Sayfa
            </Link>
            <span className="text-[#1c2a4a]">|</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-[#f7f5f0]">PRESTİJ</span>
              <span className="text-[10px] uppercase tracking-widest text-[#c59b63] font-semibold hidden sm:inline">Hukuk & Danışmanlık</span>
            </div>
          </div>

          <nav aria-label="Hukuk Navigasyon" className="hidden lg:flex items-center gap-8 text-xs tracking-widest uppercase text-[#9eaecf]">
            <a href="#philosophy" className="hover:text-[#c59b63] transition-colors">Yaklaşımımız</a>
            <a href="#practice" className="hover:text-[#c59b63] transition-colors">Çalışma Alanlarımız</a>
            <a href="#guide" className="hover:text-[#c59b63] transition-colors">Hukuki Rehber</a>
            <a href="#faq" className="hover:text-[#c59b63] transition-colors">Sık Sorulan Sorular</a>
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href="#contact"
              className="px-4 py-2 bg-[#c59b63] text-[#0a1226] font-bold text-xs tracking-widest uppercase hover:bg-[#d6ac74] transition-all"
            >
              Danışmanlık Talebi
            </a>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-5 bg-[#0f1b38] border border-[#c59b63] text-[#f7f5f0] text-xs leading-relaxed shadow-2xl flex items-start gap-3 rounded-lg">
          <Info className="w-5 h-5 text-[#c59b63] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#c59b63] mb-1">Demo Bilgilendirmesi</p>
            <p>{toastMsg}</p>
          </div>
        </div>
      )}

      {/* 3. SWISS / INSTITUTIONAL SPLIT HERO */}
      <section className="py-20 md:py-28 border-b border-[#1a2745] relative overflow-hidden bg-[#0d162d]/60">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Editorial Text Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#152342] border border-[#253966] text-[#c59b63] text-[11px] tracking-widest uppercase font-semibold">
                <Scale className="w-3.5 h-3.5 text-[#c59b63]" />
                Kurumsal Hukuk & Danışmanlık Konsepti
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#f7f5f0] leading-[1.12] tracking-tight">
                Hukukta Güven, <br />
                <em className="italic font-serif text-[#c59b63] font-normal">Danışmanlıkta Netlik.</em>
              </h1>

              <div className="w-20 h-0.5 bg-[#c59b63]/60" />

              <p className="text-base sm:text-lg text-[#a2b3d6] font-light leading-relaxed max-w-2xl">
                Kurumsal işletmeler, şirket ortaklıkları ve ticari faaliyetler için net analiz, güçlü iletişim ve sürdürülebilir hukuki yaklaşım.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-6">
                <a 
                  href="#contact"
                  className="px-8 py-4 bg-[#c59b63] text-[#0a1226] font-bold text-xs tracking-widest uppercase hover:bg-[#d6ac74] transition-all inline-flex items-center gap-2 shadow-xl shadow-[#c59b63]/10"
                >
                  <Briefcase className="w-4 h-4" /> Danışmanlık Talebi Oluştur
                </a>
                <a 
                  href="#practice"
                  className="px-8 py-4 border border-[#253966] text-[#f7f5f0] font-semibold text-xs tracking-widest uppercase hover:border-[#c59b63] transition-all"
                >
                  Çalışma Alanlarımız
                </a>
              </div>
            </div>

            {/* Right Legal Architecture Photo Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative border border-[#253966] shadow-2xl bg-[#121d38] h-[500px] overflow-hidden rounded-sm">
                <img 
                  src="/images/demos/prestij-hukuk/hero.jpg" 
                  alt="Prestij Hukuk & Danışmanlık kurumsal kütüphane ve resmi toplantı alanı"
                  className="w-full h-full object-cover"
                  loading="eager"
                  width={1000}
                  height={800}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1226]/90 via-transparent to-transparent p-8 flex flex-col justify-end">
                  <span className="font-serif italic text-[#f7f5f0] text-lg">"Netlik, şeffaflık ve kurumsal disiplin."</span>
                  <span className="text-[10px] text-[#c59b63] tracking-widest uppercase mt-1">Konsept Danışmanlık Yaklaşımı</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. INSTITUTIONAL PHILOSOPHY SECTION */}
      <section id="philosophy" className="py-24 bg-[#080e1e] border-b border-[#1a2745]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[#c59b63] text-xs font-semibold tracking-widest uppercase block">Yaklaşımımız</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#f7f5f0]">Kurumsal Hukuk İlkelerimiz</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4 p-8 bg-[#0d162d] border border-[#1c2a4a]">
              <span className="font-serif text-3xl font-light text-[#c59b63]">01.</span>
              <h3 className="font-serif text-xl font-normal text-[#f7f5f0]">Önleyici Hukuk Analizi</h3>
              <p className="text-xs text-[#9eaecf] leading-relaxed">
                Uyuşmazlıklar ortaya çıkmadan önce ticari riskleri ve sözleşme açıklarını tespit ederek önleyici hukuki mekanizmalar kuruyoruz.
              </p>
            </div>

            <div className="space-y-4 p-8 bg-[#0d162d] border border-[#1c2a4a]">
              <span className="font-serif text-3xl font-light text-[#c59b63]">02.</span>
              <h3 className="font-serif text-xl font-normal text-[#f7f5f0]">Şeffaf İletişim & Raporlama</h3>
              <p className="text-xs text-[#9eaecf] leading-relaxed">
                Tüm hukuki süreçler ve müzakereler karmaşık terimlerden arındırılmış, net ve düzenli raporlar halinde müvekkillere sunulur.
              </p>
            </div>

            <div className="space-y-4 p-8 bg-[#0d162d] border border-[#1c2a4a]">
              <span className="font-serif text-3xl font-light text-[#c59b63]">03.</span>
              <h3 className="font-serif text-xl font-normal text-[#f7f5f0]">Gizlilik & Meslek Etiği</h3>
              <p className="text-xs text-[#9eaecf] leading-relaxed">
                Kurumsal şirket verileri ve ticari sırlar en yüksek düzeyde dijital ve fiziksel güvenlik standartları ile korunur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRACTICE AREAS (NUMBERED INDEX LIST - NO CARDS OVERDOSE) */}
      <section id="practice" className="py-24 border-b border-[#1a2745]">
        <div className="container mx-auto px-6 max-w-5xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[#c59b63] text-xs font-semibold tracking-widest uppercase block">Uzmanlık Alanlarımız</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#f7f5f0]">Çalışma Alanlarımız</h2>
          </div>

          <div className="space-y-4">
            {practiceAreas.map(pa => (
              <div 
                key={pa.id}
                onClick={() => setSelectedArea(pa.id)}
                className={`p-8 border transition-all cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-6 ${
                  selectedArea === pa.id 
                    ? "bg-[#111e3d] border-[#c59b63]" 
                    : "bg-[#0d162d] border-[#1c2a4a] hover:border-[#c59b63]/50"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-serif text-2xl font-bold text-[#c59b63]">{pa.code}</span>
                  <div className="space-y-2 max-w-2xl">
                    <h3 className="font-serif text-xl text-[#f7f5f0]">{pa.title}</h3>
                    <p className="text-xs text-[#9eaecf] leading-relaxed">{pa.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {pa.scope.map(s => (
                        <span key={s} className="text-[10px] uppercase font-mono tracking-wider text-[#c59b63] bg-[#c59b63]/10 px-2.5 py-1 border border-[#c59b63]/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. LEGAL GUIDE ARTICLES SHOWCASE */}
      <section id="guide" className="py-24 bg-[#080e1e] border-b border-[#1a2745]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[#c59b63] text-xs font-semibold tracking-widest uppercase block mb-2">Bilgi Paylaşımı</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#f7f5f0]">Hukuki Rehber & Makaleler</h2>
            </div>
            <p className="text-xs text-[#9eaecf] max-w-md">
              Şirket yöneticileri ve girişimciler için hazırladığımız bilgilendirici hukuk makaleleri konsepti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guideArticles.map((art, idx) => (
              <div key={idx} className="p-8 bg-[#0d162d] border border-[#1c2a4a] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#c59b63]">
                    <span>{art.category}</span>
                    <span className="font-mono text-[#788bb5]">{art.readTime}</span>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#f7f5f0]">{art.title}</h3>
                  <p className="text-xs text-[#9eaecf] leading-relaxed">{art.desc}</p>
                </div>
                <button 
                  type="button" 
                  onClick={triggerToast}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#c59b63] hover:text-white transition-colors pt-4 border-t border-[#1c2a4a] text-left"
                >
                  Makaleyi İncele <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INSTITUTIONAL TEAM CULTURE (NO FAKE PEOPLE) */}
      <section className="py-24 border-b border-[#1a2745]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="h-[460px] border border-[#253966] relative bg-[#121d38] overflow-hidden">
              <img 
                src="/images/demos/prestij-hukuk/meeting.jpg" 
                alt="Kurumsal hukuk toplantısı ve müzakere ortamı"
                className="w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>

            <div className="space-y-6">
              <span className="text-[#c59b63] text-xs font-semibold tracking-widest uppercase block">Kurumsal Kültür</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#f7f5f0] leading-tight">
                Disiplinli Müzakere, Çözüm Odaklı Strateji.
              </h2>
              <p className="text-xs text-[#9eaecf] leading-relaxed">
                Hukuki uyuşmazlıklarda sadece mevzuatı değil, işletmenizin ticari hedeflerini de göz önünde bulunduran stratejik bir yaklaşım benimsiyoruz.
              </p>
              <div className="pt-2">
                <a 
                  href="#contact"
                  className="px-6 py-3 border border-[#253966] text-[#c59b63] text-xs uppercase tracking-widest font-semibold hover:border-[#c59b63] transition-all inline-flex items-center gap-2"
                >
                  Danışmanlık Alın <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#080e1e] border-b border-[#1a2745]">
        <div className="container mx-auto px-6 max-w-3xl space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[#c59b63] text-xs font-semibold tracking-widest uppercase block">Bilgi Bankası</span>
            <h2 className="font-serif text-3xl font-normal text-[#f7f5f0]">Sık Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="border border-[#1c2a4a] bg-[#0d162d] overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between font-serif text-base text-[#f7f5f0] hover:text-[#c59b63] transition-colors cursor-pointer"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#c59b63] transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-xs text-[#9eaecf] leading-relaxed border-t border-[#1c2a4a] pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACT FORM SIMULATION & KVK CONVERSION BANNER */}
      <section id="contact" className="py-24 border-b border-[#1a2745]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="p-8 sm:p-12 border border-[#253966] bg-[#0d162d] shadow-2xl">
            
            <div className="text-center space-y-3 mb-10">
              <span className="text-[#c59b63] text-xs font-semibold tracking-widest uppercase block">Demo Danışmanlık Modülü</span>
              <h2 className="font-serif text-3xl font-normal text-[#f7f5f0]">Hukuki Danışmanlık Talebi</h2>
              <p className="text-xs text-[#9eaecf]">
                Hukuk büronuz veya danışmanlık firmanız için müşterilerinizin randevu oluşturabileceği arayüz örneği.
              </p>
            </div>

            <form onSubmit={triggerToast} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#c59b63] mb-2 font-semibold">Adınız & Soyadınız</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Mehmet Yılmaz"
                    className="w-full px-4 py-3.5 bg-[#080e1e] border border-[#1c2a4a] text-[#f7f5f0] text-xs focus:outline-none focus:border-[#c59b63]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#c59b63] mb-2 font-semibold">Şirket / İşletme Unvanı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: ABC Lojistik A.Ş."
                    className="w-full px-4 py-3.5 bg-[#080e1e] border border-[#1c2a4a] text-[#f7f5f0] text-xs focus:outline-none focus:border-[#c59b63]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#c59b63] mb-2 font-semibold">Danışmanlık Konusu</label>
                <select className="w-full px-4 py-3.5 bg-[#080e1e] border border-[#1c2a4a] text-[#f7f5f0] text-xs focus:outline-none focus:border-[#c59b63]">
                  <option className="bg-[#080e1e] text-[#f7f5f0]">Ticaret Hukuku & Şirketler Danışmanlığı</option>
                  <option className="bg-[#080e1e] text-[#f7f5f0]">İş Hukuku & Uyum</option>
                  <option className="bg-[#080e1e] text-[#f7f5f0]">Gayrimenkul & Sözleşmeler</option>
                  <option className="bg-[#080e1e] text-[#f7f5f0]">Diğer Kurumsal Uyuşmazlıklar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#c59b63] mb-2 font-semibold">Konu Özeti / Mesajınız</label>
                <textarea 
                  rows={4}
                  placeholder="Danışmanlık talep ettiğiniz konuyu kısaca özetleyin..."
                  className="w-full px-4 py-3.5 bg-[#080e1e] border border-[#1c2a4a] text-[#f7f5f0] text-xs focus:outline-none focus:border-[#c59b63]"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-[#c59b63] text-[#0a1226] font-bold text-xs tracking-widest uppercase hover:bg-[#d6ac74] transition-all cursor-pointer shadow-xl shadow-[#c59b63]/10"
              >
                Danışmanlık Talebini Gönder (Demo)
              </button>
            </form>

          </div>
        </div>
      </section>

      {/* 10. KVK CONVERSION FOOTER */}
      <footer className="py-16 bg-[#040812] text-center space-y-6 text-[#f7f5f0]">
        <div className="container mx-auto px-6 max-w-3xl space-y-6">
          <h2 className="font-serif text-3xl font-normal text-[#f7f5f0]">
            Hukuk veya Danışmanlık Firmanız İçin Özel Bir Web Sitesi İster Misiniz?
          </h2>
          <p className="text-xs text-[#8c9bbd] max-w-xl mx-auto leading-relaxed">
            Bu sayfa <strong>KvK Dijital Çözümler</strong> ajansı tarafından hukuk büroları ve kurumsal danışmanlık işletmelerine özel tasarım konseptini sergilemek amacıyla hazırlanmıştır. Gerçek müşteri verisi veya resmi hukuki tavsiye içermez.
          </p>
          <div>
            <Link 
              href="/#iletisim"
              className="px-8 py-3.5 bg-[#c59b63] text-[#0a1226] font-bold text-xs tracking-widest uppercase hover:bg-[#d6ac74] transition-all inline-flex items-center gap-2"
            >
              KvK Dijital'den Teklif Alın <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="pt-8 border-t border-[#1a2745] flex items-center justify-center gap-6 text-xs text-[#6e7d9e]">
            <Link href="/" className="hover:text-white transition-colors">KvK Ana Sayfa</Link>
            <Link href="/projeler" className="hover:text-white transition-colors">Tüm Örnek Projeler</Link>
            <Link href="/#iletisim" className="hover:text-white transition-colors">İletişim & Teklif</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
