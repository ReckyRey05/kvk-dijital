import { getAdminDb } from "@/lib/firebase/admin";
import crypto from "crypto";
import {
  TeklifimSubscription,
  TeklifimSubscriptionPlan,
  TeklifimSubscriptionTier,
  TeklifimBillingInterval,
  TeklifimSubscriptionStatus,
  TeklifimUsage,
  TeklifimUsageMetrics,
  TeklifimCoupon,
  TeklifimBillingRecord,
  TeklifimSubscriptionEvent,
  TeklifimPlanFeatures,
  TeklifimPlanLimits,
} from "@/types/teklifimGelsin";
import { TeklifimAuthUser } from "./teklifimAuth";
import {
  DEFAULT_PLANS,
  SUBSCRIPTION_SETTINGS,
} from "./subscriptionConfig";
import {
  isValidSubscriptionTransition,
  formatSubscriptionInvoiceNumber,
  validateCoupon,
  calculateSubscriptionPrices,
  checkUsageLimit,
  calculateSubscriptionKpis,
} from "./subscriptionUtils";
import { MockMarketplacePaymentProvider } from "../payments/providers/mockProvider";
import { SubscriptionPaymentProvider, WebhookPayload } from "../payments/types";

function getDb() {
  return getAdminDb();
}

/**
 * Returns active subscription payment provider
 */
export function getSubscriptionProvider(): SubscriptionPaymentProvider {
  return new MockMarketplacePaymentProvider();
}

/**
 * Helper to get current month period string e.g. "2026-09"
 */
