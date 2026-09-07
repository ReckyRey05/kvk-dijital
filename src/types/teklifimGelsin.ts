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
  id?: string;
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
  verified?: boolean;
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
  availability?: TeklifimSupplierAvailability;
  favoriteCustomerIds?: string[];
  createdAt: number;
  updatedAt?: number;
}

export type TeklifimSupplierProfile = Omit<Partial<TeklifimProfile>, "responseRate"> & {
  id: string;
  companyName: string;
  city?: string;
  district?: string;
  categories?: string[];
  description?: string;
  logoUrl?: string;
  email?: string;
  rating?: number;
  reviewsCount?: number;
  completedDeals?: number;
  responseRate?: number;
  verification?: {
    isVerified?: boolean;
  };
  createdAt?: number;
};

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
  viewCount?: number;
  requestsCount?: number;
  requestCount?: number;
  stockCount?: number;
  lowStockThreshold?: number;
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

  // FAZ 9: Procurement & Bulk Purchasing Fields
  isBulkProcurement?: boolean;
  items?: TeklifimProcurementItem[];
  estimatedBudget?: number;
  approvalStatus?: "draft" | "pending_approval" | "approved" | "rejected" | "not_required";
  approvalThreshold?: number;
  approvalHistory?: TeklifimApprovalRecord[];
  createdByRole?: TeklifimOrgRole;
  fromListId?: string;
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

  // Operational & Telemetry
  respondedAt?: number;
  category?: string;
  validUntil?: string | number;
  validDays?: number;
  offerNumber?: string;
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
  productId?: string;
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

  // Operational & Reporting Aliases
  totalAmount?: number;
  category?: string;
  buyerBusinessId?: string;
  buyerBusinessName?: string;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  deliveryCity?: string;
  deliveryDueDate?: string | number;
  deliveredAt?: string | number;
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

// ==========================================
// FAZ 8: KEŞİF, ARAMA & AKILLI MARKETPLACE
// ==========================================

export type TeklifimSearchType = "all" | "products" | "suppliers" | "categories";

export type TeklifimSearchSort =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "moq_asc"
  | "fastest_delivery"
  | "rating"
  | "deals"
  | "newest"
  | "fastest_response"
  | "popular";

export interface TeklifimSearchFilters {
  query?: string;
  type?: TeklifimSearchType;
  category?: string;
  subCategory?: string;
  city?: string;
  district?: string;
  deliveryRegion?: string;
  stockStatus?: TeklifimStockStatus;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minMoq?: number;
  maxMoq?: number;
  verifiedOnly?: boolean;
  minRating?: number;
  sort?: TeklifimSearchSort;
  limit?: number;
  offset?: number;
}

export interface TeklifimCategoryMatch {
  name: string;
  slug: string;
  description: string;
  popularItems: string[];
  subCategories: string[];
  matchingSubCategories?: string[];
  productsCount?: number;
  suppliersCount?: number;
}

export interface TeklifimUnifiedSearchResult {
  query: string;
  filters: TeklifimSearchFilters;
  products: TeklifimProduct[];
  suppliers: TeklifimSupplierProfile[];
  categories: TeklifimCategoryMatch[];
  totalProducts: number;
  totalSuppliers: number;
  totalCategories: number;
  suggestedTerm?: string;
}

export interface TeklifimAutocompleteSuggestion {
  type: "product" | "supplier" | "category" | "subCategory" | "sku";
  title: string;
  subtitle?: string;
  category?: string;
  id?: string;
  url: string;
  badge?: string;
}

export interface TeklifimSavedSearch {
  id: string;
  userId: string;
  userRole?: string;
  title: string;
  query: string;
  filters: TeklifimSearchFilters;
  notifyOnNew?: boolean;
  createdAt: number;
}

export interface TeklifimSearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  filters?: TeklifimSearchFilters;
  resultsCount: number;
  timestamp: number;
}

