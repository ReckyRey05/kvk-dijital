import Link from "next/link";
import { LogoHorizontal } from "./Logo";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="relative block">
          <LogoHorizontal className="h-14" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
          <Link href="#" className="hover:text-accent transition-colors">Hakkımda</Link>
          <Link href="#" className="hover:text-accent transition-colors">Hizmetler</Link>
          <Link href="#" className="hover:text-accent transition-colors">Projeler</Link>
          <button className="px-5 py-2.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20">
            İletişime Geç
          </button>
        </nav>
      </div>
    </header>
  );
}
