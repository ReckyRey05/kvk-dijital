"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  Info,
  Check
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
    price: "700 ₺",
    description: "Isı ve dış etkenlerden koruyan, saç tellerini içeriden dışarıya pürüzsüzleştiren özel terapi."
  }
];

const availableDays = [
  { day: 14, name: "Cuma", short: "CUM", available: true },
  { day: 15, name: "Cumartesi", short: "CMT", available: true },
  { day: 16, name: "Pazar", short: "PAZ", available: false },
  { day: 17, name: "Pazartesi", short: "PZT", available: true },
  { day: 18, name: "Salı", short: "SAL", available: true },
  { day: 19, name: "Çarşamba", short: "ÇAR", available: true },
  { day: 20, name: "Perşembe", short: "PER", available: true },
  { day: 21, name: "Cuma", short: "CUM", available: true },
  { day: 22, name: "Cumartesi", short: "CMT", available: true },
  { day: 23, name: "Pazar", short: "PAZ", available: false },
  { day: 24, name: "Pazartesi", short: "PZT", available: true },
  { day: 25, name: "Salı", short: "SAL", available: true },
  { day: 26, name: "Çarşamba", short: "ÇAR", available: true },
  { day: 27, name: "Perşembe", short: "PER", available: true },
  { day: 28, name: "Cuma", short: "CUM", available: true },
  { day: 29, name: "Cumartesi", short: "CMT", available: true },
  { day: 30, name: "Pazar", short: "PAZ", available: false },
  { day: 31, name: "Pazartesi", short: "PZT", available: true }
];