export interface TeklifimComparisonItem {
  id: string;
  type: "product" | "supplier";
  title: string;
  imageUrl?: string;
  category: string;
  subCategory?: string;
  supplierName?: string;
  supplierId?: string;
  price?: number;
  priceVisibility?: TeklifimPriceVisibility;
  minimumOrder?: number;
  unit?: string;
  stockStatus?: TeklifimStockStatus;
  leadTimeDays?: number;
  deliveryRegions?: string[];
  rating?: number;
  reviewsCount?: number;
  isVerified?: boolean;
  city?: string;
  completedDeals?: number;
  responseRate?: number;
  url: string;
}

export interface TeklifimPersonalizedRecommendations {
  recommendedProducts: TeklifimProduct[];
  recommendedSuppliers: TeklifimSupplierProfile[];
  recommendedCategories: TeklifimCategoryMatch[];
  reason: string;
}

// ==========================================
// FAZ 9: ISLETME SATIN ALMA & KURUMSAL ALIM SISTEMI
// ==========================================

export type TeklifimOrgRole = "owner" | "admin" | "buyer" | "approver" | "viewer";

export interface TeklifimTeamMember {
  id: string; // mem_{businessId}_{userId}
  businessId: string;
  businessName: string;
  userId: string;
  email: string;
  name: string;
  role: TeklifimOrgRole;
  invitedBy?: string;
  joinedAt: number;
  status: "active" | "inactive" | "suspended";
  createdAt: number;
  updatedAt: number;
}

export interface TeklifimTeamInvitation {
  id: string; // inv_{token}
  businessId: string;
  businessName: string;
  email: string;
  role: TeklifimOrgRole;
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedBy: string;
  invitedByName: string;
  expiresAt: number;
  createdAt: number;
  acceptedAt?: number;
}

export interface TeklifimProcurementItem {
  id: string;
  productId?: string;
  productName: string;
  category: string;
  subCategory?: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice?: number;
  estimatedTotalPrice?: number;
  targetUnitPrice?: number;
  notes?: string;
}

