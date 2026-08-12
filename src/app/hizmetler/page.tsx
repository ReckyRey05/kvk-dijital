import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Hizmetlerimiz",
  description: "Web Tasarımı, Özel Yazılım Geliştirme, E-Ticaret Çözümleri, Kurumsal Kimlik, Yapay Zeka Entegrasyonları ve SEO Danışmanlığı hizmetlerimiz.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/hizmetler",
  }
};

export default async function Hizmetler() {
  const servicesRef = getAdminDb().collection("services");
  const snapshot = await servicesRef.get().catch(() => null);
  const services = snapshot ? snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) : [];

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
          {services.length === 0 ? (
            <div className="col-span-full text-center text-foreground/50 py-12">
              Henüz hizmet eklenmemiş.
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="glass-panel p-8 md:p-10 flex flex-col h-full group hover:border-accent/30 transition-colors duration-500">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-semibold mb-4">{service.title}</h2>
                <p className="text-foreground/70 leading-relaxed mb-8 flex-grow">
                  {service.description}
                </p>
                
                {(service.features && service.features.length > 0) && (
                  <ul className="space-y-4">
                    {service.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {service.link && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <Link href={service.link} className="inline-flex items-center gap-2 text-accent font-medium hover:text-white transition-colors group">
                      Detaylı İncele <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
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
