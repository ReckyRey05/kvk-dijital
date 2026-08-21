# CEP GARSON — TEDARİK ZİNCİRİ VE BAĞIMLILIK GÜVENLİĞİ (SUPPLY CHAIN)
**Faz:** FAZ 8 — Dependency Security & Supply Chain Defense  
**Tarih:** 2026-08-21  

---

## 1. BAĞIMLILIK VE PAKET DENETİMİ

- **Kilit Dosyası Bütünlüğü:** `package-lock.json` değişmez (`immutable`) olarak korunmaktadır.
- **Kritik Zafiyet Taraması:** `npm audit` ile bağımlılık ağacı düzenli olarak taranmakta ve 0 kritik zafiyet (`0 critical vulnerabilities`) kuralı uygulanmaktadır.
- **Güvenilmeyen Betik Yasağı:** `postinstall` betikleri çalıştıran şüpheli kütüphaneler depoya dahil edilmez.
