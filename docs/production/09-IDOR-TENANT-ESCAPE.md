# CEP GARSON — IDOR VE ÇAPRAZ KİRACI KAÇIŞI TESTLERİ (IDOR & TENANT ESCAPE)
**Faz:** FAZ 9 — Cross-Tenant Escape & Path Traversal Defense  
**Tarih:** 2026-08-21  

---

## 1. ADVERSARIAL IDOR TESTLERİ

- **Dizin Geçişi (Path Traversal IDOR):** `m-4/../../rest_rival_cafe/m-1` biçiminde gönderilen masa kimlikleri `assertTableOwnership` tarafından kesin eşleşme ve regex filtreleri ile reddedilmiştir.
- **Çapraz Sipariş Enjeksiyonu:** Kiracı A oturumu üzerinden Kiracı B siparişinin değiştirilmesi veya okunması `assertOrderOwnership` tarafından engellenmiştir.
