# CEP GARSON — HIZ SINIRLANDIRMASI VE DOS KORUMASI (RATE LIMITING)
**Faz:** FAZ 5 — Rate Limiting & DoS Protection  
**Tarih:** 2026-08-21  

---

## 1. UÇ NOKTA BAZLI RATE LIMIT KONFİGÜRASYONU

| Uç Nokta | Kapsam / Anahtar | İstek Sınırı | Zaman Penceresi | Aşım Durumu |
| :--- | :--- | :--- | :--- | :--- |
| `/api/restaurant/order` | IP / Oturum | **20 İstek** | 1 Dakika | HTTP 429 Too Many Requests |
| `/api/restaurant/session` | IP | **30 İstek** | 1 Dakika | HTTP 429 Too Many Requests |
| `/api/restaurant/waiter-call` | IP / Masa | **10 İstek** | 1 Dakika | HTTP 429 Too Many Requests |
| `/api/restaurant/pos-webhook` | IP / API Key | **60 İstek** | 1 Dakika | HTTP 429 Too Many Requests |
| `/api/admin/*` | IP + Hesap | **30 İstek** | 15 Dakika | HTTP 429 Too Many Requests |
| `/api/contact` | IP + E-posta | **3 İstek** | 15 Dakika | HTTP 429 Too Many Requests |
| `/api/seo-audit` | IP | **5 İstek** | 10 Dakika | HTTP 429 Too Many Requests |
| `/api/ai/generate` | IP + Hesap | **10 İstek** | 1 Saat | HTTP 429 Too Many Requests |

---

## 2. KORUMA ALTYAPISI

- **Kayan Pencere (Sliding Window):** Milisaniye hassasiyetinde sayaç sıfırlama ve kalan istek başlıkları (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`).
- **Bellek ve Kaynak Güvenliği:** Süresi dolan anahtarların otomatik temizlenmesi (`sweepExpiredKeys`).
