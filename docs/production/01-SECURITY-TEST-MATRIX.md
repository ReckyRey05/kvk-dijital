# CEP GARSON — GÜVENLİK TEST MATRİSİ (SECURITY TEST MATRIX)
**Faz:** FAZ 1 — Security Test Cases & Automation  
**Tarih:** 2026-08-21  

---

## 1. GÜVENLİK TEST SENARYOLARI VE BEKLENEN SONUÇLAR

| Test ID | Test Adı | Saldırı Yöntemi | Beklenen Güvenlik Sonucu | Durum |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-TEST-01** | Client-Side Fiyat Değiştirme | `finalPrice: 0.01` ile POST atılır | Sunucu isteği reddeder veya DB'deki orijinal fiyattan hesaplar (HTTP 400/200 canonical price) | 🔴 FAIL (Hardening Gerekli) |
| **SEC-TEST-02** | 15 Dakika Oturum Aşımı | Süresi dolmuş token ile sipariş gönderilir | HTTP 403 Forbidden (`SESSION_EXPIRED`) döner | 🟢 PASS |
| **SEC-TEST-03** | Çapraz Masa (Cross-Table) İhlali | Masa 2 token'ı ile Masa 4'e sipariş atılır | HTTP 403 Forbidden (`INVALID_TOKEN`) döner | 🟢 PASS |
| **SEC-TEST-04** | Çapraz Restoran (Cross-Tenant) İhlali | Restoran A kullanıcısı Restoran B masasına sipariş gönderir | HTTP 403 Forbidden (`TENANT_MISMATCH`) döner | 🔴 FAIL (Hardening Gerekli) |
| **SEC-TEST-05** | Negatif Miktar Enjeksiyonu | `quantity: -10` ile istek gönderilir | HTTP 400 Bad Request döner | 🔴 FAIL (Hardening Gerekli) |
| **SEC-TEST-06** | Sipariş Notu XSS Enjeksiyonu | `<script>alert('XSS')</script>` yazılır | Metin escape edilir veya sanitize edilir, script çalışmaz | 🟢 PASS |
| **SEC-TEST-07** | İmzasız POS Webhook Sahteciliği | Rastgele bir IP'den `TABLE_CLOSED` post edilir | HTTP 401 Unauthorized (Geçersiz İmza) döner | 🔴 FAIL (Hardening Gerekli) |
| **SEC-TEST-08** | Client Storage Boss Bypass | `sessionStorage.setItem("cg_boss_auth", "true")` | Sunucu API'leri veri döndürmez, token zorunlu tutulur | 🔴 FAIL (Hardening Gerekli) |
| **SEC-TEST-09** | Rate Limit Aşımı | 1 saniyede 50 sipariş/çağrı gönderilir | HTTP 429 Too Many Requests (`Retry-After`) döner | 🔴 FAIL (Endpoint'e eklenmeli) |
| **SEC-TEST-10** | Eşzamanlı Stok Tüketimi (Race Condition) | 1 adet kalan ürüne aynı anda 10 istek atılır | Yalnızca 1 istek onaylanır, 9 istek "Tükendi" hatası alır | 🔴 FAIL (Lock/Atomic Gerekli) |

---

## 2. OTOMATİK TEST KOŞMA REHBERİ

İlerleyen fazlarda bu test matrisindeki tüm maddeleri otomatik olarak test edecek test suiteleri (`/tests/security/*`, `/tests/order/*`, `/tests/concurrency/*`) oluşturulacaktır.
