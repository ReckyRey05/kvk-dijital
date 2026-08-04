"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientHeader() {
  const pathname = usePathname();

  // Admin rotalarında Header'ı gizle
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Header />;
}
