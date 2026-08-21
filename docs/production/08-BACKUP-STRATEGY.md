# CEP GARSON — YEDEKLEME STRATEJİSİ (BACKUP STRATEGY)
**Faz:** FAZ 8 — 3-2-1 Backup Model & Cryptographic Verification  
**Tarih:** 2026-08-21  

---

## 1. 3-2-1 YEDEKLEME MİMARİSİ

- **3 Kopya:** 1 Canlı Veritabanı + 1 Bulut Snapshot + 1 Şifrelenmiş Harici Depolama.
- **2 Farklı Medya:** Firestore Native Backup + Şifrelenmiş JSON / S3 Export.
- **1 Harici Konum (Offsite):** Farklı bir coğrafi bölgede (Frankfurt / Dublin) bağımsız şifrelenmiş yedekleme havuzu.

---

## 2. YEDEKLEME BÜTÜNLÜK DOĞRULAMASI (INTEGRITY CHECKSUM)

Her yedekleme paketi oluşturulduğunda SHA-256 özeti hesaplanır (`snapshot.checksum`). Geri yükleme sırasında yükün özeti doğrulanmadan tek bir kayıt dahi veritabanına aktarılmaz. Bozulmuş yedekler `CORRUPTED_BACKUP` hatasıyla anında engellenir.
