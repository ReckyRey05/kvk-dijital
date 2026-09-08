# İtemSepeti — Teknik Geliştirme & Mimari Günlüğü (Technical Changelog & Architecture Audit)

> **Amaç**: Bu belge, İtemSepeti projesinde gerçekleştirilen tüm teknik adımları, mimari kararları, veritabanı/domain modellerini, güvenlik bariyerlerini, state machine kurallarını ve API kontratlarını harici yapay zeka sistemlerine (ChatGPT, Claude vb.) veya teknik denetçilere eksiksiz aktarmak için tutulan resmi teknik kayıt dokümanıdır.
>
> **Son Güncelleme**: 2026-09-08  
> **Proje Adı**: İtemSepeti (Türkiye Oyuncu Pazaryeri & E-Pin Platformu)  
> **Temel Teknoloji**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Firebase / Firestore, Lucide Icons  

---

## 1. Genel Sistem Mimarisi & Prensipler

1. **Finansal ve Yetki Kaynağı (Server Source of Truth)**:
   - Client hiçbir zaman fiyat, bakiye, stok veya yetkilendirme (role/permission) kaynağı olamaz.
   - Tüm hesaplamalar (komisyon, KDV, bakiye düşümü, escrow blokajı) sunucu tarafında atomik olarak icra edilir.

2. **Escrow (Emanet Havuz) & Sipariş Döngüsü**:
   - Alıcının ödediği para doğrudan satıcının çekilebilir bakiyesine aktarılmaz; havuzda bloke edilir.
   - Sipariş Durumları (State Machine):
     PENDING_PAYMENT -> PAID_ESCROW_LOCKED -> SELLER_DELIVERED -> BUYER_CONFIRMED / AUTO_CONFIRMED -> COMPLETED (veya DISPUTED / CANCELLED / REFUNDED).

3. **Stok Rezervasyon & Yarış Koşulu (Race Condition) Önleme**:
   - Sepete ekleme ve checkout başlangıcında 15 dakikalık geçici kilit (atomic reservation) uygulanır. Süre bittiğinde veya sipariş iptalinde serbest bırakılır.

---

## 2. Tamamlanan Fazlar Özeti (Completed Phases)

### FAZ 0 — Domain Modelleme & Mimari Sözleşmesi
- src/types/marketplace.ts:
  - Modeller: ItemSepetiUser, ItemSepetiGame, ItemSepetiCategory, ItemSepetiListing, ItemSepetiOrder, ItemSepetiOrderItem, ItemSepetiEscrowAccount, ItemSepetiWallet, ItemSepetiDispute.
  - Ürün Tipleri: ITEM, CURRENCY, DIGITAL_CODE, ACCOUNT.
  - Teslimat Yöntemleri: IN_GAME_TRADE, AUTOMATIC_CODE, MANUAL_CODE, ACCOUNT_TRANSFER.

### FAZ 1 — Brand, Design System & Frontend Temeli
- Özgün görsel kimlik: İtemSepeti (Büyük İ, birleşik yazım).
- Açık tema (Light Mode) varsayılan: #F7F7F5 zemin, #FFFFFF kart yüzeyi, #DCDDE1 kenarlık, #D99532 amber vurgusu.
- Koyu tema (Dark Mode) desteği: #12141A zemin, #161921 kart, #282C3A kenarlık.
- 10/10 test geçişi sağlandı (rontendFoundation.test.ts).

### FAZ 2 — Katalog, Oyunlar, Kategoriler & İlan Sistemi
- src/lib/itemsepeti/catalogService.ts: Oyunlar, kategoriler, sunucular ve ilanlar hiyerarşik olarak kurgulandı.
- Sunucu taraflı filtreleme (oyun, sunucu, fiyat aralığı, stokta olma durumu).
- 24/24 test geçişi sağlandı (catalogAndListings.test.ts).

