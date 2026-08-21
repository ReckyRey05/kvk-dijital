# CEP GARSON — İZLEME VE ALARM STRATEJİSİ (MONITORING & ALERTING)
**Faz:** FAZ 8 — Production Metrics & Alert Thresholds  
**Tarih:** 2026-08-21  

---

## 1. ALARM EŞİKLERİ (ALERT THRESHOLDS)

| Metrik / Olay | Tetiklenme Eşiği | Alarm Seviyesi | Aksiyon |
| :--- | :--- | :--- | :--- |
| **HTTP 5xx Hata Oranı** | > %1 (5 Dakikalık pencerede) | SEV-2 | Otomatik Rollback / SRE İnceleme |
| **Brute-Force Kilitlenmesi** | > 10 Kilitlenme / 10 Dakika | SEV-3 | IP Engelleme & Güvenlik Alarmı |
| **Ödeme / İade Uyuşmazlığı** | $\ge 1$ Başarısız Senkronizasyon | SEV-1 | Anlık Bildirim & POS İnceleme |
| **Veritabanı Yanıt Süresi** | P99 > 500ms | SEV-3 | Query & İndeks İncelemesi |
