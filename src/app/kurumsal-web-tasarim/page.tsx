import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kurumsal Web Tasarım",
  description: "Şirketiniz için güven veren, profesyonel ve SEO uyumlu kurumsal web tasarım hizmeti. KVK Dijital Çözümler ile markanızı geleceğe taşıyın.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/kurumsal-web-tasarim",
  }
};

export default function KurumsalWebTasarim() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16">
      <Header />
      
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <Link href="/hizmetler" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Hizmetlere Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Kurumsal <span className="text-accent">Web Tasarım</span>
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed mb-6">
            Şirketinizin dijital dünyadaki yüzü olan kurumsal web sitenizi, markanızın ciddiyetine ve prestijine yakışır şekilde tasarlıyoruz. KVK Dijital Çözümler olarak B2B ve B2C firmalarına özel web altyapıları kuruyoruz.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Neden Kurumsal Bir Web Sitesine İhtiyacınız Var?</h2>
          <p className="text-foreground/70 mb-6 leading-relaxed">
            Kurumsal web tasarım, yalnızca görsel bir vitrin değil, aynı zamanda müşterilerinize güven veren, ürün ve hizmetlerinizi doğru anlatan stratejik bir araçtır. İşletmenizin dijital güvenilirliğini artırmak için modern standartlara uygun bir mimari şarttır.
          </p>
          <ul className="space-y-4">
            {[
              "Marka Kimliğine Uygun Özgün Tasarım",
              "Kurumsal İletişim (E-posta, Form) Altyapısı",
              "Çoklu Dil Desteği ve Kolay Yönetim Paneli",
              "Üst Düzey Güvenlik ve Hızlı Sayfa Yükleme"
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
              <h3 className="text-lg font-medium text-foreground mb-2">Web sitesi sonrası destek sağlıyor musunuz?</h3>
              <p className="text-foreground/70 leading-relaxed">Evet, teslimat sonrasında bakım, güncelleme ve teknik destek hizmetlerimizle markanızın her zaman yanındayız.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Kurumsal site mobil cihazlarda nasıl görünür?</h3>
              <p className="text-foreground/70 leading-relaxed">Geliştirdiğimiz tüm siteler %100 responsive (mobil uyumlu) altyapıya sahiptir; telefon ve tabletlerde kusursuz çalışır.</p>
            </div>
          </div>
        </div>

        <div className="text-center p-8 bg-accent/5 rounded-2xl border border-white/5">
          <h3 className="text-2xl font-semibold mb-4">Şirketinizi Dijitale Taşıyın</h3>
          <p className="text-foreground/70 mb-6">Profesyonel kurumsal web tasarım çözümleri için KVK Dijital Çözümler ile iletişime geçin.</p>
          <Link href="/#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-background font-bold hover:bg-accent/90 transition-colors">
            Teklif Alın
          </Link>
        </div>

      </div>
      
      {/* Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Kurumsal Web Tasarım",
            "provider": {
              "@type": "Organization",
              "name": "KVK Dijital Çözümler"
            },
            "description": "Şirketler için profesyonel ve güvenli kurumsal web tasarım çözümleri."
          })
        }}
      />
      <Footer />
    </main>
  );
}
