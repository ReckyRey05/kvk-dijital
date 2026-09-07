import {
  TeklifimPayment,
  TeklifimPaymentStatus,
  TeklifimOrder,
  TeklifimRefundItem,
} from "@/types/teklifimGelsin";

export interface PaymentProviderConfig {
  apiKey?: string;
  secretKey?: string;
  baseUrl?: string;
  subMerchantKey?: string;
  isSandbox?: boolean;
}

export interface CreatePaymentSessionParams {
  order: TeklifimOrder;
  paymentNumber: string;
  amount: number; // TL
  currency: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  supplier: {
    id: string;
    name: string;
    subMerchantKey?: string;
  };
  platformFee: number;
  supplierAmount: number;
  callbackUrl: string;
  idempotencyKey: string;
}

export interface PaymentSessionResult {
  provider: string;
  providerPaymentId: string;
  providerPaymentToken?: string;
  paymentPageUrl?: string;
  htmlContent?: string;
  status: "pending" | "processing" | "success" | "failed";
  expiresAt: number;
}

export interface VerifyPaymentParams {
  providerPaymentId: string;
  providerToken?: string;
  rawPayload?: any;
}

export interface PaymentVerificationResult {
  success: boolean;
  providerPaymentId: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  cardLastFour?: string;
  cardBrand?: string;
  paidAt?: number;
  errorMessage?: string;
}

export interface ProcessRefundParams {
  payment: TeklifimPayment;
  amount: number;
  reason: string;
  requestedBy: string;
}

export interface RefundResult {
  success: boolean;
  providerRefundId?: string;
  refundedAmount: number;
  status: "success" | "pending" | "failed";
  errorMessage?: string;
}

export interface ProcessPayoutParams {
  supplierId: string;
  orderId: string;
  amount: number;
  subMerchantKey?: string;
  bankIban?: string;
}

export interface PayoutResult {
  success: boolean;
  providerPayoutId?: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  errorMessage?: string;
}

export interface WebhookPayload {
  headers: Record<string, string | undefined>;
  rawBody: string;
  parsedBody: any;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventType: "payment.succeeded" | "payment.failed" | "refund.succeeded" | "dispute.opened" | "unknown";
  eventId: string;
  providerPaymentId: string;
  amount?: number;
  errorMessage?: string;
}

/**
 * Payment Provider Abstraction Layer
 */
export interface PaymentProvider {
  name: string;
  createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult>;
  verifyWebhook(payload: WebhookPayload, secretKey: string): Promise<WebhookVerificationResult>;
}

export interface MarketplacePaymentProvider extends PaymentProvider {
  registerSubMerchant?(supplierProfile: any): Promise<{ subMerchantKey: string }>;
  calculateSplit(totalAmount: number, platformFeeRate: number): { platformFee: number; supplierAmount: number };
}

export interface RefundProvider {
  processRefund(params: ProcessRefundParams): Promise<RefundResult>;
}

export interface PayoutProvider {
  processPayout(params: ProcessPayoutParams): Promise<PayoutResult>;
}

// ==========================================
// FAZ 13: SUBSCRIPTION PAYMENT PROVIDER
// ==========================================

export interface CreateSubscriptionSessionParams {
  subscriptionId: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly";
  callbackUrl: string;
  idempotencyKey: string;
}

export interface SubscriptionSessionResult {
  provider: string;
  providerSubscriptionId: string;
  checkoutPageUrl: string;
  status: "pending" | "active";
}

export interface SubscriptionWebhookVerificationResult {
  isValid: boolean;
  eventType:
    | "subscription.created"
    | "subscription.renewed"
    | "subscription.payment_failed"
    | "subscription.cancelled"
    | "unknown";
  eventId: string;
  providerSubscriptionId: string;
  amount?: number;
  currency?: string;
  errorMessage?: string;
}

export interface SubscriptionPaymentProvider {
  name: string;
  createSubscriptionSession(params: CreateSubscriptionSessionParams): Promise<SubscriptionSessionResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<{ success: boolean; cancelledAt: number }>;
  verifySubscriptionWebhook(payload: WebhookPayload, secretKey: string): Promise<SubscriptionWebhookVerificationResult>;
}

