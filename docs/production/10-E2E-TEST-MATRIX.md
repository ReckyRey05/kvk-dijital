# CEP GARSON — UÇTAN UCA TEST MATRİSİ (E2E TEST MATRIX)
**Faz:** FAZ 10 — Full Customer, Staff, Kitchen & Cashier E2E Cycles  
**Tarih:** 2026-08-21  

---

## 1. GERÇEK DÜNYA E2E OPERASYON MATRİSİ

```mermaid
sequenceDiagram
    participant C as Müşteri (Safari/Chrome)
    participant S as Kanonik Sunucu & DB
    participant K as Mutfak KDS (Tablet)
    participant W as Garson Paneli (Mobil)
    participant POS as Kasa POS (Desktop)

    C->>S: 1. QR Tara & 15-Dk Oturum Aç
    C->>S: 2. Sipariş Gönder (2x Burger + 1x Tatlı)
    S->>K: 3. Anlık Bildirim (PENDING_CONFIRMATION)
    K->>S: 4. Siparişi Onayla (PREPARING)
    K->>S: 5. Pişirme Tamamlandı (READY)
    W->>S: 6. Masaya Servis Et (SERVED)
    POS->>S: 7. Kısmi/Tam Ödeme Al (PAID_CASHIER)
    POS->>S: 8. Masayı Kapat & Oturumları Sıfırla (COMPLETED)
    Note over C,S: Müşterinin eski linkten sipariş vermesi engellendi
```

---

## 2. ADIM ADIM DOĞRULAMA KONTROLLERİ

- **Kanonik Fiyat:** Burger (2 * 375 TL) + Tatlı (1 * 205 TL) = 955 TL Ara Toplam + %10 KDV (95.50 TL) = 1.050,50 TL.
- **Masa İptali ve Oturum Sıfırlama:** Kasa adisyonu kapattığında `invalidateAllTableSessions` çağrılarak müşterinin evden veya eski sekmeden sipariş vermesi engellenmiştir.
