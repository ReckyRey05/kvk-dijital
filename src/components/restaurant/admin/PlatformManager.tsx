"use client";

import { useState } from "react";
import { useRestaurantStore } from "@/lib/restaurant/store";
import { SAAS_PACKAGES } from "@/lib/restaurant/mockData";
import {
  Bike,
  FileCheck2,
  Layers,
  Key,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  Building,
  CreditCard,
  Printer,
  Sparkles,
} from "lucide-react";

export default function PlatformManager() {
  const {
    deliveryPlatforms,
    toggleDeliveryPlatform,
    efaturaRecords,
  } = useRestaurantStore();

  const [activeSubTab, setActiveSubTab] = useState<"PLATFORMS" | "EFATURA" | "PACKAGES">("PLATFORMS");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-accent" />
            <span>Platform Entegrasyonları & E-Fatura Hub</span>
          </h2>
          <p className="text-xs text-foreground/60">
            Yemek platformları (Getir, Yemeksepeti, Trendyol), GİB E-Fatura ve SaaS lisans yönetimi
          </p>
        </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto sleek-scrollbar pb-1 sm:pb-0">
        <button
          onClick={() => setActiveSubTab("PLATFORMS")}
          className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === "PLATFORMS"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          Yemek Platformları ({deliveryPlatforms.length})
        </button>

        <button
          onClick={() => setActiveSubTab("EFATURA")}
          className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === "EFATURA"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          E-Fatura & GİB ({efaturaRecords.length})
        </button>

        <button
          onClick={() => setActiveSubTab("PACKAGES")}
          className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === "PACKAGES"
              ? "bg-accent text-black shadow-md shadow-accent/20"
              : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          SaaS Paket & Lisanslar
        </button>
      </div>
      </div>

      {/* 1. YEMEK PLATFORMLARI TAB */}
      {activeSubTab === "PLATFORMS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryPlatforms.map((p) => {
              return (
                <div
                  key={p.platform}
                  className="p-5 rounded-2xl bg-[#0a0f0f] border border-white/10 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-white border border-white/10">
                        <Bike className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">{p.name} Entegrasyonu</h4>
                        <span className={`text-[10px] font-bold ${p.isOpen ? "text-emerald-400" : "text-red-400"}`}>
                          ● {p.isOpen ? "Canlıda (Sipariş Kabul Ediliyor)" : "Kapalı"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleDeliveryPlatform(p.platform)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        p.isOpen
                          ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                      }`}
                    >
                      {p.isOpen ? "Kanalı Kapat" : "Kanalı Aç"}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-foreground/50 block font-semibold mb-1">
                        API Secret / Entegrasyon Anahtarı
                      </label>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <Key className="w-3.5 h-3.5 text-foreground/40" />
                        <input
                          type="password"
                          readOnly
                          value={p.apiKey || "gy_live_sec_849201"}
                          className="bg-transparent text-white text-xs w-full outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-foreground/50 block">Otomatik Onay:</span>
                        <span className="font-bold text-white">{p.autoAccept ? "Aktif" : "Manuel Kasa Onayı"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-foreground/50 block">Ekstra Mutfak Süresi:</span>
                        <span className="font-bold text-white">+{p.extraPrepTimeMinutes} Dk</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. E-FATURA & GİB TAB */}
      {activeSubTab === "EFATURA" && (
        <div className="space-y-6">
          {/* Provider Settings Card */}
          <div className="p-6 rounded-2xl bg-[#0a0f0f] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">GİB & E-Fatura Entegratör Ayarları</h4>
                  <p className="text-xs text-foreground/60">Paraşüt / BizimHesap / QNB e-Finans API Bağlantısı</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                Bağlantı Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-foreground/50 block">Aktif Entegratör:</span>
                <span className="font-bold text-white">Paraşüt E-Fatura API (v4.2)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-foreground/50 block">Firma VKN / TCKN:</span>
                <span className="font-mono font-bold text-white">3892019482</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-foreground/50 block">Fatura Seri No Prefix:</span>
                <span className="font-mono font-bold text-emerald-400">AUR2026-XXXXX</span>
              </div>
            </div>
          </div>

          {/* Issued Invoices Log Table */}
          <div className="rounded-2xl bg-[#0a0f0f] border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Kesilen Resmi E-Fatura & E-Adisyon Geçmişi</h4>
              <span className="text-xs text-foreground/50">{efaturaRecords.length} Fatura</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-foreground/50 font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Fatura No / ETTN</th>
                    <th className="p-3.5">Alıcı Ünvanı</th>
                    <th className="p-3.5">VKN / TCKN</th>
                    <th className="p-3.5">Masa / Sipariş</th>
                    <th className="p-3.5">Tarih</th>
                    <th className="p-3.5">Tutar</th>
                    <th className="p-3.5">Durum</th>
                    <th className="p-3.5 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {efaturaRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-white block">{rec.faturaNo}</span>
                        <span className="text-[10px] text-foreground/40">{rec.ettnNo.slice(0, 18)}...</span>
                      </td>
                      <td className="p-3.5 font-medium text-white">{rec.recipientTitle}</td>
                      <td className="p-3.5 font-mono text-foreground/70">{rec.vknTckn}</td>
                      <td className="p-3.5 font-medium text-foreground/80">{rec.tableNumber || "-"}</td>
                      <td className="p-3.5 text-foreground/60">
                        {new Date(rec.issuedAt).toLocaleString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-3.5 font-black text-emerald-400">
                        {rec.grossTotal.toLocaleString("tr-TR")} TL
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          GİB İletildi
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => window.print()}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                          title="Fatura PDF Yazdır"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SAAS PAKET & LİSANSLAR TAB */}
      {activeSubTab === "PACKAGES" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAAS_PACKAGES.map((pkg) => (
              <div
                key={pkg.tier}
                className={`p-6 rounded-3xl bg-[#0a0f0f] border transition-all flex flex-col justify-between relative ${
                  pkg.isPopular
                    ? "border-accent ring-2 ring-accent/30 shadow-2xl shadow-accent/10"
                    : "border-white/10"
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-accent text-black font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                    En Çok Tercih Edilen
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{pkg.name}</h3>
                    <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{pkg.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">{pkg.monthlyPrice} TL</span>
                      <span className="text-xs text-foreground/50 font-bold">/ ay</span>
                    </div>
                    <span className="text-[11px] text-accent font-semibold block mt-0.5">
                      Yıllık: {pkg.annualPrice.toLocaleString("tr-TR")} TL + KDV
                    </span>
                  </div>

                  <ul className="space-y-2.5 pt-3 border-t border-white/5 text-xs text-foreground/80">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <span className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-extrabold text-xs flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>Lisans Aktif</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
