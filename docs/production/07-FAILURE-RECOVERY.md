# CEP GARSON — HATA KURTARMA VE FELAKET MATRİSİ (FAILURE RECOVERY)
**Faz:** FAZ 7 — Failure Modes, Network Drops & Recovery  
**Tarih:** 2026-08-21  

---

## 1. FELAKET VE HATA MODLARI MATRİSİ

| Hata / Senaryo | Sistem Davranışı | Veri Bütünlüğü Etkisi |
| :--- | :--- | :--- |
| **Ağ Zaman Aşımı (Timeout)** | İstemci aynı `x-idempotency-key` ile tekrar dener | Mükerrer sipariş oluşmaz, önbellekteki kayıt döner |
| **Sunucu Çökmesi (Crash)** | Atomik işlem geri alınır (Rollback) | Kısmi yazma veya tutarsız bakiye oluşmaz |
| **Gecikmiş Webhook** | Monoton ağırlık kontrolü (`stateHierarchy`) | Eski olaylar yeni durumu ezemez |
| **Mükerrer Webhook** | İdempotent webhook işleme | Tek bir durum güncellemesi gerçekleşir |
| **Çoklu Cihaz Çakışması** | Benzersiz nano-zaman damgalı ID'ler | Kimlik çakışması %0 |
