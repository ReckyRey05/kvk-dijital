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
    <span className={`inline-flex items-baseline text-[#0F625C] dark:text-[#168B83] tracking-tight ${sizeClasses[size]}`}>
      <span>{amount.toLocaleString("tr-TR")}</span>
      <span className="text-[10px] sm:text-xs font-semibold ml-1 opacity-90">{currency}</span>
    </span>
  );
}

// 2. RATING PRIMITIVE
export function ItemSepetiRating({ score, count }: { score: number; count?: number }) {
  return (
    <div className="inline-flex items-center gap-1 text-xs select-none">
      <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" aria-hidden="true" />
      <span className="font-bold text-inherit">{score.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-[#69717D] dark:text-[#8E97A4] text-[11px]">({count})</span>
      )}
    </div>
  );
}

// 3. STOCK BADGE
export function ItemSepetiStockBadge({ stock }: { stock: number }) {
  const inStock = stock > 0;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-semibold border"
      style={{
        backgroundColor: inStock ? "rgba(13, 130, 89, 0.08)" : "rgba(239, 68, 68, 0.08)",
        borderColor: inStock ? "rgba(13, 130, 89, 0.2)" : "rgba(239, 68, 68, 0.2)",
        color: inStock ? "#0D8259" : "#EF4444",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: inStock ? "#0D8259" : "#EF4444" }} />
      <span>{inStock ? `${stock} adet stokta` : "Tükendi"}</span>
    </span>
  );
}

// 4. DELIVERY BADGE
export function ItemSepetiDeliveryBadge({ method, slaHours }: { method: ItemSepetiDeliveryMethod; slaHours?: number }) {
  const isAuto = method === "AUTOMATIC_CODE";

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-semibold border"
      style={{
        backgroundColor: isAuto ? "rgba(15, 98, 92, 0.08)" : "rgba(105, 113, 125, 0.08)",
        borderColor: isAuto ? "rgba(15, 98, 92, 0.2)" : "rgba(105, 113, 125, 0.2)",
        color: isAuto ? "#0F625C" : "#69717D",
      }}
    >
      {isAuto ? <Zap className="w-3 h-3 text-[#0F625C]" /> : <Package className="w-3 h-3" />}
      <span>{isAuto ? "Anında Teslim" : slaHours ? `${slaHours} Saat Teslimat` : "Manuel Teslim"}</span>
    </span>
  );
}

// 5. SELLER BADGE
export function ItemSepetiSellerBadge({ isVerified }: { isVerified: boolean }) {
  if (!isVerified) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D8259]"
      title="Onaylı Güvenilir Satıcı"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>Onaylı Satıcı</span>
    </span>
  );
}
