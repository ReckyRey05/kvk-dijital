# CEP GARSON — KİMLİK DOĞRULAMA ATLAMA SALDIRILARI (AUTH BYPASS)
**Faz:** FAZ 9 — Authentication & Token Claim Tampering Defense  
**Tarih:** 2026-08-21  

---

## 1. UYGULANAN SALDIRILAR VE SONUÇLAR

1. **HMAC İmza Tahrifatı (Signature Tampering):** Token yükü değiştirilip rastgele imza eklendiğinde imza geçersizliği nedeniyle token anında reddedilmiştir.
2. **Rol Değiştirme (Role Claim Escalation):** Müşteri token'ındaki `role: "CUSTOMER"` alanı `"OWNER"` olarak manipüle edildiğinde HMAC imzası bozulmuş ve yetkisiz işlem engellenmiştir.
3. **Zaman Aşımı (Expiration):** 15 dakikalık oturum süresi dolmuş token'lar sunucu tarafından kabul edilmemektedir.
