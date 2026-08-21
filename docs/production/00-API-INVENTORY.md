# CEP GARSON — API ENVANTERİ (API INVENTORY)
**Faz:** FAZ 0 — API Analysis & Catalog  
**Tarih:** 2026-08-21  

---

## 1. RESTORAN VE QR SİSTEMİ API ENDPOINT'LERİ

| Endpoint | HTTP | Auth Durumu | Rate Limit | Girdi Parametreleri | Çıktı / Yanıt | Güvenlik Seviyesi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/restaurant/session` | `POST` | Anonim (QR Okutan) | Yok | `restaurantId`, `tableId`, `tableNumber`, `deviceFingerprint`, `action`, `token` | `sessionId`, `token`, `expiresAt`, `remainingMinutes` | ⚠️ **MEDIUM** (Session in-memory) |
| `/api/restaurant/order` | `POST` | 15-dk Session Token | Yok | `restaurantId`, `tableId`, `sessionToken`, `items`, `notes`, `paymentMethod` | `order`, `posSync` | 🚨 **CRITICAL** (Fiyat manipülasyonu riski) |
| `/api/restaurant/waiter-call` | `POST` | Anonim / Session | Yok | `restaurantId`, `tableId`, `tableNumber`, `type`, `message` | `call` nesnesi | ⚠️ **MEDIUM** (Spam çağrı riski) |
| `/api/restaurant/pos-webhook` | `POST` | İmzasız (Açık Webhook) | Yok | `event`, `restaurantId`, `tableId`, `ticketId`, `status` | `received: true` | 🚨 **HIGH** (İmza doğrulaması eksik) |

---

## 2. KURUMSAL VE ADMİN API ENDPOINT'LERİ

| Endpoint | HTTP | Auth Durumu | Rate Limit | Girdi | Çıktı | Güvenlik Seviyesi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/admin/blog` | `GET, POST, PUT, DELETE` | Firebase Bearer Token (verifyAdminServerRequest) | 2MB Body Limit | `title`, `slug`, `content`, `coverImage`, `isPublished` | Firestore Document | 🛡️ **SECURE** |
| `/api/admin/projects` | `GET, POST, PUT, DELETE` | Firebase Bearer Token (verifyAdminServerRequest) | 2MB Body Limit | `title`, `category`, `description`, `technologies` | Firestore Document | 🛡️ **SECURE** |
| `/api/admin/services` | `GET, POST, PUT, DELETE` | Firebase Bearer Token (verifyAdminServerRequest) | 2MB Body Limit | `title`, `description`, `icon`, `imageUrl`, `features` | Firestore Document | 🛡️ **SECURE** |
| `/api/contact` | `POST` | Anonim Public Form | Sliding Window Rate Limit | `name`, `email`, `phone`, `service`, `message` | Nodemailer SMTP Email | 🛡️ **SECURE** |
| `/api/ai/generate` | `POST` | Public Form | Rate Limit + Input Check | `topic` | Gemini AI Blog Dökümü | 🛡️ **SECURE** |
| `/api/seo-audit` | `POST` | Public Form | Rate Limit + Input Check | `url` | SEO Analiz Raporu | 🛡️ **SECURE** |

---

## 3. TESPİT EDİLEN API GÜVENLİK VE ENTEGRASYON AÇIKLARI

1. **Fiyat ve Tutar İstemciden Alınıyor (`/api/restaurant/order`):**
   ```typescript
   // MEVCUT KOD (GÜVENSİZ):
   const totalAmount = items.reduce(
     (sum: number, it: any) => sum + (it.finalPrice || it.basePrice || 0) * (it.quantity || 1),
     0
   );
   ```
   *Tehlike:* Kötü niyetli bir kullanıcı cURL veya Postman ile istek atarak 500 TL'lik eti `finalPrice: 1` gönderip 1 TL'ye sipariş açabilir.  
   *Çözüm:* Sunucu, `menuItemId` üzerinden veritabanındaki orijinal birim fiyatı ve seçilen opsiyon fiyatlarını kendisi hesaplamalıdır.

2. **Webhook İmzasız Kabul Ediliyor (`/api/restaurant/pos-webhook`):**
   *Tehlike:* Saldırgan rastgele `tableId` gönderip masaların oturumlarını düşürebilir (Denial of Service).  
   *Çözüm:* `X-Signature` veya `Authorization: Bearer <WEBHOOK_SECRET>` zorunlu kılınmalıdır.

3. **Restoran ID Doğrulaması Yok (Tenant Escape):**
   *Tehlike:* İstekte gönderilen `restaurantId` ile URL'deki veya kullanıcının bulunduğu restoran arasında doğrulama yapılmamaktadır.
