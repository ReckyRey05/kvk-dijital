import { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "KvK Dijital Çözümler web sitesi çerez kullanım politikası ve tercihleri.",
  robots: {
    index: false,
    follow: true,
  }
};

export default function CookiePolicy() {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <main className="container mx-auto px-6 py-32 max-w-4xl flex-grow">
        <h1 className="text-4xl font-bold mb-8">Çerez (Cookie) Politikası</h1>
        
        <div className="prose prose-invert max-w-none text-foreground/80 space-y-6">
          <p>
            <strong>KvK Dijital Çözümler</strong> olarak web sitemizi ziyaretleriniz sırasında deneyiminizi geliştirmek, 
            performansı artırmak ve ziyaretçi istatistiklerini (Google Analytics) anonim olarak ölçümlemek amacıyla çerezler (cookies) kullanmaktayız.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Çerez Nedir?</h3>
          <p>
            Çerezler, bir web sitesini ziyaret ettiğinizde cihazınıza (bilgisayar, telefon, tablet vb.) kaydedilen küçük metin dosyalarıdır. 
            Bu dosyalar, sitemizin düzgün çalışması ve size daha iyi bir deneyim sunulması için temel işlevleri yerine getirir.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. Hangi Tür Çerezleri Kullanıyoruz?</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Zorunlu Çerezler:</strong> Web sitemizin güvenli ve temel işlevleriyle çalışabilmesi için kesinlikle gerekli olan çerezlerdir.</li>
            <li><strong>Analitik ve Performans Çerezleri:</strong> Ziyaretçilerin siteyi nasıl kullandığını anlamamızı (hangi sayfalara girildiği, sitede ne kadar süre kalındığı) sağlayan tamamen anonim Google Analytics çerezleridir.</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">3. Çerezleri Nasıl Kontrol Edebilirsiniz?</h3>
          <p>
            Çerezlerin bilgisayarınızda saklanmasını istemiyorsanız, tarayıcınızın ayarlar kısmından çerez kullanımını kısıtlayabilir 
            veya tamamen reddedebilirsiniz. Ancak zorunlu çerezleri engellemeniz durumunda sitenin bazı fonksiyonlarının düzgün çalışmayabileceğini unutmayın.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">4. İletişim</h3>
          <p>
            Çerez politikamız hakkında sorularınız için 
            <strong> iletisim@kvkdijitalcozumler.com</strong> adresinden bize ulaşabilirsiniz.
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
