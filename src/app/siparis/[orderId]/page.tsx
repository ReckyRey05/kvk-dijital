"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import { useItemSepetiAuth } from "@/context/ItemSepetiAuthContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import { ItemSepetiOrder, ItemSepetiOrderStatus } from "@/types/marketplace";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Wallet,
  User,
  MessageSquare,
  Package,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const { user, updateProfile } = useItemSepetiAuth();

  const [order, setOrder] = useState<ItemSepetiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dispute state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const loadOrder = async () => {
    setLoading(true);
    try {
      const userId = user?.uid || "usr_gamer_ali";
      const role = user?.role || "buyer";
      const res = await fetch(`/api/itemsepeti/orders/${orderId}?userId=${userId}&role=${role}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId, user]);

  const handlePayWithWallet = async () => {
    if (!order || !user) return;
    if (user.balance < order.totalAmount) {
      setErrorMessage("Cüzdan bakiyeniz yetersiz. Lütfen Bakiye Yükleyin.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/itemsepeti/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "PAID",
          actorId: user.uid,
          actorRole: "buyer",
          note: "Cüzdan bakiyesiyle ödendi. Escrow kilitlendi.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        // Deduct wallet balance
        await updateProfile({ balance: user.balance - order.totalAmount });
        setFeedback("Ödeme başarıyla tamamlandı! Tutar Escrow havuzunda güvenceye alındı, satıcı teslimata başladı.");
      }
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const handleSellerMarkDelivered = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/itemsepeti/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "DELIVERED",
          actorId: user?.uid || order.sellerId,
          actorRole: "seller",
          note: "Satıcı ürünü teslim ettiğini bildirdi.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setFeedback("Teslimat bildirildi! Alıcının onaylaması bekleniyor.");
      }
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const handleBuyerConfirmCompletion = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/itemsepeti/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "COMPLETED",
          actorId: user?.uid || order.buyerId,
          actorRole: "buyer",
          note: "Alıcı ürünü eksiksiz teslim aldığını onayladı. Escrow satıcıya aktarıldı.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setFeedback("Sipariş başarıyla tamamlandı! Güvenli alışverişiniz için teşekkür ederiz.");
      }
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const handleOpenDispute = async () => {
    if (!order || !disputeReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/itemsepeti/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "DISPUTED",
          actorId: user?.uid || order.buyerId,
          actorRole: "buyer",
          note: `Alıcı itiraz etti: ${disputeReason}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setShowDisputeModal(false);
        setFeedback("İtiraz talebiniz alındı! Escrow donduruldu, admin moderatör incelemesi başlatıldı.");
      }
    } catch {} finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ItemSepetiThemeProvider>
        <div className="flex flex-col min-h-screen">
          <ItemSepetiHeader />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-20 text-center text-xs text-[#9498A6]">
            Sipariş detayları yükleniyor...
          </main>
          <ItemSepetiFooter />
        </div>
      </ItemSepetiThemeProvider>
    );
  }

  if (!order) {
    return (
      <ItemSepetiThemeProvider>
        <div className="flex flex-col min-h-screen">
          <ItemSepetiHeader />
          <main className="flex-1 max-w-md w-full mx-auto px-4 py-20 text-center space-y-4">
            <h1 className="text-xl font-bold">Sipariş Bulunamadı</h1>
            <p className="text-xs text-[#9498A6]">Böyle bir sipariş kaydı bulunmamaktadır veya erişim yetkiniz yok.</p>
            <Link href="/siparislerim">
              <ItemSepetiButton variant="primary">Siparişlerime Dön</ItemSepetiButton>
            </Link>
          </main>
          <ItemSepetiFooter />
        </div>
      </ItemSepetiThemeProvider>
    );
  }

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex items-center gap-2">
            <Link
              href="/siparislerim"
              className="inline-flex items-center gap-1 text-xs text-[#9498A6] hover:text-inherit transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Siparişlerime Dön</span>
            </Link>
          </div>

          {/* STATUS BANNER */}
          <div className="p-6 rounded-[16px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-inherit">{order.orderNumber}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    order.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : order.status === "DELIVERED"
                      ? "bg-blue-500/10 text-blue-500"
                      : order.status === "PAID"
                      ? "bg-amber-500/10 text-amber-500"
                      : order.status === "DISPUTED"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-black/5 dark:bg-white/5 text-[#9498A6]"
                  }`}
                >
                  {order.status === "COMPLETED"
                    ? "Tamamlandı"
                    : order.status === "DELIVERED"
                    ? "Teslim Edildi"
                    : order.status === "PAID"
                    ? "Escrow Güvencesinde (Ödendi)"
                    : order.status === "DISPUTED"
                    ? "İtiraz İncelemesinde"
                    : order.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-inherit">
                {order.items[0]?.title || "Sipariş Detayı"}
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] block font-semibold text-[#9498A6]">Ödenen Tutar</span>
              <span className="text-2xl font-black text-inherit">
                {order.totalAmount.toLocaleString("tr-TR")} TL
              </span>
            </div>
          </div>

          {feedback && (
            <div className="p-3.5 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MAIN 2-COLUMN WORKSPACE: DETAILS & ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: ORDER ITEMS & DELIVERY INFO (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-4 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9498A6]">
                  Sipariş Edilen Ürünler
                </h3>

                <div className="space-y-3 divide-y divide-black/5 dark:divide-white/5">
                  {order.items.map((item, i) => (
                    <div key={i} className="pt-3 first:pt-0 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-inherit">{item.title}</h4>
                        <div className="text-xs text-[#9498A6]">
                          <span>{item.gameName}</span>
                          {item.serverName && <span> &bull; {item.serverName}</span>}
                          <span> &bull; {item.quantity} Adet</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-inherit">
                        {item.totalPrice.toLocaleString("tr-TR")} TL
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESCROW GUARANTEE CARD */}
              <div className="p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>İtemSepeti Escrow (Emanet Havuz) Güvencesi</span>
                </div>
                <p className="text-xs text-[#9498A6] leading-relaxed">
                  Ödemeniz satıcıya doğrudan aktarılmaz. Siz ürünü oyun içinde eksiksiz teslim alıp onaylayana kadar
                  İtemSepeti havuz hesabında bloke edilir. Teslimat yapılmazsa paranız anında cüzdanınıza iade edilir.
                </p>
              </div>
            </div>

            {/* RIGHT: INTERACTIVE OPERATIONAL ACTIONS (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-4 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9498A6]">
                  Sipariş İşlemleri & Eylemler
                </h3>

                {/* 1. STATE: PENDING PAYMENT (PAY BUTTON) */}
                {order.status === "PENDING_PAYMENT" && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#9498A6]">
                      Siparişiniz oluşturuldu. Stok rezervasyonunun düşmemesi için lütfen ödemeyi tamamlayın.
                    </p>
                    <ItemSepetiButton
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={actionLoading}
                      onClick={handlePayWithWallet}
                    >
                      <Wallet className="w-4 h-4 mr-1.5" />
                      <span>Cüzdan Bakiyesiyle Öde ({order.totalAmount} TL)</span>
                    </ItemSepetiButton>
                  </div>
                )}

                {/* 2. STATE: PAID (WAITING FOR SELLER OR SELLER DELIVERS) */}
                {order.status === "PAID" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                      Ödemeniz havuzda. Satıcının teslim etmesi bekleniyor.
                    </div>

                    {/* Simulation button for demo purposes */}
                    <button
                      type="button"
                      onClick={handleSellerMarkDelivered}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-3 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      [Satıcı Modu]: Ürünü Teslim Ettim Olarak İşaretle
                    </button>
                  </div>
                )}

                {/* 3. STATE: DELIVERED (BUYER CONFIRMS OR DISPUTES) */}
                {order.status === "DELIVERED" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs">
                      Satıcı ürünü teslim ettiğini bildirdi! Lütfen oyunu kontrol edip onaylayın.
                    </div>

                    <ItemSepetiButton
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={actionLoading}
                      onClick={handleBuyerConfirmCompletion}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>Ürünü Teslim Aldım & Siparişi Tamamla</span>
                    </ItemSepetiButton>

                    <button
                      type="button"
                      onClick={() => setShowDisputeModal(true)}
                      className="w-full py-2 text-xs font-semibold text-red-500 hover:underline cursor-pointer"
                    >
                      Sorun Bildir / İtiraz Et (Dispute Aç)
                    </button>
                  </div>
                )}

                {/* 4. STATE: COMPLETED */}
                {order.status === "COMPLETED" && (
                  <div className="p-4 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-1 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto" />
                    <p className="font-bold">Sipariş Başarıyla Tamamlandı</p>
                    <p className="text-[11px] opacity-80">Para satıcının çekilebilir bakiyesine aktarıldı.</p>
                  </div>
                )}

                {/* 5. STATE: DISPUTED */}
                {order.status === "DISPUTED" && (
                  <div className="p-4 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs space-y-1 text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto" />
                    <p className="font-bold">İtiraz İncelemesi Başlatıldı</p>
                    <p className="text-[11px] opacity-80">Escrow donduruldu. Admin hakem ekibi 24 saat içinde karar verecektir.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DISPUTE MODAL */}
          {showDisputeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="max-w-md w-full p-6 rounded-[16px] bg-white dark:bg-[#161921] border border-[#DCDDE1] dark:border-[#282C3A] space-y-4 shadow-2xl">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-inherit flex items-center gap-1.5 text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Uyuşmazlık & İtiraz Bildir</span>
                  </h3>
                  <p className="text-xs text-[#9498A6]">
                    Satıcı teslimatı yapmadıysa veya eksik/hatalı ürün verdiyse itiraz gerekçenizi yazın.
                  </p>
                </div>

                <textarea
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Örn: Satıcı oyunda takas teklifini kabul etmedi veya kod geçersiz çıktı..."
                  className="w-full p-3 rounded-[8px] text-xs bg-black/5 dark:bg-black/30 border border-[#DCDDE1] dark:border-[#282C3A] text-inherit focus:ring-1 focus:ring-red-500 focus:outline-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowDisputeModal(false)}
                    className="px-3 py-2 text-xs font-semibold text-[#9498A6] hover:text-inherit"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleOpenDispute}
                    disabled={!disputeReason.trim() || actionLoading}
                    className="px-4 py-2 rounded-[8px] bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    İtirazı Başlat
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
