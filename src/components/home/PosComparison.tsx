"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function PosComparison() {
  const comparisonItems = [
    {
      feature: "Grup Masada Canlı Ortak Sepet (Group Dining)",
      traditional: "Yok (Tekil menü veya herkes garson çağırır)",
      kvk: "Var (İlk okutan Masa Reisi olur, herkes kendi telefonundan sepete ekler, tek tıkla onaylar)",
      isSuperior: true,
    },
    {
      feature: "Masada Kendi Payını Ödeme (Pay My Share)",
      traditional: "Yok (Garsonun pos ile gelip tek tek kart çekmesi gerekir)",
      kvk: "Var (Masadan kalkmadan 3D Secure ile sadece kendi yediklerini anında ödeme)",
      isSuperior: true,
    },
    {
      feature: "Reçete, Gramaj & Gerçek Kâr Marjı (BOM)",
      traditional: "Sadece pahalı Enterprise paketlerde kilitli",
      kvk: "Doğrudan Çekirdek Pakette (Porsiyon maliyeti, kâr marjı %, gramaj ve fire takibi)",
      isSuperior: true,
    },
    {
      feature: "Korumalı Patron Şikayet Günlüğü & Küfür Filtresi",
      traditional: "Yok (Garsonlar ekrandan bildirimi kapatıp gizleyebilir)",
      kvk: "Var (Küfürler otomatik sansürlenir, garsonlar silemez, sadece patron silebilir)",
      isSuperior: true,
    },
    {
      feature: "Akıllı İtibar Kalkanı (Google 5 Yıldız)",
      traditional: "Yok",
      kvk: "Var (Memnun müşteriler otomatik Google Haritalar'a, şikayetler anında kasaya yönlendirilir)",
      isSuperior: true,
    },
    {
      feature: "Müşteri Lead-Gen & Eğlence (Gamification)",
      traditional: "Kuru puan toplama",
      kvk: "İkram Çarkıfeleği (Kupon üretici) + Dijital Jukebox (Masadan şarkı oylama)",
      isSuperior: true,
    },
    {
      feature: "Yemek Platformları Hub (Getir, Yemeksepeti, Trendyol)",
      traditional: "Ayrı ek ücret veya kısıtlı",
      kvk: "Merkezi Entegrasyon (Tek ekranda paket kabul & kurye fişi yazdırma)",
      isSuperior: true,
    },
    {
      feature: "Resmi GİB E-Fatura & E-Adisyon",
      traditional: "Karmaşık ve tek sağlayıcı",
      kvk: "Paraşüt, BizimHesap, QNB, GİB Portal Uyumlu Tek Tıkla Kesme",
      isSuperior: true,
    },
    {
      feature: "Donanım Bağımsızlığı & Kurulum",
      traditional: "Ağır Windows yazılımları veya özel pos cihazları",
      kvk: "Sıfır Donanım Maliyeti (Herhangi bir iPad, tablet, telefon veya bilgisayardan anında çalışır)",
      isSuperior: true,
    },
  ];

  return (
    <section className="py-20 bg-[#070b0b] border-t border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-extrabold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Sektörde Yeni Standart</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Neden Klasik QR Menüler Yerine <span className="text-accent">Cep Garson OS</span>?
          </h2>
          <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
            Geleneksel restoran yazılımları (vRest vb.) yalnızca statik ürün listeler. Cep Garson ise masadaki misafirden mutfaktaki aşçıya, depodaki reçeteden kasadaki Z-raporuna kadar tüm işletmenizi dijital bir makineye dönüştürür.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl bg-[#0a0f0f] border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-white">
                  <th className="p-4 sm:p-5 font-bold w-2/5">Özellik / Karşılaştırma</th>
                  <th className="p-4 sm:p-5 font-bold text-foreground/50 w-1/4">Klasik QR & POS Sistemleri</th>
                  <th className="p-4 sm:p-5 font-extrabold text-accent w-1/3 bg-accent/5">
                    KvK Dijital Cep Garson OS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white leading-snug">
                      {item.feature}
                    </td>
                    <td className="p-4 sm:p-5 text-foreground/50 leading-snug">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500/70 shrink-0 mt-0.5" />
                        <span>{item.traditional}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-white font-medium bg-accent/[0.03] leading-snug">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground/90">{item.kvk}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-accent/15 via-accent/5 to-transparent border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-black text-white">
              Restoranınızı Geleceğin İşletim Sistemiyle Güçlendirin
            </h3>
            <p className="text-xs sm:text-sm text-foreground/70">
              Canlı demo terminalini test edin veya işletmenize özel kurulum için hemen iletişime geçin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/restoran/aura-bistro/kasa"
              className="px-6 py-3 rounded-2xl bg-accent text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all flex items-center gap-2"
            >
              <span>Canlı Demo POS Paneli</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/qr/aura-bistro/m-4"
              target="_blank"
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all"
            >
              Masa QR Menüyü Dene
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
