# CEP GARSON — API YETKİLENDİRME VE ÇOK KİRACILI ERİŞİM MATRİSİ
**Faz:** FAZ 3 — API Authorization & Access Matrix  
**Tarih:** 2026-08-21  

---

## 1. API ROTALARI VE KİRACI ERİŞİM MATRİSİ

| API Endpoint | HTTP | Kiracı A Kullanıcısı -> Kaynak A | Kiracı A Kullanıcısı -> Kaynak B | Yetkisiz / Anonim İstek | Uygulanan Güvenlik Koruması |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/restaurant/order` | `POST` | 🟢 **ALLOW (200)** | 🔴 **BLOCK (404/403)** | 🔴 **BLOCK (403)** | `calculateAndCreateCanonicalOrder` + Token |
| `/api/restaurant/session` | `POST` | 🟢 **ALLOW (200)** | 🔴 **BLOCK (404)** | 🟢 **INIT (200)** | `assertTableOwnership` + 15-dk TTL |
| `/api/restaurant/waiter-call` | `POST` | 🟢 **ALLOW (200)** | 🔴 **BLOCK (404)** | 🔴 **BLOCK (400)** | `assertTableOwnership` |
| `/api/restaurant/pos-webhook` | `POST` | 🟢 **ALLOW (200)** | 🔴 **BLOCK (404/401)** | 🔴 **BLOCK (401)** | `posApiKey` Secret Doğrulaması |
| `/api/admin/*` | `CRUD` | 🟢 **ALLOW (Admin)** | 🔴 **BLOCK** | 🔴 **BLOCK (401)** | Firebase ID Token `verifyAdminServerRequest` |

---

## 2. KURAL ÖZETİ

1. `Authenticated A -> A Resource:` **İzin verilir.**
2. `Authenticated A -> B Resource:` **Engellenir (Cross-Tenant Leak = 0).**
3. `Authenticated B -> A Resource:` **Engellenir (Cross-Tenant Leak = 0).**
4. `Unauthenticated -> Protected Resource:` **Engellenir (401/403).**
