import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı | 404",
  robots: {
    index: false,
    follow: false,
  }
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] text-foreground selection:bg-accent/30 selection:text-accent font-sans flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center relative overflow-hidden py-32">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[400px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
            <span className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 opacity-80 select-none">
              4
            </span>
            <div className="w-24 h-24 md:w-32 md:h-32 bg-[#050505] border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(var(--accent),0.1)] shrink-0">
              <Compass className="w-12 h-12 md:w-16 md:h-16 text-accent animate-[spin_4s_linear_infinite]" />
            </div>
            <span className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 opacity-80 select-none">
              4
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Kaybolmuş <span className="text-accent">Gibi Görünüyorsunuz</span>
          </h2>
          
          <p className="text-foreground/60 max-w-md mx-auto mb-10 text-lg">
            Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir. 
            Dijital dünyada bazen böyle şeyler olur.
          </p>
          
          <Link 
            href="/" 
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-accent hover:text-black transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(200,200,200,0.3)] hover:-translate-y-1"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Ana Sayfaya Dön
          </Link>
          
        </div>
      </div>

      <Footer />
    </main>
  );
}
