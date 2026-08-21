import { LogoHorizontal } from "@/components/Logo";
import { Wrench, Mail, MessageCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistemlerimiz Bakımda | KvK Dijital Çözümler",
  description: "Sizlere daha iyi bir deneyim sunmak için sistemlerimizi ve altyapımızı güncelliyoruz. Kısa süre içinde tekrar birlikteyiz.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background">
      {/* Background Atmosphere & Radial Glows */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:40px_40px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-accent/15 rounded-full blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full glass-panel p-8 sm:p-12 rounded-3xl border-accent/20 shadow-2xl shadow-accent/5 backdrop-blur-xl">
        {/* Brand Logo */}
        <div className="mb-8">
          <LogoHorizontal className="h-12 sm:h-16 mx-auto" />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-xs sm:text-sm mb-6 border border-accent/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          <Wrench className="w-3.5 h-3.5" />
          <span>Planlı Bakım & Altyapı Yenileme</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 tracking-tight text-foreground">
          Biz de <span className="text-accent">Sizi Özledik!</span>
        </h1>

        {/* Maintenance Message */}
        <p className="text-sm sm:text-base md:text-lg text-foreground/75 mb-8 leading-relaxed max-w-xl">
          Sizlere daha hızlı, modern ve kesintisiz bir dijital deneyim sunabilmek amacıyla sistemlerimizi ve sunucu altyapımızı kapsamlı bir bakıma aldık. Çok kısa bir süre içerisinde yepyeni teknolojilerimiz ve güçlendirilmiş kurumsal çözümlerimizle tekrar yayında olacağız.
        </p>

        {/* Info Box */}
        <div className="w-full bg-card/40 border border-card-border/60 rounded-2xl p-4 sm:p-5 mb-8 text-xs sm:text-sm text-foreground/70 flex items-center justify-center gap-3">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent shrink-0" />
          <span>Acil web tasarım, yazılım ve teknik destek talepleriniz için ekibimiz kesintisiz hizmet vermektedir.</span>
        </div>

        {/* Contact CTA Section */}
        <div className="w-full pt-6 border-t border-card-border/50">
          <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-widest mb-4">Bize Ulaşın</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full">
            <Link
              href="https://wa.me/905348914905"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/20"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp İletişim Hattı</span>
            </Link>

            <Link
              href="mailto:iletisim@kvkdijitalcozumler.com"
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-card hover:bg-card-border/40 text-foreground font-semibold text-sm border border-card-border transition-all"
            >
              <Mail className="w-4 h-4 text-accent shrink-0" />
              <span className="truncate">iletisim@kvkdijitalcozumler.com</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
