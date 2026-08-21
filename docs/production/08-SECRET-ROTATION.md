# CEP GARSON — SIR ROTASYONU VE ÇİFT ANAHTAR MİMARİSİ (SECRET ROTATION)
**Faz:** FAZ 8 — Zero-Downtime Key Rotation & Dual-Keyring  
**Tarih:** 2026-08-21  

---

## 1. ÇİFT ANAHTAR ROTASYON MEKANİZMASI ([`secretRotation.ts`](file:///c:/Users/ali_h/Desktop/Kvk%20Dijital/src/lib/security/secretRotation.ts))

- **Birincil Anahtar (Primary Key):** Yeni oluşturulan tüm token'ları imzalamak için kullanılır.
- **İkincil Anahtar (Previous Key - Grace Period):** Rotasyon sırasında dolaşımda olan eski token'ların kesintiye uğramaması için 1 saatlik yetkisiz kılınma süresine (`gracePeriodMs`) tabidir.
- **Acil İptal (Emergency Revocation):** Bir anahtar sızdırıldığında `emergencyRevokePreviousKey()` ile anında ve tamamen engellenir.
