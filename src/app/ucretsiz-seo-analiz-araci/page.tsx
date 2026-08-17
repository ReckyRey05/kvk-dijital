import Footer from "@/components/Footer";
import SeoAuditTool from "@/components/tools/SeoAuditTool";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Ücretsiz Web Sitesi SEO & Hız Analizi Aracı",
  description: "Web sitenizin Google PageSpeed puanını, mobil açılış hızını, SSL güvenliğini ve SEO altyapısını 10 saniyede ücretsiz analiz edin. KvK Dijital Çözümler.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/ucretsiz-seo-analiz-araci",
  },
  openGraph: {
    title: "Ücretsiz Web Sitesi SEO & Hız Analizi Aracı | KvK Dijital Çözümler",
    description: "Web sitenizin Google PageSpeed puanını ve SEO altyapısını anında ücretsiz analiz edin.",
    url: "https://kvkdijitalcozumler.com/ucretsiz-seo-analiz-araci",
  }
};

export default function UcretsizSeoAnalizPage() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16 bg-[#050505] text-foreground font-sans">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-8">
          <Link href="/hizmetler" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-6">
            <ArrowRight className="w-4 h-4 rotate-180" /> Hizmetlere Dön
          </Link>
        </div>

        {/* Audit Tool Component */}
        <SeoAuditTool />

        {/* Extra Information Section for SEO Value */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 border-white/10 rounded-2xl space-y-3">
            <CheckCircle2 className="w-6 h-6 text-accent" />
            <h3 className="text-lg font-bold text-white">Canlı Canlı Tarama</h3>
            <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
              Tahmini anket puanı değil; doğrudan web sitenize yapılan teknik HTTP ve HTML analizi ile gerçek skor elde edilir.
            </p>
          </div>
          <div className="glass-panel p-6 border-white/10 rounded-2xl space-y-3">
            <CheckCircle2 className="w-6 h-6 text-accent" />
            <h3 className="text-lg font-bold text-white">Mobil Hız Ölçümü</h3>
            <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
              Google'ın sıralama kriteri olan LCP, FCP ve CLS hız metrikleri doğrudan raporlanır.
            </p>
          </div>
          <div className="glass-panel p-6 border-white/10 rounded-2xl space-y-3">
            <CheckCircle2 className="w-6 h-6 text-accent" />
            <h3 className="text-lg font-bold text-white">%100 Ücretsiz & Sınırsız</h3>
            <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
              Üyelik veya kredi kartı gerektirmeden istediğiniz zaman dilediğiniz sitenin analizini gerçekleştirebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Ücretsiz Web Sitesi SEO & Hız Analizi Aracı",
            "url": "https://kvkdijitalcozumler.com/ucretsiz-seo-analiz-araci",
            "applicationCategory": "SEO & Performance Tool",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TRY"
            },
            "provider": {
              "@type": "Organization",
              "name": "KvK Dijital Çözümler"
            }
          })
        }}
      />
      <Footer />
    </main>
  );
}
