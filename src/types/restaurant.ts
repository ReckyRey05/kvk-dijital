export type OrderMode = "DIRECT_KITCHEN" | "WAITER_CONFIRMATION";
export type PaymentMode = "CASHIER" | "ONLINE" | "HYBRID";
export type TableStatus = "EMPTY" | "OCCUPIED" | "BILL_REQUESTED" | "WAITER_CALLED";
export type OrderStatus = "PENDING_CONFIRMATION" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
export type WaiterCallType =
  | "WAITER"
  | "BILL_CASH"
  | "BILL_CARD"
  | "WATER_NAPKIN"
  | "ASHTRAY"
  | "WIPES"
  | "BABY_CHAIR"
  | "COMPLAINT";
export type MenuLanguage = "TR" | "EN";
export type MenuCurrency = "TRY" | "USD" | "EUR" | "GBP";

export interface ManagerAlert {
  id: string;
  tableId: string;
  tableNumber: string;
  type: "NEGATIVE_FEEDBACK" | "URGENT_CALL" | "VIP_VISIT" | "COMPLAINT";
  category?: string; // e.g. "Yemek Kalitesi", "Gecikme", "Personel", "Hesap"
  rating?: number;
  message: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  isResolved: boolean;
}

export interface CustomerVoucher {
  id: string;
  code: string;
  title: string;
  discountType: "PERCENT" | "ITEM" | "FIXED";
  value: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
}

export interface SongRequest {
  id: string;
  tableNumber: string;
  songTitle: string;
  artist: string;
  votes: number;
  createdAt: string;
}

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

export type IngredientUnit = "kg" | "g" | "l" | "ml" | "adet";

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  unitCost: number; // TL cinsinden birim maliyet (örn: 1 kg dana kıyma = 480 TL)
  currentStock: number; // Mevcut stok miktarı
  criticalStock: number; // Kritik uyarı seviyesi
  category: "ET" | "SEBZE" | "SOS" | "UNLU_MAMUL" | "SUT_URUNU" | "ICECEK" | "BAHARAT" | "DIGER";
  lastRestockedAt?: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number; // Reçetedeki miktar (örn: 0.18 kg veya 1 adet)
}

export interface WasteLog {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: IngredientUnit;
  cost: number;
  reason: "EXPIRED" | "DAMAGED" | "PREPARATION_ERROR" | "STAFF_MEAL";
  loggedAt: string;
  loggedBy: string;
}

export interface HappyHourRule {
  id: string;
  title: string;
  discountPercent: number;
  startHour: number; // örn: 14 (14:00)
  endHour: number; // örn: 18 (18:00)
  targetCategoryId?: string; // "cat_burgers" veya "ALL"
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // İndirim öncesi orijinal fiyat (örn: 360 TL)
  discountUntil?: string; // İndirim bitiş tarihi (ISO string)
  image?: string;
  isAvailable: boolean; // Canlı Stok Açık/Kapalı ("Tükendi")
  ingredients?: string[]; // e.g. ["Dana Köfte", "Cheddar", "Karamelize Soğan", "Turşu", "Trüf Mayonez"]
  recipe?: RecipeItem[]; // Reçete kalemleri
  costPrice?: number; // Otomatik hesaplanan porsiyon maliyeti (TL)
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

export interface TableParticipant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  finalPrice: number; // basePrice + options priceDelta
  quantity: number;
  selectedOptions?: SelectedOptionPayload[];
  removedIngredients?: string[]; // e.g. ["Karamelize Soğan", "Turşu"]
  itemNotes?: string;
  addedBy?: string; // e.g. "Masa Reisi", "Misafir 2", "Ali"
  addedById?: string;
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

// 1. Delivery Aggregator Platform Hub (Getir, Yemeksepeti, Trendyol, Migros)
export type DeliveryPlatform = "GETIR" | "YEMEKSEPETI" | "TRENDYOL" | "MIGROS";

export interface DeliveryPlatformConfig {
  platform: DeliveryPlatform;
  name: string;
  isOpen: boolean;
  autoAccept: boolean;
  extraPrepTimeMinutes: number;
  apiKey?: string;
}

export interface DeliveryOrder {
  id: string;
  platform: DeliveryPlatform;
  platformOrderId: string; // e.g. "GY-8492" or "YS-10293"
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  courierNotes?: string;
  status: "PENDING" | "PREPARING" | "COURIER_ASSIGNED" | "DELIVERED" | "CANCELLED";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentType: "ONLINE_PAID" | "CASH_ON_DELIVERY" | "CARD_ON_DELIVERY";
  courierName?: string;
  courierPhone?: string;
  createdAt: string;
}

// 2. E-Fatura & E-Adisyon Integration
export type EFaturaProvider = "PARASUT" | "BIZIMHESAP" | "QNB_EFINANS" | "GIB_PORTAL";

export interface EFaturaRecord {
  id: string;
  ettnNo: string; // UUID e.g. "550e8400-e29b-41d4-a716-446655440000"
  faturaNo: string; // e.g. "AUR202600000142"
  orderId?: string;
  tableNumber?: string;
  vknTckn: string;
  recipientTitle: string;
  taxOffice?: string;
  recipientEmail?: string;
  grossTotal: number;
  kdvTotal: number;
  netTotal: number;
  status: "SENT_TO_GIB" | "QUEUED" | "FAILED";
  issuedAt: string;
}

// 3. SaaS Packaging & Feature Entitlement
export type SaaSPackageTier = "STARTER" | "PRO" | "ENTERPRISE";

export interface SaaSPackageInfo {
  tier: SaaSPackageTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

// 4. Staff Roles & Permission Management (RBAC)
export type StaffRole = "WAITER" | "CASHIER" | "KITCHEN" | "MANAGER" | "OWNER";

export interface StaffPermissions {
  canConfirmOrders: boolean;
  canGiveDiscount: boolean;
  maxDiscountPercent: number; // e.g. 10 or 25
  canTransferTables: boolean;
  canCancelBill: boolean; // False = Requires Boss Override
  canViewReportsAndZ: boolean;
  canEditMenuAndPrices: boolean;
  canViewComplaints: boolean;
  canViewRecipesAndCosts: boolean;
  canManagePlatformOrders: boolean;
}

export interface StaffMember {
  id: string;
  restaurantId: string;
  name: string;
  role: StaffRole;
  pinCode: string; // 4-digit PIN e.g. "1234"
  phone?: string;
  email?: string;
  isActive: boolean;
  customPermissions?: Partial<StaffPermissions>;
  lastActiveAt?: string;
}

// 5. Boss Security & 2FA Configuration
export interface BossSecuritySettings {
  masterPin: string; // e.g. "1923"
  is2FAEnabled: boolean;
  twoFactorMethod: "APP" | "SMS" | "EMAIL";
  twoFactorPhone?: string;
  twoFactorEmail?: string;
  autoLockMinutes: number; // e.g. 15, 30, 60 or 0
}
