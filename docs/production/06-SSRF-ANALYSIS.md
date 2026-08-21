# CEP GARSON — SSRF SALDIRI ANALİZİ VE SAVUNMA RAPORU (SSRF ANALYSIS)
**Faz:** FAZ 6 — Server-Side Request Forgery Defense  
**Tarih:** 2026-08-21  

---

## 1. SSRF DEĞERLENDİRİLEN ALANLAR

Sunucu tarafında URL fetch eden tek uç nokta:
- `/api/seo-audit` (Kullanıcının talep ettiği web sitesinin SEO analizini yapan motor).

---

## 2. SSRF SAVUNMA KATMANLARI ([`isSafeUrl`](file:///c:/Users/ali_h/Desktop/Kvk%20Dijital/src/app/api/seo-audit/route.ts))

1. **Protokol Beyaz Listesi:** Yalnızca `http:` ve `https:` izinlidir (`file:`, `gopher:`, `ftp:`, `dict:`, `data:` tamamen engellenir).
2. **Döngüsel (Loopback) ve Yerel IP Engelleme:** `127.0.0.1`, `localhost`, `0.0.0.0`, `::1`.
3. **Özel Ağ (RFC 1918) Aralıkları:**
   - `10.0.0.0/8`
   - `172.16.0.0/12`
   - `192.168.0.0/16`
4. **Bulut Metadata Servis Koruması:** `169.254.169.254` (AWS, GCP, Azure metadata erişimi engellenir).
5. **Dinamik DNS ve Rebinding Koruması:** `*.nip.io`, `*.internal`, `*.local`.
6. **Manuel Yönlendirme (Manual Redirect Validation):** Yönlendirmeler otomatik takip edilmez; her HTTP 301/302 hedefi yeniden `isSafeUrl` testinden geçirilir (`MAX_REDIRECTS = 2`).
