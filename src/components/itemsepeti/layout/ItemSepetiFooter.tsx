"use client";

import React from "react";
import Link from "next/link";
import ItemSepetiLogo from "../ui/ItemSepetiLogo";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";

export default function ItemSepetiFooter() {
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";

  return (
    <footer
      aria-label="Site Alt Bilgisi"
      className="w-full border-t mt-16 transition-colors select-none text-xs"
      style={{
        backgroundColor: isDark ? "#101317" : "#FFFFFF",
        borderColor: isDark ? "#2A313C" : "#E5E8EB",
        color: isDark ? "#8E97A4" : "#69717D",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b"
          style={{ borderColor: isDark ? "#2A313C" : "#E5E8EB" }}
        >
          <div className="space-y-2 max-w-sm">
            <ItemSepetiLogo size="sm" />
            <p className="leading-relaxed text-xs" style={{ color: isDark ? "#8E97A4" : "#69717D" }}>
              Türkiye&apos;nin oyunculara özel, emanet korumalı oyun içi eşya, dijital kod ve oyuncu pazaryeri.
            </p>
          </div>

          <nav aria-label="Hızlı Bağlantılar" className="flex flex-wrap gap-5 text-xs" style={{ color: isDark ? "#8E97A4" : "#69717D" }}>
            <Link href="/nasil-calisir" className="hover:text-[#0F625C] dark:hover:text-[#168B83] transition-colors">
              Nasıl Çalışır?
            </Link>
            <Link href="/oyunlar" className="hover:text-[#0F625C] dark:hover:text-[#168B83] transition-colors">
              Tüm Oyunlar
            </Link>
            <Link href="/kategori/cs2" className="hover:text-[#0F625C] dark:hover:text-[#168B83] transition-colors">
              CS2 Skinleri
            </Link>
            <Link href="/kategori/metin2" className="hover:text-[#0F625C] dark:hover:text-[#168B83] transition-colors">
              Metin2 Yang
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-[#0F625C] dark:hover:text-[#168B83] transition-colors">
              Kullanım Koşulları
            </Link>
            <Link href="/gizlilik-politikasi" className="hover:text-[#0F625C] dark:hover:text-[#168B83] transition-colors">
              Gizlilik Politikası
            </Link>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#8D96A3] text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} İtemSepeti. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span>Emanet Korumalı Alışveriş</span>
            <span>&bull;</span>
            <span>256-Bit SSL Şifreleme</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
