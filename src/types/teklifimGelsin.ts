export type TeklifimUserRole = "business" | "supplier" | "admin" | "user";

export type TeklifimVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type TeklifimRequestStatus =
  | "published"
  | "bidding"
  | "offers_received"
  | "supplier_selected"
  | "completed"
  | "cancelled"
  | "expired"
  | "open";

export type TeklifimOfferStatus =
  | "submitted"
  | "viewed"
  | "negotiating"
  | "countered"
  | "accepted"
  | "selected"
  | "rejected"
  | "expired"
  | "pending";

export interface TeklifimProfile {
  uid: string;
  role: TeklifimUserRole;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  city: string;
  district?: string;
  categories: string[];
  description?: string;
  deliveryRegions?: string[];
  minOrder?: string;
  isVerified: boolean;
  verificationStatus?: TeklifimVerificationStatus;
  logoUrl?: string;
  website?: string;
  taxNumber?: string;
  taxOffice?: string;
  tradeRegistryNumber?: string;
  yearFounded?: number;
  completedDeals?: number;
  responseRate?: string;
  responseMinutes?: number;
  rating?: number;
  reviewCount?: number;
  taxVerified?: boolean;
  verifiedAt?: number;
  createdAt: number;
  updatedAt?: number;
}

export type TeklifimStockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "made_to_order"
  | "unspecified";

export type TeklifimProductStatus =
  | "draft"
  | "published"
  | "passive"
  | "archived"
  | "suspended";

export type TeklifimPriceVisibility =
  | "public"
  | "hidden"
  | "request_quote";

