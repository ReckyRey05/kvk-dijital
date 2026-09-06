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

export interface TeklifimProduct {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
  minOrder?: string;
  unit?: string;
  estimatedPrice?: number;
  createdAt: number;
  updatedAt?: number;
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

  // Computed badge markers for comparison
  isCheapest?: boolean;
  isFastest?: boolean;
  isBestValue?: boolean;
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
