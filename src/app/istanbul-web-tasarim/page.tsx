import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "İstanbul Web Tasarım & Dijital Ajans | KvK Dijital Çözümler",
  description: "İstanbul merkezli web tasarım firması olarak işletmeniz için modern, kurumsal, mobil ve SEO uyumlu web sitesi yaptırma hizmeti sunuyoruz.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/istanbul-web-tasarim",
  },
  openGraph: {
    title: "İstanbul Web Tasarım & Dijital Ajans | KvK Dijital Çözümler",
    description: "İstanbul merkezli işletmelere özel kurumsal web tasarım, e-ticaret ve SEO çözümleri.",
    url: "https://kvkdijitalcozumler.com/istanbul-web-tasarim",
  }
};

export default function IstanbulWebTasarim() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <Link href="/hizmetler" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Hizmetlere Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            İstanbul Web Tasarım <span className="text-accent">Firması</span>
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed mb-6">
            KvK Dijital Çözümler olarak, <strong>İstanbul</strong> merkezli işletmelere profesyonel, mobil uyumlu ve SEO dostu web tasarım hizmetleri sunuyoruz. Anadolu Yakası ve Avrupa Yakası'ndaki markaların dijital dönüşüm süreçlerini uçtan uca yönetiyoruz.
          </p>
        </div>

        {/* Neden KvK Dijital */}
        <div className="glass-panel p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Neden KvK Dijital Çözümler?</h2>
          <p className="text-foreground/70 mb-6 leading-relaxed">
            Sadece estetik bir web sitesi teslim etmekle kalmıyor, aynı zamanda hedef kitlenize ulaşmanızı sağlayacak teknik altyapıyı kuruyoruz. İstanbul başta olmak üzere Kocaeli, Sakarya, Yalova, Bursa ve Tekirdağ gibi çevre il ve sanayi merkezlerine de kurumsal web tasarım desteği veriyoruz.
          </p>
          <ul className="space-y-4">
            {[
              "100% Mobil Uyumlu (Responsive) Tasarım Mimarisi",
              "Google SEO Kriterlerine ve Arama Performansına Uygun Altyapı",
              "Hızlı Yüklenen, Performans ve Güvenlik Odaklı Kod Yapısı",
              "Kolay Yönetilebilir Yönetim Paneli ve Teknik Destek"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hizmet Bölgeleri ve Bağlantılı Çözümler */}
        <div className="glass-panel p-8 md:p-10 mb-12 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-semibold">İstanbul & Çevre İllerde Hizmet Kapsamımız</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed mb-6">
            İstanbul Anadolu ve Avrupa Yakası'ndaki kurumsal şirketlerden Kocaeli, Sakarya, Yalova, Bursa ve Tekirdağ gibi sanayi ve ticaret odaklı şehirlere kadar dijital çözümler üretiyoruz.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/web-tasarim" className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors flex items-center justify-between group">
              <span className="font-medium text-foreground group-hover:text-accent">Web Tasarım Çözümleri</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
            <Link href="/kurumsal-web-tasarim" className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors flex items-center justify-between group">
              <span className="font-medium text-foreground group-hover:text-accent">Kurumsal Web Tasarım</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
            <Link href="/e-ticaret-web-sitesi" className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors flex items-center justify-between group">
              <span className="font-medium text-foreground group-hover:text-accent">E-Ticaret Web Sitesi</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
            <Link href="/ozel-yazilim" className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors flex items-center justify-between group">
              <span className="font-medium text-foreground group-hover:text-accent">Özel Yazılım Geliştirme</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
          </div>
        </div>

        {/* Sıkça Sorulan Sorular */}
        <div className="glass-panel p-8 md:p-10 mb-12 border-accent/20">
          <h2 className="text-2xl font-semibold mb-6">Sıkça Sorulan Sorular</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">İstanbul'daki işletmelere özel hizmet veriyor musunuz?</h3>
              <p className="text-foreground/70 leading-relaxed">Evet, merkezimiz İstanbul'da bulunmaktadır ve Anadolu ile Avrupa Yakası'ndaki firmalara profesyonel web tasarım ve danışmanlık hizmeti sunmaktayız.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">İstanbul dışındaki şehirlere hizmet veriyor musunuz?</h3>
              <p className="text-foreground/70 leading-relaxed">Evet, Kocaeli, Sakarya, Yalova, Bursa ve Tekirdağ başta olmak üzere Türkiye geneline online toplantılar ve şeffaf proje yönetimi ile hizmet veriyoruz.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Web sitesi yaptırmak ne kadar sürer?</h3>
              <p className="text-foreground/70 leading-relaxed">Ortalama bir kurumsal web sitesi projesi, gereksinimlerinize bağlı olarak 1 ila 3 hafta içerisinde teslim edilir.</p>
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
            "name": "İstanbul Web Tasarım Hizmeti",
            "serviceType": "Web Tasarım",
            "provider": {
              "@type": "Organization",
              "@id": "https://kvkdijitalcozumler.com/#organization",
              "name": "KvK Dijital Çözümler"
            },
            "areaServed": ["İstanbul", "Anadolu Yakası", "Avrupa Yakası", "Kocaeli", "Sakarya", "Bursa", "Yalova", "Tekirdağ"],
            "description": "İstanbul merkezli işletmelere profesyonel web tasarım, kurumsal web sitesi ve e-ticaret çözümleri."
          })
        }}
      />
      <Footer />
    </main>
  );
}
