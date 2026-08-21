# CEP GARSON — SALDIRI YÜZEYİ HARİTASI (ATTACK SURFACE)
**Faz:** FAZ 9 — Complete Attack Surface Discovery  
**Tarih:** 2026-08-21  

---

## 1. TÜM HEDEF UÇ NOKTALAR VE ERİŞİM SEVİYELERİ

| Uç Nokta | Metot | Erişim Seviyesi | Olası Saldırı Vektörleri | Savunma Durumu |
| :--- | :--- | :--- | :--- | :--- |
| `/api/restaurant/order` | POST | Müşteri / Session | Fiyat Manipülasyonu, Stok Yarışı, İdempotency | 🟢 **KANONİK MOTOR + GUARD (PASS)** |
| `/api/restaurant/session` | POST | Public / QR | Sahte Masa ID, Oturum Sabitleme | 🟢 **HMAC TOKEN + TENANT GUARD (PASS)** |
| `/api/restaurant/waiter-call` | POST | Müşteri / Session | Bildirim Flood, IDOR | 🟢 **RATE LIMIT + TENANT GUARD (PASS)** |
| `/api/restaurant/pos-webhook` | POST | Webhook / API Key | Sırasız Olay, Sahte İmza, Replay | 🟢 **API KEY + MONOTON STATEMACHINE (PASS)** |
| `/api/seo-audit` | POST | Public | SSRF, Localhost / Metadata Erişimi | 🟢 **isSafeUrl + MANUAL REDIRECT (PASS)** |
| `/api/health` | GET | Monitoring | Bilgi İfşası, Stack Trace | 🟢 **REDACTED PROBES (PASS)** |
