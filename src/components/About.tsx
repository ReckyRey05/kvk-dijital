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
              Kodlara dökülen vizyon, <br />
              <span className="text-accent">şeffaf ve kusursuz dijital deneyimler.</span>
            </h2>
            <div className="text-foreground/70 text-lg leading-relaxed max-w-3xl space-y-6">
              <p>
                Merhaba, ben <strong className="text-foreground font-medium">Ali Haydar Kavak</strong>. Çocukluk yıllarımda bilgisayar sistemlerine duyduğum merak, detaycı kişiliğimle birleşerek beni web teknolojilerinin dünyasına çekti. Kendi araştırmalarımla attığım bu ilk adımları, <strong>BTK Akademi</strong>'den aldığım eğitimler ve edindiğim sertifikalarla profesyonel bir temele oturttum. Sonrasında ise bitmek bilmeyen teknoloji tutkumla kendimi sürekli geliştirmeye devam ettim.
              </p>
              <p>
                İşimdeki en büyük prensibim <strong>mükemmeliyetçilik ve dürüstlüktür.</strong> Her projeyi en ince detayına kadar kurgularım. Şeffaf ve hızlı iletişime inanırım; benim dünyamda "2 olan bir şeye asla 1 denmez", süreç neyi gerektiriyorsa odur. Samimi yaklaşımımla öncelikle insanların dertlerini dinler, sonra bu sorunlara nokta atışı dijital çözümler üretirim.
              </p>
              <p>
                KVK Digital'i kurarken amacım sadece estetik web siteleri teslim edip süreci bitirmek değildi; aynı zamanda markaların <strong>dijital büyüme danışmanı</strong> olmaktı. İşinize sizin kadar değer veren, şeffaf ve teknolojiye tutkulu bir partner arıyorsanız, vizyonunuzu birlikte koda dökmeye hazırım.
              </p>
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
