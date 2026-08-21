# CEP GARSON — GİRDİ DOĞRULAMA VE TİP GÜVENLİĞİ (INPUT VALIDATION)
**Faz:** FAZ 5 — Input Validation & Type Confusion Defense  
**Tarih:** 2026-08-21  

---

## 1. TİP KARIŞIKLIĞI (TYPE CONFUSION) VE ÖZEL SAYI SALDIRILARI

Aşağıdaki anormal girdiler sunucu tarafından güvenli şekilde yakalanarak `400 Bad Request` yanıtı dönülmektedir:

| Saldırı / Girdi Türü | Örnek Payload | Sunucu Davranışı | Sonuç |
| :--- | :--- | :--- | :--- |
| **Dizi Yerine Nesne/String** | `items: "truffle_burger"` | Dizi kontrolü (`Array.isArray`) başarısız | 🟢 **REJECTED (400)** |
| **Özel Sayı (Special Number)** | `quantity: NaN` | `isNaN` ve `isFinite` kontrolü ile reddedilir | 🟢 **REJECTED (400)** |
| **Sonsuz Sayı (Infinity)** | `quantity: Infinity` | Sayı aralık denetimi (`1..100`) ile reddedilir | 🟢 **REJECTED (400)** |
| **Negatif Miktar** | `quantity: -5` | Pozitif tamsayı doğrulaması ile reddedilir | 🟢 **REJECTED (400)** |
| **Kayan Noktalı Adet** | `quantity: 1.5` | `Number.isInteger` denetimi ile engellenir | 🟢 **REJECTED (400)** |
| **Null / Undefined Gövde** | `body: null` | `parseJsonWithByteLimit` güvenli ayrıştırma | 🟢 **REJECTED (400)** |
| **Null Byte Enjeksiyonu** | `notes: "Masa 1\0Admin"` | Dize temizleme ve sanitizasyon | 🟢 **SANITIZED** |
