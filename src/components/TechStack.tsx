"use client";

import { motion } from "framer-motion";

const technologies = [
  "Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", 
  "Figma", "WordPress", "Firebase", "PostgreSQL", "Vercel",
  "Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", 
  "Figma", "WordPress", "Firebase", "PostgreSQL", "Vercel"
];

export default function TechStack() {
  return (
    <section className="w-full py-16 relative overflow-hidden bg-background/50 border-y border-white/5">
      <div className="container mx-auto px-6 mb-8 text-center">
        <p className="text-sm font-medium text-accent tracking-widest uppercase mb-2">Kullandığımız Teknolojiler</p>
        <h2 className="text-2xl md:text-3xl font-semibold">Modern ve Güçlü Altyapı</h2>
      </div>

      <div className="w-full flex overflow-hidden group">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20,
          }}
          className="flex whitespace-nowrap gap-12 px-6"
        >
          {technologies.map((tech, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-center text-xl md:text-2xl font-bold text-foreground/60 hover:text-accent transition-colors duration-300"
            >
              {tech}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
