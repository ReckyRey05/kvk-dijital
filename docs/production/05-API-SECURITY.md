# CEP GARSON — API GÜVENLİK MİMARİSİ VE TAM ENVANTER (API SECURITY)
**Faz:** FAZ 5 — Full API Security & Input Validation  
**Tarih:** 2026-08-21  
**Durum:** TAMAMLANDI VE DOĞRULANDI (Verified 100%)  

---

## 1. API YÜZEY ENVANTERİ VE GÜVENLİK MATRİSİ

| Metot | Endpoint / Rota | Yetki / Rol | Kiracı Kontrolü | Request Boyut Sınırı | Rate Limit | İdempotency | Güvenlik / Savunma |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/restaurant/order` | Oturum Token | `assertTableOwnership` | 1 MB Byte Stream | 20 req/dk | `x-idempotency-key` | Kanonik Fiyat + Tip Denetimi |
| `POST` | `/api/restaurant/session` | Anonim / Token | `assertTableOwnership` | 1 MB Byte Stream | 30 req/dk | N/A | 15-dk TTL + Kriptografik İmza |
| `POST` | `/api/restaurant/waiter-call` | Müşteri | `assertTableOwnership` | 1 MB Byte Stream | 10 req/dk | N/A | Masa Eşleşme + Metin Sanitizasyonu |
| `POST` | `/api/restaurant/pos-webhook` | POS API Key | Tenant Slug / ID | 1 MB Byte Stream | 60 req/dk | N/A | POS Secret Doğrulama |
| `POST` | `/api/admin/blog` | Kurumsal Admin | N/A (Global) | 2 MB Byte Stream | 30 req/15dk| N/A | Firebase ID Token + Zod Şeması |
| `PUT` | `/api/admin/blog` | Kurumsal Admin | N/A (Global) | 2 MB Byte Stream | 30 req/15dk| N/A | Firebase ID Token + Zod Şeması |
| `POST` | `/api/contact` | Public | N/A | 50 KB Byte Stream | 3 req/15dk | N/A | HTML Sanitizasyon + IP Limiti |
| `POST` | `/api/seo-audit` | Public | N/A | 50 KB Byte Stream | 5 req/10dk | N/A | SSRF Filtresi + URL Doğrulama |
| `POST` | `/api/ai/generate` | Kurumsal Admin | N/A | 100 KB Byte Stream | 10 req/saat | N/A | AI Prompt Rate Limiti |

---

## 2. API GÜVENLİK PRENSİPLERİ

1. **Byte Stream Tabanlı JSON DoS Koruması (`parseJsonWithByteLimit`):**
   - Bellek tüketim saldırılarına (OOM) karşı istek gövdeleri maksimum 1 MB ile sınırlandırılmıştır.
2. **Kaba Veri Ataması (Mass Assignment) Koruması:**
   - İstemciden gelen `isAdmin`, `role`, `status`, `paymentStatus`, `unitPrice` gibi alanlar yok sayılır; yalnızca sunucu tarafından doğrulanmış veriler işlenir.
3. **Prototip Kirlenmesi (Prototype Pollution) Savunması:**
   - `__proto__`, `constructor` ve `prototype` anahtarları ayrıştırılırken global nesne prototipi kirletilemez.
