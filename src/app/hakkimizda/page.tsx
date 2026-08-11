import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "KvK Digital'in hikayesi, vizyonu ve kurucusu Ali Haydar Kavak hakkında bilgi edinin. Sizi geleceğe taşıyan dijital partneriniz.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/hakkimizda",
  }
};

export default function Hakkimda() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-16">
      <Header />
      
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Ana Sayfaya Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hikayem ve <span className="text-accent">Vizyonum</span>
          </h1>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-foreground/80 leading-relaxed font-medium mb-12">
            Merhaba, ben Ali Haydar Kavak. KvK Digital'in kurucusu, detaylara âşık bir web tasarımcısı ve teknoloji tutkunuyum.
          </p>

          <div className="space-y-12">
            <section className="glass-panel p-8 md:p-12">
              <h2 className="text-2xl font-semibold mb-6 text-accent">Nasıl Başladı?</h2>
              <p className="text-foreground/70 leading-relaxed">
                Çocukluk yıllarımda bilgisayar sistemlerine duyduğum merak, detaycı kişiliğimle birleşerek beni yavaş yavaş web teknolojilerinin dünyasına çekti. Sadece bir şeyler inşa etmek değil, onların nasıl kusursuz çalıştığını anlamak istiyordum. Kendi araştırmalarımla attığım bu ilk adımları, <strong>BTK Akademi</strong>'den aldığım eğitimler ve edindiğim sertifikalarla profesyonel bir temele oturttum. Öğrenmenin hiç bitmediği bu sektörde, bitmek bilmeyen teknoloji tutkumla kendimi sürekli geliştirmeye devam ettim.
              </p>
            </section>

            <section className="glass-panel p-8 md:p-12">
              <h2 className="text-2xl font-semibold mb-6 text-accent">Benim Dünyamda Kurallar</h2>
              <p className="text-foreground/70 leading-relaxed mb-4">
                İşimdeki en büyük prensibim <strong>mükemmeliyetçilik ve dürüstlüktür.</strong> Her projeyi kendi projemmiş gibi en ince detayına kadar kurgularım.
              </p>
              <p className="text-foreground/70 leading-relaxed">
                Şeffaf ve hızlı iletişime son derece inanırım. Benim dünyamda "2 olan bir şeye asla 1 denmez", süreç neyi gerektiriyorsa odur. Beklentileri doğru yönetmek, müşteriye hayal satmak yerine sağlam temelleri olan dijital gerçeklikler sunmak her zaman birinci önceliğimdir. Samimi yaklaşımımla öncelikle insanların dertlerini ve hedeflerini dinler, sonra bu sorunlara nokta atışı dijital çözümler üretirim.
              </p>
            </section>

            <section className="glass-panel p-8 md:p-12">
              <h2 className="text-2xl font-semibold mb-6 text-accent">Gelecek Hedefi</h2>
              <p className="text-foreground/70 leading-relaxed">
                KvK Digital'i kurarken amacım sadece göze hitap eden, estetik web siteleri teslim edip süreci bitirmek değildi. Asıl hedefim, işletmelerin ve bireylerin <strong>dijital büyüme danışmanı</strong> olmaktı. Sadece kod yazan biri değil, markanızın potansiyelini teknolojinin gücüyle açığa çıkaran bir rehber olmayı amaçlıyorum.
              </p>
            </section>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold mb-6">Vizyonunuzu birlikte koda dökmeye hazır mısınız?</h3>
            <Link 
              href="/#contact" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-background font-bold hover:bg-accent/90 transition-colors"
            >
              Hemen İletişime Geçin
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
