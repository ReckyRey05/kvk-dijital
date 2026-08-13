import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Projelerimiz",
  description: "Web tasarım, e-ticaret, SEO ve dijital dönüşüm alanlarında tamamladığımız başarılı projelerimiz.",
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
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-32">
      <Header />
      
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors text-sm font-medium mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Ana Sayfaya Dön
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Örnek <span className="text-accent">Projelerimiz</span>
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed">
            Farklı sektörler için özenle hazırladığımız, yüksek performanslı ve modern tasarımlı web site konseptleri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {/* Static Concept Demo #1 Card */}
          <div className="group flex flex-col rounded-3xl overflow-hidden bg-card border border-amber-500/30 hover:border-amber-500/60 transition-all duration-500 relative">
            <div className="absolute top-4 right-4 z-10 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
              Konsept Demo
            </div>
            
            <div className="w-full h-64 bg-gradient-to-br from-amber-950/40 via-black to-[#050505] relative overflow-hidden flex items-center justify-center p-6 border-b border-card-border/50">
              <div className="w-full h-full rounded-lg border border-amber-500/20 bg-black/60 shadow-2xl overflow-hidden p-6 flex flex-col justify-between group-hover:scale-105 transition-transform duration-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                    ☕
                  </div>
                  <span className="text-white font-bold text-sm">Pendik Sahil Bistro</span>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-amber-500/30 rounded-full" />
                  <div className="w-2/3 h-2 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <span className="text-amber-400 text-xs font-medium tracking-wider uppercase mb-3 block">
                Restoran & Kafe Gastronomi
              </span>
              <h3 className="text-xl font-semibold mb-3">Pendik Sahil Bistro & Kafe</h3>
              <p className="text-foreground/70 text-xs mb-6 leading-relaxed">
                Restoran ve kafeler için hazırlanmış mobil öncelikli, dijital menülü ve hızlı konsept web tasarımı.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-foreground/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>İnteraktif Dijital Menü</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Mobil Öncelikli & Ultra Hızlı</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Çalışma Saatleri & Konum</span>
                </li>
              </ul>

              <Link 
                href="/projeler/pendik-sahil-bistro-demo" 
                className="flex items-center justify-between w-full pt-6 border-t border-card-border text-foreground font-medium group-hover:text-amber-400 transition-colors mt-auto"
              >
                Demoyu İncele
                <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-amber-400 group-hover:bg-amber-500/10 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Static Concept Demo #2 Card */}
          <div className="group flex flex-col rounded-3xl overflow-hidden bg-card border border-rose-500/30 hover:border-rose-500/60 transition-all duration-500 relative">
            <div className="absolute top-4 right-4 z-10 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
              Konsept Demo
            </div>
            
            <div className="w-full h-64 bg-gradient-to-br from-rose-950/40 via-black to-[#050505] relative overflow-hidden flex items-center justify-center p-6 border-b border-card-border/50">
              <div className="w-full h-full rounded-lg border border-rose-500/20 bg-black/60 shadow-2xl overflow-hidden p-6 flex flex-col justify-between group-hover:scale-105 transition-transform duration-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold text-xs">
                    ✨
                  </div>
                  <span className="text-white font-bold text-sm">Aura Beauty</span>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-rose-500/30 rounded-full" />
                  <div className="w-2/3 h-2 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <span className="text-rose-400 text-xs font-medium tracking-wider uppercase mb-3 block">
                Güzellik & Bakım Salonu
              </span>
              <h3 className="text-xl font-semibold mb-3">Aura Beauty & Güzellik Merkezi</h3>
              <p className="text-foreground/70 text-xs mb-6 leading-relaxed">
                Güzellik salonları ve kişisel bakım merkezleri için hazırlanmış online randevu modüllü konsept web tasarımı.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-foreground/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>Online Randevu Modülü</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>Hizmet & Fiyat Listesi</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>Mobil Öncelikli Şık Tasarım</span>
                </li>
              </ul>

              <Link 
                href="/projeler/aura-beauty-demo" 
                className="flex items-center justify-between w-full pt-6 border-t border-card-border text-foreground font-medium group-hover:text-rose-400 transition-colors mt-auto"
              >
                Demoyu İncele
                <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-rose-400 group-hover:bg-rose-500/10 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {projects.length === 0 ? null : (
            projects.map((project, index) => (
              <div
                key={project.id}
                className="group flex flex-col rounded-3xl overflow-hidden bg-card border border-card-border hover:border-accent/30 transition-colors duration-500"
              >
                {/* Image Placeholder Side */}
                <div className="w-full h-64 bg-gradient-to-br from-[#0a0f0f] to-[#050505] relative overflow-hidden flex items-center justify-center p-6 border-b border-card-border/50">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full rounded-lg border border-white/10 bg-black/50 shadow-2xl overflow-hidden relative group-hover:scale-[1.05] transition-transform duration-700 ease-out">
                      <div className="w-full h-6 bg-white/5 border-b border-white/10 flex items-center px-3 gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                      </div>
                      <div className="p-4 w-full h-full relative">
                        <div className="w-3/4 h-8 bg-white/5 rounded-md mb-3" />
                        <div className="w-1/2 h-4 bg-white/5 rounded-sm mb-6" />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="w-full h-16 bg-white/5 rounded-md" />
                          <div className="w-full h-16 bg-accent/10 rounded-md border border-accent/20" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Side */}
                <div className="p-8 flex flex-col flex-grow">
                  <span className="text-accent text-xs font-medium tracking-wider uppercase mb-3 block">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-semibold mb-6 flex-grow">{project.title}</h3>
                  
                  <ul className="space-y-2 mb-8">
                    {(project.features || []).slice(0, 3).map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-foreground/70 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/50 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                    {(project.features || []).length > 3 && (
                      <li className="flex items-center gap-2 text-foreground/50 text-xs italic">
                        + {(project.features || []).length - 3} özellik daha
                      </li>
                    )}
                  </ul>

                  {(project.demoUrl || project.githubUrl) && (
                    <a href={project.demoUrl || project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full pt-6 border-t border-card-border text-foreground font-medium group-hover:text-accent transition-colors">
                      Canlı Demoyu Gör
                      <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                         <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="glass-panel p-12 text-center border-card-border mb-24">
          <h3 className="text-3xl font-semibold mb-6">Kendi sektörünüzü göremediniz mi?</h3>
          <p className="text-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
            Hangi sektörde olursanız olun, işletmenize değer katacak özel bir dijital deneyim tasarlayabiliriz. 
          </p>
          <Link 
            href="/#contact" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors"
          >
            Bize Ulaşın
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
