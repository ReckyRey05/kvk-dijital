import Image from "next/image";

export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <Image 
      src="/logos/kvk-digital-logo-icon-transparent.webp" 
      alt="KvK Dijital Çözümler" 
      width={270}
      height={185}
      className={`object-contain ${className}`}
      sizes="160px"
    />
  );
}

export function LogoHorizontal({ className = "h-8" }: { className?: string }) {
  return (
    <Image 
      src="/logos/kvk-digital-logo-horizontal-transparent.webp" 
      alt="KvK Dijital Çözümler" 
      width={645}
      height={190}
      priority
      fetchPriority="high"
      sizes="(max-width: 768px) 360px, 640px"
      className={`object-contain w-auto ${className}`}
    />
  );
}

export function LogoPrimary({ className = "h-16" }: { className?: string }) {
  return (
    <Image 
      src="/logos/kvk-digital-logo-primary-transparent.webp" 
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
      src="/logos/kvk-digital-logo-circle-transparent.webp" 
      alt="KvK Dijital Çözümler" 
      width={295}
      height={255}
      className={`object-contain ${className}`}
      sizes="64px"
    />
  );
}
