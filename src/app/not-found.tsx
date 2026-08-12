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
          
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-12">
            <span className="text-[140px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 opacity-80 select-none">
              4
            </span>
            
            <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0 mt-4">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/10 flex items-center justify-center bg-[#050505]">
                {/* Spinning Inner Compass */}
                <Compass className="w-16 h-16 md:w-20 md:h-20 text-accent animate-[spin_6s_linear_infinite]" strokeWidth={1.5} />
              </div>

              {/* N (Top) = K */}
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-bold text-lg md:text-xl text-accent">
                K
              </span>
              
              {/* E (Right) = V */}
              <span className="absolute top-1/2 -right-4 -translate-y-1/2 font-bold text-lg md:text-xl text-accent">
                V
              </span>
              
              {/* S (Bottom) = K */}
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-bold text-lg md:text-xl text-accent">
                K
              </span>
              
              {/* W (Left) = Logo */}
              <img 
                src="/logos/KvK-Digital-Logo-Icon-Transparent.png" 
                alt="KvK Logo" 
                className="absolute top-1/2 -left-6 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 object-contain opacity-90 drop-shadow-[0_0_15px_rgba(var(--accent),0.5)]" 
              />
            </div>

            <span className="text-[140px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 opacity-80 select-none">
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
