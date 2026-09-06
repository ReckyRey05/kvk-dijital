import crypto from "crypto";
import {
  MarketplacePaymentProvider,
  RefundProvider,
  PayoutProvider,
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
  PaymentProviderConfig,
} from "../types";

export class IyzicoMarketplaceProvider
  implements MarketplacePaymentProvider, RefundProvider, PayoutProvider
{
  public name = "iyzico_marketplace";
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(config?: PaymentProviderConfig) {
    this.apiKey = config?.apiKey || process.env.IYZICO_API_KEY || "sandbox-api-key";
    this.secretKey = config?.secretKey || process.env.IYZICO_SECRET_KEY || "sandbox-secret-key";
    this.baseUrl =
      config?.baseUrl ||
      (config?.isSandbox !== false
        ? "https://sandbox-api.iyzipay.com"
        : "https://api.iyzipay.com");
  }

  async createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    const providerPaymentId = `iyz_${params.paymentNumber}_${Date.now()}`;
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

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
    if (params.rawPayload?.status === "failure") {
      return {
        success: false,
        providerPaymentId: params.providerPaymentId,
        amount: 0,
        currency: "TRY",
        errorMessage: params.rawPayload?.errorMessage || "Odeme basarisiz oldu.",
      };
    }

    return {
      success: true,
      providerPaymentId: params.providerPaymentId,
      amount: params.rawPayload?.amount || 0,
      currency: "TRY",
      paymentMethod: "credit_card",
      cardLastFour: params.rawPayload?.cardLastFour || "5528",
      cardBrand: params.rawPayload?.cardFamily || "Bonus",
      paidAt: Date.now(),
    };
  }

  async verifyWebhook(payload: WebhookPayload, secretKey: string): Promise<WebhookVerificationResult> {
    const receivedSignature =
      payload.headers["x-iyzico-signature"] ||
      payload.headers["x-signature"] ||
      payload.headers["authorization"];

    if (!receivedSignature) {
      return {
        isValid: false,
        eventType: "unknown",
        eventId: "",
        providerPaymentId: "",
        errorMessage: "Iyzico imza basligi bulunamadi.",
      };
    }

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(payload.rawBody)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature.replace(/^sha256=/, "")),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return {
        isValid: false,
        eventType: "unknown",
        eventId: payload.parsedBody?.eventId || "",
        providerPaymentId: payload.parsedBody?.paymentId || "",
        errorMessage: "Gecersiz Iyzico webhook imzasi.",
      };
    }

    return {
      isValid: true,
      eventType: payload.parsedBody?.eventType || "payment.succeeded",
      eventId: payload.parsedBody?.eventId || `iyz_evt_${Date.now()}`,
      providerPaymentId: payload.parsedBody?.paymentId || "",
      amount: payload.parsedBody?.price,
    };
  }

  calculateSplit(totalAmount: number, platformFeeRate: number): { platformFee: number; supplierAmount: number } {
    const fee = Math.round(totalAmount * platformFeeRate * 100) / 100;
    const supplier = Math.max(0, Math.round((totalAmount - fee) * 100) / 100);
    return { platformFee: fee, supplierAmount: supplier };
  }

  async processRefund(params: ProcessRefundParams): Promise<RefundResult> {
    const providerRefundId = `iyz_ref_${Date.now()}`;
    return {
      success: true,
      providerRefundId,
      refundedAmount: params.amount,
      status: "success",
    };
  }

  async processPayout(params: ProcessPayoutParams): Promise<PayoutResult> {
    const providerPayoutId = `iyz_payout_${Date.now()}`;
    return {
      success: true,
      providerPayoutId,
      amount: params.amount,
      status: "completed",
    };
  }
}
