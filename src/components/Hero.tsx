"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LogoIcon } from "./Logo";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center pt-20 pb-16">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start gap-8"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-gradient">
            Modern dijital <br /> deneyimler <br /> geliştiriyoruz.
          </h1>
          <p className="text-lg text-foreground/70 max-w-lg leading-relaxed">
            KvK Digital, işletmeler için modern web siteleri, özel yazılımlar ve
            yapay zeka destekli dijital çözümler üretir.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button className="px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent/90 transition-colors flex items-center gap-2">
              Projeleri İncele
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-colors">
              İletişime Geç
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative lg:h-[600px] flex items-center justify-center perspective-[1000px]"
        >
          {/* Mockup Placeholder - Premium look */}
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-tr from-accent/20 to-transparent animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-4 rounded-[2.5rem] border border-white/10 bg-card/80 backdrop-blur-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center gap-6">
                 {/* Replaced with SVG Icon logo */}
                 <div className="relative w-32 h-32 overflow-hidden flex items-center justify-center rounded-2xl border border-white/10 shadow-2xl bg-[#0a0f0f]">
                    <LogoIcon className="w-16 h-16 text-white" />
                 </div>
                 <div className="w-3/4 h-6 bg-white/5 rounded-md" />
                 <div className="w-full h-12 bg-white/5 rounded-md mt-2" />
                 <div className="w-1/2 h-8 bg-accent/20 rounded-md mt-4" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
