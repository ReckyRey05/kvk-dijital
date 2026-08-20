"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientHeader() {
  const pathname = usePathname();

  // Admin, Yapım Aşamasında, Konsept Demo, QR Menü ve Restoran POS rotalarında ana site Header'ını gizle
  if (
    pathname?.startsWith("/admin") ||
    pathname === "/yakinda-buradayiz" ||
    pathname?.endsWith("-demo") ||
    pathname?.startsWith("/restoran") ||
    pathname?.startsWith("/qr")
  ) {
    return null;
  }

  return <Header />;
}
