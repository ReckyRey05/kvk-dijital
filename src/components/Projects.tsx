"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface ConceptCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  href: string;
  imageSrc: string;
  imageAlt: string;
  aspectRatio: string;
}

const conceptDemos: ConceptCardProps[] = [
  {
    id: "demo-bistro",
    title: "Pendik Sahil Bistro & Kafe",
    category: "Restoran & Kafe Gastronomi",
    description: "Restoran ve kafeler için mobil öncelikli, dijital menülü ve hızlı konsept web tasarımı.",
    features: ["İnteraktif Dijital Menü Listesi", "Editoryal Gastronomi Düzeni", "Ziyaret Saatleri & Konum"],
    href: "/projeler/pendik-sahil-bistro-demo",
    imageSrc: "/images/demos/pendik-bistro/hero.jpg",
    imageAlt: "Pendik Sahil Bistro ahşap masa ve sıcak mekan düzeni",
    aspectRatio: "aspect-[16/9]"
  },
  {
    id: "demo-beauty",
    title: "Aura Beauty & Güzellik Merkezi",
    category: "Güzellik & Bakım Salonu",
    description: "Güzellik salonları ve bakım merkezleri için online randevu modüllü lüks konsept web tasarımı.",
    features: ["Online Randevu Modülü Simülasyonu", "Hizmet & Terapi Kataloğu", "Minimalist Moda Dergisi Düzeni"],
    href: "/projeler/aura-beauty-demo",
    imageSrc: "/images/demos/aura-beauty/hero.jpg",
    imageAlt: "Aura Beauty & Güzellik Merkezi medikal cilt bakımı uygulaması",
    aspectRatio: "aspect-[4/3]"
  },
  {
    id: "demo-hukuk",
    title: "Prestij Hukuk & Danışmanlık",
    category: "Hukuk & B2B Danışmanlık",
    description: "Hukuk büroları ve danışmanlık firmaları için İsviçre editoryal düzeninde kurumsal konsept web sitesi.",
    features: ["İnteraktif Çalışma Alanları Kataloğu", "Kurumsal Danışmanlık Talebi Modülü", "Hukuki Rehber & Bilgi Paylaşımı"],
    href: "/projeler/prestij-hukuk-demo",
    imageSrc: "/images/demos/prestij-hukuk/hero.jpg",
    imageAlt: "Prestij Hukuk & Danışmanlık kurumsal kütüphane ve resmi toplantı alanı",
    aspectRatio: "aspect-[16/9]"
  },
  {
    id: "demo-emlak",
    title: "Vizyon Gayrimenkul & Danışmanlık",
    category: "Emlak & Gayrimenkul Marketplace",
    description: "Emlak ofisleri ve gayrimenkul danışmanları için filtrelenebilir canlı ilan portföy modüllü web sitesi.",
    features: ["Canlı İlan Filtreleme Motoru (Satılık/Kiralık)", "İnteraktif İlan Detay Modalı", "Mimari Editoryal Portföy Tasarımı"],
    href: "/projeler/vizyon-gayrimenkul-demo",
    imageSrc: "/images/demos/vizyon-gayrimenkul/hero.jpg",
    imageAlt: "Vizyon Gayrimenkul lüks deniz manzaralı residance dairesi",
    aspectRatio: "aspect-[16/9]"
  },
  {
    id: "demo-butik",
    title: "Artisanal Butik & Mağaza",
    category: "Butik E-Ticaret & Retail Store",
    description: "Butik mağazalar ve e-ticaret markaları için canlı ürün arama, filtreleme ve sepet paneli modüllü e-ticaret web sitesi.",
    features: ["Canlı Ürün Arama & Kategori Filtreleme", "İnteraktif Sepet Paneli (Cart Drawer)", "Varyant Seçimi & Favoriler Sistemi"],
    href: "/projeler/artisanal-butik-demo",
    imageSrc: "/images/demos/artisanal-butik/hero.jpg",
    imageAlt: "Artisanal Butik el yapımı tasarım ürünler koleksiyonu",
    aspectRatio: "aspect-[16/9]"
  }
];

export default function Projects({ projects }: { projects?: any[] }) {
  return (
    <section id="projects" className="w-full py-24 relative overflow-hidden bg-background border-t border-card-border scroll-mt-20 md:scroll-mt-24">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Sektörel Portföy Sunumları
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Seçkin Konsept Projelerimiz</h2>
          </div>
          <p className="text-foreground/70 text-sm max-w-md leading-relaxed">
            Farklı sektörlerin gerçek ihtiyaçlarına ve tasarım dillerine özel olarak hazırladığımız yüksek performanslı demo çalışmalarımız.
          </p>
        </div>

        {/* Concept Demos Showcase Grid (Strictly adhering to KvK Global Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {conceptDemos.map((demo) => (
            <div 
              key={demo.id}
              className="group rounded-3xl overflow-hidden bg-card border border-card-border hover:border-accent/40 transition-all duration-500 flex flex-col justify-between relative"
            >
              {/* Disclaimer Tag */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-black/90 text-white border border-accent/60 shadow-xl backdrop-blur-md">
                  Konsept Demo
                </span>
              </div>

              {/* Imagery Frame with sector-specific aspect treatment */}
              <div className={`w-full ${demo.aspectRatio} relative overflow-hidden bg-black/40 border-b border-card-border`}>
                <img 
                  src={demo.imageSrc} 
                  alt={demo.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                  width={800}
                  height={500}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                  <span className="text-xs uppercase tracking-widest font-semibold text-accent mb-1">
                    {demo.category}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground">
                    {demo.title}
                  </h3>
                </div>
              </div>

              {/* Content Box */}
              <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {demo.description}
                </p>

                <ul className="space-y-2">
                  {demo.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-xs font-medium text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-card-border">
                  <Link 
                    href={demo.href}
                    className="inline-flex items-center justify-between w-full font-bold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition-colors"
                  >
                    <span>Demoyu Detaylı İncele</span>
                    <div className="w-8 h-8 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* View All Portfolio Link */}
        <div className="text-center">
          <Link 
            href="/projeler" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-card border border-card-border text-foreground font-semibold text-sm hover:border-accent hover:text-accent transition-all group"
          >
            Tüm Örnek Portföyü İncele 
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
