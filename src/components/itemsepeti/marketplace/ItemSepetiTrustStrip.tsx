import React from "react";
import { ShieldCheck, Zap, Headphones } from "lucide-react";

export default function ItemSepetiTrustStrip() {
  return (
    <div
      aria-label="Güven ve Hizmet Özeti"
      className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-3 text-xs text-[#9498A6] border-y border-white/[0.04] select-none"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#34D399]" />
        <span className="font-medium text-inherit">Escrow koruması</span>
      </div>

      <span className="text-white/10 hidden sm:inline">&bull;</span>

      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-[#E8A33D]" />
        <span className="font-medium text-inherit">Hızlı teslim</span>
      </div>

      <span className="text-white/10 hidden sm:inline">&bull;</span>

      <div className="flex items-center gap-2">
        <Headphones className="w-4 h-4 text-[#9498A6]" />
        <span className="font-medium text-inherit">Türkçe destek</span>
      </div>
    </div>
  );
}
