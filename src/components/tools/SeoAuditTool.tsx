"use client";

import { useState } from "react";
import { Search, Gauge, ShieldCheck, SearchCheck, Smartphone, ArrowRight, MessageSquare, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

interface AuditResult {
  url: string;
  scores: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  };
  metrics: {
    fcp: string;
    lcp: string;
    cls: string;
    speedIndex: string;
  };
  findings: string[];
}

export default function SeoAuditTool() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "Hedef web sitesine bağlanılıyor...",
    "Mobil yükleme hızı ve LCP ölçülüyor...",
    "SEO, meta etiketleri ve başlıklar taranıyor...",
    "SSL güvenlik ve erişilebilirlik analiz ediliyor...",
    "Kişiselleştirilmiş SEO karneniz oluşturuluyor..."
  ];

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      setError("Lütfen analiz etmek istediğiniz web adresini girin.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setScanStep(0);

    // Animate scanning progress steps
    const interval = setInterval(() => {
      setScanStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const res = await fetch("/api/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Web sitesi taranamadı. Lütfen adresi kontrol edin.");
      }

      const data: AuditResult = await res.json();
      setResult(data);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 70) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Tool Header & Input Form */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border-accent/30 bg-gradient-to-br from-card via-[#0c1414] to-card shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
          <Gauge className="w-4 h-4" /> 100% Ücretsiz Canlı SEO & Hız Analizi
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          Web Sitenizin <span className="text-accent">SEO ve Hız Puanını</span> 10 Saniyede Ölçün
        </h2>
        <p className="text-foreground/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Google standartlarına göre web sitenizin açılış hızını, mobil uyumluluğunu ve SEO hatalarını anında ücretsiz analiz edin.
        </p>

        <form onSubmit={handleAudit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              required
              placeholder="örneğin: firmasitesi.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white/5 border border-white/15 focus:outline-none focus:border-accent focus:bg-white/10 text-white font-medium placeholder:text-foreground/40 transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 rounded-full bg-accent text-slate-950 font-bold text-sm tracking-wide uppercase hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Taratılıyor...
              </>
            ) : (
              <>
                Analiz Et <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center font-medium flex items-center justify-center gap-2 max-w-2xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading Scanning Radar State */}
      {loading && (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border-white/10 text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-white">Web Siteniz Taranıyor</h3>
          <p className="text-accent text-sm font-medium">{steps[scanStep]}</p>
        </div>
      )}

      {/* Audit Results View */}
      {result && !loading && (
        <div className="space-y-8 animate-fade-in">
          {/* Score Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`glass-panel p-6 rounded-2xl border text-center space-y-2 ${getScoreColor(result.scores.performance)}`}>
              <Gauge className="w-6 h-6 mx-auto opacity-80" />
              <div className="text-3xl font-bold font-mono">{result.scores.performance} / 100</div>
              <div className="text-xs font-semibold tracking-wider uppercase opacity-80">Performans</div>
            </div>

            <div className={`glass-panel p-6 rounded-2xl border text-center space-y-2 ${getScoreColor(result.scores.seo)}`}>
              <SearchCheck className="w-6 h-6 mx-auto opacity-80" />
              <div className="text-3xl font-bold font-mono">{result.scores.seo} / 100</div>
              <div className="text-xs font-semibold tracking-wider uppercase opacity-80">SEO Skoru</div>
            </div>

            <div className={`glass-panel p-6 rounded-2xl border text-center space-y-2 ${getScoreColor(result.scores.accessibility)}`}>
              <Smartphone className="w-6 h-6 mx-auto opacity-80" />
              <div className="text-3xl font-bold font-mono">{result.scores.accessibility} / 100</div>
              <div className="text-xs font-semibold tracking-wider uppercase opacity-80">Mobil Uyum</div>
            </div>

            <div className={`glass-panel p-6 rounded-2xl border text-center space-y-2 ${getScoreColor(result.scores.bestPractices)}`}>
              <ShieldCheck className="w-6 h-6 mx-auto opacity-80" />
              <div className="text-3xl font-bold font-mono">{result.scores.bestPractices} / 100</div>
              <div className="text-xs font-semibold tracking-wider uppercase opacity-80">Güvenlik & SSL</div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-accent" /> Canlı Hız Metrikleri ({result.url})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-foreground/60 block">Mobil Açılış (LCP)</span>
                <span className="text-lg font-bold text-accent font-mono">{result.metrics.lcp}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-foreground/60 block">İlk Metin Boyama (FCP)</span>
                <span className="text-lg font-bold text-white font-mono">{result.metrics.fcp}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-foreground/60 block">Düzen Kayması (CLS)</span>
                <span className="text-lg font-bold text-white font-mono">{result.metrics.cls}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-foreground/60 block">Hız İndeksi (Speed Index)</span>
                <span className="text-lg font-bold text-white font-mono">{result.metrics.speedIndex}</span>
              </div>
            </div>
          </div>

          {/* Findings Checklist */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> İyileştirme Gereken İnceleme Noktaları
            </h3>
            <ul className="space-y-3 pt-2">
              {result.findings.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* High-Converting Lead Action Banner */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-card via-[#0c1414] to-card border-accent/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Sitenizin SEO ve Hız Puanını <span className="text-accent">95+ Seviyesine</span> Yükseltelim
            </h3>
            <p className="text-foreground/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Sitenizdeki teknik aksaklıkları gidermek, açılış hızını 1.5 saniyenin altına düşürmek ve Google'da üst sıralara çıkmak için ücretsiz danışmanlık teklifi alın.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/#contact"
                className="px-8 py-4 rounded-full bg-accent text-slate-950 font-bold text-sm uppercase tracking-wide hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer inline-flex items-center gap-2"
              >
                Ücretsiz Teklif İsteğin <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://wa.me/905348914905?text=${encodeURIComponent(
                  `Merhaba KvK Dijital, ${result.url} web sitemin SEO puanı ${result.scores.seo}/100 ve Performans puanı ${result.scores.performance}/100 çıktı. İyileştirme teklifi almak istiyorum.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors text-sm inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp'tan Görüşelim
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
