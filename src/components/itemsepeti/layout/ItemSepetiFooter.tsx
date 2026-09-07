import React from "react";
import Link from "next/link";
import ItemSepetiLogo from "../ui/ItemSepetiLogo";

export default function ItemSepetiFooter() {
  return (
    <footer
      aria-label="Site Alt Bilgisi"
      className="w-full border-t mt-20 transition-colors select-none text-xs"
      style={{
        backgroundColor: "rgba(18, 20, 26, 0.4)",
        borderColor: "#282C3A",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#282C3A]/60">
          <div className="space-y-2 max-w-sm">
            <ItemSepetiLogo size="sm" />
            <p className="text-[#9498A6] leading-relaxed">
              Türkiye&apos;nin oyunculara özel, emanet (escrow) korumalı oyun içi eşya, dijital kod ve hesap pazaryeri.
            </p>
          </div>

          <nav aria-label="Hızlı Bağlantılar" className="flex flex-wrap gap-6 text-[#9498A6]">
            <Link href="/nasil-calisir" className="hover:text-inherit transition-colors">
              Nasıl Çalışır?
            </Link>
            <Link href="/kategori/cs2" className="hover:text-inherit transition-colors">
              CS2 Skinleri
            </Link>
            <Link href="/kategori/metin2" className="hover:text-inherit transition-colors">
              Metin2 Yang
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-inherit transition-colors">
              Kullanım Koşulları
            </Link>
            <Link href="/gizlilik-politikasi" className="hover:text-inherit transition-colors">
              Gizlilik Politikası
            </Link>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#9498A6] text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} İtemSepeti. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span>Escrow Korumalı Alışveriş</span>
            <span>&bull;</span>
            <span>256-Bit SSL Şifreleme</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
