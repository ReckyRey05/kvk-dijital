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
