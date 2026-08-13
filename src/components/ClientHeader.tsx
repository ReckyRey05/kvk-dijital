"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientHeader() {
  const pathname = usePathname();

  // Admin, Yapım Aşamasında ve Konsept Demo rotalarında ana site Header'ını gizle
  if (pathname?.startsWith("/admin") || pathname === "/yakinda-buradayiz" || pathname?.endsWith("-demo")) {
    return null;
  }

  return <Header />;
}
