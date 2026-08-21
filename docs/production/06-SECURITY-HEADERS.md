# CEP GARSON — HTTP GÜVENLİK BAŞLIKLARI VE CSP (SECURITY HEADERS)
**Faz:** FAZ 6 — Security Headers, HSTS & Content Security Policy  
**Tarih:** 2026-08-21  

---

## 1. PRODUCTION HTTP BAŞLIKLARI ([`next.config.ts`](file:///c:/Users/ali_h/Desktop/Kvk%20Dijital/next.config.ts))

| HTTP Yanıt Başlığı | Değer | Amaç / Koruması |
| :--- | :--- | :--- |
| **Content-Security-Policy** | `default-src 'self'; object-src 'none'; base-uri 'self'; ...` | XSS, Veri Enjeksiyonu, Güvenilmeyen Kaynak Koruması |
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | Zorunlu HTTPS (2 Yıl) ve SSL Downgrade Koruması |
| **X-Content-Type-Options** | `nosniff` | MIME Sniffing / Tip Yanıltma Koruması |
| **X-Frame-Options** | `SAMEORIGIN` | Clickjacking / iframe Gömme Koruması |
| **X-XSS-Protection** | `1; mode=block` | Eski Tarayıcılar İçin XSS Filtresi |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | URL ve Hassas Veri Sızıntısı Koruması |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Yetkisiz Donanım / Sensör Kısıtlaması |
