import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-32 border-t border-white/5 py-12 relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="text-xl font-medium tracking-tight">KvK Dijital Çözümler</div>
          <div className="text-sm text-foreground/50">İstanbul, Türkiye</div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm text-foreground/70">
          <Link href="/kvkk" className="hover:text-foreground transition-colors cursor-pointer p-2 -m-2">KVKK</Link>
          <Link href="/gizlilik-politikasi" className="hover:text-foreground transition-colors cursor-pointer p-2 -m-2">Gizlilik Politikası</Link>
        </div>
        
        <div className="text-xs text-foreground/50">
          &copy; {new Date().getFullYear()} KvK Dijital Çözümler. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
