"use client";

import { motion } from "framer-motion";
import { Laptop, Code2, Sparkles, ShoppingCart } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
}

export default function Services({ services }: { services: Service[] }) {
  const displayServices = services && services.length > 0 ? services : [
    {
      id: "demo-1",
      title: "Web Tasarım",
      description: "Modern, hızlı ve mobil uyumlu web siteleri.",
      icon: Laptop
    },
    {
      id: "demo-2",
      title: "Özel Yazılım",
      description: "İşletmelere özel dijital sistemler.",
      icon: Code2
    },
    {
      id: "demo-3",
      title: "AI Çözümleri",
      description: "Yapay zeka destekli otomasyon ve araçlar.",
      icon: Sparkles
    },
    {
      id: "demo-4",
      title: "E-Ticaret",
      description: "Modern online satış deneyimleri.",
      icon: ShoppingCart
    },
  ];

  return (
    <section className="w-full py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold">Hizmetler</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((service, index) => (
            <motion.div
              key={service.id || service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel p-8 group hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 mb-6 relative overflow-hidden flex items-center justify-center text-accent">
                 <div className="absolute inset-0 bg-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                 {service.icon ? <service.icon className="w-6 h-6 relative z-10" /> : null}
              </div>
              <h3 className="text-xl font-medium mb-3">{service.title}</h3>
              <p className="text-foreground/50">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
