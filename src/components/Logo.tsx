import Image from "next/image";

export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <Image 
      src="/logos/KVK-Digital-Logo-Icon-Transparent.png" 
      alt="KVK Digital Icon" 
      width={100} 
      height={100} 
      className={`object-contain ${className}`}
    />
  );
}

export function LogoHorizontal({ className = "h-8" }: { className?: string }) {
  return (
    <Image 
      src="/logos/KVK-Digital-Logo-Horizontal-Transparent.png" 
      alt="KVK Digital" 
      width={1200} 
      height={320} 
      quality={100}
      priority
      className={`object-contain w-auto ${className}`}
    />
  );
}

export function LogoPrimary({ className = "h-16" }: { className?: string }) {
  return (
    <Image 
      src="/logos/KVK-Digital-Logo-Primary-Transparent.png" 
      alt="KVK Digital" 
      width={1200} 
      height={600} 
      quality={100}
      priority
      className={`object-contain w-auto ${className}`}
    />
  );
}
