"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Utensils, Info } from "lucide-react";

interface ConceptCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  href: string;
  imageSrc: string;
  theme: "bistro" | "beauty";
}

const conceptDemos: ConceptCardProps[] = [
  {
    id: "demo-bistro",
    title: "Pendik Sahil Bistro & Kafe",
    category: "Restoran & Kafe Gastronomi",
    description: "Restoran ve kafeler için hazırlanmış editoryal tasarımı, dijital menülü ve hızlı konsept web sitesi.",
    features: ["İnteraktif Dijital Menü", "Mobil Öncelikli Editoryal Düzen", "Ziyaret Saatleri & Konum"],
    href: "/projeler/pendik-sahil-bistro-demo",
    imageSrc: "/images/demos/pendik-bistro/hero.jpg",
    theme: "bistro"
  },
  {
    id: "demo-beauty",
    title: "Aura Beauty & Güzellik Merkezi",
    category: "Güzellik & Bakım Salonu",
    description: "Güzellik salonları ve bakım merkezleri için tasarlanmış online randevu modüllü lüks konsept web sitesi.",
    features: ["Online Randevu Modülü", "Hizmet & Terapi Kataloğu", "Minimalist Moda Dergisi Düzeni"],
    href: "/projeler/aura-beauty-demo",
    imageSrc: "/images/demos/aura-beauty/hero.jpg",
    theme: "beauty"
  }
];

export default function Projects({ projects }: { projects?: any[] }) {
  return (
    <section id="projects" className="w-full py-24 relative overflow-hidden bg-background border-t border-card-border/50">
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
            Farklı sektörlerin gerçek ihtiyaçlarına ve tasarım dillerine özel olarak hazırladığımız yüksek dönüşümlü demo çalışmalarımız.
          </p>
        </div>

        {/* Concept Demos Grid Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {conceptDemos.map((demo) => {
            const isBistro = demo.theme === "bistro";

            return (
              <div 
                key={demo.id}
                className={`group rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between relative ${
                  isBistro 
                    ? "bg-[#faf8f5] text-[#1f1c19] border-[#d6cbba] hover:border-[#b89562]" 
                    : "bg-[#0d0d12] text-[#f5f2eb] border-[#262433] hover:border-[#d4af37]/60"
                }`}
              >
                {/* Top Disclaimer Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md border ${
                    isBistro 
                      ? "bg-[#1f1c19]/80 text-[#faf8f5] border-[#1f1c19]" 
                      : "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40"
                  }`}>
                    Konsept Demo
                  </span>
                </div>

                {/* Imagery Showcase */}
                <div className="w-full h-72 relative overflow-hidden bg-slate-900 border-b border-black/10">
                  <img 
                    src={demo.imageSrc} 
                    alt={demo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isBistro 
                      ? "from-[#1f1c19]/80 via-transparent to-transparent" 
                      : "from-[#0a0a0d]/90 via-transparent to-transparent"
                  } p-6 flex flex-col justify-end`}>
                    <span className={`text-xs uppercase tracking-widest font-semibold ${
                      isBistro ? "text-[#c8a97e]" : "text-[#d4af37]"
                    }`}>
                      {demo.category}
                    </span>
                    <h3 className={`text-2xl font-bold ${isBistro ? "font-serif text-[#faf8f5]" : "font-serif text-white"}`}>
                      {demo.title}
                    </h3>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
                  <p className={`text-xs leading-relaxed ${isBistro ? "text-[#524d45]" : "text-[#9e978c]"}`}>
                    {demo.description}
                  </p>

                  <ul className="space-y-2">
                    {demo.features.map(f => (
                      <li key={f} className={`flex items-center gap-2.5 text-xs font-medium ${
                        isBistro ? "text-[#38332d]" : "text-[#d4af37]"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isBistro ? "bg-[#b89562]" : "bg-[#d4af37]"
                        }`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`pt-6 border-t ${isBistro ? "border-[#d6cbba]" : "border-[#1c1b26]"}`}>
                    <Link 
                      href={demo.href}
                      className={`inline-flex items-center justify-between w-full font-bold text-xs uppercase tracking-wider transition-colors ${
                        isBistro ? "text-[#1f1c19] group-hover:text-[#b89562]" : "text-white group-hover:text-[#d4af37]"
                      }`}
                    >
                      <span>Demoyu Detaylı İncele</span>
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                        isBistro 
                          ? "border-[#1f1c19]/30 group-hover:border-[#b89562] group-hover:bg-[#b89562]/10" 
                          : "border-white/20 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10"
                      }`}>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* View All Projects Link */}
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
