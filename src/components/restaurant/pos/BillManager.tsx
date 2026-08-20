"use client";

import { useState } from "react";
import { Table, Order } from "@/types/restaurant";
import { X, Receipt, Printer, CreditCard, Banknote, ShieldX, ArrowRightLeft, Check } from "lucide-react";
import { formatEscPosReceipt } from "@/lib/restaurant/posBridge";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";

interface BillManagerProps {
  table: Table;
  tableOrders: Order[];
  allTables?: Table[];
  onClose: () => void;
  onCloseBill: (tableId: string) => void;
  onTransferTable?: (fromTableId: string, toTableId: string) => void;
  onOpenEFatura?: () => void;
}

export default function BillManager({
  table,
  tableOrders,
  allTables = [],
  onClose,
  onCloseBill,
  onTransferTable,
  onOpenEFatura,
}: BillManagerProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [targetTableId, setTargetTableId] = useState("");

  const allItems = tableOrders.flatMap((o) => o.items);
  const totalAmount = table.activeBillTotal;

  const handlePrintReceipt = () => {
    if (tableOrders.length === 0) return;
    const receiptText = formatEscPosReceipt(tableOrders[0], DEMO_RESTAURANT.name);
    // In real environment, sends to local print daemon or window.print()
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(
        `<pre style="font-family: monospace; font-size: 14px; padding: 20px;">${receiptText.replace(/\x1B\x61\x01|\x1B\x21\x30|\x1B\x21\x00|\x1B\x61\x00|\x1B\x61\x02|\x1B\x21\x20|\x1D\x56\x41\x10/g, "")}</pre>`
      );
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCompleteCheckout = (paymentMethod: "CASH" | "CARD") => {
    onCloseBill(table.id);
    onClose();
  };

  const handleExecuteTransfer = () => {
    if (!targetTableId || !onTransferTable) return;
    onTransferTable(table.id, targetTableId);
    setIsTransferring(false);
    onClose();
  };

  return (
    <div className="w-full lg:w-96 bg-[#0a0f0f] border-t lg:border-t-0 lg:border-l border-white/10 p-4 sm:p-6 flex flex-col justify-between h-auto lg:h-full shrink-0 shadow-2xl">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">{table.tableNumber}</h2>
              {table.section && (
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-white/5 text-foreground/60">
                  {table.section}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-foreground/50 mt-0.5">Masa Adisyon Yönetimi</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Paneli Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bill Items List */}
        <div className="space-y-2 max-h-52 sm:max-h-72 lg:max-h-[calc(100vh-420px)] overflow-y-auto pr-1 sleek-scrollbar">
          {allItems.length === 0 ? (
            <div className="py-10 sm:py-16 text-center text-foreground/40 space-y-2">
              <Receipt className="w-7 h-7 sm:w-8 sm:h-8 mx-auto opacity-40" />
              <p className="text-xs font-medium">Bu masada henüz aktif sipariş yok.</p>
            </div>
          ) : (
            allItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-white break-words">
                    {item.quantity}x {item.name}
                  </span>
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <p className="text-[10px] text-foreground/50 mt-0.5 break-words">
                      {item.selectedOptions
                        .flatMap((g) => g.selectedItems.map((s) => s.name))
                        .join(", ")}
                    </p>
                  )}
                </div>

                <span className="font-bold text-white shrink-0 ml-2">
                  {(item.finalPrice * item.quantity).toLocaleString("tr-TR")} TL
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer / Settlement Actions */}
      <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-white/10 mt-4 lg:mt-0">
        {/* Total & Print & Transfer Row */}
        <div className="space-y-2">
          <div className="flex flex-wrap xs:flex-nowrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrintReceipt}
                disabled={allItems.length === 0}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Fiş</span>
              </button>

              <button
                onClick={() => setIsTransferring(!isTransferring)}
                disabled={totalAmount === 0}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Masa Taşı</span>
              </button>
            </div>

            <div className="text-right ml-auto">
              <span className="text-[9px] sm:text-[10px] text-foreground/50 block uppercase tracking-wider">
                Adisyon Toplamı
              </span>
              <span className="text-xl sm:text-2xl font-black text-accent">
                {totalAmount.toLocaleString("tr-TR")}{" "}
                <span className="text-xs sm:text-sm text-foreground/60 font-bold">TL</span>
              </span>
            </div>
          </div>

          {/* Table Transfer Selector Panel */}
          {isTransferring && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                <span>Hedef Masayı Seçin</span>
                <button
                  onClick={() => setIsTransferring(false)}
                  className="text-purple-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full bg-black/60 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Hedef Masa Seçin...</option>
                {allTables
                  .filter((t) => t.id !== table.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} {t.status !== "EMPTY" ? `(Dolu - Birleştirilir: ${t.activeBillTotal} TL)` : "(Boş)"}
                    </option>
                  ))}
              </select>

              <button
                onClick={handleExecuteTransfer}
                disabled={!targetTableId}
                className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Adisyonu Masaya Aktar</span>
              </button>
            </div>
          )}
        </div>

        {/* Instant Session Invalidation Warning */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] sm:text-[11px] text-amber-300 flex items-start gap-2">
          <ShieldX className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            Hesap kapatıldığında masaya ait <strong>tüm QR oturumları anında iptal edilir</strong> ve masa sıfırlanır.
          </span>
        </div>

        {/* Settlement Payment Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={() => handleCompleteCheckout("CASH")}
            disabled={totalAmount === 0}
            className="py-3 sm:py-3.5 px-2 sm:px-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 shadow-lg shadow-green-500/20 cursor-pointer"
          >
            <Banknote className="w-4 h-4 shrink-0" />
            <span>Nakit Kapat</span>
          </button>

          <button
            onClick={() => handleCompleteCheckout("CARD")}
            disabled={totalAmount === 0}
            className="py-3 sm:py-3.5 px-2 sm:px-3 rounded-xl bg-accent hover:bg-accent/90 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 shadow-lg shadow-accent/20 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>POS / Kart</span>
          </button>
        </div>

        {/* E-Fatura & E-Adisyon Action */}
        {onOpenEFatura && (
          <button
            onClick={onOpenEFatura}
            disabled={totalAmount === 0}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>E-Fatura & E-Adisyon Kes</span>
          </button>
        )}
      </div>
    </div>
  );
}
