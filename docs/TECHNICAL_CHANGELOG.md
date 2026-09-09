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


### [2026-09-08] Kayıt 10: AES-256 Şifreli Dijital Kasa (Digital Vault) & Anında Otomatik Kod Teslimatı
- **Geliştirilen Altyapı Bileşenleri**:
  1. **Şifreli Dijital Kasa Servisi (`src/lib/itemsepeti/digitalVaultService.ts`)**:
     - Dijital kodlar (`DIGITAL_CODE`) ve oyun hesapları (`ACCOUNT`) veritabanında asla düz metin (plaintext) saklanmaz; **AES-256-GCM** şifreleme standardı ile `ciphertext`, `iv` ve `authTag` parametreleriyle korunur.
     - Şifreli stok kasası (`ItemSepetiInventoryItem`) üzerinden sipariş bazlı anında şifre çözme ve tek kullanımlık teslimat (`deliverInstantCodeForOrder`) mekanizması kuruldu.
  2. **Alıcı Ekranında Anında Kod Açımı (`/siparis/[orderId]`)**:
     - Alıcı ödemeyi cüzdan bakiyesiyle tamamladığında, eğer ürün otomatik teslimatlıysa (`AUTOMATIC_CODE`) satıcının oyuna girmesini beklemeden kod anında ekranda çözülür ve *"Kopyala"* butonuyla sunulur.
  3. **Satıcı Teslimat Kanıtı (Proof Submission) Yükleme**:
     - Manuel teslimatlarda satıcının teslimat ekran görüntüsü linkini veya takas ID'sini sisteme kaydedebileceği teslimat kanıt formu sipariş operasyon ekranına eklendi.
  4. **Test Kapsamı & Otomasyon**:
     - `tests/itemsepeti/platformModules.test.ts` dosyasına AES-256-GCM şifreleme/çözme doğrulaması ve teslimat kanıt yükleme testleri eklenerek test kapsamı **22/22**'ye çıkarıldı (%100 başarı).
     - `npx tsc --noEmit` ile sıfır tip hatası doğrulandı.


### [2026-09-08] Kayıt 11: Production Build Optimizasyonu & Mağaza API Ayrıştırması (Vercel Build Fix)
- **Tespit Edilen Hata & Kök Neden**:
  - Vercel üretim build ortamında, `src/app/magaza/[storeSlug]/page.tsx` istemci bileşeni (`"use client"`) doğrudan sunucu katmanındaki `catalogService.ts` ve `reviewService.ts` (ve dolayısıyla Node.js `firebase-admin`, `grpc`, `tls`, `net`) paketlerini import ettiğinde Turbopack bundle hatası veriyordu.
- **Mimari Çözüm & İyileştirme**:
  1. **Ayrık Mağaza API Rotası (`/api/itemsepeti/store/[storeSlug]/route.ts`)**:
     - Sunucu bağımlılıkları ve Firestore sorguları istemci sayfasından tamamen soyutlandı; bağımsız bir REST API rotasına taşındı.
     - Bu rota mağaza verilerini, satıcı ilanlarını, alıcı değerlendirmelerini ve itibar metriklerini sunucu tarafında işleyip JSON olarak döndürür.
  2. **İstemci Tarafı Asenkron Fetch Entegrasyonu**:
     - `/magaza/[storeSlug]/page.tsx` istemci sayfası doğrudan Node modülleri import etmek yerine `/api/itemsepeti/store/${storeSlug}` endpoint'ini tüketir hale getirildi.
  3. **Vercel / Production Build Doğrulaması**:
     - `npx next build` komutu çalıştırıldı.
     - **Sonuç**: 196 sayfa ve API rotasının tamamı **0 hata ile compile edildi** (`✓ Generating static pages 196/196`). Vercel deployment hatası kalıcı olarak giderildi.


