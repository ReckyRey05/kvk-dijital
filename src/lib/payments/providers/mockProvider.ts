import crypto from "crypto";
import {
  MarketplacePaymentProvider,
  RefundProvider,
  PayoutProvider,
  SubscriptionPaymentProvider,
  CreatePaymentSessionParams,
  PaymentSessionResult,
  VerifyPaymentParams,
  PaymentVerificationResult,
  ProcessRefundParams,
  RefundResult,
  ProcessPayoutParams,
  PayoutResult,
  WebhookPayload,
  WebhookVerificationResult,
  CreateSubscriptionSessionParams,
  SubscriptionSessionResult,
  SubscriptionWebhookVerificationResult,
} from "../types";

export class MockMarketplacePaymentProvider
  implements MarketplacePaymentProvider, RefundProvider, PayoutProvider, SubscriptionPaymentProvider
{
  public name = "mock_provider";

  async createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    const providerPaymentId = `mock_pay_${params.paymentNumber}_${Date.now()}`;
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return {
      provider: this.name,
      providerPaymentId,
      providerPaymentToken: token,
      paymentPageUrl: `/teklifim-gelsin/checkout/${params.order.id}?session=${providerPaymentId}&token=${token}`,
      status: "pending",
      expiresAt,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    // In mock verification, if rawPayload indicates test failure, simulate failure
    if (params.rawPayload?.simulateFailure) {
      return {
        success: false,
        providerPaymentId: params.providerPaymentId,
        amount: 0,
        currency: "TRY",
        errorMessage: "Kart limiti yetersiz veya banka onayi alinamadi.",
      };
    }

    return {
      success: true,
      providerPaymentId: params.providerPaymentId,
      amount: params.rawPayload?.amount || 1000,
      currency: "TRY",
      paymentMethod: "credit_card",
      cardLastFour: params.rawPayload?.cardLastFour || "4242",
      cardBrand: "Mastercard Ticari",
      paidAt: Date.now(),
    };
  }

  async verifyWebhook(payload: WebhookPayload, secretKey: string): Promise<WebhookVerificationResult> {
    const receivedSignature =
      payload.headers["x-teklifim-signature"] ||
      payload.headers["x-signature"] ||
      payload.headers["authorization"];

    if (!receivedSignature) {
      return {
        isValid: false,
        eventType: "unknown",
        eventId: "",
        providerPaymentId: "",
        errorMessage: "Webhook imza basligi bulunamadi.",
      };
    }

    // Calculate expected HMAC SHA-256 signature
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(payload.rawBody)
      .digest("hex");

    const bufReceived = Buffer.from(receivedSignature.replace(/^sha256=/, ""));
    const bufExpected = Buffer.from(expectedSignature);

    const isValid =
      bufReceived.length === bufExpected.length &&
      crypto.timingSafeEqual(bufReceived, bufExpected);

    if (!isValid) {
      return {
        isValid: false,
        eventType: "unknown",
        eventId: payload.parsedBody?.eventId || "",
        providerPaymentId: payload.parsedBody?.providerPaymentId || "",
        errorMessage: "Gecersiz webhook imzasi.",
      };
    }

    return {
      isValid: true,
      eventType: payload.parsedBody?.eventType || "payment.succeeded",
      eventId: payload.parsedBody?.eventId || `evt_${Date.now()}`,
      providerPaymentId: payload.parsedBody?.providerPaymentId || "",
      amount: payload.parsedBody?.amount,
    };
  }

  calculateSplit(totalAmount: number, platformFeeRate: number): { platformFee: number; supplierAmount: number } {
    const fee = Math.round(totalAmount * platformFeeRate * 100) / 100;
    const supplier = Math.max(0, Math.round((totalAmount - fee) * 100) / 100);
    return { platformFee: fee, supplierAmount: supplier };
  }

  async processRefund(params: ProcessRefundParams): Promise<RefundResult> {
    const providerRefundId = `mock_ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return {
      success: true,
      providerRefundId,
      refundedAmount: params.amount,
      status: "success",
    };
  }

  async processPayout(params: ProcessPayoutParams): Promise<PayoutResult> {
    const providerPayoutId = `mock_payout_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return {
      success: true,
      providerPayoutId,
      amount: params.amount,
      status: "completed",
    };
  }

  async createSubscriptionSession(params: CreateSubscriptionSessionParams): Promise<SubscriptionSessionResult> {
    const providerSubscriptionId = `mock_sub_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const checkoutPageUrl = `/teklifim-gelsin/billing/checkout/${params.planId}?session=${providerSubscriptionId}&idempotency=${params.idempotencyKey}`;

    return {
      provider: this.name,
      providerSubscriptionId,
      checkoutPageUrl,
      status: "pending",
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<{ success: boolean; cancelledAt: number }> {
    return {
      success: true,
      cancelledAt: Date.now(),
    };
  }

  async verifySubscriptionWebhook(
    payload: WebhookPayload,
    secretKey: string
  ): Promise<SubscriptionWebhookVerificationResult> {
    const signature =
      payload.headers["x-teklifim-signature"] ||
      payload.headers["x-provider-signature"] ||
      payload.headers["x-iyzico-signature"];

    if (signature) {
      const computed = MockMarketplacePaymentProvider.signPayload(payload.rawBody, secretKey);
      if (signature !== computed) {
        return {
          isValid: false,
          eventType: "unknown",
          eventId: "",
          providerSubscriptionId: "",
          errorMessage: "Gecersiz imza.",
        };
      }
    }

    return {
      isValid: true,
      eventType: payload.parsedBody?.eventType || "subscription.created",
      eventId: payload.parsedBody?.eventId || `evt_${Date.now()}`,
      providerSubscriptionId: payload.parsedBody?.providerSubscriptionId || "",
      amount: payload.parsedBody?.amount,
      currency: payload.parsedBody?.currency || "TRY",
    };
  }

  /**
   * Helper to sign a webhook payload for testing
   */
  static signPayload(rawBody: string, secretKey: string): string {
    return crypto.createHmac("sha256", secretKey).update(rawBody).digest("hex");
  }
}
