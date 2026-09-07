import React from "react";
import { Star, ShieldCheck, Zap, Package } from "lucide-react";
import { ItemSepetiDeliveryMethod } from "@/types/marketplace";

// 1. PRICE PRIMITIVE
export function ItemSepetiPrice({ amount, currency = "TL", size = "md" }: { amount: number; currency?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-xs font-bold",
    md: "text-sm sm:text-base font-extrabold",
    lg: "text-lg sm:text-xl font-black",
  };

  return (
    <span className={`inline-flex items-baseline text-[#E8A33D] tracking-tight ${sizeClasses[size]}`}>
      <span>{amount.toLocaleString("tr-TR")}</span>
      <span className="text-[10px] sm:text-xs font-semibold ml-1 opacity-90">{currency}</span>
    </span>
  );
}

// 2. RATING PRIMITIVE
export function ItemSepetiRating({ score, count }: { score: number; count?: number }) {
  return (
    <div className="inline-flex items-center gap-1 text-xs select-none">
      <Star className="w-3.5 h-3.5 fill-[#E8A33D] text-[#E8A33D]" aria-hidden="true" />
      <span className="font-bold text-inherit">{score.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-[#9498A6] text-[11px]">({count})</span>
      )}
    </div>
  );
}

// 3. STOCK BADGE
export function ItemSepetiStockBadge({ stock }: { stock: number }) {
  const inStock = stock > 0;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-semibold border"
      style={{
        backgroundColor: inStock ? "rgba(52, 211, 153, 0.12)" : "rgba(248, 113, 113, 0.12)",
        borderColor: inStock ? "rgba(52, 211, 153, 0.25)" : "rgba(248, 113, 113, 0.25)",
        color: inStock ? "#34D399" : "#F87171",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: inStock ? "#34D399" : "#F87171" }} />
      <span>{inStock ? `${stock} adet stokta` : "Tükendi"}</span>
    </span>
  );
}

// 4. DELIVERY BADGE
export function ItemSepetiDeliveryBadge({ method, slaHours }: { method: ItemSepetiDeliveryMethod; slaHours?: number }) {
  const isAuto = method === "AUTOMATIC_CODE";

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-semibold border"
      style={{
        backgroundColor: isAuto ? "rgba(232, 163, 61, 0.12)" : "rgba(148, 152, 166, 0.12)",
        borderColor: isAuto ? "rgba(232, 163, 61, 0.3)" : "rgba(148, 152, 166, 0.25)",
        color: isAuto ? "#E8A33D" : "#9498A6",
      }}
    >
      {isAuto ? <Zap className="w-3 h-3 text-[#E8A33D]" /> : <Package className="w-3 h-3" />}
      <span>{isAuto ? "Anında Teslim" : slaHours ? `${slaHours} Saat Teslimat` : "Manuel Teslim"}</span>
    </span>
  );
}

// 5. SELLER BADGE
export function ItemSepetiSellerBadge({ isVerified }: { isVerified: boolean }) {
  if (!isVerified) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34D399]"
      title="Onaylı Güvenilir Satıcı"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>Onaylı Satıcı</span>
    </span>
  );
}
