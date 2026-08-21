# CEP GARSON — TEST KAPSAMI BOŞLUKLARI (TEST COVERAGE GAP)
**Faz:** FAZ 0 — Test Gap Analysis  
**Tarih:** 2026-08-21  

---

## 1. MEVCUT TEST DURUMU

- **Birim Test (Unit Test):** 0 Adet (%0 Kapsam)
- **Entegrasyon Testi (Integration Test):** 0 Adet (%0 Kapsam)
- **E2E / Uçtan Uca Test:** 0 Adet (%0 Kapsam)
- **Güvenlik Testi (Security / Penetration Test):** 0 Adet (%0 Kapsam)

---

## 2. GEREKLİ TEST MATRİSİ VE FAZLARA GÖRE DAĞILIMI

| Test Alanı | Test Türü | Kapsam | İlgili Faz |
| :--- | :--- | :--- | :--- |
| **Fiyat Hesaplama & İndirim Motoru** | Unit Test | Fiyat manipülasyonu, opsiyon toplamı, Happy Hour indirimi | **FAZ 6** |
| **Masa Oturum & 15-dk Süre Sonu** | Integration Test | Süre aşımı, geçersiz token, masa transferi yönlendirmesi | **FAZ 5** |
| **Çok Kiracılı İzolasyon (Tenant Escape)** | Security Test | Restoran A'nın Restoran B masasına sipariş/veri erişim denemeleri | **FAZ 3** |
| **Rol ve Yetki Yükseltme (Privilege Escalation)** | Security Test | Garsonun Boss yetkisine çıkma denemeleri | **FAZ 4** |
| **Eşzamanlı Stok Düşümü (Race Condition)** | Concurrency Test | Son 1 porsiyonun aynı anda 10 müşteri tarafından sipariş edilmesi | **FAZ 7** |
| **Idempotency & Mükerrer Sipariş** | Integration Test | Aynı sipariş isteğinin ağ kopmasıyla 10 kez arka arkaya gelmesi | **FAZ 7** |
| **Webhook İmza Doğrulama** | Security Test | Sahte payload ve replay saldırı testleri | **FAZ 1** |

---

## 3. OTOMASYON PLANI

Projede `vitest` veya `jest` + `@testing-library/react` ve `playwright` kurulumu yapılarak CI/CD derleme hattına bağlanmalıdır.
