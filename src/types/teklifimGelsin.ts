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