export interface TeklifimProduct {
  id: string;
  supplierId: string;
  supplierName?: string;
  supplierCity?: string;
  supplierLogoUrl?: string;
  supplierVerified?: boolean;
  name: string;
  title?: string;
  category: string;
  subCategory?: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  minOrder?: string;
  minimumOrder?: number;
  unit?: string;
  estimatedPrice?: number;
  price?: number;
  currency?: string;
  priceVisibility?: TeklifimPriceVisibility;
  stockStatus?: TeklifimStockStatus;
  stockQuantity?: number;
  trackStock?: boolean;
  leadTimeDays?: number;
  deliveryRegions?: string[];
  status?: TeklifimProductStatus;
  isActive?: boolean;
  viewsCount?: number;
  requestsCount?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface TeklifimProductFavorite {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productCategory: string;
  productImageUrl?: string;
  productPrice?: number;
  productCurrency?: string;
  supplierId: string;
  supplierName: string;
  createdAt: number;
}

export interface TeklifimProductImportReport {
  totalRows: number;
  successfulCount: number;
  failedCount: number;
  errors: { row: number; field: string; message: string }[];
  importedProductIds: string[];
}

export interface TeklifimFavorite {
  id: string;
  userId: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  supplierCategories: string[];
  supplierMinOrder?: string;
  supplierResponseRate?: string;
  createdAt: number;
}

export interface TeklifimSupplierMatch {
  supplier: TeklifimProfile;
  matchScore: number; // 0 - 100
  matchReasons: string[];
}

export interface TeklifimReview {
  id: string;
  requestId: string;
  requestTitle: string;
  businessId: string;
  businessName: string;
  supplierId: string;
  supplierName?: string;
  rating: number; // 1 - 5
  comment: string;
  isAnonymous?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export type VerificationRequestStatus = "pending" | "approved" | "rejected";

export interface TeklifimVerificationRequest {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  supplierCategory: string;
  legalTitle: string;
  taxNumber: string;
  taxOffice: string;
  tradeRegistryNumber?: string;
  documentUrl?: string;
  notes?: string;
  status: VerificationRequestStatus;
  rejectionReason?: string;
  createdAt: number;
  processedAt?: number;
  processedBy?: string;
}

export type TeklifimReportReason =
  | "fake_company"
  | "misleading_info"
  | "spam"
  | "inappropriate"
  | "other";

export type TeklifimReportStatus = "pending" | "reviewed" | "dismissed" | "action_taken";

export interface TeklifimReport {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  reporterRole?: string;
  targetId: string;
  targetName?: string;
  targetType: "supplier" | "business" | "request";
  reason: TeklifimReportReason;
  description: string;
  status: TeklifimReportStatus;
  createdAt: number;
  resolvedAt?: number;
  adminNotes?: string;
}

export interface TeklifimBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  blockedName?: string;
  reason?: string;
  createdAt: number;
}

export interface TeklifimRequest {
  id: string;
  businessId: string;
  businessName: string;
  businessCity: string;
  businessPhone?: string;
  businessEmail?: string;
  title: string;
  category: string;
  subCategory?: string;
  productName?: string;
  quantity: number;
  unit: string; // Adet, Koli, Kg, Ton, Metre, Litre, Paket, Palet
  deliveryDays: number;
  city: string;
  district?: string;
  description: string;
  deadline?: string;
  deadlineTimestamp?: number;
  imageUrl?: string;
  sampleRequired?: boolean;
  status: TeklifimRequestStatus;
  offerCount: number;
  selectedOfferId?: string;
  selectedSupplierId?: string;
  invitedSupplierIds?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface TeklifimOffer {
  id: string;
  requestId: string;
  requestTitle: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  supplierPhone: string;
  supplierEmail: string;
  supplierIsVerified?: boolean;
  supplierDeals?: number;
  unitPrice: number;
  totalPrice: number;
  price?: number;
  currency?: string; // TL, USD, EUR
  deliveryDays: number;
  minOrderQuantity?: string;
  description: string;
  fileUrl?: string;
  status: TeklifimOfferStatus;
  createdAt: number;
  updatedAt: number;

  // Negotiation & Versioning
  version?: number;
  negotiationCount?: number;
  lastCounterBy?: "business" | "supplier";
  businessId?: string;

  // Computed badge markers for comparison
  isCheapest?: boolean;
  isFastest?: boolean;
  isBestValue?: boolean;
}

export interface TeklifimConversation {
  id: string; // conv_{offerId}
  requestId: string;
  requestTitle: string;
  offerId: string;
  businessId: string;
  businessName: string;
  supplierId: string;
  supplierName: string;
  lastMessageText?: string;
  lastMessageAt: number;
  lastMessageSenderId?: string;
  unreadCountBusiness: number;
  unreadCountSupplier: number;
  status: "active" | "archived";
  createdAt: number;
  updatedAt: number;
}

export type TeklifimMessageType = "text" | "counter_offer" | "system" | "agreement";

export interface TeklifimMessageAttachment {
  url: string;
  name: string;
  size: number;
  type: string; // image/png, application/pdf, etc.
}

export interface TeklifimMessage {
  id: string;
  conversationId: string;
  requestId: string;
  offerId: string;
  senderId: string;
  senderName: string;
  senderRole: "business" | "supplier";
  content: string;
  type: TeklifimMessageType;
  attachment?: TeklifimMessageAttachment;
  counterOfferData?: {
    version: number;
    price: number;
    unitPrice?: number;
    deliveryDays: number;
    quantity?: number;
    note?: string;
    proposedBy: "business" | "supplier";
  };
  isRead: boolean;
  readAt?: number;
  status: "sent" | "delivered" | "read";
  createdAt: number;
}

export interface TeklifimOfferVersion {
  id: string;
  offerId: string;
  requestId: string;
  version: number; // 1, 2, 3 ... (Max 10)
  proposedBy: "supplier" | "business";
  proposerId: string;
  proposerName: string;
  totalPrice: number;
  unitPrice: number;
  deliveryDays: number;
  quantity: number;
  description: string;
  status: "submitted" | "countered" | "accepted" | "rejected" | "superseded";
  createdAt: number;
}

export type TeklifimAgreementStatus =
  | "agreement_reached"
  | "preparing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";

export interface TeklifimAgreement {
  id: string;
  agreementNumber: string; // Örn: ANL-2026-0142
  requestId: string;
  requestTitle: string;
  offerId: string;
  businessId: string;
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  acceptedPrice: number;
  totalPrice?: number;
  unitPrice: number;
  currency: string;
  deliveryDays: number;
  city?: string;
  district?: string;
  termsNotes?: string;
  finalVersion?: number;
  orderId?: string;
  orderNumber?: string;
  status: TeklifimAgreementStatus;
  statusHistory: {
    status: TeklifimAgreementStatus;
    changedBy: string;
    timestamp: number;
    note?: string;
  }[];
  createdAt: number;
  updatedAt: number;
}

// ==========================================
// FAZ 5: SİPARİŞ & TESLİMAT VERİ MODELLERİ
// ==========================================

export type TeklifimOrderStatus =
  | "preparing"
  | "ready_for_dispatch"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";

export type TeklifimDeliveryMethod =
  | "cargo"
  | "supplier_delivery"
  | "hand_delivery"
  | "other";

export interface TeklifimDeliveryAddress {
  contactName: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
}

export interface TeklifimOrderItem {
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface TeklifimOrderTracking {
  carrier: string; // Yurtiçi Kargo, Aras Kargo, MNG, Tedarikçi Aracı vb.
  trackingNumber: string;
  trackingUrl?: string;
  shippedAt: number;
}

export interface TeklifimDeliveryProof {
  deliveredAt: number;
  receivedBy: string;
  proofNote?: string;
  proofPhotoUrl?: string;
}

export interface TeklifimOrderDispute {
  disputedAt: number;
  disputedBy: string;
  reason:
    | "missing_items"
    | "damaged_items"
    | "wrong_items"
    | "delivery_delay"
    | "not_delivered"
    | "price_discrepancy"
    | "other";
  description: string;
  resolvedAt?: number;
  resolutionNotes?: string;
  resolvedBy?: string;
}

export interface TeklifimOrderCancellation {
  cancelledAt: number;
  cancelledBy: string;
  reason:
    | "customer_request"
    | "out_of_stock"
    | "delivery_problem"
    | "mutual_agreement"
    | "other";
  note?: string;
}

export interface TeklifimOrder {
  id: string; // ord_{agreementId}
  orderNumber: string; // SIP-2026-XXXXXX
  agreementId: string;
  agreementNumber: string;
  requestId: string;
  requestTitle: string;
  offerId: string;
  businessId: string;
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;

