"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: string;
  features: string[];
  demo_url?: string;
}

export default function Projects({ projects }: { projects: Project[] }) {
  // Use fallback if database is empty or not configured yet
  const allProjects = projects && projects.length > 0 ? projects : [
    {
      id: "demo-1",
      title: "Lüks Kuaför & Güzellik Salonu",
      category: "Hizmet Sektörü",
      features: ["Randevu Alma Sistemi", "WhatsApp Entegrasyonu", "Google Maps Desteği", "Modern Arayüz"],
    },
    {
      id: "demo-2",
      title: "Premium Restoran & Kafe",
      category: "Yeme İçme",
      features: ["Dijital Menü Sistemi", "QR Menü Özelliği", "Online Rezervasyon", "Mobil Uyumluluk"],
    },
    {
      id: "demo-3",
      title: "Sanayi & İnşaat Şirketi",
      category: "Kurumsal",
      features: ["Gelişmiş İletişim Formları", "Detaylı Proje Sergileme", "Kurumsal Tasarım", "Hızlı Yükleme"],
    },
    {
      id: "demo-4",
      title: "Özel Anı & Sevgili Sitesi",
      category: "Kişisel / Eğlence",
      features: ["Romantik Tasarım", "Anı ve Fotoğraf Galerisi", "Özel Tarih Geri Sayımı", "Şifreli Erişim"],
    },
    {
      id: "demo-5",
      title: "Modern E-Ticaret Platformu",
      category: "E-Ticaret",
      features: ["Sanal POS Entegrasyonu", "Gelişmiş Filtreleme", "Kargo Takip Sistemi", "İndirim Kuponları"],
    },
    {
      id: "demo-6",
      title: "Premium Diş Kliniği",
      category: "Sağlık & Medikal",
      features: ["Online Randevu Sistemi", "Öncesi/Sonrası Galerisi", "WhatsApp Danışma Hattı", "Doktor Profilleri"],
    },
    {
      id: "demo-7",
      title: "Lüks Gayrimenkul & Emlak",
      category: "Emlak",
      features: ["Gelişmiş İlan Filtreleme", "Harita Üzerinde Arama", "Sanal Tur Desteği", "Danışman Profilleri"],
    },
    {
      id: "demo-8",
      title: "Butik Otel Rezervasyon",
      category: "Turizm",
      features: ["Odalar ve Müsaitlik Takvimi", "Online Ödeme Altyapısı", "Çoklu Dil Desteği (TR/EN)", "Müşteri Yorumları"],
    },
    {
      id: "demo-9",
      title: "Online Akademi & Kurs",
      category: "Eğitim",
      features: ["Öğrenci Üyelik Paneli", "Video Ders İzleme Modülü", "Online Sınav/Test Sistemi", "Sertifika Üretimi"],
    }
  ];

  const categories = ["Tümü", ...Array.from(new Set(allProjects.map(p => p.category)))];
  
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [currentIndex, setCurrentIndex] = useState(0);

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const filteredProjects = activeCategory === "Tümü" 
    ? allProjects 
    : allProjects.filter(p => p.category === activeCategory);

  // Auto-slide effect
  useEffect(() => {
    if (filteredProjects.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredProjects.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [filteredProjects.length, currentIndex]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  return (
    <section id="projects" className="w-full py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Seçkin Projeler</h2>
            <p className="text-foreground/50 max-w-md">
              Her detayı özenle tasarlanmış, yüksek performanslı dijital deneyimler.
            </p>
          </div>
          
          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap md:justify-start md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border snap-start shrink-0 ${
                  activeCategory === category 
                    ? "bg-accent/20 border-accent/50 text-accent" 
                    : "bg-card border-card-border text-foreground/70 hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="relative w-full">
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 && (
              <motion.div
                key={filteredProjects[currentIndex].id || filteredProjects[currentIndex].title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    setCurrentIndex((prev) => (prev + 1) % filteredProjects.length);
                  } else if (swipe > swipeConfidenceThreshold) {
                    setCurrentIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
                  }
                }}
                className="group relative w-full rounded-3xl overflow-hidden bg-card border border-card-border touch-pan-y"
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Content Side */}
                  <div className="p-8 md:p-12 md:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-r border-card-border/50">
                    <div>
                      <span className="text-accent text-sm font-medium tracking-wider uppercase mb-4 block">
                        {filteredProjects[currentIndex].category}
                      </span>
                      <h3 className="text-3xl font-semibold mb-8">{filteredProjects[currentIndex].title}</h3>
                      
                      <ul className="space-y-3 mb-12">
                        {filteredProjects[currentIndex].features.map(f => (
                          <li key={f} className="flex items-center gap-3 text-foreground/70 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button className="flex items-center gap-3 text-foreground font-medium group-hover:text-accent transition-colors w-fit">
                      Canlı Demoyu Gör
                      <div className="w-10 h-10 rounded-full border border-card-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                         <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>

                  {/* Image Placeholder Side */}
                  <div className="md:w-2/3 min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-[#0a0f0f] to-[#050505] relative overflow-hidden flex items-center justify-center p-12">
                     <div className="w-full max-w-2xl aspect-[16/10] rounded-xl border border-white/10 bg-black/50 shadow-2xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                        {/* Web UI Mockup placeholder */}
                        <div className="w-full h-8 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                        </div>
                        <div className="p-8 w-full h-full relative">
                          <div className="w-3/4 h-12 bg-white/5 rounded-lg mb-4" />
                          <div className="w-1/2 h-6 bg-white/5 rounded-md mb-12" />
                          <div className="grid grid-cols-3 gap-4">
                            <div className="w-full h-32 bg-white/5 rounded-lg" />
                            <div className="w-full h-32 bg-white/5 rounded-lg" />
                            <div className="w-full h-32 bg-accent/10 rounded-lg border border-accent/20" />
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Slider Indicators */}
          {filteredProjects.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {filteredProjects.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className="w-10 h-10 flex items-center justify-center -mx-2"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "w-6 bg-accent" : "w-2 bg-white/20 group-hover:bg-white/40"
                  }`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link href="/projeler" className="inline-flex items-center gap-2 text-accent font-medium hover:text-white transition-colors group">
            Tüm Projeleri İncele 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
