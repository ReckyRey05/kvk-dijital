"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoHorizontal } from "./Logo";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Header() {
  const pathname = usePathname() || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("iletisim") || document.getElementById("contact");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isHakkimizdaActive = pathname === "/hakkimizda";
  const isHizmetlerActive = pathname === "/hizmetler" || pathname.startsWith("/web-tasarim") || pathname.startsWith("/kurumsal-web-tasarim") || pathname.startsWith("/e-ticaret-web-sitesi") || pathname.startsWith("/ozel-yazilim");
  const isProjelerActive = pathname.startsWith("/projeler");
  const isBlogActive = pathname === "/blog" || pathname.startsWith("/blog/");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" onClick={handleLogoClick} className="relative inline-flex items-center min-h-[48px] min-w-[48px] py-1 px-1" aria-label="Ana Sayfa">
          <LogoHorizontal className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Ana Navigasyon" className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/70">
          <Link 
            href="/hakkimizda" 
            className={`py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg transition-colors hover:text-accent ${isHakkimizdaActive ? "text-accent font-semibold" : ""}`}
          >
            Hakkımda
          </Link>
          <Link 
            href="/hizmetler" 
            className={`py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg transition-colors hover:text-accent ${isHizmetlerActive ? "text-accent font-semibold" : ""}`}
          >
            Hizmetler
          </Link>
          <Link 
            href="/projeler" 
            className={`py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg transition-colors hover:text-accent ${isProjelerActive ? "text-accent font-semibold" : ""}`}
          >
            Projeler
          </Link>
          <Link 
            href="/blog" 
            className={`py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg transition-colors hover:text-accent ${isBlogActive ? "text-accent font-semibold" : ""}`}
          >
            Blog
          </Link>
          <Link 
            href="/#iletisim" 
            onClick={handleContactClick}
            className="px-5 py-2.5 inline-flex items-center min-h-[44px] rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20 font-semibold"
          >
            İletişime Geç
          </Link>
        </nav>

        {/* Mobile Controls & Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <Link 
            href="/#iletisim" 
            onClick={handleContactClick}
            className="px-4 py-2 inline-flex items-center min-h-[44px] rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20 text-xs font-semibold"
          >
            İletişime Geç
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mobil Menü Aç/Kapat"
            className="p-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-foreground/80 hover:text-white transition-colors rounded-xl bg-white/5 border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 border-b border-white/10 backdrop-blur-2xl px-6 py-6 space-y-4 shadow-2xl animate-fade-in">
          <nav aria-label="Mobil Navigasyon" className="flex flex-col space-y-3">
            <Link 
              href="/hakkimizda" 
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${isHakkimizdaActive ? "bg-accent/10 text-accent font-semibold" : "text-foreground/80 hover:bg-white/5"}`}
            >
              Hakkımda
            </Link>
            <Link 
              href="/hizmetler" 
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${isHizmetlerActive ? "bg-accent/10 text-accent font-semibold" : "text-foreground/80 hover:bg-white/5"}`}
            >
              Hizmetler
            </Link>
            <Link 
              href="/projeler" 
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${isProjelerActive ? "bg-accent/10 text-accent font-semibold" : "text-foreground/80 hover:bg-white/5"}`}
            >
              Projeler
            </Link>
            <Link 
              href="/blog" 
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${isBlogActive ? "bg-accent/10 text-accent font-semibold" : "text-foreground/80 hover:bg-white/5"}`}
            >
              Blog
            </Link>
            <Link 
              href="/#iletisim" 
              onClick={handleContactClick}
              className="py-2.5 px-4 rounded-xl bg-accent text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-between mt-2"
            >
              <span>Teklif & İletişim</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

