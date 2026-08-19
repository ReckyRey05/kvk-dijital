import Footer from "@/components/Footer";
import { ArrowRight, Sparkles, CheckCircle2, Laptop, Building2, ShoppingCart, Code2, UtensilsCrossed, QrCode } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase/admin";

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: "Hizmetlerimiz | KvK Dijital Çözümler",
  description: "Web Tasarımı, Kurumsal Web Sitesi, E-Ticaret, Restoran QR Menü & POS Sistemleri ve Özel Yazılım Geliştirme hizmetlerimiz.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/hizmetler",
  }
};

const defaultServices = [
  {
    id: "service-restoran-pos-qr",
    title: "Cep Garson: Restoran QR & POS",
    description: "Restoran, kafe ve fast-food işletmeleri için masadan doğrudan sipariş, 15 dakikalık oturum güvenliği, canlı Kasa/Garson POS, KDS mutfak ekranı ve Z raporu analitiği.",
    features: [
      "15 Dakikalık Akıllı Oturum Güvenliği (Sahte Sipariş Koruması)",
      "Canlı Kasa & Garson POS Terminali + Sesli Mutfak Ekranı (KDS)",
      "Kişi Başı Hesap Bölüştürme & Çoklu Dil (TR/EN)",
      "Gün Sonu Mali Z Raporu, Ciro Analitiği & Termal Yazıcı (ESC/POS)"
    ],
    link: "/blog/cep-garson-akilli-restoran-qr-menu-pos-sistemi",
    icon: UtensilsCrossed,
    isFeatured: true,
  },
  {
    id: "service-web-tasarim",
    title: "Web Tasarım",
    description: "Modern, mobil 90+ açılış hızlı ve Google SEO uyumlu web tasarım çözümleri. İşletmenizin dijital prestijini geleceğe taşıyın.",
    features: [
      "Mobil %100 Responsive Esnek Tasarım",
      "90+ Google PageSpeed Açılış Hızı Garantisi",
      "SEO & LocalBusiness Şema Altyapısı",
      "Korsan Eklentisiz Temiz Kod Mimarisi"
    ],
    link: "/web-tasarim",
    icon: Laptop
  },
  {
    id: "service-kurumsal",
    title: "Kurumsal Web Sitesi",
    description: "İşletmeler ve kurumsal markalar için güven veren, müşteri dönüşümü odaklı profesyonel web siteleri.",
    features: [
      "Kurumsal Kimlik Uyumlu UI/UX Arayüz",
      "Fotoğraflı Teklif & WhatsApp Entegrasyonu",
      "Kurumsal Blog & Duyuru Yönetimi",
      "30 Gün Sürekli Teknik Destek"
    ],
    link: "/kurumsal-web-tasarim",
    icon: Building2
  },
  {
    id: "service-e-ticaret",
    title: "E-Ticaret Web Sitesi",
    description: "Sanal POS ve güvenli ödeme altyapılı, hızlı mobil sepet kurgusuna sahip lüks e-ticaret platformları.",
    features: [
      "İyzico, PayTR & Sanal POS Entegrasyonları",
      "Hızlı Mobil Sepet (Cart Drawer) & Varyant Seçimi",
      "Sınırsız Ürün & Kategori Yönetimi",
      "Stok, Kargo & Pazar Yeri Uyumlu Altyapı"
    ],
    link: "/e-ticaret-web-sitesi",
    icon: ShoppingCart
  },
  {
    id: "service-ozel-yazilim",
    title: "Özel Yazılım Geliştirme",
    description: "İşletmenizin operasyonel süreçlerine özel kodlanan web otomasyonları, API entegrasyonları ve yönetim panelleri.",
    features: [
      "İşletmeye Özel Web Otomasyonu & CRM/ERP",
      "Esnek REST API & Veritabanı Mimarisi",
      "Yüksek Veri Güvenliği & Şifrelenmiş Altyapı",
      "Sınırsız Ölçeklenebilirlik & Mülkiyet Bağımsızlığı"
    ],
    link: "/ozel-yazilim",
    icon: Code2
  }
];

export default async function Hizmetler() {
  let firestoreServices: any[] = [];
  try {
    const servicesRef = getAdminDb().collection("services");
    const snapshot = await servicesRef.get().catch(() => null);
    if (snapshot && !snapshot.empty) {
      firestoreServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch {
    firestoreServices = [];
  }

  // Use firestore services if available, otherwise render core default services showcase
  const servicesList = firestoreServices.length > 0 ? firestoreServices : defaultServices;

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16 bg-[#050505] text-foreground font-sans">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-4">
            <ArrowRight className="w-4 h-4 rotate-180" /> Ana Sayfaya Dön
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Dijital <span className="text-accent">Çözümlerimiz</span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed">
            İşletmenizi dijital dünyada bir adım öne taşımak için ihtiyacınız olan tüm modern web teknolojilerini tek bir çatı altında sunuyoruz.
          </p>
        </div>

        {/* Services Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {servicesList.map((service, index) => {
            const IconComponent = service.icon || Sparkles;
            return (
              <div 
                key={service.id || service.link || index} 
                className="glass-panel p-8 md:p-10 flex flex-col h-full group hover:border-accent/40 transition-all duration-300 relative overflow-hidden rounded-3xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-8 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                  <IconComponent className="w-7 h-7" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors">{service.title}</h2>
                <p className="text-foreground/70 leading-relaxed mb-8 flex-grow text-sm sm:text-base">
                  {service.description}
                </p>
                
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-3 mb-8 pt-4 border-t border-white/10">
                    {service.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground/80 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {service.link && (
                  <div className="mt-auto pt-6 border-t border-white/10">
                    <Link 
                      href={service.link} 
                      className="inline-flex items-center gap-2 text-accent font-bold text-sm hover:text-white transition-colors group/link"
                    >
                      Detaylı İncele <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Free SEO Audit Tool Feature Banner */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border-accent/30 bg-accent/5 mb-16 text-center space-y-4">
          <span className="text-accent text-xs font-bold uppercase tracking-widest block">Ücretsiz Hizmetimiz</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Mevcut Web Sitenizin Hız ve SEO Puanını Ölçün</h2>
          <p className="text-foreground/70 text-sm max-w-xl mx-auto leading-relaxed">
            Sitenizin mobil açılış hızını, Google SEO kriterlerini ve teknik hatalarını 10 saniyede ücretsiz analiz edin.
          </p>
          <div>
            <Link 
              href="/ucretsiz-seo-analiz-araci"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider hover:bg-accent hover:text-slate-950 transition-colors"
            >
              Ücretsiz SEO Analizini Başlat <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Conversion CTA Banner */}
        <div className="glass-panel p-8 md:p-12 text-center bg-gradient-to-br from-card via-[#0c1414] to-card border-accent/30 rounded-3xl space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Projenizi Birlikte Konuşalım</h3>
          <p className="text-foreground/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Hangi hizmetin işletmeniz için en uygun olduğuna karar veremediyseniz, ücretsiz dijital analiz ve danışmanlık görüşmesi gerçekleştirebiliriz.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link 
              href="/iletisim" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-slate-950 font-bold text-sm uppercase tracking-wider hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer"
            >
              Teklif ve Bilgi Alın <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="https://wa.me/905348914905?text=Merhaba,%20hizmetleriniz%20hakk%C4%B1nda%20bilgi%20ve%20dan%C4%B1%C5%9Fmanl%C4%B1k%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors text-sm"
            >
              WhatsApp Danışmanlık
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