export function getCurrentPeriodKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${month}`;
}

// ---------------------------------------------------------------------------
// 1. PLANS MANAGEMENT
// ---------------------------------------------------------------------------

export async function getPlansList(includeInactive: boolean = false): Promise<TeklifimSubscriptionPlan[]> {
  const db = getDb();
  const snap = await db.collection("teklifim_subscription_plans").get();

  if (snap.empty) {
    // Seed default plans if not yet written
    const list = Object.values(DEFAULT_PLANS);
    for (const p of list) {
      await db.collection("teklifim_subscription_plans").doc(p.id).set(p);
    }
    return list;
  }

  const plans = snap.docs.map((d) => d.data() as TeklifimSubscriptionPlan);
  if (!includeInactive) {
    return plans.filter((p) => p.isActive);
  }
  return plans;
}

export async function getPlanByIdOrTier(idOrTier: string): Promise<TeklifimSubscriptionPlan> {
  const db = getDb();
  const planDoc = await db.collection("teklifim_subscription_plans").doc(idOrTier).get();

  if (planDoc.exists) {
    return planDoc.data() as TeklifimSubscriptionPlan;
  }

  // Look up by tier
  const snap = await db
    .collection("teklifim_subscription_plans")
    .where("tier", "==", idOrTier)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (!snap.empty) {
    return snap.docs[0].data() as TeklifimSubscriptionPlan;
  }

  // Fallback to default in-memory plan
  const fallback = (DEFAULT_PLANS as any)[idOrTier] || DEFAULT_PLANS.free;
  return fallback;
}

// ---------------------------------------------------------------------------
// 2. USER SUBSCRIPTION & STATE LIFECYCLE
// ---------------------------------------------------------------------------

export async function getUserSubscription(userId: string): Promise<TeklifimSubscription> {
  const db = getDb();
  const docRef = db.collection("teklifim_subscriptions").doc(userId);
  const doc = await docRef.get();

  const now = Date.now();

  if (!doc.exists) {
    // Initialize default FREE plan subscription
    const freePlan = DEFAULT_PLANS.free;
    const initialSub: TeklifimSubscription = {
      id: `sub_${now}_${crypto.randomBytes(3).toString("hex")}`,
      userId,
      userEmail: "",
      userRole: "business",
      planId: freePlan.id,
      planTier: "free",
      planVersion: 1,
      status: "active",
      interval: "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: now + 30 * 86400000,
      cancelAtPeriodEnd: false,
      hasUsedTrial: false,
      createdAt: now,
      updatedAt: now,
    };

    // Try reading profile role if exists
    try {
      const profDoc = await db.collection("teklifim_profiles").doc(userId).get();
      if (profDoc.exists) {
        const p = profDoc.data() as any;
        initialSub.userEmail = p.email || "";
        initialSub.userRole = p.role === "supplier" ? "supplier" : "business";
      }
    } catch (e) {}

    await docRef.set(initialSub);
    return initialSub;
  }

  let sub = doc.data() as TeklifimSubscription;

  // Check Expiration & Grace Period Transitions
  if ((sub.status === "active" || sub.status === "trialing") && sub.currentPeriodEnd < now) {
    const graceEnd = sub.gracePeriodEnd || (sub.currentPeriodEnd + SUBSCRIPTION_SETTINGS.defaultGracePeriodDays * 86400000);

    if (now < graceEnd) {
      // Within Grace Period -> past_due
      if (isValidSubscriptionTransition(sub.status, "past_due")) {
        sub.status = "past_due";
        sub.gracePeriodEnd = graceEnd;
        sub.updatedAt = now;
        await docRef.update({
          status: "past_due",
          gracePeriodEnd: graceEnd,
          updatedAt: now,
        });
      }
    } else {
      // Grace period exceeded -> FREE DOWNGRADE (Zero data loss)
      const freePlan = DEFAULT_PLANS.free;
      sub.status = "expired";
      sub.planId = freePlan.id;
      sub.planTier = "free";
      sub.planVersion = 1;
      sub.updatedAt = now;
      await docRef.update({
        status: "expired",
        planId: freePlan.id,
        planTier: "free",
        planVersion: 1,
        updatedAt: now,
      });
    }
  }

  // Check pending downgrade at period end
  if (sub.pendingDowngradePlanId && sub.pendingDowngradeEffectiveAt && now >= sub.pendingDowngradeEffectiveAt) {
    const newPlan = await getPlanByIdOrTier(sub.pendingDowngradePlanId);
    sub.planId = newPlan.id;
    sub.planTier = newPlan.tier;
    sub.planVersion = newPlan.version;
    sub.pendingDowngradePlanId = undefined;
    sub.pendingDowngradeEffectiveAt = undefined;
    sub.updatedAt = now;
    await docRef.update({
      planId: newPlan.id,
      planTier: newPlan.tier,
      planVersion: newPlan.version,
      pendingDowngradePlanId: null,
      pendingDowngradeEffectiveAt: null,
      updatedAt: now,
    });
  }

  return sub;
}

// ---------------------------------------------------------------------------
// 3. TRIAL SUBSCRIPTION
// ---------------------------------------------------------------------------

export async function startTrial(
  user: TeklifimAuthUser,
  planTier: TeklifimSubscriptionTier
): Promise<TeklifimSubscription> {
  if (planTier === "free") {
    throw new Error("Free plan icin deneme suresi baslatilamaz.");
  }

  const db = getDb();
  const sub = await getUserSubscription(user.uid);

  // Anti-abuse: check duplicate trial
  if (sub.hasUsedTrial) {
    throw new Error("Hesabiniz daha once ucretsiz deneme suresinden yararlanmistir.");
  }

  const targetPlan = await getPlanByIdOrTier(planTier);
  const trialDays = targetPlan.trialDays || SUBSCRIPTION_SETTINGS.defaultTrialDays;
  const now = Date.now();
  const trialEnd = now + trialDays * 86400000;

  const updatedSub: TeklifimSubscription = {
    ...sub,
    userEmail: user.email,
    planId: targetPlan.id,
    planTier: targetPlan.tier,
    planVersion: targetPlan.version,
    status: "trialing",
    interval: "monthly",
    currentPeriodStart: now,
    currentPeriodEnd: trialEnd,
    trialStart: now,
    trialEnd,
    hasUsedTrial: true,
    cancelAtPeriodEnd: false,
    updatedAt: now,
  };

  await db.collection("teklifim_subscriptions").doc(user.uid).set(updatedSub);

  // Log trial event
  await logSubscriptionEvent(updatedSub.id, user.uid, "subscription.trial_started", {
    planTier,
    trialDays,
    trialEnd,
  });

  return updatedSub;
}

// ---------------------------------------------------------------------------
// 4. CHECKOUT & SUBSCRIPTION UPGRADES
// ---------------------------------------------------------------------------

export async function createSubscriptionCheckout(
  user: TeklifimAuthUser,
  planId: string,
  interval: TeklifimBillingInterval,
  couponCode?: string,
  idempotencyKey?: string
): Promise<{
  checkoutUrl: string;
  providerSubscriptionId: string;
  pricing: any;
}> {
  const plan = await getPlanByIdOrTier(planId);
  if (plan.tier === "free") {
    throw new Error("Ucretsiz plan icin odeme oturumu acilamaz.");
  }

  const db = getDb();
  let coupon: TeklifimCoupon | undefined = undefined;

  if (couponCode) {
    const couponDoc = await db.collection("teklifim_coupons").doc(couponCode.toUpperCase().trim()).get();
    if (couponDoc.exists) {
      coupon = couponDoc.data() as TeklifimCoupon;
    }
  }

  const pricing = calculateSubscriptionPrices(plan, interval, coupon, user.uid);
  const currentSub = await getUserSubscription(user.uid);
  const provider = getSubscriptionProvider();

  const key = idempotencyKey || `idem_${user.uid}_${plan.id}_${interval}_${Date.now()}`;

  const session = await provider.createSubscriptionSession({
    subscriptionId: currentSub.id,
    userId: user.uid,
    userEmail: user.email,
    planId: plan.id,
    planName: plan.name,
    amount: pricing.totalAmount,
    currency: SUBSCRIPTION_SETTINGS.currency,
    interval,
    callbackUrl: `/teklifim-gelsin/billing?success=1`,
    idempotencyKey: key,
  });

  return {
    checkoutUrl: session.checkoutPageUrl,
    providerSubscriptionId: session.providerSubscriptionId,
    pricing,
  };
}

// ---------------------------------------------------------------------------
// 5. WEBHOOK HANDLER (IDEMPOTENT & RECURRING)
// ---------------------------------------------------------------------------

export async function processSubscriptionWebhook(
  payload: WebhookPayload,
  secretKey: string
): Promise<{ success: boolean; eventType: string; eventId: string; message: string }> {
  const provider = getSubscriptionProvider();
  const verification = await provider.verifySubscriptionWebhook(payload, secretKey);

  if (!verification.isValid) {
    throw new Error(verification.errorMessage || "Gecersiz webhook imzasi.");
  }

  const db = getDb();
  const eventId = verification.eventId;

  // Idempotency: Check if this webhook event was already processed
  const existingEvent = await db
    .collection("teklifim_subscription_events")
    .where("providerEventId", "==", eventId)
    .limit(1)
    .get();

  if (!existingEvent.empty) {
    return {
      success: true,
      eventType: verification.eventType,
      eventId,
      message: "Event daha once islendi (idempotent skip).",
    };
  }

  const parsed = payload.parsedBody || {};
  const userId = parsed.userId;
  const planTier: TeklifimSubscriptionTier = parsed.planTier || "business";
  const interval: TeklifimBillingInterval = parsed.interval || "monthly";
  const amount = Number(verification.amount || parsed.amount || 0);

  if (!userId) {
    throw new Error("Webhook payload icerisinde userId bulunamadi.");
  }

  const subRef = db.collection("teklifim_subscriptions").doc(userId);
  const subDoc = await subRef.get();
  if (!subDoc.exists) {
    throw new Error("Abonelik kaydi bulunamadi.");
  }

  const sub = subDoc.data() as TeklifimSubscription;
  const now = Date.now();
  const plan = await getPlanByIdOrTier(parsed.planId || planTier);

  // Handle Event Types
  if (verification.eventType === "subscription.created" || verification.eventType === "subscription.renewed") {
    const periodDuration = interval === "yearly" ? 365 * 86400000 : 30 * 86400000;
    const periodStart = now;
    const periodEnd = now + periodDuration;

    // Transition to active
    sub.status = "active";
    sub.planId = plan.id;
    sub.planTier = plan.tier;
    sub.planVersion = plan.version;
    sub.interval = interval;
    sub.currentPeriodStart = periodStart;
    sub.currentPeriodEnd = periodEnd;
    sub.cancelAtPeriodEnd = false;
    sub.providerSubscriptionId = verification.providerSubscriptionId || sub.providerSubscriptionId;
    sub.paymentMethod = {
      brand: parsed.cardBrand || "Mastercard",
      lastFour: parsed.cardLastFour || "4242",
      expMonth: parsed.expMonth || 12,
      expYear: parsed.expYear || 2028,
    };
    sub.updatedAt = now;

    await subRef.set(sub, { merge: true });

    // Generate SaaS Billing Record
    const countSnap = await db.collection("teklifim_billing_records").count().get();
    const invoiceNumber = formatSubscriptionInvoiceNumber(countSnap.data().count + 1);

    const billingRecord: TeklifimBillingRecord = {
      id: `bil_${now}_${crypto.randomBytes(3).toString("hex")}`,
      invoiceNumber,
      subscriptionId: sub.id,
      userId,
      userEmail: sub.userEmail,
      companyName: parsed.companyName || sub.userEmail.split("@")[0],
      planId: plan.id,
      planTier: plan.tier,
      interval,
      amount: Math.round((amount / (1 + SUBSCRIPTION_SETTINGS.defaultVatRate)) * 100) / 100,
      taxAmount: Math.round((amount - amount / (1 + SUBSCRIPTION_SETTINGS.defaultVatRate)) * 100) / 100,
      totalAmount: amount,
      currency: SUBSCRIPTION_SETTINGS.currency,
      couponCode: parsed.couponCode,
      status: "paid",
      providerPaymentId: parsed.providerPaymentId || `pay_${now}`,
      paymentMethodBrand: sub.paymentMethod?.brand,
      paymentMethodLastFour: sub.paymentMethod?.lastFour,
      paidAt: now,
      createdAt: now,
    };

    await db.collection("teklifim_billing_records").doc(billingRecord.id).set(billingRecord);
  } else if (verification.eventType === "subscription.payment_failed") {
    sub.status = "past_due";
    sub.gracePeriodEnd = now + SUBSCRIPTION_SETTINGS.defaultGracePeriodDays * 86400000;
    sub.updatedAt = now;
    await subRef.update({
      status: "past_due",
      gracePeriodEnd: sub.gracePeriodEnd,
      updatedAt: now,
    });
  } else if (verification.eventType === "subscription.cancelled") {
    sub.status = "cancelled";
    sub.cancelledAt = now;
    sub.cancelReason = parsed.reason || "Kullanici istegi";
    sub.updatedAt = now;
    await subRef.update({
      status: "cancelled",
      cancelledAt: now,
      cancelReason: sub.cancelReason,
      updatedAt: now,
    });
  }

  // Record immutable subscription event
  await logSubscriptionEvent(sub.id, userId, verification.eventType as any, parsed, eventId);

  return {
    success: true,
    eventType: verification.eventType,
    eventId,
    message: "Abonelik olayi basariyla islendi.",
  };
}

// ---------------------------------------------------------------------------
// 6. UPGRADE, DOWNGRADE & CANCELLATION
// ---------------------------------------------------------------------------

export async function upgradeSubscription(
  user: TeklifimAuthUser,
  newPlanId: string,
  interval?: TeklifimBillingInterval
): Promise<TeklifimSubscription> {
  const db = getDb();
  const sub = await getUserSubscription(user.uid);
  const newPlan = await getPlanByIdOrTier(newPlanId);

  const now = Date.now();
  const periodDuration = (interval || sub.interval) === "yearly" ? 365 * 86400000 : 30 * 86400000;

  const updatedSub: TeklifimSubscription = {
    ...sub,
    planId: newPlan.id,
    planTier: newPlan.tier,
    planVersion: newPlan.version,
    status: "active",
    interval: interval || sub.interval,
    currentPeriodStart: now,
    currentPeriodEnd: now + periodDuration,
    cancelAtPeriodEnd: false,
    pendingDowngradePlanId: undefined,
    pendingDowngradeEffectiveAt: undefined,
    updatedAt: now,
  };

  await db.collection("teklifim_subscriptions").doc(user.uid).set(updatedSub);

  await logSubscriptionEvent(sub.id, user.uid, "subscription.upgraded", {
    fromPlan: sub.planTier,
    toPlan: newPlan.tier,
  });

  return updatedSub;
}

export async function downgradeSubscription(
  user: TeklifimAuthUser,
  targetPlanId: string
): Promise<{ message: string; effectiveDate: number }> {
  const db = getDb();
  const sub = await getUserSubscription(user.uid);
  const targetPlan = await getPlanByIdOrTier(targetPlanId);

  const effectiveDate = sub.currentPeriodEnd;

  await db.collection("teklifim_subscriptions").doc(user.uid).update({
    pendingDowngradePlanId: targetPlan.id,
    pendingDowngradeEffectiveAt: effectiveDate,
    updatedAt: Date.now(),
  });

  await logSubscriptionEvent(sub.id, user.uid, "subscription.downgraded", {
    targetPlan: targetPlan.tier,
    effectiveDate,
  });

  return {
    message: `Yeni ${targetPlan.name} planiniz mevcut donem sonu olan ${new Date(
      effectiveDate
    ).toLocaleDateString("tr-TR")} tarihinde aktiflesecektir.`,
    effectiveDate,
  };
}

export async function cancelSubscription(
  user: TeklifimAuthUser,
  reason?: string,
  immediately: boolean = false
): Promise<{ message: string; status: TeklifimSubscriptionStatus }> {
  const db = getDb();
  const sub = await getUserSubscription(user.uid);
  const now = Date.now();

  if (immediately) {
    const freePlan = DEFAULT_PLANS.free;
    await db.collection("teklifim_subscriptions").doc(user.uid).update({
      status: "cancelled",
      planId: freePlan.id,
      planTier: "free",
      planVersion: 1,
      cancelledAt: now,
      cancelReason: reason || "Kullanici istegi",
      cancelAtPeriodEnd: false,
      updatedAt: now,
    });

    await logSubscriptionEvent(sub.id, user.uid, "subscription.cancelled", {
      immediately: true,
      reason,
    });

    return {
      message: "Aboneliginiz aninda iptal edildi ve Ucretsiz plana gecirildi.",
      status: "cancelled",
    };
  }

  // Cancel at period end
  await db.collection("teklifim_subscriptions").doc(user.uid).update({
    cancelAtPeriodEnd: true,
    cancelReason: reason || "Donem sonunda iptal",
    updatedAt: now,
  });

  await logSubscriptionEvent(sub.id, user.uid, "subscription.cancelled", {
    immediately: false,
    effectiveDate: sub.currentPeriodEnd,
    reason,
  });

  return {
    message: `Aboneliginiz donem sonu olan ${new Date(sub.currentPeriodEnd).toLocaleDateString(
      "tr-TR"
    )} tarihine kadar aktif kalacak ve bu tarihte yenilenmeyecektir.`,
    status: sub.status,
  };
}

// ---------------------------------------------------------------------------
// 7. USAGE TRACKING & ENTITLEMENTS ENGINE
// ---------------------------------------------------------------------------

export async function getUserUsage(userId: string): Promise<TeklifimUsage> {
  const db = getDb();
  const period = getCurrentPeriodKey();
  const usageId = `usage_${userId}_${period}`;
  const doc = await db.collection("teklifim_usages").doc(usageId).get();

  const now = Date.now();

  if (!doc.exists) {
    const initialUsage: TeklifimUsage = {
      id: usageId,
      userId,
      period,
      periodStart: now,
      periodEnd: now + 30 * 86400000,
      metrics: {
        requestsUsed: 0,
        quotesUsed: 0,
        productsActive: 0,
        teamMembersActive: 0,
        procurementListsUsed: 0,
        apiCallsUsed: 0,
      },
      updatedAt: now,
    };
    await db.collection("teklifim_usages").doc(usageId).set(initialUsage);
    return initialUsage;
  }

  return doc.data() as TeklifimUsage;
}

export async function recordUsage(
  userId: string,
  metric: keyof TeklifimUsageMetrics,
  delta: number = 1
): Promise<TeklifimUsage> {
  const db = getDb();
  const period = getCurrentPeriodKey();
  const usageId = `usage_${userId}_${period}`;
  const usageRef = db.collection("teklifim_usages").doc(usageId);
  const now = Date.now();

  const currentUsage = await getUserUsage(userId);
  const newCount = Math.max(0, (currentUsage.metrics[metric] || 0) + delta);

  const updatedMetrics = {
    ...currentUsage.metrics,
    [metric]: newCount,
  };

  await usageRef.update({
    [`metrics.${metric}`]: newCount,
    updatedAt: now,
  });

  return {
    ...currentUsage,
    metrics: updatedMetrics,
    updatedAt: now,
  };
}

export async function canUseMetric(
  userId: string,
  metric: keyof TeklifimUsageMetrics,
  delta: number = 1
): Promise<{
  allowed: boolean;
  softWarning: boolean;
  current: number;
  limit: number;
  remaining: number;
  error?: string;
}> {
  const sub = await getUserSubscription(userId);
  const plan = await getPlanByIdOrTier(sub.planId);
  const usage = await getUserUsage(userId);

  let limit = 0;
  if (metric === "requestsUsed") limit = plan.limits.requestsPerMonth;
  else if (metric === "quotesUsed") limit = plan.limits.quotesPerMonth;
  else if (metric === "productsActive") limit = plan.limits.activeProducts;
  else if (metric === "teamMembersActive") limit = plan.limits.teamMembers;
  else if (metric === "procurementListsUsed") limit = plan.limits.savedProcurementLists;
  else if (metric === "apiCallsUsed") limit = plan.limits.apiRateLimitPerMin * 60 * 24;

  const current = usage.metrics[metric] || 0;
  return checkUsageLimit(current, limit, delta);
}

export async function canAccessFeature(
  userId: string,
  feature: keyof TeklifimPlanFeatures
): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  const plan = await getPlanByIdOrTier(sub.planId);
  return !!plan.features[feature];
}

// ---------------------------------------------------------------------------
// 8. COUPON VALIDATION & USAGE
// ---------------------------------------------------------------------------

export async function applyCoupon(
  code: string,
  userId: string,
  planTier: TeklifimSubscriptionTier
): Promise<{ valid: boolean; discount: number; coupon?: TeklifimCoupon; error?: string }> {
  const db = getDb();
  const couponDoc = await db.collection("teklifim_coupons").doc(code.toUpperCase().trim()).get();

  if (!couponDoc.exists) {
    return { valid: false, discount: 0, error: "Gecersiz kupon kodu." };
  }

  const coupon = couponDoc.data() as TeklifimCoupon;
  const plan = await getPlanByIdOrTier(planTier);
  return validateCoupon(coupon, userId, planTier, plan.monthlyPrice);
}

// ---------------------------------------------------------------------------
// 9. BILLING RECORDS & INVOICES
// ---------------------------------------------------------------------------

export async function listUserBillingRecords(userId: string): Promise<TeklifimBillingRecord[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_billing_records")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snap.docs.map((d) => d.data() as TeklifimBillingRecord);
}

// ---------------------------------------------------------------------------
// 10. ADMIN BILLING CENTER & REVENUE METRICS
// ---------------------------------------------------------------------------

export async function getAdminSubscriptionAnalytics() {
  const db = getDb();

  const [subsSnap, billsSnap, plansList, paymentsSnap] = await Promise.all([
    db.collection("teklifim_subscriptions").get(),
    db.collection("teklifim_billing_records").get(),
    getPlansList(true),
    db.collection("teklifim_payments").where("status", "==", "paid").get(),
  ]);

  const subscriptions = subsSnap.docs.map((d) => d.data() as TeklifimSubscription);
  const billingRecords = billsSnap.docs.map((d) => d.data() as TeklifimBillingRecord);

  const plansMap: Record<string, TeklifimSubscriptionPlan> = {};
  plansList.forEach((p) => {
    plansMap[p.id] = p;
    plansMap[`plan_${p.tier}_v1`] = p;
  });

  // Calculate marketplace commission revenue from completed payments
  const marketplaceCommissionRevenue = paymentsSnap.docs.reduce((sum, d) => {
    const data = d.data();
    return sum + (Number(data.platformFee) || 0);
  }, 0);

  const kpis = calculateSubscriptionKpis(
    subscriptions,
    billingRecords,
    plansMap,
    marketplaceCommissionRevenue
  );

  return {
    kpis,
    recentSubscriptions: subscriptions.slice(0, 20),
    recentBillingRecords: billingRecords.slice(0, 20),
    plans: plansList,
  };
}

// ---------------------------------------------------------------------------
// 11. AUDIT LOGGING HELPER
// ---------------------------------------------------------------------------

async function logSubscriptionEvent(
  subscriptionId: string,
  userId: string,
  eventType: TeklifimSubscriptionEvent["eventType"],
  payload: any,
  providerEventId?: string
) {
  const db = getDb();
  const id = `subevt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const evt: TeklifimSubscriptionEvent = {
    id,
    subscriptionId,
    userId,
    eventType,
    providerEventId,
    payload,
    createdAt: Date.now(),
  };

  try {
    await db.collection("teklifim_subscription_events").doc(id).set(evt);
  } catch (err) {
    console.error("Subscription audit log error:", err);
  }
}
