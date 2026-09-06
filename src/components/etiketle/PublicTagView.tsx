"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  MapPin,
  Package,
  Layers,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Share2,
  ExternalLink,
  ShieldCheck,
  Archive,
  Info,
} from "lucide-react";
import { EtiketlePublicTag } from "@/types/etiketle";

export default function PublicTagView({ codeProp }: { codeProp?: string }) {
  const params = useParams();
  const rawCode = codeProp || (params?.code as string) || "";
  const code = rawCode.trim().toUpperCase();

  const [tag, setTag] = useState<EtiketlePublicTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    loadTagData();
  }, [code]);

  useEffect(() => {
    if (tag?.name) {
      document.title = `${tag.name} (${tag.code}) | Etiketle`;
    }
  }, [tag]);

  const loadTagData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      let fetchedTag: EtiketlePublicTag | null = null;

      // Tier 1: Fast Server API
      try {
        const res = await fetch(`/api/etiketle/public/${encodeURIComponent(code)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.tag) {
            fetchedTag = data.tag;
          }
        } else if (res.status === 404) {
          throw new Error("Etiket bulunamadı. Lütfen QR kodun doğruluğunu kontrol edin.");
        }
      } catch (apiErr: any) {
        if (apiErr?.message?.includes("bulunamadı")) {
          throw apiErr;
        }
        console.warn("Public tag API fetch notice:", apiErr);
      }

      // Tier 2: Client Firestore fallback
      if (!fetchedTag) {
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const q = query(collection(db, "etiketle_tags"), where("code", "==", code));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0].data();
            fetchedTag = {
              code: d.code,
              name: d.name,
              category: d.category || "Genel",
              quantity: d.quantity ?? 0,
              unit: d.unit || "Adet",
              location: d.location || "Belirtilmedi",
              description: d.description || "",
              imageUrl: d.imageUrl || "",
              status: d.status || "active",
              updatedAt: d.updatedAt || Date.now(),
            };
          }
        } catch (dbErr) {
          console.warn("Client Firestore public tag lookup notice:", dbErr);
        }
      }

      if (!fetchedTag) {
        throw new Error("Etiket bulunamadı. QR kod hatalı veya etiket sistemden kaldırılmış olabilir.");
      }

      setTag(fetchedTag);
    } catch (err: any) {
      setError(err.message || "Etiket bilgileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: tag?.name ? `${tag.name} - Etiketle` : "Etiket Bilgisi",
          text: `${tag?.name || "Etiket"} detayları ve güncel konumu`,
          url,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(url);
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Bilinmiyor";
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs tracking-wider uppercase text-slate-400 font-semibold">
          Etiket Bilgileri Yükleniyor...
        </p>
      </div>
    );
  }

  // ERROR OR NOT FOUND STATE
  if (error || !tag) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Etiket Bulunamadı</h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {error || "Aradığınız QR kod sistemde kayıtlı değil veya işletme tarafından silinmiş."}
            </p>
            {code && (
              <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-slate-300">
                Kod: {code}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => loadTagData(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Tekrar Dene
            </button>
            <Link
              href="/etiketle"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-colors"
            >
              Etiketle Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isInactive = tag.status === "inactive";
  const isArchived = tag.status === "archived";

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black py-6 sm:py-12 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        {/* TOP BRAND BAR */}
        <header className="flex items-center justify-between px-2">
          <Link
            href="/etiketle"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-white">Etiketle</span>
              <span className="text-[10px] text-slate-400">Fiziksel Nesne Takibi</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTagData(true)}
              disabled={refreshing}
              title="Güncel veriyi kontrol et"
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              title="Bağlantıyı Paylaş / Kopyala"
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer relative"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -bottom-8 right-0 bg-cyan-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Kopyalandı
                </span>
              )}
            </button>
          </div>
        </header>

        {/* STATUS ALERT BANNER (If inactive or archived) */}
        {isInactive && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Bu Etiket Kullanım Dışıdır (Pasif)</strong>
              <span>İşletme bu etiketi pasife almıştır. Mevcut bilgiler güncel olmayabilir.</span>
            </div>
          </div>
        )}

        {isArchived && (
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-start gap-3">
            <Archive className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Bu Etiket Arşivlenmiştir</strong>
              <span>Bu kayıt işletme tarafından arşive kaldırılmıştır.</span>
            </div>
          </div>
        )}

        {/* MAIN INFO CARD */}
        <main className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-sm">
          {/* TITLE & CODE BADGE */}
          <div className="space-y-2 border-b border-slate-800/80 pb-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                <QrCode className="w-3.5 h-3.5" />
                <span>#{tag.code}</span>
              </div>

              {/* STATUS PILL */}
              {tag.status === "active" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Aktif Etiket
                </span>
              ) : isInactive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
                  Pasif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-slate-400 text-[11px] font-bold">
                  Arşivde
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug pt-1">
              {tag.name}
            </h1>

            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{tag.category}</span>
            </div>
          </div>

          {/* KEY METRICS GRID */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* QUANTITY CARD */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                Miktar
              </span>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {tag.quantity}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400">
                  {tag.unit}
                </span>
              </div>
            </div>

            {/* LOCATION CARD */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Konum / Raf
              </span>
              <div className="mt-3">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight break-words line-clamp-2">
                  {tag.location || "Belirtilmedi"}
                </span>
              </div>
            </div>
          </div>

          {/* DESCRIPTION BLOCK */}
          {tag.description && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Açıklama & Notlar</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {tag.description}
              </p>
            </div>
          )}

          {/* PHOTO IF EXISTS */}
          {tag.imageUrl && (
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                Görsel / Fotoğraf
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-72 flex items-center justify-center">
                <img
                  src={tag.imageUrl}
                  alt={tag.name}
                  className="w-full h-auto max-h-72 object-contain"
                />
              </div>
            </div>
          )}

          {/* METADATA FOOTNOTE */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Son Güncelleme: {formatDate(tag.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Statik QR • Dinamik Bilgi</span>
            </div>
          </div>
        </main>

        {/* PROMO / FOOTER CARD */}
        <footer className="text-center space-y-3 pt-2 pb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-blue-950/30 border border-slate-800/60 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-slate-300 text-center sm:text-left">
              Fiziksel kutularınızı ve eşyalarınızı dijitale bağlamak ister misiniz?
            </span>
            <Link
              href="/etiketle"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors whitespace-nowrap"
            >
              Etiketle’yi İncele
            </Link>
          </div>

          <p className="text-[11px] text-slate-500">
            Etiketle bir <strong className="text-slate-400 font-semibold">KvK Dijital Çözümler</strong> ürünüdür.
          </p>
        </footer>
      </div>
    </div>
  );
}