export interface TeklifimProcurementList {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  category?: string;
  items: TeklifimProcurementItem[];
  totalEstimatedCost: number;
  itemCount: number;
  reminderFrequency?: "none" | "weekly" | "monthly" | "quarterly";
  nextReminderDate?: number;
  lastRequestedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface TeklifimApprovalRecord {
  id: string;
  procurementRequestId: string;
  actorId: string;
  actorName: string;
  actorRole: TeklifimOrgRole;
  action: "submitted" | "approved" | "rejected";
  note?: string;
  timestamp: number;
}

export interface TeklifimProcurementPolicy {
  id: string; // pol_{businessId}
  businessId: string;
  approvalThreshold: number; // default 35000 TL
  requireApprovalForBulk: boolean;
  allowedBuyerMaxAmount?: number;
  updatedAt: number;
  updatedBy: string;
}

export interface TeklifimAuditLog {
  id: string;
  businessId: string;
  actorId: string;
  actorName: string;
  actorRole: TeklifimOrgRole;
  action:
    | "request_created"
    | "request_submitted_approval"
    | "request_approved"
    | "request_rejected"
    | "offer_selected"
    | "order_created"
    | "payment_completed"
    | "invoice_uploaded"
    | "team_invited"
    | "team_role_changed"
    | "team_member_removed"
    | "list_created"
    | "list_updated"
    | "policy_updated";
  entityType:
    | "procurement_request"
    | "offer"
    | "order"
    | "procurement_list"
    | "team_member"
    | "policy";
  entityId: string;
  entityTitle: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface TeklifimSpendSummary {
  thisMonthSpend: number;
  prevMonthSpend: number;
  percentageChange: number | null; // null if insufficient data
  topCategory: { category: string; spend: number; orderCount: number } | null;
  topSupplier: { supplierId: string; supplierName: string; spend: number; orderCount: number } | null;
  monthlyTrends: { monthYear: string; totalSpend: number; orderCount: number }[];
  totalSpendAllTime: number;
  totalOrdersCount: number;
}

export interface TeklifimFrequentlyPurchasedItem {
  productName: string;
  category: string;
  totalOrdersCount: number;
  lastPurchasedAt: number;
  lastPrice: number;
  lastQuantity: number;
  lastUnit: string;
  lastSupplierId: string;
  lastSupplierName: string;
  productId?: string;
  currentCatalogPrice?: number;
  currentStockStatus?: TeklifimStockStatus;
  currentMinOrder?: number;
  currentLeadTimeDays?: number;
  priceDeltaPercentage?: number | null;
  priceDeltaAmount?: number | null;
}

export interface TeklifimBulkOfferComparison {
  offerId: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  supplierVerified: boolean;
  supplierRating?: number;
  totalPrice: number;
  currency: string;
  deliveryDays: number;
  minOrderQuantity?: string;
  coveredItemsCount: number;
  totalItemsCount: number;
  missingItems: string[];
  isPreviousSupplier: boolean;
  exceedsBudget: boolean;
  budgetDelta: number;
}

// ==========================================
// FAZ 10: TOPTANCI ISLETME MERKEZI & SATIS BUYUME SISTEMI
// ==========================================

export interface TeklifimOpportunityItem {
  requestId: string;
  title: string;
  category: string;
  subCategory?: string;
  productName?: string;
  quantity: number;
  unit: string;
  city: string;
  deliveryDays: number;
  estimatedBudget?: number;
  deadline?: string;
  createdAt: number;
  matchSignals: string[];
  matchScore: number; // 0 - 100
  matchingCatalogProductId?: string;
  matchingCatalogPrice?: number;
}

export interface TeklifimSupplierKpis {
  thisMonthSales: number;
  prevMonthSales: number;
  salesChangePercentage: number | null;
  thisMonthOffersCount: number;
  acceptanceRate: number | null; // percentage e.g. 35.4
  completedOrdersCount: number;
  averageResponseMinutes: number | null;
  pendingOffersCount: number;
  activeOrdersCount: number;
  negotiatingOffersCount: number;
}

export interface TeklifimCategoryConversion {
  category: string;
  offersCount?: number;
  acceptedCount?: number;
  totalOffers?: number;
  acceptedOffers?: number;
  conversionRate: number;
  salesVolume?: number;
}

export interface TeklifimMonthlyConversion {
  monthYear?: string;
  month?: string;
  offersCount?: number;
  acceptedCount?: number;
  totalOffers?: number;
  acceptedOffers?: number;
  conversionRate: number;
  salesVolume?: number;
}

export interface TeklifimOfferConversion {
  totalOffers: number;
  acceptedOffers: number;
  rejectedOffers: number;
  pendingOffers: number;
  conversionRate: number | null;
  categoryConversions: TeklifimCategoryConversion[];
  monthlyConversions: TeklifimMonthlyConversion[];
  averageDealSize: number | null;
}

export interface TeklifimQuoteTemplate {
  id: string; // tmpl_{randomHex}
  supplierId: string;
  title: string;
  category: string;
  subCategory?: string;
  productId?: string;
  productName?: string;
  unitPrice: number;
  deliveryDays: number;
  minOrderQuantity?: number | string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TeklifimPriceList {
  id: string; // plist_{randomHex}
  supplierId: string;
  name: string; // e.g. "Standart", "Buyuk Alici", "Ozel Musteri"
  description?: string;
  discountPercentage?: number; // e.g. 5, 10
  productOverrides?: Record<string, number>; // productId -> special price
  targetCustomerIds?: string[];
  createdAt: number;
  updatedAt: number;
}

export type TeklifimCustomerSegment = "new" | "active" | "regular" | "dormant";

export interface TeklifimSupplierCustomer {
  businessId: string;
  businessName: string;
  city: string;
  contactName?: string;
  phone?: string;
  email?: string;
  completedOrdersCount: number;
  totalSalesVolume: number;
  lastOrderDate?: number | string;
  lastOrderId?: string;
  categories: string[];
  isFavorite: boolean;
  segment: TeklifimCustomerSegment;
  reorderSuggestions?: {
    productName: string;
    lastQuantity: number;
    lastUnit: string;
    lastPrice: number;
    currentCatalogPrice?: number;
    productId?: string;
  }[];
}

export interface TeklifimProductPerformance {
  productId: string;
  productName: string;
  category: string;
  price?: number;
  stockStatus?: TeklifimStockStatus;
  viewsCount: number;
  requestsCount: number;
  salesCount: number;
  totalRevenue: number;
  conversionRate: number | null;
}

export interface TeklifimSupplierAvailability {
  isOnline: boolean;
  isAcceptingOrders: boolean;
  vacationMode?: boolean;
  vacationStartDate?: string | number;
  vacationEndDate?: string | number;
  vacationNote?: string;
  updatedAt?: number;
}

export interface TeklifimDeliveryPerformance {
  onTimeDeliveryRate: number | null;
  delayedOrdersCount: number;
  averageDeliveryDays: number | null;
  totalDeliveredCount: number;
}

export interface TeklifimCommercialCalendarEvent {
  id: string;
  type: "delivery_due" | "offer_expiry" | "order_dispatch";
  title: string;
  date: number;
  entityId: string;
  entityNumber?: string;
  amount?: number;
  status: string;
}

// ==========================================
// FAZ 11: ENTEGRASYONLAR, API & OTOMASYON PLATFORMU
// ==========================================

export type TeklifimIntegrationChannel = "push" | "email" | "sms" | "whatsapp";

export type TeklifimIntegrationEventType =
  | "request.created"
  | "offer.created"
  | "offer.countered"
  | "offer.accepted"
  | "order.created"
  | "order.shipped"
  | "order.delivered"
  | "payment.paid"
  | "payment.failed"
  | "refund.created"
  | "message.created"
  | "supplier.verified"
  | "stock.alert";

export interface TeklifimNotificationPreference {
  userId: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  categories: {
    offers: boolean;
    messages: boolean;
    orders: boolean;
    payments: boolean;
    delivery: boolean;
    marketing: boolean;
  };
  updatedAt: number;
}

export interface TeklifimConsentRecord {
  id: string;
  userId: string;
  channel: "sms" | "email" | "whatsapp";
  type: "marketing" | "transactional";
  granted: boolean;
  grantedAt: number;
  revokedAt?: number;
  source: string;
  version: string;
  ipAddress?: string;
}

export interface TeklifimApiKey {
  id: string; // key_{randomHex}
  userId: string;
  name: string;
  keyPrefix: string; // e.g. tc_live_8f3a
  keyHash: string; // SHA-256
  scopes: string[]; // products:read, products:write, etc.
  status: "active" | "revoked";
  createdAt: number;
  lastUsedAt?: number;
}

export interface TeklifimWebhookEndpoint {
  id: string; // whk_{randomHex}
  userId: string;
  url: string;
  secret: string; // HMAC secret
  events: TeklifimIntegrationEventType[];
  status: "active" | "disabled" | "failing";
  failureCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface TeklifimWebhookDelivery {
  id: string; // del_{randomHex}
  endpointId: string;
  userId: string;
  eventType: TeklifimIntegrationEventType;
  eventId: string;
  url: string;
  payload: any;
  signature: string;
  status: "pending" | "delivered" | "failed" | "retrying";
  statusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  attempts: number;
  nextRetryAt?: number;
  createdAt: number;
  completedAt?: number;
}

export interface TeklifimIntegrationEvent {
  id: string; // evt_{randomHex}
  type: TeklifimIntegrationEventType;
  entityId: string;
  entityType: string;
  actorId?: string;
  recipientId?: string;
  payload: any;
  status: "pending" | "processed" | "failed";
  channelsDispatched: string[];
  createdAt: number;
  processedAt?: number;
}

export type TeklifimShippingStatus =
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export interface TeklifimShippingTracking {
  trackingNumber: string;
  carrier: string;
  status: TeklifimShippingStatus;
  trackingUrl?: string;
  shipmentDate: number;
  estimatedDelivery?: number;
  events: {
    date: number;
    location?: string;
    description: string;
    status: TeklifimShippingStatus;
  }[];
}

export interface TeklifimInvoiceDraft {
  invoiceId?: string;
  orderId: string;
  type: "e-fatura" | "e-arsiv";
  taxNumberOrTckn: string;
  title: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    total: number;
  }[];
  totalVat: number;
  grandTotal: number;
  currency: string;
  status: "draft" | "queued" | "issued" | "failed";
  gibInvoiceNumber?: string;
}

export interface TeklifimCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: number;
  endDate: number;
  location?: string;
  url?: string;
  type: "delivery" | "quote_expiry" | "meeting" | "payment";
}

// ==========================================
// FAZ 12: ADMIN & PLATFORM OPERASYON MERKEZI
// ==========================================

export type TeklifimAdminRole =
  | "super_admin"
  | "operations_admin"
  | "finance_admin"
  | "moderation_admin"
  | "support_admin";

export type TeklifimAdminPermission =
  | "users.read"
  | "users.suspend"
  | "users.edit"
  | "suppliers.manage"
  | "suppliers.verify"
  | "businesses.manage"
  | "products.moderate"
  | "categories.manage"
  | "requests.manage"
  | "offers.manage"
  | "orders.manage"
  | "disputes.manage"
  | "reports.manage"
  | "moderation_notes.manage"
  | "payments.view"
  | "payments.manage"
  | "refunds.manage"
  | "finance.view"
  | "integrations.manage"
  | "audit.view"
  | "system.view"
  | "feature_flags.manage"
  | "settings.manage"
  | "announcements.manage"
  | "support.manage"
  | "*";

export interface TeklifimUserSuspension {
  userId: string;
  reason: string;
  suspendedBy: string;
  suspendedAt: number;
  durationDays?: number;
  expiresAt?: number;
  isActive: boolean;
  notes?: string;
}

export type TeklifimDisputeStatus =
  | "open"
  | "investigating"
  | "waiting_for_business"
  | "waiting_for_supplier"
  | "resolved"
  | "rejected";

export type TeklifimDisputeOutcome =
  | "buyer_favor"
  | "supplier_favor"
  | "partial_resolution"
  | "cancelled"
  | "other";

export interface TeklifimDispute {
  id: string;
  orderId: string;
  orderNumber: string;
  businessId: string;
  businessName: string;
  supplierId: string;
  supplierName: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
  status: TeklifimDisputeStatus;
  resolution?: {
    outcome: TeklifimDisputeOutcome;
    notes: string;
    resolvedBy: string;
    resolvedAt: number;
    refundAmount?: number;
  };
  createdAt: number;
  updatedAt: number;
}

export type TeklifimSupportTicketStatus =
  | "open"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed";

export type TeklifimSupportTicketPriority = "low" | "medium" | "high" | "urgent";

export interface TeklifimSupportTicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: number;
}

export interface TeklifimSupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  subject: string;
  category: string;
  description: string;
  status: TeklifimSupportTicketStatus;
  priority: TeklifimSupportTicketPriority;
  assignedTo?: string;
  internalNotes?: string[];
  messages: TeklifimSupportTicketMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface TeklifimModerationNote {
  id: string;
  targetType: "user" | "supplier" | "business" | "product" | "request" | "order" | "dispute";
  targetId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  note: string;
  createdAt: number;
}

export interface TeklifimFeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedAt: number;
  updatedBy: string;
}

