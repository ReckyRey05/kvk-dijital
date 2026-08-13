import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blogPosts";

export const metadata: Metadata = {
  title: "Blog & Dijital Dönüşüm Rehberi | KvK Dijital Çözümler",
  description: "Web tasarım, e-ticaret, SEO, özel yazılım ve yerel dijital pazarlama stratejileri hakkında rehber makaleler ve uzman analizi.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/blog",
  },
  openGraph: {
    title: "Blog & Dijital Dönüşüm Rehberi | KvK Dijital Çözümler",
    description: "Web tasarım, e-ticaret, SEO ve özel yazılım rehber makaleleri.",
    url: "https://kvkdijitalcozumler.com/blog",
    type: "website"
  }
};

export const revalidate = 3600; // 1 hour ISR

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="min-h-screen bg-[#050505] text-foreground selection:bg-accent/30 selection:text-accent font-sans overflow-x-hidden">
      <Header />
      
      <section className="pt-32 pb-20 relative border-b border-card-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Topical Authority & Bilgi Rehberi
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
              Dijital Dönüşüm <span className="text-accent">Rehberi</span>
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Pendik, İstanbul ve Türkiye genelinde işletmelerin dijitalde büyümesini sağlayan web tasarım, e-ticaret, özel yazılım ve SEO stratejileri.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => {
              return (
                <Link 
                  key={post.id || post.slug} 
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-card border border-card-border rounded-2xl overflow-hidden hover:bg-white/5 hover:border-accent/40 transition-all duration-500 shadow-xl"
                >
                  <div className="aspect-[16/9] w-full bg-black/40 relative overflow-hidden border-b border-card-border">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        width={600}
                        height={338}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center">
                        <span className="text-accent/50 text-4xl font-bold opacity-30">KvK</span>
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md border border-accent/40 text-accent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-4 text-xs text-foreground/50 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : "Güncel"}
                        </span>
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime}
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h2>
                      
                      <p className="text-foreground/70 text-xs leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-card-border flex items-center justify-between text-accent text-xs font-bold uppercase tracking-wider mt-auto">
                      Makaleyi İncele
                      <div className="w-7 h-7 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