### FAZ 3 — Alıcı Deneyimi, Keşif & İlan Detayı
- İlan detay sayfası, dinamik BuyBox (adet seçici, alt toplam, satıcı rozetleri, anında teslimat göstergesi).
- Satıcı profili sayfası (/satici/[sellerId]), değerlendirme sistemi, ortalama teslimat süresi.
- Hassas finansal verilerin (IBAN, vergi no, komisyon oranı) kamuya sızması engellendi.
- 30/30 test geçişi sağlandı (uyerExperience.test.ts).

### FAZ 3.5 — Görsel Revizyon (ByNoGame & Türk Pazaryeri Dinamikleri)
- Header altı ByNoGame tarzı oyun kategorisi hızlı erişim çubuğu (CS2 Skin & Kasa, Metin2 Yang & Won, Valorant VP, PUBG UC, Steam Cüzdan Kodu).
- Hero arama ve oyun rozetleri (monogram ikonlu keşif şeridi).
- Asimetrik 1+3 Günün Fırsatları vitrini (ItemSepetiEditorialGrid).
- 22/22 test geçişi sağlandı (rtDirectionV2.test.ts).

### FAZ 5 — Sepet, Çoklu Satıcı Checkout & Sipariş Snapshot Yapısı
- src/lib/itemsepeti/cartService.ts & src/lib/itemsepeti/orderService.ts:
  - Konuk sepetinin alıcı hesabına atomik birleşmesi (guest merge).
  - Çoklu satıcıdan ürün eklenmesi durumunda sepetin her satıcı için ayrı siparişlere (Order) bölünmesi ve tek bir üst oturum (CheckoutSession) ile bağlanması.
  - 15 dakikalık atomik stok kilitleri ve süre bitiminde iadesi.
  - İlan snapshot'ı (fiyat değişse dahi sipariş anındaki değerin değişmezliği).
  - 62/62 test geçişi sağlandı (cartAndCheckout.test.ts).

---

## 3. Güncel Teknik Günlük (Chronological Technical Log)

### [2026-09-08] Kayıt 1: ByNoGame Navigasyon Entegrasyonu & Log Sistemi Kurulumu
- **Yapılan İş**:
  1. src/components/itemsepeti/layout/ItemSepetiHeader.tsx bileşenine ByNoGame tipi alt kategori erişim barı eklendi.
  2. src/app/itemsepeti/page.tsx sayfasındaki Hero başlığı, arama ve vitrin başlıkları oyuncu pazarı diline uyarlandı.
  3. Tüm TypeScript ve regression testleri (toplam 190+ test) sıfır hata ile doğrulandı ve master/main branchlerine pushlandı.
  4. Harici LLM'lerin (ChatGPT, Claude vb.) projenin teknik durumunu tam bağlamla anlayabilmesi için bu TECHNICAL_CHANGELOG.md oluşturuldu.

---


