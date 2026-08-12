"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientHeader() {
  const pathname = usePathname();

  // Admin ve Ana Sayfa (Yapım Aşamasında) rotalarında Header'ı gizle
  if (pathname?.startsWith("/admin") || pathname === "/yakinda-buradayiz") {
    return null;
  }

  return <Header />;
}
