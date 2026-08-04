export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-12 relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-xl font-medium tracking-tight">KvK Digital</div>
        
        <div className="flex gap-8 text-sm text-foreground/50">
          <span className="hover:text-foreground transition-colors cursor-pointer">Web Development</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">AI Solutions</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Digital Experiences</span>
        </div>
        
        <div className="text-xs text-foreground/30">
          &copy; {new Date().getFullYear()} KvK Digital. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
