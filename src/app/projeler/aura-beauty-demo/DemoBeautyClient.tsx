"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  Info
} from "lucide-react";

interface TreatmentItem {
  id: string;
  category: string;
  name: string;
  duration: string;
  price: string;
  description: string;
}

const treatments: TreatmentItem[] = [
  {
    id: "t1",
    category: "Cilt Terapileri",
    name: "Medikal & Hydrafacial Cilt Bakımı",
    duration: "60 dk",
    price: "650 ₺",
    description: "Cildin gözenek düzeyinde arındırılması, ölü hücre temizliği ve yoğun hyalüronik serum yüklemesi."
  },
  {
    id: "t2",
    category: "Cilt Terapileri",
    name: "Anti-Aging & Kolajen Terapisi",
    duration: "75 dk",
    price: "850 ₺",
    description: "Cildin esneklik dengesini destekleyen kolajen kompleks maske ve soğuk pres yüz masajı."
  },
  {
    id: "t3",
    category: "Kaş & Kirpik",
    name: "Kaş Laminasyonu & Vitamin Bakımı",
    duration: "60 dk",
    price: "550 ₺",
    description: "Doğal kaş formunu besleyici keratin kompleksleri ile şekillendiren hacim terapisi."
  },
  {
    id: "t4",
    category: "Tırnak Bakımı",
    name: "Medikal Manikür & Kalıcı Bakım",
    duration: "45 dk",
    price: "380 ₺",
    description: "Steril hijyen standartlarında yapılan tırnak et bakımı, besleyici yağlar ve kalıcı uygulama."
  },
  {
    id: "t5",
    category: "Saç Terapileri",
    name: "Derin Nem & Keratin Yükleme",
    duration: "60 dk",
    price: "60 dk",
    description: "Isı ve dış etkenlerden koruyan, saç tellerini içeriden dışarıya pürüzsüzleştiren özel terapi."
  }
];

const faqs = [
  {
    q: "Online randevu sistemi nasıl çalışır?",
    a: "Web sitenize entegre edilecek randevu modülü sayesinde müşterileriniz istediği hizmeti, tarihi ve saati seçerek 7/24 randevu talebinde bulunabilir."
  },
  {
    q: "Güzellik salonum için kendi yönetim panelim olacak mı?",
    a: "Evet, Türkçe yönetim paneli üzerinden hizmetlerinizi, fiyatlarınızı ve fotoğraflarınızı dilediğiniz an güncelleyebilirsiniz."
  },
  {
    q: "WhatsApp ile doğrudan iletişim eklenebilir mi?",
    a: "Kesinlikle! Müşterileriniz tek bir tıkla işletmenizin resmi WhatsApp hattına bağlanarak doğrudan bilgi alabilir."
  }
];

