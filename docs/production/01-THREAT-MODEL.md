# CEP GARSON — TEHDİT MODELİ (THREAT MODELING)
**Faz:** FAZ 1 — Threat Modeling & Red Team Analysis  
**Tarih:** 2026-08-21  
**Referans:** STRIDE Tehdit Modellemesi + OWASP ASVS 5.0  

---

## 1. STRIDE TEHDİT MATRİSİ

| Tehdit Türü | Tehdit Senaryosu | Etkilenen Bileşen | Olasılık | Etki | Risk Seviyesi | Önlem / Azaltma (Mitigation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Spoofing (Kimlik Sahteciliği)** | Saldırganın geçerli bir müşteri olmadan sahte QR session token üretip sipariş göndermesi | `/api/restaurant/session`, `/api/restaurant/order` | Yüksek | Yüksek | 🚨 **CRITICAL** | Kriptografik HMAC-SHA256 imzalı QR nonce ve sunucu tarafı oturum tablosu. |
| **Spoofing (Webhook)** | Sahte POS sunucusu taklidi yaparak masaları uzaktan kapatma | `/api/restaurant/pos-webhook` | Orta | Yüksek | 🚨 **HIGH** | `X-POS-Signature` HMAC doğrulaması. |
| **Tampering (Veri Tahrifatı)** | Müşterinin JSON içindeki `finalPrice: 0.01` göndererek et sipariş etmesi | `/api/restaurant/order` | Çok Yüksek | Kritik | 🚨 **CRITICAL** | Fiyatın tamamen DB'deki menü fiyatı üzerinden sunucuda hesaplanması. |
| **Repudiation (İnkar Edilebilirlik)** | Kasa görevlisinin siparişi iptal edip nakit parayı alması ve kaydı silmesi | POS Adisyon & Z Raporu | Orta | Yüksek | 🚨 **HIGH** | Değiştirilemez (immutable) `AuditLog` ve finansal işlem zinciri. |
| **Information Disclosure (Sızıntı)** | Restoran A çalışanının Restoran B'nin günlük cirosunu ve reçetelerini okuması | `/restoran/[slug]/yonetim`, `/api/*` | Yüksek | Kritik | 🚨 **CRITICAL** | Çok kiracılı (multi-tenant) veri izolasyonu ve sunucu tarafı RBAC. |
| **Denial of Service (Hizmet Engelleme)** | Sürekli garson çağırma veya sahte masa siparişi ile mutfağı kilitleme | `/api/restaurant/waiter-call` | Yüksek | Orta | ⚠️ **MEDIUM** | Masa başına sliding window rate limit ve onay mekanizması. |
| **Elevation of Privilege (Yetki Yükseltme)** | Garsonun tarayıcı storage'ına `cg_boss_auth: true` yazıp patron ayarlarına girmesi | `BossAuthModal.tsx` | Yüksek | Yüksek | 🚨 **HIGH** | Client-side auth'un kaldırılıp sunucu tarafı Session/Cookie auth'a geçilmesi. |

---

## 2. DETAYLI SALDIRI SENARYOLARI VE RED TEAM ANALİZİ

### Senaryo 1: Fiyat ve Tutar Manipülasyonu (Price Tampering Attack)
- **Saldırgan Profili:** Herhangi bir masada oturan veya QR linkini elde eden müşteri.
- **Saldırı Vektörü:** Tarayıcı geliştirici araçları (Network / Fetch) veya Postman.
- **Uygulama:** İstemci sepete 680 TL'lik Antrikot ekler; ancak `fetch('/api/restaurant/order')` çağrısındaki `items[0].finalPrice = 1` ve `subtotal = 1` olarak değiştirip sunucuya iletir.
- **Zafiyet Nedeni:** Sunucu gelen fiyatı doğrulamadan doğrudan `totalAmount = items.reduce(...)` yapmaktadır.
- **Çözüm:** Sunucu `menuItemId`'yi alır, DB'deki birim fiyat (680 TL) ile adet (1) çarpar, toplamı 680 TL olarak hesaplar. İstemciden gelen fiyata asla güvenilmez.

### Senaryo 2: Masa Kapanışı ve QR Replay Saldırısı (Out-of-Restaurant Replay)
- **Saldırgan Profili:** Restorandan ayrılmış eski müşteri.
- **Saldırı Vektörü:** Telefonundaki tarayıcı geçmişinde kalan `/qr/aura-bistro/m-4` linkini evindeyken açar.
- **Zafiyet Nedeni:** QR linki statik masa ID'si içermektedir.
- **Çözüm:** Masa hesabı kapandığında masanın `sessionToken` ve `qrNonce` değeri sunucu tarafından anında iptal edilir (`invalidateAllTableSessions`). Eski link açıldığında "Bu masa için oturum kapalıdır, lütfen masadaki güncel QR kodu okutun" uyarısı verilir.

### Senaryo 3: Çift Tıklama & Eşzamanlı Sipariş (Race Condition)
- **Saldırgan Profili:** Normal kullanıcı veya ağ gecikmesi yaşayan müşteri.
- **Saldırı Vektörü:** "Siparişi Gönder" butonuna hızlıca 5 kez tıklar.
- **Zafiyet Nedeni:** `Idempotency-Key` desteği bulunmamaktadır.
- **Çözüm:** Her sipariş isteği için istemcide benzersiz bir `idempotencyKey: UUID` üretilir ve sunucu aynı key ile gelen mükerrer istekleri tek işlem sayar.
