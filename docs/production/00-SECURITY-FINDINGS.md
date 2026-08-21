# CEP GARSON — GÜVENLİK BULGULARI RAPORU (SECURITY FINDINGS)
**Faz:** FAZ 0 — Security Audit (OWASP ASVS 5.0 Reference)  
**Tarih:** 2026-08-21  

---

## 1. BULGU ÖZET TABLOSU

| ID | Kategori | Başlık | Seviye | Etkilenen Bileşen |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | V5: Validation | Client-Side Price & Total Manipulation | 🚨 **CRITICAL** | `/api/restaurant/order` |
| **SEC-02** | V3: Session | In-Memory Serverless Session Invalidation | 🚨 **CRITICAL** | `src/lib/restaurant/session.ts` |
| **SEC-03** | V4: Access Control | Multi-Tenant IDOR / Cross-Tenant Injection | 🚨 **CRITICAL** | Restaurant API Handlers |
| **SEC-04** | V2: Authentication | Client-Side Boss Master PIN & 2FA Bypass | 🚨 **HIGH** | `BossAuthModal.tsx` |
| **SEC-05** | V13: API & Webhooks | Unsigned Webhook Payload Forgery | 🚨 **HIGH** | `/api/restaurant/pos-webhook` |
| **SEC-06** | V10: Concurrency | Concurrent Stock Race Condition | ⚠️ **MEDIUM** | Store Stock Subsystem |
| **SEC-07** | V8: Data Protection | Unencrypted LocalStorage Sensitive Data | ⚠️ **MEDIUM** | Browser LocalStorage |
| **SEC-08** | V1: Architecture | Missing Realtime Cross-Device Channel | ⚠️ **MEDIUM** | BroadcastChannel Sync |

---

## 2. DETAYLI TEKNİK BULGULAR VE İSTİSMAR SENARYOLARI

### [SEC-01] CRITICAL — Client-Side Price Manipulation (Fiyat Manipülasyonu)
- **Açıklama:** `/api/restaurant/order` route'u siparişteki kalemlerin birim fiyatlarını (`finalPrice`, `basePrice`) istemciden gelen JSON gövdesinden doğrudan okumaktadır.
- **İstismar Senaryosu (PoC):**
  ```bash
  curl -X POST https://kvkdijitalcozumler.com/api/restaurant/order \
    -H "Content-Type: application/json" \
    -d '{
      "restaurantId": "rest_aura_bistro",
      "tableId": "m-4",
      "sessionToken": "VALID_TOKEN",
      "items": [{ "menuItemId": "item_ribeye_steak", "name": "Antrikot", "finalPrice": 0.01, "quantity": 5 }]
    }'
  ```
  *Sonuç:* 3.400 TL değerindeki 5 porsiyon antrikot kasaya 0.05 TL olarak onaylatılabilir.
- **Düzeltme (Remediation):** Sunucu, gelen `menuItemId` değerlerini yetkili menü fiyat listesi ile eşleştirmeli ve tutarı sunucu tarafında (`server-side authoritative`) hesaplamalıdır.

---

### [SEC-02] CRITICAL — In-Memory Serverless Session State Loss
- **Açıklama:** Oturum tablosu `const activeSessions = new Map<string, TableSession>()` değişkeninde sunucu RAM'inde tutulmaktadır. Vercel ve AWS Lambda gibi serverless platformlarda her HTTP isteği farklı bir izole container instance'ına düşebilir.
- **Etki:** Bir instance'ta açılan 15 dakikalık oturum, sipariş gönderilirken farklı bir instance'a denk gelirse "Geçersiz oturum" hatası verecektir.
- **Düzeltme:** Oturumlar Firestore veya Redis üzerinde TTL (Time-to-Live) mekanizması ile saklanmalıdır.

---

### [SEC-03] CRITICAL — Multi-Tenant IDOR & Tenant Escape
- **Açıklama:** Restoran A'nın QR kodunu okutan bir kullanıcı, istek gövdesinde `restaurantId: "restoran_b"` gönderdiğinde sunucu kiracı doğrulamasını masayla eşleştirip sınırlandırmamaktadır.
- **Düzeltme:** Her istekte Tenant context middleware'i çalışmalı, masa ile restoran ilişkisi doğrulanmalıdır.

---

### [SEC-04] HIGH — Client-Side Boss Master PIN & 2FA Bypass
- **Açıklama:** Boss paneli (`/restoran/[slug]/yonetim`) güvenliği `sessionStorage.getItem("cg_boss_auth")` değerine bakarak render edilmektedir.
- **İstismar:** Tarayıcı geliştirici konsolundan `sessionStorage.setItem("cg_boss_auth", "true")` yazan herhangi biri PIN veya 2FA girmeden yönetim paneline erişebilir.
- **Düzeltme:** Boss yetkisi sunucu tarafında HTTP-only JWT cookie veya session ile doğrulanmalıdır.

---

### [SEC-05] HIGH — Webhook İmza Doğrulamasının Olmaması
- **Açıklama:** `/api/restaurant/pos-webhook` endpoint'i herhangi bir API key veya HMAC secret kontrolü yapmamaktadır.
- **İstismar:** Dışarıdan bir saldırgan `TABLE_CLOSED` event'i göndererek restorandaki tüm masaların QR oturumlarını sonlandırabilir (DDoS / İşletme kesintisi).
- **Düzeltme:** `crypto.createHmac("sha256", WEBHOOK_SECRET)` ile gelen `X-Signature` header'ı doğrulanmalıdır.