const timeSlots = ["09:30", "10:30", "11:30", "13:00", "14:00", "15:00", "16:00", "17:00", "18:30", "19:30"];

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
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedTime, setSelectedTime] = useState<string>("14:00");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedDayObj = availableDays.find(d => d.day === selectedDay);
  const selectedTreatment = treatments.find(t => t.id === activeTab) || treatments[0];

  const triggerDemoToast = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg(`Demo Randevu Alındı: ${selectedTreatment.name} — ${selectedDay} Ağustos ${selectedDayObj?.name}, Saat ${selectedTime}`);
    setTimeout(() => setToastMsg(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-[#f5f2eb] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-white">
      
      {/* Fixed Floating Bottom Right Demo Badge */}
      <div className="fixed bottom-6 right-6 z-50 hidden sm:flex items-center gap-3 p-3 rounded-full bg-[#121218]/95 border border-[#d4af37]/60 text-white text-xs shadow-2xl backdrop-blur-md">
        <Info className="w-4 h-4 text-[#d4af37] shrink-0" />
        <span className="text-[11px] text-[#e8ded1]">Konsept Demo — <strong>KvK Dijital</strong></span>
        <Link href="/#iletisim" className="px-3 py-1 rounded bg-[#d4af37] text-[#0a0a0d] font-bold text-[10px] uppercase tracking-wider hover:bg-[#e2c152] transition-colors">
          Teklif Al
        </Link>
      </div>

      {/* 2. FLOATING CURVED GLASS PILL HEADER (LUXURY SPA CONCEPT) */}
      <header className="sticky top-4 z-40 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto rounded-full border border-[#3b384a]/80 bg-[#100f16]/90 backdrop-blur-xl px-6 py-3 flex items-center justify-between shadow-2xl">
          
          {/* Left Return Pill Link */}
          <Link href="/" className="px-3.5 py-1.5 rounded-full border border-[#3b384a] text-[11px] font-medium text-[#9e978c] hover:text-[#d4af37] hover:border-[#d4af37] transition-all inline-flex items-center gap-1.5">
            ← KvK Sitesine Dön
          </Link>

          {/* Center Fashion Brand Wordmark & Nav */}
          <div className="flex items-center gap-8">
            <span className="font-serif text-lg font-light tracking-[0.3em] text-[#f5f2eb]">A U R A</span>
            
            <nav aria-label="Aura Beauty Navigasyon" className="hidden lg:flex items-center gap-6 text-[10px] tracking-[0.2em] uppercase text-[#9e978c]">
              <a href="#philosophy" className="hover:text-[#d4af37] transition-colors">Yaklaşımımız</a>
              <span className="text-[#2e2c3d]">•</span>
              <a href="#treatments" className="hover:text-[#d4af37] transition-colors">Bakım Hizmetleri</a>
              <span className="text-[#2e2c3d]">•</span>
              <a href="#showcase" className="hover:text-[#d4af37] transition-colors">Salon Atmosferi</a>
            </nav>
          </div>

          {/* Right Action Button */}
          <a 
            href="#booking"
            className="px-4 py-1.5 rounded-full bg-[#d4af37] text-[#0a0a0d] font-bold text-[11px] tracking-widest uppercase hover:bg-[#e2c152] transition-all inline-flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/20"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Randevu Al</span>
          </a>

        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-5 bg-[#14131d] border border-[#d4af37] text-[#f5f2eb] text-xs leading-relaxed shadow-2xl flex items-start gap-3 rounded-lg">
          <Check className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
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
                  src="/images/demos/aura-beauty/hero.webp" 
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
                  <CalendarIcon className="w-4 h-4" /> Randevu Takvimini Aç
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

      {/* 4. BRAND PHILOSOPHY & CLEAN STANDARDS */}
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

      {/* 5. TREATMENT PORTFOLIO */}
      <section id="treatments" className="py-24 border-b border-[#1c1b26]">
        <div className="container mx-auto px-6 max-w-5xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[#d4af37] text-xs font-medium tracking-widest uppercase block">Bakım Hizmetleri</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#f5f2eb]">Öne Çıkan Terapilerimiz</h2>
          </div>

          <div className="space-y-6">
            {treatments.map(t => (
              <div 
                key={t.id}
                className={`p-8 border bg-[#111017] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer ${
                  activeTab === t.id ? "border-[#d4af37]" : "border-[#21202b] hover:border-[#d4af37]/40"
                }`}
                onClick={() => setActiveTab(t.id)}
              >
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[10px] tracking-widest uppercase text-[#d4af37] font-semibold block">{t.category}</span>
                  <h3 className="font-serif text-xl text-[#f5f2eb]">{t.name}</h3>
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
                src="/images/demos/aura-beauty/spa-oil.webp" 
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

      {/* 7. HIGH-END INTERACTIVE CALENDAR & APPOINTMENT SELECTOR */}
      <section id="booking" className="py-24 border-b border-[#1c1b26]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="p-8 sm:p-12 border border-[#2d2b3b] bg-[#100f16] shadow-2xl">
            
            <div className="text-center space-y-3 mb-10">
              <span className="text-[#d4af37] text-xs font-medium tracking-widest uppercase block">İnteraktif Randevu Modülü</span>
              <h2 className="font-serif text-3xl font-light text-[#f5f2eb]">Online Bakım Randevusu</h2>
              <p className="text-xs text-[#9e978c]">
                Aşağıdaki takvimden tarih ve saat seçerek demo randevunuzu simüle edin.
              </p>
            </div>

            <form onSubmit={triggerDemoToast} className="space-y-8">
              
              {/* Service Selection */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#d4af37] mb-3 font-semibold">
                  1. Bakım Hizmeti Seçiniz
                </label>
                <select 
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#181722] border border-[#2e2c3d] text-[#f5f2eb] text-xs focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  {treatments.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#0a0a0d] text-[#f5f2eb]">
                      {t.name} — {t.price} ({t.duration})
                    </option>
                  ))}
                </select>
              </div>

              {/* Interactive Calendar Selection (Ağustos 2026 - Kaydırılabilir) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                    2. Tarih Seçiniz (Ağustos 2026) <span className="text-[10px] text-[#807b71] font-normal lowercase">(sağa kaydırın →)</span>
                  </label>
                  <span className="text-[11px] text-[#807b71]">Pazar Günleri Kapalıdır</span>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x touch-pan-x [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-[#d4af37]/50 [&::-webkit-scrollbar-track]:bg-[#181722]">
                  {availableDays.map(item => (
                    <button
                      key={item.day}
                      type="button"
                      disabled={!item.available}
                      onClick={() => setSelectedDay(item.day)}
                      className={`min-w-[72px] shrink-0 snap-start p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        !item.available 
                          ? "opacity-30 border-[#1f1e28] bg-[#0c0b10] cursor-not-allowed text-[#635f56]" 
                          : selectedDay === item.day
                            ? "bg-[#d4af37] text-[#0a0a0d] border-[#d4af37] font-bold shadow-lg shadow-[#d4af37]/20 scale-105"
                            : "bg-[#181722] border-[#2e2c3d] text-[#f5f2eb] hover:border-[#d4af37] cursor-pointer"
                      }`}
                    >
                      <span className="text-[10px] tracking-wider uppercase opacity-80">{item.short}</span>
                      <span className="font-serif text-lg">{item.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Time Slot Selection (Kaydırılabilir) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                    3. Saat Seçiniz <span className="text-[10px] text-[#807b71] font-normal lowercase">(sağa kaydırın →)</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x touch-pan-x [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-[#d4af37]/50 [&::-webkit-scrollbar-track]:bg-[#181722]">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`min-w-[90px] shrink-0 snap-start py-3.5 px-4 rounded-lg border text-xs font-mono text-center transition-all cursor-pointer ${
                        selectedTime === time
                          ? "bg-[#d4af37] text-[#0a0a0d] border-[#d4af37] font-bold shadow-md shadow-[#d4af37]/20"
                          : "bg-[#181722] border-[#2e2c3d] text-[#a69f92] hover:border-[#d4af37]/50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Summary Bar */}
              <div className="p-4 bg-[#181724] border border-[#2e2c3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[#807b71] block">Seçilen Randevu Özeti:</span>
                  <span className="font-serif text-sm text-[#f5f2eb] font-medium">
                    {selectedTreatment.name} — <strong className="text-[#d4af37]">{selectedDay} Ağustos {selectedDayObj?.name}, {selectedTime}</strong>
                  </span>
                </div>
                <span className="font-serif text-lg font-bold text-[#d4af37]">{selectedTreatment.price}</span>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full py-4 bg-[#d4af37] text-[#0a0a0d] font-bold text-xs tracking-widest uppercase hover:bg-[#e2c152] transition-all cursor-pointer shadow-xl shadow-[#d4af37]/10"
              >
                Randevu Talebini Onayla (Demo)
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

      {/* 9. LEAD CONVERSION BANNER & FOOTER */}
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
