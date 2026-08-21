# CEP GARSON — HATA VE KESİNTİ SENARYOLARI RAPORU (FAILURE TEST)
**Faz:** FAZ 10 — Network Drops, Reconnects & Transient Failures  
**Tarih:** 2026-08-21  

---

## 1. KESİNTİ SENARYOLARI VE SİSTEM DAVRANIŞI

| Kesinti / Senaryo | Simülasyon | Sistem Davranışı / Kurtarma |
| :--- | :--- | :--- |
| **Ağ Kesintisi (Offline)** | Müşteri sipariş verirken internet kesildi | İdempotency anahtarı ile güvenli tekrar; mükerrer sipariş oluşmaz |
| **KDS Ekranı Kilitlenme** | Tablet uyku moduna girdi | Yeniden bağlandığında sunucudan tam durum mutabakatı |
| **Sunucu Çökmesi** | Sipariş yazılırken bağlantı koptu | Atomik işlem geri alındı (Rollback), yarım sipariş yok |
| **Çift Tıklama / Buton Flood**| Kullanıcı butona 10 kez hızlıca bastı | 1 Orijinal sipariş + 9 İdempotent Replay |
