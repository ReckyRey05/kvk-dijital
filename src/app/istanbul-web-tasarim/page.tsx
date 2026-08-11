import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "İstanbul Web Tasarım & Dijital Ajans",
  description: "İstanbul web tasarım firması olarak işletmeniz için modern, kurumsal, mobil ve SEO uyumlu web sitesi yaptırma hizmeti sunuyoruz. KvK Dijital Çözümler.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/istanbul-web-tasarim",
  }
};

export default function IstanbulWebTasarim() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16">
      <Header />
      
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <Link href="/hizmetler" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Hizmetlere Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            İstanbul Web Tasarım <span className="text-accent">Firması</span>
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed mb-6">
            KvK Dijital Çözümler olarak, <strong>İstanbul</strong> merkezli işletmelere profesyonel, mobil uyumlu ve SEO dostu web tasarım hizmetleri sunuyoruz. Avrupa ve Anadolu yakasındaki markaların dijital dönüşüm süreçlerini uçtan uca yönetiyoruz.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Neden KvK Dijital Çözümler?</h2>
          <p className="text-foreground/70 mb-6 leading-relaxed">
            Sadece estetik bir web sitesi teslim etmekle kalmıyor, aynı zamanda hedef kitlenize ulaşmanızı sağlayacak altyapıyı kuruyoruz. Kocaeli, Sakarya, Yalova, Bursa ve Tekirdağ gibi İstanbul çevresindeki sanayi ve ticaret merkezlerine de kurumsal web tasarım desteği veriyoruz.
          </p>
          <ul className="space-y-4">
            {[
              "100% Mobil Uyumlu (Responsive) Tasarım",
              "Google SEO Kriterlerine Uygun Altyapı",
              "Hızlı Yüklenen, Performans Odaklı Kod Mimarisi",
              "Kolay Yönetilebilir Yönetim Paneli"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-8 md:p-10 mb-12 border-accent/20">
          <h2 className="text-2xl font-semibold mb-6">Sıkça Sorulan Sorular</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Web sitesi yaptırmak ne kadar sürer?</h3>
              <p className="text-foreground/70 leading-relaxed">Ortalama bir kurumsal web sitesi projesi, gereksinimlerinize bağlı olarak 2 ila 4 hafta içerisinde teslim edilir.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">İstanbul'daki işletmelere özel hizmet veriyor musunuz?</h3>
              <p className="text-foreground/70 leading-relaxed">Evet, merkez ofisimiz İstanbul'da bulunmaktadır ve bölgedeki firmalara yüz yüze danışmanlık ve profesyonel web tasarım hizmeti sağlamaktayız.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Web tasarım fiyatı nasıl belirlenir?</h3>
              <p className="text-foreground/70 leading-relaxed">Fiyatlandırma; sitenin sayfa sayısına, entegre edilecek özelliklere (örneğin e-ticaret altyapısı) ve özel yazılım ihtiyaçlarına göre şeffaf bir şekilde belirlenir.</p>
            </div>
          </div>
        </div>

        <div className="text-center p-8 bg-accent/5 rounded-2xl border border-white/5">
          <h3 className="text-2xl font-semibold mb-4">Projenize Hemen Başlayın</h3>
          <p className="text-foreground/70 mb-6">İstanbul web tasarım ajansı KvK Dijital Çözümler ile markanızı büyütün.</p>
          <Link href="/#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-background font-bold hover:bg-accent/90 transition-colors">
            İletişime Geçin
          </Link>
        </div>

      </div>
      
      {/* LocalBusiness / Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Web Tasarım",
            "provider": {
              "@type": "LocalBusiness",
              "name": "KvK Dijital Çözümler",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "İstanbul",
                "addressCountry": "TR"
              }
            },
            "areaServed": ["İstanbul", "Kocaeli", "Sakarya", "Bursa", "Yalova", "Tekirdağ"],
            "description": "İstanbul merkezli profesyonel web tasarım firması."
          })
        }}
      />
      <Footer />
    </main>
  );
}
