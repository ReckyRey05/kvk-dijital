# CEP GARSON — VERİ AKIŞ HARİTASI (DATA FLOW MAP)
**Faz:** FAZ 0 — Data Flow Analysis  
**Tarih:** 2026-08-21  

---

## 1. MÜŞTERİ SİPARİŞ & MASADAN ÖDEME AKIŞI

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Müşteri (Mobil Cihaz)
    participant QR as QR Menü Arayüzü
    participant BC as BroadcastChannel / Store
    participant ServerAPI as Next.js Order API
    participant POS as Kasa Terminali (POS)
    participant KDS as Mutfak Terminali (KDS)

    Customer->>QR: Masadaki QR Kodu Okutur (/qr/aura-bistro/m-4)
    QR->>ServerAPI: POST /api/restaurant/session (Init 15-min Session)
    ServerAPI-->>QR: Session Token + ExpiresAt (15 min)
    
    Customer->>QR: Ürünleri Sepete Ekler (Ortak Masa Sepeti)
    QR->>BC: sharedCarts[m-4] State Güncellenir
    
    Customer->>QR: "Siparişi Kasaya Gönder" (Host / Masa Reisi)
    QR->>ServerAPI: POST /api/restaurant/order { items, token, tableId, restaurantId }
    
    alt Session Geçerli ise
        ServerAPI-->>QR: 200 OK { success: true, orderId: "ord_103" }
        QR->>BC: createOrder("ord_103", PENDING_CONFIRMATION)
        BC->>POS: Kasa Ekranında Yanıp Sönen Onay Modalı Çıkar
        
        POS->>POS: Kasa Görevlisi "Siparişi Onayla & Mutfağa Gönder" Tıklar
        POS->>BC: updateOrderStatus("ord_103", PREPARING)
        BC->>KDS: Mutfak Ekranına Düşer + Çan Sesi Çalar (Audio Alert)
        
        KDS->>BC: Mutfak Şefi "Hazır" Butonuna Basar
        BC->>POS: Garson Ekranında "Servise Hazır" Uyarısı Çıkar
        
        POS->>BC: Garson "Servis Edildi" Butonuna Basar
        BC->>QR: Müşterinin Canlı Takip Çubuğu "Masanıza İletildi" Olur
    else Session Süresi Dolmuşsa (15 dk)
        ServerAPI-->>QR: 403 Forbidden { error: "SESSION_EXPIRED" }
        QR->>Customer: "Masa Oturumu Sona Erdi! QR Kodu Tekrar Okutun" Modalı
    end
```

---

## 2. HESAP KAPATMA VE ADİSYON TAHSIİLATI AKIŞI

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Müşteri
    actor Cashier as Kasa Görevlisi
    participant POS as Kasa POS Paneli
    participant BC as State Sync
    participant API as POS Webhook API
    participant QR as Müşteri QR Ekranı

    Customer->>QR: "Hesap İste (Kredi Kartı / Nakit)" Tıklar
    QR->>BC: callWaiter({ type: "BILL_CARD" })
    BC->>POS: Kasa Ekranında Sesli "Hesap Talebi" Bildirimi

    Cashier->>POS: Masaya Gider, POS Cihazı ile Tahsilat Yapar
    Cashier->>POS: Adisyonu Kapat & Masayı Boşalt Tıklar
    POS->>BC: settleTableBill("m-4") -> status: EMPTY, activeBillTotal: 0
    POS->>API: POST /api/restaurant/pos-webhook { event: "TABLE_CLOSED", tableId: "m-4" }
    API->>API: invalidateAllTableSessions(restaurantId, "m-4")
    BC->>QR: Müşterinin Açık Masa Tutarı Sıfırlanır, Oturum Kapatılır
```

---

## 3. HAMMADDE VE REÇETE STOK DÜŞÜM AKIŞI

```mermaid
graph TD
    A["Müşteri Siparişi Onaylanır (Order Created)"] --> B["Reçete Ayrıştırma (Recipe BOM Engine)"]
    B --> C["Dana Kıyma: -180g"]
    B --> D["Burger Ekmeği: -1 Adet"]
    B --> E["Cheddar Peyniri: -30g"]
    B --> F["Karamelize Soğan: -25g"]
    
    C --> G["globalIngredients Deposu Güncellenir"]
    D --> G
    E --> G
    F --> G
    
    G --> H{"Mevcut Stok <= Kritik Eşik?"}
    H -- Evet --> I["Kritik Stok Uyarısı (AlertTriangle Pulse) -> Boss & Kasa Paneli"]
    H -- Hayır --> J["Normal Stok Seviyesi"]
```
