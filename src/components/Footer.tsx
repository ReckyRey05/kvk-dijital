import Link from "next/link";

export default function Footer() {
  return (
    <footer aria-label="Sayfa Alt Bilgisi" className="w-full mt-32 border-t border-white/5 py-12 relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="text-xl font-medium tracking-tight">KvK Dijital Çözümler</div>
          <div className="text-sm text-foreground/50">İstanbul, Türkiye</div>
        </div>
        
        <nav aria-label="Alt Bilgi Bağlantıları" className="flex flex-wrap justify-center gap-4 text-sm text-foreground/70">
          <a href="https://www.instagram.com/kvkdijitalcozumler/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors cursor-pointer py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg">Instagram</a>
          <Link href="/kvkk" className="hover:text-foreground transition-colors cursor-pointer py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg">KVKK</Link>
          <Link href="/gizlilik-politikasi" className="hover:text-foreground transition-colors cursor-pointer py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg">Gizlilik Politikası</Link>
          <Link href="/cerez-politikasi" className="hover:text-foreground transition-colors cursor-pointer py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg">Çerez Politikası</Link>
          <Link href="/kullanim-kosullari" className="hover:text-foreground transition-colors cursor-pointer py-2 px-3 inline-flex items-center min-h-[44px] rounded-lg">Kullanım Koşulları</Link>
        </nav>
        
        <div className="text-xs text-foreground/50">
          &copy; {new Date().getFullYear()} KvK Dijital Çözümler. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