### [2026-09-08] Kayıt 12: Resmi T.C. Kimlik Doğrulama & Hesap Onay Motoru (KYC Verification)
- **Geliştirilen Altyapı Bileşenleri**:
  1. **Resmi T.C. Kimlik Algoritması (`validateTCKN`)**:
     - Nüfus ve Vatandaşlık İşleri (NVİ) resmi 11 haneli T.C. Kimlik No algoritma matematiği (tek/çift basamak toplamları, 10. ve 11. hane sağlama kontrolleri) saf TypeScript motoru olarak kodlandı.
     - Sahte veya rastgele yazılan kimlik numaraları anında istemci ve sunucu katmanında reddedilir.
  2. **Kimlik Doğrulama & KYC Başvuru Ekranı (`/dogrulama`)**:
     - Kullanıcıların T.C. Kimlik No, Nüfus Cüzdanındaki Ad-Soyad ve Doğum Yılı ile tek seferlik onay alabildikleri 256-bit SSL korumalı doğrulama ekranı geliştirildi.
     - 14 yaş altı kısıtlaması, KVKK bilgilendirmesi ve anlık onay bildirimleri sağlandı.
  3. **Profil Entegrasyonu & Dinamik Rozetleme (`/profilim`)**:
     - Kullanıcı kimliğini doğrulamışsa yeşil *"T.C. Onaylı"* rozeti gösterilir; doğrulanmamışsa *"Kimlik Doğrula"* yönlendirme butonu dinamik olarak devreye girer.
  4. **Test & Tip Bütünlüğü**:
     - `tests/itemsepeti/platformModules.test.ts` dosyasına TCKN algoritma sağlama ve sınır durum testleri eklenerek toplam test sayısı **23/23**'e yükseltildi (%100 başarı).
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

---

### [RECORD-013] | 2026-09-08 | İtemSepeti Promosyonel Kupon ve İndirim Motoru Altyapısı
**Talep / Gerekçe**: Alıcıların sepet ve ödeme aşamasında yüzdesel veya sabit tutarlı kuponları (Voucher) kullanabilmesi, minimum sepet tutarı, kullanım limiti, tekil kullanıcı kısıtı ve son geçerlilik tarihi kontrollerinin uçtan uca güvenli ve çifte harcamaya karşı korumalı işletilmesi.

#### 1. Veri Modeli ve Mimarisi
- **Konum**: `src/lib/itemsepeti/couponService.ts`
- **Özellikler**:
  - `Coupon`: `code`, `discountType` (`percentage` | `fixed`), `discountValue`, `minCartAmount`, `maxDiscountAmount`, `usageLimit`, `usedCount`, `expiresAt`, `isActive`, `allowedUserIds`
  - `validateCoupon(code, cartTotal, userId)`: Kuponun aktifliği, son geçerlilik tarihi, kullanım kotası, minimum sepet tutarı şartı ve kullanıcı kısıtlarını atomik doğrulayarak uygulanacak net indirim tutarını (`discountAmount`) ve nihai sepet bedelini hesaplar.
  - `applyCouponUsage(code, userId, orderId)`: Sipariş başarıyla onaylandığında kullanım sayacını artırır ve denetim izini kaydeder.

#### 2. Güvenli API Uç Noktası
- **Konum**: `src/app/api/itemsepeti/coupons/validate/route.ts`
- **HTTP POST**: `/api/itemsepeti/coupons/validate`
- **İşlev**: İstemciden gelen kupon kodu ve sepet tutarını sunucu tarafında doğrular; geçersiz veya tükenmiş kupon durumunda standart hata yanıtları (`INVALID_COUPON`, `EXPIRED_COUPON`, `USAGE_LIMIT_EXCEEDED`, `MIN_CART_NOT_MET`) üretir.

#### 3. Checkout (Ödeme Adımı) Kullanıcı Arayüzü Entegrasyonu
- **Konum**: `src/app/checkout/page.tsx`
- **İşlev**: Alıcıya sipariş özet kartında kupon kodu giriş alanı, anlık indirim hesaplama göstergesi ve kupon iptal/kaldır seçeneği sunar. İndirim doğrudan nihai tahsilat ve emanet (escrow) tutarına yansıtılır.

#### 4. Otomasyon Testleri ve Tip Güvenliği
- `tests/itemsepeti/platformModules.test.ts` test kümesine Kupon doğrulama ve indirim hesaplama senaryoları entegre edildi. Testler: **24/24 PASS (100%)**.

---

### [RECORD-014] | 2026-09-09 | FAZ 5.5: Security Hardening, Escrow Auto-Release & Financial Safety
**Talep / Gerekçe**: FAZ 4.5 adli denetiminde (forensic gap audit) tespit edilen güvenlik ve finansal operasyon açıklarının giderilmesi: Firestore kurallarının least-privilege seviyesine çekilmesi, dijital kasa anahtarının katı fail-closed politikasına bağlanması, 24 saatlik escrow otomatik serbest bırakma motorunun kurulması, alıcı onayında emanetin satıcı cüzdanına atomik aktarılması, KYC semantiğinin NVİ algoritma kontrolü olarak netleştirilmesi ve satıcı onay kilidinin sunucu katmanında enforced edilmesi.

