"use client";

import { useState } from "react";
import { Table, Restaurant } from "@/types/restaurant";
import { Printer, Download, QrCode, ExternalLink, Sparkles } from "lucide-react";

interface QrGeneratorProps {
  restaurant: Restaurant;
  tables: Table[];
}

export default function QrGenerator({ restaurant, tables }: QrGeneratorProps) {
  const [selectedTable, setSelectedTable] = useState<Table>(tables[0]);

  // Construct target QR destination URL
  const qrTargetUrl = typeof window !== "undefined"
    ? `${window.location.origin}/qr/${restaurant.slug}/${selectedTable.id}`
    : `https://kvkdijitalcozumler.com/qr/${restaurant.slug}/${selectedTable.id}`;

  // Public High-Resolution QR Generator API URL
  const qrImageApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrTargetUrl
  )}&bgcolor=FFFFFF&color=050505&margin=10`;

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Table List Selector */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Masa Seçimi ({tables.length} Masa)
        </h3>
        <p className="text-xs text-foreground/60">
          QR kodunu basmak veya indirmek istediğiniz masayı seçin.
        </p>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {tables.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTable(t)}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                selectedTable.id === t.id
                  ? "bg-accent/15 border-accent text-white shadow-md shadow-accent/10"
                  : "bg-white/[0.02] border-white/5 text-foreground/70 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
                  {t.tableNumber.replace("Masa", "M-")}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{t.tableNumber}</h4>
                  <span className="text-[10px] text-foreground/50">{t.section || "Genel Salon"}</span>
                </div>
              </div>

              <QrCode className="w-4 h-4 text-accent" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Printable Acrylic Table Stand Preview Card */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/10 rounded-3xl space-y-6">
        <div className="flex items-center justify-between w-full max-w-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
            Masa Kartı Önizlemesi
          </span>
          <button
            onClick={handlePrintCard}
            className="px-3.5 py-1.5 rounded-xl bg-accent text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 hover:bg-accent/90 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Kartı Yazdır</span>
          </button>
        </div>

        {/* Printable Physical Table Stand Design Card */}
        <div
          id="printable-table-card"
          className="w-full max-w-xs bg-white text-black p-8 rounded-3xl shadow-2xl border-4 border-neutral-200 flex flex-col items-center text-center space-y-5"
        >
          {/* Brand Logo & Name */}
          <div className="space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
              <Sparkles className="w-6 h-6 text-[#00A6A6]" />
            </div>
            <h3 className="text-lg font-black tracking-tight mt-2">{restaurant.name}</h3>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
              Temassız QR Menü
            </p>
          </div>

          {/* QR Code Frame */}
          <div className="p-3 bg-neutral-50 rounded-2xl border-2 border-neutral-200 shadow-inner">
            <img
              src={qrImageApiUrl}
              alt={`QR Code ${selectedTable.tableNumber}`}
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Table Number & Call to Action */}
          <div className="space-y-1">
            <div className="inline-block px-4 py-1 rounded-full bg-neutral-900 text-white font-extrabold text-xs tracking-wider uppercase">
              {selectedTable.tableNumber}
            </div>
            <p className="text-[11px] font-medium text-neutral-600 pt-1">
              Kameranızla okutarak menüyü inceleyebilir ve doğrudan sipariş verebilirsiniz.
            </p>
          </div>
        </div>

        {/* Live URL Link */}
        <a
          href={qrTargetUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-accent hover:underline flex items-center gap-1.5 font-mono"
        >
          <span>{qrTargetUrl}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
