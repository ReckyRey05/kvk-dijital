import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Calendar, ArrowLeft, Clock, ArrowRight, User, HelpCircle } from "lucide-react";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/blogPosts";

export const revalidate = 3600; // 1 hour ISR

// SEO Metadata Generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Makale Bulunamadı | KvK Dijital Çözümler" };
  }

  const fullUrl = `https://kvkdijitalcozumler.com/blog/${post.slug}`;

  return {
    title: `${post.title} | KvK Dijital Çözümler`,
    description: post.excerpt,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: fullUrl,
      images: post.coverImage ? [{ url: `https://kvkdijitalcozumler.com${post.coverImage}` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [`https://kvkdijitalcozumler.com${post.coverImage}`] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllBlogPosts();
  const otherPosts = allPosts.filter(p => p.slug !== post.slug).slice(0, 3);

  // Article JSON-LD Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage ? [`https://kvkdijitalcozumler.com${post.coverImage}`] : [],
    "datePublished": post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toISOString() : new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "KvK Dijital Çözümler",
      "url": "https://kvkdijitalcozumler.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "KvK Dijital Çözümler",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kvkdijitalcozumler.com/logos/KvK-Digital-Logo-Primary-Transparent.webp"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://kvkdijitalcozumler.com/blog/${post.slug}`
    }
  };

  // Optional FAQ JSON-LD Schema
  const faqSchema = post.faq && post.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  } : null;

  return (
    <main className="min-h-screen bg-[#050505] text-foreground selection:bg-accent/30 selection:text-accent font-sans overflow-x-hidden">
      <Header />
      
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      {/* FAQ Schema if present */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="pt-32 pb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          
          <Link href="/blog" className="inline-flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Tüm Makalelere Dön
          </Link>
          
          <header className="mb-10 animate-fade-in-up space-y-4">
            {post.category && (
              <span className="inline-block bg-accent/10 border border-accent/30 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-foreground/60 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5 font-medium text-white">
                <User className="w-3.5 h-3.5 text-accent" />
                {post.author || "KvK Dijital Çözümler Uzman Kadrosu"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : "Güncel"}
              </span>
              {post.readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {post.readTime}
                </span>
              )}
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-card-border mb-12 shadow-2xl bg-black/40">
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
                width={1200}
                height={675}
              />
            </div>
          )}

          {/* Article HTML Content */}
          <div 
            className="prose prose-invert max-w-none text-foreground/80 leading-relaxed text-base space-y-6
              prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/10 prose-h2:text-white
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-white
              prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-accent prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-bold
              prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-li:text-foreground/80
              prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* FAQ Accordion Section if present */}
          {post.faq && post.faq.length > 0 && (
            <div className="mt-16 p-8 rounded-2xl bg-card border border-card-border space-y-6">
              <div className="flex items-center gap-3 border-b border-card-border pb-4">
                <HelpCircle className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold text-white">Sık Sorulan Sorular</h3>
              </div>
              <div className="space-y-4">
                {post.faq.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <h4 className="font-bold text-white text-base">{item.question}</h4>
                    <p className="text-sm text-foreground/70 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion CTA Banner */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-card via-[#0c1414] to-card border border-accent/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              İşletmeniz İçin Web Projenizi Birlikte Planlayalım
            </h3>
            <p className="text-sm text-foreground/70 max-w-xl mx-auto leading-relaxed">
              KvK Dijital Çözümler ile yüksek performanslı, SEO altyapılı ve dönüşüm odaklı web siteleri geliştirmek için ücretsiz danışmanlık alın.
            </p>
            <div>
              <Link 
                href="/iletisim" 
                className="px-8 py-3.5 bg-accent text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-accent/90 transition-all inline-flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                Ücretsiz Teklif Alın <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Other Articles Recommendation Grid */}
          {otherPosts.length > 0 && (
            <div className="mt-20 pt-12 border-t border-card-border space-y-8">
              <h3 className="text-2xl font-bold text-white">Diğer Rehber Makaleler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {otherPosts.map(op => (
                  <Link 
                    key={op.id || op.slug} 
                    href={`/blog/${op.slug}`}
                    className="group bg-card border border-card-border p-5 rounded-2xl hover:border-accent/40 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] text-accent font-bold uppercase tracking-wider">{op.category}</span>
                      <h4 className="font-bold text-white text-sm group-hover:text-accent transition-colors line-clamp-2">{op.title}</h4>
                    </div>
                    <span className="text-xs text-accent font-semibold flex items-center gap-1 mt-auto pt-2">
                      Devamını Oku <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </article>

      <Footer />
    </main>
  );
}
