# CEP GARSON — PRODUCTION ENGELLEYİCİLER (PRODUCTION BLOCKERS)
**Faz:** FAZ 0 — Production Hardening Blockers  
**Tarih:** 2026-08-21  

---

## 1. PRODUCTION BLOCKER LİSTESİ (CANLIYA ÇIKIŞI ENGELLEYEN MADDELER)

Aşağıdaki maddeler çözülmeden sistemin gerçek bir restoranda canlıya alınması **finansal kayıp, veri kaybı veya güvenlik ihlali** riski taşır:

### 🔴 BLOCKER 1: Fiyat ve Tutar Hesabının İstemciden Alınması (Price Tampering)
- **Problem:** `/api/restaurant/order` istemciden gelen birim fiyatı güvenilir kabul ediyor.
- **Gereken Aksiyon:** Fiyat hesabı tamamen sunucu tarafında (`database-authoritative`) yapılmalı, istemciden sadece `menuItemId`, `quantity` ve `optionIds` alınmalıdır.

### 🔴 BLOCKER 2: Kalıcı Veritabanı ve Session Deposu Eksikliği
- **Problem:** Siparişler `localStorage` ve in-memory Map üzerinde tutuluyor. Müşterinin tarayıcısını kapatması, geçmişi silmesi veya Vercel'in lambda container'ını geri dönüştürmesi durumunda veriler kaybolur.
- **Gereken Aksiyon:** Siparişler, masalar ve oturumlar kalıcı Firestore / SQL veritabanına bağlanmalıdır.

### 🔴 BLOCKER 3: Cihazlar Arası Gerçek Zamanlı İletişim (Cross-Device Realtime)
- **Problem:** `BroadcastChannel` yalnızca aynı bilgisayardaki/tarayıcıdaki sekmeleri eşitler. Müşterinin kendi iPhone'undan verdiği sipariş garsonun Android tabletine otomatik düşmez.
- **Gereken Aksiyon:** WebSockets (Pusher / Socket.io / Firestore onSnapshot real-time listener) entegre edilmelidir.

### 🔴 BLOCKER 4: Sunucu Tarafı Boss & Personel Kimlik Doğrulaması
- **Problem:** Boss panel ve personel PIN kontrolleri istemci tarafında `sessionStorage` ile kontrol ediliyor.
- **Gereken Aksiyon:** Server-side API yetkilendirmesi (JWT/Session cookie) kurulmalıdır.

### 🔴 BLOCKER 5: Webhook İmza Doğrulaması (Webhook Forgery)
- **Problem:** Harici POS webhook endpoint'i imzasız kabul ediliyor.
- **Gereken Aksiyon:** HMAC-SHA256 gizli anahtar doğrulaması eklenmelidir.

### 🔴 BLOCKER 6: Otomasyon ve Güvenlik Testlerinin Olmaması (0 Test Coverage)
- **Problem:** Projede hiç birim, entegrasyon veya güvenlik testi bulunmuyor.
- **Gereken Aksiyon:** Jest / Vitest / Playwright test suiteleri kurulmalıdır.