  // Snapshot Specifications (Never changes after order creation)
  items: TeklifimOrderItem[];
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryDays: number;
  expectedDeliveryDate: number;

  // Delivery configuration
  deliveryMethod: TeklifimDeliveryMethod;
  deliveryAddress: TeklifimDeliveryAddress;
  notes?: string;

  // Tracking & Execution
  trackingInfo?: TeklifimOrderTracking;
  deliveryProof?: TeklifimDeliveryProof;
  dispute?: TeklifimOrderDispute;
  cancellation?: TeklifimOrderCancellation;

  // FAZ 6: Payment, Finance & Invoice Fields
  paymentId?: string;
  paymentNumber?: string;
  paymentStatus?: TeklifimPaymentStatus;
  paymentMethod?: string;
  paidAt?: number;
  paymentExpiresAt?: number;
  platformFeeRate?: number;
  platformFee?: number;
  supplierAmount?: number;
  invoiceStatus?: TeklifimInvoiceStatus;
  invoiceUrl?: string;
  invoiceNumber?: string;
  invoiceUploadedAt?: number;

  // Status & History
  status: TeklifimOrderStatus;
  statusHistory: {
    status: TeklifimOrderStatus;
    changedBy: string;
    timestamp: number;
    note?: string;
  }[];

  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface TeklifimNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: number;
}

export interface CategoryMeta {
  name: string;
  description: string;
  popularItems: string[];
}

export const TEKLIFIM_CATEGORIES = [
  "Ambalaj & Paketleme",
  "Gıda & İçecek",
  "Temizlik & Hijyen",
  "Tekstil & İş Kıyafeti",
  "Matbaa & Baskı",
  "İnşaat & Hırdavat",
  "Ofis & Kırtasiye",
  "Elektronik & Donanım",
  "Endüstriyel Mutfak",
  "Diğer",
] as const;

export const SUBCATEGORY_MAPPING: Record<string, string[]> = {
  "Ambalaj & Paketleme": ["Karton Bardak", "Koli & Kutu", "Kraft Poşet", "Streç & Bant", "Köpük & Koruma", "Diğer"],
  "Gıda & İçecek": ["Kahve & Çay", "Kuru Gıda & Bakliyat", "Sıvı Yağ & Soslar", "Konserve & Salça", "Atıştırmalık & Şekerleme", "Diğer"],
  "Temizlik & Hijyen": ["Havlu & Tuvalet Kağıdı", "Endüstriyel Deterjan", "Çöp Torbası & Eldiven", "Dezenfektan & Sabun", "Sarf & Aparatlar", "Diğer"],
  "Tekstil & İş Kıyafeti": ["Önlük & Üniforma", "Tişört & Polar", "İş Pantolonu & Tulum", "İş Ayakkabısı", "Promosyon Tekstil", "Diğer"],
  "Matbaa & Baskı": ["Amerikan Servis", "Kasa & POS Rulosu", "Katalog & Broşür", "Etiket & Çıkartma", "Kutu Baskı", "Diğer"],
  "İnşaat & Hırdavat": ["El Aletleri", "Vida & Bağlantı", "Silikon & Yapıştırıcı", "Boya & Kimyasallar", "İş Güvenliği", "Diğer"],
  "Ofis & Kırtasiye": ["Fotokopi Kağıdı", "Dosyalama & Klasör", "Masaüstü Gereçler", "Yazı & Çizim", "Arşiv & Saklama", "Diğer"],
  "Elektronik & Donanım": ["Barkod & POS Cihazları", "Adisyon Yazıcıları", "Kablolama & Network", "Güvenlik & Kamera", "Sarf Donanım", "Diğer"],
  "Endüstriyel Mutfak": ["GN Küvet & Tepsi", "Pişirme & Tencereler", "Bıçak & Kesim", "Porselen & Züccaciye", "Hazırlık Ekipmanları", "Diğer"],
  "Diğer": ["Özel Üretim", "Genel Tedarik", "Proje Bazlı", "Diğer"],
};

export const CATEGORY_DETAILS: Record<string, CategoryMeta> = {
  "Ambalaj & Paketleme": {
    name: "Ambalaj & Paketleme",
    description: "Karton bardak, koli, kraft poşet, streç film ve ambalaj malzemeleri.",
    popularItems: ["Karton Bardak", "Oluklu Koli", "Kraft Çanta", "Koli Bandı"],
  },
  "Gıda & İçecek": {
    name: "Gıda & İçecek",
    description: "Kafe ve restoranlar için toptan kahve, bakliyat, yağ ve temel gıdalar.",
    popularItems: ["Toptan Çekirdek Kahve", "Sıvı Yağ", "Un & Şeker", "Sos Grubu"],
  },
  "Temizlik & Hijyen": {
    name: "Temizlik & Hijyen",
    description: "Endüstriyel deterjan, havlu kağıt, dezenfektan ve sarf malzemeleri.",
    popularItems: ["Z Katlama Havlu", "Endüstriyel Deterjan", "Çöp Torbası", "El Sabunu"],
  },
  "Tekstil & İş Kıyafeti": {
    name: "Tekstil & İş Kıyafeti",
    description: "Önlük, iş tişörtü, personel üniformaları ve promosyon tekstil.",
    popularItems: ["Garson Önlüğü", "Polo Tişört", "İş Yeleği", "Baskılı Polar"],
  },
  "Matbaa & Baskı": {
    name: "Matbaa & Baskı",
    description: "Amerikan servis, menü, fatura, etiket, broşür ve kurumsal matbaa.",
    popularItems: ["Amerikan Servis", "Rulo Termal Kasa Fişi", "Katalog", "Kuşe Etiket"],
  },
  "İnşaat & Hırdavat": {
    name: "İnşaat & Hırdavat",
    description: "El aletleri, sabitleme elemanları, izolasyon ve yapı market ürünleri.",
    popularItems: ["Cıvata & Vida", "Silikon & Mastik", "Boya Malzemeleri", "İş Eldiveni"],
  },
  "Ofis & Kırtasiye": {
    name: "Ofis & Kırtasiye",
    description: "Fotokopi kağıdı, dosyalama, arşiv kutuları ve ofis sarfları.",
    popularItems: ["A4 Fotokopi Kağıdı", "Klasör", "Tükenmez Kalem", "Zımba Teli"],
  },
  "Elektronik & Donanım": {
    name: "Elektronik & Donanım",
    description: "Barkod okuyucu, termal yazıcı, kablolama ve ağ ekipmanları.",
    popularItems: ["Termal Adisyon Yazıcı", "Barkod Okuyucu", "Patch Kablo", "POS Rulosu"],
  },
  "Endüstriyel Mutfak": {
    name: "Endüstriyel Mutfak",
    description: "Gastronom kaplar, paslanmaz çelik ekipman ve mutfak sarfı.",
    popularItems: ["GN Küvet", "Çelik Tencere", "Porselen Tabak", "Bıçak Seti"],
  },
  "Diğer": {
    name: "Diğer",
    description: "Özel üretim, proje bazlı tedarik ve genel ticari talepler.",
    popularItems: ["Özel Üretim", "Numune Tedariği", "Hizmet Alımı"],
  },
};

export const TEKLIFIM_UNITS = [
  "Adet",
  "Koli",
  "Kg",
  "Ton",
  "Litre",
  "Paket",
  "Palet",
  "Metre",
  "Kutu",
] as const;

export const TURKEY_CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Kocaeli",
  "Mersin",
  "Kayseri",
  "Eskişehir",
  "Diyarbakır",
  "Samsun",
  "Denizli",
  "Şanlıurfa",
  "Sakarya",
  "Malatya",
  "Kahramanmaraş",
  "Trabzon",
  "Diğer",
] as const;

// ==========================================
// FAZ 6: ÖDEME, FİNANS & FATURALANDIRMA
// ==========================================

export type TeklifimPaymentStatus =
  | "unpaid"
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "partially_refunded"
  | "refunded"
  | "disputed";

export type TeklifimInvoiceStatus =
  | "invoice_needed"
  | "invoice_pending"
  | "invoice_uploaded"
  | "invoice_verified";

export interface TeklifimRefundItem {
  refundId: string;
  amount: number;
  reason: string;
  refundedAt: number;
  refundedBy: string;
  providerRefundId?: string;
  status: "success" | "pending" | "failed";
}

export interface TeklifimPayment {
  id: string; // pay_{orderId}
  paymentNumber: string; // ODE-2026-XXXXXX
  orderId: string;
  orderNumber: string;
  agreementId: string;
  agreementNumber: string;
  businessId: string;
  businessName: string;
  supplierId: string;
  supplierName: string;

