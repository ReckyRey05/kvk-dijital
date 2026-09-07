"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientHeader() {
  const pathname = usePathname();

  // Admin, Konsept Demo, Pomak Lazer, QR Menü ve Restoran POS rotalarında ana site Header'ını gizle
  if (
    pathname?.startsWith("/admin") ||
    pathname === "/yakinda-buradayiz" ||
    pathname?.endsWith("-demo") ||
    pathname?.startsWith("/projeler/pomak-lazer") ||
    pathname?.startsWith("/projeler/amasya-altin-safran") ||
    pathname?.startsWith("/projeler/damla-akarsu") ||
    pathname?.startsWith("/restoran") ||
    pathname?.startsWith("/qr") ||
    pathname?.startsWith("/teklink") ||
    pathname?.startsWith("/f/") ||
    pathname?.startsWith("/teklifim-gelsin") ||
    pathname?.startsWith("/etiketle") ||
    pathname?.startsWith("/e/") ||
    pathname?.startsWith("/itemsepeti") ||
    pathname?.startsWith("/kategori") ||
    pathname?.startsWith("/ilan") ||
    pathname?.startsWith("/nasil-calisir")
  ) {
    return null;
  }

  return <Header />;
}
