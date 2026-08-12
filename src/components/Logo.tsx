import Image from "next/image";

export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <Image 
      src="/logos/KvK-Digital-Logo-Icon-Transparent.webp" 
      alt="KvK Dijital Çözümler" 
      width={270}
      height={185}
      className={`object-contain ${className}`}
      sizes="(max-width: 768px) 40px, 40px"
    />
  );
}

export function LogoHorizontal({ className = "h-8" }: { className?: string }) {
  return (
    <Image 
      src="/logos/KvK-Digital-Logo-Horizontal-Transparent.webp" 
      alt="KvK Dijital Çözümler" 
      width={645}
      height={190}
      priority
      fetchPriority="high"
      // sizes: Header'da h-14 gösteriliyor (~56px yükseklik), genişlik otomatik ~190px
      // 2x retina = ~380px, kaynak 645px yeterli
      sizes="(max-width: 768px) 160px, 220px"
      className={`object-contain w-auto ${className}`}
    />
  );
}

export function LogoPrimary({ className = "h-16" }: { className?: string }) {
  return (
    <Image 
      src="/logos/KvK-Digital-Logo-Primary-Transparent.webp" 
      alt="KvK Dijital Çözümler" 
      width={810}
      height={485}
      priority
      sizes="(max-width: 768px) 200px, 300px"
      className={`object-contain w-auto ${className}`}
    />
  );
}

export function LogoCircle({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <Image 
      src="/logos/KvK-Digital-Logo-Circle-Transparent.webp" 
      alt="KvK Dijital Çözümler" 
      width={295}
      height={255}
      className={`object-contain ${className}`}
      sizes="64px"
    />
  );
}
