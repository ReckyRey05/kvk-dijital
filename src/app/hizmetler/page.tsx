import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, Laptop, Code2, Sparkles, ShoppingCart, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const detailedServices = [
  {
    id: "web-tasarim",
    title: "Kurumsal Web Tasarım",
    description: "Markanızın dijital dünyadaki yüzünü, modern tasarım trendleri ve en güncel teknolojilerle inşa ediyoruz. Yalnızca estetik değil, aynı zamanda kullanıcı dostu (UX) ve dönüşüm odaklı web siteleri geliştiriyoruz.",
    icon: Laptop,
    features: [
      "Mobil Uyumlu (Responsive) Tasarım",
      "SEO Dostu Kod Mimarisi",
      "Yüksek Hız ve Performans Optimizasyonu",
      "Kolay Yönetilebilir İçerik Paneli (CMS)"
    ]
  },
  {
    id: "e-ticaret",
    title: "E-Ticaret Sistemleri",
    description: "Ürünlerinizi tüm dünyaya 7/24 satabileceğiniz, güvenli ve ölçeklenebilir online mağazalar kuruyoruz. Müşterilerinizin alışveriş deneyimini kusursuzlaştırarak satışlarınızı artırmanızı sağlıyoruz.",
    icon: ShoppingCart,
    features: [
      "Sanal POS ve Güvenli Ödeme Entegrasyonu",
      "Gelişmiş Ürün ve Stok Yönetimi",
      "Kargo Takip ve Sipariş Otomasyonu",
      "İndirim, Kupon ve Promosyon Modülleri"
    ]
  },
  {
    id: "ozel-yazilim",
    title: "Özel Yazılım Çözümleri",
    description: "Hazır paketlerin yetersiz kaldığı durumlarda, tamamen işletmenizin iş akışlarına ve ihtiyaçlarına özel web tabanlı yazılımlar (CRM, ERP, B2B portalları) geliştiriyoruz.",
    icon: Code2,
    features: [
      "Tamamen İhtiyaca Özel (Terzi İşi) Geliştirme",
      "Üçüncü Parti API Entegrasyonları",
      "Yüksek Güvenlik Standartları",
      "Ölçeklenebilir Cloud (Bulut) Mimarisi"
    ]
  },
  {
    id: "ai-cozumleri",
    title: "Yapay Zeka (AI) Entegrasyonları",
    description: "İşletmenizi geleceğe taşıyacak yapay zeka araçlarını sistemlerinize entegre ediyoruz. Otomatik müşteri destek botlarından, akıllı içerik üretim sistemlerine kadar iş yükünüzü hafifletiyoruz.",
    icon: Sparkles,
    features: [
      "Akıllı Chatbot (Müşteri Destek) Sistemleri",
      "Veri Analizi ve Otomasyon",
      "Kişiselleştirilmiş Kullanıcı Deneyimi",
      "OpenAI / Claude API Entegrasyonları"
    ]
  }
];

export default function Hizmetler() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16">
      <Header />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Ana Sayfaya Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Dijital <span className="text-accent">Çözümlerimiz</span>
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed">
            İşletmenizi dijital dünyada bir adım öne taşımak için ihtiyacınız olan tüm modern web teknolojilerini tek bir çatı altında sunuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          {detailedServices.map((service) => (
            <div key={service.id} className="glass-panel p-8 md:p-10 flex flex-col h-full group hover:border-accent/30 transition-colors duration-500">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform duration-500">
                <service.icon className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">{service.title}</h2>
              <p className="text-foreground/70 leading-relaxed mb-8 flex-grow">
                {service.description}
              </p>
              
              <ul className="space-y-4">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="glass-panel p-12 text-center bg-accent/5 border-accent/20">
          <h3 className="text-3xl font-semibold mb-6">Projeniz için doğru çözümü mü arıyorsunuz?</h3>
          <p className="text-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
            Hangi hizmetin işletmeniz için en uygun olduğuna karar veremediyseniz, ücretsiz bir dijital danışmanlık görüşmesi ayarlayabiliriz.
          </p>
          <Link 
            href="/#contact" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-background font-bold hover:bg-accent/90 transition-colors"
          >
            Teklif ve Bilgi Alın
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
