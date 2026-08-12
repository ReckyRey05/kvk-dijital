import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Metadata } from "next";
import { BlogPost } from "@/types/blog";

export const metadata: Metadata = {
  title: "Blog & Makaleler",
  description: "Web tasarım, e-ticaret, SEO ve dijital dönüşüm hakkında güncel bilgiler, rehberler ve sektör ipuçları.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/blog",
  }
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  // Fetch published blog posts
  const postsRef = collection(db, "blog_posts");
  const postsQuery = query(
    postsRef, 
    where("isPublished", "==", true),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(postsQuery).catch(() => null);
  const posts: BlogPost[] = snapshot ? snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as BlogPost[] : [];

  return (
    <main className="min-h-screen bg-[#050505] text-foreground selection:bg-accent/30 selection:text-accent font-sans overflow-x-hidden">
      <Header />
      
      <section className="pt-32 pb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Dijital Dönüşüm <span className="text-gradient">Rehberi</span>
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Web tasarım, yazılım geliştirme, e-ticaret stratejileri ve SEO hakkında uzman ekibimiz tarafından hazırlanan güncel makaleler.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <Link 
                  key={post.id} 
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-accent/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-[16/9] w-full bg-white/5 relative overflow-hidden">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center">
                        <span className="text-accent/50 text-4xl font-bold opacity-30">KvK</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-foreground/50 mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : "Yeni eklendi"}
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-foreground/70 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-2 text-accent text-sm font-medium">
                      Makaleyi Oku
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border border-white/10 rounded-2xl bg-white/5">
                <p className="text-foreground/50">Henüz yayınlanmış bir makale bulunmuyor.</p>
                <p className="text-sm text-foreground/40 mt-2">Çok yakında değerli içeriklerle karşınızda olacağız.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