export interface TeklifimPlatformSettings {
  marketplace: {
    defaultCommissionRate: number;
    minRequestDurationDays: number;
    maxNegotiationRevisions: number;
  };
  security: {
    rateLimitPerMin: number;
    maxUploadSizeMb: number;
  };
  payments: {
    sandboxMode: boolean;
    activeProvider: string;
  };
  moderation: {
    autoReportThreshold: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    pushEnabled: boolean;
  };
}

export interface TeklifimAnnouncement {
  id: string;
  title: string;
  content: string;
  targetRole: "all" | "business" | "supplier";
  channel: "in_app" | "push";
  status: "draft" | "published";
  createdAt: number;
  createdBy: string;
}

export interface TeklifimAdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: TeklifimAdminRole;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  ipAddress?: string;
  timestamp: number;
}

export interface TeklifimAdminCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subCategories: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// ==========================================
// FAZ 13: ABONELİK, PAKETLER, LİMİTLER & GELİR MODELİ
// ==========================================

export type TeklifimSubscriptionTier =
  | "free"
  | "business"
  | "pro_business"
  | "supplier"
  | "pro_supplier";

export type TeklifimBillingInterval = "monthly" | "yearly";

export type TeklifimSubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "paused"
  | "cancelled"
  | "expired"
  | "incomplete";