export default function DemoBeautyClient() {
  const [activeTab, setActiveTab] = useState<string>("t1");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerDemoToast = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg("Bu bir konsept demo çalışmadır. Gerçek güzellik salonunuz için bu randevu formu WhatsApp veya SMS onay sistemine bağlanır.");
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-[#f5f2eb] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-white">
      
      {/* 1. KONSEPT DEMO BARI */}
      <div className="w-full bg-[#121218] border-b border-[#242330] py-2.5 px-4 text-center text-xs text-[#d4af37] flex flex-wrap items-center justify-center gap-2 relative z-50">
        <Info className="w-4 h-4 text-[#d4af37] shrink-0" />
        <span>Bu sayfa <strong>KvK Dijital Çözümler</strong> tarafından güzellik & bakım salonları için hazırlanmış <strong>Konsept Demo Çalışma</strong>dır.</span>
        <Link 
          href="/#contact" 
          className="ml-2 font-semibold underline hover:text-white transition-colors inline-flex items-center gap-1 text-white bg-[#d4af37]/20 px-2.5 py-0.5 rounded"
        >
          Salonunuz İçin Teklif Alın <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. LUXURY FASHION EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-[#0a0a0d]/95 backdrop-blur-md border-b border-[#1c1b26]">
        <div className="container mx-auto px-6 h-22 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl font-light tracking-widest text-[#f5f2eb]">AURA</span>
            <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-medium">Beauty & Spa</span>
          </div>

          <nav aria-label="Aura Beauty Navigasyon" className="hidden lg:flex items-center gap-10 text-xs tracking-widest uppercase text-[#9e978c]">
            <a href="#philosophy" className="hover:text-[#d4af37] transition-colors">Yaklaşımımız</a>
            <a href="#treatments" className="hover:text-[#d4af37] transition-colors">Bakım Hizmetleri</a>
            <a href="#showcase" className="hover:text-[#d4af37] transition-colors">Salon Atmosferi</a>
            <a href="#booking" className="hover:text-[#d4af37] transition-colors">Randevu Al</a>
            <a href="#faq" className="hover:text-[#d4af37] transition-colors">Sık Sorulan Sorular</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="#booking"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-[#3b384a] text-[#d4af37] text-xs uppercase tracking-widest hover:border-[#d4af37] transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Demo Randevu</span>
            </a>
            <Link 
              href="/#contact"
              className="px-5 py-2.5 bg-[#d4af37] text-[#0a0a0d] font-bold text-xs tracking-widest uppercase hover:bg-[#e2c152] transition-all"
            >
              Teklif Al
            </Link>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 bg-[#14131d] border border-[#d4af37]/40 text-[#f5f2eb] text-xs leading-relaxed shadow-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#d4af37] mb-1">Demo Bilgilendirmesi</p>
            <p>{toastMsg}</p>
          </div>
        </div>
      )}

      {/* 3. SPLIT PORTRAIT EDITORIAL HERO (LUXURY SPA COMPOSITION) */}
      <section className="py-20 md:py-28 border-b border-[#1c1b26] relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Portrait Editorial Image Frame */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <div className="relative border border-[#2b2a3a] shadow-2xl bg-[#14131b] h-[520px] overflow-hidden">
                <img 
                  src="/images/demos/aura-beauty/hero.jpg" 
                  alt="Ferah salonda medikal cilt bakımı ve kolajen yüz terapisi uygulaması"
                  className="w-full h-full object-cover"
                  loading="eager"
                  width={1000}
                  height={800}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d]/90 via-transparent to-transparent p-8 flex flex-col justify-end">
                  <span className="font-serif italic text-[#f5f2eb] text-lg">"Doğal denge, derin ışıltı."</span>
                  <span className="text-[10px] text-[#d4af37] tracking-widest uppercase mt-1">Aura Estetik Ritüelleri</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Headline & Single CTA */}
            <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a1924] border border-[#2e2c3d] text-[#d4af37] text-[11px] tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                Güzellik Salonu & Estetik Konsept Tasarımı
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#f5f2eb] leading-[1.15] tracking-tight">
                Zamansız Güzellik & <br />
                <em className="italic font-serif text-[#d4af37] font-normal">Derin Cilt Terapileri.</em>
              </h1>

              <p className="text-base sm:text-lg text-[#9e978c] font-light leading-relaxed max-w-2xl">
                Uzman cilt terapistleri, steril ekipmanlar ve cildinize özel bakım terapileri ile ışıltınızı yeniden keşfedin.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-6">
                <a 
                  href="#booking"
                  className="px-8 py-4 bg-[#d4af37] text-[#0a0a0d] font-bold text-xs tracking-widest uppercase hover:bg-[#e2c152] transition-all inline-flex items-center gap-2 shadow-xl shadow-[#d4af37]/10"
                >
                  <Calendar className="w-4 h-4" /> Randevu Deneyimini Keşfet
                </a>
                <a 
                  href="#treatments"
                  className="px-8 py-4 border border-[#3b384a] text-[#f5f2eb] font-semibold text-xs tracking-widest uppercase hover:border-[#d4af37] transition-all"
                >
                  Bakım Kataloğu
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. BRAND PHILOSOPHY & CLEAN STANDARDS (3-COLUMN MINIMALIST TEXT LIST - NO CARDS) */}
      <section id="philosophy" className="py-24 bg-[#0e0e13] border-b border-[#1c1b26]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[#d4af37] text-xs font-medium tracking-widest uppercase block">Yaklaşımımız</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#f5f2eb]">Sağlıklı Cilt, Doğal Işıltı</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <span className="font-serif text-3xl font-light text-[#d4af37]">01.</span>
              <h3 className="font-serif text-xl font-normal text-[#f5f2eb]">Kişiye Özel Analiz</h3>
              <p className="text-xs text-[#9e978c] leading-relaxed">
                Her cilt tipi farklıdır. Bakım öncesinde cildin nem ve hassasiyet dengesi değerlendirilerek uygun protokol belirlenir.
              </p>
            </div>

            <div className="space-y-4">
              <span className="font-serif text-3xl font-light text-[#d4af37]">02.</span>
              <h3 className="font-serif text-xl font-normal text-[#f5f2eb]">Steril & Yüksek Hijyen</h3>
              <p className="text-xs text-[#9e978c] leading-relaxed">
                Tüm uygulama ekipmanları tek kullanımlık veya otoklav sterilizasyon süreçlerinden geçirilerek güvenle kullanılır.
              </p>
            </div>

            <div className="space-y-4">
              <span className="font-serif text-3xl font-light text-[#d4af37]">03.</span>
              <h3 className="font-serif text-xl font-normal text-[#f5f2eb]">Dermatolojik Ürünler</h3>
              <p className="text-xs text-[#9e978c] leading-relaxed">
                Sentetik katkı maddesi içermeyen, uluslararası sertifikalı dermatolojik serumlar ve maskeler tercih edilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TREATMENT PORTFOLIO (EDITORIAL FULL-WIDTH ACCORDION LIST) */}
      <section id="treatments" className="py-24 border-b border-[#1c1b26]">
        <div className="container mx-auto px-6 max-w-5xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[#d4af37] text-xs font-medium tracking-widest uppercase block">Terapi Kataloğu</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#f5f2eb]">Öne Çıkan Bakımlarımız</h2>
          </div>

          <div className="space-y-6">
            {treatments.map(t => (
              <div 
                key={t.id}
                className="p-8 border border-[#21202b] bg-[#111017] hover:border-[#d4af37]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[10px] tracking-widest uppercase text-[#d4af37] font-semibold block">{t.category}</span>
                  <h3 className="font-serif text-xl text-[#f5f2eb] group-hover:text-[#d4af37] transition-colors">{t.name}</h3>
                  <p className="text-xs text-[#9e978c] leading-relaxed">{t.description}</p>
                </div>
                <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#21202b]">
                  <span className="text-xs text-[#807b71] font-mono">{t.duration}</span>
                  <span className="font-serif text-xl text-[#d4af37] font-semibold">{t.price}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. EDITORIAL PHOTOGRAPHY SHOWCASE */}
      <section id="showcase" className="py-24 bg-[#0e0e13] border-b border-[#1c1b26]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="h-[460px] border border-[#262433] relative bg-[#14131c] overflow-hidden">
              <img 
                src="/images/demos/aura-beauty/spa-oil.jpg" 
                alt="Aromaterapi spa yağları ve sakinleştirici masaj ortamı"
                className="w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>

            <div className="space-y-6">
              <span className="text-[#d4af37] text-xs font-medium tracking-widest uppercase block">Salon Atmosferi</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#f5f2eb] leading-tight">
                Sakinlik ve Huzur İçinde Yenilenme Deneyimi.
              </h2>
              <p className="text-xs text-[#9e978c] leading-relaxed">
                Şehrin gürültüsünden uzak, tamamen cildinize ve ruhunuza ayrılmış ferah kabinlerde uzman kadromuz eşliğinde dinlenin.
              </p>
              <div className="pt-2">
                <a 
                  href="#booking"
                  className="px-6 py-3 border border-[#3b384a] text-[#d4af37] text-xs uppercase tracking-widest hover:border-[#d4af37] transition-all inline-flex items-center gap-2"
                >
                  Randevu Seçin <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. MINIMALIST APPOINTMENT SELECTOR (DEMO WIDGET) */}
      <section id="booking" className="py-24 border-b border-[#1c1b26]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="p-8 sm:p-12 border border-[#2d2b3b] bg-[#100f16]">
            <div className="text-center space-y-3 mb-10">
              <span className="text-[#d4af37] text-xs font-medium tracking-widest uppercase block">Demo Modülü</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#f5f2eb]">Online Randevu Talebi</h2>
              <p className="text-xs text-[#9e978c]">
                Müşterilerinizin web siteniz üzerinden saniyeler içinde randevu oluşturabileceği arayüz simülasyonu.
              </p>
            </div>

            <form onSubmit={triggerDemoToast} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#d4af37] mb-2 font-medium">Hizmet Seçiniz</label>
                  <select 
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full px-4 py-3 bg-[#181722] border border-[#2e2c3d] text-[#f5f2eb] text-xs focus:outline-none focus:border-[#d4af37]"
                  >
                    {treatments.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#0a0a0d] text-[#f5f2eb]">
                        {t.name} — {t.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#d4af37] mb-2 font-medium">Uygun Zaman</label>
                  <select className="w-full px-4 py-3 bg-[#181722] border border-[#2e2c3d] text-[#f5f2eb] text-xs focus:outline-none focus:border-[#d4af37]">
                    <option className="bg-[#0a0a0d] text-[#f5f2eb]">Yarın — 11:00</option>
                    <option className="bg-[#0a0a0d] text-[#f5f2eb]">Yarın — 14:30</option>
                    <option className="bg-[#0a0a0d] text-[#f5f2eb]">Cuma — 16:00</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-[#d4af37] text-[#0a0a0d] font-bold text-xs tracking-widest uppercase hover:bg-[#e2c152] transition-all cursor-pointer"
              >
                Demo Randevuyu Onayla
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#0e0e13] border-b border-[#1c1b26]">
        <div className="container mx-auto px-6 max-w-3xl space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[#d4af37] text-xs font-medium tracking-widest uppercase block">Bilgi Bankası</span>
            <h2 className="font-serif text-3xl font-light text-[#f5f2eb]">Sık Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="border border-[#21202b] bg-[#111017] overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between font-serif text-base text-[#f5f2eb] hover:text-[#d4af37] transition-colors cursor-pointer"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#d4af37] transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-xs text-[#9e978c] leading-relaxed border-t border-[#21202b] pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. LEAD CONVERSION FOOTER */}
      <footer className="py-16 bg-[#060608] text-center space-y-6 text-[#f5f2eb]">
        <div className="container mx-auto px-6 max-w-3xl space-y-6">
          <h2 className="font-serif text-3xl font-light text-[#f5f2eb]">
            Güzellik Salonunuz İçin Özel Bir Web Sitesi İster Misiniz?
          </h2>
          <p className="text-xs text-[#8c877d] max-w-xl mx-auto leading-relaxed">
            Bu sayfa <strong>KvK Dijital Çözümler</strong> ajansı tarafından güzellik salonu ve estetik işletmelerine özel tasarım konseptini sergilemek amacıyla hazırlanmıştır. Gerçek müşteri verisi veya tıbbi iddia içermez.
          </p>
          <div>
            <Link 
              href="/#contact"
              className="px-8 py-3.5 bg-[#d4af37] text-[#0a0a0d] font-bold text-xs tracking-widest uppercase hover:bg-[#e2c152] transition-all inline-flex items-center gap-2"
            >
              KvK Dijital'den Teklif Alın <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="pt-8 border-t border-[#1c1b26] flex items-center justify-center gap-6 text-xs text-[#736f66]">
            <Link href="/" className="hover:text-white transition-colors">KvK Ana Sayfa</Link>
            <Link href="/projeler" className="hover:text-white transition-colors">Tüm Örnek Projeler</Link>
            <Link href="/#contact" className="hover:text-white transition-colors">İletişim & Teklif</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
