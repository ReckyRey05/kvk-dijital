"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  parseCsv,
  validateAndProcessCsvRows,
} from "@/lib/teklifimGelsin/productUtils";
import { TeklifimProductImportReport } from "@/types/teklifimGelsin";

interface ProductCsvImportModalProps {
  supplierId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductCsvImportModal({
  supplierId,
  onClose,
  onSuccess,
}: ProductCsvImportModalProps) {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [fileName, setFileName] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [report, setReport] = useState<TeklifimProductImportReport | null>(null);
  const [validProductsCount, setValidProductsCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleCsvContent = `title,category,subCategory,sku,unit,minimumOrder,price,currency,priceVisibility,stockStatus,stockQuantity,leadTimeDays,deliveryRegions,description
8 oz Kraft Karton Bardak,Ambalaj & Paketleme,Karton Bardak & Kapak,KB-8OZ-KRAFT,Koli,5,450.00,TRY,public,in_stock,500,2,Tüm Türkiye,8 oz sıcak içecek bardağı koli içi 1000 adet
12 oz Beyaz Karton Bardak,Ambalaj & Paketleme,Karton Bardak & Kapak,KB-12OZ-WHT,Koli,10,550.00,TRY,public,in_stock,250,2,İstanbul|Kocaeli,12 oz beyaz kahve bardağı
Endüstriyel Rulo Havlu 21cm,Temizlik & Hijyen,Kağıt Havlu & Peçete,RUL-HAV-21,Koli,20,380.00,TRY,public,low_stock,15,3,Tüm Türkiye,%100 selüloz çift katlı rulo havlu
Baskılı Çanta Poşet 30x40,Ambalaj & Paketleme,Poşet & Çanta,PST-3040,Adet,1000,1.25,TRY,request_quote,made_to_order,,7,Tüm Türkiye,Özel firma logo baskılı poşet imalatı`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "toptancim_urun_sablonu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setApiError("Lütfen .csv formatında bir dosya yükleyin.");
      return;
    }

    setFileName(file.name);
    setApiError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || "";
      setCsvContent(content);

      try {
        const { rows } = parseCsv(content);
        if (rows.length === 0) {
          setApiError("CSV dosyası boş veya başlık satırı okunamadı.");
          return;
        }

        const validation = validateAndProcessCsvRows(rows, supplierId);
        setReport(validation.report);
        setValidProductsCount(validation.validProducts.length);
        setStep("preview");
      } catch (err: any) {
        setApiError(err.message || "CSV dosyası işlenirken hata oluştu.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteImport = async () => {
    if (!csvContent || validProductsCount === 0) return;

    setIsSubmitting(true);
    setStep("importing");
    setApiError("");

    try {
      const res = await fetch("/api/teklifim-gelsin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvContent }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Toplu içe aktarma başarısız.");
      }

      setReport(data.report);
      setStep("done");
    } catch (err: any) {
      setApiError(err.message || "Sunucuya kaydedilirken hata oluştu.");
      setStep("preview");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Toplu Ürün Aktarımı
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              CSV ile Katalog İçe Aktar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Örnek Şablon Dosyası
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Doğru formatta veri girmek için hazır CSV şablonunu indirin.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Şablonu İndir (.csv)</span>
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/20 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                CSV Dosyasını Sürükleyip Bırakın
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                veya bilgisayarınızdan dosya seçmek için tıklayın (.csv formatında)
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === "preview" && report && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {fileName}
                </span>
              </div>
              <button
                onClick={() => setStep("upload")}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                Farklı Dosya Seç
              </button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Toplam Satır</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {report.totalRows}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] text-emerald-600 font-bold block">İçe Aktarılacak</span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {validProductsCount}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center">
                <span className="text-[10px] text-rose-600 font-bold block">Hatalı Satır</span>
                <span className="text-base font-black text-rose-600 font-mono">
                  {report.errors.length}
                </span>
              </div>
            </div>

            {/* ERROR DETAILS IF ANY */}
            {report.errors.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Düzeltilmesi Gereken Hatalar ({report.errors.length})</span>
                </h5>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 divide-y divide-rose-100 dark:divide-rose-900/40">
                  {report.errors.map((err, idx) => (
                    <div key={idx} className="p-2.5 text-[11px] flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-mono font-bold shrink-0">
                        Satır {err.row}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        [{err.field}] {err.message}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  Hatalı satırlar atlanacak, sadece geçerli olan {validProductsCount} adet ürün kataloğunuza eklenecektir.
                </p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={validProductsCount === 0 || isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{validProductsCount} Ürünü İçe Aktar</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: IMPORTING */}
        {step === "importing" && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Ürünler Kataloğunuza Ekleniyor...
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lütfen işlem tamamlanana kadar pencereyi kapatmayın.
            </p>
          </div>
        )}

        {/* STEP 4: DONE */}
        {step === "done" && report && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                İçe Aktarma Tamamlandı
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Toplam {report.successfulCount} adet ürün başarıyla kataloğunuza eklendi ve yayına alındı.
              </p>
            </div>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md"
            >
              Kataloğu Görüntüle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
