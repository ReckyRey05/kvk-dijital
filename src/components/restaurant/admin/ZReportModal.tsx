"use client";

import { ZReportData } from "@/lib/restaurant/analyticsData";
import { X, Printer, Receipt, Banknote, CreditCard, ShieldCheck, Download } from "lucide-react";

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ZReportData;
}

export default function ZReportModal({ isOpen, onClose, report }: ZReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-black flex items-center justify-center font-extrabold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gün Sonu Z Raporu</h3>
              <p className="text-xs font-mono text-foreground/50">{report.reportNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div
          id="printable-z-report"
          className="bg-white text-black p-6 rounded-2xl font-mono text-xs space-y-4 shadow-inner border border-neutral-300 select-text"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-black/30 pb-3 space-y-1">
            <h4 className="font-extrabold text-sm uppercase tracking-wider">{report.restaurantName}</h4>
            <p className="text-[10px] text-neutral-600">GÜN SONU MALİ Z RAPORU</p>
            <p className="text-[10px] text-neutral-500">{report.date}</p>
            <p className="text-[10px] font-bold">Rapor No: {report.reportNumber}</p>
          </div>

          {/* Core Numbers */}
          <div className="space-y-1.5 border-b border-dashed border-black/30 pb-3">
            <div className="flex justify-between font-bold">
              <span>TOPLAM BRÜT SATIŞ:</span>
              <span className="text-sm">{report.grossSales.toLocaleString("tr-TR")} TL</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>HESAPLANAN KDV (%10):</span>
              <span>{report.taxAmount.toLocaleString("tr-TR")} TL</span>
            </div>
            <div className="flex justify-between font-extrabold text-neutral-900 pt-1 border-t border-neutral-200">
              <span>NET SATIŞ HASILATI:</span>
              <span>{report.netSales.toLocaleString("tr-TR")} TL</span>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="space-y-1.5 border-b border-dashed border-black/30 pb-3">
            <span className="font-bold block text-[11px] text-neutral-800">ÖDEME DAĞILIMI</span>
            <div className="flex justify-between">
              <span>1. KREDİ KARTI / POS:</span>
              <span className="font-bold">{report.cardTotal.toLocaleString("tr-TR")} TL</span>
            </div>
            <div className="flex justify-between">
              <span>2. NAKİT KASA:</span>
              <span className="font-bold">{report.cashTotal.toLocaleString("tr-TR")} TL</span>
            </div>
            {report.cancelledTotal > 0 && (
              <div className="flex justify-between text-red-600">
                <span>İPTAL / İADE TOPLAMI:</span>
                <span>-{report.cancelledTotal.toLocaleString("tr-TR")} TL</span>
              </div>
            )}
          </div>

          {/* Operations & Table Stats */}
          <div className="space-y-1 text-[11px] text-neutral-700">
            <div className="flex justify-between">
              <span>Kapanan Masa Sayısı:</span>
              <span className="font-bold">{report.totalTablesServed} Masa</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam Sipariş Adedi:</span>
              <span className="font-bold">{report.totalOrdersCount} Fiş</span>
            </div>
            <div className="flex justify-between">
              <span>Ortalama Adisyon (Ticket):</span>
              <span className="font-bold">{report.averageTicketSize} TL</span>
            </div>
            <div className="flex justify-between">
              <span>Ort. Masa Süresi:</span>
              <span className="font-bold">{report.averageTableDurationMinutes} Dk</span>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-dashed border-black/30 text-[9px] text-neutral-500 space-y-0.5">
            <div>*** MALİ DEĞERİ YOKTUR - GÜN SONU BİLGİLENDİRME RAPORUDUR ***</div>
            <div className="font-bold text-neutral-600">CEP GARSON POS SİSTEMLERİ • KVK DİJİTAL ÇÖZÜMLER</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handlePrint}
            className="py-3.5 rounded-xl bg-accent text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Z Raporunu Yazdır</span>
          </button>

          <button
            onClick={onClose}
            className="py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
