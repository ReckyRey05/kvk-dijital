"use client";

import React, { useState } from "react";
import {
  Power,
  Sun,
  Palmtree,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import { TeklifimSupplierAvailability } from "@/types/teklifimGelsin";

interface SupplierAvailabilityBannerProps {
  availability: TeklifimSupplierAvailability;
  onUpdateAvailability: (next: Partial<TeklifimSupplierAvailability>) => Promise<void>;
}

export default function SupplierAvailabilityBanner({
  availability,
  onUpdateAvailability,
}: SupplierAvailabilityBannerProps) {
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vacationMode, setVacationMode] = useState(availability.vacationMode || false);
  const [vacationNote, setVacationNote] = useState(availability.vacationNote || "");
  const [vacationStartDate, setVacationStartDate] = useState(
    availability.vacationStartDate || ""
  );
  const [vacationEndDate, setVacationEndDate] = useState(
    availability.vacationEndDate || ""
  );

  const isOnline = availability.isOnline !== false;
  const isAccepting = availability.isAcceptingOrders !== false;

  const toggleOnline = async () => {
    setIsSaving(true);
    try {
      await onUpdateAvailability({ isOnline: !isOnline });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAccepting = async () => {
    setIsSaving(true);
    try {
      await onUpdateAvailability({ isAcceptingOrders: !isAccepting });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVacation = async () => {
    setIsSaving(true);
    try {
      await onUpdateAvailability({
        vacationMode,
        vacationNote: vacationNote.trim(),
        vacationStartDate: vacationStartDate || undefined,
        vacationEndDate: vacationEndDate || undefined,
      });
      setIsOpenSettings(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              availability.vacationMode
                ? "bg-amber-400 animate-pulse"
                : isOnline && isAccepting
                ? "bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/50"
                : "bg-slate-400"
            }`}
          />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {availability.vacationMode
                  ? "Tatil Modu Aktif"
                  : isOnline && isAccepting
                  ? "Satis Operasyonu Acik"
                  : "Siparis Alimi Kapali"}
              </span>

              {availability.vacationMode && availability.vacationNote && (
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                  ({availability.vacationNote})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {availability.vacationMode
                ? "Belirtilen tarihler arasinda yeni siparis kabul edilmez."
                : isOnline && isAccepting
                ? "Isletmeler size dogrudan teklif talebi ve siparis iletebilir."
                : "Gecici olarak siparis ve teklif alimi durduruldu."}
            </p>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isSaving}
            onClick={toggleOnline}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isOnline
                ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {isOnline ? "Cevrimici" : "Cevrimdisi"}
          </button>

          <button
            type="button"
            onClick={() => setIsOpenSettings(!isOpenSettings)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
          >
            <span>Tatil & Ayarlar</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                isOpenSettings ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Vacation / Advanced Panel */}
      {isOpenSettings && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={vacationMode}
                onChange={(e) => setVacationMode(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Tatil Modunu Etkinlestir</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={isAccepting}
                onChange={toggleAccepting}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Siparis Alimi Acik</span>
            </label>
          </div>

          {vacationMode && (
            <div className="space-y-2.5 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Baslangic Tarihi
                  </label>
                  <input
                    type="date"
                    value={vacationStartDate}
                    onChange={(e) => setVacationStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Bitis Tarihi
                  </label>
                  <input
                    type="date"
                    value={vacationEndDate}
                    onChange={(e) => setVacationEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Musteri Bilgilendirme Notu
                </label>
                <input
                  type="text"
                  value={vacationNote}
                  onChange={(e) => setVacationNote(e.target.value)}
                  placeholder="Orn: Yillik izin sebebiyle 15 Eylul'e kadar sevkiyat yapilmayacaktir."
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveVacation}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              {isSaving ? "Kaydediliyor..." : "Ayarlari Kaydet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
