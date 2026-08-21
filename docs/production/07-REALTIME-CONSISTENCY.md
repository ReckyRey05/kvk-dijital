# CEP GARSON — GERÇEK ZAMANLI VERİ MUTABAKATI (REALTIME CONSISTENCY)
**Faz:** FAZ 7 — Realtime Event Loss & Full-State Reconciliation  
**Tarih:** 2026-08-21  

---

## 1. BAĞLANTI KOPMASI VE YENİDEN BAĞLANMA PROTOKOLÜ

```mermaid
sequenceDiagram
    participant Client as Mutfak / Kasa Ekranı
    participant Server as Veritabanı & Sunucu
    
    Client->>Server: 1. Canlı bağlantı aktif
    Note over Client: Ağ kesintisi / Telefon kilitlendi (OFFLINE)
    Server->>Server: 5 Yeni sipariş işlendi
    Note over Client: İstemci bağlantıyı tekrar kurdu (ONLINE)
    Client->>Server: 2. GET /orders (Full State Reconciliation)
    Server-->>Client: 3. Güncel kanonik sipariş listesi (7 Sipariş)
    Note over Client: İstemci görünümü %100 senkronize
```

---

## 2. TEST SONUÇLARI

- **Kaçırılan Olaylar (Dropped Events):** İstemci çevrimdışı iken gelen 5 olay başarıyla yakalandı ve yeniden bağlanma sonrasında veritabanı ile tam mutabakat sağlandı.
- **Mükerrer Yayınlar (Duplicate Broadcasts):** Aynı sipariş olayı 10 kez art arda yayınlandığında istemci tarafında tek bir sipariş olarak işlendi.
