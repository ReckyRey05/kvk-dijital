# CEP GARSON — POS VE WEBHOOK ENTEGRASYON DOĞRULAMASI (POS VALIDATION)
**Faz:** FAZ 10 — POS Integration & Webhook Reliability  
**Tarih:** 2026-08-21  

---

## 1. POS KÖPRÜSÜ VE WEBHOOK PROTOKOLÜ

- **Güvenlik Doğrulaması:** Tüm POS webhook istekleri `x-pos-api-key` başlığı ile kimlik doğrulamasına tabidir.
- **Mükerrer İstek Korunması:** Aynı ödeme onay webhook'u 100 kez gelse bile durum yalnızca bir kez güncellenir.
- **Sırasız Olay Korunması:** Monoton durum ağırlığı sayesinde eski olaylar yeni durumu geriye düşüremez.
