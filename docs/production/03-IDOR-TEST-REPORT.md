# CEP GARSON — IDOR VE ENUMERATION TEST RAPORU
**Faz:** FAZ 3 — Insecure Direct Object Reference Defense  
**Tarih:** 2026-08-21  

---

## 1. IDOR SALDIRI SENARYOLARI VE SONUÇLARI

| Test ID | Hedef Kaynak | Saldırı Yöntemi / Payload | Beklenen Güvenlik Sonucu | Gerçek Sonuç |
| :--- | :--- | :--- | :--- | :--- |
| **IDOR-01** | `tableId` | Yabancı kiracı masası (`m-b-1`) ile sipariş | HTTP 404 / 403 `TENANT_MISMATCH` | 🟢 **BLOCKED (PASS)** |
| **IDOR-02** | `tableId` | Brute-force & path traversal (`../admin`, `m-999`) | HTTP 404 `TENANT_OR_TABLE_INVALID` | 🟢 **BLOCKED (PASS)** |
| **IDOR-03** | `menuItemId` | Yabancı restorana ait ürün ID'si (`item_b_special`) | HTTP 400 `PRODUCT_NOT_FOUND` | 🟢 **BLOCKED (PASS)** |
| **IDOR-04** | `sessionToken` | Restoran A token'ı ile Restoran B'ye erişim | HTTP 403 `SESSION_INVALID` | 🟢 **BLOCKED (PASS)** |
| **IDOR-05** | `orderId` | Yabancı sipariş ID'sine erişim | HTTP 403 `Cross-Tenant Access Blocked` | 🟢 **BLOCKED (PASS)** |
| **IDOR-06** | `staffId` | Yabancı personel ID'si ile işlem denemesi | HTTP 404 `Personel bulunamadı` | 🟢 **BLOCKED (PASS)** |

---

## 2. ADLİ BULGU VE DÜZELTME NOTU (FORENSIC FIX)

- **Tespit Edilen Zafiyet:** İlk analizde masa numarası eşleştirmesinde gevşek regex (`replace(/[^0-9]/g, "")`) kullanıldığı için `m-b-1` ID'sinin `Masa 1` ile çakışabildiği görüldü.
- **Uygulanan Düzeltme:** Masa numarası eşleştirmesi katı biçimde `m-` ardından yalnızca rakam içeren formatlara (`m-1` -> `Masa 1`) kısıtlandı. `m-b-1` gibi yabancı formatların yerli masalarla eşleşmesi %100 engellendi.
