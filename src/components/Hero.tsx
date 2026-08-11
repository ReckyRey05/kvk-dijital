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
        <div className="flex flex-col items-start gap-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-gradient">
            İstanbul'un yeni nesil <br /> web tasarım ve <br /> yazılım ajansı.
          </h1>
          <p className="text-lg text-foreground/70 max-w-lg leading-relaxed">
            KvK Dijital Çözümler, işletmeniz için modern web siteleri, özel yazılımlar ve e-ticaret sistemleri geliştirerek markanızı büyütür.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-full bg-accent text-[#050505] font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              Projeleri İncele
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-colors"
            >
              İletişime Geç
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative lg:h-[600px] flex items-center justify-center perspective-[1000px]"
        >
          {/* Premium Animated Web Design Concept */}
          <div className="relative w-full max-w-lg aspect-square">
            {/* Background Glow */}
            <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-tr from-accent/20 to-transparent animate-[spin_15s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-white/5 bg-gradient-to-bl from-blue-500/10 to-transparent animate-[spin_20s_linear_infinite_reverse]" />
            
            {/* Main Central Dashboard Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] rounded-[2rem] border border-white/10 bg-background/60 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Fake Browser Top Bar */}
              <div className="w-full h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="mx-auto w-1/3 h-4 rounded-full bg-white/10" />
              </div>
              
              {/* Dashboard Content Skeleton */}
              <div className="flex-1 p-6 flex flex-col gap-6 relative">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/40 to-accent/10 flex items-center justify-center border border-accent/20">
                    <LogoIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-16 h-8 rounded-full bg-white/5" />
                    <div className="w-8 h-8 rounded-full bg-accent/20" />
                  </div>
                </div>
                
                {/* Charts / Data */}
                <div className="flex gap-4 h-24">
                  <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                    <div className="w-1/2 h-2 bg-white/10 rounded-full" />
                    <div className="w-3/4 h-8 bg-accent/20 rounded-md" />
                  </div>
                  <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                    <div className="w-1/2 h-2 bg-white/10 rounded-full" />
                    <div className="w-full h-8 bg-blue-500/20 rounded-md" />
                  </div>
                </div>
                
                {/* List */}
                <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3">
                  <div className="w-full h-4 bg-white/10 rounded-full" />
                  <div className="w-[85%] h-4 bg-white/10 rounded-full" />
                  <div className="w-[60%] h-4 bg-accent/30 rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Floating Element 1 - Code Snippet */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -right-4 top-16 p-4 rounded-2xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] text-foreground/50 font-mono">React Component</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="text-blue-400">export default <span className="text-purple-400">function</span> <span className="text-yellow-200">App</span>() {'{'}</div>
                <div className="text-foreground/70 pl-4">return (</div>
                <div className="text-green-400 pl-8">&lt;KvKDigital /&gt;</div>
                <div className="text-foreground/70 pl-4">);</div>
                <div className="text-blue-400">{'}'}</div>
              </div>
            </motion.div>

            {/* Floating Element 2 - SEO Score */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -left-6 bottom-24 p-4 rounded-2xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-4"
            >
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold">
                100
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none" className="text-green-500/20" />
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="138" strokeDashoffset="0" className="text-green-500" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">SEO & Hız</div>
                <div className="text-[10px] text-foreground/50">Lighthouse Skoru</div>
              </div>
            </motion.div>
            
            {/* Floating Element 3 - Mobile Badge */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute right-12 -bottom-4 px-4 py-2 rounded-full bg-accent/10 backdrop-blur-xl border border-accent/20 text-accent text-xs font-semibold shadow-2xl flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              %100 Mobil Uyumlu
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
