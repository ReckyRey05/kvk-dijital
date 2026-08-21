# CEP GARSON — ROL TABANLI ERİŞİM KONTROLÜ (RBAC MATRIX)
**Faz:** FAZ 4 — Role-Based Access Control & Permission Model  
**Tarih:** 2026-08-21  

---

## 1. ROL VE YETKİ MATRİSİ (RBAC MATRIX)

| Yetki / Eylem (Action) | CUSTOMER | WAITER (Garson) | CASHIER (Kasa) | KITCHEN (Mutfak) | MANAGER (Müdür) | OWNER (Patron) | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **QR Sipariş Verme / Çağrı** | 🟢 EVET | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR |
| **Sipariş Onaylama** | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🟢 EVET |
| **Masa Taşıma / Birleştirme** | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🟢 EVET |
| **Ödeme Tahsilatı & Adisyon Kapatma**| 🔴 HAYIR | 🔴 HAYIR | 🟢 EVET | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🟢 EVET |
| **Mutfak Sipariş Hazırlama (KDS)** | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🟢 EVET | 🟢 EVET |
| **İndirim Uygulama** | 🔴 HAYIR | 🔴 HAYIR (0%)| 🟢 EVET (Maks %10)| 🔴 HAYIR | 🟢 EVET (Maks %25)| 🟢 EVET (100%)| 🟢 EVET |
| **Hesap / Adisyon İptali** | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR* | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🟢 EVET |
| **Z Raporu & Ciro Raporu Görme** | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🟢 EVET |
| **Menü ve Fiyat Düzenleme** | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🟢 EVET |
| **Reçete & Maliyet Kâr Matrisi** | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🟢 EVET | 🟢 EVET | 🟢 EVET |
| **Personel / Kullanıcı Yönetimi** | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🟢 EVET | 🟢 EVET |
| **İşletme Güvenlik Ayarları** | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🟢 EVET | 🟢 EVET |
| **Çapraz Kiracı Yönetimi** | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🔴 HAYIR | 🟢 EVET |

*\*Kasa görevlisi için adisyon iptali Patron / Müdür PIN onayı gerektirir.*
