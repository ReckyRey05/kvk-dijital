"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientHeader() {
  const pathname = usePathname();

  // Bakım modunda veya özel rotalarda Header'ı gizle
  if (
    pathname === "/" ||
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
