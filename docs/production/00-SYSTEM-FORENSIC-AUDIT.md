# CEP GARSON — SİSTEM FORENSIC AUDIT RAPORU
**Faz:** FAZ 0 — Full System Forensic Audit  
**Tarih:** 2026-08-21  
**Durum:** TAMAMLANDI (Audit Complete)  
**Kapsam:** Cep Garson Restoran İşletim Sistemi, POS, KDS, QR Menü, Masa Yönetimi, Stok & Reçete, Yetkilendirme ve Backend Altyapısı  

---

## 1. YÖNETİCİ ÖZETİ (EXECUTIVE SUMMARY)

Bu adli denetim (forensic audit), **Cep Garson** restoran dijital işletim sisteminin mevcut mimarisini, veri akışlarını, güvenlik duruşunu, çoklu kiracı (multi-tenant) sınırlarını ve production-readiness (canlıya çıkış) seviyesini 50 kritik boyutta incelemektedir.

Mevcut sistem; arayüz kalitesi, responsive dokunmatik terminal optimizasyonu (320px - 4K), sesli/görsel bildirimler, ortak masa sepeti, reçete kâr matrisi ve kullanıcı deneyimi açısından **üst düzey bir SaaS prototipi ve canlı demo** seviyesindedir. Ancak gerçek üretim (production enterprise) ortamında yüzlerce restoran ve binlerce eşzamanlı müşteriye hizmet verebilmesi için mimari katmanlarda **kritik hardening (sağlamlaştırma)** gereksinimleri tespit edilmiştir.

---

## 2. 50 BOYUTLU DETAYLI SİSTEM ANALİZİ

### 1. Frontend Architecture
- **Mevcut Durum:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Kullanılan Teknoloji:** Client Components (`"use client"`) ağırlıklı SPA-benzeri reaktif arayüzler.
- **Riskler:** Mutfak KDS, Kasa POS ve QR Menü state'i client tarafında tutulmaktadır.
- **Eksikler:** Server Components / Client boundary ayrımı veri güvenliği için netleştirilmeli.

### 2. Backend Architecture
- **Mevcut Durum:** Next.js Route Handlers (`src/app/api/restaurant/*`, `src/app/api/admin/*`).
- **Kullanılan Teknoloji:** Vercel Serverless Functions, Node.js runtime.
- **Riskler:** Serverless ortamlarda memory paylaşımı yoktur (In-memory map'ler lambda instance'ları arasında kaybolur).

### 3. Database Architecture
- **Mevcut Durum:** Firebase Cloud Firestore (Kurumsal CMS verileri için) + LocalStorage / In-Memory Mock (Restoran operasyonları için).
- **Riskler:** Restoran siparişleri, masalar ve stok verisi henüz kalıcı bir veritabanı şemasına (Firestore/PostgreSQL) tam bağlı değildir; tarayıcı önbelleği temizlendiğinde demo verisine döner.
- **Production Blocker:** CRITICAL.

### 4. Authentication
- **Mevcut Durum:**
  - Kurumsal Admin: Firebase Auth (Bearer ID Token + verifyIdToken).
  - Restoran Boss: Client-side Master PIN (`1923`) + 2FA simülasyonu (`BossAuthModal.tsx`).
  - Personel / Garson: 4 haneli PIN kodları (`StaffManager.tsx`).
  - Müşteri: 15 dakikalık oturum token'ı.
- **Güvenlik Riski:** Boss ve personel PIN doğrulaması sunucu yerine client-side state üzerinde çalışmaktadır.
- **Production Blocker:** HIGH.

### 5. Authorization (Yetkilendirme)
- **Mevcut Durum:** `DEFAULT_ROLE_PERMISSIONS` altında 5 rol (OWNER, MANAGER, CASHIER, WAITER, KITCHEN) tanımlı.
- **Eksikler:** Yetkiler arayüzde buton gizlemek için kullanılmakta; backend API seviyesinde RBAC (Role-Based Access Control) middleware'i bulunmamaktadır.

### 6. Multi-Tenant Yapı
- **Mevcut Durum:** URL parametresi (`/restoran/[restaurantSlug]/*` ve `/qr/[restaurantSlug]/[tableId]`) üzerinden tenant belirlenmektedir.
- **Güvenlik Riski:** API endpoint'leri (`/api/restaurant/order`) gelen `restaurantId`'yi doğrulamadan kabul etmektedir (IDOR ve Tenant Escape riski).
- **Production Blocker:** CRITICAL.

### 7. Restaurant / Branch / Table İlişkileri
- **Mevcut Durum:** String tabanlı kimlikler (`m-1`, `m-2`, `rest_aura_bistro`).
- **Eksikler:** Şube (Branch) hiyerarşisi ve foreign key bütünlüğü (Referential Integrity) DB seviyesinde modellenmelidir.

