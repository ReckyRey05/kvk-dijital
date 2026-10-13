"use client";

import React from "react";
import { ShieldCheck, Zap, Headphones } from "lucide-react";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";

export default function ItemSepetiTrustStrip() {
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";

  return (
    <div
      aria-label="Güven ve Hizmet Özeti"
      className={`flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-3 text-xs select-none border-y ${
        isDark
          ? "border-[#2A313C] text-[#8E97A4] bg-[#181C22]/50"
          : "border-[#E5E8EB] text-[#69717D] bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#0D8259]" />
        <span className="font-semibold text-inherit">Emanet Koruması</span>
      </div>

      <span className={isDark ? "text-white/10 hidden sm:inline" : "text-black/10 hidden sm:inline"}>
        &bull;
      </span>

      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-[#0F625C] dark:text-[#168B83]" />
        <span className="font-semibold text-inherit">Satıcı Değerlendirmeleri</span>
      </div>

      <span className={isDark ? "text-white/10 hidden sm:inline" : "text-black/10 hidden sm:inline"}>
        &bull;
      </span>

      <div className="flex items-center gap-2">
        <Headphones className="w-4 h-4 text-[#69717D]" />
        <span className="font-semibold text-inherit">Teslimat Bilgileri</span>
      </div>
    </div>
  );
}
