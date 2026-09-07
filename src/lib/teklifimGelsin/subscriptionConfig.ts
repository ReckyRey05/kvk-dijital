import {
  TeklifimSubscriptionPlan,
  TeklifimSubscriptionTier,
  TeklifimPlanLimits,
  TeklifimPlanFeatures,
} from "@/types/teklifimGelsin";

/**
 * Global Subscription & SaaS Settings
 */
export const SUBSCRIPTION_SETTINGS = {
  defaultTrialDays: 14,
  trialDays: 14,
  defaultGracePeriodDays: 5,
  gracePeriodDays: 5,
  defaultVatRate: 0.20, // 20% KDV
  softLimitWarningRatio: 0.80, // 80% usage triggers warning
  hardLimitRatio: 1.00, // 100% usage blocks new mutations
  currency: "TRY",
};

/**
 * Standard Plan Limits by Tier
 */
export const PLAN_LIMITS_MAP: Record<TeklifimSubscriptionTier, TeklifimPlanLimits> = {
  free: {
    requestsPerMonth: 5,
    teamMembers: 1,
    savedProcurementLists: 2,
    activeProducts: 10,
    quotesPerMonth: 10,
    apiRateLimitPerMin: 10,
    customPriceLists: 1,
  },
  business: {
    requestsPerMonth: 50,
    teamMembers: 5,
    savedProcurementLists: 10,
    activeProducts: 25,
    quotesPerMonth: 25,
    apiRateLimitPerMin: 60,
    customPriceLists: 5,
  },
  pro_business: {
    requestsPerMonth: 250,
    teamMembers: 20,
    savedProcurementLists: 50,
    activeProducts: 50,
    quotesPerMonth: 50,
    apiRateLimitPerMin: 180,
    customPriceLists: 20,
  },
  supplier: {
    requestsPerMonth: 20,
    teamMembers: 3,
    savedProcurementLists: 5,
    activeProducts: 100,
    quotesPerMonth: 100,
    apiRateLimitPerMin: 60,
    customPriceLists: 10,
  },
  pro_supplier: {
    requestsPerMonth: 100,
    teamMembers: 15,
    savedProcurementLists: 20,
    activeProducts: 1000,
    quotesPerMonth: 1000,
    apiRateLimitPerMin: 240,
    customPriceLists: 50,
  },
};

/**
 * Standard Plan Feature Entitlements by Tier
 */
export const PLAN_FEATURES_MAP: Record<TeklifimSubscriptionTier, TeklifimPlanFeatures> = {
  free: {
    advancedReports: false,
    apiAccess: false,
    webhooks: false,
    bulkImport: false,
    procurementApproval: false,
    verifiedBadgePriority: false,
    dedicatedSupport: false,
    customBranding: false,
  },
  business: {
    advancedReports: true,
    apiAccess: false,
    webhooks: false,
    bulkImport: true,
    procurementApproval: false,
    verifiedBadgePriority: false,
    dedicatedSupport: false,
    customBranding: false,
  },
  pro_business: {
    advancedReports: true,
    apiAccess: true,
    webhooks: true,
    bulkImport: true,
    procurementApproval: true,
    verifiedBadgePriority: false,
    dedicatedSupport: true,
    customBranding: true,
  },
  supplier: {
    advancedReports: true,
    apiAccess: false,
    webhooks: false,
    bulkImport: true,
    procurementApproval: false,
    verifiedBadgePriority: true,
    dedicatedSupport: false,
    customBranding: false,
  },
  pro_supplier: {
    advancedReports: true,
    apiAccess: true,
    webhooks: true,
    bulkImport: true,
    procurementApproval: false,
    verifiedBadgePriority: true,
    dedicatedSupport: true,
    customBranding: true,
  },
};

/**
 * Default System Subscription Plans (v1)
 */
export const DEFAULT_PLANS: Record<TeklifimSubscriptionTier, TeklifimSubscriptionPlan> = {
  free: {
    id: "plan_free_v1",
    tier: "free",
    name: "Ücretsiz Başlangıç",
    description: "Platformu tanımak ve temel toptan alım/satım denemeleri yapmak için ideal paket.",
    targetRole: "all",
    version: 1,
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscountPercent: 0,
    limits: PLAN_LIMITS_MAP.free,
    features: PLAN_FEATURES_MAP.free,
    isActive: true,
    trialDays: 0,
    createdAt: 1773000000000,
    updatedAt: 1773000000000,
  },
  business: {
    id: "plan_business_v1",
    tier: "business",
    name: "İşletme (Business)",
    description: "Düzenli satın alma yapan kafe, restoran, otel ve perakende işletmeleri için.",
    targetRole: "business",
    version: 1,
    monthlyPrice: 499,
    yearlyPrice: 4990, // ~17% indirim
    yearlyDiscountPercent: 17,
    limits: PLAN_LIMITS_MAP.business,
    features: PLAN_FEATURES_MAP.business,
    isActive: true,
    trialDays: 14,
    createdAt: 1773000000000,
    updatedAt: 1773000000000,
  },
  pro_business: {
    id: "plan_pro_business_v1",
    tier: "pro_business",
    name: "Kurumsal İşletme (Pro Business)",
    description: "Yüksek hacimli alım, çoklu ekip üyesi ve onay mekanizmaları kullanan zincir işletmeler için.",
    targetRole: "business",
    version: 1,
    monthlyPrice: 1299,
    yearlyPrice: 12990, // ~17% indirim
    yearlyDiscountPercent: 17,
    limits: PLAN_LIMITS_MAP.pro_business,
    features: PLAN_FEATURES_MAP.pro_business,
    isActive: true,
    trialDays: 14,
    createdAt: 1773000000000,
    updatedAt: 1773000000000,
  },
  supplier: {
    id: "plan_supplier_v1",
    tier: "supplier",
    name: "Tedarikçi (Supplier)",
    description: "Kataloğunu genişletmek ve düzenli teklif vererek satışlarını büyütmek isteyen toptancılar için.",
    targetRole: "supplier",
    version: 1,
    monthlyPrice: 799,
    yearlyPrice: 7990, // ~17% indirim
    yearlyDiscountPercent: 17,
    limits: PLAN_LIMITS_MAP.supplier,
    features: PLAN_FEATURES_MAP.supplier,
    isActive: true,
    trialDays: 14,
    createdAt: 1773000000000,
    updatedAt: 1773000000000,
  },
  pro_supplier: {
    id: "plan_pro_supplier_v1",
    tier: "pro_supplier",
    name: "Lider Tedarikçi (Pro Supplier)",
    description: "Sınırsız teklif, ERP/API entegrasyonu ve öncelikli pazar yeri vitrini isteyen büyük distribütörler için.",
    targetRole: "supplier",
    version: 1,
    monthlyPrice: 1999,
    yearlyPrice: 19990, // ~17% indirim
    yearlyDiscountPercent: 17,
    limits: PLAN_LIMITS_MAP.pro_supplier,
    features: PLAN_FEATURES_MAP.pro_supplier,
    isActive: true,
    trialDays: 14,
    createdAt: 1773000000000,
    updatedAt: 1773000000000,
  },
};

export const DEFAULT_PLANS_LIST = Object.values(DEFAULT_PLANS);
