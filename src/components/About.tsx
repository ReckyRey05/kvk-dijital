"use client";

import { motion } from "framer-motion";
import { Code2, Cpu, Layout, Zap } from "lucide-react";

const cards = [
  {
    title: "Modern Web Geliştirme",
    icon: Code2,
  },
  {
    title: "AI Destekli Çözümler",
    icon: Cpu,
  },
  {
    title: "Kullanıcı Deneyimi",
    icon: Layout,
  },
  {
    title: "Hızlı Prototipleme",
    icon: Zap,
  },
];

export default function About() {
  return (
    <section className="w-full py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              Teknoloji ile fikirleri <br />
              <span className="text-accent">dijitale dönüştürüyorum.</span>
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed max-w-2xl">
              Ben Ali Haydar Kavak. KvK Digital'in kurucusu olarak, işletmelerin dijital 
              dünyada öne çıkması için modern teknolojilerle estetik ve işlevsel çözümler
              geliştiriyorum. Yüksek performanslı ve ölçeklenebilir sistemler inşa etmek tutkum.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-lg">{card.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