### [2026-09-08] Kayıt 2: Üyelik, Satıcı İlan Yönetimi, 7/24 Canlı Destek ve Havale/EFT Sistemi
- **Geliştirilen Modüller**:
  1. **Authentication & Session Hub (`src/context/ItemSepetiAuthContext.tsx`, `/giris`, `/kayit-ol`, `/profilim`)**:
     - Kullanıcı oturumu, `role` yönetimi (`buyer` / `seller` / `admin`), telefon onay durumu ve cüzdan bakiyesi bağlandı.
     - Giriş ekranına hızlı demo hesap geçişleri (Alıcı, Satıcı, Admin) eklendi.
     - Profil ekranına Steam Trade Offer URL doğrulaması, Metin2 / CS2 oyun içi karakter nicki kaydetme alanları entegre edildi.
  2. **Satıcı İlan Yönetim Merkezi (`/ilan-ver`, `/ilanlarim`, `/api/itemsepeti/seller/listings`)**:
     - `/ilan-ver` sayfası açık ve koyu tema tasarım token'larına (`bg-white`, `border-[#DCDDE1]`, `dark:bg-[#161921]`) tam uyumlu hale getirildi.
     - `/ilanlarim` paneli inşa edildi: Satıcının aktif/pasif tüm ilanları listelenir, tek tıkla ilanı duraklatma (`paused`), tekrar yayına alma (`active`) ve silme işlemleri sunucuya yansıtılır.
  3. **7/24 Canlı Destek & Yardım Masası (`src/components/itemsepeti/support/ItemSepetiLiveSupportWidget.tsx`)**:
     - ByNoGame ve İtemSatış esintili, sitenin sağ alt köşesinde yüzen canlı yardım penceresi kuruldu.
     - Teslimat süresi, bakiye yükleme ve ilan onayına yönelik otomatik soru-cevap botu (Heuristic FAQ Auto-Responder) ve operatör sırası simülasyonu eklendi.
  4. **Banka Havalesi / EFT Bildirim Sistemi (`/bakiye-yukle`)**:
     - ETBİS onayına kadar kullanıcıların bakiye yüklemesini sağlayan onaylı şirket banka hesapları listesi (Ziraat, Garanti, İş Bankası, Enpara, Papara) ve tek tıkla IBAN kopyalama eklendi.
     - FAST / Havale bildirim formu bağlandı; dekont ve tutar doğrulaması sağlandı.
  5. **Header Entegrasyonu (`src/components/itemsepeti/layout/ItemSepetiHeader.tsx`)**:
     - Giriş yapmış kullanıcı adını ve profil bağlantısını dinamik gösteren oturum durumu bağlandı.
  6. **Test ve Doğrulama (`tests/itemsepeti/platformModules.test.ts`)**:
     - Auth rol ayrımı, Steam Trade URL regex doğrulaması, ilan durumu mutasyonu, canlı destek filtreleri ve banka bildirim kurallarını kapsayan 8 test sıfır hata ile geçti.
     - `npx tsc --noEmit` ve 190+ regression testi başarıyla doğrulandı.


### [2026-09-08] Kayıt 3: Satıcı Başvurusu & İlan Admin Onay Bariyeri
- **Güvenlik & Moderasyon Kuralı**:
  1. **Satıcı Başvuru Onayı (`sellerApprovalStatus: "pending"`)**:
     - Satıcı olarak kaydolan kullanıcılar doğrudan aktif satıcı olamaz; statüleri `pending` (onay bekliyor) olarak başlar.
     - Yöneticiler `/admin/itemsepeti` panelinden satıcı başvurusunu inceleyip onaylayabilir (`approved`) veya reddedebilir (`rejected`).
  2. **Zorunlu İlan Moderasyonu (`status: "pending_review"`)**:
     - Satıcıların açtığı her ilan (`/ilan-ver`) varsayılan olarak `status: "pending_review"` statüsünde oluşturulur.
     - Pazaryerinde (anasayfa, arama, kategoriler) yalnızca `status: "active"` olan ilanlar listelenir; böylece admin onayından geçmeyen hiçbir ürün alıcılara görünmez.
     - İlan oluşturma ekranında kullanıcıya bilgilendirici onay mesajı (`"İlanınız oluşturuldu ve Yönetici Onayına gönderildi"`) verilir.
  3. **Admin Onay & Moderasyon Paneli (`/admin/itemsepeti`)**:
     - Bekleyen ilanları ve satıcı başvurularını tek ekranda toplayan, tek tıkla "İlanı Onayla & Yayınla" ve "Reddet" aksiyonları sunan operasyon arayüzü eklendi.
  4. **Doğrulama**:
     - `tests/itemsepeti/platformModules.test.ts` dosyasına 2 yeni test eklenerek 10/10 başarıya ulaşıldı. `tsc` derleme testi sıfır hata verdi.


