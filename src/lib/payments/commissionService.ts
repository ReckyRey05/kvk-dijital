import { TeklifimOrder } from "@/types/teklifimGelsin";

export interface CommissionConfig {
  defaultRate: number;
  categoryRates: Record<string, number>;
  supplierOverrides: Record<string, number>;
  fixedServiceFee: number;
}

export const DEFAULT_COMMISSION_CONFIG: CommissionConfig = {
  defaultRate: 0.03, // %3 varsayilan platform komisyonu
  categoryRates: {
    "Ambalaj & Paketleme": 0.03,
    "Gıda & İçecek": 0.025,
    "Temizlik & Hijyen": 0.03,
    "Kağıt & Sarf": 0.03,
    "Elektronik & Donanım": 0.04,
    "Endüstriyel Mutfak": 0.035,
    "Diğer": 0.03,
  },
  supplierOverrides: {},
  fixedServiceFee: 0,
};

export interface CommissionCalculationResult {
  orderTotal: number;
  feeRate: number;
  platformFee: number;
  supplierAmount: number;
  currency: string;
  ruleApplied: string;
}

/**
 * Calculates marketplace commission and supplier payout amount dynamically
 */
export function calculateMarketplaceCommission(
  order: TeklifimOrder,
  customConfig?: Partial<CommissionConfig>
): CommissionCalculationResult {
  const config: CommissionConfig = {
    ...DEFAULT_COMMISSION_CONFIG,
    ...customConfig,
    categoryRates: {
      ...DEFAULT_COMMISSION_CONFIG.categoryRates,
      ...customConfig?.categoryRates,
    },
    supplierOverrides: {
      ...DEFAULT_COMMISSION_CONFIG.supplierOverrides,
      ...customConfig?.supplierOverrides,
    },
  };

  const totalAmount = Number(order.totalPrice) || 0;
  const category = order.items?.[0]?.category || "Diğer";

  let feeRate = config.defaultRate;
  let ruleApplied = "default_rate";

  // 1. Supplier custom rate override check
  if (config.supplierOverrides[order.supplierId] !== undefined) {
    feeRate = config.supplierOverrides[order.supplierId];
    ruleApplied = `supplier_custom_override (${(feeRate * 100).toFixed(1)}%)`;
  }
  // 2. Category rate check
  else if (config.categoryRates[category] !== undefined) {
    feeRate = config.categoryRates[category];
    ruleApplied = `category_rate: ${category} (${(feeRate * 100).toFixed(1)}%)`;
  } else {
    ruleApplied = `default_platform_rate (${(feeRate * 100).toFixed(1)}%)`;
  }

  // Calculate platform fee
  const calculatedFee = totalAmount * feeRate + (config.fixedServiceFee || 0);
  const platformFee = Math.round(calculatedFee * 100) / 100;
  const supplierAmount = Math.max(0, Math.round((totalAmount - platformFee) * 100) / 100);

  return {
    orderTotal: totalAmount,
    feeRate,
    platformFee,
    supplierAmount,
    currency: order.currency || "TRY",
    ruleApplied,
  };
}
