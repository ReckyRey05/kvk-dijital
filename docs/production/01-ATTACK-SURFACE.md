# CEP GARSON — SALDIRI YÜZEYİ ANALİZİ (ATTACK SURFACE)
**Faz:** FAZ 1 — Attack Surface Mapping  
**Tarih:** 2026-08-21  

---

## 1. SALDIRI YÜZEYİ HARİTASI (ATTACK SURFACE MAP)

```mermaid
graph LR
    subgraph Public Surfaces ["1. KAMUYA AÇIK YÜZEYLER (PUBLIC SURFACES)"]
        A["Müşteri QR URL (/qr/{slug}/{tableId})"]
        B["Session Başlatma API (/api/restaurant/session)"]
        C["Sipariş Verme API (/api/restaurant/order)"]
        D["Garson Çağırma API (/api/restaurant/waiter-call)"]
        E["POS Webhook Alıcı (/api/restaurant/pos-webhook)"]
        F["İletişim & Demo Formları"]
    end

    subgraph Internal Staff Surfaces ["2. PERSONEL YÜZEYLERİ (STAFF SURFACES)"]
        G["Kasa POS Terminali (/restoran/{slug}/kasa)"]
        H["Mutfak KDS Ekranı (/restoran/{slug}/mutfak)"]
        I["Garson PIN Giriş Ekranı"]
    end

    subgraph Management Surfaces ["3. PATRON & YÖNETİM YÜZEYİ (MANAGEMENT SURFACES)"]
        J["Yönetim Paneli (/restoran/{slug}/yonetim)"]
        K["Reçete & Hammadde Kâr Matrisi"]
        L["Personel & Rol Yetki Matrisi"]
        M["Finansal Z Raporu & Ciro Dökümü"]
        N["Müşteri Şikayetleri Denetim Günlüğü"]
    end

    subgraph Infrastructure Surfaces ["4. ALTYAPI & BULUT YÜZEYLERİ"]
        O["Cloud Firestore Collections"]
        P["Vercel Serverless Function Environment"]
        Q["Firebase Auth & Storage Endpoints"]
    end
```

---

## 2. GİRİŞ NOKTALARI VE GÜVENLİK DEĞERLENDİRMESİ

1. **Müşteri QR Menü Girişi:**
   - *Girdi:* URL'deki `restaurantSlug` ve `tableId`.
   - *Risk:* URL brute-forcing (Masa 1 yerine Masa 50 yazma), başka masanın sepetini görme/ekleme.
   - *Önlem:* Masa ID'leri yerine cryptographically random table session token'lar veya dinamik QR kodlar.

2. **Sipariş Oluşturma Girişi:**
   - *Girdi:* `items` array, `notes`, `sessionToken`.
   - *Risk:* XSS enjeksiyonu (`notes` alanına `<script>` yazılması), negatif miktar (`quantity: -5`), fiktif ürün ID'leri.
   - *Önlem:* Sıkı Zod şema doğrulaması, `sanitize-html` ile not temizliği, pozitif tamsayı (`quantity >= 1`) zorunluluğu.

3. **Yönetim Paneli Girişi:**
   - *Girdi:* Master PIN, 2FA SMS/App kodu.
   - *Risk:* Brute-force saldırıları, `sessionStorage` manipülasyonu.
   - *Önlem:* Hatalı PIN denemelerinde IP ve kullanıcı bazlı rate limiting (örn: 5 hatalı denemede 15 dk kilitleme).
