"use client";

import Link from "next/link";
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
              Kodlara dökülen vizyon, <br />
              <span className="text-accent">şeffaf ve kusursuz dijital deneyimler.</span>
            </h2>
            <div className="text-foreground/70 text-lg leading-relaxed max-w-3xl space-y-6">
              <p>
                Merhaba, ben <strong className="text-foreground font-medium">Ali Haydar Kavak</strong>. Çocukluk yıllarımda bilgisayar sistemlerine duyduğum merak, detaycı kişiliğimle birleşerek beni web teknolojilerinin dünyasına çekti. <strong>KVK Dijital Çözümler'in</strong> kurucusu olarak amacım sadece estetik web siteleri teslim edip süreci bitirmek değil; aynı zamanda <strong>İstanbul, Kocaeli, Sakarya</strong> ve tüm Türkiye'deki işletmelerin <strong>dijital büyüme danışmanı</strong> olmaktır.
              </p>
              
              <div className="pt-4">
                <Link href="/hakkimizda" className="inline-flex items-center gap-2 text-accent font-medium hover:text-white transition-colors group">
                  Hikayemi Oku 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
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
