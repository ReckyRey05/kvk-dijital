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
          {projects.length === 0 ? (
            <div className="col-span-full text-center text-foreground/50 py-12">
              Henüz proje eklenmemiş.
            </div>
          ) : (
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
