# CEP GARSON — TARAYICI TARAFI VE OTURUM GÜVENLİĞİ (BROWSER SECURITY)
**Faz:** FAZ 6 — Browser Storage, Multi-Tab Sync & Session Boundary  
**Tarih:** 2026-08-21  

---

## 1. YEREL DEPOLAMA (LOCALSTORAGE) VE ÇOKLU SEKME GÜVENLİĞİ

1. **Kiracı Alan Adı Ayrımı (Tenant Namespacing):** Her restorana ait sepet, sipariş ve masa verileri `cg_{tenantId}_*` anahtarıyla izole edilmiştir. Farklı restoran sekmeleri arasında veri sızıntısı oluşmaz.
2. **Hassas Veri Depolama Yasağı:** `localStorage` içinde parola, veritabanı bağlantı dizesi veya API sırrı saklanmaz.
3. **Ters Sekme Ele Geçirme (Anti-Reverse Tabnabbing):** Tüm `target="_blank"` bağlantılarına `rel="noopener noreferrer"` eklenmiştir (`window.opener` istismarı engellenmiştir).
4. **Çoklu Sekme Senkronizasyonu:** `BroadcastChannel` kiracı ID'si ile etiketlenmiş (`cg_sync_tenant_{tenantId}`) olup sadece aynı restorana ait sekmeler arasında veri iletir.
