"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Scissors, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  Info, 
  Heart,
  Star,
  ShieldCheck,
  UserCheck
} from "lucide-react";

interface BeautyService {
  id: string;
  category: string;
  title: string;
  duration: string;
  price: string;
  description: string;
  popular?: boolean;
}

const beautyServices: BeautyService[] = [
  {
    id: "s1",
    category: "Cilt Bakımı",
    title: "Medikal & Hydrafacial Cilt Bakımı",
    duration: "60 dk",
    price: "650 ₺",
    description: "Cildin derinlemesine temizlenmesi, ölü hücrelerin arındırılması ve vitamin serum yüklemesi.",
    popular: true
  },
  {
    id: "s2",
    category: "Cilt Bakımı",
    title: "Anti-Aging & Kolajen Bakımı",
    duration: "75 dk",
    price: "850 ₺",
    description: "İnce çizgi görünümünü azaltmaya yardımcı yoğun kolajen ve lüks nem maskesi uygulaması."
  },
  {
    id: "s3",
    category: "Kirpik & Kaş",
    title: "Kaş Laminasyonu & İpek Kirpik",
    duration: "90 dk",
    price: "550 ₺",
    description: "Doğal kaş ve kirpikleri daha dolgun, kavisli ve hacimli gösteren vitamin destekli bakım."
  },
  {
    id: "s4",
    category: "Manikür & Pedikür",
    title: "Kalıcı Oje & Medikal Manikür",
    duration: "45 dk",
    price: "380 ₺",
    description: "Steril ekipmanlarla yapılan tırnak et bakımı, şekillendirme ve 3 hafta kalıcı oje uygulaması.",
    popular: true
  },
  {
    id: "s5",
    category: "Saç Bakımı",
    title: "Keratin Yükleme & Özel Nem Maskesi",
    duration: "60 dk",
    price: "700 ₺",
    description: "Yıpranmış saç tellerini onaran, parlaklık ve pürüzsüzlük kazandıran nem terapisidir."
  },
  {
    id: "s6",
    category: "Vücut Bakımı",
    title: "Bölgesel Sıkılaşma & Detoks Masajı",
    duration: "50 dk",
    price: "600 ₺",
    description: "Lenf drenaj ve bitkisel yağlar eşliğinde vücut hatlarını rahatlatıcı profesyonel bakım."
  }
];

const faqs = [
  {
    q: "Online randevu sistemi nasıl çalışır?",
    a: "Web sitenize entegre edilecek randevu modülü sayesinde müşterileriniz istediği hizmeti, uzmanı, tarihi ve saati seçerek 7/24 randevu oluşturabilir."
  },
  {
    q: "Web sitesi mobil cihazlara tam uyumlu mu?",
    a: "Evet, tüm tasarımlarımız telefon ve tablet ekranlarında ultra hızlı açılacak ve akıcı kullanılacak şekilde mobil öncelikli geliştirilir."
  },
  {
    q: "WhatsApp ile doğrudan randevu iletişimi eklenebilir mi?",
    a: "Kesinlikle! Müşterileriniz tek bir tıkla işletmenizin resmi WhatsApp hattına bağlanarak hizmetler ve müsaitlik hakkında bilgi alabilir."
  },
  {
    q: "Güzellik salonum için kendi yönetim panelim olacak mı?",
    a: "Evet, kolay kullanımlı yönetim paneli üzerinden hizmetlerinizi, fiyatlarınızı ve fotoğraflarınızı dilediğiniz an güncelleyebilirsiniz."
  }
];

