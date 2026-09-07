# Toptancim Cebimde (Teklifim Gelsin) - Disaster Recovery & Backup Runbook

## 1. Amac ve Kapsam
Bu belge, Toptancim Cebimde B2B pazar yeri ve SaaS abonelik platformunun veri guvenligi, otomatik yedekleme, veri kaybi durumunda geri yukleme (Recovery) ve servis surekliligi prosedurlerini belirler.

---

## 2. Hedef Kurtarma Metrikleri
- **RPO (Recovery Point Objective):** Maksimum 1 saat (PITR ile continuous 7 gun).
- **RTO (Recovery Time Objective):** Kritik hizmetler icin maksimum 30 dakika.

---

## 3. Firestore Yedekleme Stratejisi

### A. Point-in-Time Recovery (PITR)
Firestore veritabani uzerinde PITR aktif tutulur. Bu sayede son 7 gun icindeki herhangi bir dakikaya (dakika hassasiyetinde) anlik geri donus yapilabilir.

```bash
# PITR durumunu dogrulama
gcloud firestore databases describe --database="(default)"
```

### B. Gunluk Otomatik Export (Cloud Storage)
Her gece 03:00 UTC'de Cloud Scheduler ve Cloud Functions araciligiyla kritik koleksiyonlar Cloud Storage yedekleme bucket'ina export edilir.

**Kritik Koleksiyonlar:**
- `teklifim_profiles`
- `teklifim_requests`
- `teklifim_offers`
- `teklifim_orders`
- `teklifim_payments`
- `teklifim_invoices`
- `teklifim_subscriptions`
- `teklifim_billing_records`
- `teklifim_usages`
- `teklifim_admin_audit_logs`

**Manuel Export Komutu:**
```bash
gcloud firestore export gs://kvk-dijital-firestore-backups/$(date +%Y-%m-%d) \
  --collection-ids=teklifim_profiles,teklifim_requests,teklifim_offers,teklifim_orders,teklifim_payments,teklifim_subscriptions,teklifim_billing_records
```

**Saklama (Retention) Politikasi:**
- Gunluk yedekler: 30 gun
- Aylik yedekler: 365 gun (Coldline storage sinifinda)

---

## 4. Veri Kurtarma (Restore) Proseduru

### Senaryo A: Yanlislikla Silinen veya Bozulmus Koleksiyon
1. Hasar tespit edilir ve etkilenen zaman araligi belirlenir.
2. PITR ile verinin bozulmadigi son saglikli dakikadan geri yukleme yapilir:
```bash
gcloud firestore databases restore \
  --source-database="(default)" \
  --destination-database="recovery-temp" \
  --restore-time="2026-09-07T12:00:00Z"
```
3. `recovery-temp` uzerinden eksik veya hasarli belgeler ana veritabanina aktarilir.

### Senaryo B: Tam Felaket / Veritabani Yeniden Kurulumu
1. En son basarili Cloud Storage export'u secilir.
2. Geri yukleme calistirilir:
```bash
gcloud firestore import gs://kvk-dijital-firestore-backups/2026-09-07/
```
3. Uygulama saglik kontrolu (`/api/teklifim-gelsin/health`) uzerinden veri baglantisi dogrulanir.

---

## 5. Deployment & Kod Rollback Proseduru
1. Hatali bir release durumunda Vercel veya Cloud Run paneli uzerinden anlik "Rollback to Previous Deployment" secenegi ile trafik bir onceki stabil commit hash'ine yonlendirilir.
2. Git uzerinde hotfix dali acilir ve problem cozulene kadar master dali korumada tutulur.