### [2026-09-08] Kayıt 4: Sipariş & Escrow Teslimat Operasyon Merkezi
- **İnşa Edilen E-Ticaret Arayüzleri & API'lar**:
  1. **Sipariş Takip Paneli (`/siparislerim`)**:
     - Alıcının satın aldığı tüm ürünleri (SIP-2026-XXXXXX) listeler; anlık durum rozetleri (`PENDING_PAYMENT`, `PAID`, `DELIVERED`, `COMPLETED`), satıcı adı, adet ve tutar dökümü sağlar.
  2. **Canlı Sipariş & Teslimat Operasyon Sayfası (`/siparis/[orderId]`)**:
     - **Alıcı Deneyimi**: Cüzdan bakiyesiyle tek tıkla sipariş ödeme (`Pay with Balance`), tutarın Escrow havuzuna kilitlenmesi ve satıcı teslim ettikten sonra *"Ürünü Teslim Aldım & Onayla"* aksiyonu.
     - **Satıcı Deneyimi**: Oyun içi teslimat gerçekleştirildiğinde *"Ürünü Teslim Ettim Olarak İşaretle"* butonu ve SLA süresi yönetimi.
     - **Dispute (Uyuşmazlık) Modülü**: Teslimat gecikirse veya hatalı/eksik ürün gelirse alıcının *"Sorun Bildir (Dispute Aç)"* modalı üzerinden gerekçe bildirerek parayı dondurabilmesi.
  3. **Durum Makinesi & Escrow API (`/api/itemsepeti/orders/[orderId]`)**:
     - `updateOrderStatus()` metoduyla katı durum geçişleri (`PENDING_PAYMENT` -> `PAID` -> `DELIVERED` -> `COMPLETED` / `DISPUTED`) güvence altına alındı.
  4. **Test & Tip Güvenliği**:
     - `tests/itemsepeti/platformModules.test.ts` 12/12 test ile ve `cartAndCheckout.test.ts` 62/62 test ile doğrulandı. `tsc` derleme kontrolü sıfır hata verdi.


### [2026-09-08] Kayıt 5: Çift Girişli Muhasebe (Double-Entry Ledger) & Satıcı Para Çekme (Payout)
- **Finansal Altyapı Güçlendirmesi**:
  1. **Çift Girişli Defter-i Kebir (`src/lib/itemsepeti/walletService.ts`)**:
     - Kullanıcı bakiyeleri doğrudan sayısal artış/azalış yerine `CREDIT`, `DEBIT`, `ESCROW_HOLD`, `ESCROW_RELEASE`, `REFUND`, `PAYOUT` işlem tipleriyle loglanır.
     - Her işlemde `balanceBefore`, `amount` ve `balanceAfter` kaydedilerek bakiye tutarlılığı garanti altına alındı.
  2. **Satıcı Para Çekme / FAST Çıkışı (`/para-cek`)**:
     - Satıcıların kazançlarını banka hesaplarına çekebileceği sayfa kuruldu.
     - Minimum 100 TL çekim alt sınırı, bakiye aşımı kontrolü ve TR IBAN format doğrulayıcısı işletildi.
  3. **Site İçi Bildirim Motoru (`src/lib/itemsepeti/notificationService.ts`)**:
     - Sipariş oluşturma, teslimat bildirimi, itiraz açılması ve ödeme onaylarında kullanıcıya anlık bildirim fırlatan servis yazıldı.
  4. **Test & Tip Güvenliği**:
     - `platformModules.test.ts` test kapsamı 14 teste çıkarıldı ve tüm testler sıfır hata ile geçti. `tsc` derleme kontrolü tam uyumlu sonuç verdi.


### [2026-09-08] Kayıt 6: Güvenli Sipariş İçi Sohbet (Anti-Fraud Chat) & Admin Para Çekme Yönetimi
- **Geliştirilen Altyapı Bileşenleri**:
  1. **Sipariş Kanıt & Canlı Sohbet Odası (`ItemSepetiOrderChat.tsx`)**:
     - Sipariş operasyon detayında (`/siparis/[orderId]`) alıcı ve satıcının oyun içi karakter adı, takas linki veya teslimat koordinatlarını paylaşabileceği anlık sohbet modülü entegre edildi.
     - **Dolandırıcılık ve Platform Dışı İşlem Engeli (Anti-Fraud Sanitization)**:
       - Telefon numaraları (`05XX XXX XX XX`), TR IBAN numaraları ve harici platform bağlantıları (`discord.gg`, `t.me`, `wa.me`) regex katmanıyla otomatik taranır.
       - Tespit edilen hassas veya harici iletişim girişimleri `[Sistem tarafından gizlenen...]` maskesiyle anında sansürlenir ve kullanıcıya uyarı gösterilir.
  2. **Admin Paneli Para Çekme (Payout) Moderasyon Sekmesi (`/admin/itemsepeti`)**:
     - Admin paneline *"Para Çekme Talepleri"* sekmesi eklendi.
     - Satıcıların IBAN, Ad-Soyad ve çekim tutarı onay kuyruğunda görüntülenir.
     - Yönetici tek tıkla *"Transferi Onayla"* veya *"Reddet & İade Et"* aksiyonlarını yürütebilir.
  3. **Test Kapsamı & Otomasyon**:
     - `tests/itemsepeti/platformModules.test.ts` dosyasına Chat Anti-Fraud ve Admin Payout onay geçişlerini doğrulayan 2 yeni test eklendi (Toplam: 16/16 test %100 başarılı).
     - `npx tsc --noEmit` ile sıfır tip hatası doğrulandı.


