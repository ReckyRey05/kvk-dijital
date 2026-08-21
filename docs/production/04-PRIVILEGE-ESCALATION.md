# CEP GARSON — YETKİ YÜKSELTME VE SALDIRI SAVUNMA RAPORU (PRIVILEGE ESCALATION)
**Faz:** FAZ 4 — Privilege Escalation Defense & Attack Analysis  
**Tarih:** 2026-08-21  

---

## 1. YETKİ YÜKSELTME SALDIRI VE SAVUNMA TABLOSU

| Saldırı Türü | Saldırgan Rolü | Hedeflenen Eylem / Kaynak | Uygulanan Savunma Mekanizması | Sonuç |
| :--- | :--- | :--- | :--- | :--- |
| **Dikey Yükseltme** | Garson (`WAITER`) | Z Raporu ve Finansal Ciro Görme | `isRoleAuthorized` kontrolü | 🟢 **BLOCKED (403)** |
| **Dikey Yükseltme** | Garson (`WAITER`) | Menü Fiyatlarını Değiştirme | `isRoleAuthorized` kontrolü | 🟢 **BLOCKED (403)** |
| **Dikey Yükseltme** | Garson (`WAITER`) | Reçete ve Maliyet Matrisini Görme | `isRoleAuthorized` kontrolü | 🟢 **BLOCKED (403)** |
| **Dikey Yükseltme** | Garson (`WAITER`) | Personel Ekleme / Silme | `isRoleAuthorized` kontrolü | 🟢 **BLOCKED (403)** |
| **Dikey Yükseltme** | Kasa (`CASHIER`) | Menü Fiyatlarını Değiştirme | `isRoleAuthorized` kontrolü | 🟢 **BLOCKED (403)** |
| **Dikey Yükseltme** | Mutfak (`KITCHEN`) | Adisyon Tahsilatı / Kapatma | `isRoleAuthorized` kontrolü | 🟢 **BLOCKED (403)** |
| **Dikey Yükseltme** | Müşteri (`CUSTOMER`) | Personel Sipariş Onaylama | Müşteri context kısıtlaması | 🟢 **BLOCKED (403)** |
| **Yatay Yükseltme** | Restoran A Müdürü | Restoran B Raporlarına Erişim | `tenantId` eşleşme denetimi | 🟢 **BLOCKED (403)** |
| **Rol Manipülasyonu** | İstek Gövdesinde Sahte Rol | `role: "OWNER"` JSON Enjeksiyonu | İstemci rolü yok sayılır, token claims kullanılır | 🟢 **BLOCKED (403)** |
| **İmza Tahrifatı** | Token Payload Değiştirme | Base64 decode + role edit | HMAC-SHA256 imza uyumsuzluğu | 🟢 **BLOCKED (401)** |
