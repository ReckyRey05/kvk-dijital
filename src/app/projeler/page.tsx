import Footer from "@/components/Footer";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Projelerimiz & Sektörel Demolar",
  description: "Web tasarım, e-ticaret, SEO ve dijital dönüşüm alanlarında tamamladığımız örnek projelerimiz ve sektörlere özel konsept demolarımız.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler",
  }
};

export default async function Projeler() {
  const projectsRef = getAdminDb().collection("projects");
  const snapshot = await projectsRef.orderBy("createdAt", "desc").get().catch(() => null);
  const projects = snapshot ? snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt ? { toDate: () => data.createdAt.toDate() } : null
    } as any;
  }) : [];

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32 bg-background text-foreground">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Ana Sayfaya Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Örnek <span className="text-accent">Projelerimiz & Demolar</span>
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed">
            Farklı sektörlerin gerçek kullanıcı ihtiyaçlarına göre özenle tasarladığımız yüksek performanslı web site konseptleri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          
          {/* Static Concept Demo #1 Card — Pendik Sahil Bistro (KvK Brand Theme) */}
          <div className="group flex flex-col rounded-3xl overflow-hidden bg-card text-foreground border border-card-border hover:border-accent/40 transition-all duration-500 relative">
            <div className="absolute top-4 right-4 z-10 bg-black/90 text-white border border-accent/60 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xl backdrop-blur-md">
              Konsept Demo
            </div>
            
            <div className="w-full h-64 bg-black/40 relative overflow-hidden border-b border-card-border">
              <img 
                src="/images/demos/pendik-bistro/hero.webp" 
                alt="Pendik Sahil Bistro & Kafe ahşap masa ve sıcak mekan düzeni" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                loading="lazy"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs uppercase tracking-widest font-semibold text-accent mb-1">Restoran & Kafe Gastronomi</span>
                <h2 className="text-xl font-bold text-foreground">Pendik Sahil Bistro & Kafe</h2>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
              <p className="text-xs text-foreground/70 leading-relaxed">
                Restoran ve kafeler için hazırlanmış mobil öncelikli editoryal tasarımı, dijital menülü ve hızlı konsept web sitesi.
              </p>

              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>İnteraktif Dijital Menü Listesi</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Editoryal Gastronomi Düzeni</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Ziyaret Saatleri & Konum</span>
                </li>
              </ul>

              <div className="pt-6 border-t border-card-border">
                <Link 
                  href="/projeler/pendik-sahil-bistro-demo" 
                  className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition-colors mt-auto"
                >
                  Demoyu Detaylı İncele
                  <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Static Concept Demo #2 Card — Aura Beauty (KvK Brand Theme) */}
          <div className="group flex flex-col rounded-3xl overflow-hidden bg-card text-foreground border border-card-border hover:border-accent/40 transition-all duration-500 relative">
            <div className="absolute top-4 right-4 z-10 bg-black/90 text-white border border-accent/60 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xl backdrop-blur-md">
              Konsept Demo
            </div>
            
            <div className="w-full h-64 bg-black/40 relative overflow-hidden border-b border-card-border">
              <img 
                src="/images/demos/aura-beauty/hero.webp" 
                alt="Aura Beauty & Güzellik Merkezi medikal cilt bakımı uygulaması" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                loading="lazy"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs uppercase tracking-widest font-semibold text-accent mb-1">Güzellik & Bakım Salonu</span>
                <h2 className="text-xl font-bold text-foreground">Aura Beauty & Güzellik</h2>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
              <p className="text-xs text-foreground/70 leading-relaxed">
                Güzellik salonları ve bakım merkezleri için tasarlanmış online randevu modüllü lüks konsept web sitesi.
              </p>

              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Online Randevu Modülü Simülasyonu</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Hizmet & Terapi Kataloğu</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Minimalist Moda Dergisi Düzeni</span>
                </li>
              </ul>

              <div className="pt-6 border-t border-card-border">
                <Link 
                  href="/projeler/aura-beauty-demo" 
                  className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition-colors mt-auto"
                >
                  Demoyu Detaylı İncele
                  <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Static Concept Demo #3 Card — Prestij Hukuk & Danışmanlık (KvK Brand Theme) */}
          <div className="group flex flex-col rounded-3xl overflow-hidden bg-card text-foreground border border-card-border hover:border-accent/40 transition-all duration-500 relative">
            <div className="absolute top-4 right-4 z-10 bg-black/90 text-white border border-accent/60 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xl backdrop-blur-md">
              Konsept Demo
            </div>
            
            <div className="w-full h-64 bg-black/40 relative overflow-hidden border-b border-card-border">
              <img 
                src="/images/demos/prestij-hukuk/hero.webp" 
                alt="Prestij Hukuk & Danışmanlık kurumsal kütüphane ve resmi toplantı alanı" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                loading="lazy"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs uppercase tracking-widest font-semibold text-accent mb-1">Hukuk & B2B Danışmanlık</span>
                <h2 className="text-xl font-bold text-foreground">Prestij Hukuk & Danışmanlık</h2>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
              <p className="text-xs text-foreground/70 leading-relaxed">
                Hukuk büroları ve danışmanlık firmaları için İsviçre editoryal düzeninde hazırlanan kurumsal konsept web sitesi.
              </p>

              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>İnteraktif Çalışma Alanları Kataloğu</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Kurumsal Danışmanlık Talebi Modülü</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Hukuki Rehber & Makale Modülü</span>
                </li>
              </ul>

              <div className="pt-6 border-t border-card-border">
                <Link 
                  href="/projeler/prestij-hukuk-demo" 
                  className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition-colors mt-auto"
                >
                  Demoyu Detaylı İncele
                  <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Static Concept Demo #4 Card — Vizyon Gayrimenkul & Danışmanlık (KvK Brand Theme) */}
          <div className="group flex flex-col rounded-3xl overflow-hidden bg-card text-foreground border border-card-border hover:border-accent/40 transition-all duration-500 relative">
            <div className="absolute top-4 right-4 z-10 bg-black/90 text-white border border-accent/60 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xl backdrop-blur-md">
              Konsept Demo
            </div>
            
            <div className="w-full h-64 bg-black/40 relative overflow-hidden border-b border-card-border">
              <img 
                src="/images/demos/vizyon-gayrimenkul/hero.webp" 
                alt="Vizyon Gayrimenkul deniz manzaralı lüks residance dairesi" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                loading="lazy"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs uppercase tracking-widest font-semibold text-accent mb-1">Emlak & Gayrimenkul Marketplace</span>
                <h2 className="text-xl font-bold text-foreground">Vizyon Gayrimenkul & Danışmanlık</h2>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
              <p className="text-xs text-foreground/70 leading-relaxed">
                Emlak ofisleri ve gayrimenkul danışmanları için filtrelenebilir canlı ilan portföy modüllü konsept web sitesi.
              </p>

              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Canlı İlan Filtreleme Motoru (Satılık/Kiralık)</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>İnteraktif İlan Detay Modalı</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Mimari Editoryal Portföy Tasarımı</span>
                </li>
              </ul>

              <div className="pt-6 border-t border-card-border">
                <Link 
                  href="/projeler/vizyon-gayrimenkul-demo" 
                  className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition-colors mt-auto"
                >
                  Demoyu Detaylı İncele
                  <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Static Concept Demo #5 Card — Artisanal Butik & Mağaza (KvK Brand Theme) */}
          <div className="group flex flex-col rounded-3xl overflow-hidden bg-card text-foreground border border-card-border hover:border-accent/40 transition-all duration-500 relative">
            <div className="absolute top-4 right-4 z-10 bg-black/90 text-white border border-accent/60 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xl backdrop-blur-md">
              Konsept Demo
            </div>
            
            <div className="w-full h-64 bg-black/40 relative overflow-hidden border-b border-card-border">
              <img 
                src="/images/demos/artisanal-butik/hero.webp" 
                alt="Artisanal Butik el yapımı tasarım ürünler koleksiyonu" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                loading="lazy"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs uppercase tracking-widest font-semibold text-accent mb-1">Butik E-Ticaret & Retail Store</span>
                <h2 className="text-xl font-bold text-foreground">Artisanal Butik & Mağaza</h2>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
              <p className="text-xs text-foreground/70 leading-relaxed">
                Butik mağazalar ve e-ticaret markaları için canlı ürün arama, filtreleme ve sepet paneli modüllü konsept e-ticaret web sitesi.
              </p>

              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Canlı Ürün Arama & Kategori Filtreleme</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>İnteraktif Sepet Paneli (Cart Drawer)</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>Varyant Seçimi & Favoriler Sistemi</span>
                </li>
              </ul>

              <div className="pt-6 border-t border-card-border">
                <Link 
                  href="/projeler/artisanal-butik-demo" 
                  className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition-colors mt-auto"
                >
                  Demoyu Detaylı İncele
                  <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Dynamic Customer Projects (if any exist in Firestore) */}
          {projects.map((project: any) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-3xl overflow-hidden bg-card border border-card-border hover:border-accent/40 transition-all duration-500"
            >
              <div className="w-full h-64 bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-card-border">
                {project.coverImage ? (
                  <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0a0f0f] to-[#050505] p-6 flex flex-col justify-between">
                    <span className="text-accent text-xs font-bold uppercase">{project.category}</span>
                    <span className="text-foreground font-bold text-lg">{project.title}</span>
                  </div>
                )}
              </div>

              <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
                <div>
                  <span className="text-accent text-xs font-medium tracking-wider uppercase mb-2 block">{project.category}</span>
                  <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                  <ul className="space-y-2 mb-4">
                    {(project.features || []).slice(0, 3).map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-foreground/70 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {(project.demoUrl || project.githubUrl) && (
                  <a href={project.demoUrl || project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full pt-6 border-t border-card-border text-foreground font-medium group-hover:text-accent transition-colors">
                    Canlı Projeyi İncele
                    <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </a>
                )}
              </div>
            </div>
          ))}

        </div>

        <div className="glass-panel p-10 md:p-12 text-center border-accent/20 mb-24 rounded-3xl bg-accent/5">
          <h3 className="text-3xl font-bold mb-4">Kendi Sektörünüz İçin Özel Bir Web Sitesi İstiyor Musunuz?</h3>
          <p className="text-foreground/70 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Hangi sektörde olursanız olun, işletmenizin prestijini ve satış potansiyelini yükseltecek özel web sitenizi birlikte tasarlayalım. 
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/#iletisim" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-slate-950 font-bold hover:bg-accent/90 transition-colors shadow-lg cursor-pointer text-sm"
            >
              KvK Dijital'den Teklif Alın <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a 
              href="https://wa.me/905348914905?text=Merhaba,%20konsept%20projelerinizi%20inceledim.%20Kendi%20i%C5%9Fletmem%20i%C3%A7in%20web%20sitesi%20teklifi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors text-sm"
            >
              WhatsApp'tan Bilgi Alın
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
