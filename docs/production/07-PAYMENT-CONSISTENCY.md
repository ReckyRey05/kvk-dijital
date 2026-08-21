# CEP GARSON — ÖDEME VE İADE BÜTÜNLÜĞÜ (PAYMENT CONSISTENCY)
**Faz:** FAZ 7 — Payment & Refund Consistency Invariants  
**Tarih:** 2026-08-21  

---

## 1. FİNANSAL DEĞİŞMEZLER (MONEY INVARIANTS)

1. **Toplam Eşitliği:**  
   $$\text{Toplam (Kuruş)} = \text{Ara Toplam} + \text{KDV} + \text{Hizmet Bedeli} - \text{İndirim}$$
2. **Ödeme Sınırı:**  
   $$\text{Tahsil Edilen Tutar} \le \text{Sipariş Toplam Tutarı}$$
3. **İade Sınırı:**  
   $$\text{Toplam İade Edilen Tutar} \le \text{Tahsil Edilen Tutar}$$
4. **Kalan Bakiye:**  
   $$\text{Kalan Bakiye} = \text{Sipariş Toplamı} - \text{Tahsil Edilen Tutar} + \text{İadeler}$$

---

## 2. KORUMA TESTLERİ

- **Aşırı İade (Over-Refund):** 990 TL ödenen bir hesap için 1.000 TL iade talebi anında reddedilir.
- **Mükerrer İade (Double Refund):** Tam iadesi yapılmış bir hesaba ikinci kez iade isteği gönderilmesi engellenir.
- **Kuruş Hassasiyeti:** 1.000 rastgele fatura üzerinde yapılan kuruş denetiminde sapma sıfırdır (%100 tam uyum).
