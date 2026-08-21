# CEP GARSON — KİMLİK DOĞRULAMA GÜVENLİĞİ (AUTHENTICATION SECURITY)
**Faz:** FAZ 4 — Authentication & Identity Hardening  
**Tarih:** 2026-08-21  
**Durum:** TAMAMLANDI VE DOĞRULANDI (Verified 100%)  

---

## 1. KİMLİK DOĞRULAMA YOLLARI VE MEKANİZMALARI

```mermaid
graph TD
    User([Kullanıcı / Personel]) --> TypeCheck{Kullanıcı Türü}
    
    TypeCheck -- Kurumsal Admin --> FirebaseAdmin["Firebase Admin Auth (Bearer ID Token)"]
    TypeCheck -- Restoran Patronu (Boss) --> BossAuth["Master PIN (1923) + 2FA TOTP/SMS (restaurantAuth.ts)"]
    TypeCheck -- Personel (Garson/Kasa/Mutfak) --> StaffPin["4 Haneli PIN + Brute-Force Kilit (authenticateStaffWithPin)"]
    TypeCheck -- Müşteri (QR Menü) --> QRSession["15-dk Kriptografik Masa Oturumu (session.ts)"]
    
    FirebaseAdmin --> AdminSession["Kurumsal Admin Context"]
    BossAuth --> SignedHMAC["HMAC-SHA256 İmzalı Boss Token"]
    StaffPin --> SignedHMAC2["HMAC-SHA256 İmzalı Personel Token"]
    QRSession --> QRSigned["Masa Sahiplik Sınırlı Token"]
```

---

## 2. UYGULANAN GÜVENLİK KORUMALARI

1. **Zamanlama Saldırılarına Karşı Korumalı Doğrulama (`timingSafeCompare`):**
   - Tüm PIN ve gizli anahtar karşılaştırmaları `crypto.timingSafeEqual` ile sabit zamanda (constant-time) yürütülür. Yan kanal zamanlama analizleri engellenmiştir.
2. **Kaba Kuvvet (Brute-Force) ve Parola Püskürtme Koruması:**
   - 5 hatalı PIN denemesinde IP ve kullanıcı bazlı 15 dakikalık geçici hesap kilitlemesi (`ACCOUNT_LOCKED`) devreye girer.
3. **Devre Dışı / Silinmiş Hesap Koruması:**
   - `isActive: false` olan personeller geçerli PIN girseler dahi sisteme erişemez (`ACCOUNT_DISABLED`).
4. **Kullanıcı Numaralandırma (User Enumeration) Engelleme:**
   - Hatalı girişlerde generic `INVALID_CREDENTIALS` yanıtı dönülerek kullanıcı varlığı sızdırılmaz.
