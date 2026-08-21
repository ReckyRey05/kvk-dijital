# CEP GARSON — WEBHOOK SALDIRILARI VE TEKRAR KORUMASI (WEBHOOK ATTACKS)
**Faz:** FAZ 9 — Webhook Forgery, Replay & Out-of-Order Exploits  
**Tarih:** 2026-08-21  

---

## 1. WEBHOOK GÜVENLİK TESTLERİ

- **Sahte / Eksik İmza:** Geçerli API anahtarı veya imza içermeyen webhook çağrıları `401 Unauthorized` ile reddedilir.
- **Mükerrer İstek (Replay):** Aynı webhook 1.000 kez gönderilse dahi veritabanı durumu yalnızca 1 kez güncellenir.
- **Sırasız Olaylar:** Monoton durum ağırlığı sayesinde eski olaylar yeni durumu geriye düşüremez.
