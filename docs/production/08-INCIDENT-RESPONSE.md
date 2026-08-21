# CEP GARSON — OLAY MÜDAHALE VE SEVERITY SEVİYELERİ (INCIDENT RESPONSE)
**Faz:** FAZ 8 — Incident Response Playbooks & Severity Matrix  
**Tarih:** 2026-08-21  

---

## 1. OLAY KRİTİKLİK SEVİYELERİ (SEVERITY MATRIX)

| Seviye | Tanım | Örnekler | Maksimum Müdahale Süresi |
| :--- | :--- | :--- | :--- |
| **SEV-1 (Kritik)** | Veri kaybı, para tutarsızlığı, çapraz kiracı sızıntısı | Çapraz sipariş görme, negatif bakiye, veritabanı çökmesi | **< 15 Dakika** |
| **SEV-2 (Yüksek)** | Ana sistem fonksiyonunun kısmi durması | POS webhook kesintisi, sipariş oluşturma yavaşlığı | **< 1 Saat** |
| **SEV-3 (Orta)** | İkincil işlev bozulması | Jukebox istekleri veya çarkıfelek gecikmesi | **< 4 Saat** |
| **SEV-4 (Düşük)** | Kozmetik / arayüz anomalisi | UI renk veya metin kayması | **< 24 Saat** |