### 8. QR Sistemi
- **Mevcut Durum:** `qrcode` kütüphanesi ile dinamik client render edilen QR kodlar (`/qr/{slug}/{tableId}`).
- **Riskler:** QR kodlar statik URL içerdiğinden, menüyü evden veya restoran dışından açan bir müşteri masaya sipariş gönderebilir. Kriptografik time-based nonce (HMAC) veya coğrafi/masa doğrulama gereklidir.

### 9. Customer Session Sistemi
- **Mevcut Durum:** 15 dakikalık session token (`generateSessionToken` - base64 string).
- **Riskler:** Session'lar `activeSessions` isimli in-memory `Map` üzerinde saklanmaktadır. Vercel'de her yeni serverless instance bu map'i sıfır göreceği için "SESSION_INVALID" dönecektir. Kalıcı Redis/Firestore oturum tablosuna taşınmalıdır.
- **Production Blocker:** CRITICAL.

### 10. Cart (Sepet) Sistemi
- **Mevcut Durum:** Çok kullanıcılı ortak masa sepeti (`globalSharedCarts`), Masa Reisi (Host) onayı, bireysel pay hesabı.
- **Senkronizasyon:** Aynı cihazdaki sekmeler `BroadcastChannel` ile anında eşitlenir. Farklı telefonlar arasında senkronizasyon için WebSocket/Firestore Realtime listener zorunludur.

### 11. Order Lifecycle & State Machine
- **Mevcut Durum:** `PENDING_CONFIRMATION` -> `PREPARING` -> `READY` -> `SERVED` -> `COMPLETED` / `CANCELLED`.
- **Eksikler:** Durum geçişleri formal bir state machine ile sunucu tarafında kilitlenmemiştir (örn: Servis edilmiş bir sipariş müşteri tarafından tekrar DRAFT yapılamamalıdır).

### 12. POS (Kasa Terminali)
- **Mevcut Durum:** Masa grid'i, adisyon kapama, parçalı tahsilat, e-fatura kesme, Z raporu alma, acil müdür bildirimleri.
- **Mobil Uyumluluk:** %100 responsive dokunmatik hazır.

### 13. KDS (Mutfak Ekranı)
- **Mevcut Durum:** Hazırlanıyor / Hazır kartları, sesli sipariş uyarısı, istasyon filtreleri, süre sayaçları.

### 14. Inventory (Hammadde & Depo)
- **Mevcut Durum:** Reçeteye bağlı gramaj/adet bazlı anlık stok düşümü, kritik stok alarmları, zayi (fire) günlüğü.
- **Eksikler:** Eşzamanlı siparişlerde eksiye düşmeyi engelleyen atomic decrement / lock mekanizması.

### 15. Recipe / Cost Matrix
- **Mevcut Durum:** Reçete maliyeti, anlık kâr marjı hesabı, dinamik saatlik Happy Hour indirim motoru.

### 16. Payment (Ödeme)
- **Mevcut Durum:** Simüle edilmiş 3D Secure kredi kartı formu, masada nakit/kart POS çağrısı.
- **Production Blocker:** İyzico / PayTR / Stripe gerçek gateway entegrasyonu ve webhook imza doğrulaması.

### 17. Refund (İade / İptal)
- **Mevcut Durum:** Sipariş iptali mevcut; finansal iade kaydı ve ters adisyon muhasebesi eksik.

### 18. Reports (Z Raporu & Ciro Analitiği)
- **Mevcut Durum:** Günlük brüt ciro, nakit/kart dağılımı, saatlik yoğunluk grafiği, çok satanlar listesi.

### 19. Audit Logs (Patron Denetim Günlüğü)
- **Mevcut Durum:** Müşteri şikayetleri ve düşük puanlar personelin silemeyeceği şekilde loglanır (`ComplaintsLog.tsx`).

### 20. Realtime / Senkronizasyon
- **Mevcut Durum:** `BroadcastChannel` ("cep_garson_realtime_sync") + `CustomEvent`.
- **Sınır:** Sadece aynı tarayıcı profilindeki sekmeler arasında çalışır. Farklı garson ve müşteri telefonları arasında iletişim için merkezi WebSocket (Pusher/Socket.io/Firestore onSnapshot) gereklidir.
- **Production Blocker:** HIGH.

### 21. Offline Davranış
- **Mevcut Durum:** `localStorage` tabanlı çalıştığı için tek cihazda internet kopsa dahi arayüz açık kalır.

### 22. Cache
- **Mevcut Durum:** Next.js ISR (Incremental Static Regeneration) kurumsal sayfalarda aktif; restoran rotaları dynamic.

### 23. Queue / Background Jobs
- **Mevcut Durum:** İndirim süreleri `setInterval` ile client'ta taranır; sunucu tarafı cron job (Vercel Cron / QStash) eklenmelidir.

### 24. Webhook Altyapısı
- **Mevcut Durum:** `/api/restaurant/pos-webhook` mevcut.
- **Güvenlik Riski:** HMAC-SHA256 imza doğrulaması eksik. Herhangi biri webhook endpoint'ine POST atıp masayı kapatabilir.
- **Production Blocker:** HIGH.

