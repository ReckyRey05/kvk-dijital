import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BlogPost } from "@/types/blog";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-static';
export const revalidate = 3600; 

// SEO Metadata Generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const postsRef = collection(db, "blog_posts");
  const q = query(postsRef, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q).catch(() => null);
  
  if (!snapshot || snapshot.empty) {
    return { title: "Makale Bulunamadı" };
  }

  const post = snapshot.docs[0].data() as BlogPost;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://kvkdijitalcozumler.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://kvkdijitalcozumler.com/blog/${post.slug}`,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

// Generate static params for all published posts
export async function generateStaticParams() {
  const postsRef = collection(db, "blog_posts");
  const q = query(postsRef, where("isPublished", "==", true));
  const snapshot = await getDocs(q).catch(() => null);
  
  if (!snapshot) return [];

  return snapshot.docs.map((doc) => ({
    slug: doc.data().slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postsRef = collection(db, "blog_posts");
  const q = query(postsRef, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q).catch(() => null);
  
  if (!snapshot || snapshot.empty) {
    notFound();
  }

  const post = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;

  return (
    <main className="min-h-screen bg-[#050505] text-foreground selection:bg-accent/30 selection:text-accent font-sans">
      <Header />
      
      {/* JSON-LD Article Schema for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.coverImage ? [post.coverImage] : [],
            "datePublished": post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toISOString() : new Date().toISOString(),
            "author": {
              "@type": "Organization",
              "name": "KvK Dijital Çözümler"
            },
            "publisher": {
              "@type": "Organization",
              "name": "KvK Dijital Çözümler",
              "logo": {
                "@type": "ImageObject",
                "url": "https://kvkdijitalcozumler.com/icon.png"
              }
            }
          })
        }}
      />
      
      <article className="pt-32 pb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors mb-12 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Blog'a Dön
          </Link>
          
          <header className="mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-foreground/50 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toISOString() : ""}>
                  {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : "Yakın zamanda"}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>KvK Dijital Çözümler</span>
              </div>
            </div>
          </header>

          {post.coverImage && (
            <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-16 border border-white/10 shadow-2xl bg-white/5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-accent hover:prose-a:text-accent/80 prose-img:rounded-2xl animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>

      <Footer />
    </main>
  );
}
