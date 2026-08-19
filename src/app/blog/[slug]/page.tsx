import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Calendar, ArrowLeft, Clock, ArrowRight, User, HelpCircle } from "lucide-react";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/blogPosts";
import { sanitizeHtmlContent } from "@/lib/validation/schemas";
import DemoLaunchpad from "@/components/restaurant/blog/DemoLaunchpad";
import "./blog-article.css";

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

function formatEditorialContent(html: string): string {
  if (!html) return "";

  // Transform raw HTML <table> elements into luxury Editorial Comparison Blocks
  return html.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    // Extract THs
    const ths: string[] = [];
    const thMatches = tableHtml.match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
    if (thMatches) {
      thMatches.forEach(th => {
        ths.push(th.replace(/<[^>]+>/g, '').trim());
      });
    }

    // Extract TRs in tbody
    const tbodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/gi);
    if (!tbodyMatch) {
      return `<div class="overflow-x-auto my-8 rounded-2xl border border-white/10 shadow-2xl bg-white/[0.02] p-1">${tableHtml}</div>`;
    }

    const trMatches = tbodyMatch[0].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (!trMatches || trMatches.length === 0) {
      return `<div class="overflow-x-auto my-8 rounded-2xl border border-white/10 shadow-2xl bg-white/[0.02] p-1">${tableHtml}</div>`;
    }

    let editorialHtml = '<div class="editorial-table-block my-10 space-y-4 font-sans">';

    trMatches.forEach((trHtml, idx) => {
      const tds: string[] = [];
      const tdMatches = trHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
      if (tdMatches) {
        tdMatches.forEach(td => {
          tds.push(td.replace(/<[^>]+>/g, '').trim());
        });
      }

      const numStr = String(idx + 1).padStart(2, '0');

      // Case A: 4 Columns (e.g. Proje Tipi | Teknik Kapsam | Ortalama Teslim Süresi | Hedef Kitle)
      if (ths.length >= 4 && tds.length >= 4) {
        editorialHtml += `
          <div class="p-6 rounded-2xl bg-[#0a0f0f]/90 border border-white/10 hover:border-accent/40 transition-all duration-300 shadow-xl group">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-accent px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 font-mono">${numStr}</span>
                <div class="text-lg font-bold text-white group-hover:text-accent transition-colors">${tds[0]}</div>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="text-foreground/50 uppercase tracking-wider font-semibold">${ths[2] || "TESLİM SÜRESİ"}:</span>
                <span class="text-white font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10">${tds[2]}</span>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 text-sm">
              <div class="space-y-1">
                <span class="text-[11px] font-bold text-accent uppercase tracking-wider block">${ths[1] || "TEKNİK KAPSAM"}</span>
                <p class="text-foreground/80 leading-relaxed">${tds[1]}</p>
              </div>
              <div class="space-y-1">
                <span class="text-[11px] font-bold text-accent uppercase tracking-wider block">${ths[3] || "HEDEF KİTLE / KULLANIM"}</span>
                <p class="text-foreground/80 leading-relaxed">${tds[3]}</p>
              </div>
            </div>
          </div>
        `;
      }
      // Case B: 3 Columns (e.g. Kriter / Durum | WordPress Seçilmeli | Özel Yazılım Seçilmeli)
      else if (ths.length >= 3 && tds.length >= 3) {
        editorialHtml += `
          <div class="p-6 rounded-2xl bg-[#0a0f0f]/90 border border-white/10 hover:border-accent/40 transition-all duration-300 shadow-xl group">
            <div class="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
              <span class="text-xs font-bold text-accent px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 font-mono">${numStr}</span>
              <div class="text-lg font-bold text-white group-hover:text-accent transition-colors">${tds[0]}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span class="text-[11px] font-bold text-foreground/50 uppercase tracking-wider block">${ths[1] || "WORDPRESS"}</span>
                <p class="text-foreground/90 font-medium leading-relaxed">${tds[1]}</p>
              </div>
              <div class="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-1">
                <span class="text-[11px] font-bold text-accent uppercase tracking-wider block">${ths[2] || "ÖZEL YAZILIM"}</span>
                <p class="text-white font-semibold leading-relaxed">${tds[2]}</p>
              </div>
            </div>
          </div>
        `;
      }
      // Fallback for any other table structure
      else {
        editorialHtml += `<div class="overflow-x-auto my-6 rounded-2xl border border-white/10 p-1 bg-white/[0.02]">${trHtml}</div>`;
      }
    });

    editorialHtml += '</div>';
    return editorialHtml;
  });
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
      
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      
      {/* FAQ Schema if present */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
        />
      )}

      {/* LCP Image Preload */}
      {post.coverImage && (
        <link rel="preload" as="image" href={post.coverImage} />
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

          {/* Cover Image - LCP Element */}
          {post.coverImage && (
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-card-border mb-8 shadow-2xl bg-black/40">
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
                width={800}
                height={450}
              />
            </div>
          )}

          {/* Interactive Live Demo Launchpad for Restaurant POS Post */}
          {(post.slug.includes("cep-garson") || post.slug.includes("qr-menu-pos")) && (
            <DemoLaunchpad />
          )}

          {/* Article HTML Content */}
          <div 
            className="blog-article-content prose-invert max-w-none space-y-6"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHtmlContent(formatEditorialContent(post.content || "")) 
            }}
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

          {/* Contextual Lead Conversion CTA Banner */}
          <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-card via-[#0c1414] to-card border border-accent/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {post.category ? `${post.category} Projenizi Birlikte Planlayalım` : "İşletmeniz İçin Web Projenizi Birlikte Planlayalım"}
            </h3>
            <p className="text-sm text-foreground/70 max-w-xl mx-auto leading-relaxed">
              KvK Dijital Çözümler ile yüksek performanslı, SEO altyapılı ve dönüşüm odaklı web sistemleri geliştirmek için ücretsiz danışmanlık alın.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link 
                href="/iletisim" 
                className="px-8 py-3.5 bg-accent text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-accent/90 transition-all inline-flex items-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
              >
                Ücretsiz Teklif Alın <ArrowRight className="w-4 h-4" />
              </Link>
              {post.category?.toLowerCase().includes("tasarım") || post.category?.toLowerCase().includes("tasarim") ? (
                <Link href="/web-tasarim" className="px-6 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
                  Web Tasarım Hizmetini İnceleyin
                </Link>
              ) : post.category?.toLowerCase().includes("e-ticaret") ? (
                <Link href="/e-ticaret-web-sitesi" className="px-6 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
                  E-Ticaret Çözümünü İnceleyin
                </Link>
              ) : (
                <Link href="/hizmetler" className="px-6 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
                  Tüm Hizmetleri İnceleyin
                </Link>
              )}
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