export default function DemoBeautyClient() {
  const [selectedService, setSelectedService] = useState<string>("s1");
  const [selectedDate, setSelectedDate] = useState<string>("Yarın — 14:30");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerDemoAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg("Bu bir konsept demo çalışmadır. Gerçek güzellik salonunuz için bu randevu formu WhatsApp veya SMS onay sistemine bağlanır.");
    setTimeout(() => setToastMsg(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#0d070b] text-rose-50 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* 1. ÜST KONSEPT DEMO UYARI BARI */}
      <div className="w-full bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-rose-500/20 border-b border-rose-500/30 py-2.5 px-4 text-center text-xs sm:text-sm text-rose-200 flex flex-wrap items-center justify-center gap-2 relative z-50">
        <Info className="w-4 h-4 text-rose-400 shrink-0" />
        <span>Bu sayfa <strong>KvK Dijital Çözümler</strong> tarafından güzellik salonları için hazırlanmış <strong>Konsept Demo</strong> projedir.</span>
        <Link 
          href="/#contact" 
          className="ml-2 font-bold underline hover:text-white transition-colors inline-flex items-center gap-1 text-white bg-rose-500/30 px-2.5 py-0.5 rounded-full"
        >
          Salonunuz İçin Teklif Alın <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-40 bg-[#0d070b]/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/30 to-pink-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">Aura Beauty</span>
              <span className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold block">Güzellik & Estetik</span>
            </div>
          </div>

          <nav aria-label="Demo Beauty Navigasyon" className="hidden md:flex items-center gap-8 text-sm text-rose-200/70">
            <a href="#hero" className="hover:text-rose-300 transition-colors">Ana Sayfa</a>
            <a href="#services" className="hover:text-rose-300 transition-colors">Hizmetlerimiz</a>
            <a href="#appointment" className="hover:text-rose-300 transition-colors">Randevu Modülü</a>
            <a href="#faq" className="hover:text-rose-300 transition-colors">SSS</a>
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href="#appointment"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Demo Randevu</span>
            </a>
            <Link 
              href="/#contact"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs hover:opacity-90 transition-all shadow-lg shadow-rose-500/25"
            >
              Proje Teklifi Al
            </Link>
          </div>
        </div>
      </header>

      {/* Toast Alert Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-rose-950/95 border border-rose-500/40 text-rose-100 text-xs leading-relaxed shadow-2xl backdrop-blur-xl animate-fade-in-up flex items-start gap-3">
          <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-300 mb-1">Demo Bilgilendirmesi</p>
            <p>{toastMsg}</p>
          </div>
        </div>
      )}

      {/* 3. HERO SECTION */}
      <section id="hero" className="relative py-24 md:py-32 overflow-hidden flex items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Güzellik Salonu & Bakım Merkezi Konsept Tasarımı
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
              Bakım ve Güzelliğin <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-rose-400">Modern Adresi.</span>
            </h1>
            <p className="text-lg text-rose-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Uzman dokunuşlar, hijyenik ekipmanlar ve cildinize özel bakım terapileri ile ışıltınızı yeniden keşfedin.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href="#appointment"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm hover:opacity-95 transition-all flex items-center gap-2 shadow-xl shadow-rose-500/25 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Online Randevu Al
              </a>
              <a 
                href="#services"
                className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer"
              >
                Hizmetleri İncele
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HİZMETLER GRID SECTION */}
      <section id="services" className="py-20 bg-rose-950/20 border-y border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block mb-2">Aura Özel Bakımları</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Öne Çıkan Hizmetlerimiz</h2>
            <p className="text-rose-200/60 text-sm">Salonda uygulanan örnek kişisel bakım ve güzellik terapileri.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beautyServices.map(srv => (
              <div 
                key={srv.id}
                className="p-7 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {srv.popular && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                    En Çok Tercih Edilen
                  </span>
                )}
                <div>
                  <span className="text-rose-400 text-[11px] font-semibold tracking-wider uppercase block mb-2">
                    {srv.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">{srv.title}</h3>
                  <p className="text-rose-100/60 text-xs leading-relaxed mb-6">{srv.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-rose-200/50 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{srv.duration}</span>
                  </div>
                  <span className="text-rose-300 font-bold text-lg">{srv.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERAKTİF DEMO RANDEVU MODÜLÜ */}
      <section id="appointment" className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-rose-950/40 via-black to-[#0d070b] border border-rose-500/30 shadow-2xl relative">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block mb-2">Demo Randevu Deneyimi</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Online Randevu Oluşturun</h2>
              <p className="text-rose-200/60 text-xs">
                Müşterilerinizin siteniz üzerinden saniyeler içinde randevu alabileceği örnek sistem arayüzü.
              </p>
            </div>

            <form onSubmit={triggerDemoAppointment} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-rose-200 mb-2">Hizmet Seçimi</label>
                  <select 
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    {beautyServices.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.title} — {s.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-200 mb-2">Tarih & Saat</label>
                  <select 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option className="bg-slate-900 text-white">Bugün — 16:00</option>
                    <option className="bg-slate-900 text-white">Yarın — 11:30</option>
                    <option className="bg-slate-900 text-white">Yarın — 14:30</option>
                    <option className="bg-slate-900 text-white">Cuma — 15:00</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center justify-between">
                <span className="font-medium">Seçili Bakım Süresi:</span>
                <span className="font-bold text-rose-300">~60 Dakika</span>
              </div>

              <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm hover:opacity-95 transition-all shadow-xl shadow-rose-500/20 cursor-pointer"
              >
                Demo Randevuyu Onayla
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 6. FAQ (SIK SORULAN SORULAR) */}
      <section id="faq" className="py-20 bg-rose-950/20 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block mb-2">Güzellik Salonları İçin</span>
            <h2 className="text-3xl font-bold text-white mb-4">Sık Sorulan Sorular</h2>
            <p className="text-rose-200/60 text-xs">Web sitesi yaptırmak isteyen salon sahiplerinin merak ettiği sorular.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-rose-400 shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-xs text-rose-100/70 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LEAD CONVERSION BANNER */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-r from-rose-950 via-black to-rose-950 border border-rose-500/30 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Güzellik Salonunuz İçin Benzer Bir Web Sitesi İster Misiniz?</h2>
            <p className="text-rose-200/70 text-sm max-w-2xl mx-auto leading-relaxed">
              Müşterilerinizin online randevu alabileceği, mobil uyumlu ve SEO odaklı özel tasarımlı web sitenizi 3 gün içinde yayına alalım.
            </p>
            <Link 
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm hover:opacity-95 transition-all shadow-xl shadow-rose-500/30"
            >
              KvK Dijital'den Teklif Alın <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. DEMO FOOTER */}
      <footer className="py-12 border-t border-white/10 bg-[#080407]">
        <div className="container mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-rose-200/50 text-xs">
            <span>Aura Beauty & Güzellik Merkezi</span>
            <span>•</span>
            <span className="text-rose-400">Konsept Demo Çalışma</span>
          </div>
          <p className="text-[11px] text-rose-200/40 max-w-xl mx-auto leading-relaxed">
            Bu sayfa <strong>KvK Dijital Çözümler</strong> ajansı tarafından güzellik salonu ve estetik sektöründeki işletmelere özel web tasarım konseptini sergilemek amacıyla hazırlanmıştır. Gerçek müşteri verisi veya tıbbi teşhis içermez.
          </p>
          <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-xs text-rose-200/60">
            <Link href="/" className="hover:text-rose-300 transition-colors">KvK Dijital Ana Sayfa</Link>
            <Link href="/projeler" className="hover:text-rose-300 transition-colors">Tüm Örnek Projeler</Link>
            <Link href="/#contact" className="hover:text-rose-300 transition-colors">İletişim & Teklif</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
