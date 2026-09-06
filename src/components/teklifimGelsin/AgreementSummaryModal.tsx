"use client";

import React, { useState } from "react";
import { TeklifimAgreement, TeklifimAgreementStatus } from "@/types/teklifimGelsin";
import {
  X,
  FileCheck,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Printer,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface AgreementSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: TeklifimAgreement;
  currentUserId: string;
  onStatusUpdate?: (updatedAgreement: TeklifimAgreement) => void;
}

const STATUS_STEPS: { status: TeklifimAgreementStatus; label: string; icon: any }[] = [
  { status: "agreement_reached", label: "Anlaşma Sağlandı", icon: FileCheck },
  { status: "preparing", label: "Hazırlanıyor", icon: Package },
  { status: "shipped", label: "Gönderildi", icon: Truck },
  { status: "delivered", label: "Teslim Edildi", icon: Clock },
  { status: "completed", label: "Tamamlandı", icon: CheckCircle2 },
];

export default function AgreementSummaryModal({
  isOpen,
  onClose,
  agreement,
  currentUserId,
  onStatusUpdate,
}: AgreementSummaryModalProps) {
  const [currentAgreement, setCurrentAgreement] = useState<TeklifimAgreement>(agreement);
  const [updating, setUpdating] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isBusiness = currentUserId === currentAgreement.businessId;
  const isSupplier = currentUserId === currentAgreement.supplierId;

  const handleUpdateStatus = async (nextStatus: TeklifimAgreementStatus) => {
    setUpdating(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/teklifim-gelsin/agreements/${currentAgreement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note: statusNote || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Durum güncellenemedi.");
      setCurrentAgreement(data.agreement);
      setStatusNote("");
      if (onStatusUpdate) onStatusUpdate(data.agreement);
    } catch (err: any) {
      setErrorMsg(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setUpdating(false);
    }
  };

  const getStepIndex = (st: TeklifimAgreementStatus) => {
    return STATUS_STEPS.findIndex((s) => s.status === st);
  };

  const currentStepIdx = getStepIndex(currentAgreement.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Resmi B2B Tedarik Sözleşme Özeti
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  Onaylandı
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Sözleşme No: {currentAgreement.agreementNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Yazdır / PDF Kaydet"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Stepper Progress */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              İşlem Takibi & Süreç Durumu
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = currentStepIdx >= idx && currentAgreement.status !== "cancelled" && currentAgreement.status !== "disputed";
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                        isCurrent
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400"
                          : isPassed
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`mt-2 text-2xs font-medium ${
                        isCurrent
                          ? "font-bold text-emerald-700 dark:text-emerald-400"
                          : isPassed
                          ? "text-zinc-700 dark:text-zinc-300"
                          : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contract Parties Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Buyer Business */}
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Alıcı / İşletme</span>
              </div>
              <div className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                {currentAgreement.businessName}
              </div>
              <div className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                {currentAgreement.city && (
                  <div>Teslimat İli: {currentAgreement.city} {currentAgreement.district ? `/ ${currentAgreement.district}` : ""}</div>
                )}
                {currentAgreement.businessPhone && <div>Telefon: {currentAgreement.businessPhone}</div>}
                {currentAgreement.businessEmail && <div>E-posta: {currentAgreement.businessEmail}</div>}
              </div>
            </div>

            {/* Supplier */}
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Satıcı / Tedarikçi</span>
              </div>
              <div className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                {currentAgreement.supplierName}
              </div>
              <div className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                {currentAgreement.supplierPhone && <div>Telefon: {currentAgreement.supplierPhone}</div>}
                {currentAgreement.supplierEmail && <div>E-posta: {currentAgreement.supplierEmail}</div>}
                <div>Onaylanan Versiyon: Revizyon #{currentAgreement.finalVersion}</div>
              </div>
            </div>
          </div>

          {/* Agreed Terms Specifications */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3">
              Mutabık Kalınan Tedarik Şartları
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">Ürün / Talep</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentAgreement.productName || currentAgreement.requestTitle}
                </span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">Miktar</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentAgreement.quantity} {currentAgreement.unit}
                </span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">Toplam Fiyat</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {currentAgreement.acceptedPrice.toLocaleString("tr-TR")} {currentAgreement.currency || "TL"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">Teslimat Süresi</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentAgreement.deliveryDays} İş Günü
                </span>
              </div>
            </div>

            {currentAgreement.termsNotes && (
              <div className="mt-3 border-t border-emerald-200/60 pt-2 text-xs text-zinc-600 dark:border-emerald-900/50 dark:text-zinc-300">
                <span className="font-semibold">Özel Notlar: </span>
                {currentAgreement.termsNotes}
              </div>
            )}
          </div>

          {/* Status Progression Controls */}
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Süreç İlerletme Aksiyonları
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isSupplier && currentAgreement.status === "agreement_reached" && (
                <button
                  onClick={() => handleUpdateStatus("preparing")}
                  disabled={updating}
                  className="rounded-lg bg-zinc-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                >
                  Siparişi Hazırlamaya Başla
                </button>
              )}

              {isSupplier && currentAgreement.status === "preparing" && (
                <button
                  onClick={() => handleUpdateStatus("shipped")}
                  disabled={updating}
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Ürünleri Kargoya / Sevkiyata Ver
                </button>
              )}

              {isSupplier && currentAgreement.status === "shipped" && (
                <button
                  onClick={() => handleUpdateStatus("delivered")}
                  disabled={updating}
                  className="rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Teslim Edildi Olarak Bildir
                </button>
              )}

              {isBusiness && (currentAgreement.status === "delivered" || currentAgreement.status === "shipped") && (
                <button
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={updating}
                  className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Teslimatı Onayla & Tamamla
                </button>
              )}

              {currentAgreement.status === "completed" && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>İşlem başarıyla tamamlanmıştır.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 p-4 dark:border-zinc-800">
          <span className="text-2xs text-zinc-400">
            Toptancım Cebimde B2B Güvenli Tedarik Ağı
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
