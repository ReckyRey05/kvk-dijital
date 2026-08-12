import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2, Layout, Zap, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Tasarım & Web Sitesi Yaptırma | KvK Dijital Çözümler",
  description: "Profesyonel, mobil uyumlu ve SEO odaklı web tasarım ve web sitesi yaptırma hizmetleri. İşletmenizi büyüten modern web çözümleri.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/web-tasarim",
  },
  openGraph: {
    title: "Web Tasarım & Web Sitesi Yaptırma | KvK Dijital Çözümler",
    description: "Profesyonel, mobil uyumlu ve SEO odaklı web tasarım ve web sitesi yaptırma hizmetleri.",
    url: "https://kvkdijitalcozumler.com/web-tasarim",
  }
};

export default function WebTasarimPage() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16">
      <Header />
      
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <Link href="/hizmetler" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Hizmetlere Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Profesyonel <span className="text-accent">Web Tasarım</span> Hizmeti
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed mb-6">
            KvK Dijital Çözümler olarak, markanızın hedef kitlesine ulaşmasını sağlayan modern, yüksek performanslı, mobil uyumlu ve SEO altyapılı <strong>web sitesi yaptırma</strong> hizmetleri sunuyoruz.
          </p>
        </div>

        {/* Avantajlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass-panel p-6 border-white/10">
            <Smartphone className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">%100 Mobil Uyumlu</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Tüm ekran boyutlarında kusursuz görüntülenen responsive tasarım mimarisi.
            </p>
          </div>
          <div className="glass-panel p-6 border-white/10">
            <Zap className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Yüksek Hız ve Performans</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Hızlı açılan sayfalar ve optimized kod yapısı ile ziyaretçi kaybını önleyin.
            </p>
          </div>
          <div className="glass-panel p-6 border-white/10">
            <ShieldCheck className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">SEO Uyumlu Altyapı</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Google kriterlerine uygun Semantic HTML ve Schema altyapısı ile üst sıralara çıkın.
            </p>
          </div>
          <div className="glass-panel p-6 border-white/10">
            <Layout className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kolay Yönetim</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              İçeriklerinizi kolayca güncelleyebileceğiniz pratik yönetim paneli çözümleri.
            </p>
          </div>
        </div>

        {/* Neden Profesyonel Web Tasarımı */}
        <div className="glass-panel p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Neden Profesyonel Web Tasarımı?</h2>
          <p className="text-foreground/70 mb-6 leading-relaxed">
            Web siteniz, işletmenizin 7/24 çalışan en önemli satış temsilcisidir. Kaliteli bir web tasarımı sadece estetik görünüm sunmakla kalmaz; ziyaretçileri müşteriye dönüştüren güvenilirlik ve kullanıcı deneyimi (UX) sağlar.
          </p>
          <ul className="space-y-4">
            {[
              "Kurumsal kimliği ve marka değerini yansıtan özgün tasarım",
              "Arama motorlarında sıralama kazandıran teknik SEO altyapısı",
              "Hızlı yükleme süreleri ve mobil optimize deneyim",
              "Güvenli, sürdürülebilir ve esnek altyapı desteği"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* İlgili Hizmetler Linkleri */}
        <div className="glass-panel p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4">İlgili Hizmetlerimiz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/istanbul-web-tasarim" className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors flex items-center justify-between group">
              <span className="font-medium text-foreground group-hover:text-accent">İstanbul Web Tasarım</span>
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
              <span className="font-medium text-foreground group-hover:text-accent">Özel Yazılım Çözümleri</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="glass-panel p-8 md:p-10 mb-12 border-accent/20">
          <h2 className="text-2xl font-semibold mb-6">Sıkça Sorulan Sorular</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Web sitesi ne kadar sürede hazırlanır?</h3>
              <p className="text-foreground/70 leading-relaxed">Standart kurumsal web siteleri genellikle 1 ila 3 hafta içerisinde teslim edilir.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Web sitesi SEO uyumlu mu kodlanıyor?</h3>
              <p className="text-foreground/70 leading-relaxed">Evet, tüm web projelerimiz Google SEO kriterlerine, hızlı yükleme ve mobil standartlara uygun olarak hazırlanır.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Sonrasında destek veriyor musunuz?</h3>
              <p className="text-foreground/70 leading-relaxed">Proje teslimi sonrasında teknik destek ve altyapı güncellemeleri konusunda yanınızdayız.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 glass-panel border-accent/30 bg-accent/5">
          <h2 className="text-3xl font-bold mb-4">Web Sitenizi Birlikte Hayata Geçirelim</h2>
          <p className="text-foreground/70 max-w-xl mx-auto mb-8">
            İşletmeniz için en uygun web tasarım çözümlerini konuşmak ve teklif almak için bizimle iletişime geçin.
          </p>
          <Link href="/#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-background font-bold hover:bg-accent/90 transition-colors">
            Teklif Alın <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Web Tasarım Hizmeti",
            "serviceType": "Web Tasarım",
            "provider": {
              "@type": "Organization",
              "@id": "https://kvkdijitalcozumler.com/#organization",
              "name": "KVK Dijital Çözümler"
            },
            "description": "Profesyonel, mobil uyumlu ve SEO altyapılı web tasarım ve web sitesi yaptırma hizmetleri."
          })
        }}
      />
      <Footer />
    </main>
  );
}
