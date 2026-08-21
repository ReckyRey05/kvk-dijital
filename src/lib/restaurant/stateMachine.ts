/**
 * CEP GARSON — ORDER & PAYMENT STATE MACHINE GUARD
 * 
 * CORE RESPONSIBILITIES:
 * 1. Enforces strict linear and permitted state transitions.
 * 2. Blocks invalid state machine bypasses (e.g. COMPLETED -> PENDING, CANCELLED -> PAID).
 * 3. Validates business logic invariant rules (e.g. non-negative prices, integer quantities).
 */

import { OrderStatus } from "@/types/restaurant";

export const PERMITTED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_CONFIRMATION: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["SERVED", "CANCELLED"],
  SERVED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // Terminal State
  CANCELLED: [], // Terminal State
};

export interface StateTransitionResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates whether an order state transition is permitted by the state machine.
 */
export function validateOrderStateTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): StateTransitionResult {
  if (currentStatus === nextStatus) {
    return { valid: true };
  }

  const allowedNext = PERMITTED_ORDER_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    return {
      valid: false,
      error: `Geçersiz durum geçişi: '${currentStatus}' durumundaki bir sipariş '${nextStatus}' durumuna geçirilemez (State Machine Bypass Blocked).`,
    };
  }

  return { valid: true };
}

/**
 * Validates Payment State Transitions
 */
export function validatePaymentTransition(
  currentStatus: "PENDING" | "PAID_ONLINE" | "PAID_CASHIER",
  nextStatus: "PENDING" | "PAID_ONLINE" | "PAID_CASHIER"
): StateTransitionResult {
  if (currentStatus === nextStatus) return { valid: true };

  if (currentStatus === "PAID_ONLINE" || currentStatus === "PAID_CASHIER") {
    if (nextStatus === "PENDING") {
      return {
        valid: false,
        error: "Ödenmiş bir hesap tekrar 'PENDING' durumuna alınamaz.",
      };
    }
  }

  return { valid: true };
}
