export type TeklifimUserRole = "business" | "supplier";

export type TeklifimRequestStatus =
  | "published"
  | "bidding"
  | "offers_received"
  | "supplier_selected"
  | "completed"
  | "cancelled";

export type TeklifimOfferStatus = "submitted" | "viewed" | "selected" | "rejected";

export interface TeklifimProfile {
  uid: string;
  role: TeklifimUserRole;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  district?: string;
  categories: string[];
  description?: string;
  deliveryRegions?: string[];
  minOrder?: string;
  isVerified: boolean;
  yearFounded?: number;
  completedDeals?: number;
  responseRate?: string;
  taxVerified?: boolean;
  createdAt: number;
  updatedAt: number;
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
  imageUrl?: string;
  sampleRequired?: boolean;
  status: TeklifimRequestStatus;
  offerCount: number;
  selectedOfferId?: string;
  selectedSupplierId?: string;
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
