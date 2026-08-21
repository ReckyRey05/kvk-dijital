# CEP GARSON — DEĞİŞTİRİLEMEZ DENETİM İZİ (AUDIT TRAIL)
**Faz:** FAZ 7 — Immutable Audit Logging & Request Correlation  
**Tarih:** 2026-08-21  

---

## 1. DENETLENEN KRİTİK EYLEMLER

Aşağıdaki eylemler için sunucu tarafında değiştirilemez denetim kayıtları tutulur:
- Sipariş iptali ve zayi bildirimleri (`wasteLogs`)
- İndirim uygulama ve patron PIN onayları
- Masa taşıma ve hesap transferleri (`tableTransfers`)
- Rol değişiklikleri ve yetkilendirme güncellemeleri
- Gün sonu Z-raporu ve ciro dökümleri

---

## 2. DENETİM KAYDI ALANLARI

```json
{
  "auditId": "audit_1771588200_a1b2",
  "timestamp": "2026-08-21T04:00:00.000Z",
  "tenantId": "rest_aura_bistro",
  "userId": "staff_cashier_1",
  "action": "CANCEL_BILL",
  "resourceId": "ord_101",
  "reason": "Müşteri isteği",
  "approvedBy": "boss_master_user"
}
```
