import {
  TeklifimSubscriptionStatus,
  TeklifimSubscriptionTier,
  TeklifimBillingInterval,
  TeklifimSubscriptionPlan,
  TeklifimSubscription,
  TeklifimCoupon,
  TeklifimBillingRecord,
} from "@/types/teklifimGelsin";
import { SUBSCRIPTION_SETTINGS } from "./subscriptionConfig";

/**
 * Validates state machine transitions for TeklifimSubscription.
 * Strictly blocks invalid state jumps (e.g. cancelled -> active directly).
 */
export function isValidSubscriptionTransition(
  currentStatus: TeklifimSubscriptionStatus,
  targetStatus: TeklifimSubscriptionStatus
): boolean {
  if (currentStatus === targetStatus) return true;

  const validTransitions: Record<TeklifimSubscriptionStatus, TeklifimSubscriptionStatus[]> = {
    trialing: ["active", "past_due", "cancelled", "expired"],
    active: ["past_due", "paused", "cancelled", "expired"],
    past_due: ["active", "cancelled", "expired"],
    paused: ["active", "cancelled", "expired"],
    cancelled: [], // Terminal state. Re-subscribing creates a new subscription.
    expired: [],   // Terminal state. Re-subscribing creates a new subscription.
    incomplete: ["active", "expired", "cancelled"],
  };

  const allowedTargets = validTransitions[currentStatus] || [];
  return allowedTargets.includes(targetStatus);
}

/**
 * Formats standardized platform SaaS subscription invoice numbers e.g. SUB-2026-000001
 */
export function formatSubscriptionInvoiceNumber(seq: number, prefix: string = "SUB"): string {
  const year = new Date().getFullYear();
  const padded = String(seq).padStart(6, "0");
  return `${prefix}-${year}-${padded}`;
}

/**
 * Validates whether a coupon code is applicable and calculates discount.
 */
export function validateCoupon(
  coupon: TeklifimCoupon | null | undefined,
  userId: string,
  planTier: TeklifimSubscriptionTier,
  amount: number
): { valid: boolean; discount: number; error?: string } {
  if (!coupon) {
    return { valid: false, discount: 0, error: "Kupon bulunamadi." };
  }

  if (!coupon.isActive) {
    return { valid: false, discount: 0, error: "Kupon artik gecerli degil." };
  }

  const now = Date.now();
  if (coupon.validFrom && now < coupon.validFrom) {
    return { valid: false, discount: 0, error: "Kupon henuz aktif degil." };
  }

  if (coupon.validUntil && now > coupon.validUntil) {
    return { valid: false, discount: 0, error: "Kuponun suresi dolmus." };
  }

  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return { valid: false, discount: 0, error: "Kupon toplam kullanim limitine ulasti." };
  }

  const userUsage = coupon.usedBy?.[userId] || 0;
  if (coupon.maxUsesPerUser && userUsage >= coupon.maxUsesPerUser) {
    return { valid: false, discount: 0, error: "Bu kuponu daha once kullandiniz." };
  }

  if (coupon.applicablePlans && coupon.applicablePlans.length > 0) {
    if (!coupon.applicablePlans.includes(planTier)) {
      return { valid: false, discount: 0, error: "Bu kupon secilen plan icin gecerli degil." };
    }
  }

  let discount = 0;
  if (coupon.discountType === "percent") {
    discount = Math.round((amount * (coupon.discountValue / 100)) * 100) / 100;
  } else {
    discount = Math.min(amount, coupon.discountValue);
  }

  return { valid: true, discount };
}

/**
 * Calculates base price, discount, tax (KDV), and total amount.
 */
export function calculateSubscriptionPrices(
  plan: TeklifimSubscriptionPlan,
  interval: TeklifimBillingInterval,
  coupon?: TeklifimCoupon,
  userId?: string
): {
  baseAmount: number;
  discountAmount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
} {
  const baseAmount = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  let discountAmount = 0;

  if (coupon && userId) {
    const couponValidation = validateCoupon(coupon, userId, plan.tier, baseAmount);
    if (couponValidation.valid) {
      discountAmount = couponValidation.discount;
    }
  }

  const netAmount = Math.max(0, baseAmount - discountAmount);
  const taxAmount = Math.round((netAmount * SUBSCRIPTION_SETTINGS.defaultVatRate) * 100) / 100;
  const totalAmount = Math.round((netAmount + taxAmount) * 100) / 100;

  return {
    baseAmount,
    discountAmount,
    netAmount,
    taxAmount,
    totalAmount,
  };
}