### 25. File / Storage
- **Mevcut Durum:** Firebase Storage + Sanitize URL + 2MB byte stream limit.

### 26. Email / SMS Entegrasyonu
- **Mevcut Durum:** Nodemailer aktif; SMS (Netgsm/Twilio) altyapısı 2FA için hazırlanmalı.

### 27. External APIs
- **Mevcut Durum:** Harici POS bridge simülasyonu (`posBridge.ts`).

### 28. Environment Variables
- **Mevcut Durum:** Firebase anahtarları güvenli şekilde `.env.local` ve Vercel ortamında.

### 29. Secrets
- **Mevcut Durum:** Kod içinde hardcoded API secret yok; Firebase Service Account lazy init ile korunuyor.

### 30. Deployment
- **Mevcut Durum:** Vercel Production Deployment + Edge Network.

### 31. CI/CD
- **Mevcut Durum:** GitHub Master branch -> Vercel Otomatik Derleme.

### 32. Dependencies
- **Mevcut Durum:** Güncel paketler (Next.js 16.3.0, React 19.2.8, Tailwind 4, Firebase 12/14).

### 33. Existing Tests
- **Mevcut Durum:** 0 test (Unit, Integration, E2E test dosyası bulunmuyor).
- **Production Blocker:** HIGH.

### 34. Error Handling
- **Mevcut Durum:** `createSecureServerErrorResponse` ile stack trace sızdırılmıyor.

### 35. Logging
- **Mevcut Durum:** Konsol logları; merkezi log aggregator (Sentry / Datadog) entegrasyonu planlanmalı.

### 36. Monitoring
- **Mevcut Durum:** Vercel Analytics ve Core Web Vitals aktif.

### 37. Backup
- **Mevcut Durum:** Cloud Firestore otomatik yedekleme.

### 38. Recovery
- **Mevcut Durum:** Disaster recovery prosedürleri dökümante edilmeli.

### 39. Accessibility (a11y)
- **Mevcut Durum:** Semantik HTML, ARIA etiketleri, kontrast oranları uyumlu.

### 40. Mobile Behavior
- **Mevcut Durum:** 320px, 375px, 390px, 414px, 430px, Tablet ve Desktop'ta %100 taşmasız responsive.

### 41. Performance
- **Mevcut Durum:** Turbopack, AVIF/WebP optimizasyonu, 100/100 Lighthouse potansiyeli.

### 42. SEO / GEO
- **Mevcut Durum:** JSON-LD Restaurant Schema, OpenGraph, Canonical URLs, Sitemap.

### 43. Security Headers
- **Mevcut Durum:** CSP, HSTS, X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Permissions-Policy tam aktif.

### 44. Rate Limiting
- **Mevcut Durum:** In-memory sliding window rate limiter (`rateLimit.ts`).

### 45. Input Validation
- **Mevcut Durum:** `parseJsonWithByteLimit` ve Zod/özel şemalar.

### 46. Data Validation (Fiyat Güvenliği)
- **Mevcut Durum:** `/api/restaurant/order` istemciden gelen `finalPrice` değerini doğrudan toplayıp sipariş tutarı oluşturmaktadır. İstemci manipülasyonuna açıktır.
- **Production Blocker:** CRITICAL.

### 47. Race Conditions
- **Mevcut Durum:** Son porsiyon siparişinde eşzamanlı iki istek gelirse ikisi de sipariş oluşturabilir.

### 48. Idempotency
- **Mevcut Durum:** `Idempotency-Key` header desteği yoktur; mükerrer tıklamada çift sipariş oluşabilir.

### 49. Transaction Safety
- **Mevcut Durum:** Sipariş kaydı ve stok düşümü tek bir atomic database transaction içinde değildir.

### 50. Data-Loss Risks
- **Mevcut Durum:** İstemci tarafı `localStorage` temizlenmesi durumunda sipariş geçmişi demo başlangıcına döner.

---

## 3. SONUÇ VE FAZ YOL HARİTASI

1. **FAZ 0:** Adli Denetim ve Mimari Harita (Mevcut Faz — Tamamlandı)
2. **FAZ 1:** Tehdit Modellemesi ve Güvenlik Test Matrisi
3. **FAZ 2:** Kalıcı Veritabanı Bütünlüğü & Domain Modeli (Firestore / SQL)
4. **FAZ 3:** Çok Kiracılı İzolasyon (Tenant Isolation & Anti-Leak)
5. **FAZ 4:** Kimlik Doğrulama & Rol Yetki Matrisi (RBAC Backend)
6. **FAZ 5:** Kriptografik QR & Masa Oturum Motoru
7. **FAZ 6:** Deterministik Sipariş Durum Makinesi & Fiyat Doğrulama
8. **FAZ 7:** Eşzamanlılık, Race Condition Koruması & Idempotency