### [2026-09-08] Kayıt 7: Uyuşmazlık Hakem Heyeti, Satıcı Değerlendirme & Bildirim Merkezi
- **Geliştirilen Altyapı Bileşenleri**:
  1. **Dispute & Hakem Heyeti Servisi (`src/lib/itemsepeti/disputeService.ts`)**:
     - Alıcı tarafından açılan itirazların (`DISPUTED`) veritabanı yönetimi ve admin hakem heyeti operasyonları modellendi.
     - Karar motoru: Hakem Heyeti kararına göre Escrow blokesi alıcıya tam iade (`REFUND`), satıcıya hak ediş aktarımı (`ESCROW_RELEASE`) veya kısmi hakem uzlaşması (`PARTIAL_REFUND`) olarak defter-i kebir işlemlerine işlenir.
  2. **Admin Hakem Paneli (`/admin/itemsepeti` - İtiraz & Hakem Sekmesi)**:
     - Moderasyon paneline 4. sekme olarak *"İtiraz / Hakem Heyeti"* eklendi.
     - Yöneticiler itiraz detayını, blokedeki Escrow tutarını, alıcı-satıcı açıklamalarını inceleyip *"Alıcıyı Haklı Bul (İade Et)"* veya *"Satıcıyı Haklı Bul (Escrow Serbest Bırak)"* kararlarını anında verebilir.
  3. **Satıcı Puan & Değerlendirme Sistemi (`src/lib/itemsepeti/reviewService.ts` & `/siparis/[orderId]`)**:
     - Tamamlanan siparişlerde (`COMPLETED`) alıcıya 1-5 yıldız ve yorum yapma yetkisi tanındı.
     - Satıcıların ortalama puanı (`averageRating`), toplam yorum sayısı ve olumlu değerlendirme yüzdesi (`positivePercentage`) anlık hesaplanır.
  4. **Canlı Bildirim Merkezi (`ItemSepetiNotificationDropdown.tsx`)**:
     - Üst menüye (Header) bildirim zili ve açılır panel entegre edildi.
     - Sipariş oluşturma, ödeme onayı, ilan yayını ve itiraz süreçleri okunmamış bildirim rozetiyle kullanıcıya anında iletilir.
  5. **Test & Tip Bütünlüğü**:
     - `tests/itemsepeti/platformModules.test.ts` test kapsamı **18 teste** çıkarıldı (18/18 test %100 başarılı).
     - `npx tsc --noEmit` ile sıfır derleme hatası sağlandı.


