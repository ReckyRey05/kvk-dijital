# CEP GARSON — CSRF VE CORS GÜVENLİK ANALİZİ (CSRF & CORS)
**Faz:** FAZ 6 — Cross-Site Request Forgery & Cross-Origin Resource Sharing  
**Tarih:** 2026-08-21  

---

## 1. CSRF SAVUNMASI

- **Durum Değiştiren İstekler (POST/PUT/DELETE):** Tüm durum değiştiren API uç noktaları `Authorization: Bearer <Token>` başlığı veya oturum token'ı gerektirir.
- **Tarayıcı Çerezleri:** Çerez tabanlı yetkilendirmede `SameSite=Strict` veya `SameSite=Lax` ve `Secure` zorunludur.
- **Origin ve Referer Doğrulaması:** Yetkisiz kaynaklardan gelen çapraz istekler reddedilir.

---

## 2. CORS YAPILANDIRMASI

- **Wildcard + Kimlik Bilgisi Engelleme:** `Access-Control-Allow-Origin: *` ile `credentials: true` kesinlikle birlikte kullanılmaz.
- **Origin Reflection:** İstemci `Origin` başlığı kontrolsüzce `Allow-Origin` başlığına yansıtılmaz.
- **İzin Verilen Metotlar:** Yalnızca gerekli HTTP metotları (`GET, POST, PUT, DELETE, OPTIONS`) açıktır.
