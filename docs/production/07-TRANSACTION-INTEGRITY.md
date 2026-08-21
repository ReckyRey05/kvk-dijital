# CEP GARSON — İŞLEM BÜTÜNLÜĞÜ VE ATOMİKLİK (TRANSACTION INTEGRITY)
**Faz:** FAZ 7 — Atomic Transactions & All-or-Nothing Commit  
**Tarih:** 2026-08-21  

---

## 1. ATOMİKLİK GARANTİSİ (ALL-OR-NOTHING)

Her sipariş oluşturma ve finansal işlem şu aşamalardan geçer:
```
Girdi Doğrulama → Kanonik Fiyatlandırma → Stok Rezervasyonu → Veritabanı Yazımı → İdempotency Kaydı
```
Eğer adımlardan herhangi biri (örn. stok yetersizliği, geçersiz oturum, kiracı uyuşmazlığı) başarısız olursa işlem tamamen geri alınır (Rollback); kısmi yazma (partial write) oluşması imkansızdır.

---

## 2. MONOTON DURUM YÖNETİMİ

Dış sistemlerden gelen gecikmiş (out-of-order) olaylar mevcut ilerlemiş durumu asla geriye düşüremez:
- `SETTLED` durumundaki bir siparişe daha sonra gelen `PREPARING` bildirimi göz ardı edilir.
