export type OrderMode = "DIRECT_KITCHEN" | "WAITER_CONFIRMATION";
export type PaymentMode = "CASHIER" | "ONLINE" | "HYBRID";
export type TableStatus = "EMPTY" | "OCCUPIED" | "BILL_REQUESTED" | "WAITER_CALLED";
export type OrderStatus = "PENDING_CONFIRMATION" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
export type WaiterCallType = "WAITER" | "BILL_CASH" | "BILL_CARD" | "WATER_NAPKIN";
export type MenuLanguage = "TR" | "EN";

export interface RestaurantSettings {
  orderMode: OrderMode;
  paymentMode: PaymentMode;
  wifiRequired: boolean;
  sessionTimeoutMinutes: number;
  currency: string;
  taxRatePercent: number;
  serviceChargePercent?: number;
  allowSplitBill: boolean;
  googleReviewUrl?: string; // Google Haritalar Puanlama URL'i
  posIntegrationType: "STANDALONE" | "CLOUD_WEBHOOK" | "LOCAL_BRIDGE";
  posWebhookUrl?: string;
  posApiKey?: string;
  themeColor: string;
  coverImage?: string;
  address?: string;
  phone?: string;
}

export interface CustomerFeedback {
  id: string;
  restaurantId: string;
  tableId: string;
  tableNumber: string;
  rating: number; // 1-5
  comment?: string;
  isPublicGoogleRedirect: boolean;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  settings: RestaurantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOptionItem {
  id: string;
  name: string;
  priceDelta: number; // e.g. +25 TL
  isDefault?: boolean;
}

export interface ProductOptionGroup {
  id: string;
  title: string; // e.g. "Pişme Derecesi", "Ekstra Malzeme", "Sos Seçimi"
  type: "SINGLE" | "MULTIPLE";
  minSelect?: number;
  maxSelect?: number;
  required?: boolean;
  options: ProductOptionItem[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean; // Canlı Stok Açık/Kapalı ("Tükendi")
  preparationTimeMinutes?: number;
  calories?: number;
  allergens?: string[]; // e.g. ["Gluten", "Laktoz", "Fıstık"]
  badges?: ("CHEF_SPECIAL" | "BESTSELLER" | "VEGAN" | "SPICY")[];
  optionGroups?: ProductOptionGroup[];
  order: number;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string; // e.g. "Masa 4", "Bahçe 2", "VIP 1"
  section?: string; // e.g. "İç Mekan", "Teras", "Bahçe"
  capacity: number;
  status: TableStatus;
  currentSessionId?: string;
  activeOrderId?: string;
  activeBillTotal: number;
  lastOrderTime?: string;
  lastCallTime?: string;
  lastCallType?: WaiterCallType;
}

export interface SelectedOptionPayload {
  groupId: string;
  groupTitle: string;
  selectedItems: {
    id: string;
    name: string;
    priceDelta: number;
  }[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  finalPrice: number; // basePrice + options priceDelta
  quantity: number;
  selectedOptions?: SelectedOptionPayload[];
  itemNotes?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  tableNumber: string;
  sessionToken: string;
  deviceHash?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  notes?: string;
  paymentStatus: "PENDING" | "PAID_ONLINE" | "PAID_CASHIER";
  paymentMethod?: "CASH" | "CREDIT_CARD" | "ONLINE_POS";
  confirmedAt?: string;
  readyAt?: string;
  servedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaiterCall {
  id: string;
  restaurantId: string;
  tableId: string;
  tableNumber: string;
  type: WaiterCallType;
  message?: string;
  status: "ACTIVE" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
}

export interface TableSession {
  sessionId: string;
  restaurantId: string;
  tableId: string;
  tableNumber: string;
  deviceFingerprint: string;
  issuedAt: number; // timestamp ms
  expiresAt: number; // timestamp ms (15 mins after issuance/last activity)
  isActive: boolean;
  token: string;
}
