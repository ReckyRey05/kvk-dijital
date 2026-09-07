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
          ? "border-white/[0.06] text-[#9498A6]"
          : "border-[#DCDDE1] text-[#626772] bg-white/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#059669]" />
        <span className="font-semibold text-inherit">Escrow Emanet Koruması</span>
      </div>

      <span className={isDark ? "text-white/10 hidden sm:inline" : "text-black/10 hidden sm:inline"}>
        &bull;
      </span>

      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-[#D99532]" />
        <span className="font-semibold text-inherit">Hızlı Satıcı Teslimatı</span>
      </div>

      <span className={isDark ? "text-white/10 hidden sm:inline" : "text-black/10 hidden sm:inline"}>
        &bull;
      </span>

      <div className="flex items-center gap-2">
        <Headphones className="w-4 h-4 text-[#626772]" />
        <span className="font-semibold text-inherit">7/24 Destek Ekibi</span>
      </div>
    </div>
  );
}
