# CEP GARSON — GERİ YÜKLEME KILAVUZU (RESTORE RUNBOOK)
**Faz:** FAZ 8 — Disaster Recovery Step-by-Step Execution  
**Tarih:** 2026-08-21  

---

## 1. ACİL GERİ YÜKLEME ADIMLARI (DISASTER RESTORE DRILL)

1. **Tespit (Detection):** Veri bozulması veya kesinti alarmı alındığında sistem bakım moduna alınır.
2. **Snapshot Seçimi:** En son doğrulanan SHA-256 imzalı snapshot çekilir.
3. **Bütünlük Doğrulaması:** `executeRestoreDrill(snapshot)` çağrılarak checksum ve yabancı anahtar (Referential Integrity) kontrolü yapılır.
4. **Geri Yükleme:** `restaurants`, `tables`, `menuItems`, `ingredients`, `staffMembers`, `orders` koleksiyonları atomik olarak geri yüklenir.
5. **Kanonik Fatura Denetimi:** Geri yüklenen tüm siparişlerin kuruş dengesi denetlenir.
6. **Sistemin Açılması:** Sağlık kontrolü (`/api/health`) 200 OK verdikten sonra trafik kademeli olarak açılır.
