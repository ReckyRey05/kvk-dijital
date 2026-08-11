import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Ticaret Web Sitesi",
  description: "Ürünlerinizi 7/24 satabileceğiniz güvenli, hızlı ve SEO uyumlu e-ticaret web sitesi kurulumu. KVK Dijital Çözümler ile sanal mağazanızı hemen açın.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/e-ticaret-web-sitesi",
  }
};

export default function ETicaretWebSitesi() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16">
      <Header />
      
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <Link href="/hizmetler" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Hizmetlere Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            E-Ticaret <span className="text-accent">Web Sitesi</span>
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed mb-6">
            İşletmenizi dijitale taşıyarak ürünlerinizi tüm dünyaya 7/24 satın. KVK Dijital Çözümler olarak güvenli, hızlı ve kullanıcı dostu e-ticaret siteleri geliştiriyoruz.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-semibold mb-4">E-Ticaret Paketlerimizin Özellikleri</h2>
          <p className="text-foreground/70 mb-6 leading-relaxed">
            Başarılı bir online mağaza, ziyaretçileri müşteriye dönüştüren güçlü bir altyapı gerektirir. Sadece ürün eklemekle kalmayıp, kargo, stok ve ödeme sistemlerini tek bir çatı altında topluyoruz.
          </p>
          <ul className="space-y-4">
            {[
              "Sanal POS ve Güvenli Ödeme Entegrasyonu",
              "Gelişmiş Ürün, Kategori ve Stok Yönetimi",
              "Kargo Takip ve Otomatik Sipariş Mailleri",
              "İndirim, Kupon ve Kampanya Modülleri"
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
              <h3 className="text-lg font-medium text-foreground mb-2">Sanal POS entegrasyonu yapıyor musunuz?</h3>
              <p className="text-foreground/70 leading-relaxed">Evet, İyzico, PayTR gibi popüler ödeme kuruluşlarının veya doğrudan bankaların sanal POS entegrasyonlarını sisteme dahil ediyoruz.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Sınırsız ürün ekleyebilir miyim?</h3>
              <p className="text-foreground/70 leading-relaxed">Altyapımız ürün sayısı kısıtlamasına sahip değildir; sitenizin sunucu kapasitesi elverdiği ölçüde dilediğiniz kadar ürün ve varyasyon (renk, beden vb.) ekleyebilirsiniz.</p>
            </div>
          </div>
        </div>

        <div className="text-center p-8 bg-accent/5 rounded-2xl border border-white/5">
          <h3 className="text-2xl font-semibold mb-4">Satışlara Hemen Başlayın</h3>
          <p className="text-foreground/70 mb-6">E-Ticaret çözümlerimiz hakkında detaylı bilgi ve fiyat almak için bize ulaşın.</p>
          <Link href="/#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-background font-bold hover:bg-accent/90 transition-colors">
            Fiyat Teklifi Alın
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
            "serviceType": "E-Ticaret Yazılımı",
            "provider": {
              "@type": "Organization",
              "name": "KVK Dijital Çözümler"
            },
            "description": "Güvenli ve SEO uyumlu e-ticaret web sitesi kurulum hizmetleri."
          })
        }}
      />
      <Footer />
    </main>
  );
}
