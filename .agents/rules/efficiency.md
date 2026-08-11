# AI Coding Efficiency & Anti-Loop Rules

Antigravity bu projede çalışırken gereksiz token, işlem ve zaman tüketimini öncelikli olarak gözetmelidir.

## 1. Gereksiz Kod Döngülerinden Kaçın
* Aynı problemi tekrar tekrar analiz etme.
* Aynı dosyayı gereksiz yere tekrar tekrar oku.
* Aynı çözümü farklı şekillerde tekrar deneme.
* Bir hata için sonsuz düzeltme/test döngüsüne girme.
* Çalışan kodu gereksiz yere yeniden yazma.
* Küçük bir değişiklik için tüm projeyi yeniden analiz etme.

## 2. Hata Çözme Limiti
Aynı hata için:
1. Önce hatanın kaynağını belirle.
2. En olası çözümü uygula.
3. Test et.
4. Hata devam ederse ikinci çözümü dene.
5. Hâlâ çözülmediyse dur ve problemi raporla.

Aynı problemi **3 kereden fazla otomatik olarak tekrar deneme.**
Bir çözüm işe yaramıyorsa aynı yaklaşımı küçük değişikliklerle sonsuz kez tekrarlama.

## 3. Önce Analiz, Sonra Kod
Kod yazmadan önce:
* İlgili dosyaları belirle.
* Problemin kaynağını tespit et.
* Gerekli minimum dosyaları oku.
* Değişiklik planını oluştur.
* Sonra kodu değiştir.
Gereksiz dosyaları tarama.

## 4. Minimum Değişiklik Prensibi
Bir görevi tamamlamak için gereken **en küçük ve güvenli değişikliği** yap.
* Gereksiz refactor yapma.
* Çalışan componentleri değiştirme.
* İlgisiz CSS/JS/HTML kodlarına dokunma.
* Kullanıcı istemediği sürece mimariyi değiştirme.
* Bir problemi çözmek için tüm projeyi yeniden yapılandırma.

## 5. Test Stratejisi
Her değişiklikten sonra yalnızca değişiklikle ilgili kısmı test et.
Örneğin:
* Navbar değiştiyse → Navbar'ı test et.
* Login değiştiyse → Login akışını test et.
* CSS değiştiyse → ilgili sayfayı kontrol et.
Tüm projeyi her küçük değişiklikten sonra baştan test etme.

## 6. Tekrarlayan Hatalar
Aynı hata tekrar ortaya çıkarsa:
* Önceki çözümün neden çalışmadığını analiz et.
* Aynı çözümü tekrar uygulama.
* Yeni bir yaklaşım belirle.

Özellikle şu davranışlardan kaçın:
`edit → test → aynı edit → test → aynı edit → test`
Bunun yerine:
`analyze → identify root cause → fix → verify`

## 7. Belirsizlik Durumunda
Problemin nedeni kesin olarak bilinmiyorsa rastgele kod değişiklikleri yapma.
Önce:
1. Hata mesajını incele.
2. İlgili kodu kontrol et.
3. Veri akışını kontrol et.
4. Problemin kaynağına dair en güçlü hipotezi belirle.
5. Sonra değişiklik yap.

## 8. Token Tasarrufu
Token kullanımını azaltmak için:
* Gereksiz uzun açıklamalar üretme.
* Aynı kodu tekrar yazma.
* Büyük dosyaların tamamını gereksiz yere tekrar okuma.
* Daha önce incelenmiş dosyaları tekrar analiz etme.
* Gereksiz terminal komutları çalıştırma.
* Aynı test komutunu sonuç değişmeyecekse tekrar çalıştırma.
* Çalışan kodu sadece "daha güzel olabilir" diye yeniden düzenleme.

## 9. Görev Tamamlandıysa Dur
Bir görev başarıyla tamamlandıysa:
**DUR.**
Ekstra optimizasyon, refactor veya alternatif çözüm arama.
Kullanıcı istemediği sürece tamamlanmış bir görevi tekrar geliştirmeye çalışma.

## 10. Infinite Loop Protection
Antigravity aşağıdaki durumlarda otomatik olarak durmalıdır:
* Aynı hata 3 kez çözülemediyse.
* Aynı dosya üzerinde 3+ kez başarısız değişiklik yapıldıysa.
* Aynı test tekrar tekrar aynı sonucu veriyorsa.
* Yapılan değişiklikler problemi değiştirmiyorsa.
* Problemin çözümü mevcut görev kapsamının dışına çıkıyorsa.

Bu durumda kullanıcıya kısa şekilde:
**"Bu noktada otomatik denemeleri durdurdum. Sorunun nedeni şu: ..."**
şeklinde rapor ver ve kullanıcıdan yönlendirme bekle.

## 11. Öncelik Sırası
Her görevde aşağıdaki öncelik sırasını kullan:
**Doğruluk > Güvenlik > Kullanıcı isteği > Minimum değişiklik > Performans > Kod estetiği**

Kod estetiği veya refactor, çalışan sistemi bozma pahasına yapılmamalıdır.

## 12. Golden Rule
> **Think once, inspect only what is necessary, make the smallest safe change, verify once, and stop when the task is complete.**
Antigravity'nin amacı mümkün olduğunca fazla kod üretmek değil, **gereken işi en az gereksiz işlemle doğru şekilde tamamlamaktır.**