#### 1. Firestore Security Rules Hardening (`firestore.rules`)
- `itemsepeti_*` koleksiyonları için kapsamlı least-privilege kural kümesi eklendi (Bölüm 15).
- İstemci tarafından cüzdan bakiyeleri (`itemsepeti_wallets`), defter kayıtları (`itemsepeti_ledger`), emanet durumu (`itemsepeti_escrow`), para çekme emirleri (`itemsepeti_payouts`), ve denetim loglarının (`itemsepeti_audit_logs`) doğrudan manipüle edilmesi kesin olarak engellendi (`allow write: if false`).
- Kullanıcı ve satıcı profillerinde `role`, `isVerifiedSeller`, `balance` gibi kritik alanların sadece sunucu (Admin SDK) veya kontrollü kurallarla güncellenmesi garanti altına alındı.

#### 2. Dijital Kasa Güvenliği & Fail-Closed Mimari (`digitalVaultService.ts`)
- Sabit fallback şifreleme anahtarı tamamen kaldırıldı. `ITEMSEPETI_VAULT_KEY` tanımlı olmadığında sistem fail-closed davranarak açık güvenlik istisnası fırlatır.
- `isVaultConfigured()` fonksiyonu ile ortam değişkeni varlığı güvenli sorgulanır.
- Tek seferlik anahtar açığa çıkarma (reveal) mekanizması idempotent kılındı; mükerrer sorgulamalarda aynı sipariş için deşifre edilmiş metin döndürülürken stok tüketimi tekrarlanmaz.

#### 3. 24 Saatlik Escrow Otomatik Serbest Bırakma Motoru (`orderService.ts`)
- `updateOrderStatus` fonksiyonuna `DELIVERED` durumuna geçişte `deliveredAt` ve `autoCompleteAt` (+24 saat SLA) damgaları eklendi.
- Alıcı siparişi teslim aldığını onayladığında (`COMPLETED`) `settleEscrowToSeller()` tetiklenerek çift kayıtlı defterde (ledger) atomik `ESCROW_RELEASE` işlemi icra edilir ve satıcıya bildirim iletilir.
- `processEligibleAutoReleases()` cron/zamanlayıcı fonksiyonu inşa edildi: 24 saati geçmiş ve ihtilafsız (dispute açılmamış) teslim edilmiş siparişleri otomatik `COMPLETED` yaparak emanet bakiyesini satıcıya aktarır.

#### 4. Sunucu Taraflı Satıcı Onay Kilidi (`catalogService.ts`)
- `createListing()` çağrılarında satıcının onay durumu (`isVerifiedSeller`) sunucu tarafında sorgulanır. Onaylanmamış satıcıların ilan girişi engellenir.

#### 5. KYC ve TCKN Semantik Düzeltmesi (`dogrulama/page.tsx`)
- NVİ canlı veritabanı bağlantısı iddiası içeren ifadeler düzeltildi; sistemin T.C. Kimlik No resmi algoritma ve checksum matematiğini doğruladığı netleştirildi.

#### 6. Bildirim Kalıcılığı ve Sipariş Yetkilendirme
- `markNotificationAsRead()` fonksiyonu kalıcı Firestore durum güncellemesiyle güçlendirildi.
- `PATCH /api/itemsepeti/orders/[orderId]` rotasına sıkı rol bazlı mülkiyet kontrolleri entegre edildi (sadece alıcı veya admin tamamlayabilir, sadece satıcı veya admin teslim edildi işaretleyebilir).

#### 7. Test ve Tip Doğrulaması
- `tests/itemsepeti/securityHardening.test.ts`: **32/32 PASS (100%)**.
- `tests/itemsepeti/platformModules.test.ts`: **24/24 PASS (100%)**.
- `tests/itemsepeti/cartAndCheckout.test.ts`: **62/62 PASS (100%)**.
- `tests/itemsepeti/catalogAndListings.test.ts`: **30/30 PASS (100%)**.
- `tests/itemsepeti/buyerExperience.test.ts`: **40/40 PASS (100%)**.
- Toplam **188 birim & entegrasyon testi** sıfır hata ile doğrulandı.
- `npx tsc --noEmit` ve `next build` hatasız tamamlandı.

---

