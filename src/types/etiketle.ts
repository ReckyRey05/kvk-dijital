export type EtiketleTagStatus = "active" | "inactive" | "archived";

export interface EtiketleTag {
  id: string;
  businessId: string;
  businessName?: string;
  code: string; // 6-character clean unique code (e.g. X8K29F)
  name: string; // e.g. "Kamera Tripodu"
  category: string; // e.g. "Ekipman", "Kutu", "Hammadde"
  quantity: number; // e.g. 12
  unit: string; // "Adet", "Kutu", "Koli", "Kg", etc.
  location: string; // e.g. "Raf B-04"
  description?: string; // e.g. "Siyah tripod"
  imageUrl?: string;
  status: EtiketleTagStatus;
  createdAt: number;
  updatedAt: number;
}

export interface EtiketleTagHistory {
  id: string;
  tagId: string;
  businessId: string;
  changeSummary: string; // e.g. "Adet: 12 → 8", "Konum: Raf B-03 → Raf B-04"
  previousQuantity?: number;
  newQuantity?: number;
  previousLocation?: string;
  newLocation?: string;
  timestamp: number;
}

export interface EtiketlePublicTag {
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  description?: string;
  imageUrl?: string;
  status: EtiketleTagStatus;
  updatedAt: number;
}

export const ETIKETLE_CATEGORIES = [
  "Ekipman",
  "Kutu & Koli",
  "Hammadde",
  "Yedek Parça",
  "Ofis & Kırtasiye",
  "Mağaza & Raf",
  "Atölye",
  "Elektronik",
  "Arşiv & Evrak",
  "Diğer",
] as const;

export const ETIKETLE_UNITS = [
  "Adet",
  "Koli",
  "Kutu",
  "Paket",
  "Kg",
  "Metre",
  "Litre",
  "Palet",
  "Takım",
] as const;
