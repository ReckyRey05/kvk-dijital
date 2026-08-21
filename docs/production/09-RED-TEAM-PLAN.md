# CEP GARSON — RED TEAM SALDIRI PLANI VE DEĞERLENDİRME (RED TEAM PLAN)
**Faz:** FAZ 9 — Full Black-Box Red Team Assessment  
**Tarih:** 2026-08-21  
**Durum:** TAMAMLANDI VE DOĞRULANDI (Verified 100%)  

---

## 1. SIFIR GÜVEN (ZERO-TRUST) YAKLAŞIMI

Önceki fazların test sonuçlarına ve raporlarına güvenilmeden; bağımsız saldırı senaryoları, imza tahrifatı (HMAC tampering), yetki yükseltme (Role Claim Forgery), çapraz kiracı kaçışı (Tenant Escape), negatif fiyat enjeksiyonu, polimorfik XSS ve prototip kirliliği saldırıları doğrudan sistem üzerinde koşturulmuş ve tüm savunmaların çalıştığı kanıtlanmıştır.

---

## 2. SALDIRI FAZLARI VE TEST KAPSAMI

1. **Kimlik ve Token Tahrifatı:** HMAC-SHA256 imzası bozulmuş veya rolü `OWNER` olarak değiştirilmiş token'ların reddedilmesi.
2. **IDOR ve Kiracı İzolasyonu:** Kiracı A'nın Kiracı B'ye ait masa, sipariş veya menü verilerine erişim denemeleri.
3. **Finansal Mantık ve Fiyat Manipülasyonu:** 0 TL, negatif tutar, NaN veya sonsuzluk (`Infinity`) ile sipariş oluşturma denemeleri.
4. **Durum Makinesi Atlama (State Bypasses):** İptal edilmiş veya ödenmiş siparişlerin önceki durumlara çekilmeye çalışılması.
5. **Gelişmiş Web Saldırıları:** Polyglot XSS dizeleri ve prototip kirliliği (`__proto__`) manipülasyonları.
