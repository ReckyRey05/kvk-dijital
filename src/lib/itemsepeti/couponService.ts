/**
 * İtemSepeti — Coupon & Promotional Discount Service
 * Server-authoritative coupon validation, percentage/fixed discounts,
 * minimum order limits, seller-funded vs platform-funded vouchers.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { logAuditEvent } from "./auditService";

export interface ItemSepetiCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number; // e.g. 10 (%) or 50 (TL)
  minOrderAmount: number; // e.g. 100 TL
  maxDiscountAmount?: number; // e.g. 150 TL
  fundedBy: "platform" | "seller";
  sellerId?: string; // If seller-funded
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  expiresAt: number;
}

const SEED_COUPONS: ItemSepetiCoupon[] = [
  {
    code: "HOSGELDIN50",
    discountType: "FIXED_AMOUNT",
    discountValue: 50,
    minOrderAmount: 200,
    fundedBy: "platform",
    usageLimit: 1000,
    usageCount: 42,
    isActive: true,
    expiresAt: Date.now() + 1000 * 86400 * 60, // 60 days
  },
  {
    code: "YANG10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 100,
    maxDiscountAmount: 100,
    fundedBy: "platform",
    usageLimit: 500,
    usageCount: 15,
    isActive: true,
    expiresAt: Date.now() + 1000 * 86400 * 30, // 30 days
  },
  {
    code: "GAMER20",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderAmount: 250,
    maxDiscountAmount: 200,
    fundedBy: "platform",
    usageLimit: 200,
    usageCount: 9,
    isActive: true,
    expiresAt: Date.now() + 1000 * 86400 * 15, // 15 days
  },
];

export async function validateAndApplyCoupon(params: {
  couponCode: string;
  orderTotal: number;
  buyerId: string;
}): Promise<{
  isValid: boolean;
  discountAmount: number;
  finalTotal: number;
  coupon?: ItemSepetiCoupon;
  error?: string;
}> {
  const cleanCode = (params.couponCode || "").trim().toUpperCase();
  if (!cleanCode) {
    return { isValid: false, discountAmount: 0, finalTotal: params.orderTotal, error: "Kupon kodu girilmedi." };
  }

  const coupon = SEED_COUPONS.find((c) => c.code === cleanCode);
  if (!coupon || !coupon.isActive) {
    return { isValid: false, discountAmount: 0, finalTotal: params.orderTotal, error: "Geçersiz veya süresi dolmuş kupon kodu." };
  }

  if (Date.now() > coupon.expiresAt) {
    return { isValid: false, discountAmount: 0, finalTotal: params.orderTotal, error: "Bu kuponun kullanım süresi dolmuştur." };
  }

  if (params.orderTotal < coupon.minOrderAmount) {
    return {
      isValid: false,
      discountAmount: 0,
      finalTotal: params.orderTotal,
      error: `Bu kupon minimum ${coupon.minOrderAmount} TL tutarındaki siparişlerde geçerlidir.`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "FIXED_AMOUNT") {
    discount = Math.min(coupon.discountValue, params.orderTotal);
  } else if (coupon.discountType === "PERCENTAGE") {
    discount = (params.orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  }

  discount = Number(discount.toFixed(2));
  const finalTotal = Number(Math.max(0, params.orderTotal - discount).toFixed(2));

  // Log coupon application telemetry
  await logAuditEvent({
    actorId: params.buyerId,
    actorRole: "buyer",
    action: "BALANCE_ADJUSTED",
    resource: "order",
    resourceId: `coupon_${cleanCode}`,
    beforeSnapshot: { originalTotal: params.orderTotal },
    afterSnapshot: { discountAmount: discount, finalTotal },
  });

  return {
    isValid: true,
    discountAmount: discount,
    finalTotal,
    coupon,
  };
}
