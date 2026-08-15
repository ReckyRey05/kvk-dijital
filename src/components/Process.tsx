"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Analiz",
  },
  {
    num: "02",
    title: "Tasarım ve Geliştirme",
  },
  {
    num: "03",
    title: "Yayınlama ve Destek",
  },
];

export default function Process() {
  return (
    <section className="w-full py-24 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex flex-col gap-6 relative"
            >
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-24 right-0 h-px bg-gradient-to-r from-card-border to-transparent" />
              )}
              
              <div className="text-7xl font-light text-white/40 tracking-tighter select-none" aria-hidden="true">
                {step.num}
              </div>
              <h3 className="text-2xl font-medium text-foreground/90">
                {step.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
