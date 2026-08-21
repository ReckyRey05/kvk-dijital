# CEP GARSON — DAĞITIK SİSTEM VE VERİ BÜTÜNLÜĞÜ MİMARİSİ (DISTRIBUTED INTEGRITY)
**Faz:** FAZ 7 — Distributed Systems & Concurrency Hardening  
**Tarih:** 2026-08-21  
**Durum:** TAMAMLANDI VE DOĞRULANDI (Verified 100%)  

---

## 1. GERÇEK KAYNAK (SOURCE OF TRUTH) MATRİSİ

| Varlık (Entity) | Otoriter Kaynak (Source of Truth) | Okuma Modeli (Read Model) | Gerçek Zamanlı İzdüşüm (Realtime Projection) | İstemci Durumu (Client State) |
| :--- | :--- | :--- | :--- | :--- |
| **Sipariş (Order)** | Veritabanı (Firestore / SQL) | Kanonik Hesaplama Motoru | KDS / Kasa Broadcast / WebSocket | Salt Okunur / Reaktif Görünüm |
| **Ödeme (Payment)** | Ödeme Sağlayıcı + Veritabanı | Tam Kuruş Değişmezleri | Kasa Tahsilat Bildirimi | İşlem Sonucu Gösterimi |
| **Stok (Inventory)** | Atomik Veritabanı Sayacı | Negatif Olmayan Stok Sınırı | Tükendi / Mevcut Etiketi | UI Buton Kısıtı |
| **Masa (Table)** | Veritabanı | Masa Sahiplik Modeli | Salon Planı Renk Kodu | Seçilebilir UI Elemanı |
| **Oturum (Session)** | Sunucu İmzalı HMAC Token | 15 Dakika TTL Kontrolü | Canlı Oturum Sayacı | Token Saklama |

---

## 2. TEMEL DAĞITIK İLKELER

1. **İstemci Asla Otoriter Değildir:** Fiyat, vergi, durum, stok veya yetki hiçbir zaman istemci tarafında kararlaştırılamaz.
2. **Kayıp Güncelleme (Lost Update) Önleme:** Eşzamanlı güncellemelerde atomik artırma ve sürüm denetimi (`tokenVersion`, `updatedAt`) kullanılır.
3. **Ağ Kopması Durumunda Tam Mutabakat (Reconciliation on Reconnect):** Bağlantı koptuğunda kaçırılan olaylar istemciyi yanıltmaz; yeniden bağlandığında sunucudan tam durum mutabakatı yapılır.
