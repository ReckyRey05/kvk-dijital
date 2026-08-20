"use client";

import { useState } from "react";
import { EFaturaProvider, EFaturaRecord } from "@/types/restaurant";
import { useRestaurantStore } from "@/lib/restaurant/store";
import {
  X,
  FileCheck2,
  Send,
  Building2,
  Mail,
  Receipt,
  CheckCircle2,
  Printer,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface EFaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  totalAmount: number;
}

export default function EFaturaModal({
  isOpen,
  onClose,
  tableNumber,
  totalAmount,
}: EFaturaModalProps) {
  const { issueEFatura } = useRestaurantStore();

  const [vknTckn, setVknTckn] = useState("");
  const [recipientTitle, setRecipientTitle] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<EFaturaProvider>("PARASUT");
  const [issuedRecord, setIssuedRecord] = useState<EFaturaRecord | null>(null);

  if (!isOpen) return null;

  const kdvAmount = Math.round(totalAmount * 0.1);
  const netAmount = totalAmount - kdvAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vknTckn.trim() || !recipientTitle.trim()) return;

    const pad = (n: number) => n.toString().padStart(2, "0");
    const now = new Date();
    const sequence = Math.floor(1000 + Math.random() * 9000);
    const faturaNo = `AUR${now.getFullYear()}${pad(now.getMonth() + 1)}${sequence}`;
    const ettnNo = crypto.randomUUID ? crypto.randomUUID() : `ettn_${Date.now()}`;

    const record: EFaturaRecord = {
      id: `efat_${Date.now()}`,
      ettnNo,
      faturaNo,
      tableNumber,
      vknTckn: vknTckn.trim(),
      recipientTitle: recipientTitle.trim(),
      taxOffice: taxOffice.trim() || undefined,
      recipientEmail: email.trim() || undefined,
      grossTotal: totalAmount,
      kdvTotal: kdvAmount,
      netTotal: netAmount,
      status: "SENT_TO_GIB",
      issuedAt: now.toISOString(),
    };

    issueEFatura(record);
    setIssuedRecord(record);
  };

  const handleClose = () => {
    setIssuedRecord(null);
    setVknTckn("");
    setRecipientTitle("");
    setTaxOffice("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0a0f0f] border border-white/10 rounded-[2rem] p-6 space-y-5 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Resmi E-Fatura & E-Adisyon Kes</h3>
              <p className="text-xs text-foreground/60">{tableNumber} • GİB / E-Arşiv Portal Entegrasyonu</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {issuedRecord ? (
          <div className="py-6 space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white">E-Fatura Başarıyla Kesildi</h4>
              <p className="text-xs text-foreground/60 font-mono">Fatura No: {issuedRecord.faturaNo}</p>
              <p className="text-[11px] text-emerald-400 font-semibold">
                GİB sistemine iletildi {issuedRecord.recipientEmail && `ve ${issuedRecord.recipientEmail} adresine postalandı.`}
              </p>
            </div>

            {/* Invoice summary box */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-foreground/50">ETTN Kodu:</span>
                <span className="text-white truncate max-w-[200px]">{issuedRecord.ettnNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/50">Alıcı Ünvanı:</span>
                <span className="text-white font-bold">{issuedRecord.recipientTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/50">VKN / TCKN:</span>
                <span className="text-white">{issuedRecord.vknTckn}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-1.5 font-bold">
                <span className="text-foreground/70">Toplam Fatura Tutarı:</span>
                <span className="text-emerald-400 text-sm">{issuedRecord.grossTotal.toLocaleString("tr-TR")} TL</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>E-Faturayı Yazdır</span>
              </button>
              <button
                onClick={handleClose}
                className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Tamamla
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Strip */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-foreground/50 block">Net Tutar</span>
                <span className="font-bold text-white">{netAmount.toLocaleString("tr-TR")} TL</span>
              </div>
              <div>
                <span className="text-[10px] text-foreground/50 block">KDV (%10)</span>
                <span className="font-bold text-amber-400">{kdvAmount.toLocaleString("tr-TR")} TL</span>
              </div>
              <div>
                <span className="text-[10px] text-foreground/50 block">Genel Toplam</span>
                <span className="font-black text-emerald-400">{totalAmount.toLocaleString("tr-TR")} TL</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">
                    VKN / TC Kimlik No *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="10 veya 11 Haneli"
                    value={vknTckn}
                    onChange={(e) => setVknTckn(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Kadıköy V.D."
                    value={taxOffice}
                    onChange={(e) => setTaxOffice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-foreground/60 font-bold block mb-1">
                  Müşteri Adı Soyadı / Şirket Tam Ünvanı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: ABC LOJİSTİK VE GIDA A.Ş."
                  value={recipientTitle}
                  onChange={(e) => setRecipientTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">
                    Faturanın Gönderileceği E-Posta
                  </label>
                  <input
                    type="email"
                    placeholder="muhasebe@sirket.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-foreground/60 font-bold block mb-1">
                    Entegratör Sağlayıcı
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as EFaturaProvider)}
                    className="w-full bg-[#121818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value="PARASUT">Paraşüt E-Fatura</option>
                    <option value="BIZIMHESAP">BizimHesap</option>
                    <option value="QNB_EFINANS">QNB e-Finans</option>
                    <option value="GIB_PORTAL">GİB E-Arşiv Portal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!vknTckn.trim() || !recipientTitle.trim()}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>GİB E-Faturayı Onayla & Kes</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
