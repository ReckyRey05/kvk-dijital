import { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "KvK Dijital Çözümler web sitesi kullanım koşulları ve şartları.",
  robots: {
    index: false,
    follow: true,
  }
};

export default function TermsOfService() {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <main className="container mx-auto px-6 py-32 max-w-4xl flex-grow">
        <h1 className="text-4xl font-bold mb-8">Kullanım Koşulları</h1>
        
        <div className="prose prose-invert max-w-none text-foreground/80 space-y-6">
          <p>
            Bu web sitesine girerek veya sitemizdeki hizmetlerden yararlanarak aşağıdaki Kullanım Koşulları'nı 
            kabul etmiş sayılırsınız. <strong>KvK Dijital Çözümler</strong>, bu koşullarda önceden haber vermeksizin değişiklik yapma hakkını saklı tutar.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Hizmetlerin İçeriği ve Telif Hakları</h3>
          <p>
            Sitemizde yer alan tasarım, grafik, logo, metin, yazılım altyapısı ve tüm diğer görsel/yazılı materyallerin hakları 
            KvK Dijital Çözümler'e aittir. Bu materyaller, önceden yazılı izin alınmaksızın kopyalanamaz, çoğaltılamaz ve başka projelerde 
            ticari amaçla kullanılamaz.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. Ziyaretçi ve Kullanıcı Sorumlulukları</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Siteyi ziyaret eden kullanıcılar, site üzerinde yasalara aykırı, yanıltıcı veya tehditkar içerik gönderemez.</li>
            <li>Kullanıcılar, iletişim formlarında kendilerine ait doğru iletişim bilgilerini paylaşmaktan sorumludur.</li>
            <li>Sitenin veya sunucuların güvenliğini tehdit edecek (hack, virüs, siber saldırı) eylemler kesinlikle yasaktır ve yasal işlem başlatma sebebidir.</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">3. Hizmet Kapsamı ve Garanti Sınırları</h3>
          <p>
            Sitemiz üzerinden tanıtılan dijital ajans hizmetlerinin detayları, fiyatlandırmaları ve teslimat süreleri taraflar arasında 
            yapılacak özel proje sözleşmeleri ile belirlenir. Web sitesinde yer alan referans veya vizyon niteliğindeki tasarımlar örnek amaçlıdır.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">4. Dış Bağlantılar</h3>
          <p>
            Sitemiz, müşterilerimize ait referans projelere dış bağlantılar (linkler) içerebilir. KvK Dijital Çözümler, 
            bu dış bağlantıların içeriğinden veya söz konusu sitelerin güncel güvenlik durumundan sorumlu tutulamaz.
          </p>
          
          <p className="text-sm text-foreground/50 mt-12 pt-8 border-t border-white/10">
            Son Güncelleme: Ağustos 2026
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