  // Amount & Split details
  amount: number; // Toplam çekilen tutar (KDV Dahil TL)
  currency: string; // TRY
  platformFeeRate: number; // Örnek: 0.03 (%3)
  platformFee: number; // Platform komisyon tutarı (TL)
  supplierAmount: number; // Tedarikçiye aktarılacak net hakediş (TL)

  // Status & Provider details
  status: TeklifimPaymentStatus;
  statusHistory: {
    status: TeklifimPaymentStatus;
    changedBy: string;
    timestamp: number;
    note?: string;
  }[];
  provider: string; // "iyzico_marketplace" | "paytr_marketplace" | "mock_provider"
  providerPaymentId?: string;
  providerPaymentToken?: string;
  paymentMethod?: string; // "credit_card" | "debit_card" | "bank_transfer"
  cardLastFour?: string;
  cardBrand?: string; // "Bonus", "Maximum", "World" vb.

  // Idempotency & Expiration
  idempotencyKey: string;
  expiresAt: number; // Zaman aşımı (örn: 24 saat sonra)

  // Timestamps
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
  failedAt?: number;
  failureReason?: string;

  // Refunds
  refundedAmount?: number;
  refunds?: TeklifimRefundItem[];

  // Payout Status to Supplier
  payoutStatus?: "pending_delivery" | "ready_for_payout" | "payout_completed" | "payout_held";
  payoutCompletedAt?: number;
  payoutReference?: string;
}

export interface TeklifimInvoice {
  id: string; // inv_{orderId}_{type}
  orderId: string;
  orderNumber: string;
  businessId: string;
  businessName: string;
  supplierId: string;
  supplierName: string;
  invoiceType: "commercial_supplier" | "platform_commission";
  invoiceNumber?: string;
  amount: number;
  currency: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: TeklifimInvoiceStatus;
  uploadedAt: number;
  uploadedBy: string;
  notes?: string;
}

export interface TeklifimSupplierPayoutSummary {
  supplierId: string;
  totalSalesVolume: number; // Toplam brüt satış
  totalCommissionPaid: number; // Toplam kesilen platform komisyonu
  totalRefundedVolume: number; // Toplam yapılan iadeler
  netPayoutEarned: number; // Toplam net hak edilen
  pendingPayout: number; // Henüz teslimatı tamamlanmamış bekleyen bakiye
  completedPayout: number; // Tedarikçinin banka hesabına aktarılmış tutar
  transactionsCount: number;
}