export interface TeklifimPlanLimits {
  requestsPerMonth: number;
  teamMembers: number;
  savedProcurementLists: number;
  activeProducts: number;
  quotesPerMonth: number;
  apiRateLimitPerMin: number;
  customPriceLists: number;
}

export interface TeklifimPlanFeatures {
  advancedReports: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  bulkImport: boolean;
  procurementApproval: boolean;
  verifiedBadgePriority: boolean;
  dedicatedSupport: boolean;
  customBranding: boolean;
}

export interface TeklifimSubscriptionPlan {
  id: string; // e.g. plan_business_v1
  tier: TeklifimSubscriptionTier;
  name: string;
  description: string;
  targetRole: "business" | "supplier" | "all";
  version: number;
  monthlyPrice: number; // TL
  yearlyPrice: number; // TL
  yearlyDiscountPercent: number; // e.g. 15 (%)
  limits: TeklifimPlanLimits;
  features: TeklifimPlanFeatures;
  isActive: boolean;
  trialDays: number;
  createdAt: number;
  updatedAt: number;
}

export interface TeklifimSubscription {
  id: string; // sub_{timestamp}_{hex}
  userId: string;
  userEmail: string;
  userRole: "business" | "supplier";
  planId: string;
  planTier: TeklifimSubscriptionTier;
  planVersion: number;
  status: TeklifimSubscriptionStatus;
  interval: TeklifimBillingInterval;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: number;
  cancelReason?: string;
  trialStart?: number;
  trialEnd?: number;
  hasUsedTrial: boolean;
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  paymentMethod?: {
    brand: string;
    lastFour: string;
    expMonth?: number;
    expYear?: number;
  };
  gracePeriodEnd?: number;
  pendingDowngradePlanId?: string;
  pendingDowngradeEffectiveAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface TeklifimUsageMetrics {
  requestsUsed: number;
  quotesUsed: number;
  productsActive: number;
  teamMembersActive: number;
  procurementListsUsed: number;
  apiCallsUsed: number;
}

export interface TeklifimUsage {
  id: string; // usage_{userId}_{period}
  userId: string;
  period: string; // YYYY-MM
  periodStart: number;
  periodEnd: number;
  metrics: TeklifimUsageMetrics;
  updatedAt: number;
}

export interface TeklifimCoupon {
  id: string; // cpn_{code}
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  validFrom: number;
  validUntil: number;
  maxUses: number;
  currentUses: number;
  maxUsesPerUser: number;
  usedBy: Record<string, number>; // userId -> usageCount
  applicablePlans?: TeklifimSubscriptionTier[];
  isActive: boolean;
  createdAt: number;
}

export interface TeklifimBillingRecord {
  id: string; // bil_{timestamp}_{hex}
  invoiceNumber: string; // SUB-2026-XXXXXX
  subscriptionId: string;
  userId: string;
  userEmail: string;
  companyName: string;
  planId: string;
  planTier: TeklifimSubscriptionTier;
  interval: TeklifimBillingInterval;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  couponCode?: string;
  discountAmount?: number;
  status: "paid" | "failed" | "refunded";
  providerPaymentId?: string;
  providerInvoiceUrl?: string;
  paymentMethodBrand?: string;
  paymentMethodLastFour?: string;
  paidAt?: number;
  createdAt: number;
}

export type TeklifimSubscriptionEventType =
  | "subscription.created"
  | "subscription.renewed"
  | "subscription.upgraded"
  | "subscription.downgraded"
  | "subscription.cancelled"
  | "subscription.payment_failed"
  | "subscription.past_due"
  | "subscription.trial_started"
  | "subscription.trial_ending";

export interface TeklifimSubscriptionEvent {
  id: string; // subevt_{timestamp}_{hex}
  subscriptionId: string;
  userId: string;
  eventType: TeklifimSubscriptionEventType;
  providerEventId?: string;
  idempotencyKey?: string;
  payload: any;
  createdAt: number;
}

