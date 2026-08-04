export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* K harfinin sol dikey çizgisi */}
      <path d="M25 20V80" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      
      {/* K harfinin üst çapraz çizgisi */}
      <path d="M25 55L65 20" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* K harfinin alt çapraz çizgisi */}
      <path d="M45 40L65 80" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* V harfini oluşturan vurgu (Turkuaz) çapraz çizgi */}
      <path d="M65 20L85 80" stroke="#00A6A6" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoHorizontal({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon className="h-full w-auto text-white" />
      <span className="font-semibold text-xl tracking-tight text-white">
        KvK <span className="font-normal text-white/80">Dijital</span>
      </span>
    </div>
  );
}
