# CEP GARSON — STOK VE HAMMADDE BÜTÜNLÜĞÜ (INVENTORY CONSISTENCY)
**Faz:** FAZ 7 — Inventory Decrement & Race Condition Protection  
**Tarih:** 2026-08-21  

---

## 1. STOK DEĞİŞMEZLERİ (INVENTORY INVARIANTS)

1. **Negatif Stok Yasağı:** Stok miktarı hiçbir koşulda $0$'ın altına inemez ($\text{Stock} \ge 0$).
2. **Atomik Düşüm (Atomic Compare-and-Swap):** Eşzamanlı siparişlerde yalnızca mevcut stok adedi kadar işlem onaylanır, aşan istekler deterministik olarak `OUT_OF_STOCK` hatası alır.

---

## 2. STRES TESTİ SONUCU

- **Senaryo:** 5 adet sınırlı stoğa sahip özel ürün için aynı anda 50 eşzamanlı sipariş isteği gönderildi.
- **Sonuç:** Tam olarak 5 sipariş onaylandı, 45 istek `OUT_OF_STOCK` olarak reddedildi. Son stok tam olarak $0$ olarak kaydedildi.