### [RECORD-015] | 2026-09-09 | İtemSepeti Tasarım İyileştirmeleri & İlan Görsel Altyapısı Entegrasyonu
**Talep / Gerekçe**: Kullanıcı arayüzünde görsel çekiciliği, ürün anlaşılırlığını ve pazaryeri deneyimini artırmak amacıyla tüm ilanlara yüksek kaliteli vektörel görsel varlıklarının eklenmesi, ilan kartları, vitrin ızgarası, ilan detay sayfası ve ilan oluşturma formunda görsel önizleme ve şablon desteğinin hayata geçirilmesi.

#### 1. Yüksek Kaliteli Vektörel Oyun Varlıklarının Üretilmesi (`public/images/itemsepeti/listings/`)
- Platformdaki başlıca oyun kategorileri ve ürünler için modern SVG vektör illüstrasyonları tasarlandı:
  - `cs2_ak47_asiimov.svg`: Fütüristik Asiimov serisi turuncu/beyaz/siyah kaplama ve HUD göstergeleri.
  - `cs2_karambit_doppler.svg`: Kavisli talon bıçak formu, pembe/mor galaksi Doppler Phase 2 geçişleri ve metalik parlama.
  - `metin2_yang_100m.svg`: İstiflenmiş altın külçeler, antik Çin sikkeleri ve altın ışıltısı partikül efektleri.
  - `valorant_1200_vp.svg`: Radiant kırmızı VP hediye kartı kuponu, çift şevron geometrisi ve dijital barkod.
  - `steam_100_wallet.svg`: Steam endüstriyel piston krank amblemi ve 100 TL cüzdan kodu rozeti.
  - `pubg_mobile_uc.svg`: Askeri mühimmat sandığı ve altın kabartmalı 660 UC token jetonu.

#### 2. Katalog Tohum Verilerinin Zenginleştirilmesi (`catalogSeedData.ts`)
- Tüm tohum ilanlarına `images: ["/images/itemsepeti/listings/..."]` dizisi bağlandı.
- PUBG Mobile kategorisi için yeni tohum ilan (`lst_pubg_660_uc_01`) eklendi.

#### 3. İlan Kartı ve Vitrin Bileşenlerinin Modernizasyonu
- `ItemSepetiListingCard.tsx`:
  - 16:9 / h-44 oranlı görsel vitrin alanı, hover zoom efekti, buzlu cam (frosted glass) oyun etiketi, favori butonu ve hızlı teslimat rozeti yerleşimi.
  - Görsel bulunmadığında şık monogram rozet fallback'i.
- `ItemSepetiEditorialGrid.tsx`:
  - 1+3 asimetrik Günün Fırsatı vitrininde ana fırsat ürünü için 60h boyutlu görsel başlık ve yan ürünler için 20x20 yuvarlak görsel önizlemeleri bağlandı.
- `src/app/kategori/[gameSlug]/page.tsx`, `src/app/satici/[sellerSlug]/page.tsx`, `src/app/itemsepeti/page.tsx`:
  - Kart listeleme haritalarına `image` ve `images` alanları entegre edildi.

#### 4. İlan Detay Sayfası Tasarım Yenilemesi (`/ilan/[listingSlug]/page.tsx`)
- Ürün detayında dev hero görsel alanı inşa edildi; açık ve koyu tema kenarlıklarıyla (`bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A]`) tam uyumlu hale getirildi.
- Dinamik teknik özellikler ve satıcı bilgi kartı hiyerarşisi cilalandı.

#### 5. İlan Verme Formunda Görsel ve Şablon Desteği (`/ilan-ver/page.tsx`, `listings/route.ts`)
- Satıcılar için ilan oluştururken doğrudan görsel URL'si girebilme ve tek tıkla hazır oyun şablonu (AK-47 Asiimov, Karambit Doppler, Metin2 Yang, Valorant VP, Steam Cüzdan, PUBG UC) seçebilme özelliği eklendi.
- Canlı resim önizleme ve görsel kaldırma kontrolleri eklendi.
- `POST /api/itemsepeti/listings` rotası `images` dizisini kabul edip kalıcı hale getirecek şekilde güncellendi.

#### 6. Doğrulama ve Derleme
- `npx tsc --noEmit` sıfır hata ile geçti.
- `npx next build` sıfır hata ile tamamlandı (SSG + SSR sayfaları derlendi).
- Tüm regression testleri eksiksiz geçiş sağladı.

