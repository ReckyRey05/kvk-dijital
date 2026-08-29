"use client";

import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Hide on admin panel, restaurant pos, qr menu and pomak lazer demo
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/restoran") ||
    pathname?.startsWith("/qr") ||
    pathname?.startsWith("/projeler/pomak-lazer") ||
    pathname?.startsWith("/projeler/amasya-altin-safran") ||
    pathname?.startsWith("/projeler/damla-akarsu")
  ) {
    return null;
  }

  const whatsappMessage = encodeURIComponent(
    "Merhaba KvK Dijital Çözümler, web sitesi projeleriniz ve hizmetleriniz hakkında bilgi almak istiyorum."
  );
  const whatsappUrl = `https://wa.me/905348914905?text=${whatsappMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp üzerinden anında iletişime geçin"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 text-white font-semibold text-xs tracking-wide shadow-2xl hover:bg-emerald-500 hover:scale-105 transition-all duration-300 border border-emerald-400/30 group cursor-pointer"
    >
      <div className="relative flex items-center justify-center">
        <MessageSquare className="w-5 h-5 fill-white/20 text-white" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping opacity-75" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300" />
      </div>
      <span className="hidden sm:inline font-bold">WhatsApp İletişim</span>
    </a>
  );
}
