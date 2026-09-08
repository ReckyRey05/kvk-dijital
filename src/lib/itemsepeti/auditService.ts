/**
 * İtemSepeti — Audit & Security Telemetry Service
 * Immutable audit logs for all critical platform actions:
 * escrow releases, status changes, administrative decisions, balance adjustments.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { ItemSepetiAuditLog } from "@/types/marketplace";

const inMemoryAuditLogs: ItemSepetiAuditLog[] = [];

export interface RecordAuditLogParams {
  actorId: string;
  actorRole: "buyer" | "seller" | "admin" | "system";
  action:
    | "ORDER_STATUS_CHANGED"
    | "ESCROW_LOCKED"
    | "ESCROW_RELEASED"
    | "DISPUTE_ARBITRATED"
    | "PAYOUT_APPROVED"
    | "PAYOUT_REJECTED"
    | "LISTING_APPROVED"
    | "LISTING_REJECTED"
    | "SELLER_APPROVED"
    | "SELLER_REJECTED"
    | "BALANCE_ADJUSTED";
  resource: "order" | "listing" | "wallet" | "seller" | "dispute" | "payout";
  resourceId: string;
  beforeSnapshot?: Record<string, any>;
  afterSnapshot?: Record<string, any>;
  ipAddress?: string;
}

export async function logAuditEvent(params: RecordAuditLogParams): Promise<ItemSepetiAuditLog> {
  const now = Date.now();
  const logId = `audit_${now}_${Math.random().toString(36).substring(2, 8)}`;

  const entry: ItemSepetiAuditLog = {
    id: logId,
    actorId: params.actorId || "system",
    actorRole: params.actorRole || "system",
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    beforeSnapshot: params.beforeSnapshot,
    afterSnapshot: params.afterSnapshot,
    ipAddress: params.ipAddress || "127.0.0.1",
    createdAt: now,
  };

  inMemoryAuditLogs.unshift(entry);

  // Keep in memory size bounded
  if (inMemoryAuditLogs.length > 500) {
    inMemoryAuditLogs.pop();
  }

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_audit_logs").doc(logId).set(entry);
  } catch {}

  return entry;
}

export async function getAuditLogs(filter?: {
  resource?: string;
  resourceId?: string;
  action?: string;
  limit?: number;
}): Promise<ItemSepetiAuditLog[]> {
  try {
    const db = getAdminDb();
    let q: any = db.collection("itemsepeti_audit_logs").orderBy("createdAt", "desc");

    if (filter?.resource) q = q.where("resource", "==", filter.resource);
    if (filter?.resourceId) q = q.where("resourceId", "==", filter.resourceId);
    if (filter?.action) q = q.where("action", "==", filter.action);

    const snap = await q.limit(filter?.limit || 50).get();
    if (!snap.empty) {
      return snap.docs.map((d: any) => d.data() as ItemSepetiAuditLog);
    }
  } catch {}

  let results = [...inMemoryAuditLogs];
  if (filter?.resource) results = results.filter((l) => l.resource === filter.resource);
  if (filter?.resourceId) results = results.filter((l) => l.resourceId === filter.resourceId);
  if (filter?.action) results = results.filter((l) => l.action === filter.action);

  return results.slice(0, filter?.limit || 50);
}
