# CEP GARSON — OTURUM VE TOKEN GÜVENLİĞİ (SESSION SECURITY)
**Faz:** FAZ 4 — Session Architecture, Cryptographic Tokens & Revocation  
**Tarih:** 2026-08-21  

---

## 1. İMZALI OTURUM MİMARİSİ (SIGNED SESSION ARCHITECTURE)

Tüm personel ve patron oturumları HMAC-SHA256 ile kriptografik olarak imzalanır:

```
[Base64URL(Payload)] . [Base64URL(HMAC-SHA256(Payload, AUTH_SECRET))]
```

Payload Yapısı:
```json
{
  "sessionId": "sess_staff_1771588200_a1b2c3d4",
  "userId": "staff_waiter_1",
  "restaurantId": "rest_aura_bistro",
  "role": "WAITER",
  "name": "Ahmet Garson",
  "tokenVersion": 1,
  "issuedAt": 1771588200000,
  "expiresAt": 1771631400000
}
```

---

## 2. OTURUM SABİTLEME VE İPTAL (REVOCATION & FIXATION DEFENSE)

1. **Oturum Sabitleme Koruması (Anti-Session Fixation):**
   - Her başarılı girişte eski oturum tanımlayıcısı imha edilerek yeni kriptografik `sessionId` üretilir.
2. **Anlık Oturum İptali (Instant Revocation on Logout):**
   - Çıkış yapıldığında `revokeSession(sessionId)` çağrılarak token geçerlilik süresi bitmemiş olsa dahi anında engellenir.
3. **Rol Düşürme & Parola Değişikliğinde Eski Token İptali (`tokenVersion`):**
   - Bir kullanıcının rolü düşürüldüğünde (örn. `OWNER` -> `WAITER`) veya şifresi değiştiğinde kullanıcının `tokenVersion` değeri artırılır.
   - Eski token ile gelen istekler `VERSION_MISMATCH` hatası alarak derhal reddedilir.
4. **Müşteri QR Oturum Sınırı:**
   - Müşteri QR oturumları (`createTableSession`) asla personel veya admin token'ı olarak kabul edilmez.
