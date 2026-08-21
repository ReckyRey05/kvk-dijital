# CEP GARSON — GÖZLENEBİLİRLİK VE GİZLİ VERİ ARINDIRMA (OBSERVABILITY)
**Faz:** FAZ 8 — Observability, Structured Logging & Log Redaction  
**Tarih:** 2026-08-21  

---

## 1. GİZLİ VERİ ARINDIRMA FİLTRESİ ([`sanitizeLogOutput`](file:///c:/Users/ali_h/Desktop/Kvk%20Dijital/src/lib/observability/healthCheck.ts))

Üretim loglarına asla hassas bilgi yazılmaz:
- **PIN ve Master PIN:** `[REDACTED_PIN]`
- **Oturum ve Bearer Token:** `Bearer [REDACTED_TOKEN]`
- **Parolalar ve API Sırları:** `[REDACTED_SECRET]`
- **Kredi Kartı Numaraları:** `[REDACTED_CARD]`

---

## 2. SAĞLIK KONTROLÜ VE PROBE UÇ NOKTASI (`/api/health`)

`/api/health` uç noktası HTTP GET ile çağrıldığında sistemin canlılık (`Liveness`) ve hazır bulunuşluk (`Readiness`) durumunu döndürür:
- Veritabanı gecikmesi (`latencyMs`)
- Kimlik doğrulama motoru (`authEngine: UP`)
- Hız sınırlandırıcı (`rateLimiter: UP`)
- POS köprüsü (`posBridge: UP`)
