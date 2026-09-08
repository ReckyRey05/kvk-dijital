/**
 * İtemSepeti — Dispute & Arbitration Service
 * Handles buyer dispute creation, seller response, admin arbitration, and escrow settlement.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { ItemSepetiDispute, ItemSepetiDisputeStatus } from "@/types/marketplace";
import { recordLedgerTransaction } from "./walletService";
import { sendNotification } from "./notificationService";

export interface CreateDisputeInput {
  orderId: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  reason: ItemSepetiDispute["reason"];
  description: string;
  buyerEvidenceUrls?: string[];
}

export interface ArbitrateDisputeInput {
  disputeId: string;
  decision: "REFUND_BUYER" | "RELEASE_TO_SELLER" | "SPLIT_ARBITRATION";
  adminId: string;
  adminNote: string;
  orderTotal: number;
  partialRefundAmount?: number;
}

const inMemoryDisputes = new Map<string, ItemSepetiDispute>([
  [
    "dsp_sample_1",
    {
      id: "dsp_sample_1",
      orderId: "ord_101",
      orderNumber: "SIP-2026-902144",
      buyerId: "usr_gamer_ali",
      sellerId: "DragonTrader",
      reason: "item_not_received",
      description: "Satıcı 45 dakikadır oyunda takas teklifini kabul etmedi ve mesaja yanıt vermiyor.",
      buyerEvidenceUrls: [],
      status: "OPEN",
      openedAt: Date.now() - 3600000,
    },
  ],
]);

export async function createDispute(input: CreateDisputeInput): Promise<{
  success: boolean;
  dispute?: ItemSepetiDispute;
  error?: string;
}> {
  if (!input.orderId || !input.description.trim()) {
    return { success: false, error: "İtiraz gerekçesi boş bırakılamaz." };
  }

  const disputeId = `dsp_${input.orderId}`;
  const dispute: ItemSepetiDispute = {
    id: disputeId,
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    buyerId: input.buyerId,
    sellerId: input.sellerId,
    reason: input.reason,
    description: input.description,
    buyerEvidenceUrls: input.buyerEvidenceUrls || [],
    status: "OPEN",
    openedAt: Date.now(),
  };

  inMemoryDisputes.set(disputeId, dispute);

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_disputes").doc(disputeId).set(dispute);
    await db.collection("itemsepeti_orders").doc(input.orderId).update({
      status: "DISPUTED",
      updatedAt: Date.now(),
    });
  } catch {}

  // Notify seller and admin
  await sendNotification({
    userId: input.sellerId,
    event: "DISPUTE_OPENED",
    title: "Siparişiniz İçin İtiraz Açıldı",
    message: `${input.orderNumber} numaralı siparişe alıcı tarafından itiraz iletildi.`,
    linkUrl: `/siparis/${input.orderId}`,
  });

  return { success: true, dispute };
}

export async function arbitrateDispute(input: ArbitrateDisputeInput): Promise<{
  success: boolean;
  dispute?: ItemSepetiDispute;
  error?: string;
}> {
  const dispute = inMemoryDisputes.get(input.disputeId);
  if (!dispute) {
    return { success: false, error: "Dispute kaydı bulunamadı." };
  }

  const now = Date.now();
  let resolvedStatus: ItemSepetiDisputeStatus = "CLOSED";
  let refundDecided = 0;

  if (input.decision === "REFUND_BUYER") {
    resolvedStatus = "RESOLVED_BUYER";
    refundDecided = input.orderTotal;

    // Release escrow back to buyer as REFUND
    await recordLedgerTransaction({
      userId: dispute.buyerId,
      type: "REFUND",
      amount: input.orderTotal,
      referenceId: dispute.id,
      orderId: dispute.orderId,
      description: `Hakem Heyeti Kararı: Sipariş bedeli iade edildi (${input.adminNote})`,
    });
  } else if (input.decision === "RELEASE_TO_SELLER") {
    resolvedStatus = "RESOLVED_SELLER";
    refundDecided = 0;

    // Release escrow to seller
    await recordLedgerTransaction({
      userId: dispute.sellerId,
      type: "ESCROW_RELEASE",
      amount: input.orderTotal * 0.95, // deduct 5% commission
      referenceId: dispute.id,
      orderId: dispute.orderId,
      description: `Hakem Heyeti Kararı: Satıcı lehine sonuçlandı. Kazanç aktarıldı.`,
    });
  } else if (input.decision === "SPLIT_ARBITRATION") {
    resolvedStatus = "PARTIAL_REFUND";
    refundDecided = input.partialRefundAmount || input.orderTotal / 2;
  }

  dispute.status = resolvedStatus;
  dispute.arbitratedByAdminId = input.adminId;
  dispute.arbitrationNote = input.adminNote;
  dispute.refundAmountDecided = refundDecided;
  dispute.resolvedAt = now;

  inMemoryDisputes.set(input.disputeId, dispute);

  return { success: true, dispute };
}

export function getDisputeById(disputeId: string): ItemSepetiDispute | null {
  return inMemoryDisputes.get(disputeId) || null;
}

export function getAllDisputes(): ItemSepetiDispute[] {
  return Array.from(inMemoryDisputes.values());
}
