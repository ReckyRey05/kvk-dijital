"use client";

import { motion } from "framer-motion";
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
  const displayProjects = projects && projects.length > 0 ? projects : [
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

  return (
    <section className="w-full py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex justify-between items-end"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Seçkin Projeler</h2>
            <p className="text-foreground/50 max-w-md">
              Her detayı özenle tasarlanmış, yüksek performanslı dijital deneyimler.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {displayProjects.map((project, index) => (
            <motion.div
              key={project.id || project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className="group relative w-full rounded-3xl overflow-hidden bg-card border border-card-border"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Content Side */}
                <div className="p-8 md:p-12 md:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-r border-card-border/50">
                  <div>
                    <span className="text-accent text-sm font-medium tracking-wider uppercase mb-4 block">
                      {project.category}
                    </span>
                    <h3 className="text-3xl font-semibold mb-8">{project.title}</h3>
                    
                    <ul className="space-y-3 mb-12">
                      {project.features.map(f => (
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

                {/* Image Placeholder Side - Apple Product Style */}
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
          ))}
        </div>
      </div>
    </section>
  );
}
