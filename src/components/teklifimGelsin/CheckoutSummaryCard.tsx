"use client";

import React from "react";
import { TeklifimOrder } from "@/types/teklifimGelsin";
import { Package, ShieldCheck, Building2, Truck, Info } from "lucide-react";

interface CheckoutSummaryCardProps {
  order: TeklifimOrder;
  platformFeeRate?: number;
  platformFee?: number;
}

export default function CheckoutSummaryCard({
  order,
  platformFeeRate = 0.03,
  platformFee,
}: CheckoutSummaryCardProps) {
  const totalAmount = Number(order.totalPrice) || 0;
  const computedFee = platformFee !== undefined ? platformFee : Math.round(totalAmount * platformFeeRate * 100) / 100;
  const supplierPayout = Math.max(0, Math.round((totalAmount - computedFee) * 100) / 100);

  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-[#0E131F] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Sipariş & Ödeme Özeti
          </span>
          <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            {order.requestTitle}
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl">
          {order.orderNumber}
        </span>
      </div>

      {/* Supplier & Delivery Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
          <span className="text-zinc-400 flex items-center gap-1.5 mb-1 font-semibold">
            <Building2 className="h-3.5 w-3.5 text-zinc-500" />
            <span>Satıcı Tedarikçi</span>
          </span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
            {order.supplierName}
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
          <span className="text-zinc-400 flex items-center gap-1.5 mb-1 font-semibold">
            <Truck className="h-3.5 w-3.5 text-zinc-500" />
            <span>Teslimat Yöntemi & Süresi</span>
          </span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
            {order.deliveryMethod === "cargo"
              ? "Kargo Taşımacılığı"
              : order.deliveryMethod === "supplier_delivery"
              ? "Tedarikçi Filosu"
              : "Elden / Doğrudan Teslim"}{" "}
            ({order.deliveryDays} Gün)
          </p>
        </div>
      </div>

      {/* Item Snapshot Breakdown */}
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="text-xs font-bold text-zinc-500 mb-3 flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-zinc-400" />
          <span>Sipariş Kalemleri</span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{item.productName}</p>
                  <p className="text-[11px] text-zinc-500">
                    {item.quantity} {item.unit} x ₺{Number(item.unitPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                  ₺{Number(item.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))
          ) : (
            <div className="py-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{order.requestTitle}</p>
                <p className="text-[11px] text-zinc-500">
                  {order.quantity} {order.unit} x ₺{Number(order.unitPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                ₺{Number(order.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Transparent Financial Total Breakdown */}
      <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800 space-y-2 text-xs">
        <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
          <span>Ürün & Mal Bedeli (Ara Toplam)</span>
          <span className="font-mono font-semibold">
            ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <span>Platform Hizmet & Güvence Bedeli</span>
            <span title="Toptancım Cebimde güvenli ödeme ve işlem altyapısı">
              <Info className="h-3 w-3 text-zinc-400" />
            </span>
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            Dahil (%{(platformFeeRate * 100).toFixed(1)})
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200/80 pt-3 dark:border-zinc-700/80">
          <div>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 block">
              Ödenecek Toplam Tutar
            </span>
            <span className="text-[11px] text-zinc-400">KDV Dahil / Gizli Ek Masraf Yoktur</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="rounded-2xl bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-start gap-2.5 border border-emerald-200/60 dark:border-emerald-900/40">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Ödemeniz lisanslı ödeme kuruluşu güvencesiyle bloke hesapta tutulur. Tedarikçi ürünleri teslim edip onaylanana kadar satıcıya hakediş aktarımı yapılmaz.
        </span>
      </div>
    </div>
  );
}
