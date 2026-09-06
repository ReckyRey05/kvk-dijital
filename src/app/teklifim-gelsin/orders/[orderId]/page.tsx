"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimOrder, TeklifimOrderStatus, TeklifimInvoice, TeklifimPayment } from "@/types/teklifimGelsin";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import OrderTimeline from "@/components/teklifimGelsin/OrderTimeline";
import TrackingModal from "@/components/teklifimGelsin/TrackingModal";
import DeliveryProofModal from "@/components/teklifimGelsin/DeliveryProofModal";
import DisputeModal from "@/components/teklifimGelsin/DisputeModal";
import CancelOrderModal from "@/components/teklifimGelsin/CancelOrderModal";
import ReviewModal from "@/components/teklifimGelsin/ReviewModal";
import PaymentStatusBadge from "@/components/teklifimGelsin/PaymentStatusBadge";
import PaymentCountdown from "@/components/teklifimGelsin/PaymentCountdown";
import InvoiceUploadModal from "@/components/teklifimGelsin/InvoiceUploadModal";
import RefundModal from "@/components/teklifimGelsin/RefundModal";
import {
  Package,
  Clock,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  FileCheck,
  Printer,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  CreditCard,
  FileText,
  Download,
} from "lucide-react";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [order, setOrder] = useState<TeklifimOrder | null>(null);
  const [deliveryStatusSignal, setDeliveryStatusSignal] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  // Modals
  const [trackingModalOpen, setTrackingModalOpen] = useState<boolean>(false);
  const [deliveryProofModalOpen, setDeliveryProofModalOpen] = useState<boolean>(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
  const [refundModalOpen, setRefundModalOpen] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<TeklifimInvoice[]>([]);
  const [payment, setPayment] = useState<TeklifimPayment | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/teklifim-gelsin/auth");
      } else {
        setCurrentUser(user);
        if (orderId) loadOrderDetails(user, orderId);
      }
    });
    return () => unsub();
  }, [orderId, router]);

  const loadOrderDetails = async (user: any, id: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sipariş detayları alınamadı.");
      setOrder(data.order);
      setDeliveryStatusSignal(data.deliveryStatusSignal);

      // Fetch invoices
      try {
        const invRes = await fetch(`/api/teklifim-gelsin/payments/invoices?orderId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (invRes.ok) {
          const invData = await invRes.json();
          setInvoices(invData.invoices || []);
        }
      } catch {}

      // Fetch payment record
      try {
        const payRes = await fetch(`/api/teklifim-gelsin/payments?role=buyer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (payRes.ok) {
          const payData = await payRes.json();
          const match = (payData.payments || []).find((p: any) => p.orderId === id);
          if (match) setPayment(match);
        }
      } catch {}
    } catch (err: any) {
      setErrorMsg(err.message || "Sipariş verisi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TeklifimOrderStatus, note?: string) => {
    if (!order || !currentUser) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sipariş durumu güncellenemedi.");
      setOrder(data.order);
      if (data.deliveryStatusSignal) setDeliveryStatusSignal(data.deliveryStatusSignal);
    } catch (err: any) {
      setErrorMsg(err.message || "İşlem başarısız oldu.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!order || !currentUser) return;
    if (!window.confirm("Siparişi eksiksiz ve onaylanmış olarak tamamlamak istediğinize emin misiniz?")) return;

    setActionLoading(true);
    setErrorMsg(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/orders/${order.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sipariş tamamlanamadı.");
      setOrder(data.order);
      if (data.deliveryStatusSignal) setDeliveryStatusSignal(data.deliveryStatusSignal);
    } catch (err: any) {
      setErrorMsg(err.message || "Sipariş tamamlanırken bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const copyTracking = () => {
    if (!order?.trackingInfo?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingInfo.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 dark:bg-[#090D14] dark:text-zinc-100 font-sans">
        <TeklifimHeader />
        <main className="max-w-5xl mx-auto px-4 py-12">
          <div className="h-64 rounded-2xl border border-zinc-200 bg-white p-8 animate-pulse dark:border-zinc-800 dark:bg-zinc-900" />
        </main>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 dark:bg-[#090D14] dark:text-zinc-100 font-sans">
        <TeklifimHeader />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 dark:border-rose-900/40 dark:bg-rose-950/30">
            <AlertTriangle className="mx-auto h-12 w-12 text-rose-600 dark:text-rose-400" />
            <h2 className="mt-4 text-lg font-bold text-rose-900 dark:text-rose-200">
              Sipariş Yüklenemedi
            </h2>
            <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{errorMsg}</p>
            <Link
              href="/teklifim-gelsin/orders"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Siparişlerime Dön</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!order) return null;

  const isBuyer = currentUser?.uid === order.businessId;
  const isSupplier = currentUser?.uid === order.supplierId;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 dark:bg-[#090D14] dark:text-zinc-100 font-sans">
      <TeklifimHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/teklifim-gelsin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Tüm Siparişler</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Yazdır / PDF Kaydet"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner if any */}
        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Order Header Snapshot Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-base font-black text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl">
                  {order.orderNumber}
                </span>
                <PaymentStatusBadge status={order.paymentStatus || "unpaid"} />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Oluşturulma: {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {order.requestTitle}
              </h1>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Sözleşme Referansı:{" "}
                <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                  {order.agreementNumber}
                </span>
              </p>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Toplam Sipariş Tutarı</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₺{Number(order.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-zinc-400">KDV Dahil / B2B Sözleşme Şartı</span>
            </div>
          </div>
        </div>

        {/* Unpaid Alert & Direct Checkout Gateway */}
        {(!order.paymentStatus || order.paymentStatus === "unpaid" || order.paymentStatus === "failed") && isBuyer && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Güvenli Ödeme Bekleniyor</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tedarikçinin sipariş hazırlığına başlayabilmesi için tutar güvenli havuz hesabında bloke edilmelidir.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <PaymentCountdown initialSeconds={900} />
              <Link
                href={`/teklifim-gelsin/checkout/${order.id}`}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Ödemeye Geç ({Number(order.totalPrice).toLocaleString("tr-TR")} TL)</span>
              </Link>
            </div>
          </div>
        )}

        {/* Visual Process Timeline */}
        <OrderTimeline order={order} deliveryStatusSignal={deliveryStatusSignal} />

        {/* Main Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Order Details & Address & Proof */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Snapshot Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span>Sipariş Kalemleri (Sözleşme Özeti)</span>
                </h3>
                <span className="text-[11px] text-zinc-400 font-medium">Değiştirilemez Veri</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 dark:border-zinc-800">
                      <th className="pb-2 font-semibold">Ürün Adı</th>
                      <th className="pb-2 font-semibold">Kategori</th>
                      <th className="pb-2 font-semibold text-right">Miktar</th>
                      <th className="pb-2 font-semibold text-right">Birim Fiyat</th>
                      <th className="pb-2 font-semibold text-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <tr key={idx} className="py-2.5">
                          <td className="py-2.5 font-bold text-zinc-900 dark:text-zinc-100">
                            {item.productName}
                          </td>
                          <td className="py-2.5 text-zinc-500">{item.category}</td>
                          <td className="py-2.5 text-right font-medium">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2.5 text-right font-mono">
                            ₺{Number(item.unitPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 text-right font-bold font-mono text-zinc-900 dark:text-zinc-100">
                            ₺{Number(item.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 font-bold text-zinc-900 dark:text-zinc-100">
                          {order.requestTitle}
                        </td>
                        <td className="py-2.5 text-zinc-500">-</td>
                        <td className="py-2.5 text-right font-medium">
                          {order.quantity} {order.unit}
                        </td>
                        <td className="py-2.5 text-right font-mono">
                          ₺{Number(order.unitPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 text-right font-bold font-mono text-zinc-900 dark:text-zinc-100">
                          ₺{Number(order.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-3 flex justify-end dark:border-zinc-800">
                <div className="text-right space-y-1">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Genel Toplam:{" "}
                    <strong className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-mono">
                      ₺{Number(order.totalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Address Information */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Teslimat & Lojistik Detayları</span>
              </h3>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 block mb-0.5">Teslimat Yöntemi</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {order.deliveryMethod === "cargo"
                      ? "Kargo Taşımacılığı"
                      : order.deliveryMethod === "supplier_delivery"
                      ? "Tedarikçi Özel Dağıtım Filosu"
                      : order.deliveryMethod === "hand_delivery"
                      ? "Elden Teslim"
                      : "Diğer Lojistik"}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-0.5">Taahhüt Edilen Teslimat</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {order.deliveryDays} İş Günü (Hedef:{" "}
                    {new Date(order.expectedDeliveryDate).toLocaleDateString("tr-TR")})
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-0.5">Alıcı İletişim Yetkilisi</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {order.deliveryAddress?.contactName || order.businessName}
                  </p>
                  {order.deliveryAddress?.phone && (
                    <p className="text-zinc-500 font-mono mt-0.5">{order.deliveryAddress.phone}</p>
                  )}
                </div>

                <div>
                  <span className="text-zinc-400 block mb-0.5">Teslimat Adresi</span>
                  <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {order.deliveryAddress?.addressLine || "Adres belirtilmemiş"}
                  </p>
                  <p className="text-zinc-500 font-medium mt-0.5">
                    {order.deliveryAddress?.district
                      ? `${order.deliveryAddress.district} / `
                      : ""}
                    {order.deliveryAddress?.city}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Sipariş Notu: </span>
                  {order.notes}
                </div>
              )}
            </div>

            {/* Delivery Proof Card (if delivered or completed) */}
            {order.deliveryProof && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 border-b border-emerald-200/60 pb-3 dark:border-emerald-900/40">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Resmi Teslimat Kanıtı (Teslim Alan Onayı)</span>
                </h3>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400/80 block mb-0.5">
                      Teslim Alan Yetkili
                    </span>
                    <p className="font-bold text-emerald-950 dark:text-emerald-100">
                      {order.deliveryProof.receivedBy}
                    </p>
                  </div>

                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400/80 block mb-0.5">
                      Teslim Onay Tarihi
                    </span>
                    <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                      {new Date(order.deliveryProof.deliveredAt).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  {order.deliveryProof.proofNote && (
                    <div className="sm:col-span-2">
                      <span className="text-emerald-700/80 dark:text-emerald-400/80 block mb-0.5">
                        Teslimat Kontrol Notu
                      </span>
                      <p className="text-emerald-900 dark:text-emerald-200 bg-white/80 dark:bg-zinc-900/80 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900">
                        {order.deliveryProof.proofNote}
                      </p>
                    </div>
                  )}

                  {order.deliveryProof.proofPhotoUrl && (
                    <div className="sm:col-span-2">
                      <a
                        href={order.deliveryProof.proofPhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Teslim Tutanağı / İrsaliye Belgesini İncele</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Commercial Invoice Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span>Resmi Ticari Fatura</span>
                </h3>
                {isSupplier && (
                  <button
                    onClick={() => setInvoiceModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 cursor-pointer"
                  >
                    <span>{invoices.length > 0 ? "Fatura Güncelle" : "Fatura Yükle"}</span>
                  </button>
                )}
              </div>

              {invoices.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {inv.invoiceNumber}
                          </span>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Onaylı Ticari Fatura
                          </span>
                        </div>
                        <p className="text-zinc-400 text-[11px] mt-1">
                          Tarih: {new Date(inv.uploadedAt || Date.now()).toLocaleDateString("tr-TR")} • Tutar: {inv.amount.toLocaleString("tr-TR")} TL
                        </p>
                      </div>

                      {inv.fileUrl && (
                        <a
                          href={inv.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <Download className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Fatura Belgesi İndir</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  <FileText className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  {isSupplier
                    ? "Alıcıya iletilecek e-Fatura / e-Arşiv faturayı yükleyebilirsiniz."
                    : "Tedarikçinin ticari faturayı sisteme yüklemesi bekleniyor."}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tracking Card & Parties & Actions */}
          <div className="space-y-6">
            {/* Tracking Card: Kargom Nerede? */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <Truck className="h-4 w-4 text-sky-600" />
                <span>Kargom Nerede? (Sevkiyat)</span>
              </h3>

              {order.trackingInfo ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Taşıyıcı Firma</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {order.trackingInfo.carrier}
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-400 block mb-0.5">Kargo Takip / İrsaliye No</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-900 dark:text-zinc-100">
                        {order.trackingInfo.trackingNumber}
                      </span>
                      <button
                        onClick={copyTracking}
                        title="Takip Numarasını Kopyala"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                      >
                        {copiedTracking ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-400 block mb-0.5">Kargoya Veriliş</span>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {new Date(order.trackingInfo.shippedAt).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  {order.trackingInfo.trackingUrl && (
                    <a
                      href={order.trackingInfo.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/40 w-full justify-center transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Kargo Sayfasında Sorgula</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-center py-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <Clock className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  Henüz kargo takip bilgisi girilmedi. Tedarikçi siparişi hazırlıyor.
                </div>
              )}
            </div>

            {/* Parties & Communication Bridge */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <Building2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <span>Ticari Taraflar & İletişim</span>
              </h3>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 block">Alıcı İşletme:</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{order.businessName}</p>
                  {order.businessPhone && (
                    <p className="text-zinc-500 font-mono text-[11px]">{order.businessPhone}</p>
                  )}
                </div>

                <div>
                  <span className="text-zinc-400 block">Satıcı Tedarikçi:</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{order.supplierName}</p>
                  {order.supplierPhone && (
                    <p className="text-zinc-500 font-mono text-[11px]">{order.supplierPhone}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                  <Link
                    href="/teklifim-gelsin/messages"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Konuşma Paneline Git</span>
                  </Link>

                  <Link
                    href={`/teklifim-gelsin/dashboard`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Talebi İncele</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 pb-2 dark:border-zinc-800">
                Sipariş İşlemleri
              </h3>

              {/* SUPPLIER ACTIONS */}
              {isSupplier && (
                <div className="space-y-2">
                  {order.status === "preparing" && (
                    <button
                      onClick={() => handleUpdateStatus("ready_for_dispatch", "Ürünler paketlendi, sevke hazır.")}
                      disabled={actionLoading}
                      className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      Sevke Hazır Olarak İşaretle
                    </button>
                  )}

                  {(order.status === "preparing" || order.status === "ready_for_dispatch") && (
                    <button
                      onClick={() => setTrackingModalOpen(true)}
                      className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                    >
                      Kargoya Ver & Takip No Ekle
                    </button>
                  )}

                  <button
                    onClick={() => setInvoiceModalOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{invoices.length > 0 ? "Fatura Güncelle" : "Ticari Fatura Yükle"}</span>
                  </button>
                </div>
              )}

              {/* BUYER ACTIONS */}
              {isBuyer && (
                <div className="space-y-2">
                  {order.status === "shipped" && (
                    <button
                      onClick={() => setDeliveryProofModalOpen(true)}
                      className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition"
                    >
                      Teslim Aldım & Kanıt Ekle
                    </button>
                  )}

                  {order.status === "delivered" && (
                    <button
                      onClick={handleCompleteOrder}
                      disabled={actionLoading}
                      className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      Siparişi Onayla & Tamamla
                    </button>
                  )}

                  {order.paymentStatus === "paid" && order.status !== "cancelled" && (
                    <button
                      onClick={() => setRefundModalOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 transition cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>İade Talebi Oluştur</span>
                    </button>
                  )}
                </div>
              )}

              {/* COMPLETED ACTIONS (FOR BOTH/BUYER) */}
              {order.status === "completed" && (
                <div className="space-y-2">
                  {isBuyer && (
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition"
                    >
                      Tedarikçiyi Değerlendir (Puan Ver)
                    </button>
                  )}

                  {isBuyer && (
                    <Link
                      href={`/teklifim-gelsin/requests/new?repeatOrderId=${order.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 transition"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Tekrar Sipariş Ver</span>
                    </Link>
                  )}
                </div>
              )}

              {/* DISPUTE ACTION */}
              {order.status !== "cancelled" && order.status !== "completed" && order.status !== "disputed" && (
                <button
                  onClick={() => setDisputeModalOpen(true)}
                  className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 transition"
                >
                  Anlaşmazlık / İtiraz Bildir
                </button>
              )}

              {/* CANCEL ACTION (BEFORE SHIPPED) */}
              {(order.status === "preparing" || order.status === "ready_for_dispatch") && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
                >
                  Siparişi İptal Et
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <TrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        order={order}
        onSuccess={(updated) => setOrder(updated)}
      />

      <DeliveryProofModal
        isOpen={deliveryProofModalOpen}
        onClose={() => setDeliveryProofModalOpen(false)}
        order={order}
        onSuccess={(updated) => setOrder(updated)}
      />

      <DisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        order={order}
        onSuccess={(updated) => setOrder(updated)}
      />

      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        order={order}
        onSuccess={(updated) => setOrder(updated)}
      />

      <ReviewModal
        requestId={order.requestId}
        requestTitle={order.requestTitle}
        supplierName={order.supplierName}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          setReviewModalOpen(false);
          alert("Değerlendirmeniz başarıyla kaydedildi. Teşekkür ederiz!");
        }}
      />

      <InvoiceUploadModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={order}
        onSuccess={(inv) => {
          setInvoices((prev) => [...prev, inv]);
          setInvoiceModalOpen(false);
        }}
      />

      <RefundModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        order={order}
        payment={payment}
        onSuccess={() => {
          setRefundModalOpen(false);
          if (currentUser) loadOrderDetails(currentUser, orderId);
        }}
      />
    </div>
  );
}