/**
 * Usage limit checker with soft warning (80%) and hard limit (100%).
 */
export function checkUsageLimit(
  currentUsage: number,
  limit: number,
  requestedDelta: number = 1
): {
  allowed: boolean;
  softWarning: boolean;
  current: number;
  limit: number;
  remaining: number;
  error?: string;
} {
  // Unlimited plans (e.g. limit === -1 or high limit)
  if (limit < 0) {
    return {
      allowed: true,
      softWarning: false,
      current: currentUsage,
      limit,
      remaining: Infinity,
    };
  }

  const nextTotal = currentUsage + requestedDelta;
  const remaining = Math.max(0, limit - currentUsage);

  if (nextTotal > limit) {
    return {
      allowed: false,
      softWarning: true,
      current: currentUsage,
      limit,
      remaining,
      error: `Plan limitine ulasildi (${currentUsage}/${limit}). Lutfen planinizi yukseltin.`,
    };
  }

  const ratio = nextTotal / limit;
  const softWarning = ratio >= SUBSCRIPTION_SETTINGS.softLimitWarningRatio;

  return {
    allowed: true,
    softWarning,
    current: currentUsage,
    limit,
    remaining: limit - nextTotal,
  };
}

/**
 * Financial metrics calculator:
 * Accurately derives MRR, ARR, ARPU, Churn Rate and Trial Conversion Rate.
 * Strictly segregates Marketplace Commission Revenue from Subscription SaaS Revenue.
 */
export function calculateSubscriptionKpis(
  subscriptions: TeklifimSubscription[] = [],
  billingRecords: TeklifimBillingRecord[] = [],
  plansMap: Record<string, TeklifimSubscriptionPlan>,
  marketplaceCommissionRevenue: number = 0
) {
  let mrr = 0;
  let activeCount = 0;
  let trialingCount = 0;
  let pastDueCount = 0;
  let cancelledCount = 0;
  let trialConvertedCount = 0;
  let totalTrialHistory = 0;

  // Plan distribution counts
  const planDistribution: Record<TeklifimSubscriptionTier, number> = {
    free: 0,
    business: 0,
    pro_business: 0,
    supplier: 0,
    pro_supplier: 0,
  };

  subscriptions.forEach((sub) => {
    if (sub.status === "active") {
      activeCount++;
      planDistribution[sub.planTier] = (planDistribution[sub.planTier] || 0) + 1;

      // MRR calculation based on plan price
      const plan = plansMap[sub.planId] || plansMap[`plan_${sub.planTier}_v1`];
      if (plan) {
        if (sub.interval === "yearly") {
          mrr += Math.round((plan.yearlyPrice / 12) * 100) / 100;
        } else {
          mrr += plan.monthlyPrice;
        }
      }
    } else if (sub.status === "trialing") {
      trialingCount++;
      planDistribution[sub.planTier] = (planDistribution[sub.planTier] || 0) + 1;
    } else if (sub.status === "past_due") {
      pastDueCount++;
    } else if (sub.status === "cancelled") {
      cancelledCount++;
    }

    if (sub.hasUsedTrial) {
      totalTrialHistory++;
      if (sub.status === "active") {
        trialConvertedCount++;
      }
    }
  });

  const arr = Math.round(mrr * 12 * 100) / 100;
  const arpu = activeCount > 0 ? Math.round((mrr / activeCount) * 100) / 100 : 0;

  const totalSubscribersEver = activeCount + trialingCount + pastDueCount + cancelledCount;
  const churnRate =
    totalSubscribersEver > 0 ? Math.round((cancelledCount / totalSubscribersEver) * 1000) / 10 : 0;

  const trialConversionRate =
    totalTrialHistory > 0 ? Math.round((trialConvertedCount / totalTrialHistory) * 1000) / 10 : 0;

  // Actual cash collected from SaaS billing records
  const paidBillingRecords = billingRecords.filter((b) => b.status === "paid");
  const subscriptionRevenue = paidBillingRecords.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  return {
    mrr: Math.round(mrr * 100) / 100,
    arr,
    arpu,
    activeSubscriptionsCount: activeCount,
    trialingCount,
    pastDueCount,
    cancelledCount,
    churnRate, // %
    trialConversionRate, // %
    planDistribution,
    subscriptionRevenue: Math.round(subscriptionRevenue * 100) / 100,
    marketplaceCommissionRevenue: Math.round(marketplaceCommissionRevenue * 100) / 100,
    totalPlatformRevenue: Math.round((subscriptionRevenue + marketplaceCommissionRevenue) * 100) / 100,
    currency: "TRY",
  };
}
