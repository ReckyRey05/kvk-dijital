import { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "KvK Digital Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma metni ve gizlilik ilkeleri.",
  robots: {
    index: false,
    follow: true,
  }
};

export default function KVKK() {
  return (
    <main className="container mx-auto px-6 py-32 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni</h1>
      
      <div className="prose prose-invert max-w-none text-foreground/80 space-y-6">
        <p>
          <strong>KvK Digital</strong> olarak, kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. 
          Bu bilinçle, ürün ve hizmetlerimizden faydalanan kişiler dahil, bizimle ilişkili tüm şahıslara ait her türlü kişisel verilerin 
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK")'na uygun olarak işlenerek, muhafaza edilmesine büyük önem atfetmekteyiz.
        </p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Kişisel Verilerin Toplanması ve İşlenmesi</h3>
        <p>
          Kişisel verileriniz, sunduğumuz hizmetlerin belirlenen yasal çerçevede sunulabilmesi ve bu kapsamda sözleşme ve yasadan 
          doğan mesuliyetlerimizin eksiksiz ve doğru bir şekilde yerine getirilebilmesi gayesi ile toplanmaktadır. 
          İletişim formları, e-posta yazışmaları ve proje formları aracılığıyla adınız, soyadınız, telefon numaranız ve e-posta adresiniz 
          gibi iletişim bilgileriniz kaydedilebilir.
        </p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. Kişisel Verilerin Hangi Amaçla İşleneceği</h3>
        <p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenebilecektir:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Sunduğumuz web tasarım ve yazılım hizmetlerinin tarafınıza sağlanması,</li>
          <li>Talep ve şikayetlerinizin takibi ile iletişimin sürdürülmesi,</li>
          <li>Müşteri memnuniyetine yönelik aktivitelerin yürütülmesi,</li>
          <li>Hizmetlerimize ilişkin tekliflerin sunulması ve faturalandırma (gerekli hallerde) süreçlerinin takibi.</li>
        </ul>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">3. İşlenen Kişisel Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği</h3>
        <p>
          Toplanan kişisel verileriniz, hukuki zorunluluklar haricinde, rızanız olmadan üçüncü şahıslarla, ticari firmalarla veya kurumlarla 
          <strong>kesinlikle paylaşılmamaktadır</strong>. Verileriniz yalnızca hizmet kalitesini artırmak için kullandığımız güvenli bulut 
          altyapılarında (örn. Firebase, Vercel) şifrelenmiş olarak barındırılır.
        </p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">4. KVKK'nın 11. Maddesi Gereği Haklarınız</h3>
        <p>Kişisel veri sahipleri olarak, haklarınıza ilişkin taleplerinizi bize iletmeniz durumunda, talebin niteliğine göre en geç otuz gün içinde ücretsiz olarak sonuçlandırılacaktır. Haklarınız şunlardır:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
          <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
          <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
          <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme.</li>
        </ul>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">5. İletişim</h3>
        <p>
          KVKK kapsamındaki haklarınızı kullanmak veya kişisel verilerinizle ilgili bilgi almak için 
          <strong> iletisim@kvkdijitalcozumler.com</strong> adresine e-posta göndererek bizimle iletişime geçebilirsiniz.
        </p>
        
        <p className="text-sm text-foreground/50 mt-12 pt-8 border-t border-white/10">
          Son Güncelleme: Ağustos 2026
        </p>
      </div>
    </main>
  );
}
