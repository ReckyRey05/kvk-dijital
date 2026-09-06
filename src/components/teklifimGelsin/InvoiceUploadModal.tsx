"use client";

import React, { useState } from "react";
import { TeklifimOrder, TeklifimInvoice } from "@/types/teklifimGelsin";
import { X, FileText, Upload, AlertCircle, Check } from "lucide-react";
import { auth } from "@/lib/firebase/auth";

interface InvoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: TeklifimOrder;
  onSuccess: (invoice: TeklifimInvoice) => void;
}

export default function InvoiceUploadModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: InvoiceUploadModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [amount, setAmount] = useState<number>(Number(order.totalPrice) || 0);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      setErrorMsg("Lütfen resmi fatura numarasını giriniz.");
      return;
    }

    if (!fileUrl.trim()) {
      setErrorMsg("Lütfen fatura belgesi bağlantısını veya dosya adresini giriniz.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Lütfen giriş yapınız.");

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/payments/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          invoiceNumber: invoiceNumber.trim(),
          amount,
          currency: order.currency || "TRY",
          fileUrl: fileUrl.trim(),
          fileName: `${invoiceNumber.trim()}.pdf`,
          fileSize: 1024 * 50, // simulated size
          mimeType: "application/pdf",
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fatura yüklenemedi.");

      onSuccess(data.invoice);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Resmi Mal Satış Faturası Yükle
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sipariş No: {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div className="rounded-2xl bg-zinc-50 p-3.5 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
            Ticari e-fatura veya e-arşiv belgenizi (PDF veya XML formatında) yükleyiniz. Yüklenen fatura alıcı işletmenin paneline ve arşivine güvenli şekilde iletilecektir.
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fatura Numarası (GİB / E-Fatura No) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Örn: GIB2026000000142 veya EGE202600012"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 font-mono placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fatura Tutarı (KDV Dahil TL) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 font-mono focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fatura Belge Bağlantısı (PDF / XML Linki) <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://... (veya güvenli belge deposu linki)"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Ek Notlar (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Faturaya ilişkin alıcıya iletmek istediğiniz ek açıklama..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? "Kaydediliyor..." : "Faturayı Kaydet ve İlet"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
