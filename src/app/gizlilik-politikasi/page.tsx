import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "KvK Digital Gizlilik Politikası ve çerez kullanımı hakkında bilgilendirme.",
  robots: {
    index: false,
    follow: true,
  }
};

export default function GizlilikPolitikasi() {
  return (
    <main className="container mx-auto px-6 py-32 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Gizlilik ve Çerez Politikası</h1>
      
      <div className="prose prose-invert max-w-none text-foreground/80 space-y-6">
        <p>
          Bu Gizlilik Politikası, <strong>KVK Digital</strong> web sitesini ziyaret eden kullanıcıların 
          kişisel ve kişisel olmayan verilerinin nasıl toplandığı, kullanıldığı, korunduğu ve işlendiği hakkında bilgi vermek amacıyla hazırlanmıştır.
        </p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Toplanan Bilgiler</h3>
        <p>Sitemizi ziyaret ettiğinizde iki tür bilgi toplarız:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Kişisel Veriler:</strong> Bize kendi isteğinizle sağladığınız iletişim bilgileri (ad, soyad, e-posta, telefon).</li>
          <li><strong>Kişisel Olmayan Veriler:</strong> Sitemizi nasıl kullandığınıza dair analitik veriler (tarayıcı türü, ziyaret süresi, görüntülenen sayfalar). Bu veriler Google Analytics aracılığıyla anonim olarak toplanmaktadır.</li>
        </ul>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. Bilgilerin Kullanımı</h3>
        <p>Topladığımız veriler şu amaçlarla kullanılabilir:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Web sitesi performansını artırmak ve ziyaretçi deneyimini kişiselleştirmek,</li>
          <li>İletişim formlarından gelen taleplerinize hızlı ve doğru yanıt verebilmek,</li>
          <li>Hizmet kalitemizi ölçmek için analitik istatistikler oluşturmak.</li>
        </ul>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">3. Çerez (Cookie) Politikası</h3>
        <p>
          Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır. 
          Sitemizde, kullanıcı deneyimini iyileştirmek, site trafiğini analiz etmek ve hizmetlerimizi geliştirmek amacıyla çerezler kullanılmaktadır.
        </p>
        <p>
          Tarayıcı ayarlarınızı değiştirerek çerezleri reddedebilir veya silebilirsiniz. Ancak çerezleri devre dışı bırakmanız halinde sitenin bazı fonksiyonlarının 
          tam anlamıyla çalışmayabileceğini unutmayınız.
        </p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">4. Üçüncü Taraf Bağlantıları</h3>
        <p>
          Web sitemiz, kontrolümüz dışında olan farklı web sitelerine bağlantılar (linkler) içerebilir. Bu sitelerin içeriklerinden 
          veya gizlilik politikalarından KVK Digital sorumlu tutulamaz. Dış bağlantılara tıklarken o sitenin kendi gizlilik politikalarını 
          okumanız tavsiye edilir.
        </p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">5. Veri Güvenliği</h3>
        <p>
          Bize emanet ettiğiniz kişisel verilerin güvenliğini sağlamak için SSL şifreleme ve güvenli sunucu altyapıları (Vercel, Firebase vb.) 
          gibi ticari olarak kabul edilebilir standart güvenlik önlemleri almaktayız.
        </p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">6. İletişim</h3>
        <p>
          Gizlilik ve Çerez Politikası hakkında sorularınız veya endişeleriniz varsa bizimle 
          <strong> iletisim@kvkdijitalcozumler.com</strong> adresinden iletişime geçebilirsiniz.
        </p>
        
        <p className="text-sm text-foreground/50 mt-12 pt-8 border-t border-white/10">
          Son Güncelleme: Ağustos 2026
        </p>
      </div>
    </main>
  );
}
