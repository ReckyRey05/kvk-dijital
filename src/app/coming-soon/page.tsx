import { LogoHorizontal } from "@/components/Logo";
import { Sparkles, Mail } from "lucide-react";
import Link from "next/link";

export default function ComingSoon() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full glass-panel p-12 rounded-3xl border-accent/20 shadow-2xl shadow-accent/5">
        <div className="mb-10">
          <LogoHorizontal className="h-16 mx-auto" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-8 border border-accent/20">
          <Sparkles className="w-4 h-4" />
          <span>Sistemlerimizi Güncelliyoruz</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Sizin İçin Çok Daha İyisini <span className="text-accent">İnşa Ediyoruz</span>
        </h1>
        
        <p className="text-lg text-foreground/70 mb-12 leading-relaxed">
          KVK Digital olarak dijital altyapımızı ve projelerimizi tamamen yeniliyoruz. Yeni nesil web tasarım, özel yazılım ve yapay zeka çözümlerimizle çok yakında yayındayız.
        </p>

        <div className="w-full pt-8 border-t border-card-border/50">
          <h3 className="text-sm font-medium text-foreground/50 uppercase tracking-widest mb-6">İletişimde Kalalım</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="mailto:iletisim@kvkdijitalcozumler.com" 
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-full bg-accent text-background font-bold hover:bg-accent/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              iletisim@kvkdijitalcozumler.com
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
