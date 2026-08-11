"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    }
  ];

  const categories = ["Tümü", ...Array.from(new Set(allProjects.map(p => p.category)))];
  
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [currentIndex, setCurrentIndex] = useState(0);

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
    <section className="w-full py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Seçkin Projeler</h2>
            <p className="text-foreground/50 max-w-md">
              Her detayı özenle tasarlanmış, yüksek performanslı dijital deneyimler.
            </p>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
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
                className="group relative w-full rounded-3xl overflow-hidden bg-card border border-card-border"
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
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "w-6 bg-accent" : "bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