### [2026-09-08] Kayıt 8: Satıcı Vitrin & Mağaza Sayfası (Public Storefront)
- **Geliştirilen Altyapı Bileşenleri**:
  1. **Dinamik Satıcı Mağazası Sayfası (`/magaza/[storeSlug]`)**:
     - Satıcıların profiline, puanına, tamamlanan işlem hacmine ve vitrindeki tüm aktif ilanlarına özel dinamik pazaryeri vitrini kuruldu.
     - **Mağaza Metrikleri**: Doğrulanmış satıcı rozeti (`isVerifiedSeller`), platform kıdemi (`memberSinceYears`), ortalama teslimat hızı (dakika cinsinden), alıcı memnuniyet yüzdesi ve toplam satış rakamı.
     - **Çift Sekmeli Mimari**:
       - *Satıştaki İlanlar*: Satıcıya ait stoktaki ürünler, oyun filtreleri, teslimat SLA'sı ve tek tıkla sepete ekleme aksiyonu.
       - *Alıcı Değerlendirmeleri*: Satıcıya yapılan 1-5 yıldızlı doğrulanmış alıcı yorumları ve puan dağılımı.
  2. **Profil Entegrasyonu (`/profilim`)**:
     - Satıcıların kendi vitrinlerini tek tıkla inceleyebilmeleri ve alıcıların mağazaya ulaşabilmesi için 5. hızlı erişim kartı olarak *"Mağazam (Vitrini Görüntüle)"* eklendi.
  3. **Katalog & İzolasyon Sorguları (`getSellerBySlug` & `getSellerListings`)**:
     - `src/lib/itemsepeti/catalogService.ts` servisinde mağaza slug ve ID çözümlemesi güçlendirildi; satıcı bazlı aktif ilan filtrelemesi sağlandı.
  4. **Test & Tip Güvenliği**:
     - `tests/itemsepeti/platformModules.test.ts` dosyasına Satıcı Mağaza slug eşleşmesi ve ilan izolasyonu testi eklenerek toplam test sayısı **19/19**'a çıkarıldı (%100 başarı).
     - `npx tsc --noEmit` ile sıfır derleme hatası sağlandı.


### [2026-09-08] Kayıt 9: Değiştirilemez Güvenlik Denetim İzi (Immutable Audit Logs & Security Telemetry)
- **Geliştirilen Altyapı Bileşenleri**:
  1. **Denetim İzi & Güvenlik Servisi (`src/lib/itemsepeti/auditService.ts`)**:
     - Platform genelindeki tüm kritik finansal, operasyonel ve hakem eylemlerini (`ORDER_STATUS_CHANGED`, `DISPUTE_ARBITRATED`, `PAYOUT_APPROVED`, `LISTING_APPROVED`) değişmez (immutable) şekilde kaydeden servis kuruldu.
     - Her log kaydı; eylemi yapan aktörün UID'sini, rolünü (`buyer`, `seller`, `admin`, `system`), etkilenen kaynağı, işlem öncesi/sonrası anlık durumunu (`beforeSnapshot`, `afterSnapshot`) ve zaman damgasını barındırır.
  2. **Operasyonel Entegrasyonlar (`orderService.ts` & `disputeService.ts`)**:
     - Sipariş durumu her değiştiğinde (`updateOrderStatus`) ve uyuşmazlık sonuçlandırıldığında (`arbitrateDispute`) otomatik denetim kaydı tetiklenir.
  3. **Admin Denetim Masası (`/admin/itemsepeti` - Denetim İzi Sekmesi)**:
     - Moderasyon paneline 5. sekme olarak *"Denetim İzi (Audit Logs)"* eklendi.
     - Yöneticiler hangi kullanıcının veya adminin hangi sipariş veya itiraz üzerinde ne zaman işlem yaptığını tablo dökümüyle geriye dönük izleyebilir.
  4. **Test Kapsamı & Bütünlük**:
     - `tests/itemsepeti/platformModules.test.ts` dosyasına Audit log değişmezlik ve indeksleme testi eklenerek toplam test sayısı **20/20**'ye çıkarıldı (%100 başarı).
     - `npx tsc --noEmit` ile sıfır tip hatası doğrulandı.

## 4. ChatGPT / Claude İçin Hızlı Mimari Referansı (LLM Context Prompt)

`yaml
project: İtemSepeti
stack: Next.js 15 (App Router), TypeScript, Tailwind, Firestore
architecture: Domain-Driven Design, Server-Authoritative Marketplace
security_rules:
  - Client never decides prices, discounts, stock, fees, or permissions
  - Orders must be escrow-locked before seller is instructed to deliver
  - Multi-seller cart creates split orders linked by a CheckoutSession
  - Inventory is reserved via atomic 15-minute lease locks
  - Sensitive seller data (IBAN, tax numbers) must never appear in public queries
`
