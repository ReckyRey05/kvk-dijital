import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2, Code2, Cpu, Database, Server } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Özel Yazılım Geliştirme & Web Uygulamaları | KvK Dijital Çözümler",
  description: "İşletmenize özel web yazılımları, yönetim panelleri, otomasyonlar ve sistem entegrasyonları. KvK Dijital Çözümler özel yazılım hizmetleri.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/ozel-yazilim",
  },
  openGraph: {
    title: "Özel Yazılım Geliştirme & Web Uygulamaları | KvK Dijital Çözümler",
    description: "İşletmenize özel web yazılımları, yönetim panelleri, otomasyonlar ve sistem entegrasyonları.",
    url: "https://kvkdijitalcozumler.com/ozel-yazilim",
  }
};

export default function OzelYazilimPage() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <Link href="/hizmetler" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Hizmetlere Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Özel Yazılım <span className="text-accent">Geliştirme</span>
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed mb-6">
            Hazır kalıplara sıkışmadan, işletmenizin iş süreçlerine ve ihtiyaçlarına tam uyum sağlayan güvenli, hızlı ve ölçeklenebilir <strong>özel web yazılımları</strong> ve yönetim sistemleri geliştiriyoruz.
          </p>
        </div>

        {/* Hizmet Özellikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass-panel p-6 border-white/10">
            <Code2 className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Özel Web Uygulamaları</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              İşletmenizin iç ve dış süreçlerini kolaylaştıran özelleştirilmiş web tabanlı yazılımlar.
            </p>
          </div>
          <div className="glass-panel p-6 border-white/10">
            <Server className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Özel Yönetim Panelleri</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Verilerinizi ve müşteri ilişkilerinizi kolayca yönetebileceğiniz pratik dashboard çözümleri.
            </p>
          </div>
          <div className="glass-panel p-6 border-white/10">
            <Database className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">API ve Sistem Entegrasyonu</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Farklı yazılımlar ve platformlar arasında kesintisiz veri akışı sağlayan entegrasyonlar.
            </p>
          </div>
          <div className="glass-panel p-6 border-white/10">
            <Cpu className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">İş Süreç Otomasyonu</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Manuel iş yükünü azaltan ve verimliliği artıran dijital otomasyon çözümleri.
            </p>
          </div>
        </div>

        {/* Neden Özel Yazılım */}
        <div className="glass-panel p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Neden Özel Yazılım Tercih Edilmeli?</h2>
          <p className="text-foreground/70 mb-6 leading-relaxed">
            Hazır şablonlar ve paket yazılımlar her işletmenin özel operasyonel süreçlerine yanıt veremeyebilir. Özel yazılım çözümleri, şirketinizin büyüme hedeflerine ve güvenlik gereksinimlerine göre esnek şekilde şekillenir.
          </p>
          <ul className="space-y-4">
            {[
              "İş süreçlerinize birebir uyumlu kod mimarisi",
              "Gereksiz karmaşıklıktan arındırılmış pratik arayüzler",
              "Büyüyen iş hacmine uygun yüksek ölçeklenebilirlik",
              "Üst düzey veri güvenliği ve yetkilendirme altyapısı"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* İlgili Hizmetler */}
        <div className="glass-panel p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4">İlgili Hizmetlerimiz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/web-tasarim" className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors flex items-center justify-between group">
              <span className="font-medium text-foreground group-hover:text-accent">Web Tasarım Hizmetleri</span>
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
            <Link href="/istanbul-web-tasarim" className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 transition-colors flex items-center justify-between group">
              <span className="font-medium text-foreground group-hover:text-accent">İstanbul Web Tasarım</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="glass-panel p-8 md:p-10 mb-12 border-accent/20">
          <h2 className="text-2xl font-semibold mb-6">Sıkça Sorulan Sorular</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Özel yazılım süresi nasıl belirlenir?</h3>
              <p className="text-foreground/70 leading-relaxed">Projenin fonksiyonel detayları ve ihtiyaç duyulan modüller analiz edildikten sonra net bir proje takvimi oluşturulur.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Mevcut sistemlerimizle entegrasyon yapılabilir mi?</h3>
              <p className="text-foreground/70 leading-relaxed">Evet, kullandığınız ERP, CRM veya diğer harici servislerle güvenli API entegrasyonları sağlıyoruz.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 glass-panel border-accent/30 bg-accent/5">
          <h2 className="text-3xl font-bold mb-4">Projenizi Birlikte Planlayalım</h2>
          <p className="text-foreground/70 max-w-xl mx-auto mb-8">
            Özel yazılım ihtiyaçlarınız ve dijital çözümler için teknik ekibimizle iletişime geçin.
          </p>
          <Link href="/#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-background font-bold hover:bg-accent/90 transition-colors">
            İletişime Geçin <ArrowRight className="w-5 h-5" />
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
            "name": "Özel Yazılım Geliştirme",
            "serviceType": "Özel Yazılım",
            "provider": {
              "@type": "Organization",
              "@id": "https://kvkdijitalcozumler.com/#organization",
              "name": "KvK Dijital Çözümler"
            },
            "description": "İşletmelere özel web yazılımları, yönetim panelleri, otomasyonlar ve sistem entegrasyonları."
          })
        }}
      />
      <Footer />
    </main>
  );
}
