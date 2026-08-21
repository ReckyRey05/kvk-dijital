# CEP GARSON — DEPOLAMA VE ÖNBELLEK İZOLASYONU (STORAGE & CACHE ISOLATION)
**Faz:** FAZ 3 — Storage & Cache Isolation  
**Tarih:** 2026-08-21  

---

## 1. YEREL DEPOLAMA (LOCALSTORAGE) ALAN ADI İZOLASYONU

Yerel depolama anahtarları global `cg_*` yerine her kiracı için izole namespace formatında oluşturulur:

```typescript
// Kiracı A için:
getTenantStorageKey("rest_aura_bistro", "orders") 
// -> "cg_rest_aura_bistro_orders"

// Kiracı B için:
getTenantStorageKey("rest_other_lounge", "orders") 
// -> "cg_rest_other_lounge_orders"
```

---

## 2. BULUT DEPOLAMA (FIREBASE STORAGE) GÜVENLİK KURALLARI

Görsel ve medya yüklemelerinde:
1. `maxBytes: 2 * 1024 * 1024` (2 MB sınır) sunucu byte stream kontrolü uygulanır.
2. `sanitizeSafeUrl` ile `javascript:`, `data:` ve zararlı protokol enjeksiyonları filtrelenir.
3. Yüklenen dosyalar kiracının kendi `/restaurants/{tenantId}/...` dizin yolunda saklanır.
