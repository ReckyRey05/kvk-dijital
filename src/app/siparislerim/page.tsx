"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import { useItemSepetiAuth } from "@/context/ItemSepetiAuthContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import { ItemSepetiOrder } from "@/types/marketplace";
import {
  ShoppingBag,
  ExternalLink,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function MyOrdersPage() {
  const { user } = useItemSepetiAuth();
  const [orders, setOrders] = useState<ItemSepetiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const buyerId = user.uid;
        const res = await fetch(`/api/itemsepeti/orders?buyerId=${buyerId}`);
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex items-center gap-2">
            <Link
              href="/profilim"
              className="inline-flex items-center gap-1 text-xs text-[#9498A6] hover:text-inherit transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Profilime Dön</span>
            </Link>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#D99532]" />
              <h1 className="text-2xl font-black tracking-tight text-inherit">Siparişlerim</h1>
            </div>
            <p className="text-xs sm:text-sm text-[#9498A6]">
              Satın aldığınız oyun içi eşya, kod ve hesapların anlık teslimat durumunu takip edin.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-[#9498A6]">Siparişler yükleniyor...</div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center rounded-[14px] border border-dashed border-[#DCDDE1] dark:border-[#282C3A] space-y-4">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#9498A6]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-inherit">Henüz bir siparişiniz bulunmuyor</h3>
                <p className="text-xs text-[#9498A6]">Pazaryerindeki binlerce ilan arasından alışveriş yapabilirsiniz.</p>
              </div>
              <Link href="/itemsepeti">
                <ItemSepetiButton variant="primary" size="md">
                  Pazaryerini Keşfet
                </ItemSepetiButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <strong className="font-mono font-bold text-inherit">{ord.orderNumber}</strong>
                      <span className="text-[#9498A6]">&bull;</span>
                      <span className="text-[#9498A6]">Satıcı: @{ord.sellerStoreName}</span>
                      <span className="text-[#9498A6]">&bull;</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ord.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : ord.status === "DELIVERED"
                            ? "bg-blue-500/10 text-blue-500"
                            : ord.status === "PAID"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-black/5 dark:bg-white/5 text-[#9498A6]"
                        }`}
                      >
                        {ord.status === "COMPLETED"
                          ? "Tamamlandı"
                          : ord.status === "DELIVERED"
                          ? "Teslim Edildi (Onay Bekliyor)"
                          : ord.status === "PAID"
                          ? "Ödendi (Teslimat Bekleniyor)"
                          : ord.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items.map((item, idx) => (
                        <h4 key={idx} className="text-sm font-bold text-inherit">
                          {item.title} <span className="text-xs font-normal text-[#9498A6]">x{item.quantity}</span>
                        </h4>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#9498A6]">
                      <span>{new Date(ord.createdAt).toLocaleDateString("tr-TR")}</span>
                      <span>&bull;</span>
                      <span>{ord.expectedDeliveryAt ? `Tahmini Teslimat: ${new Date(ord.expectedDeliveryAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Hızlı Teslimat"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] block font-semibold text-[#9498A6]">Toplam Tutar</span>
                      <span className="text-base font-black text-inherit">
                        {ord.totalAmount.toLocaleString("tr-TR")} TL
                      </span>
                    </div>

                    <Link href={`/siparis/${ord.id}`}>
                      <ItemSepetiButton variant="primary" size="sm">
                        <span>Sipariş Detayı &rarr;</span>
                      </ItemSepetiButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
